import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

/**
 * JSON to Excel Converter
 * Converts JSON data to Excel spreadsheets using PDF4Me API
 * Supports various formatting options and data transformation
 * Enhanced with async processing capabilities
 */
public class Main {
    
    // API key as in Python
    private static final String API_KEY = "ZWJhNjMwNDEtZTY4NC00YTViLWE2ZWMtYTliYjIzODEwMjEzOlV1TyU5JkxqTnJMa3AhRzdPWkR0ZVZ6Y3FaTWNpckRM";
    private static final String API_URL = "https://api-dev.pdf4me.com/api/v2/ConvertJsonToExcel";
    
    // Thread pool for async operations
    private static final ExecutorService executor = Executors.newFixedThreadPool(4);
    
    /**
     * Convert JSON file to Excel (Synchronous version)
     * @param jsonFilePath Path to the JSON file
     * @param outputPath Output Excel file path
     * @throws IOException if conversion fails
     */
    public static void convertJsonToExcel(String jsonFilePath, String outputPath) throws IOException {
        System.out.println("Starting JSON to Excel conversion process (Synchronous)...");
        System.out.println("Input JSON file: " + jsonFilePath);
        System.out.println("Output Excel file: " + outputPath);
        
        // Check if input file exists
        if (!FileUtils.fileExists(jsonFilePath)) {
            System.err.println("Error: Input file not found at " + jsonFilePath);
            return;
        }
        
        // Read and encode JSON file
        String jsonContent = FileUtils.readFileAsString(jsonFilePath);
        String jsonBase64 = FileUtils.encodeToBase64(jsonContent);
        
        System.out.println("JSON content read and encoded to Base64");
        
        // Prepare the payload for JSON to Excel conversion (match Python structure)
        Map<String, Object> payload = new HashMap<>();
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
        
        // Send the conversion request
        System.out.println("Sending JSON to Excel conversion request to PDF4Me API...");
        Pdf4MeApiClient.ApiResponse response = Pdf4MeApiClient.postWithApiKey(API_URL, API_KEY, payload);
        
        System.out.println("Initial response status code: " + response.getStatusCode());
        
        if (response.getStatusCode() == 202) {
            // 202 means "Accepted" - API is processing asynchronously
            System.out.println("Request accepted. PDF4Me is processing the JSON conversion asynchronously...");
            
            String locationUrl = response.getLocation();
            if (locationUrl == null) {
                System.err.println("No 'Location' header found in the response.");
                return;
            }
            
            System.out.println("Location header for polling: " + locationUrl);
            
            // Poll for completion
            Pdf4MeApiClient.ApiResponse finalResponse = Pdf4MeApiClient.pollForCompletionWithApiKey(locationUrl, API_KEY);
            handleSuccessfulResponse(finalResponse, outputPath);
            
        } else if (response.getStatusCode() == 200) {
            // Direct response - conversion completed immediately
            System.out.println("JSON to Excel conversion completed immediately!");
            handleSuccessfulResponse(response, outputPath);
        } else {
            // Error in initial request
            System.err.println("Initial request failed with status code: " + response.getStatusCode());
            throw new IOException("Conversion failed with status: " + response.getStatusCode());
        }
    }
    
