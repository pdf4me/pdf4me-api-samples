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
        System.out.println("Extracting tables from PDF...");
        String inputPdfPath = args.length > 0 ? args[0] : "../sample.pdf";
        Path inputPath = Paths.get(inputPdfPath).toAbsolutePath();
        String outputFolder = inputPath.getParent().toString();
        extractTableFromPdf(inputPdfPath, outputFolder);
    }

    public static void extractTableFromPdf(String inputPdfPath, String outputFolder) {
        try {
            Path outputDir = Paths.get(outputFolder);
            if (!Files.exists(outputDir)) {
                Files.createDirectories(outputDir);
                System.out.println("Created output folder: " + outputDir);
            }
            if (!Files.exists(Paths.get(inputPdfPath))) {
                System.out.println("Error: PDF file not found at " + inputPdfPath);
                return;
            }
            byte[] pdfBytes = Files.readAllBytes(Paths.get(inputPdfPath));
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("docName", "output.pdf");
            payload.put("docContent", pdfBase64);
            payload.put("async", true);
            String jsonPayload = convertToJson(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/ExtractTableFromPdf"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            System.out.println("Sending table extraction request to PDF4me API...");
            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            System.out.println("Response Status Code: " + response.statusCode());
            if (response.statusCode() == 200) {
                processExtractedTables(response, outputDir);
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("Error: No polling URL found in response");
                    return;
                }
                int maxRetries = 15;
                int retryDelay = 12;
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    System.out.println("Checking status... (Attempt " + (attempt + 1) + "/" + maxRetries + ")");
                    Thread.sleep(retryDelay * 1000);
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();
                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());
                    System.out.println("Polling Status Code: " + pollResponse.statusCode());
                    if (pollResponse.statusCode() == 200) {
                        processExtractedTables(pollResponse, outputDir);
                        return;
                    } else if (pollResponse.statusCode() == 202) {
                        System.out.println("Still processing...");
                        continue;
                    } else {
                        System.out.println("Error during processing: " + pollResponse.statusCode() + " - " + new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return;
                    }
                }
                System.out.println("Timeout: Table extraction did not complete after multiple retries");
            } else {
                System.out.println("Error: " + response.statusCode() + " - " + new String(response.body(), StandardCharsets.UTF_8));
            }
        } catch (Exception ex) {
            System.err.println("Error: " + ex.getMessage());
            ex.printStackTrace();
        }
    }

    private static void processExtractedTables(HttpResponse<byte[]> response, Path outputDir) {
        try {
            String contentType = response.headers().firstValue("Content-Type").orElse("");
            byte[] body = response.body();
            if (contentType.contains("application/json")) {
                String json = new String(body, StandardCharsets.UTF_8);
                Path metadataPath = outputDir.resolve("extracted_tables.json");
                Files.write(metadataPath, json.getBytes(StandardCharsets.UTF_8));
                System.out.println("Table metadata saved: " + metadataPath);
                // Minimal JSON parsing for tables/rows (not robust, but works for known structure)
                int tablesIdx = json.indexOf("\"tables\"");
                if (tablesIdx != -1) {
                    int arrStart = json.indexOf('[', tablesIdx);
                    int arrEnd = json.indexOf(']', arrStart);
                    if (arrStart != -1 && arrEnd != -1) {
                        String arr = json.substring(arrStart + 1, arrEnd);
                        String[] tables = arr.split("},");
                        int tableCount = tables.length;
                        int totalRows = 0;
                        List<Integer> rowCounts = new ArrayList<>();
                        for (int i = 0; i < tables.length; i++) {
                            String t = tables[i];
                            if (!t.endsWith("}")) t = t + "}";
                            Path tableJsonPath = outputDir.resolve("table_" + (i+1) + ".json");
                            Files.write(tableJsonPath, t.getBytes(StandardCharsets.UTF_8));
                            System.out.println("Table " + (i+1) + " saved: " + tableJsonPath);
                            // Extract rows for CSV
                            int rowsIdx = t.indexOf("\"rows\"");
                            if (rowsIdx != -1) {
                                int rowsArrStart = t.indexOf('[', rowsIdx);
                                int rowsArrEnd = t.indexOf(']', rowsArrStart);
                                if (rowsArrStart != -1 && rowsArrEnd != -1) {
                                    String rowsArr = t.substring(rowsArrStart + 1, rowsArrEnd);
                                    String[] rows = rowsArr.split("],");
                                    int rowCount = rows.length;
                                    rowCounts.add(rowCount);
                                    totalRows += rowCount;
                                    Path csvPath = outputDir.resolve("table_" + (i+1) + ".csv");
                                    try (BufferedWriter writer = Files.newBufferedWriter(csvPath, StandardCharsets.UTF_8)) {
                                        for (String row : rows) {
                                            row = row.replace('[', ' ').replace(']', ' ').replace('"', ' ').trim();
                                            writer.write(row.replace(",", ", ").trim());
                                            writer.newLine();
                                        }
                                    }
                                    System.out.println("✓ CSV table saved: " + csvPath);
                                }
                            }
                        }
                        // Write summary TXT
                        Path summaryPath = outputDir.resolve("table_extraction_summary.txt");
                        try (BufferedWriter writer = Files.newBufferedWriter(summaryPath, StandardCharsets.UTF_8)) {
                            writer.write("--- Table Extraction Summary ---\n");
                            writer.write("Total tables extracted: " + tableCount + "\n");
                            writer.write("Total rows: " + totalRows + "\n");
                            for (int i = 0; i < rowCounts.size(); i++) {
                                writer.write("  Table " + (i+1) + ": " + rowCounts.get(i) + " rows\n");
                            }
                        }
                        System.out.println("Summary saved: " + summaryPath);
                    } else {
                        System.out.println("No tables found in response");
                    }
                } else {
                    System.out.println("No tables found in response");
                }
            } else {
                Path fallbackPath = outputDir.resolve("raw_table_response.bin");
                Files.write(fallbackPath, body);
                System.out.println("Raw response saved: " + fallbackPath);
            }
        } catch (Exception ex) {
            System.err.println("Error in processExtractedTables: " + ex.getMessage());
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
            } else if (value instanceof List) {
                json.append(convertListToJson((List<?>) value));
            } else if (value instanceof Boolean) {
                json.append(value);
            } else {
                json.append("\"").append(value).append("\"");
            }
        }
        json.append("}");
        return json.toString();
    }

    private static String convertListToJson(List<?> list) {
        StringBuilder json = new StringBuilder("[");
        boolean first = true;
        for (Object item : list) {
            if (!first) json.append(",");
            first = false;
            if (item instanceof Map) {
                json.append(convertToJson((Map<String, Object>) item));
            } else if (item instanceof String) {
                json.append("\"").append(escapeJsonString((String) item)).append("\"");
            } else {
                json.append("\"").append(item).append("\"");
            }
        }
        json.append("]");
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
