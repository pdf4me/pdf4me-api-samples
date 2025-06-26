import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        System.out.println("=== Creating Barcode Image ===");
        try {
            String result = createBarcode();
            if (result != null && !result.isEmpty()) {
                System.out.println("Barcode image saved to: " + result);
            } else {
                System.out.println("Barcode creation failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static String createBarcode() {
        String barcodeText = "PDF4me Create Barcode Sample";
        String outputFileName = "Barcode_create_output.png";
        String outputImagePath = Paths.get(System.getProperty("user.dir"), outputFileName).toString();
        String url = BASE_URL + "api/v2/CreateBarcode";

        // Prepare the payload (data) to send to the API
        String payload = "{" +
                "\"text\":\"" + barcodeText + "\"," +
                "\"barcodeType\":\"qrCode\"," +
                "\"hideText\":false," +
                "\"async\":true" +
                "}";

        return executeBarcodeCreation(payload, outputImagePath, url);
    }

    private static String executeBarcodeCreation(String payload, String outputImagePath, String url) {
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Basic " + API_KEY)
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            System.out.println("Sending barcode creation request to PDF4me API...");

            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() == 200) {
                // 200 - Success: barcode image created immediately
                System.out.println("✓ Success! Barcode image created!");
                try {
                    Files.write(Paths.get(outputImagePath), response.body());
                    System.out.println("Barcode image saved: " + outputImagePath);
                    return outputImagePath;
                } catch (Exception e) {
                    System.err.println("Error saving barcode image: " + e.getMessage());
                    return null;
                }
            } else if (response.statusCode() == 202) {
                // 202 - Accepted: API is processing the request asynchronously
                System.out.println("202 - Request accepted. Processing asynchronously...");
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.err.println("Error: No polling URL found in response");
                    return null;
                }
                int maxRetries = 10;
                int retryDelay = 10;
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    System.out.println("Checking status... (Attempt " + (attempt + 1) + "/" + maxRetries + ")");
                    try {
                        TimeUnit.SECONDS.sleep(retryDelay);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return null;
                    }
                    try {
                        HttpRequest pollRequest = HttpRequest.newBuilder()
                                .uri(URI.create(locationUrl))
                                .header("Authorization", "Basic " + API_KEY)
                                .GET()
                                .build();
                        HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                        if (pollResponse.statusCode() == 200) {
                            System.out.println("✓ Success! Barcode image created!");
                            try {
                                Files.write(Paths.get(outputImagePath), pollResponse.body());
                                System.out.println("Barcode image saved: " + outputImagePath);
                                return outputImagePath;
                            } catch (Exception e) {
                                System.err.println("Error saving barcode image: " + e.getMessage());
                                return null;
                            }
                        } else if (pollResponse.statusCode() == 202) {
                            continue;
                        } else {
                            System.err.println("Error during processing: " + pollResponse.statusCode() + " - " + new String(pollResponse.body()));
                            return null;
                        }
                    } catch (Exception e) {
                        System.err.println("Error polling status: " + e.getMessage());
                        continue;
                    }
                }
                System.err.println("Timeout: Processing did not complete after multiple retries");
                return null;
            } else {
                System.err.println("Error: " + response.statusCode() + " - " + new String(response.body()));
                return null;
            }
        } catch (Exception e) {
            System.err.println("Error in executeBarcodeCreation: " + e.getMessage());
            return null;
        }
    }
} 