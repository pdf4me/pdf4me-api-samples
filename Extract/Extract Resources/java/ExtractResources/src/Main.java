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
    private static final String API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"; // Replace with your actual API key
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        System.out.println("=== Extracting Resources from PDF ===");
        String inputPdfPath = args.length > 0 ? args[0] : "../sample.pdf";
        Path inputPath = Paths.get(inputPdfPath).toAbsolutePath();
        String outputFolder = inputPath.getParent().toString();
        extractResources(inputPdfPath, outputFolder);
    }

    public static void extractResources(String inputPdfPath, String outputFolder) {
        try {
            Path outputDir = Paths.get(outputFolder);
            if (!Files.exists(outputDir)) {
                Files.createDirectories(outputDir);
            }
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return;
            }
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64);
            payload.put("docName", new File(inputPdfPath).getName());
            payload.put("extractText", true);
            payload.put("extractImage", true);
            payload.put("async", true);
            executeExtractResources(payload, outputDir);
        } catch (Exception ex) {
            System.err.println("Error in extractResources: " + ex.getMessage());
        }
    }

    private static void executeExtractResources(Map<String, Object> payload, Path outputDir) {
        try {
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/ExtractResources"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                saveExtractedResources(response, outputDir);
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
                        saveExtractedResources(pollResponse, outputDir);
                        return;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return;
                    }
                }
                System.out.println("Timeout: Resource extraction did not complete after multiple retries.");
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
            }
        } catch (Exception ex) {
            System.err.println("Error in executeExtractResources: " + ex.getMessage());
        }
    }

    private static void saveExtractedResources(HttpResponse<byte[]> response, Path outputDir) {
        try {
            String contentType = response.headers().firstValue("Content-Type").orElse("");
            byte[] body = response.body();
            Path jsonPath = outputDir.resolve("extracted_resources.json");
            Path textPath = outputDir.resolve("extracted_text.txt");
            if (contentType.contains("application/json")) {
                String json = new String(body, StandardCharsets.UTF_8);
                Files.write(jsonPath, json.getBytes(StandardCharsets.UTF_8));
                System.out.println("Resource extraction metadata saved: " + jsonPath);
                // Write extracted_text.txt if 'texts' array is present
                List<String> texts = extractTextsFromJson(json);
                if (texts != null && !texts.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    for (String t : texts) {
                        sb.append(t).append(System.lineSeparator());
                    }
                    Files.write(textPath, sb.toString().getBytes(StandardCharsets.UTF_8));
                    System.out.println("Extracted text saved: " + textPath);
                }
            } else {
                Files.write(textPath, body);
                System.out.println("Raw content saved: " + textPath);
            }
        } catch (Exception ex) {
            System.err.println("Error in saveExtractedResources: " + ex.getMessage());
        }
    }

    // Extracts text content from the JSON response if present
    private static List<String> extractTextsFromJson(String json) {
        List<String> texts = new ArrayList<>();
        int idx = json.indexOf("\"texts\"");
        if (idx != -1) {
            int arrStart = json.indexOf('[', idx);
            int arrEnd = json.indexOf(']', arrStart);
            if (arrStart != -1 && arrEnd != -1) {
                String arr = json.substring(arrStart + 1, arrEnd);
                String[] vals = arr.split(",(?=(?:[^\\\"]*\\\"[^\\\"]*\\\")*[^\\\"]*$)"); // split on commas not inside quotes
                for (String v : vals) {
                    String val = v.trim();
                    if (val.startsWith("\"") && val.endsWith("\"")) {
                        val = val.substring(1, val.length() - 1);
                    }
                    val = val.replace("\\n", System.lineSeparator());
                    if (!val.isEmpty()) texts.add(val);
                }
            }
        }
        return texts;
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