import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;

/**
 * Main program class for PDF barcode splitting functionality
 * This program demonstrates how to split PDF files by Swiss QR barcode using the PDF4Me API
 */
public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    
    /**
     * Main entry point of the application
     * @param args Command line arguments (not used in this example)
     */
    public static void main(String[] args) {
        String pdfPath = "sample.pdf";
        System.out.println("=== Splitting PDF by QR Code Barcode ===");
        try {
            String result = splitPdfByBarcode(pdfPath, "hello", "startsWith", "qrcode", "before", true, "1");
            if (result != null && !result.isEmpty()) {
                System.out.println("Split PDFs saved to: " + result);
            } else {
                System.out.println("PDF splitting by barcode failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Splits PDF by Swiss QR barcode using the PDF4Me API
     * @param inputPdfPath Path to the input PDF file
     * @param barcodeString The barcode string to search for
     * @param barcodeFilter Filter type for barcode matching (e.g., "startsWith", "contains", "equals")
     * @param barcodeType Type of barcode (e.g., "qrcode", "code128", "code39")
     * @param splitBarcodePage Where to split relative to barcode ("before", "after")
     * @param combinePagesWithSameConsecutiveBarcodes Whether to combine pages with same consecutive barcodes
     * @param pdfRenderDpi DPI for PDF rendering
     * @return Path to the split PDF files archive, or null if splitting failed
     */
    public static String splitPdfByBarcode(String inputPdfPath, String barcodeString, String barcodeFilter, 
                                          String barcodeType, String splitBarcodePage, 
                                          boolean combinePagesWithSameConsecutiveBarcodes, String pdfRenderDpi) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return null;
            }
            
            String outputFileName = "swiss_qr_split_result.zip";
            String outputPath = Paths.get(System.getProperty("user.dir"), outputFileName).toString();
            
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            
            String payload = "{" +
                "\"docContent\":\"" + pdfBase64 + "\"," +
                "\"docName\":\"output.pdf\"," +
                "\"barcodeString\":\"" + barcodeString + "\"," +
                "\"barcodeFilter\":\"" + barcodeFilter + "\"," +
                "\"barcodeType\":\"" + barcodeType + "\"," +
                "\"splitBarcodePage\":\"" + splitBarcodePage + "\"," +
                "\"combinePagesWithSameConsecutiveBarcodes\":" + combinePagesWithSameConsecutiveBarcodes + "," +
                "\"pdfRenderDpi\":\"" + pdfRenderDpi + "\"," +
                "\"async\":true}";
            
            return executeBarcodeSplit(payload, outputPath);
        } catch (Exception ex) {
            System.err.println("Error in splitPdfByBarcode: " + ex.getMessage());
            return null;
        }
    }

    /**
     * Executes the PDF splitting by Swiss QR barcode operation
     * @param payload API request payload
     * @param outputPath Path where the split PDF archive will be saved
     * @return Path to the split PDF files archive, or null if splitting failed
     */
    private static String executeBarcodeSplit(String payload, String outputPath) {
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/SplitPdfByBarcode_old"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            
            if (response.statusCode() == 200) {
                byte[] resultBytes = response.body();
                Files.write(Paths.get(outputPath), resultBytes);
                return outputPath;
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("No 'Location' header found in the response.");
                    return null;
                }
                
                int maxRetries = 10;
                int retryDelay = 10; // seconds
                
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    Thread.sleep(retryDelay * 1000);
                    
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();
                    
                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                    
                    if (pollResponse.statusCode() == 200) {
                        byte[] resultBytes = pollResponse.body();
                        Files.write(Paths.get(outputPath), resultBytes);
                        return outputPath;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body()));
                        return null;
                    }
                }
                
                System.out.println("Timeout: PDF splitting by barcode did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body()));
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeBarcodeSplit: " + ex.getMessage());
            return null;
        }
    }
} 