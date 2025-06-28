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
        System.out.println("Adding text watermark to image...");
        String inputImagePath = "Image/Add Text watermark To Image/java/AddTextWatermarkToImage/sample_image.jpg";
        String outputImagePath = "Image/Add Text watermark To Image/java/AddTextWatermarkToImage/Add_text_watermark_to_image_output.jpg";
        addTextWatermarkToImage(inputImagePath, outputImagePath);
    }

    public static void addTextWatermarkToImage(String inputImagePath, String outputImagePath) {
        try {
            Path imgPath = Paths.get(inputImagePath);
            if (!Files.exists(imgPath)) {
                System.out.println("Error: Image file not found at " + inputImagePath);
                return;
            }
            byte[] imgBytes = Files.readAllBytes(imgPath);
            String imgBase64 = Base64.getEncoder().encodeToString(imgBytes);
            String payload = "{" +
                "\"docName\":\"" + imgPath.getFileName() + "\"," +
                "\"docContent\":\"" + imgBase64 + "\"," +
                "\"WatermarkText\":\"PDF4me Sample Text\"," +
                "\"TextPosition\":\"bottomleft\"," +
                "\"TextFontFamily\":\"Arial\"," +
                "\"TextFontSize\":50," +
                "\"TextColour\":\"#b4351a\"," +
                "\"IsBold\":true," +
                "\"IsUnderline\":false," +
                "\"IsItalic\":true," +
                "\"Opacity\":1.0," +
                "\"RotationAngle\":0.0," +
                "\"PositionX\":272.0," +
                "\"PositionY\":0.0," +
                "\"async\":true}";
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/AddTextWatermarkToImage"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            System.out.println("Sending text watermark request to PDF4me API...");
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            System.out.println("Response Status Code: " + response.statusCode());
            if (response.statusCode() == 200) {
                Files.write(Paths.get(outputImagePath), response.body());
                System.out.println("✓ Success! Text watermark addition completed!");
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
                        System.out.println("✓ Success! Text watermark addition completed!");
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