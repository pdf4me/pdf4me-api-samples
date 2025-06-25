import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;

/**
 * Main program class for PDF optimization functionality
 * This program demonstrates how to optimize PDF files using the PDF4ME API
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
        System.out.println("=== Optimizing PDF Document ===");
        try {
            String result = optimizePdf(pdfPath);
            if (result != null && !result.isEmpty()) {
                System.out.println("Optimized PDF saved to: " + result);
            } else {
                System.out.println("PDF optimization failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static String optimizePdf(String inputPdfPath) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return null;
            }
            String outputFileName = Paths.get(inputPdfPath).getFileName().toString().replaceFirst("[.][^.]+$", "") + ".optimized.pdf";
            String outputPdfPath = Paths.get(System.getProperty("user.dir"), outputFileName).toString();
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            String payload = "{" +
                "\"docContent\":\"" + pdfBase64 + "\"," +
                "\"docName\":\"output.pdf\"," +
                "\"optimizeProfile\":\"Web\"," +
                "\"async\":true}";
            return executeOptimization(payload, outputPdfPath);
        } catch (Exception ex) {
            System.err.println("Error in optimizePdf: " + ex.getMessage());
            return null;
        }
    }

    private static String executeOptimization(String payload, String outputPdfPath) {
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/Optimize"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                byte[] resultBytes = response.body();
                Files.write(Paths.get(outputPdfPath), resultBytes);
                return outputPdfPath;
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
                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                    if (pollResponse.statusCode() == 200) {
                        byte[] resultBytes = pollResponse.body();
                        Files.write(Paths.get(outputPdfPath), resultBytes);
                        return outputPdfPath;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body()));
                        return null;
                    }
                }
                System.out.println("Timeout: PDF optimization did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body()));
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeOptimization: " + ex.getMessage());
            return null;
        }
    }
} 