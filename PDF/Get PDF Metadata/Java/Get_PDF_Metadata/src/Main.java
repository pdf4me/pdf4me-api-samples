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
 * Main program class for PDF Metadata extraction functionality
 * This program demonstrates how to extract metadata from PDF documents using the PDF4Me API
 * 
 * TODO: Implement the following functionality:
 * - PDF metadata extraction
 * - API integration with PDF4Me
 * - Async processing support
 * - Error handling and logging
 * - Metadata parsing and formatting
 */
public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    
    /**
     * Main entry point of the application
     * @param args Command line arguments (not used in this example)
     */
    public static void main(String[] args) {
        String pdfPath = "sample.pdf";
        System.out.println("=== Extracting PDF Metadata ===");
        try {
            String result = extractPdfMetadata(pdfPath);
            if (result != null && !result.isEmpty()) {
                System.out.println("PDF metadata saved to: " + result);
            } else {
                System.out.println("Getting PDF metadata failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static String extractPdfMetadata(String inputPdfPath) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return null;
            }
            
            String outputJsonPath = inputPdfPath.replace(".pdf", ".metadata.json");
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64);
            payload.put("docName", "output.pdf");
            payload.put("async", true);
            
            return executeMetadataExtraction(payload, outputJsonPath);
        } catch (Exception ex) {
            System.err.println("Error in extractPdfMetadata: " + ex.getMessage());
            return null;
        }
    }

    private static String executeMetadataExtraction(Map<String, Object> payload, String outputJsonPath) {
        try {
            String jsonPayload = convertToJson(payload);
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/GetPdfMetadata"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Files.write(Paths.get(outputJsonPath), response.body().getBytes(StandardCharsets.UTF_8));
                return outputJsonPath;
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("No 'Location' header found in the response.");
                    return null;
                }
                
                int maxRetries = 10;
                int retryDelay = 10;
                
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    Thread.sleep(retryDelay * 1000);
                    
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();

                    HttpResponse<String> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofString());

                    if (pollResponse.statusCode() == 200) {
                        Files.write(Paths.get(outputJsonPath), pollResponse.body().getBytes(StandardCharsets.UTF_8));
                        return outputJsonPath;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(pollResponse.body());
                        return null;
                    }
                }
                
                System.out.println("Timeout: Getting PDF metadata did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(response.body());
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeMetadataExtraction: " + ex.getMessage());
            return null;
        }
    }
    
    private static String convertToJson(Map<String, Object> map) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) json.append(",");
            first = false;
            json.append("\"").append(entry.getKey()).append("\":");
            Object value = entry.getValue();
            if (value instanceof String) {
                json.append("\"").append(escapeJsonString((String) value)).append("\"");
            } else if (value instanceof Boolean) {
                json.append(value);
            } else {
                json.append("\"").append(value).append("\"");
            }
        }
        json.append("}");
        return json.toString();
    }
    
    private static String escapeJsonString(String str) {
        return str.replace("\\", "\\\\")
                 .replace("\"", "\\\"")
                 .replace("\b", "\\b")
                 .replace("\f", "\\f")
                 .replace("\n", "\\n")
                 .replace("\r", "\\r")
                 .replace("\t", "\\t");
    }
}
 