    /**
     * Convert JSON file to Excel (Asynchronous version)
     * @param jsonFilePath Path to the JSON file
     * @param outputPath Output Excel file path
     * @param progressCallback Optional callback for progress updates
     * @return CompletableFuture that completes when conversion is done
     */
    public static CompletableFuture<Void> convertJsonToExcelAsync(String jsonFilePath, String outputPath, 
                                                                 Consumer<String> progressCallback) {
        return CompletableFuture.runAsync(() -> {
            try {
                if (progressCallback != null) {
                    progressCallback.accept("Starting async JSON to Excel conversion...");
                }
                
                System.out.println("Starting JSON to Excel conversion process (Asynchronous)...");
                System.out.println("Input JSON file: " + jsonFilePath);
                System.out.println("Output Excel file: " + outputPath);
                
                // Check if input file exists
                if (!FileUtils.fileExists(jsonFilePath)) {
                    String error = "Error: Input file not found at " + jsonFilePath;
                    System.err.println(error);
                    if (progressCallback != null) {
                        progressCallback.accept(error);
                    }
                    throw new IOException(error);
                }
                
                if (progressCallback != null) {
                    progressCallback.accept("Reading and encoding JSON file...");
                }
                
                // Read and encode JSON file
                String jsonContent = FileUtils.readFileAsString(jsonFilePath);
                String jsonBase64 = FileUtils.encodeToBase64(jsonContent);
                
                System.out.println("JSON content read and encoded to Base64");
                
                if (progressCallback != null) {
                    progressCallback.accept("Preparing API request...");
                }
                
                // Prepare the payload for JSON to Excel conversion
                Map<String, Object> payload = new HashMap<>();
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
                
                if (progressCallback != null) {
                    progressCallback.accept("Sending request to PDF4Me API...");
                }
                
                // Send the conversion request
                System.out.println("Sending JSON to Excel conversion request to PDF4Me API...");
                Pdf4MeApiClient.ApiResponse response = Pdf4MeApiClient.postWithApiKey(API_URL, API_KEY, payload);
                
                System.out.println("Initial response status code: " + response.getStatusCode());
                
                if (response.getStatusCode() == 202) {
                    // 202 means "Accepted" - API is processing asynchronously
                    System.out.println("Request accepted. PDF4Me is processing the JSON conversion asynchronously...");
                    
                    if (progressCallback != null) {
                        progressCallback.accept("Request accepted, polling for completion...");
                    }
                    
                    String locationUrl = response.getLocation();
                    if (locationUrl == null) {
                        String error = "No 'Location' header found in the response.";
                        System.err.println(error);
                        if (progressCallback != null) {
                            progressCallback.accept(error);
                        }
                        throw new IOException(error);
                    }
                    
                    System.out.println("Location header for polling: " + locationUrl);
                    
                    // Poll for completion with progress updates
                    Pdf4MeApiClient.ApiResponse finalResponse = Pdf4MeApiClient.pollForCompletionWithApiKeyAsync(
                        locationUrl, API_KEY, progressCallback);
                    handleSuccessfulResponse(finalResponse, outputPath);
                    
                    if (progressCallback != null) {
                        progressCallback.accept("Conversion completed successfully!");
                    }
                    
                } else if (response.getStatusCode() == 200) {
                    // Direct response - conversion completed immediately
                    System.out.println("JSON to Excel conversion completed immediately!");
                    if (progressCallback != null) {
                        progressCallback.accept("Conversion completed immediately!");
                    }
                    handleSuccessfulResponse(response, outputPath);
                } else {
                    // Error in initial request
                    String error = "Initial request failed with status code: " + response.getStatusCode();
                    System.err.println(error);
                    if (progressCallback != null) {
                        progressCallback.accept(error);
                    }
                    throw new IOException("Conversion failed with status: " + response.getStatusCode());
                }
                
            } catch (Exception e) {
                String error = "Async conversion failed: " + e.getMessage();
                System.err.println(error);
                if (progressCallback != null) {
                    progressCallback.accept(error);
                }
                throw new RuntimeException(e);
            }
        }, executor);
    }
    
