
import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final String API_ENDPOINT = "/api/v2/ImageStamp";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        String pdfPath = "sample.pdf";
        String imagePath = "sample.png";

        if (!Files.exists(Paths.get(pdfPath))) {
            System.out.println("PDF file not found: " + pdfPath);
            return;
        }
        if (!Files.exists(Paths.get(imagePath))) {
            System.out.println("Signature image file not found: " + imagePath);
            return;
        }

        System.out.println("=== Signing PDF Document ===");
        String result = signPdf(pdfPath, imagePath);
        if (result != null && !result.isEmpty()) {
            System.out.println("Signed PDF saved to: " + result);
        } else {
            System.out.println("PDF signing failed.");
        }
    }

    public static String signPdf(String pdfPath, String imagePath) {
        try {
            byte[] pdfBytes = Files.readAllBytes(Paths.get(pdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);

            byte[] signatureImageBytes = Files.readAllBytes(Paths.get(imagePath));
            String signatureImageBase64 = Base64.getEncoder().encodeToString(signatureImageBytes);

            String outputFileName = Paths.get(pdfPath).getFileName().toString().replaceFirst("[.][^.]+$", "") + ".signed.pdf";
            Path parentPath = Paths.get(pdfPath).getParent();
            String outputPath = (parentPath != null) ? parentPath.resolve(outputFileName).toString() : outputFileName;

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("alignX", "right");
            payload.put("alignY", "bottom");
            payload.put("docContent", pdfBase64);
            payload.put("docName", "output.pdf");
            payload.put("imageName", Paths.get(imagePath).getFileName().toString());
            payload.put("imageFile", signatureImageBase64);
            payload.put("pages", "1");
            payload.put("marginXInMM", 20);
            payload.put("marginYInMM", 20);
            payload.put("opacity", 100);
            payload.put("isBackground", false);
            payload.put("async", true);

            return executePdfSigningAsync(payload, outputPath);
        } catch (Exception ex) {
            System.out.println("Error in signPdf: " + ex.getMessage());
            return null;
        }
    }

    private static String executePdfSigningAsync(Map<String, Object> payload, String outputPath) {
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
                Files.write(Paths.get(outputPath), response.body());
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
                int retryDelay = 10; // in seconds
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    Thread.sleep(retryDelay * 1000L);
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();
                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                    if (pollResponse.statusCode() == 200) {
                        Files.write(Paths.get(outputPath), pollResponse.body());
                        return outputPath;
                    } else if (pollResponse.statusCode() != 202) {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return null;
                    }
                }
                System.out.println("Timeout: PDF signing did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
                return null;
            }
        } catch (Exception ex) {
            System.out.println("Error in executePdfSigningAsync: " + ex.getMessage());
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
            } else if (value instanceof Number || value instanceof Boolean) {
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