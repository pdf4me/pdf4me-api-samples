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
        System.out.println("Adding image watermark to image...");
        String inputImagePath = "Image/Add Image watermark To Image/java/AddImageWatermarkToImage/sample_image.jpg";
        String watermarkImagePath = "Image/Add Image watermark To Image/java/AddImageWatermarkToImage/pdf4me.png";
        String outputImagePath = "Image/Add Image watermark To Image/java/AddImageWatermarkToImage/Add_image_watermark_to_image_output.jpg";
        addImageWatermarkToImage(inputImagePath, watermarkImagePath, outputImagePath);
    }

    public static void addImageWatermarkToImage(String inputImagePath, String watermarkImagePath, String outputImagePath) {
        try {
            Path imgPath = Paths.get(inputImagePath);
            Path watermarkPath = Paths.get(watermarkImagePath);
            if (!Files.exists(imgPath)) {
                System.out.println("Error: Image file not found at " + inputImagePath);
                return;
            }
            if (!Files.exists(watermarkPath)) {
                System.out.println("Error: Watermark image file not found at " + watermarkImagePath);
                return;
            }
            byte[] imgBytes = Files.readAllBytes(imgPath);
            String imgBase64 = Base64.getEncoder().encodeToString(imgBytes);
            byte[] watermarkBytes = Files.readAllBytes(watermarkPath);
            String watermarkBase64 = Base64.getEncoder().encodeToString(watermarkBytes);
            String payload = String.format("{\"docName\":\"%s\",\"docContent\":\"%s\",\"WatermarkFileName\":\"%s\",\"WatermarkFileContent\":\"%s\",\"Position\":\"topright\",\"Opacity\":1,\"HorizontalOffset\":0,\"VerticalOffset\":0,\"PositionX\":0.0,\"PositionY\":0.0,\"Rotation\":0.0,\"async\":true}", imgPath.getFileName(), imgBase64, watermarkPath.getFileName(), watermarkBase64);
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/AddImageWatermarkToImage"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            System.out.println("Sending image watermark request to PDF4me API...");
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            System.out.println("Response Status Code: " + response.statusCode());
            if (response.statusCode() == 200) {
                Files.write(Paths.get(outputImagePath), response.body());
                System.out.println("✓ Success! Image watermark addition completed!");
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
                        System.out.println("✓ Success! Image watermark addition completed!");
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