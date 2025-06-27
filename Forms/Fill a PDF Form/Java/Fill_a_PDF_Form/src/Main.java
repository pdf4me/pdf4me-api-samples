import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.*;
import java.util.Base64;

public class Main {
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        String pdfPath = "sample.pdf";
        System.out.println("=== Filling PDF Form ===");
        try {
            String result = fillPdfForm(pdfPath);
            if (result != null && !result.isEmpty())
                System.out.println("Filled PDF form saved to: " + result);
            else
                System.out.println("PDF form filling failed.");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static String fillPdfForm(String inputPdfPath) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF file not found: " + inputPdfPath);
                return null;
            }
            String outputFileName = Paths.get(inputPdfPath).getFileName().toString().replaceFirst("[.][^.]+$", "") + ".filled.pdf";
            String outputPdfPath = Paths.get(System.getProperty("user.dir"), outputFileName).toString();
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            String jsonData = "{\"firstname\":\"John\",\"lastname\":\"Adams\",\"gender\":\"Female\",\"member\":\"Stoke\"}";
            String inputFormDataArr = "[{" +
                "\"fieldName\":\"firstname\",\"fieldValue\":\"John\"},{" +
                "\"fieldName\":\"lastname\",\"fieldValue\":\"Adams\"},{" +
                "\"fieldName\":\"gender\",\"fieldValue\":\"Female\"},{" +
                "\"fieldName\":\"member\",\"fieldValue\":\"Basic\"}]";
            StringBuilder jsonPayload = new StringBuilder();
            jsonPayload.append("{");
            jsonPayload.append("\"templateDocName\":\"sample.pdf\",");
            jsonPayload.append("\"templateDocContent\":\"").append(pdfBase64).append("\",");
            jsonPayload.append("\"dataArray\":\"").append(jsonData.replace("\"", "\\\"")).append("\",");
            jsonPayload.append("\"outputType\":\"pdf\",");
            jsonPayload.append("\"inputDataType\":\"json\",");
            jsonPayload.append("\"metaData\":\"\",");
            jsonPayload.append("\"metaDataJson\":\"\",");
            jsonPayload.append("\"InputFormData\":").append(inputFormDataArr);
            jsonPayload.append("}");
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/FillPdfForm"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload.toString()))
                .build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
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
                System.out.println("Timeout: PDF form filling did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in fillPdfForm: " + ex.getMessage());
            return null;
        }
    }
}
