import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.Base64;

public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        String pdfPath = "sample.pdf";
        System.out.println("=== Finding and Replacing Text in PDF Document ===");
        try {
            String result = findReplaceText(pdfPath);
            if (result != null && !result.isEmpty()) {
                System.out.println("Modified PDF saved to: " + result);
            } else {
                System.out.println("Find and Replace Text operation failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static String findReplaceText(String inputPdfPath) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return null;
            }
            String outputFileName = Paths.get(inputPdfPath).getFileName().toString().replaceFirst("[.][^.]+$", "") + ".modified.pdf";
            String outputPdfPath = Paths.get(System.getProperty("user.dir"), outputFileName).toString();
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            String jsonPayload = "{\"docContent\":\"" + pdfBase64 + "\",\"docName\":\"sample.pdf\",\"oldText\":\"Sample\",\"newText\":\"new Sample\",\"pageSequence\":\"1\"}";
            return executeFindReplace(jsonPayload, outputPdfPath);
        } catch (Exception ex) {
            System.err.println("Error in findReplaceText: " + ex.getMessage());
            return null;
        }
    }

    private static String executeFindReplace(String jsonPayload, String outputPdfPath) {
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/FindAndReplace"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                Files.write(Paths.get(outputPdfPath), response.body());
                return outputPdfPath;
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("No 'Location' header found in the response.");
                    return null;
                }
                for (int attempt = 0; attempt < 10; attempt++) {
                    Thread.sleep(10000);
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();
                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                    if (pollResponse.statusCode() == 200) {
                        Files.write(Paths.get(outputPdfPath), pollResponse.body());
                        return outputPdfPath;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        return null;
                    }
                }
                System.out.println("Timeout: Find and Replace Text operation did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeFindReplace: " + ex.getMessage());
            return null;
        }
    }
} 