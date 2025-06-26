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
    private static final String API_URL = "https://api.pdf4me.com/api/v2/ConvertUrlToPdf";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        String targetUrl = "https://en.wikipedia.org/wiki/Microsoft_Power_Automate";
        String out = "URL_to_PDF_output.pdf";
        try {
            System.out.println("Converting URL to PDF...");
            convertUrlToPdf(targetUrl, out);
            System.out.println("Done: " + out);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    public static void convertUrlToPdf(String targetUrl, String output) throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("webUrl", targetUrl);
        payload.put("authType", "NoAuth");
        payload.put("username", "");
        payload.put("password", "");
        payload.put("docContent", "");
        payload.put("docName", output);
        payload.put("layout", "portrait");
        payload.put("format", "A4");
        payload.put("scale", 1.0);
        payload.put("topMargin", "20px");
        payload.put("leftMargin", "20px");
        payload.put("rightMargin", "20px");
        payload.put("bottomMargin", "20px");
        payload.put("printBackground", true);
        payload.put("displayHeaderFooter", false);
        
        ApiResponse resp = post(API_URL, API_KEY, payload);
        if (resp.status == 200) {
            savePdf(resp.bytes, output);
        } else if (resp.status == 202) {
            pollForResult(resp.location, output);
        } else {
            throw new IOException("API failed: " + resp.status + (resp.bytes != null && resp.bytes.length > 0 ? ": " + new String(resp.bytes, StandardCharsets.UTF_8) : ""));
        }
    }

    private static void savePdf(byte[] content, String output) throws IOException {
        if (isPdfContent(content)) {
            Files.write(Paths.get(output), content);
            System.out.println("PDF saved successfully to: " + output);
            System.out.println("File size: " + content.length + " bytes");
        } else {
            String pdfBase64 = extractPdfFromJson(new String(content, StandardCharsets.UTF_8));
            if (pdfBase64 != null) {
                byte[] pdfBytes = Base64.getDecoder().decode(pdfBase64);
                Files.write(Paths.get(output), pdfBytes);
                System.out.println("PDF saved successfully to: " + output);
                System.out.println("File size: " + pdfBytes.length + " bytes");
            } else {
                throw new IOException("No PDF data found in response");
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
                savePdf(pollResp.bytes, output);
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

    private static String extractPdfFromJson(String json) {
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