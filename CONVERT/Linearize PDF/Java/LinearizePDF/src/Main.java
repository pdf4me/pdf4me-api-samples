import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.Base64;

/**
 * Main program class for PDF Linearization functionality
 * This program demonstrates how to linearize PDF documents using the PDF4me API
 * 
 * Features:
 * - Linearize PDF documents for optimized web viewing
 * - Support for various optimization profiles
 * - Asynchronous processing for large files
 * - Robust error handling and logging
 * - Automatic polling for long-running operations
 */
public class Main {
    private static final String API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String API_URL = "https://api.pdf4me.com/api/v2/LinearizePdf";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Main entry point of the application
     * @param args Command line arguments (not used in this example)
     */
    public static void main(String[] args) {
        String inputPath = "sample.pdf";
        String outputPath = "Linearize_PDF_output.pdf";
        
        System.out.println("=== Linearizing PDF Document ===");
        try {
            System.out.println("Processing: " + inputPath);
            linearizePdf(inputPath, outputPath);
            System.out.println("Linearization completed successfully!");
            System.out.println("Output saved to: " + outputPath);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Linearizes a PDF document for optimized web viewing
     * @param inputPath Path to the input PDF file
     * @param outputPath Path where the linearized PDF will be saved
     * @throws Exception if the operation fails
     */
    public static void linearizePdf(String inputPath, String outputPath) throws Exception {
        // Check if input file exists
        if (!Files.exists(Paths.get(inputPath))) {
            throw new IOException("Input file not found: " + inputPath);
        }

        // Read and encode file
        byte[] fileBytes = Files.readAllBytes(Paths.get(inputPath));
        String fileBase64 = Base64.getEncoder().encodeToString(fileBytes);

        // Prepare API payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("docContent", fileBase64);
        payload.put("docName", Paths.get(inputPath).getFileName().toString());
        payload.put("optimizeProfile", "web");

        System.out.println("Sending request to PDF4me API...");
        ApiResponse resp = post(API_URL, API_KEY, payload);
        
        if (resp.status == 200) {
            System.out.println("Linearization completed immediately");
            saveLinearizedPdf(resp.bytes, outputPath);
        } else if (resp.status == 202) {
            System.out.println("Linearization started asynchronously, polling for completion...");
            pollForResult(resp.location, outputPath);
        } else {
            throw new IOException("API request failed with status " + resp.status + 
                (resp.bytes != null && resp.bytes.length > 0 ? ": " + new String(resp.bytes, StandardCharsets.UTF_8) : ""));
        }
    }

    /**
     * Saves the linearized PDF content to the specified output path
     * @param content The PDF content bytes
     * @param output The output file path
     * @throws IOException if saving fails
     */
    private static void saveLinearizedPdf(byte[] content, String output) throws IOException {
        if (isPdfContent(content)) {
            Files.write(Paths.get(output), content);
            System.out.println("Linearized PDF saved successfully to: " + output);
            System.out.println("File size: " + content.length + " bytes");
            System.out.println("PDF is now optimized for web viewing and faster loading");
        } else {
            String pdfBase64 = extractPdfFromJson(new String(content, StandardCharsets.UTF_8));
            if (pdfBase64 != null) {
                byte[] pdfBytes = Base64.getDecoder().decode(pdfBase64);
                Files.write(Paths.get(output), pdfBytes);
                System.out.println("Linearized PDF saved successfully to: " + output);
                System.out.println("File size: " + pdfBytes.length + " bytes");
                System.out.println("PDF is now optimized for web viewing and faster loading");
            } else {
                throw new IOException("No PDF data found in API response");
            }
        }
    }

    /**
     * Polls the API for completion of asynchronous operations
     * @param locationUrl The polling URL
     * @param output The output file path
     * @throws Exception if polling fails or times out
     */
    private static void pollForResult(String locationUrl, String output) throws Exception {
        if (locationUrl == null) {
            throw new IOException("No polling URL received from API");
        }
        
        // Ensure we have a complete URL
        if (!locationUrl.startsWith("http")) {
            locationUrl = URI.create(API_URL).resolve(locationUrl).toString();
        }
        
        System.out.println("Polling URL: " + locationUrl);
        
        for (int attempt = 1; attempt <= 10; attempt++) {
            System.out.println("Polling attempt " + attempt + "/10...");
            Thread.sleep(10000); // Wait 10 seconds between attempts
            
            ApiResponse pollResp = get(locationUrl, API_KEY);
            if (pollResp.status == 200) {
                System.out.println("Linearization completed successfully");
                saveLinearizedPdf(pollResp.bytes, output);
                return;
            } else if (pollResp.status == 202) {
                System.out.println("Still processing, continuing to poll...");
                continue;
            } else {
                throw new IOException("Polling failed with status " + pollResp.status + 
                    (pollResp.bytes != null && pollResp.bytes.length > 0 ? ": " + new String(pollResp.bytes, StandardCharsets.UTF_8) : ""));
            }
        }
        throw new IOException("Linearization timed out after 10 polling attempts (100 seconds)");
    }

    /**
     * Checks if the given byte array contains PDF content
     * @param content The byte array to check
     * @return true if the content appears to be a PDF
     */
    private static boolean isPdfContent(byte[] content) {
        // PDF files start with %PDF
        return content.length >= 4 && content[0] == '%' && content[1] == 'P' && 
               content[2] == 'D' && content[3] == 'F';
    }

    /**
     * Extracts PDF base64 data from JSON response
     * @param json The JSON response string
     * @return The base64 PDF data or null if not found
     */
    private static String extractPdfFromJson(String json) {
        String[] patterns = {"\"docData\":\"", "\"data\":\""};
        for (String pattern : patterns) {
            int start = json.indexOf(pattern);
            if (start > 0) {
                start += pattern.length();
                int end = json.indexOf('"', start);
                if (end > start) {
                    return json.substring(start, end);
                }
            }
        }
        return null;
    }

    /**
     * Sends a POST request to the API
     * @param url The API endpoint URL
     * @param key The API key
     * @param payload The request payload
     * @return The API response
     * @throws Exception if the request fails
     */
    private static ApiResponse post(String url, String key, Map<String, Object> payload) throws Exception {
        String json = buildJson(payload);
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .header("Authorization", "Basic " + key)
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        
        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        return new ApiResponse(response.statusCode(), response.body(),
                response.headers().firstValue("Location").orElse(null), null);
    }

    /**
     * Sends a GET request to the API
     * @param url The API endpoint URL
     * @param key The API key
     * @return The API response
     * @throws Exception if the request fails
     */
    private static ApiResponse get(String url, String key) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Basic " + key)
            .GET()
            .build();
        
        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        return new ApiResponse(response.statusCode(), response.body(), null, null);
    }

    /**
     * Builds a JSON string from a map of key-value pairs
     * @param payload The map containing the data
     * @return The JSON string
     */
    private static String buildJson(Map<String, Object> payload) {
        StringBuilder json = new StringBuilder("{");
        for (Map.Entry<String, Object> e : payload.entrySet()) {
            if (json.length() > 1) json.append(',');
            json.append('"').append(e.getKey()).append('"').append(':');
            Object v = e.getValue();
            if (v instanceof String) {
                json.append('"').append(v.toString().replace("\"", "\\\"")).append('"');
            } else {
                json.append(v);
            }
        }
        return json.append('}').toString();
    }

    /**
     * Internal class to hold API response data
     */
    private static class ApiResponse {
        int status;
        byte[] bytes;
        String location;
        String contentType;
        
        ApiResponse(int s, byte[] b, String l, String ct) {
            status = s;
            bytes = b;
            location = l;
            contentType = ct;
        }
    }
} 