/**
 * PDF to Excel Converter Prototype
 * This is a prototype structure for the PDF to Excel conversion project.
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
import java.util.concurrent.*;

public class Main {
    private static final String API_KEY = "get your api key from https://pdf4me.com/";
    private static final String API_URL = "https://api.pdf4me.com/api/v2/ConvertPdfToExcel";
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static CompletableFuture<Void> convertPdfToExcel(String pdf, boolean isFile, String output) {
        return CompletableFuture.runAsync(() -> {
            try {
                String pdfBase64 = isFile ? Base64.getEncoder().encodeToString(Files.readAllBytes(Paths.get(pdf)))
                                         : Base64.getEncoder().encodeToString(pdf.getBytes(StandardCharsets.UTF_8));
                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("docContent", pdfBase64);
                payload.put("docName", "output.pdf");
                payload.put("qualityType", "Draft");
                payload.put("mergeAllSheets", true);
                payload.put("language", "English");
                payload.put("outputFormat", true);
                payload.put("ocrWhenNeeded", true);
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
        
        if (content.length > 1000) {
            Files.write(Paths.get(output), content);
        } else {
            throw new IOException("Response too small to be valid Excel file");
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
        String in = "sample.pdf", out = "PDF_to_EXCEL_output.xlsx";
        try {
            CompletableFuture<Void> f;
            if (Files.exists(Paths.get(in))) {
                f = convertPdfToExcel(in, true, out);
            } else {
                System.err.println("Sample PDF file not found. Please provide a PDF file.");
                return;
            }
            f.get(10, TimeUnit.MINUTES);
            System.out.println("Done: " + out);
        } catch (Exception e) { e.printStackTrace(); }
        executor.shutdown();
    }
} 