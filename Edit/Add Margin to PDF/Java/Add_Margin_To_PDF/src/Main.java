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
 * Main program class for adding margins to PDF functionality
 * This program demonstrates how to add margins to PDF documents using the PDF4ME API
 */
public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final String API_ENDPOINT = "/api/v2/AddMargin";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Main entry point of the application
     * 
     * @param args Command line arguments (not used in this example)
     */
    public static void main(String[] args) {
        String pdfPath = "sample.pdf";
        System.out.println("=== Adding Margins to PDF Document ===");
        String result = addMarginToPdf(pdfPath);
        if (result != null && !result.isEmpty()) {
            System.out.println("PDF with margins saved to: " + result);
        } else {
            System.out.println("Margin addition failed.");
        }
    }

    public static String addMarginToPdf(String pdfPath) {
        try {
            if (!Files.exists(Paths.get(pdfPath))) {
                System.out.println("PDF file not found: " + pdfPath);
                return null;
            }
            byte[] pdfBytes = Files.readAllBytes(Paths.get(pdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            String outputFileName = Paths.get(pdfPath).getFileName().toString().replaceFirst("[.][^.]+$", "") + ".with_margins.pdf";
            Path parentPath = Paths.get(pdfPath).getParent();
            String outputPath = (parentPath != null) ? parentPath.resolve(outputFileName).toString() : outputFileName;
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64);
            payload.put("docName", "sample.pdf");
            payload.put("marginTop", 20);
            payload.put("marginBottom", 20);
            payload.put("marginLeft", 20);
            payload.put("marginRight", 20);
            payload.put("async", true);
            return executeMarginAddition(payload, outputPath);
        } catch (Exception ex) {
            System.out.println("Error in addMarginToPdf: " + ex.getMessage());
            return null;
        }
    }

    private static String executeMarginAddition(Map<String, Object> payload, String outputPath) {
        try {
            String jsonPayload = serializeToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + API_ENDPOINT))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .build();
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                byte[] resultBytes = response.body();
                Files.write(Paths.get(outputPath), resultBytes);
                return outputPath;
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    locationUrl = response.headers().firstValue("location").orElse(null);
                }
                if (locationUrl == null || locationUrl.isEmpty()) {
                    System.out.println("No 'Location' header found in the response.");
                    return null;
                }
                int maxRetries = 10;
                int retryDelay = 10;
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    Thread.sleep(retryDelay * 1000L);
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();
                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                    if (pollResponse.statusCode() == 200) {
                        byte[] resultBytes = pollResponse.body();
                        Files.write(Paths.get(outputPath), resultBytes);
                        return outputPath;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return null;
                    }
                }
                System.out.println("Timeout: Margin addition did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
                return null;
            }
        } catch (Exception ex) {
            System.out.println("Error in executeMarginAddition: " + ex.getMessage());
            return null;
        }
    }

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