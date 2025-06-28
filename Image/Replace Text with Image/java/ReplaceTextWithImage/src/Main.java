import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.*;
import java.util.Base64;

public class Main {
    private static final String API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        System.out.println("Replacing text with image in PDF...");
        String inputPdfPath = "Image/Replace Text with Image/java/ReplaceTextWithImage/sample.pdf";
        String imagePath = "Image/Replace Text with Image/java/ReplaceTextWithImage/sample.png";
        String replaceText = "PDF4ME";
        String outputPdfPath = inputPdfPath.replace(".pdf", ".replaced.pdf");
        replaceTextWithImage(inputPdfPath, imagePath, replaceText, outputPdfPath);
    }

    public static void replaceTextWithImage(String inputPdfPath, String imagePath, String replaceText, String outputPdfPath) {
        try {
            Path pdfPath = Paths.get(inputPdfPath);
            Path imgPath = Paths.get(imagePath);
            if (!Files.exists(pdfPath)) {
                System.out.println("Error: PDF file not found at " + inputPdfPath);
                return;
            }
            if (!Files.exists(imgPath)) {
                System.out.println("Error: Image file not found at " + imagePath);
                return;
            }
            byte[] pdfBytes = Files.readAllBytes(pdfPath);
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            byte[] imgBytes = Files.readAllBytes(imgPath);
            String imgBase64 = Base64.getEncoder().encodeToString(imgBytes);
            String payload = String.format("{\"docContent\":\"%s\",\"docName\":\"output.pdf\",\"replaceText\":\"%s\",\"pageSequence\":\"all\",\"imageContent\":\"%s\",\"imageHeight\":10,\"imageWidth\":10,\"async\":true}", pdfBase64, replaceText, imgBase64);
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/ReplaceTextWithImage"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            System.out.println("Sending replace text with image request to PDF4me API...");
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            System.out.println("Response Status Code: " + response.statusCode());
            if (response.statusCode() == 200) {
                Files.write(Paths.get(outputPdfPath), response.body());
                System.out.println("✓ Success! Text replaced with image in PDF.");
                System.out.println("Output PDF saved: " + outputPdfPath);
                return;
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("Error: No polling URL found in response");
                    return;
                }
                int maxRetries = 10;
                int retryDelay = 10;
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    System.out.println("Checking status... (Attempt " + (attempt + 1) + "/" + maxRetries + ")");
                    Thread.sleep(retryDelay * 1000);
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();
                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                    if (pollResponse.statusCode() == 200) {
                        Files.write(Paths.get(outputPdfPath), pollResponse.body());
                        System.out.println("✓ Success! Text replaced with image in PDF.");
                        System.out.println("Output PDF saved: " + outputPdfPath);
                        return;
                    } else if (pollResponse.statusCode() == 202) {
                        System.out.println("Still processing (202)...");
                        continue;
                    } else {
                        System.out.println("Error during processing: " + pollResponse.statusCode() + " - " + new String(pollResponse.body()));
                        return;
                    }
                }
                System.out.println("Timeout: Processing did not complete after multiple retries");
            } else {
                System.out.println("Error: " + response.statusCode() + " - " + new String(response.body()));
            }
        } catch (Exception ex) {
            System.err.println("Error: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
} 