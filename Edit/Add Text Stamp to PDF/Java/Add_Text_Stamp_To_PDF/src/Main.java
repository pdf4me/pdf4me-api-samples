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
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/"; // Set your PDF4me API key here
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final String API_ENDPOINT = "/api/v2/Stamp";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        String pdfPath = "sample.pdf";
        if (!Files.exists(Paths.get(pdfPath))) {
            System.out.println("PDF file '" + pdfPath + "' not found.");
            System.out.println("Please place a 'sample.pdf' in the same directory or modify the path in the code.");
            return;
        }

        System.out.println("=== Adding Text Stamp to PDF Document ===");
        String result = addTextStampToPdf(pdfPath);
        if (result != null && !result.isEmpty()) {
            System.out.println("PDF with text stamp saved to: " + result);
        } else {
            System.out.println("Text stamp addition failed.");
        }
    }

    public static String addTextStampToPdf(String pdfPath) {
        try {
            byte[] pdfBytes = Files.readAllBytes(Paths.get(pdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);

            String outputFileName = Paths.get(pdfPath).getFileName().toString().replaceFirst("[.][^.]+$", "") + ".with_text_stamp.pdf";
            Path parentPath = Paths.get(pdfPath).getParent();
            String outputPath = (parentPath != null) ? parentPath.resolve(outputFileName).toString() : outputFileName;

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64);
            payload.put("docName", "output.pdf");
            payload.put("text", "CONFIDENTIAL");
            payload.put("alignX", "center");
            payload.put("alignY", "middle");
            payload.put("fontSize", 24);
            payload.put("fontColor", "#FF0000");
            payload.put("pages", "1");
            payload.put("marginXInMM", 0);
            payload.put("marginYInMM", 0);
            payload.put("opacity", 50);
            payload.put("isBackground", false);
            payload.put("rotation", 45);
            payload.put("async", true);

            return executeTextStampAddition(payload, outputPath);
        } catch (Exception ex) {
            System.out.println("Error in addTextStampToPdf: " + ex.getMessage());
            return null;
        }
    }

    private static String executeTextStampAddition(Map<String, Object> payload, String outputPath) {
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
                        Files.write(Paths.get(outputPath), pollResponse.body());
                        return outputPath;
                    } else if (pollResponse.statusCode() != 202) {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return null;
                    }
                }
                System.out.println("Timeout: PDF text stamp addition did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
                return null;
            }
        } catch (Exception ex) {
            System.out.println("Error in executeTextStampAddition: " + ex.getMessage());
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