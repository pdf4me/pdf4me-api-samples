/**
 * PDF to Word Converter Prototype
 * This is a prototype structure for the PDF to Word conversion project.
 * Logic will be implemented later.
 */
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
    private static final String API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String API_URL = "https://api.pdf4me.com/api/v2/ConvertPdfToWord";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        String in = "sample.pdf", out = "PDF_to_Word_output.docx";
        try {
            if (!Files.exists(Paths.get(in))) {
                System.err.println("Sample PDF file not found. Please provide a PDF file.");
                return;
            }
            System.out.println("Converting PDF to Word...");
            convertPdfToWord(in, out);
            System.out.println("Done: " + out);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    public static void convertPdfToWord(String pdfPath, String output) throws Exception {
        String pdfBase64 = Base64.getEncoder().encodeToString(Files.readAllBytes(Paths.get(pdfPath)));
        Map<String, Object> payload = Map.of(
            "docContent", pdfBase64,
            "docName", "test.pdf",
            "qualityType", "Draft",
            "language", "English",
            "mergeAllSheets", true,
            "outputFormat", true,
            "ocrWhenNeeded", true,
            "isAsync", true
        );
        ApiResponse resp = post(API_URL, API_KEY, payload);
        if (resp.status == 200) {
            saveDocx(resp.bytes, output);
        } else if (resp.status == 202) {
            pollForResult(resp.location, output);
        } else {
            throw new IOException("API failed: " + resp.status + (resp.bytes != null && resp.bytes.length > 0 ? ": " + new String(resp.bytes, StandardCharsets.UTF_8) : ""));
        }
    }

    private static void saveDocx(byte[] content, String output) throws IOException {
        if (isDocxContent(content)) {
            Files.write(Paths.get(output), content);
        } else {
            String docxBase64 = extractDocxFromJson(new String(content, StandardCharsets.UTF_8));
            if (docxBase64 != null) {
                Files.write(Paths.get(output), Base64.getDecoder().decode(docxBase64));
            } else {
                throw new IOException("No Word data found in response");
            }
        }
    }

    private static void pollForResult(String locationUrl, String output) throws Exception {
        if (locationUrl == null) throw new IOException("No polling URL received");
        if (!locationUrl.startsWith("http")) {
            locationUrl = URI.create(API_URL).resolve(locationUrl).toString();
        }
        for (int attempt = 1; attempt <= 10; attempt++) {
            Thread.sleep(10000);
            ApiResponse pollResp = get(locationUrl, API_KEY);
            if (pollResp.status == 200) {
                saveDocx(pollResp.bytes, output);
                return;
            } else if (pollResp.status != 202) {
                throw new IOException("Polling failed: " + pollResp.status + (pollResp.bytes != null && pollResp.bytes.length > 0 ? ": " + new String(pollResp.bytes, StandardCharsets.UTF_8) : ""));
            }
        }
        throw new IOException("Timeout after 10 attempts");
    }

    private static boolean isDocxContent(byte[] content) {
        // DOCX files start with PK (zip header)
        return content.length >= 2 && content[0] == 'P' && content[1] == 'K';
    }

    private static String extractDocxFromJson(String json) {
        String[] patterns = {"\"docData\":\"", "\"data\":\""};
        for (String pattern : patterns) {
            int start = json.indexOf(pattern);
            if (start > 0) {
                start += pattern.length();
                int end = json.indexOf('"', start);
                if (end > start) return json.substring(start, end);
            }
        }
        return null;
    }

    private static ApiResponse post(String url, String key, Map<String, Object> payload) throws Exception {
        String json = buildJson(payload);
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .header("Authorization", "Basic " + key)
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        return new ApiResponse(response.statusCode(), response.body(),
                response.headers().firstValue("Location").orElse(null), null);
    }

    private static ApiResponse get(String url, String key) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Basic " + key)
            .GET()
            .build();
        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        return new ApiResponse(response.statusCode(), response.body(), null, null);
    }

    private static String buildJson(Map<String, Object> payload) {
        StringBuilder json = new StringBuilder("{");
        for (Map.Entry<String, Object> e : payload.entrySet()) {
            if (json.length() > 1) json.append(',');
            json.append('"').append(e.getKey()).append('"').append(':');
            Object v = e.getValue();
            if (v instanceof String) json.append('"').append(v.toString().replace("\"", "\\\"")).append('"');
            else json.append(v);
        }
        return json.append('}').toString();
    }

    private static class ApiResponse {
        int status; byte[] bytes; String location; String contentType;
        ApiResponse(int s, byte[] b, String l, String ct) { status = s; bytes = b; location = l; contentType = ct; }
    }
} 