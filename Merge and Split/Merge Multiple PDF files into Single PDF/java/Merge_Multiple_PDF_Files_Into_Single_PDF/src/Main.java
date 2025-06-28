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
        System.out.println("=== Merging Multiple PDF Files into Single PDF ===");
        try {
            // Use parent directory for input files
            String parentDir = Paths.get(System.getProperty("user.dir")).getParent().toString();
            String result = mergeMultiplePdfs(Arrays.asList(
                parentDir + "/sample1.pdf",
                parentDir + "/sample2.pdf"
            ));
            if (result != null && !result.isEmpty()) {
                System.out.println("Merged PDF saved to: " + result);
            } else {
                System.out.println("PDF merge failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static String mergeMultiplePdfs(List<String> pdfPaths) {
        try {
            List<String> pdfBase64List = new ArrayList<>();
            for (String pdfPath : pdfPaths) {
                if (!Files.exists(Paths.get(pdfPath))) {
                    System.out.println("PDF file not found: " + pdfPath);
                    return null;
                }
                byte[] pdfBytes = Files.readAllBytes(Paths.get(pdfPath));
                pdfBase64List.add(Base64.getEncoder().encodeToString(pdfBytes));
            }
            String outputFileName = "Merged_pdf_output.pdf";
            String outputPdfPath = Paths.get(Paths.get(pdfPaths.get(0)).getParent().toString(), outputFileName).toString();
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64List);
            payload.put("docName", outputFileName);
            payload.put("async", true);
            return executeMerge(payload, outputPdfPath);
        } catch (Exception ex) {
            System.err.println("Error in mergeMultiplePdfs: " + ex.getMessage());
            return null;
        }
    }

    private static String executeMerge(Map<String, Object> payload, String outputPdfPath) {
        try {
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/Merge"))
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
                System.out.println("Timeout: Merge did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeMerge: " + ex.getMessage());
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