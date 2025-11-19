import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.Base64;

public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        String pdfPath = "sample.pdf";
        System.out.println("=== Creating Swiss QR Bill ===");
        try {
            String result = createSwissQrBill(pdfPath);
            if (result != null && !result.isEmpty()) {
                System.out.println("Swiss QR Bill saved to: " + result);
            } else {
                System.out.println("Swiss QR Bill creation failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static String createSwissQrBill(String inputPdfPath) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return null;
            }
            
            String outputPdfPath = inputPdfPath.replace(".pdf", ".swissqr.pdf");
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64);
            payload.put("docName", "test.pdf");
            payload.put("iban", "CH0200700110003765824");
            payload.put("crName", "Test AG");
            payload.put("crAddressType", "S");
            payload.put("crStreetOrAddressLine1", "Test Strasse");
            payload.put("crStreetOrAddressLine2", "1");
            payload.put("crPostalCode", "8000");
            payload.put("crCity", "Zurich");
            payload.put("amount", "1000");
            payload.put("currency", "CHF");
            payload.put("udName", "Test Debt AG");
            payload.put("udAddressType", "S");
            payload.put("udStreetOrAddressLine1", "Test Deb Strasse");
            payload.put("udStreetOrAddressLine2", "2");
            payload.put("udPostalCode", "8000");
            payload.put("udCity", "Zurich");
            payload.put("referenceType", "NON");
            payload.put("languageType", "English");
            payload.put("seperatorLine", "LineWithScissor");
            payload.put("async", true);
            
            return executeSwissQrBillCreation(payload, outputPdfPath);
        } catch (Exception ex) {
            System.err.println("Error in createSwissQrBill: " + ex.getMessage());
            return null;
        }
    }

    private static String executeSwissQrBillCreation(Map<String, Object> payload, String outputPdfPath) {
        try {
            String jsonPayload = convertToJson(payload);
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/CreateSwissQrBill"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() == 200) {
                byte[] resultBytes = response.body();
                Files.write(Paths.get(outputPdfPath), resultBytes);
                return outputPdfPath;
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("No 'Location' header found in the response.");
                    return null;
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
                        byte[] resultBytes = pollResponse.body();
                        Files.write(Paths.get(outputPdfPath), resultBytes);
                        return outputPdfPath;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return null;
                    }
                }
                
                System.out.println("Timeout: Swiss QR Bill creation did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeSwissQrBillCreation: " + ex.getMessage());
            return null;
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
            } else if (value instanceof Boolean) {
                json.append(value);
            } else {
                json.append("\"").append(value).append("\"");
            }
        }
        json.append("}");
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