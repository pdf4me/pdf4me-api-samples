import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.*;
import java.util.*;
import java.util.Base64;

public class Main {
    private static final String API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        System.out.println("=== Splitting PDF by Swiss QR ===");
        try {
            String inputPdfPath = "sample.pdf";
            String outputDir = inputPdfPath.replace(".pdf", "_swiss_qr_split_output");
            splitPdfBySwissQR(inputPdfPath, outputDir,
                "hello", // barcodeString
                "startsWith", // barcodeFilter
                "qrcode", // barcodeType
                "before", // splitBarcodePage
                true, // combinePagesWithSameConsecutiveBarcodes
                "1" // pdfRenderDpi
            );
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void splitPdfBySwissQR(String inputPdfPath, String outputFolder, String barcodeString, String barcodeFilter, String barcodeType, String splitBarcodePage, boolean combinePagesWithSameConsecutiveBarcodes, String pdfRenderDpi) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return;
            }
            Path outputDir = Paths.get(outputFolder);
            System.out.println("[DEBUG] Output directory (relative): " + outputDir);
            System.out.println("[DEBUG] Output directory (absolute): " + outputDir.toAbsolutePath());
            if (!Files.exists(outputDir)) {
                Files.createDirectories(outputDir);
            }
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64);
            payload.put("docName", "output.pdf");
            payload.put("barcodeString", barcodeString);
            payload.put("barcodeFilter", barcodeFilter);
            payload.put("barcodeType", barcodeType);
            payload.put("splitBarcodePage", splitBarcodePage);
            payload.put("combinePagesWithSameConsecutiveBarcodes", combinePagesWithSameConsecutiveBarcodes);
            payload.put("pdfRenderDpi", pdfRenderDpi);
            payload.put("async", true);
            executeSplitBySwissQR(payload, outputDir);
        } catch (Exception ex) {
            System.err.println("Error in splitPdfBySwissQR: " + ex.getMessage());
        }
    }

    private static void executeSplitBySwissQR(Map<String, Object> payload, Path outputDir) {
        try {
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/SplitPdfByBarcode_old"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                saveZipResult(response.body(), outputDir, "swiss_qr_split_result.zip");
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("No 'Location' header found in the response.");
                    return;
                }
                int maxRetries = 10;
                int retryDelay = 10;
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    Thread.sleep(retryDelay * 1000);
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();
                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                    if (pollResponse.statusCode() == 200) {
                        saveZipResult(pollResponse.body(), outputDir, "swiss_qr_split_result.zip");
                        return;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body()));
                        return;
                    }
                }
                System.out.println("Timeout: Split by Swiss QR did not complete after multiple retries.");
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body()));
            }
        } catch (Exception ex) {
            System.err.println("Error in executeSplitBySwissQR: " + ex.getMessage());
        }
    }

    private static void saveZipResult(byte[] responseBody, Path outputDir, String zipFileName) {
        try {
            if (!Files.exists(outputDir)) {
                Files.createDirectories(outputDir);
            }
            Path outPath = outputDir.resolve(zipFileName);
            System.out.println("[DEBUG] Output zip file (relative): " + outPath);
            System.out.println("[DEBUG] Output zip file (absolute): " + outPath.toAbsolutePath());
            Files.write(outPath, responseBody);
            System.out.println("Split by Swiss QR zip saved: " + outPath.toAbsolutePath());
        } catch (Exception ex) {
            System.err.println("Error in saveZipResult: " + ex.getMessage());
        }
    }

    private static String convertToJson(Map<String, Object> map) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) json.append(",");
            first = false;
            json.append("\"").append(entry.getKey()).append("\":");
            Object value = entry.getValue();
            if (value instanceof String) {
                json.append("\"").append(escapeJsonString((String) value)).append("\"");
            } else if (value instanceof List) {
                json.append(convertListToJson((List<?>) value));
            } else if (value instanceof Boolean) {
                json.append(value);
            } else {
                json.append("\"").append(value).append("\"");
            }
        }
        json.append("}");
        return json.toString();
    }

    private static String convertListToJson(List<?> list) {
        StringBuilder json = new StringBuilder("[");
        boolean first = true;
        for (Object item : list) {
            if (!first) json.append(",");
            first = false;
            if (item instanceof Map) {
                json.append(convertToJson((Map<String, Object>) item));
            } else if (item instanceof String) {
                json.append("\"").append(escapeJsonString((String) item)).append("\"");
            } else {
                json.append("\"").append(item).append("\"");
            }
        }
        json.append("]");
        return json.toString();
    }

    private static String escapeJsonString(String str) {
        return str.replace("\\", "\\\\")
                 .replace("\"", "\\\"")
                 .replace("\b", "\\b")
                 .replace("\f", "\\f")
                 .replace("\n", "\\n")
                 .replace("\r", "\\r")
                 .replace("\t", "\\t");
    }
} 