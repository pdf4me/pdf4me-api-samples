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
    private static final String API_URL = "https://api.pdf4me.com/api/v2/ConvertJsonToExcel";
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static CompletableFuture<Void> convertJsonToExcel(String json, boolean isFile, String output) {
        return CompletableFuture.runAsync(() -> {
            try {
                String jsonBase64 = isFile ? Base64.getEncoder().encodeToString(Files.readAllBytes(Paths.get(json)))
                                          : Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("docContent", jsonBase64);
                payload.put("docName", "output");
                payload.put("worksheetName", "Sheet1");
                payload.put("isTitleWrapText", true);
                payload.put("isTitleBold", true);
                payload.put("convertNumberAndDate", false);
                payload.put("numberFormat", "11");
                payload.put("dateFormat", "01/01/2025");
                payload.put("ignoreNullValues", false);
                payload.put("firstRow", 1);
                payload.put("firstColumn", 1);
                payload.put("isAsync", true);
                
                ApiResponse resp = post(API_URL, API_KEY, payload);
                System.out.println("Initial response status: " + resp.status);
                
                if (resp.status == 200) {
                    handleSuccessResponse(resp, output);
                    System.out.println("Conversion completed immediately");
                } else if (resp.status == 202) {
                    String locationUrl = resp.location;
                    System.out.println("Location header: " + locationUrl);
                    
                    if (locationUrl == null) {
                        System.err.println("No Location header received");
                        return;
                    }
                    
                    // Handle relative URLs
                    if (!locationUrl.startsWith("http")) {
                        URI baseUri = URI.create(API_URL);
                        locationUrl = baseUri.resolve(locationUrl).toString();
                        System.out.println("Resolved polling URL: " + locationUrl);
                    }
                    
                    // Wait longer before first poll to give API time to process
                    System.out.println("Waiting 15 seconds before first poll...");
                    Thread.sleep(15000);
                    
                    for (int attempt = 1; attempt <= 10; attempt++) {
                        System.out.println("Polling attempt " + attempt + "...");
                        
                        try {
                            ApiResponse pollResp = get(locationUrl, API_KEY);
                            System.out.println("Poll response status: " + pollResp.status);
                            
                            if (pollResp.status == 200) {
                                handleSuccessResponse(pollResp, output);
                                System.out.println("Conversion completed successfully");
                                return;
                            } else if (pollResp.status == 202) {
                                System.out.println("Still processing...");
                                Thread.sleep(10000);
                                continue;
                            } else if (pollResp.status == 404) {
                                System.out.println("Status endpoint not ready yet (404), continuing to poll...");
                                Thread.sleep(10000);
                                continue;
                            } else {
                                System.err.println("Polling failed with status: " + pollResp.status);
                                if (pollResp.bytes.length > 0) {
                                    String errorBody = new String(pollResp.bytes, StandardCharsets.UTF_8);
                                    System.err.println("Error response: " + errorBody);
                                }
                                return;
                            }
                        } catch (Exception e) {
                            System.err.println("Polling request failed: " + e.getMessage());
                            return;
                        }
                    }
                    System.err.println("Timeout after 10 attempts");
                } else {
                    System.err.println("API failed with status: " + resp.status);
                    if (resp.bytes.length > 0) {
                        String errorBody = new String(resp.bytes, StandardCharsets.UTF_8);
                        System.err.println("Error response: " + errorBody);
                    }
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
        
        // Validate Excel file content
        if (content.length > 1000) {
            Files.write(Paths.get(output), content);
            System.out.println("Excel file saved successfully to: " + output);
        } else {
            throw new IOException("Response too small to be valid Excel file");
        }
    }

    private static ApiResponse post(String url, String key, Map<String, Object> payload) throws IOException, InterruptedException {
        StringBuilder json = new StringBuilder("{");
        for (Map.Entry<String, Object> e : payload.entrySet()) {
            if (json.length() > 1) json.append(',');
            json.append('"').append(e.getKey()).append('"').append(':');
            Object v = e.getValue();
            if (v instanceof String) json.append('"').append(v.toString().replace("\"", "\\\"")).append('"');
            else json.append(v);
        }
        json.append('}');
        
        System.out.println("POST request to: " + url);
        System.out.println("Request payload: " + json.toString());
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + key)
                .POST(HttpRequest.BodyPublishers.ofString(json.toString(), StandardCharsets.UTF_8))
                .build();
        
        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        
        String location = response.headers().firstValue("Location").orElse(null);
        String contentType = response.headers().firstValue("Content-Type").orElse(null);
        
        System.out.println("Response headers:");
        response.headers().map().forEach((k, v) -> System.out.println("  " + k + ": " + v));
        
        return new ApiResponse(response.statusCode(), response.body(), location, contentType);
    }
    
    private static ApiResponse get(String url, String key) throws IOException, InterruptedException {
        System.out.println("GET request to: " + url);
        
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
        String in = "sample.json", out = "JSON_to_EXCEL_output.xlsx";
        try {
            CompletableFuture<Void> f;
            if (Files.exists(Paths.get(in))) {
                f = convertJsonToExcel(in, true, out);
            } else {
                f = convertJsonToExcel("[{\"name\":\"John\",\"age\":30},{\"name\":\"Jane\",\"age\":25}]", false, out);
            }
            f.get(10, TimeUnit.MINUTES);
            System.out.println("Done: " + out);
        } catch (Exception e) { e.printStackTrace(); }
        executor.shutdown();
    }
} 