import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * HTML to PDF Converter (Self-Contained Version)
 * Converts HTML files to PDF documents using PDF4Me API
 * Supports CSS styling, images, and JavaScript elements
 * This version includes all utility classes embedded for standalone use
 */
public class HTMLToPDF {
    // API key as in Python
    private static final String API_KEY = "ZWJhNjMwNDEtZTY4NC00YTViLWE2ZWMtYTliYjIzODEwMjEzOlV1TyU5JkxqTnJMa3AhRzdPWkR0ZVZ6Y3FaTWNpckRM";
    private static final String API_URL = "https://api-dev.pdf4me.com/api/v2/ConvertHtmlToPdf";
    
    /**
     * Convert HTML file to PDF
     * @param htmlFilePath Path to the HTML file
     * @param outputPath Output PDF file path
     * @throws IOException if conversion fails
     */
    public static void convertHtmlToPdf(String htmlFilePath, String outputPath) throws IOException {
        System.out.println("Starting HTML to PDF conversion process...");
        System.out.println("Input HTML file: " + htmlFilePath);
        System.out.println("Output PDF file: " + outputPath);
        
        // Check if input file exists
        if (!FileUtils.fileExists(htmlFilePath)) {
            System.err.println("Error: Input file not found at " + htmlFilePath);
            return;
        }
        
        try {
            // Read HTML file as bytes and encode to base64
            byte[] htmlBytes = FileUtils.readFileAsBytes(htmlFilePath);
            String htmlBase64 = FileUtils.encodeToBase64(htmlBytes);
            System.out.println("HTML file successfully encoded to base64");
            System.out.println("HTML file size: " + htmlBytes.length + " bytes");
        
            // Prepare payload (match Python structure)
            Map<String, Object> payload = new HashMap<>();
            payload.put("docContent", htmlBase64);
            payload.put("docName", "output.pdf");
            payload.put("indexFilePath", htmlFilePath);
            payload.put("layout", "Portrait");
            payload.put("format", "A4");
            payload.put("scale", 0.8);
            payload.put("topMargin", "40px");
            payload.put("bottomMargin", "40px");
            payload.put("leftMargin", "40px");
            payload.put("rightMargin", "40px");
            payload.put("printBackground", true);
            payload.put("displayHeaderFooter", true);
            
            // Send POST request
            System.out.println("Sending request to PDF4Me API...");
            System.out.println("API URL: " + API_URL);
            Pdf4MeApiClient.ApiResponse response = Pdf4MeApiClient.postWithApiKey(API_URL, API_KEY, payload);
            System.out.println("Response status code: " + response.getStatusCode());
        
            // Handle 202 (async)
            if (response.getStatusCode() == 202) {
                String locationUrl = response.getLocation();
                if (locationUrl == null) {
                    System.err.println("No 'Location' header found in the response.");
                    return;
                }
                System.out.println("Request accepted. PDF4Me is processing asynchronously...");
                System.out.println("Polling URL: " + locationUrl);
                Pdf4MeApiClient.ApiResponse finalResponse = Pdf4MeApiClient.pollForCompletionWithApiKey(locationUrl, API_KEY);
                savePdfOrHandleJson(finalResponse, outputPath);
                return;
            }
            
            // Handle 200 (immediate)
            if (response.getStatusCode() == 200) {
                System.out.println("Conversion completed immediately!");
                savePdfOrHandleJson(response, outputPath);
                return;
            }
            
            // Error
            System.err.println("Failed to convert HTML to PDF. Status code: " + response.getStatusCode());
            byte[] errorContent = response.getContentBytes();
            if (errorContent != null && errorContent.length > 0) {
                String errorMessage = new String(errorContent, StandardCharsets.UTF_8);
                System.err.println("Error response: " + errorMessage);
            }
        } catch (IOException e) {
            System.err.println("Error during conversion: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Save PDF file or handle JSON response
     */
    private static void savePdfOrHandleJson(Pdf4MeApiClient.ApiResponse response, String outputPath) throws IOException {
        byte[] content = response.getContentBytes();
        
        if (content != null && content.length > 0) {
            // Check if response is a direct PDF file
            if (isPdf(content)) {
                FileUtils.writeBytesToFile(outputPath, content);
                System.out.println("PDF file saved successfully to: " + outputPath);
                System.out.println("HTML has been converted to PDF format");
                System.out.println("File size: " + content.length + " bytes");
            } else {
                // Try to extract PDF from JSON response
                String jsonResponse = new String(content, StandardCharsets.UTF_8);
                String pdfBase64 = extractBase64FromJson(jsonResponse);
                
                if (pdfBase64 != null) {
                    byte[] pdfBytes = FileUtils.decodeFromBase64(pdfBase64);
                    FileUtils.writeBytesToFile(outputPath, pdfBytes);
                    System.out.println("PDF file saved successfully to: " + outputPath);
                    System.out.println("HTML has been converted to PDF format");
                    System.out.println("File size: " + pdfBytes.length + " bytes");
                } else {
                    System.err.println("No PDF data found in the response");
                    System.err.println("Response content: " + jsonResponse.substring(0, Math.min(500, jsonResponse.length())));
                }
            }
        } else {
            throw new IOException("Empty response received from API");
        }
    }
    
    /**
     * Check if content appears to be a PDF
     */
    private static boolean isPdf(byte[] content) {
        return content.length >= 4 && content[0] == '%' && content[1] == 'P' && content[2] == 'D' && content[3] == 'F';
    }
    
    /**
     * Extract base64 PDF data from JSON response
     */
    private static String extractBase64FromJson(String json) {
        try {
            // Simple JSON parsing to find PDF data
            if (json.contains("\"docData\"")) {
                int start = json.indexOf("\"docData\"") + 10;
                int end = json.indexOf("\"", start);
                if (end > start) {
                    return json.substring(start, end);
                }
            }
            
            if (json.contains("\"data\"")) {
                int start = json.indexOf("\"data\"") + 7;
                int end = json.indexOf("\"", start);
                if (end > start) {
                    return json.substring(start, end);
                }
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("Error parsing JSON response: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Main method for testing
     */
    public static void main(String[] args) {
        System.out.println("Starting HTML to PDF conversion (Integrated Version)...");
        System.out.println("This converter supports HTML files with CSS, images, and JavaScript");
        System.out.println("-".repeat(70));
        
        try {
            // Use sample.html as input
            String inputFile = "sample.html";
            String outputFile = "HTML_to_PDF_output.pdf";
            
            // Convert HTML file to PDF
            convertHtmlToPdf(inputFile, outputFile);
            
        } catch (IOException e) {
            System.err.println("Conversion failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

/**
 * Utility class for file operations
 * Handles reading, writing, and encoding/decoding files
 */
class FileUtils {
    
    /**
     * Read a file and return its content as bytes
     * @param filePath Path to the file
     * @return File content as byte array
     * @throws IOException if file cannot be read
     */
    public static byte[] readFileAsBytes(String filePath) throws IOException {
        System.out.println("Reading file as bytes: " + filePath);
        Path path = Paths.get(filePath);
        return Files.readAllBytes(path);
    }
    
    /**
     * Write bytes to a file
     * @param filePath Path where to write the file
     * @param content Content to write as bytes
     * @throws IOException if file cannot be written
     */
    public static void writeBytesToFile(String filePath, byte[] content) throws IOException {
        System.out.println("Writing bytes to file: " + filePath);
        Path path = Paths.get(filePath);
        Files.write(path, content);
    }
    
    /**
     * Encode bytes to Base64
     * @param content Bytes to encode
     * @return Base64 encoded string
     */
    public static String encodeToBase64(byte[] content) {
        return Base64.getEncoder().encodeToString(content);
    }
    
    /**
     * Decode Base64 string to bytes
     * @param base64String Base64 encoded string
     * @return Decoded bytes
     */
    public static byte[] decodeFromBase64(String base64String) {
        return Base64.getDecoder().decode(base64String);
    }
    
    /**
     * Check if a file exists
     * @param filePath Path to check
     * @return true if file exists, false otherwise
     */
    public static boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }
}

/**
 * Common API client for PDF4Me API interactions
 * Handles HTTP requests, authentication, and polling for asynchronous operations
 */
class Pdf4MeApiClient {
    private static final int MAX_RETRIES = 10;
    private static final int RETRY_DELAY_SECONDS = 10;
    
    /**
     * Send a POST request to the PDF4Me API with a custom API key
     */
    public static ApiResponse postWithApiKey(String url, String apiKey, Map<String, Object> payload) throws IOException {
        java.net.URL apiUrl = new java.net.URL(url);
        java.net.HttpURLConnection connection = (java.net.HttpURLConnection) apiUrl.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Authorization", "Basic " + apiKey);
        connection.setDoOutput(true);
        String jsonPayload = convertMapToJson(payload);
        try (java.io.OutputStream os = connection.getOutputStream()) {
            byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
        int statusCode = connection.getResponseCode();
        String location = connection.getHeaderField("Location");
        byte[] contentBytes;
        if (statusCode >= 200 && statusCode < 300) {
            contentBytes = readInputStream(connection.getInputStream());
        } else {
            contentBytes = readInputStream(connection.getErrorStream());
        }
        return new ApiResponse(statusCode, contentBytes, location);
    }
    
    /**
     * Poll for completion of asynchronous operations with custom API key
     */
    public static ApiResponse pollForCompletionWithApiKey(String pollingUrl, String apiKey) throws IOException {
        System.out.println("Starting polling for completion at: " + pollingUrl);
        
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            System.out.println("Polling attempt " + attempt + "/" + MAX_RETRIES);
            
            try {
                Thread.sleep(RETRY_DELAY_SECONDS * 1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("Polling interrupted", e);
            }
            
            ApiResponse response = getWithApiKey(pollingUrl, apiKey);
            
            if (response.getStatusCode() == 200) {
                System.out.println("Operation completed successfully");
                return response;
            } else if (response.getStatusCode() == 202) {
                System.out.println("Operation still in progress, continuing to poll...");
                continue;
            } else {
                System.err.println("Unexpected status code during polling: " + response.getStatusCode());
                throw new IOException("Polling failed with status: " + response.getStatusCode());
            }
        }
        
        throw new IOException("Operation timed out after " + MAX_RETRIES + " attempts");
    }
    
    /**
     * Send a GET request to the PDF4Me API with a custom API key
     */
    public static ApiResponse getWithApiKey(String url, String apiKey) throws IOException {
        java.net.URL apiUrl = new java.net.URL(url);
        java.net.HttpURLConnection connection = (java.net.HttpURLConnection) apiUrl.openConnection();
        
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Authorization", "Basic " + apiKey);
        
        int statusCode = connection.getResponseCode();
        byte[] contentBytes = readInputStream(connection.getInputStream());
        
        return new ApiResponse(statusCode, contentBytes, null);
    }
    
    /**
     * Convert Map to JSON string (simple implementation)
     */
    private static String convertMapToJson(Map<String, Object> map) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) {
                json.append(",");
            }
            first = false;
            
            json.append("\"").append(entry.getKey()).append("\":");
            
            Object value = entry.getValue();
            if (value instanceof String) {
                json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
            } else if (value instanceof Boolean || value instanceof Number) {
                json.append(value);
            } else {
                json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
            }
        }
        
        json.append("}");
        return json.toString();
    }
    
    /**
     * Read input stream to byte array
     */
    private static byte[] readInputStream(java.io.InputStream inputStream) throws IOException {
        if (inputStream == null) {
            return new byte[0];
        }
        
        java.io.ByteArrayOutputStream buffer = new java.io.ByteArrayOutputStream();
        int nRead;
        byte[] data = new byte[1024];
        
        while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        
        buffer.flush();
        return buffer.toByteArray();
    }
    
    /**
     * Response wrapper for API calls
     */
    public static class ApiResponse {
        private final int statusCode;
        private final byte[] contentBytes;
        private final String location;
        
        public ApiResponse(int statusCode, byte[] contentBytes, String location) {
            this.statusCode = statusCode;
            this.contentBytes = contentBytes;
            this.location = location;
        }
        
        public int getStatusCode() { return statusCode; }
        public byte[] getContentBytes() { return contentBytes; }
        public String getLocation() { return location; }
        
        public boolean isSuccess() { return statusCode == 200; }
        public boolean isAccepted() { return statusCode == 202; }
    }
} 