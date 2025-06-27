import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.Base64;
import java.util.concurrent.*;

public class Main {
    private static final String API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String API_URL = "https://api.pdf4me.com/api/v2/ConvertHtmlToPdf";
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static CompletableFuture<Void> convertHtmlToPdf(String html, boolean isFile, String output) {
        return CompletableFuture.runAsync(() -> {
            try {
                String htmlBase64 = isFile ? Base64.getEncoder().encodeToString(Files.readAllBytes(Paths.get(html)))
                                           : Base64.getEncoder().encodeToString(html.getBytes(StandardCharsets.UTF_8));
                Map<String, Object> payload = new LinkedHashMap<>();
                    payload.put("docContent", htmlBase64);
                    payload.put("docName", "output.pdf");
                    payload.put("layout", "Portrait");
                    payload.put("format", "A4");
                    payload.put("scale", 0.8);
                    payload.put("topMargin", "40px");
                    payload.put("bottomMargin", "40px");
                    payload.put("leftMargin", "40px");
                    payload.put("rightMargin", "40px");
                    payload.put("printBackground", true);
                    payload.put("displayHeaderFooter", true);
                payload.put("isAsync", true);
                
                ApiResponse resp = post(API_URL, API_KEY, payload);
                
                if (resp.status == 200) {
                    handleSuccessResponse(resp, output);
                } else if (resp.status == 202) {
                    String locationUrl = resp.location;
                    if (locationUrl == null) return;
                    
                    for (int attempt = 1; attempt <= 10; attempt++) {
                        Thread.sleep(10000);
                        ApiResponse pollResp = get(locationUrl, API_KEY);
                        if (pollResp.status == 200) {
                            handleSuccessResponse(pollResp, output);
                            return;
                        } else if (pollResp.status != 202) {
                            System.err.println("Polling failed: " + pollResp.status);
                            return;
                        }
                    }
                    System.err.println("Timeout");
                } else {
                    System.err.println("API failed: " + resp.status);
                }
            } catch (Exception e) {
                System.err.println("Error: " + e.getMessage());
                throw new RuntimeException(e); 
            }
        }, executor);
    }
    
    private static void handleSuccessResponse(ApiResponse resp, String output) throws IOException {
        byte[] content = resp.bytes;
        if (content == null || content.length == 0) throw new IOException("Empty response");
        
        String contentType = resp.contentType;
        boolean isDirectPdf = (contentType != null && (contentType.startsWith("application/pdf") || 
                                                      contentType.equals("application/octet-stream"))) ||
                             (content.length >= 4 && content[0] == '%' && content[1] == 'P' && 
                              content[2] == 'D' && content[3] == 'F');
        
        if (isDirectPdf) {
            Files.write(Paths.get(output), content);
            return;
        }
        
        String jsonResponse = new String(content, StandardCharsets.UTF_8);
        String pdfBase64 = null;
        
        if (jsonResponse.contains("\"docData\"")) {
            int start = jsonResponse.indexOf("\"docData\"") + 10;
            int end = jsonResponse.indexOf('"', start);
            if (end > start) pdfBase64 = jsonResponse.substring(start, end);
        } else if (jsonResponse.contains("\"data\"")) {
            int start = jsonResponse.indexOf("\"data\"") + 7;
            int end = jsonResponse.indexOf('"', start);
            if (end > start) pdfBase64 = jsonResponse.substring(start, end);
        }
                
                if (pdfBase64 != null) {
            byte[] pdfBytes = Base64.getDecoder().decode(pdfBase64);
            Files.write(Paths.get(output), pdfBytes);
        } else {
            throw new IOException("No PDF data found");
        }
    }

    private static ApiResponse post(String url, String key, Map<String, Object> payload) throws IOException, InterruptedException {
        StringBuilder j = new StringBuilder("{");
        for (Map.Entry<String, Object> e : payload.entrySet()) {
            if (j.length() > 1) j.append(',');
            j.append('"').append(e.getKey()).append('"').append(':');
            Object v = e.getValue();
            if (v instanceof String) j.append('"').append(v.toString().replace("\"", "\\\"")).append('"');
            else j.append(v);
        }
        j.append('}');
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .header("Authorization", "Basic " + key)
            .POST(HttpRequest.BodyPublishers.ofString(j.toString()))
            .build();
            
        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        String location = response.headers().firstValue("Location").orElse(null);
        String contentType = response.headers().firstValue("Content-Type").orElse(null);
        
        return new ApiResponse(response.statusCode(), response.body(), location, contentType);
    }
    
    private static ApiResponse get(String url, String key) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Basic " + key)
            .GET()
            .build();
            
        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        String contentType = response.headers().firstValue("Content-Type").orElse(null);
        
        return new ApiResponse(response.statusCode(), response.body(), null, contentType);
    }
    
    private static class ApiResponse {
        int status; byte[] bytes; String location; String contentType;
        ApiResponse(int s, byte[] b, String l, String ct) { status = s; bytes = b; location = l; contentType = ct; }
    }
    
    public static void main(String[] args) {
        String in = "sample.html", out = "HTML_to_PDF_output.pdf";
        try {
            CompletableFuture<Void> f;
            if (Files.exists(Paths.get(in))) {
                f = convertHtmlToPdf(in, true, out);
            } else {
                f = convertHtmlToPdf("<html><body><h1>Sample</h1><p>Test</p></body></html>", false, out);
            }
            f.get(10, TimeUnit.MINUTES);
            System.out.println("Done: " + out);
        } catch (Exception e) { e.printStackTrace(); }
        executor.shutdown();
    }
}