    /**
     * Convert JSON string to Excel (Synchronous version)
     * @param jsonContent JSON content as string
     * @param outputPath Output Excel file path
     * @throws IOException if conversion fails
     */
    public static void convertJsonStringToExcel(String jsonContent, String outputPath) throws IOException {
        System.out.println("Starting JSON string to Excel conversion process (Synchronous)...");
        System.out.println("Output Excel file: " + outputPath);
        
        // Encode JSON content
        String jsonBase64 = FileUtils.encodeToBase64(jsonContent);
        
        System.out.println("JSON content encoded to Base64");
        
        // Prepare the payload for JSON to Excel conversion (match Python structure)
        Map<String, Object> payload = new HashMap<>();
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
        
        // Send the conversion request
        System.out.println("Sending JSON to Excel conversion request to PDF4Me API...");
        Pdf4MeApiClient.ApiResponse response = Pdf4MeApiClient.postWithApiKey(API_URL, API_KEY, payload);
        
        System.out.println("Initial response status code: " + response.getStatusCode());
        
        if (response.getStatusCode() == 202) {
            // 202 means "Accepted" - API is processing asynchronously
            System.out.println("Request accepted. PDF4Me is processing the JSON conversion asynchronously...");
            
            String locationUrl = response.getLocation();
            if (locationUrl == null) {
                System.err.println("No 'Location' header found in the response.");
                return;
            }
            
            System.out.println("Location header for polling: " + locationUrl);
            
            // Poll for completion
            Pdf4MeApiClient.ApiResponse finalResponse = Pdf4MeApiClient.pollForCompletionWithApiKey(locationUrl, API_KEY);
            handleSuccessfulResponse(finalResponse, outputPath);
            
        } else if (response.getStatusCode() == 200) {
            // Direct response - conversion completed immediately
            System.out.println("JSON to Excel conversion completed immediately!");
            handleSuccessfulResponse(response, outputPath);
        } else {
            // Error in initial request
            System.err.println("Initial request failed with status code: " + response.getStatusCode());
            throw new IOException("Conversion failed with status: " + response.getStatusCode());
        }
    }
    
    /**
     * Convert JSON string to Excel (Asynchronous version)
     * @param jsonContent JSON content as string
     * @param outputPath Output Excel file path
     * @param progressCallback Optional callback for progress updates
     * @return CompletableFuture that completes when conversion is done
     */
    public static CompletableFuture<Void> convertJsonStringToExcelAsync(String jsonContent, String outputPath,
                                                                       Consumer<String> progressCallback) {
        return CompletableFuture.runAsync(() -> {
            try {
                if (progressCallback != null) {
                    progressCallback.accept("Starting async JSON string to Excel conversion...");
                }
                
                System.out.println("Starting JSON string to Excel conversion process (Asynchronous)...");
                System.out.println("Output Excel file: " + outputPath);
                
                if (progressCallback != null) {
                    progressCallback.accept("Encoding JSON content...");
                }
                
                // Encode JSON content
                String jsonBase64 = FileUtils.encodeToBase64(jsonContent);
                
                System.out.println("JSON content encoded to Base64");
                
                if (progressCallback != null) {
                    progressCallback.accept("Preparing API request...");
                }
                
                // Prepare the payload for JSON to Excel conversion
                Map<String, Object> payload = new HashMap<>();
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
                
                if (progressCallback != null) {
                    progressCallback.accept("Sending request to PDF4Me API...");
                }
                
                // Send the conversion request
                System.out.println("Sending JSON to Excel conversion request to PDF4Me API...");
                Pdf4MeApiClient.ApiResponse response = Pdf4MeApiClient.postWithApiKey(API_URL, API_KEY, payload);
                
                System.out.println("Initial response status code: " + response.getStatusCode());
                
                if (response.getStatusCode() == 202) {
                    // 202 means "Accepted" - API is processing asynchronously
                    System.out.println("Request accepted. PDF4Me is processing the JSON conversion asynchronously...");
                    
                    if (progressCallback != null) {
                        progressCallback.accept("Request accepted, polling for completion...");
                    }
                    
                    String locationUrl = response.getLocation();
                    if (locationUrl == null) {
                        String error = "No 'Location' header found in the response.";
                        System.err.println(error);
                        if (progressCallback != null) {
                            progressCallback.accept(error);
                        }
                        throw new IOException(error);
                    }
                    
                    System.out.println("Location header for polling: " + locationUrl);
                    
                    // Poll for completion with progress updates
                    Pdf4MeApiClient.ApiResponse finalResponse = Pdf4MeApiClient.pollForCompletionWithApiKeyAsync(
                        locationUrl, API_KEY, progressCallback);
                    handleSuccessfulResponse(finalResponse, outputPath);
                    
                    if (progressCallback != null) {
                        progressCallback.accept("Conversion completed successfully!");
                    }
                    
                } else if (response.getStatusCode() == 200) {
                    // Direct response - conversion completed immediately
                    System.out.println("JSON to Excel conversion completed immediately!");
                    if (progressCallback != null) {
                        progressCallback.accept("Conversion completed immediately!");
                    }
                    handleSuccessfulResponse(response, outputPath);
                } else {
                    // Error in initial request
                    String error = "Initial request failed with status code: " + response.getStatusCode();
                    System.err.println(error);
                    if (progressCallback != null) {
                        progressCallback.accept(error);
                    }
                    throw new IOException("Conversion failed with status: " + response.getStatusCode());
                }
                
            } catch (Exception e) {
                String error = "Async conversion failed: " + e.getMessage();
                System.err.println(error);
                if (progressCallback != null) {
                    progressCallback.accept(error);
                }
                throw new RuntimeException(e);
            }
        }, executor);
    }
    
