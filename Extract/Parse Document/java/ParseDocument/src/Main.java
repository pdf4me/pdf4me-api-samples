import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

public class Main {
    private static final String API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        System.out.println("=== Parsing Document ===");
        try {
            String inputPdfPath = "../sample.pdf";
            String outputPath = "../parsed_document.txt";
            parseDocument(inputPdfPath, outputPath);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void parseDocument(String inputPdfPath, String outputPath) {
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
            executeParse(payload, outputPath);
        } catch (Exception ex) {
            System.err.println("Error in parseDocument: " + ex.getMessage());
        }
    }

    private static void executeParse(Map<String, Object> payload, String outputPath) {
        try {
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/ParseDocument"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                saveParsingResult(response.body(), outputPath);
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
                    HttpResponse<String> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofString());
                    if (pollResponse.statusCode() == 200) {
                        saveParsingResult(pollResponse.body(), outputPath);
                        return;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(pollResponse.body());
                        return;
                    }
                }
                System.out.println("Timeout: Document parsing did not complete after multiple retries.");
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(response.body());
            }
        } catch (Exception ex) {
            System.err.println("Error in executeParse: " + ex.getMessage());
        }
    }

    private static void saveParsingResult(String responseBody, String outputPath) {
        try {
            // Try to pretty print JSON and extract key fields
            Map<String, Object> parsingData = parseJson(responseBody);
            try (BufferedWriter writer = Files.newBufferedWriter(Paths.get(outputPath), StandardCharsets.UTF_8)) {
                writer.write("Document Parsing Results\n");
                writer.write("========================\n");
                writer.write("Parsed on: " + new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date()) + "\n\n");
                if (parsingData != null) {
                    if (parsingData.containsKey("documentType")) {
                        writer.write("Document Type: " + parsingData.get("documentType") + "\n");
                    }
                    if (parsingData.containsKey("pageCount")) {
                        writer.write("Page Count: " + parsingData.get("pageCount") + "\n");
                    }
                    writer.write("\nFull Response:\n");
                    writer.write(prettyPrintJson(responseBody));
                } else {
                    writer.write(responseBody);
                }
            }
            System.out.println("Parsing results saved: " + outputPath);
        } catch (Exception ex) {
            System.err.println("Error in saveParsingResult: " + ex.getMessage());
            try (FileOutputStream fos = new FileOutputStream(outputPath)) {
                fos.write(responseBody.getBytes(StandardCharsets.UTF_8));
            } catch (IOException ignored) {}
            System.out.println("Raw response saved: " + outputPath);
        }
    }

    // Minimal JSON pretty printer (for display)
    private static String prettyPrintJson(String json) {
        try {
            int indent = 0;
            StringBuilder pretty = new StringBuilder();
            for (int i = 0; i < json.length(); i++) {
                char c = json.charAt(i);
                if (c == '{' || c == '[') {
                    pretty.append(c).append('\n');
                    indent++;
                    pretty.append("  ".repeat(indent));
                } else if (c == '}' || c == ']') {
                    pretty.append('\n');
                    indent--;
                    pretty.append("  ".repeat(indent)).append(c);
                } else if (c == ',') {
                    pretty.append(c).append('\n').append("  ".repeat(indent));
                } else {
                    pretty.append(c);
                }
            }
            return pretty.toString();
        } catch (Exception e) {
            return json;
        }
    }

    // Minimal JSON parser for extracting key fields (not a full parser)
    private static Map<String, Object> parseJson(String json) {
        Map<String, Object> map = new HashMap<>();
        try {
            json = json.trim();
            if (json.startsWith("{") && json.endsWith("}")) {
                json = json.substring(1, json.length() - 1);
                String[] entries = json.split(",\\s*\"(?![^\"]*\":\\s*\\{)");
                for (String entry : entries) {
                    String[] kv = entry.split("\":", 2);
                    if (kv.length == 2) {
                        String key = kv[0].replaceAll("^\"|\"$", "").trim();
                        String value = kv[1].replaceAll("^\"|\"$", "").trim();
                        map.put(key, value);
                    }
                }
            }
        } catch (Exception e) {
            // fallback: ignore
        }
        return map;
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