import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.Base64;
import java.util.concurrent.*;

/**
 * Main program class for adding image stamps to PDF functionality
 * This program demonstrates how to add image stamps to PDF documents using the PDF4ME API
 * 
 * Features:
 * - Add image stamps to PDF documents
 * - Support for various image formats (PNG, JPG, etc.)
 * - Configurable stamp positioning and sizing
 * - Support for multiple pages or specific page ranges
 * - Asynchronous processing for large files
 */
public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final String API_ENDPOINT = "/api/v2/ImageStamp";
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Main entry point of the application
     * @param args Command line arguments (not used in this example)
     */
    public static void main(String[] args) {
        // Define file paths for input PDF and image stamp
        String pdfPath = "sample.pdf";  // Update this path to your PDF file location
        String imagePath = "sample.png"; // Update this path to your image stamp file location
        
        System.out.println("=== Adding Image Stamp to PDF Document ===");
        
        try {
            CompletableFuture<String> f = addImageStampToPdf(pdfPath, imagePath);
            String result = f.get(10, TimeUnit.MINUTES);
            if (result != null) {
                System.out.println("PDF with image stamp saved to: " + result);
            } else {
                System.out.println("Image stamp addition failed.");
            }
        } catch (Exception e) { 
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace(); 
        }
        executor.shutdown();
    }

    /**
     * Adds an image stamp to a PDF document using the PDF4ME API
     * @param pdfPath Path to the input PDF file
     * @param imagePath Path to the image stamp file
     * @return CompletableFuture that completes with the output file path, or null if failed
     */
    public static CompletableFuture<String> addImageStampToPdf(String pdfPath, String imagePath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Validate that the input PDF file exists
                if (!Files.exists(Paths.get(pdfPath))) {
                    System.err.println("PDF file not found: " + pdfPath);
                    return null;
                }

                // Validate that the input image file exists
                if (!Files.exists(Paths.get(imagePath))) {
                    System.err.println("Image file not found: " + imagePath);
                    return null;
                }

                // Read PDF file content and convert to base64 for API transmission
                byte[] pdfBytes = Files.readAllBytes(Paths.get(pdfPath));
                String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);

                // Read and encode the image file to Base64 for stamp
                byte[] imageBytes = Files.readAllBytes(Paths.get(imagePath));
                String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);

                // Generate output file path in the same directory as input PDF
                String outputFileName = Paths.get(pdfPath).getFileName().toString().replaceFirst("[.][^.]+$", "") + ".with_image_stamp.pdf";
                Path parentPath = Paths.get(pdfPath).getParent();
                String outputPath = (parentPath != null) ? 
                    parentPath.resolve(outputFileName).toString() : 
                    outputFileName;

                // Prepare the API request payload for adding image stamp
                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("docContent", pdfBase64);
                payload.put("docName", "sample.pdf");
                payload.put("imageFile", imageBase64);
                payload.put("imageName", "sample.png");
                payload.put("pages", "all");
                payload.put("alignX", "left");
                payload.put("alignY", "top");
                payload.put("heightInMM", "100");
                payload.put("widthInMM", "100");
                payload.put("marginXInMM", "0");
                payload.put("marginYInMM", "0");
                payload.put("opacity", 100);
                payload.put("showOnlyInPrint", false);
                payload.put("async", false);

                // Execute the image stamp addition operation
                return executeImageStampAddition(payload, outputPath);
            } catch (Exception e) {
                System.err.println("Error in addImageStampToPdf: " + e.getMessage());
                return null;
            }
        }, executor);
    }

    /**
     * Executes the image stamp addition operation
     * @param payload API request payload containing PDF and image stamp data
     * @param outputPath Path where the output PDF will be saved
     * @return Path to the modified PDF document, or null if addition failed
     */
    private static String executeImageStampAddition(Map<String, Object> payload, String outputPath) {
        try {
            // Serialize payload to JSON
            String jsonPayload = serializeToJson(payload);
            
            // Create HTTP request for the image stamp addition operation
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + API_ENDPOINT))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            // Send the image stamp addition request to the API
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());

            // Handle immediate success response (200 OK)
            if (response.statusCode() == 200) {
                // Read the modified PDF content from the response
                byte[] resultBytes = response.body();
                
                // Save the modified PDF to the output path
                Files.write(Paths.get(outputPath), resultBytes);
                return outputPath;
            }
            // Handle asynchronous processing response (202 Accepted)
            else if (response.statusCode() == 202) {
                // Extract the polling URL from response headers
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.err.println("No polling URL found in response");
                    return null;
                }

                // Poll for completion with retry logic
                int maxRetries = 10;     // Maximum number of polling attempts
                int retryDelay = 10;     // Delay between polling attempts in seconds

                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    // Wait before polling to allow processing time
                    Thread.sleep(retryDelay * 1000);
                    
                    // Create polling request to check processing status
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();
                    
                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());

                    // Handle successful completion
                    if (pollResponse.statusCode() == 200) {
                        // Read the completed PDF with image stamp from the response
                        byte[] resultBytes = pollResponse.body();
                        Files.write(Paths.get(outputPath), resultBytes);
                        return outputPath;
                    }
                    // Continue polling if still processing
                    else if (pollResponse.statusCode() == 202) {
                        continue; // Continue polling
                    }
                    // Handle polling errors
                    else {
                        System.err.println("Error during polling: " + pollResponse.statusCode());
                        return null;
                    }
                }
                
                // Timeout if image stamp addition doesn't complete within retry limit
                System.err.println("Timeout: Image stamp addition did not complete after multiple retries");
                return null;
            }
            // Handle other error responses
            else {
                // Log the error response for debugging
                String errorContent = new String(response.body(), StandardCharsets.UTF_8);
                System.err.println("Error response: " + response.statusCode() + " - " + errorContent);
                return null;
            }
        } catch (Exception e) {
            // Log any exceptions that occur during API communication
            System.err.println("Error in executeImageStampAddition: " + e.getMessage());
            return null;
        }
    }

    /**
     * Helper method to serialize Map to JSON string
     * @param payload Map to serialize
     * @return JSON string representation
     */
    private static String serializeToJson(Map<String, Object> payload) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : payload.entrySet()) {
            if (!first) json.append(',');
            json.append('"').append(entry.getKey()).append('"').append(':');
            Object value = entry.getValue();
            if (value instanceof String) {
                json.append('"').append(value.toString().replace("\"", "\\\"")).append('"');
            } else if (value instanceof Boolean || value instanceof Integer) {
                json.append(value);
            } else {
                json.append('"').append(value.toString()).append('"');
            }
            first = false;
        }
        json.append('}');
        return json.toString();
    }
} 