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
        System.out.println("=== Extracting Text by Expression ===");
        try {
            extractTextByExpression("../sample.pdf", "../Extract_text_by_expression_outputs");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void extractTextByExpression(String inputPdfPath, String outputFolder) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return;
            }
            Path outputDir = Paths.get(outputFolder);
            if (!Files.exists(outputDir)) {
                Files.createDirectories(outputDir);
            }
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64);
            payload.put("docName", "output.pdf");
            payload.put("expression", "%");
            payload.put("pageSequence", "1-3");
            payload.put("async", true);
            executeExtractByExpression(payload, outputDir);
        } catch (Exception ex) {
            System.err.println("Error in extractTextByExpression: " + ex.getMessage());
        }
    }

    private static void executeExtractByExpression(Map<String, Object> payload, Path outputDir) {
        try {
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/ExtractTextByExpression"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                saveExtractedByExpression(response, outputDir);
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
                        saveExtractedByExpression(pollResponse, outputDir);
                        return;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return;
                    }
                }
                System.out.println("Timeout: Text extraction did not complete after multiple retries.");
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
            }
        } catch (Exception ex) {
            System.err.println("Error in executeExtractByExpression: " + ex.getMessage());
        }
    }

    private static void saveExtractedByExpression(HttpResponse<byte[]> response, Path outputDir) {
        try {
            String contentType = response.headers().firstValue("Content-Type").orElse("");
            byte[] body = response.body();
            Path jsonPath = outputDir.resolve("extracted_text_by_expression.json");
            Path textPath = outputDir.resolve("extracted_matches.txt");
            if (contentType.contains("application/json")) {
                String json = new String(body, StandardCharsets.UTF_8);
                Files.write(jsonPath, json.getBytes(StandardCharsets.UTF_8));
                System.out.println("Extraction metadata saved: " + jsonPath);
                // Optionally extract and save text matches from JSON
                List<String> matches = extractMatchesFromJson(json);
                if (matches != null && !matches.isEmpty()) {
                    try (BufferedWriter writer = Files.newBufferedWriter(textPath, StandardCharsets.UTF_8)) {
                        writer.write("Text Extraction Results\n");
                        writer.write("======================\n");
                        writer.write("Expression: %\n");
                        writer.write("Pages: 1-3\n");
                        writer.write("Total Matches: " + matches.size() + "\n\n");
                        for (int i = 0; i < matches.size(); i++) {
                            writer.write("Match " + (i+1) + ": " + matches.get(i) + "\n");
                        }
                    }
                    System.out.println("Extracted matches saved: " + textPath);
                } else {
                    System.out.println("No text matches found for the specified expression.");
                }
            } else {
                Files.write(textPath, body);
                System.out.println("Raw content saved: " + textPath);
            }
        } catch (Exception ex) {
            System.err.println("Error in saveExtractedByExpression: " + ex.getMessage());
        }
    }

    // Extracts text matches from the JSON response if present
    private static List<String> extractMatchesFromJson(String json) {
        List<String> matches = new ArrayList<>();
        // This is a minimal implementation; adjust as needed for your API's JSON structure
        if (json.contains("textList")) {
            int idx = json.indexOf("textList");
            int start = json.indexOf('[', idx);
            int end = json.indexOf(']', start);
            if (start != -1 && end != -1) {
                String arr = json.substring(start+1, end);
                String[] vals = arr.split(",");
                for (String v : vals) {
                    String val = v.trim();
                    if (val.startsWith("\"") && val.endsWith("\"")) {
                        val = val.substring(1, val.length() - 1);
                    }
                    if (!val.isEmpty()) matches.add(val);
                }
            }
        }
        return matches;
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