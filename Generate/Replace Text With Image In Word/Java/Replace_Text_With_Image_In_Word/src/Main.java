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
 * Main program class for replacing text with images in Word documents functionality
 * This program demonstrates how to replace text with images in Word documents using the PDF4ME API
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
        String imagePath = "sample.png";   // Update this path to your image file location
        
        System.out.println("=== Replacing Text with Image in Word Document ===");
        try {
            String result = replaceTextWithImageInWord(docxPath, imagePath);
            if (result != null && !result.isEmpty()) {
                System.out.println("Modified document saved to: " + result);
            } else {
                System.out.println("Text replacement failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Replaces text with image in Word document using the PDF4ME API
     * @param inputDocxPath Path to the input Word document file
     * @param inputImagePath Path to the input image file
     * @return Path to the modified Word document, or null if replacement failed
     */
    public static String replaceTextWithImageInWord(String inputDocxPath, String inputImagePath) {
        try {
            if (!Files.exists(Paths.get(inputDocxPath))) {
                System.out.println("Word document file not found: " + inputDocxPath);
                return null;
            }

            if (!Files.exists(Paths.get(inputImagePath))) {
                System.out.println("Image file not found: " + inputImagePath);
                return null;
            }

            byte[] docxBytes = Files.readAllBytes(Paths.get(inputDocxPath));
            String docxBase64 = Base64.getEncoder().encodeToString(docxBytes);

            byte[] imageBytes = Files.readAllBytes(Paths.get(inputImagePath));
            String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);
            
            String outputDocxPath = inputDocxPath.replace(".docx", ".modified.docx");

            // Prepare the API request payload for text replacement with image
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docName", "output.docx");           // Output document name
            payload.put("docContent", docxBase64);           // Base64 encoded Word document content
            payload.put("ImageFileName", "stamp.png");       // Image file name
            payload.put("ImageFileContent", imageBase64);    // Base64 encoded image content
            payload.put("IsFirstPageSkip", false);           // Whether to skip the first page
            payload.put("PageNumbers", "1");                 // Page numbers to process
            payload.put("SearchText", "PDF4me");           // Text to search and replace
            payload.put("async", true);                      // For big files and too many calls async is recommended to reduce the server load

            return executeTextReplacement(payload, outputDocxPath);
        } catch (Exception ex) {
            System.err.println("Error in replaceTextWithImageInWord: " + ex.getMessage());
            return null;
        }
    }

    /**
     * Executes the text replacement operation
     * @param payload API request payload
     * @param outputDocxPath Path where the modified Word document will be saved
     * @return Path to the modified Word document, or null if replacement failed
     */
    private static String executeTextReplacement(Map<String, Object> payload, String outputDocxPath) {
        try {
            String jsonPayload = convertToJson(payload);
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/ReplaceTextWithImageInWord"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());

            // Handle immediate success response (200 OK)
            if (response.statusCode() == 200) {
                // Read the modified Word document content from the response
                byte[] resultBytes = response.body();
                
                // Save the modified Word document to the output path
                Files.write(Paths.get(outputDocxPath), resultBytes);
                return outputDocxPath;
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

                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());

                    // Handle successful completion
                    if (pollResponse.statusCode() == 200) {
                        byte[] resultBytes = pollResponse.body();
                        Files.write(Paths.get(outputDocxPath), resultBytes);
                        return outputDocxPath;
                    }
                    // Continue polling if still processing
                    else if (pollResponse.statusCode() == 202) {
                        continue;
                    }
                    // Handle polling errors
                    else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return null;
                    }
                }
                
                // Timeout if replacement doesn't complete within retry limit
                System.out.println("Timeout: Text replacement did not complete after multiple retries.");
                return null;
            }
            // Handle other error responses
            else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeTextReplacement: " + ex.getMessage());
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