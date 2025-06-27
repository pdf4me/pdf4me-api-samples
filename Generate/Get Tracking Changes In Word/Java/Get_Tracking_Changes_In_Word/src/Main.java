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
 * Main program class for getting tracking changes from Word documents functionality
 * This program demonstrates how to retrieve tracking changes from Word documents using the PDF4ME API
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
        String docxPath = "sample.docx";  // Update this path to your DOCX file location
        
        System.out.println("=== Getting Tracking Changes from Word Document ===");
        try {
            String result = getTrackingChangesInWord(docxPath);
            if (result != null && !result.isEmpty()) {
                System.out.println("Tracking changes result saved to: " + result);
            } else {
                System.out.println("Getting tracking changes failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Retrieves tracking changes from Word document using the PDF4ME API
     * @param inputDocxPath Path to the input Word document file
     * @return Path to the tracking changes JSON file, or null if retrieval failed
     */
    public static String getTrackingChangesInWord(String inputDocxPath) {
        try {
            if (!Files.exists(Paths.get(inputDocxPath))) {
                System.out.println("Word document file not found: " + inputDocxPath);
                return null;
            }

            byte[] docxBytes = Files.readAllBytes(Paths.get(inputDocxPath));
            String docxBase64 = Base64.getEncoder().encodeToString(docxBytes);
            
            String outputJsonPath = inputDocxPath.replace(".docx", ".tracking_changes.json");

            // Prepare the API request payload for retrieving tracking changes
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docName", "output.docx");      // Output document name
            payload.put("docContent", docxBase64);      // Base64 encoded Word document content
            payload.put("async", true);                 // For big files and too many calls async is recommended to reduce the server load

            return executeTrackingChangesRetrieval(payload, outputJsonPath);
        } catch (Exception ex) {
            System.err.println("Error in getTrackingChangesInWord: " + ex.getMessage());
            return null;
        }
    }

    /**
     * Executes the tracking changes retrieval operation
     * @param payload API request payload
     * @param outputJsonPath Path where the tracking changes JSON result will be saved
     * @return Path to the tracking changes JSON file, or null if retrieval failed
     */
    private static String executeTrackingChangesRetrieval(Map<String, Object> payload, String outputJsonPath) {
        try {
            String jsonPayload = convertToJson(payload);
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/GetTrackingChangesInWord"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            // Handle immediate success response (200 OK)
            if (response.statusCode() == 200) {
                // Read the tracking changes JSON content from the response
                String resultJson = response.body();
                
                // Save the tracking changes JSON to the output path
                Files.write(Paths.get(outputJsonPath), resultJson.getBytes(StandardCharsets.UTF_8));
                return outputJsonPath;
            }
            // Handle asynchronous processing response (202 Accepted)
            else if (response.statusCode() == 202) {
                // Extract the polling URL from response headers
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("No 'Location' header found in the response.");
                    return null;
                }

                // Poll for completion with retry logic
                int maxRetries = 10;
                int retryDelay = 10; // seconds

                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    // Wait before polling
                    Thread.sleep(retryDelay * 1000);
                    
                    // Create polling request
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();

                    HttpResponse<String> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofString());

                    // Handle successful completion
                    if (pollResponse.statusCode() == 200) {
                        String resultJson = pollResponse.body();
                        Files.write(Paths.get(outputJsonPath), resultJson.getBytes(StandardCharsets.UTF_8));
                        return outputJsonPath;
                    }
                    // Continue polling if still processing
                    else if (pollResponse.statusCode() == 202) {
                        continue;
                    }
                    // Handle polling errors
                    else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(pollResponse.body());
                        return null;
                    }
                }
                
                // Timeout if retrieval doesn't complete within retry limit
                System.out.println("Timeout: Getting tracking changes did not complete after multiple retries.");
                return null;
            }
            // Handle other error responses
            else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(response.body());
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeTrackingChangesRetrieval: " + ex.getMessage());
            return null;
        }
    }
    
    /**
     * Converts a Map to JSON string
     * @param map The map to convert
     * @return JSON string representation
     */
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
    
    /**
     * Escapes special characters in JSON strings
     * @param str The string to escape
     * @return Escaped string
     */
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