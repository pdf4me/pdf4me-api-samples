import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        System.out.println("=== Reading Barcode From PDF ===");
        try {
            String result = readBarcodeFromPdf();
            if (result != null && !result.isEmpty()) {
                System.out.println("Barcode reading completed successfully!");
                System.out.println("Output saved to: " + result);
            } else {
                System.out.println("Barcode reading failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static String readBarcodeFromPdf() {
        String pdfFilePath = "sample.pdf";
        String outputPath = "Read_barcode_output.json";
        String url = BASE_URL + "api/v2/ReadBarcodes";
        
        // Check if the input PDF file exists before proceeding
        if (!Files.exists(Paths.get(pdfFilePath))) {
            System.err.println("Error: PDF file not found at " + pdfFilePath);
            return null;
        }
        
        // Read the PDF file and convert it to base64 encoding
        try {
            byte[] pdfContent = Files.readAllBytes(Paths.get(pdfFilePath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfContent);
            System.out.println("PDF file read successfully: " + pdfContent.length + " bytes");
            
            // Prepare the payload (data) to send to the API
            String payload = "{" +
                "\"docContent\":\"" + pdfBase64 + "\"," +
                "\"docName\":\"output.pdf\"," +
                "\"barcodeType\":[\"all\"]," +
                "\"pages\":\"all\"," +
                "\"async\":true" +
                "}";
            
            return executeBarcodeReading(payload, outputPath, url);
            
        } catch (Exception e) {
            System.err.println("Error reading PDF file: " + e.getMessage());
            return null;
        }
    }
    
    private static String executeBarcodeReading(String payload, String outputPath, String url) {
        try {
            // Set up HTTP headers for the API request
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Basic " + API_KEY)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            
            System.out.println("Sending barcode reading request to PDF4me API...");
            
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            
            if (response.statusCode() == 200) {
                // 200 - Success: barcode reading completed immediately
                System.out.println("✓ Success! Barcode reading completed!");
                
                // Parse and save the barcode data
                try {
                    String responseText = new String(response.body());
                    Files.write(Paths.get(outputPath), responseText.getBytes());
                    System.out.println("Barcode data saved: " + outputPath);
                    
                    // Display found barcodes (basic parsing)
                    if (responseText.contains("\"barcodes\"")) {
                        System.out.println("Found barcodes in the response");
                        System.out.println("Response preview: " + responseText.substring(0, Math.min(200, responseText.length())) + "...");
                    } else {
                        System.out.println("Barcode data: " + responseText);
                    }
                    
                    return outputPath;
                    
                } catch (Exception e) {
                    System.err.println("Error processing barcode data: " + e.getMessage());
                    // Save raw response as fallback
                    Files.write(Paths.get(outputPath), response.body());
                    System.out.println("Raw response saved: " + outputPath);
                    return outputPath;
                }
                
            } else if (response.statusCode() == 202) {
                // 202 - Accepted: API is processing the request asynchronously
                System.out.println("202 - Request accepted. Processing asynchronously...");
                
                // Get the polling URL from the Location header for checking status
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.err.println("Error: No polling URL found in response");
                    return null;
                }
                
                // Retry logic for polling the result
                int maxRetries = 10;
                int retryDelay = 10;
                
                // Poll the API until barcode reading is complete
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    System.out.println("Checking status... (Attempt " + (attempt + 1) + "/" + maxRetries + ")");
                    
                    try {
                        TimeUnit.SECONDS.sleep(retryDelay);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return null;
                    }
                    
                    // Check the processing status by calling the polling URL
                    try {
                        HttpRequest pollRequest = HttpRequest.newBuilder()
                            .uri(URI.create(locationUrl))
                            .header("Authorization", "Basic " + API_KEY)
                            .GET()
                            .build();
                        
                        HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                        
                        if (pollResponse.statusCode() == 200) {
                            // 200 - Success: Processing completed
                            System.out.println("✓ Success! Barcode reading completed!");
                            
                            // Parse and save the barcode data
                            try {
                                String responseText = new String(pollResponse.body());
                                Files.write(Paths.get(outputPath), responseText.getBytes());
                                System.out.println("Barcode data saved: " + outputPath);
                                
                                // Display found barcodes (basic parsing)
                                if (responseText.contains("\"barcodes\"")) {
                                    System.out.println("Found barcodes in the response");
                                    System.out.println("Response preview: " + responseText.substring(0, Math.min(200, responseText.length())) + "...");
                                } else {
                                    System.out.println("Barcode data: " + responseText);
                                }
                                
                                return outputPath;
                                
                            } catch (Exception e) {
                                System.err.println("Error processing barcode data: " + e.getMessage());
                                // Save raw response as fallback
                                Files.write(Paths.get(outputPath), pollResponse.body());
                                System.out.println("Raw response saved: " + outputPath);
                                return outputPath;
                            }
                            
                        } else if (pollResponse.statusCode() == 202) {
                            // Still processing, continue polling
                            continue;
                        } else {
                            // Error occurred during processing
                            System.err.println("Error during processing: " + pollResponse.statusCode() + " - " + new String(pollResponse.body()));
                            return null;
                        }
                        
                    } catch (Exception e) {
                        System.err.println("Error polling status: " + e.getMessage());
                        continue;
                    }
                }
                
                // If we reach here, polling timed out
                System.err.println("Timeout: Processing did not complete after multiple retries");
                return null;
                
            } else {
                // Other status codes - Error
                System.err.println("Error: " + response.statusCode() + " - " + new String(response.body()));
                return null;
            }
            
        } catch (Exception e) {
            System.err.println("Error in executeBarcodeReading: " + e.getMessage());
            return null;
        }
    }
} 