    /**
     * Handle successful API response and save the Excel file
     */
    private static void handleSuccessfulResponse(Pdf4MeApiClient.ApiResponse response, String outputPath) throws IOException {
        byte[] content = response.getContentBytes();
        
        if (content != null && content.length > 0) {
            // Save the Excel file
            FileUtils.writeBytesToFile(outputPath, content);
            
            System.out.println("Excel file saved successfully to: " + outputPath);
            System.out.println("JSON data has been converted to Excel format");
            System.out.println("File size: " + content.length + " bytes");
        } else {
            throw new IOException("Empty response received from API");
        }
    }

    /**
     * Main method - entry point for the application
     * Uses the Main class to convert JSON data to Excel format
     * Demonstrates both synchronous and asynchronous approaches
     */
    public static void main(String[] args) {
        System.out.println("JSON to Excel Converter (Enhanced with Async Support)");
        System.out.println("=".repeat(60));
        
        String jsonFilePath = "sample.json";
        String outputPath = "JSON_to_EXCEL_output.xlsx";
        String asyncOutputPath = "JSON_to_EXCEL_output_async.xlsx";
        
        try {
            // Check if sample.json exists
            if (Main.class.getResource("/" + jsonFilePath) != null || 
                new java.io.File(jsonFilePath).exists()) {
                
                System.out.println("Using existing sample.json file");
                
                // Test synchronous conversion
                System.out.println("\n--- Testing Synchronous Conversion ---");
                convertJsonToExcel(jsonFilePath, outputPath);
                
                // Test asynchronous conversion
                System.out.println("\n--- Testing Asynchronous Conversion ---");
                Consumer<String> progressCallback = message -> {
                    System.out.println("Progress: " + message);
                };
                
                CompletableFuture<Void> asyncFuture = convertJsonToExcelAsync(jsonFilePath, asyncOutputPath, progressCallback);
                
                // Wait for async completion
                asyncFuture.get(5, TimeUnit.MINUTES); // 5 minute timeout
                
            } else {
                System.out.println("Sample file not found, using built-in sample data");
                
                // Create sample JSON data for testing
                String sampleJson = """
                    [
                        {"name": "John Doe", "age": 30, "city": "New York", "salary": 75000, "department": "Engineering"},
                        {"name": "Jane Smith", "age": 25, "city": "Los Angeles", "salary": 65000, "department": "Marketing"},
                        {"name": "Bob Johnson", "age": 35, "city": "Chicago", "salary": 80000, "department": "Sales"},
                        {"name": "Alice Brown", "age": 28, "city": "Houston", "salary": 70000, "department": "HR"},
                        {"name": "Charlie Wilson", "age": 32, "city": "Phoenix", "salary": 72000, "department": "Engineering"}
                    ]
                    """;
                
                // Test synchronous conversion
                System.out.println("\n--- Testing Synchronous Conversion ---");
                convertJsonStringToExcel(sampleJson, outputPath);
                
                // Test asynchronous conversion
                System.out.println("\n--- Testing Asynchronous Conversion ---");
                Consumer<String> progressCallback = message -> {
                    System.out.println("Progress: " + message);
                };
                
                CompletableFuture<Void> asyncFuture = convertJsonStringToExcelAsync(sampleJson, asyncOutputPath, progressCallback);
                
                // Wait for async completion
                asyncFuture.get(5, TimeUnit.MINUTES); // 5 minute timeout
            }
            
            System.out.println("\n✅ All conversions completed successfully!");
            System.out.println("📁 Synchronous output file: " + outputPath);
            System.out.println("📁 Asynchronous output file: " + asyncOutputPath);
            
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
}

// Utility class for file operations
class FileUtils {
    public static String readFileAsString(String filePath) throws IOException {
        System.out.println("Reading file: " + filePath);
        Path path = Paths.get(filePath);
        return Files.readString(path, StandardCharsets.UTF_8);
    }
    public static byte[] readFileAsBytes(String filePath) throws IOException {
        System.out.println("Reading file as bytes: " + filePath);
        Path path = Paths.get(filePath);
        return Files.readAllBytes(path);
    }
    public static void writeBytesToFile(String filePath, byte[] content) throws IOException {
        System.out.println("Writing bytes to file: " + filePath);
        Path path = Paths.get(filePath);
        Files.write(path, content);
    }
    public static String encodeToBase64(String content) {
        return Base64.getEncoder().encodeToString(content.getBytes(StandardCharsets.UTF_8));
    }
    public static String encodeToBase64(byte[] content) {
        return Base64.getEncoder().encodeToString(content);
    }
    public static byte[] decodeFromBase64(String base64String) {
        return Base64.getDecoder().decode(base64String);
    }
    public static boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }
}

// Common API client for PDF4Me API interactions
class Pdf4MeApiClient {
    private static final int MAX_RETRIES = 10;
    private static final int RETRY_DELAY_SECONDS = 10;
    
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
     * Async version of polling with progress callback support
     * @param pollingUrl URL to poll for completion
     * @param apiKey API key for authentication
     * @param progressCallback Optional callback for progress updates
     * @return ApiResponse when operation completes
     * @throws IOException if polling fails
     */
    public static ApiResponse pollForCompletionWithApiKeyAsync(String pollingUrl, String apiKey, 
                                                              Consumer<String> progressCallback) throws IOException {
        System.out.println("Starting async polling for completion at: " + pollingUrl);
        
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            if (progressCallback != null) {
                progressCallback.accept("Polling attempt " + attempt + "/" + MAX_RETRIES);
            }
            
            System.out.println("Polling attempt " + attempt + "/" + MAX_RETRIES);
            
            try {
                Thread.sleep(RETRY_DELAY_SECONDS * 1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("Polling interrupted", e);
            }
            
            ApiResponse response = getWithApiKey(pollingUrl, apiKey);
            
            if (response.getStatusCode() == 200) {
                if (progressCallback != null) {
                    progressCallback.accept("Operation completed successfully");
                }
                System.out.println("Operation completed successfully");
                return response;
            } else if (response.getStatusCode() == 202) {
                if (progressCallback != null) {
                    progressCallback.accept("Operation still in progress, continuing to poll...");
                }
                System.out.println("Operation still in progress, continuing to poll...");
                continue;
            } else {
                String error = "Unexpected status code during polling: " + response.getStatusCode();
                System.err.println(error);
                if (progressCallback != null) {
                    progressCallback.accept(error);
                }
                throw new IOException("Polling failed with status: " + response.getStatusCode());
            }
        }
        
        String timeoutError = "Operation timed out after " + MAX_RETRIES + " attempts";
        if (progressCallback != null) {
            progressCallback.accept(timeoutError);
        }
        throw new IOException(timeoutError);
    }
    
    public static ApiResponse getWithApiKey(String url, String apiKey) throws IOException {
        java.net.URL apiUrl = new java.net.URL(url);
        java.net.HttpURLConnection connection = (java.net.HttpURLConnection) apiUrl.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Authorization", "Basic " + apiKey);
        int statusCode = connection.getResponseCode();
        byte[] contentBytes = readInputStream(connection.getInputStream());
        return new ApiResponse(statusCode, contentBytes, null);
    }
    
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