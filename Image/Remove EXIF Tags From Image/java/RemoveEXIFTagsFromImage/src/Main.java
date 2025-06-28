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
        System.out.println("Removing EXIF tags from image...");
        String inputImagePath = "Image/Remove EXIF Tags From Image/java/RemoveEXIFTagsFromImage/sample.jpg";
        String outputImagePath = inputImagePath.replace(".jpg", ".noexif.jpg");
        removeExifTags(inputImagePath, outputImagePath);
    }

    public static void removeExifTags(String inputImagePath, String outputImagePath) {
        try {
            Path imgPath = Paths.get(inputImagePath);
            if (!Files.exists(imgPath)) {
                System.out.println("Error: Image file not found at " + inputImagePath);
                return;
            }
            byte[] imgBytes = Files.readAllBytes(imgPath);
            String imgBase64 = Base64.getEncoder().encodeToString(imgBytes);
            String docName = imgPath.getFileName().toString();
            String imageType = getImageTypeFromExtension(inputImagePath);
            String payload = String.format("{\"docContent\":\"%s\",\"docName\":\"%s\",\"imageType\":\"%s\",\"async\":true}", imgBase64, docName, imageType);
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/RemoveEXIFTagsFromImage"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            System.out.println("Sending remove EXIF tags request to PDF4me API...");
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            System.out.println("Response Status Code: " + response.statusCode());
            if (response.statusCode() == 200) {
                Files.write(Paths.get(outputImagePath), response.body());
                System.out.println("✓ Success! EXIF tags removed from image.");
                System.out.println("Output image saved: " + outputImagePath);
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
                        System.out.println("✓ Success! EXIF tags removed from image.");
                        System.out.println("Output image saved: " + outputImagePath);
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

    private static String getImageTypeFromExtension(String filePath) {
        String ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
        switch (ext) {
            case ".jpg":
            case ".jpeg":
                return "JPG";
            case ".png":
                return "PNG";
            case ".gif":
                return "GIF";
            case ".bmp":
                return "BMP";
            case ".tiff":
            case ".tif":
                return "TIFF";
            case ".webp":
                return "WEBP";
            default:
                return "JPG";
        }
    }
} 