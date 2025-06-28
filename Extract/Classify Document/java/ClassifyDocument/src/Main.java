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
    private static final String API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        System.out.println("=== Classifying Document ===");
        String inputPdfPath = args.length > 0 ? args[0] : "../sample.pdf";
        Path inputPath = Paths.get(inputPdfPath).toAbsolutePath();
        String outputJsonPath = args.length > 1 ? args[1] : inputPath.getParent().resolve("document_classification_result.json").toString();
        classifyDocument(inputPdfPath, outputJsonPath);
    }

    public static void classifyDocument(String inputPdfPath, String outputJsonPath) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return;
            }
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64);
            payload.put("docName", "output.pdf");
            payload.put("async", true);
            executeClassify(payload, outputJsonPath);
        } catch (Exception ex) {
            System.err.println("Error in classifyDocument: " + ex.getMessage());
        }
    }

    private static void executeClassify(Map<String, Object> payload, String outputJsonPath) {
        try {
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/ClassifyDocument"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                saveClassificationResult(response, outputJsonPath);
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("No 'Location' header found in the response.");
                    return;
                }
                int maxRetries = 15;
                int retryDelay = 8;
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    Thread.sleep(retryDelay * 1000);
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();
                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                    if (pollResponse.statusCode() == 200) {
                        saveClassificationResult(pollResponse, outputJsonPath);
                        return;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return;
                    }
                }
                System.out.println("Timeout: Document classification did not complete after multiple retries.");
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
            }
        } catch (Exception ex) {
            System.err.println("Error in executeClassify: " + ex.getMessage());
        }
    }

    private static void saveClassificationResult(HttpResponse<byte[]> response, String outputJsonPath) {
        try {
            String contentType = response.headers().firstValue("Content-Type").orElse("");
            byte[] body = response.body();
            if (contentType.contains("application/json")) {
                Files.write(Paths.get(outputJsonPath), body);
                System.out.println("Classification result saved: " + outputJsonPath);
            } else {
                Files.write(Paths.get(outputJsonPath), body);
                System.out.println("Raw content saved: " + outputJsonPath);
            }
        } catch (Exception ex) {
            System.err.println("Error in saveClassificationResult: " + ex.getMessage());
        }
    }

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
            } else if (value instanceof List) {
                json.append(convertListToJson((List<?>) value));
            } else if (value instanceof Boolean) {
                json.append(value);
            } else {
                json.append("\"").append(value).append("\"");
            }
        }
        json.append("}");
        return json.toString();
    }

    private static String convertListToJson(List<?> list) {
        StringBuilder json = new StringBuilder("[");
        boolean first = true;
        for (Object item : list) {
            if (!first) json.append(",");
            first = false;
            if (item instanceof Map) {
                json.append(convertToJson((Map<String, Object>) item));
            } else if (item instanceof String) {
                json.append("\"").append(escapeJsonString((String) item)).append("\"");
            } else {
                json.append("\"").append(item).append("\"");
            }
        }
        json.append("]");
        return json.toString();
    }

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