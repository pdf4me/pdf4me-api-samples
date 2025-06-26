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
    private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    private static final String BASE_URL = "https://api.pdf4me.com/";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        String docxPath = "sample.docx";
        System.out.println("=== Generating DOCX Document ===");
        try {
            String result = generateDocumentMultiple(docxPath, "docx");
            if (result != null && !result.isEmpty()) {
                System.out.println("Generated DOCX document saved to: " + result);
            } else {
                System.out.println("DOCX document generation failed.");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static String generateDocumentMultiple(String inputDocxPath, String outputType) {
        try {
            if (!Files.exists(Paths.get(inputDocxPath))) {
                System.out.println("DOCX file not found: " + inputDocxPath);
                return null;
            }
            
            String jsonDataPath = "sample.json";
            if (!Files.exists(Paths.get(jsonDataPath))) {
                System.out.println("JSON data file not found: " + jsonDataPath);
                return null;
            }
            
            byte[] docxBytes = Files.readAllBytes(Paths.get(inputDocxPath));
            String docxBase64 = Base64.getEncoder().encodeToString(docxBytes);
            String jsonData = Files.readString(Paths.get(jsonDataPath));
            
            String outputExtension = switch (outputType.toLowerCase()) {
                case "pdf" -> ".pdf";
                case "docx" -> ".docx";
                case "html" -> ".html";
                default -> ".pdf";
            };
            
            String outputPath = inputDocxPath.replace(".docx", ".generated" + outputExtension);
            
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("templateFileType", "Docx");
            payload.put("templateFileName", "sample.docx");
            payload.put("templateFileData", docxBase64);
            payload.put("documentDataType", "Json");
            payload.put("outputType", "Docx");
            payload.put("documentDataText", jsonData);
            payload.put("async", false);
            
            return executeMultipleDocumentGeneration(payload, outputPath);
        } catch (Exception ex) {
            System.err.println("Error in generateDocumentMultiple: " + ex.getMessage());
            return null;
        }
    }

    private static String executeMultipleDocumentGeneration(Map<String, Object> payload, String outputPath) {
        try {
            String jsonPayload = convertToJson(payload);
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "api/v2/GenerateDocumentMultiple"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Basic " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            HttpResponse<byte[]> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() == 200) {
                String contentType = response.headers().firstValue("Content-Type").orElse("unknown");
                System.out.println("Response Content-Type: " + contentType);
                
                String responseText = new String(response.body(), StandardCharsets.UTF_8);
                System.out.println("Received " + responseText.length() + " characters");
                
                byte[] resultBytes;
                
                if (contentType.contains("application/json") || responseText.trim().startsWith("{")) {
                    System.out.println("Processing JSON response...");
                    try {
                        resultBytes = extractDocumentFromJsonResponse(responseText);
                        System.out.println("Extracted document data from 'outputDocuments[0].streamFile'");
                    } catch (Exception jsonEx) {
                        System.err.println("Error processing JSON response: " + jsonEx.getMessage());
                        resultBytes = response.body();
                    }
                } else {
                    resultBytes = response.body();
                }
                
                System.out.println("Final document size: " + resultBytes.length + " bytes");
                
                if (resultBytes.length > 0) {
                    if (resultBytes.length >= 2 && resultBytes[0] == 0x50 && resultBytes[1] == 0x4B) {
                        System.out.println("Valid DOCX file signature detected");
                    } else {
                        System.out.println("Warning: Final result doesn't appear to be a valid DOCX file");
                    }
                }
                
                Files.write(Paths.get(outputPath), resultBytes);
                return outputPath;
            } else if (response.statusCode() == 202) {
                String locationUrl = response.headers().firstValue("Location").orElse(null);
                if (locationUrl == null) {
                    System.out.println("No 'Location' header found in the response.");
                    return null;
                }
                
                int maxRetries = 10;
                int retryDelay = 10;
                
                for (int attempt = 0; attempt < maxRetries; attempt++) {
                    Thread.sleep(retryDelay * 1000);
                    
                    HttpRequest pollRequest = HttpRequest.newBuilder()
                        .uri(URI.create(locationUrl))
                        .header("Authorization", "Basic " + API_KEY)
                        .GET()
                        .build();

                    HttpResponse<byte[]> pollResponse = httpClient.send(pollRequest, HttpResponse.BodyHandlers.ofByteArray());

                    if (pollResponse.statusCode() == 200) {
                        byte[] resultBytes = pollResponse.body();
                        Files.write(Paths.get(outputPath), resultBytes);
                        return outputPath;
                    } else if (pollResponse.statusCode() == 202) {
                        continue;
                    } else {
                        System.out.println("Polling error: " + pollResponse.statusCode());
                        System.out.println(new String(pollResponse.body(), StandardCharsets.UTF_8));
                        return null;
                    }
                }
                
                System.out.println("Timeout: Document generation did not complete after multiple retries.");
                return null;
            } else {
                System.out.println("Initial request failed: " + response.statusCode());
                System.out.println(new String(response.body(), StandardCharsets.UTF_8));
                return null;
            }
        } catch (Exception ex) {
            System.err.println("Error in executeMultipleDocumentGeneration: " + ex.getMessage());
            return null;
        }
    }
    
    private static byte[] extractDocumentFromJsonResponse(String responseText) throws Exception {
        String searchPattern = "\"outputDocuments\":[";
        int startIndex = responseText.indexOf(searchPattern);
        if (startIndex == -1) {
            throw new Exception("'outputDocuments' array not found");
        }
        
        int arrayStart = responseText.indexOf("[", startIndex);
        int arrayEnd = findMatchingBracket(responseText, arrayStart);
        if (arrayEnd == -1) {
            throw new Exception("Could not find end of outputDocuments array");
        }
        
        String documentsArray = responseText.substring(arrayStart + 1, arrayEnd);
        if (documentsArray.trim().isEmpty()) {
            throw new Exception("'outputDocuments' array is empty");
        }
        
        int docStart = documentsArray.indexOf("{");
        int docEnd = findMatchingBracket(documentsArray, docStart);
        if (docStart == -1 || docEnd == -1) {
            throw new Exception("Could not find first document in outputDocuments array");
        }
        
        String firstDoc = documentsArray.substring(docStart, docEnd + 1);
        
        String streamFilePattern = "\"streamFile\":\"";
        int streamStart = firstDoc.indexOf(streamFilePattern);
        if (streamStart == -1) {
            throw new Exception("'streamFile' property not found in outputDocuments[0]");
        }
        
        streamStart += streamFilePattern.length();
        int streamEnd = firstDoc.indexOf("\"", streamStart);
        if (streamEnd == -1) {
            throw new Exception("Could not find end of streamFile value");
        }
        
        String base64Data = firstDoc.substring(streamStart, streamEnd);
        return Base64.getDecoder().decode(base64Data);
    }
    
    private static int findMatchingBracket(String text, int startIndex) {
        int bracketCount = 0;
        boolean inString = false;
        boolean escaped = false;
        
        for (int i = startIndex; i < text.length(); i++) {
            char c = text.charAt(i);
            
            if (escaped) {
                escaped = false;
                continue;
            }
            
            if (c == '\\') {
                escaped = true;
                continue;
            }
            
            if (c == '"') {
                inString = !inString;
                continue;
            }
            
            if (!inString) {
                if (c == '{' || c == '[') {
                    bracketCount++;
                } else if (c == '}' || c == ']') {
                    bracketCount--;
                    if (bracketCount == 0) {
                        return i;
                    }
                }
            }
        }
        
        return -1;
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