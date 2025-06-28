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
    private static final String API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) {
        String pdfPath = "sample.pdf";
        try {
            String result = deleteUnwantedPagesFromPdf(pdfPath);
            if (result != null && !result.isEmpty()) {
                System.out.println("Output saved: " + result);
            } else {
                System.out.println("Unwanted page deletion failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    public static String deleteUnwantedPagesFromPdf(String inputPdfPath) {
        try {
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("PDF not found: " + inputPdfPath);
                return null;
            }
            String outputFileName = "Delete_unwanted_pages_from_PDF_output.pdf";
            String outputPdfPath = Paths.get(System.getProperty("user.dir"), outputFileName).toString();
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docContent", pdfBase64);
            payload.put("docName", "output.pdf");
            payload.put("pageNumbers", "2-4");
            payload.put("async", true);
            return executeUnwantedPageDeletion(payload, outputPdfPath);
        } catch (Exception ex) {
            System.err.println("Error in deleteUnwantedPagesFromPdf: " + ex.getMessage());
            return null;
        }
    }

    private static String executeUnwantedPageDeletion(Map<String, Object> payload, String outputPdfPath) {
        try {
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/DeletePages"))
                .header("Content-Type", "application/json")
                .header("Authorization", API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                Files.write(Paths.get(outputPdfPath), response.body());
                return outputPdfPath;
            } else if (response.statusCode() == 202) {
                String responseBody = new String(response.body(), StandardCharsets.UTF_8);
                String jobId = extractJobId(responseBody);
                if (jobId != null) {
                    int maxRetries = 30;
                    int retryInterval = 2;
                    for (int attempt = 0; attempt < maxRetries; attempt++) {
                        String statusUrl = BASE_URL + "api/v2/JobStatus/" + jobId;
                        HttpRequest statusRequest = HttpRequest.newBuilder()
                            .uri(URI.create(statusUrl))
                            .header("Authorization", API_KEY)
                            .GET()
                            .build();
                        HttpResponse<byte[]> statusResponse = httpClient.send(statusRequest, HttpResponse.BodyHandlers.ofByteArray());
                        if (statusResponse.statusCode() == 200) {
                            Files.write(Paths.get(outputPdfPath), statusResponse.body());
                            System.out.println("Processing completed.");
                            return outputPdfPath;
                        } else if (statusResponse.statusCode() == 202) {
                            if (attempt == 0 || attempt == maxRetries - 1) {
                                System.out.println("Processing... (Attempt " + (attempt + 1) + "/" + maxRetries + ")");
                            }
                            Thread.sleep(retryInterval * 1000);
                        } else {
                            System.out.println("Status check error: " + statusResponse.statusCode());
                            return null;
                        }
                    }
                    System.out.println("Processing timeout. Check your account or use job ID " + jobId + ".");
                    return null;
                } else {
                    System.out.println("No job ID received in response");
                    return null;
                }
            } else {
                System.out.println("Error: " + response.statusCode());
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeUnwantedPageDeletion: " + ex.getMessage());
            return null;
        }
    }

    private static String extractJobId(String responseBody) {
        try {
            if (responseBody.contains("\"jobId\"")) {
                int startIndex = responseBody.indexOf("\"jobId\"") + 8;
                int endIndex = responseBody.indexOf("\"", startIndex);
                if (endIndex > startIndex) {
                    return responseBody.substring(startIndex, endIndex);
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting job ID: " + e.getMessage());
        }
        return null;
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