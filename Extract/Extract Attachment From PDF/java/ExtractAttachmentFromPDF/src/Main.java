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
        System.out.println("=== Extracting Attachments from PDF ===");
        String inputPdfPath = args.length > 0 ? args[0] : "../sample.pdf";
        Path inputPath = Paths.get(inputPdfPath).toAbsolutePath();
        String outputFolder = inputPath.getParent().toString();
        extractAttachmentFromPdf(inputPdfPath, outputFolder);
    }

    public static void extractAttachmentFromPdf(String inputPdfPath, String outputFolder) {
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
            payload.put("docName", new File(inputPdfPath).getName());
            payload.put("docContent", pdfBase64);
            payload.put("async", true);
            executeExtractAttachment(payload, outputDir);
        } catch (Exception ex) {
            System.err.println("Error in extractAttachmentFromPdf: " + ex.getMessage());
        }
    }

    private static void executeExtractAttachment(Map<String, Object> payload, Path outputDir) {
        try {
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/ExtractAttachmentFromPdf"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                saveExtractedAttachment(response, outputDir);
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
                        saveExtractedAttachment(pollResponse, outputDir);
                        return;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return;
                    }
                }
                System.out.println("Timeout: Attachment extraction did not complete after multiple retries.");
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
            }
        } catch (Exception ex) {
            System.err.println("Error in executeExtractAttachment: " + ex.getMessage());
        }
    }

    private static void saveExtractedAttachment(HttpResponse<byte[]> response, Path outputDir) {
        try {
            String contentType = response.headers().firstValue("Content-Type").orElse("");
            byte[] body = response.body();
            Path jsonPath = outputDir.resolve("attachment_metadata.json");
            if (contentType.contains("application/json")) {
                Files.write(jsonPath, body);
                System.out.println("Attachment extraction metadata saved: " + jsonPath);
                // Optionally process and save attachments as text files if possible
                String json = new String(body, StandardCharsets.UTF_8);
                processAttachmentJson(json, outputDir);
            } else if (contentType.contains("application/zip") || contentType.contains("application/octet-stream")) {
                Path zipPath = outputDir.resolve("extracted_attachments.zip");
                Files.write(zipPath, body);
                System.out.println("Extracted attachments saved: " + zipPath);
                // Optionally extract ZIP
                extractZip(zipPath, outputDir);
            } else {
                Files.write(jsonPath, body);
                System.out.println("Raw content saved: " + jsonPath);
            }
        } catch (Exception ex) {
            System.err.println("Error in saveExtractedAttachment: " + ex.getMessage());
        }
    }

    // Process JSON metadata and save attachments as text files if possible
    private static void processAttachmentJson(String json, Path outputDir) {
        // Minimal implementation: look for 'outputDocuments' array and save base64 content as text
        int idx = json.indexOf("\"outputDocuments\"");
        if (idx != -1) {
            int arrStart = json.indexOf('[', idx);
            int arrEnd = json.indexOf(']', arrStart);
            if (arrStart != -1 && arrEnd != -1) {
                String arr = json.substring(arrStart + 1, arrEnd);
                String[] docs = arr.split("},");
                for (int i = 0; i < docs.length; i++) {
                    String d = docs[i];
                    if (!d.endsWith("}")) d = d + "}";
                    String fileName = extractJsonField(d, "fileName");
                    String streamFile = extractJsonField(d, "streamFile");
                    if (!fileName.isEmpty() && !streamFile.isEmpty()) {
                        try {
                            byte[] decoded = Base64.getDecoder().decode(streamFile);
                            Path outPath = outputDir.resolve(fileName + "_extracted.txt");
                            Files.write(outPath, decoded);
                            System.out.println("✓ Attachment content saved: " + outPath);
                        } catch (Exception e) {
                            System.err.println("Error decoding attachment: " + e.getMessage());
                        }
                    }
                }
            }
        }
    }

    // Helper to extract a field value from a JSON object string
    private static String extractJsonField(String json, String field) {
        int idx = json.indexOf("\"" + field + "\"");
        if (idx != -1) {
            int colon = json.indexOf(':', idx);
            int comma = json.indexOf(',', colon);
            int end = comma != -1 ? comma : json.indexOf('}', colon);
            if (end == -1) end = json.length();
            String val = json.substring(colon + 1, end).trim();
            if (val.startsWith("\"")) val = val.substring(1);
            if (val.endsWith("\"")) val = val.substring(0, val.length() - 1);
            return val;
        }
        return "";
    }

    // Helper to extract ZIP files
    private static void extractZip(Path zipPath, Path outputDir) {
        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(new FileInputStream(zipPath.toFile()))) {
            java.util.zip.ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                Path outPath = outputDir.resolve(entry.getName());
                try (FileOutputStream fos = new FileOutputStream(outPath.toFile())) {
                    byte[] buffer = new byte[4096];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        fos.write(buffer, 0, len);
                    }
                }
                System.out.println("✓ Extracted file: " + outPath);
            }
        } catch (Exception e) {
            System.err.println("Error extracting ZIP: " + e.getMessage());
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