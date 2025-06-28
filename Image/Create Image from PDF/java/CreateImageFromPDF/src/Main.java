import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.*;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.core.type.TypeReference;

public class Main {
    private static final String API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static void main(String[] args) {
        System.out.println("Creating images from PDF...");
        String inputPdfPath = "Image/Create Image from PDF/java/CreateImageFromPDF/sample.pdf";
        String outputFolder = "Image/Create Image from PDF/java/CreateImageFromPDF/PDF_to_Images_outputs";
        createImagesFromPdf(inputPdfPath, outputFolder);
    }

    public static void createImagesFromPdf(String inputPdfPath, String outputFolder) {
        try {
            Path pdfPath = Paths.get(inputPdfPath);
            if (!Files.exists(pdfPath)) {
                System.out.println("Error: PDF file not found at " + inputPdfPath);
                return;
            }
            byte[] pdfBytes = Files.readAllBytes(pdfPath);
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            String payload = "{" +
                "\"docContent\":\"" + pdfBase64 + "\"," +
                "\"docname\":\"" + pdfPath.getFileName() + "\"," +
                "\"imageAction\":{\"WidthPixel\":\"800\",\"ImageExtension\":\"jpeg\",\"PageSelection\":{\"PageNrs\":[1,2,3]}}," +
                "\"pageNrs\":\"1-2\"," +
                "\"async\":true}";
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/CreateImages"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
            System.out.println("Sending PDF to image conversion request to PDF4me API...");
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            System.out.println("Response Status Code: " + response.statusCode());
            if (response.statusCode() == 200) {
                saveImagesFromResponse(response.body(), outputFolder);
                return;
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("Error: No polling URL found in response");
                    return;
                }
                int maxRetries = 20;
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
                        saveImagesFromResponse(pollResponse.body(), outputFolder);
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

    private static void saveImagesFromResponse(byte[] responseBody, String outputFolder) throws IOException {
        Files.createDirectories(Paths.get(outputFolder));
        // Save raw JSON response for parity with Python reference
        String json = new String(responseBody);
        Path rawJsonPath = Paths.get(outputFolder, "raw_response.json");
        Files.writeString(rawJsonPath, json);
        System.out.println("Raw JSON response saved to: " + rawJsonPath);
        // Try to parse as JSON array or object
        try {
            if (json.trim().startsWith("{")) {
                Map<String, Object> map = objectMapper.readValue(json, new TypeReference<Map<String, Object>>(){});
                if (map.containsKey("outputDocuments")) {
                    List<Map<String, Object>> docs = (List<Map<String, Object>>) map.get("outputDocuments");
                    for (int i = 0; i < docs.size(); i++) {
                        Map<String, Object> doc = docs.get(i);
                        if (doc.containsKey("streamFile") && doc.containsKey("fileName")) {
                            byte[] img = Base64.getDecoder().decode((String) doc.get("streamFile"));
                            String fileName = (String) doc.get("fileName");
                            Path outPath = Paths.get(outputFolder, fileName);
                            Files.write(outPath, img);
                            System.out.println("✓ Converted image saved: " + outPath);
                        }
                    }
                    return;
                } else if (map.containsKey("docContent") && map.containsKey("docName")) {
                    byte[] img = Base64.getDecoder().decode((String) map.get("docContent"));
                    String fileName = (String) map.get("docName");
                    Path outPath = Paths.get(outputFolder, fileName);
                    Files.write(outPath, img);
                    System.out.println("✓ Single image saved: " + outPath);
                    return;
                }
            } else if (json.trim().startsWith("[")) {
                List<Map<String, Object>> docs = objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>(){});
                for (int i = 0; i < docs.size(); i++) {
                    Map<String, Object> doc = docs.get(i);
                    if (doc.containsKey("docContent") && doc.containsKey("docName")) {
                        byte[] img = Base64.getDecoder().decode((String) doc.get("docContent"));
                        String fileName = (String) doc.get("docName");
                        Path outPath = Paths.get(outputFolder, fileName);
                        Files.write(outPath, img);
                        System.out.println("✓ Converted image saved: " + outPath);
                    }
                }
                return;
            }
            // If not recognized, save raw response as binary (fallback)
            Path rawPath = Paths.get(outputFolder, "raw_response.bin");
            Files.write(rawPath, responseBody);
            System.out.println("Raw response saved to: " + rawPath);
        } catch (Exception e) {
            Path rawPath = Paths.get(outputFolder, "raw_response.bin");
            Files.write(rawPath, responseBody);
            System.out.println("Raw response saved to: " + rawPath);
        }
    }
} 