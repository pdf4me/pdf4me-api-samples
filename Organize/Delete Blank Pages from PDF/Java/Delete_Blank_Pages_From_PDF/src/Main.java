import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.Base64;

public class Main {
    private static final String API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        String pdfPath = "sample.pdf";
        System.out.println("=== Deleting Blank Pages from PDF Document ===");
        try {
            String result = deleteBlankPagesFromPdf(pdfPath);
            if (result != null && !result.isEmpty()) {
                System.out.println("PDF with blank pages removed saved to: " + result);
            } else {
                System.out.println("Blank page deletion failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static String deleteBlankPagesFromPdf(String inputPdfPath) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return null;
            }
            
            String outputFileName = Paths.get(inputPdfPath).getFileName().toString().replaceFirst("[.][^.]+$", "") + ".no_blank_pages.pdf";
            String outputPdfPath = Paths.get(System.getProperty("user.dir"), outputFileName).toString();
            
            // Read and encode the PDF file to base64
            System.out.println("Reading PDF file...");
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            
            System.out.println("PDF file read successfully: " + inputPdfPath + " (" + pdfBytes.length + " bytes)");
            
            // Prepare the API request payload
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64);                              // Base64 encoded PDF content
            payload.put("docName", "output.pdf");                              // Output PDF file name
            payload.put("deletePageOption", "NoTextNoImages");                 // Options: NoTextNoImages, NoText, NoImages
            payload.put("async", true);                                        // Enable asynchronous processing
            
            return executeBlankPageDeletion(payload, outputPdfPath);
        } catch (Exception ex) {
            System.err.println("Error in deleteBlankPagesFromPdf: " + ex.getMessage());
            return null;
        }
    }

    private static String executeBlankPageDeletion(Map<String, Object> payload, String outputPdfPath) {
        try {
            String jsonPayload = convertToJson(payload);
            
            // Set up headers for the API request
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/DeleteBlankPages"))
                .header("Content-Type", "application/json")                    // Specify that we're sending JSON data
                .header("Authorization", API_KEY)                             // Authentication using provided API key
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            
            System.out.println("Sending PDF blank page deletion request to PDF4me API...");
            
            // Make the API request
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            
            // Log detailed response information for debugging
            System.out.println("Response Status Code: " + response.statusCode());
            System.out.println("Response Headers:");
            response.headers().map().forEach((headerName, headerValues) -> {
                headerValues.forEach(headerValue -> System.out.println("  " + headerName + ": " + headerValue));
            });
            
            // Handle different response scenarios based on status code
            if (response.statusCode() == 200) {
                // 200 - Success: Blank page deletion completed immediately
                System.out.println("Success: Blank pages deleted successfully!");
                
                // Save the output PDF file
                Files.write(Paths.get(outputPdfPath), response.body());
                System.out.println("Output saved as: " + outputPdfPath);
                return outputPdfPath;
                
            } else if (response.statusCode() == 202) {
                // 202 - Accepted: API is processing the request asynchronously
                System.out.println("202 - Request accepted. Processing asynchronously...");
                
                String responseBody = new String(response.body(), StandardCharsets.UTF_8);
                System.out.println("Response body: " + responseBody);
                
                // Parse response to get job ID
                String jobId = extractJobId(responseBody);
                if (jobId != null) {
                    System.out.println("Job ID: " + jobId);
                    
                    // Retry logic for polling the result
                    int maxRetries = 30;  // Maximum number of status checks
                    int retryInterval = 2; // Seconds between status checks
                    
                    // Poll the API until processing is complete
                    for (int attempt = 0; attempt < maxRetries; attempt++) {
                        System.out.println("Checking status... (Attempt " + (attempt + 1) + "/" + maxRetries + ")");
                        
                        // Check job status
                        String statusUrl = BASE_URL + "api/v2/JobStatus/" + jobId;
                        HttpRequest statusRequest = HttpRequest.newBuilder()
                            .uri(URI.create(statusUrl))
                            .header("Authorization", API_KEY)
                            .GET()
                            .build();
                        
                        HttpResponse<byte[]> statusResponse = httpClient.send(statusRequest, HttpResponse.BodyHandlers.ofByteArray());
                        
                        if (statusResponse.statusCode() == 200) {
                            // Processing completed successfully
                            System.out.println("Processing completed!");
                            Files.write(Paths.get(outputPdfPath), statusResponse.body());
                            System.out.println("Output saved as: " + outputPdfPath);
                            return outputPdfPath;
                        } else if (statusResponse.statusCode() == 202) {
                            // Still processing, wait and try again
                            Thread.sleep(retryInterval * 1000);
                            continue;
                        } else {
                            // Error in status check
                            System.out.println("Status check error: " + statusResponse.statusCode());
                            System.out.println(new String(statusResponse.body(), StandardCharsets.UTF_8));
                            return null;
                        }
                    }
                    
                    // If we reach here, polling timed out
                    System.out.println("Processing timeout. Please check job status manually.");
                    System.out.println("Check your account or use job ID " + jobId + " to retrieve the file");
                    return null;
                } else {
                    System.out.println("No job ID received in response");
                    return null;
                }
                
            } else {
                // Other status codes - Error
                System.out.println("Error: " + response.statusCode());
                System.out.println("Response: " + new String(response.body(), StandardCharsets.UTF_8));
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeBlankPageDeletion: " + ex.getMessage());
            return null;
        }
    }
    
    private static String extractJobId(String responseBody) {
        try {
            // Simple JSON parsing to extract jobId
            // This is a basic implementation - in production, use a proper JSON library
            if (responseBody.contains("\"jobId\"")) {
                int startIndex = responseBody.indexOf("\"jobId\"") + 8;
                int endIndex = responseBody.indexOf("\"", startIndex);
                if (endIndex > startIndex) {
                    return responseBody.substring(startIndex, endIndex);
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting job ID: " + e.getMessage());
        }
        return null;
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