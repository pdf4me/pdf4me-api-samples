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
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        String templatePath = "invoice_sample.html";
        System.out.println("=== Generating Single Document ===");
        try {
            String result = generateDocumentSingle(templatePath);
            if (result != null && !result.isEmpty()) {
                System.out.println("Generated document saved to: " + result);
            } else {
                System.out.println("Document generation failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static String generateDocumentSingle(String templatePath) {
        try {
            if (!Files.exists(Paths.get(templatePath))) {
                System.out.println("Template file not found: " + templatePath);
                return null;
            }
            
            String jsonDataPath = "invoice_sample_data.json";
            if (!Files.exists(Paths.get(jsonDataPath))) {
                System.out.println("JSON data file not found: " + jsonDataPath);
                return null;
            }
            
            String outputPath = templatePath.replace(".html", ".generated.html");
            String jsonData = Files.readString(Paths.get(jsonDataPath));
            byte[] templateBytes = Files.readAllBytes(Paths.get(templatePath));
            String templateBase64 = Base64.getEncoder().encodeToString(templateBytes);
            
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("templateFileType", "html");
            payload.put("templateFileName", "invoice_template.html");
            payload.put("templateFileData", templateBase64);
            payload.put("documentDataType", "text");
            payload.put("outputType", "html");
            payload.put("documentDataText", jsonData);
            payload.put("async", false);
            
            return executeDocumentGeneration(payload, outputPath);
        } catch (Exception ex) {
            System.err.println("Error in generateDocumentSingle: " + ex.getMessage());
            return null;
        }
    }

    private static String executeDocumentGeneration(Map<String, Object> payload, String outputPath) {
        try {
            String jsonPayload = convertToJson(payload);
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/GenerateDocumentSingle"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() == 200) {
                byte[] resultBytes = response.body();
                Files.write(Paths.get(outputPath), resultBytes);
                return outputPath;
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
                
                System.out.println("Timeout: Document generation did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeDocumentGeneration: " + ex.getMessage());
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
            } else if (value instanceof Boolean) {
                json.append(value);
            } else {
                json.append("\"").append(value).append("\"");
            }
        }
        json.append("}");
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