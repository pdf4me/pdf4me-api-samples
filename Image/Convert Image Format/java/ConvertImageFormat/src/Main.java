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
        System.out.println("Converting image format...");
        String inputImagePath = "Image/Convert Image Format/java/ConvertImageFormat/sample_image.jpg";
        String outputImagePath = "Image/Convert Image Format/java/ConvertImageFormat/Convert_image_format_output.png";
        convertImageFormat(inputImagePath, outputImagePath);
    }

    public static void convertImageFormat(String inputImagePath, String outputImagePath) {
        try {
            Path imgPath = Paths.get(inputImagePath);
            if (!Files.exists(imgPath)) {
                System.out.println("Error: Image file not found at " + inputImagePath);
                return;
            }
            byte[] imgBytes = Files.readAllBytes(imgPath);
            String imgBase64 = Base64.getEncoder().encodeToString(imgBytes);
            String payload = "{" +
                "\"docContent\":\"" + imgBase64 + "\"," +
                "\"docName\":\"" + imgPath.getFileName() + "\"," +
                "\"currentImageFormat\":\"JPG\"," +
                "\"newImageFormat\":\"PNG\"," +
                "\"async\":true}";
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/ConvertImageFormat"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            System.out.println("Sending image format conversion request to PDF4me API...");
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            System.out.println("Response Status Code: " + response.statusCode());
            if (response.statusCode() == 200) {
                Files.write(Paths.get(outputImagePath), response.body());
                System.out.println("✓ Success! Image format conversion completed!");
                System.out.println("File saved: " + outputImagePath);
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
                        Files.write(Paths.get(outputImagePath), pollResponse.body());
                        System.out.println("✓ Success! Image format conversion completed!");
                        System.out.println("File saved: " + outputImagePath);
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