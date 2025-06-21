/**
 * Markdown to PDF Converter Prototype
 * This is a prototype structure for the Markdown to PDF conversion project.
 * Logic will be implemented later.
 */
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.Base64;
import java.util.concurrent.*;
import java.net.HttpURLConnection;

public class Main {
    private static final String API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String API_URL = "https://api.pdf4me.com/api/v2/ConvertMdToPdf";
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();

    public static CompletableFuture<Void> convertMarkdownToPdf(String markdown, boolean isFile, String output) {
        return CompletableFuture.runAsync(() -> {
            try {
                String mdBase64 = isFile ? Base64.getEncoder().encodeToString(Files.readAllBytes(Paths.get(markdown)))
                                         : Base64.getEncoder().encodeToString(markdown.getBytes(StandardCharsets.UTF_8));
                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("docContent", mdBase64);
                payload.put("docName", "sample.md");
                payload.put("mdFilePath", "");
                payload.put("isAsync", true);
                
                ApiResponse resp = post(API_URL, API_KEY, payload);
                
                if (resp.status == 200) {
                    Files.write(Paths.get(output), resp.bytes);
                } else if (resp.status == 202) {
                    String locationUrl = resp.location;
                    if (locationUrl == null) return;
                    
                    for (int attempt = 1; attempt <= 10; attempt++) {
                        Thread.sleep(10000);
                        ApiResponse pollResp = get(locationUrl, API_KEY);
                        if (pollResp.status == 200) {
                            Files.write(Paths.get(output), pollResp.bytes);
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

    private static ApiResponse post(String url, String key, Map<String, Object> payload) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new java.net.URL(url).openConnection();
        c.setRequestMethod("POST");
        c.setRequestProperty("Content-Type", "application/json");
        c.setRequestProperty("Authorization", "Basic " + key);
        c.setDoOutput(true);
        StringBuilder j = new StringBuilder("{");
        for (Map.Entry<String, Object> e : payload.entrySet()) {
            if (j.length() > 1) j.append(',');
            j.append('"').append(e.getKey()).append('"').append(':');
            Object v = e.getValue();
            if (v instanceof String) j.append('"').append(v.toString().replace("\"", "\\\"")).append('"');
            else j.append(v);
        }
        j.append('}');
        try (OutputStream os = c.getOutputStream()) { os.write(j.toString().getBytes(StandardCharsets.UTF_8)); }
        int s = c.getResponseCode();
        String loc = c.getHeaderField("Location");
        String contentType = c.getHeaderField("Content-Type");
        byte[] b = read(s >= 200 && s < 300 ? c.getInputStream() : c.getErrorStream());
        return new ApiResponse(s, b, loc, contentType);
    }
    
    private static ApiResponse get(String url, String key) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new java.net.URL(url).openConnection();
        c.setRequestMethod("GET");
        c.setRequestProperty("Authorization", "Basic " + key);
        int s = c.getResponseCode();
        String contentType = c.getHeaderField("Content-Type");
        byte[] b = read(c.getInputStream());
        return new ApiResponse(s, b, null, contentType);
    }
    
    private static byte[] read(InputStream in) throws IOException {
        if (in == null) return new byte[0];
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        byte[] d = new byte[1024]; int n;
        while ((n = in.read(d)) != -1) buf.write(d, 0, n);
        return buf.toByteArray();
    }
    
    private static class ApiResponse {
        int status; byte[] bytes; String location; String contentType;
        ApiResponse(int s, byte[] b, String l, String ct) { status = s; bytes = b; location = l; contentType = ct; }
    }
    
    public static void main(String[] args) {
        String in = "sample.md", out = "Markdown_to_PDF_output.pdf";
        try {
            CompletableFuture<Void> f;
            if (Files.exists(Paths.get(in))) {
                f = convertMarkdownToPdf(in, true, out);
            } else {
                f = convertMarkdownToPdf("# Sample Markdown\n\nThis is a **sample** markdown document.\n\n- Item 1\n- Item 2\n\n```java\nSystem.out.println(\"Hello World\");\n```", false, out);
            }
            f.get(10, TimeUnit.MINUTES);
            System.out.println("Done: " + out);
        } catch (Exception e) { e.printStackTrace(); }
        executor.shutdown();
    }
} 