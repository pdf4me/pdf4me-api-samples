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
        System.out.println("=== Merging Two PDF Files as Overlay ===");
        try {
            // Use parent directory for input files
            String parentDir = Paths.get(System.getProperty("user.dir")).getParent().toString();
            String result = mergeOverlay(
                parentDir + "/sample1.pdf",
                parentDir + "/sample2.pdf"
            );
            if (result != null && !result.isEmpty()) {
                System.out.println("Overlay merged PDF saved to: " + result);
            } else {
                System.out.println("Overlay merge failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static String mergeOverlay(String basePdfPath, String layerPdfPath) {
        try {
            if (!Files.exists(Paths.get(basePdfPath))) {
                System.out.println("Base PDF file not found: " + basePdfPath);
                return null;
            }
            if (!Files.exists(Paths.get(layerPdfPath))) {
                System.out.println("Layer PDF file not found: " + layerPdfPath);
                return null;
            }
            String outputFileName = "Merge_overlay_output.pdf";
            String outputPdfPath = Paths.get(Paths.get(basePdfPath).getParent().toString(), outputFileName).toString();
            byte[] basePdfBytes = Files.readAllBytes(Paths.get(basePdfPath));
            byte[] layerPdfBytes = Files.readAllBytes(Paths.get(layerPdfPath));
            String basePdfBase64 = Base64.getEncoder().encodeToString(basePdfBytes);
            String layerPdfBase64 = Base64.getEncoder().encodeToString(layerPdfBytes);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("baseDocContent", basePdfBase64);
            payload.put("baseDocName", basePdfPath);
            payload.put("layerDocContent", layerPdfBase64);
            payload.put("layerDocName", layerPdfPath);
            payload.put("async", true);
            return executeOverlayMerge(payload, outputPdfPath);
        } catch (Exception ex) {
            System.err.println("Error in mergeOverlay: " + ex.getMessage());
            return null;
        }
    }

    private static String executeOverlayMerge(Map<String, Object> payload, String outputPdfPath) {
        try {
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/MergeOverlay"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
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
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return null;
                    }
                }
                System.out.println("Timeout: Overlay merge did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeOverlayMerge: " + ex.getMessage());
            return null;
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