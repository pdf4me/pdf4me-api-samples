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
        System.out.println("=== Extracting Text from Word ===");
        try {
            extractTextFromWord("../sample.docx", "../extracted_text.txt", "../extracted_text_from_word.json");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void extractTextFromWord(String inputDocxPath, String outputTextPath, String outputJsonPath) {
        try {
            if (!Files.exists(Paths.get(inputDocxPath))) {
                System.out.println("Word file not found: " + inputDocxPath);
                return;
            }
            byte[] docxBytes = Files.readAllBytes(Paths.get(inputDocxPath));
            String docxBase64 = Base64.getEncoder().encodeToString(docxBytes);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", docxBase64);
            payload.put("docName", "output");
            payload.put("StartPageNumber", 1);
            payload.put("EndPageNumber", 3);
            payload.put("RemoveComments", true);
            payload.put("RemoveHeaderFooter", true);
            payload.put("AcceptChanges", true);
            payload.put("async", false);
            executeExtractText(payload, outputTextPath, outputJsonPath);
        } catch (Exception ex) {
            System.err.println("Error in extractTextFromWord: " + ex.getMessage());
        }
    }

    private static void executeExtractText(Map<String, Object> payload, String outputTextPath, String outputJsonPath) {
        try {
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/ExtractTextFromWord"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                saveExtractedText(response, outputTextPath, outputJsonPath);
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("No 'Location' header found in the response.");
                    return;
                }
                int maxRetries = 15;
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
                        saveExtractedText(pollResponse, outputTextPath, outputJsonPath);
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
            System.err.println("Error in executeExtractText: " + ex.getMessage());
        }
    }

    private static void saveExtractedText(HttpResponse<byte[]> response, String outputTextPath, String outputJsonPath) {
        try {
            String contentType = response.headers().firstValue("Content-Type").orElse("");
            byte[] body = response.body();
            if (contentType.contains("application/json")) {
                String json = new String(body, StandardCharsets.UTF_8);
                Files.write(Paths.get(outputJsonPath), json.getBytes(StandardCharsets.UTF_8));
                System.out.println("Extraction metadata saved: " + outputJsonPath);
                // Optionally extract and save text content from JSON
                String text = extractTextFromJson(json);
                if (text != null) {
                    Files.write(Paths.get(outputTextPath), text.getBytes(StandardCharsets.UTF_8));
                    System.out.println("Extracted text saved: " + outputTextPath);
                }
            } else {
                // Try to decode as base64, else save as plain text
                try {
                    String decoded = new String(Base64.getDecoder().decode(body), StandardCharsets.UTF_8);
                    Files.write(Paths.get(outputTextPath), decoded.getBytes(StandardCharsets.UTF_8));
                    System.out.println("Extracted text saved: " + outputTextPath);
                } catch (Exception e) {
                    Files.write(Paths.get(outputTextPath), body);
                    System.out.println("Raw content saved: " + outputTextPath);
                }
            }
        } catch (Exception ex) {
            System.err.println("Error in saveExtractedText: " + ex.getMessage());
        }
    }

    // Extracts text content from the JSON response if present
    private static String extractTextFromJson(String json) {
        // This is a minimal implementation; adjust as needed for your API's JSON structure
        if (json.contains("extractedText")) {
            int idx = json.indexOf("extractedText");
            int start = json.indexOf(':', idx) + 1;
            int end = json.indexOf(',', start);
            if (end == -1) end = json.indexOf('}', start);
            String value = json.substring(start, end).trim();
            if (value.startsWith("\"") && value.endsWith("\"")) {
                value = value.substring(1, value.length() - 1);
            }
            return value.replace("\\n", System.lineSeparator());
        }
        return null;
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