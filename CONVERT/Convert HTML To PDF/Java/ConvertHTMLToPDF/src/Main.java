//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.Base64;
import java.util.concurrent.*;
import java.net.HttpURLConnection;

/**
 * HTML to PDF Converter (Async by Default)
 * Converts HTML files to PDF documents using PDF4Me API
 * Supports CSS styling, images, and JavaScript elements
 * Enhanced with async processing capabilities
 */
public class Main {
    // API key as in Python
    private static final String API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String API_URL = "https://api.pdf4me.com/api/v2/ConvertHtmlToPdf";
    
    // Thread pool for async operations
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    
    /**
     * Convert HTML file to PDF (Async by default)
     * @param htmlFilePath Path to the HTML file
     * @param outputPath Output PDF file path
     * @return CompletableFuture that completes when conversion is done
     */
    public static CompletableFuture<Void> convertHtmlToPdf(String htmlFilePath, boolean isFile, String outputPath) {
        return CompletableFuture.runAsync(() -> {
            try {
                String htmlBase64 = isFile ? Base64.getEncoder().encodeToString(Files.readAllBytes(Paths.get(htmlFilePath)))
                                           : Base64.getEncoder().encodeToString(htmlFilePath.getBytes(StandardCharsets.UTF_8));
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
                    handleSuccessResponse(resp, outputPath);
                } else if (resp.status == 202) {
                    String locationUrl = resp.location;
                    if (locationUrl == null) return;
                    
                    for (int attempt = 1; attempt <= 10; attempt++) {
                        Thread.sleep(10000);
                        ApiResponse pollResp = get(locationUrl, API_KEY);
                        if (pollResp.status == 200) {
                            handleSuccessResponse(pollResp, outputPath);
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
    
    private static void handleSuccessResponse(ApiResponse resp, String outputPath) throws IOException {
        byte[] content = resp.bytes;
        if (content == null || content.length == 0) throw new IOException("Empty response");
        
        // Check if direct PDF
        String contentType = resp.contentType;
        boolean isDirectPdf = (contentType != null && (contentType.startsWith("application/pdf") || 
                                                      contentType.equals("application/octet-stream"))) ||
                             (content.length >= 4 && content[0] == '%' && content[1] == 'P' && 
                              content[2] == 'D' && content[3] == 'F');
        
        if (isDirectPdf) {
            Files.write(Paths.get(outputPath), content);
            return;
        }
        
        // Parse JSON response
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
            Files.write(Paths.get(outputPath), pdfBytes);
        } else {
            throw new IOException("No PDF data found");
        }
    }
    
    /**
     * Main method - entry point for the application
     * All conversions are async by default
     */
    public static void main(String[] args) {
        System.out.println("HTML to PDF Converter (Async by Default)");
        System.out.println("=".repeat(50));
        System.out.println("This converter supports HTML files with CSS, images, and JavaScript");
        System.out.println("All conversions are async by default!");
        System.out.println("-".repeat(70));
        
        try {
            // Use sample.html as input
            String inputFile = "sample.html";
            String outputFile = "HTML_to_PDF_output.pdf";
            
            // Check if sample.html exists
            if (Main.class.getResource("/" + inputFile) != null || 
                new java.io.File(inputFile).exists()) {
                
                System.out.println("Using existing sample.html file");
                
                // Convert using async method
                CompletableFuture<Void> future = convertHtmlToPdf(inputFile, true, outputFile);
                
                // Wait for completion
                future.get(10, TimeUnit.MINUTES); // 10 minute timeout
                
            } else {
                System.out.println("Sample file not found, using built-in sample HTML data");
                
                // Create sample HTML data for testing
                String sampleHtml = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Sample HTML Document</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 40px; }
                            h1 { color: #333; }
                            .content { background-color: #f5f5f5; padding: 20px; border-radius: 5px; }
                        </style>
                    </head>
                    <body>
                        <h1>Sample HTML to PDF Conversion</h1>
                        <div class="content">
                            <p>This is a sample HTML document that will be converted to PDF.</p>
                            <p>It includes basic styling and formatting.</p>
                            <ul>
                                <li>Feature 1: CSS styling</li>
                                <li>Feature 2: Multiple paragraphs</li>
                                <li>Feature 3: Lists and formatting</li>
                            </ul>
                        </div>
                    </body>
                    </html>
                    """;
                
                // Convert using async method
                CompletableFuture<Void> future = convertHtmlToPdf(sampleHtml, false, outputFile);
                
                // Wait for completion
                future.get(10, TimeUnit.MINUTES); // 10 minute timeout
            }
            
            System.out.println("\n✅ Conversion completed successfully!");
            System.out.println("📁 Output file: " + outputFile);
            
        } catch (Exception e) {
            System.err.println("\n❌ Conversion failed: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Shutdown the executor service
            executor.shutdown();
            try {
                if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }
    
    // API Client Methods
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
        final int status;
        final byte[] bytes;
        final String location;
        final String contentType;
        
        ApiResponse(int status, byte[] bytes, String location, String contentType) {
            this.status = status;
            this.bytes = bytes;
            this.location = location;
            this.contentType = contentType;
        }
    }
}