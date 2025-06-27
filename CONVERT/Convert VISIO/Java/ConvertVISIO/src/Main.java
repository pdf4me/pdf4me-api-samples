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
    private static final String API_URL = "https://api.pdf4me.com/api/v2/ConvertVisio?schemaVal=PDF";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        String inputPath = "E-Commerce.vsdx";
        String outputPath = "VISIO_to_PDF_output.pdf";
        try {
            System.out.println("Converting Visio to PDF...");
            convertVisioToPdf(inputPath, outputPath);
            System.out.println("Done: " + outputPath);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    public static void convertVisioToPdf(String inputPath, String outputPath) throws Exception {
        // Read and encode file
        byte[] fileBytes = Files.readAllBytes(Paths.get(inputPath));
        String fileBase64 = Base64.getEncoder().encodeToString(fileBytes);

        Map<String, Object> payload = new HashMap<>();
        payload.put("docContent", fileBase64);
        payload.put("docName", "output");
        payload.put("OutputFormat", "PDF");
        payload.put("IsPdfCompliant", true);
        payload.put("PageIndex", 0);
        payload.put("PageCount", 5);
        payload.put("IncludeHiddenPages", true);
        payload.put("SaveForegroundPage", true);
        payload.put("SaveToolBar", true);
        payload.put("AutoFit", true);

        ApiResponse resp = post(API_URL, API_KEY, payload);
        if (resp.status == 200) {
            saveFile(resp.bytes, outputPath);
        } else if (resp.status == 202) {
            pollForResult(resp.location, outputPath);
        } else {
            throw new IOException("API failed: " + resp.status + (resp.bytes != null && resp.bytes.length > 0 ? ": " + new String(resp.bytes, StandardCharsets.UTF_8) : ""));
        }
    }

    private static void saveFile(byte[] content, String output) throws IOException {
        if (isPdfContent(content)) {
            Files.write(Paths.get(output), content);
            System.out.println("File saved successfully to: " + output);
            System.out.println("File size: " + content.length + " bytes");
        } else {
            throw new IOException("No valid PDF data found in response");
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
                saveFile(pollResp.bytes, output);
                return;
            } else if (pollResp.status != 202) {
                throw new IOException("Polling failed: " + pollResp.status + (pollResp.bytes != null && pollResp.bytes.length > 0 ? ": " + new String(pollResp.bytes, StandardCharsets.UTF_8) : ""));
            }
        }
        throw new IOException("Timeout after 10 attempts");
    }

    private static boolean isPdfContent(byte[] content) {
        // PDF files start with %PDF
        return content.length >= 4 && content[0] == '%' && content[1] == 'P' && 
               content[2] == 'D' && content[3] == 'F';
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
            else if (v instanceof Boolean || v instanceof Number) json.append(v);
            else json.append('"').append(v.toString()).append('"');
        }
        return json.append('}').toString();
    }

    private static class ApiResponse {
        int status; byte[] bytes; String location; String contentType;
        ApiResponse(int s, byte[] b, String l, String ct) { status = s; bytes = b; location = l; contentType = ct; }
    }
} 