import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.*;
import java.util.Base64;

/**
 * Main program class for reading barcodes from images functionality
 * This program demonstrates how to read barcodes from images using the PDF4ME API
 */
public class Main {
    private static final String API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Main entry point of the application
     * @param args Command line arguments (not used in this example)
     */
    public static void main(String[] args) {
        System.out.println("Reading barcodes from image...");
        String inputImagePath = "sample.jpg";
        String outputDataPath = "sample_barcode_data.json";
        readBarcodeFromImage(inputImagePath, outputDataPath);
    }

    public static void readBarcodeFromImage(String inputImagePath, String outputDataPath) {
        try {
            Path inputPath = Paths.get(inputImagePath);
            if (!Files.exists(inputPath)) {
                System.out.println("Error: Image file not found at " + inputImagePath);
                return;
            }
            
            System.out.println("Reading image file: " + inputImagePath);
            byte[] imageBytes = Files.readAllBytes(inputPath);
            String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);
            System.out.println("Image file read successfully: " + imageBytes.length + " bytes");
            
            String docName = inputPath.getFileName().toString();
            String imageType = getImageTypeFromExtension(inputImagePath);
            System.out.println("Detected image type: " + imageType);
            
            String payload = String.format("{\"docName\":\"%s\",\"docContent\":\"%s\",\"imageType\":\"%s\",\"async\":true}", 
                docName, imageBase64, imageType);
            
            String endpoint = BASE_URL + "api/v2/ReadBarcodesfromImage";
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            
            System.out.println("Sending barcode reading request to PDF4me API...");
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Response Status Code: " + response.statusCode());
            
            if (response.statusCode() == 200) {
                String resultJson = response.body();
                System.out.println("Response Body (200): " + resultJson);
                String formattedData = formatBarcodeData(resultJson);
                Files.writeString(Paths.get(outputDataPath), formattedData);
                System.out.println("✓ Success! Barcode reading completed!");
                System.out.println("Barcode data saved: " + outputDataPath);
                return;
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("Error: No polling URL found in response");
                    return;
                }
                
                System.out.println("Received 202 status - starting polling...");
                int maxRetries = 20;
                int retryDelay = 10;
                
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    System.out.println("Checking status... (Attempt " + (attempt + 1) + "/" + maxRetries + ")");
                    Thread.sleep(retryDelay * 1000);
                    
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();
                    
                    HttpResponse<String> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofString());
                    
                    if (pollResponse.statusCode() == 200) {
                        String resultJson = pollResponse.body();
                        System.out.println("Poll response body (200): " + resultJson);
                        String formattedData = formatBarcodeData(resultJson);
                        Files.writeString(Paths.get(outputDataPath), formattedData);
                        System.out.println("✓ Success! Barcode reading completed!");
                        System.out.println("Barcode data saved: " + outputDataPath);
                        return;
                    } else if (pollResponse.statusCode() == 202) {
                        System.out.println("Still processing (202)...");
                        continue;
                    } else {
                        System.out.println("Error during processing: " + pollResponse.statusCode() + " - " + pollResponse.body());
                        return;
                    }
                }
                System.out.println("Timeout: Processing did not complete after multiple retries");
            } else {
                System.out.println("Error: " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception ex) {
            System.err.println("Error: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
    
    private static String getImageTypeFromExtension(String filePath) {
        String extension = Paths.get(filePath).toString().toLowerCase();
        if (extension.endsWith(".jpg") || extension.endsWith(".jpeg")) {
            return "jpg";
        } else if (extension.endsWith(".png")) {
            return "png";
        } else if (extension.endsWith(".gif")) {
            return "gif";
        } else if (extension.endsWith(".bmp")) {
            return "bmp";
        } else if (extension.endsWith(".tiff") || extension.endsWith(".tif")) {
            return "tiff";
        } else if (extension.endsWith(".webp")) {
            return "webp";
        } else {
            return "png"; // Default to png if unknown extension
        }
    }
    
    private static String formatBarcodeData(String jsonString) {
        try {
            // Check if there are any barcodes found (simple check)
            if (jsonString.contains("\"barcodes\":[]") || jsonString.contains("\"barcodes\": []")) {
                System.out.println("No barcodes detected in the image.");
                return "No barcodes found in the image.";
            } else if (jsonString.contains("\"barcodes\":[") || jsonString.contains("\"barcodes\": [")) {
                // Format the JSON for better readability (simple pretty print)
                System.out.println("Barcodes detected and formatted.");
                return formatJsonString(jsonString);
            } else {
                // If no barcodes array found, save the raw response
                System.out.println("Raw response saved (no barcodes array found).");
                return jsonString;
            }
        } catch (Exception ex) {
            System.out.println("JSON formatting error: " + ex.getMessage());
            return jsonString;
        }
    }
    
    private static String formatJsonString(String jsonString) {
        // Simple formatting - add line breaks and indentation
        return jsonString.replace("{", "{\n  ")
                        .replace("}", "\n}")
                        .replace(",", ",\n  ")
                        .replace("[", "[\n    ")
                        .replace("]", "\n  ]");
    }
} 