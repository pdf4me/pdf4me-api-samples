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

/**
 * Main program class for adding HTML header/footer to PDF functionality
 * This program demonstrates how to add HTML header/footer to PDF documents using the PDF4ME API
 * Implementation based on Python logic with improved payload structure
 */
public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String API_URL = "https://api.pdf4me.com/api/v2/AddHtmlHeaderFooter";
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Main entry point of the application
     * @param args Command line arguments (not used in this example)
     */
    public static void main(String[] args) {
        // Define file path for input PDF document
        String pdfPath = "sample.pdf";  // Update this path to your PDF file location
        String outputPath = "Add_header_footer_to_PDF_output.pdf";  // Output PDF file name
        
        System.out.println("Adding HTML header/footer to PDF...");
        
        try {
            CompletableFuture<Void> f = addHtmlHeaderFooterToPdf(pdfPath, outputPath);
            f.get(10, TimeUnit.MINUTES);
            System.out.println("Done: " + outputPath);
        } catch (Exception e) { 
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace(); 
        }
        executor.shutdown();
    }

    public static CompletableFuture<Void> addHtmlHeaderFooterToPdf(String pdfPath, String outputPath) {
        return CompletableFuture.runAsync(() -> {
            try {
                // Check if the input PDF file exists before proceeding
                if (!Files.exists(Paths.get(pdfPath))) {
                    System.err.println("Error: PDF file not found at " + pdfPath);
                    return;
                }

                // Read the PDF file and convert it to base64 encoding
                byte[] pdfContent = Files.readAllBytes(Paths.get(pdfPath));
                String pdfBase64 = Base64.getEncoder().encodeToString(pdfContent);
                System.out.println("PDF file read successfully: " + pdfContent.length + " bytes");

                // Prepare the payload (data) to send to the API - using Python structure
                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("docContent", pdfBase64);                        // Base64 encoded PDF document content
                payload.put("docName", "output.pdf");                        // Output PDF file name
                payload.put("htmlContent", "<div style='text-align: center; font-family: Arial; font-size: 12px; color: #FF0000;'>Document Header PDF4me </div>");  // HTML content (plain HTML, not base64)
                payload.put("pages", "");                                    // Page options: "", "1", "1,3,5", "2-5", "1,3,7-10", "2-" (empty string = all pages)
                payload.put("location", "Header");                           // Location options: "Header", "Footer", "Both"
                payload.put("skipFirstPage", false);                         // Skip first page (true/false)
                payload.put("marginLeft", 20.0);                             // Left margin in pixels (double)
                payload.put("marginRight", 20.0);                            // Right margin in pixels (double)
                payload.put("marginTop", 50.0);                              // Top margin in pixels (double)
                payload.put("marginBottom", 50.0);                           // Bottom margin in pixels (double)
                payload.put("async", true);                                  // Enable asynchronous processing

                System.out.println("Sending HTML header/footer request to PDF4me API...");

                ApiResponse resp = post(API_URL, API_KEY, payload);
                
                if (resp.status == 200) {
                    // 200 - Success: HTML header/footer addition completed immediately
                    System.out.println("✓ Success! HTML header/footer addition completed!");
                    handleSuccessResponse(resp, outputPath);
                } else if (resp.status == 202) {
                    // 202 - Accepted: API is processing the request asynchronously
                    System.out.println("202 - Request accepted. Processing asynchronously...");
                    
                    String locationUrl = resp.location;
                    if (locationUrl == null) {
                        System.err.println("Error: No polling URL found in response");
                        return;
                    }

                    // Retry logic for polling the result
                    int maxRetries = 10;
                    int retryDelay = 10;

                    // Poll the API until HTML header/footer addition is complete
                    for (int attempt = 0; attempt < maxRetries; attempt++) {
                        System.out.println("Checking status... (Attempt " + (attempt + 1) + "/" + maxRetries + ")");
                        Thread.sleep(retryDelay * 1000);

                        ApiResponse pollResp = get(locationUrl, API_KEY);
                        
                        if (pollResp.status == 200) {
                            // 200 - Success: Processing completed
                            System.out.println("✓ Success! HTML header/footer addition completed!");
                            handleSuccessResponse(pollResp, outputPath);
                            return;
                        } else if (pollResp.status == 202) {
                            // Still processing, continue polling
                            continue;
                        } else {
                            // Error occurred during processing
                            System.err.println("Error during processing: " + pollResp.status + " - " + pollResp.getBodyAsString());
                            return;
                        }
                    }
                    
                    // If we reach here, polling timed out
                    System.err.println("Timeout: Processing did not complete after multiple retries");
                } else {
                    // Other status codes - Error
                    System.err.println("Error: " + resp.status + " - " + resp.getBodyAsString());
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
        
        // Save the PDF with HTML header/footer
        Files.write(Paths.get(outputPath), content);
        System.out.println("File saved: " + outputPath);
    }

    private static ApiResponse post(String url, String key, Map<String, Object> payload) throws IOException, InterruptedException {
        StringBuilder j = new StringBuilder("{");
        for (Map.Entry<String, Object> e : payload.entrySet()) {
            if (j.length() > 1) j.append(',');
            j.append('"').append(e.getKey()).append('"').append(':');
            Object v = e.getValue();
            if (v instanceof String) j.append('"').append(v.toString().replace("\"", "\\\"")).append('"');
            else if (v instanceof Boolean) j.append(v);
            else if (v instanceof Double) j.append(v);
            else j.append(v);
        }
        j.append('}');
        
        // Debug: Print the payload being sent
        System.out.println("Sending payload to: " + url);
        System.out.println("Payload: " + j.toString());
        
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
        String getBodyAsString() {
            if (bytes == null) return null;
            return new String(bytes, StandardCharsets.UTF_8);
        }
    }
}
