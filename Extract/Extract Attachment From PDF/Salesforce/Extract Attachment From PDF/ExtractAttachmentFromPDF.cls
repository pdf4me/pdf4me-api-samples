public with sharing class ExtractAttachmentFromPDF {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/ExtractAttachmentFromPdf';

    /**
     * Result wrapper for attachment extraction
     */
    public class ExtractAttachmentResult {
        public List<String> fileNames; // Names of extracted files
        public List<String> downloadUrls; // Download URLs for extracted files
        public String error; // Error message if any
    }

    /**
     * Helper method to poll for async result (for 202 responses)
     */
    private static String pollForExtractAttachmentResult(String locationUrl, String apiKey) {
        Integer maxRetries = 10;
        Http http = new Http();
        for (Integer i = 0; i < maxRetries; i++) {
            HttpRequest pollRequest = new HttpRequest();
            pollRequest.setEndpoint(locationUrl);
            pollRequest.setMethod('GET');
            pollRequest.setHeader('Authorization', 'Basic ' + apiKey);
            pollRequest.setHeader('Content-Type', 'application/json');
            HttpResponse pollResponse = http.send(pollRequest);
            if (pollResponse.getStatusCode() == 200) {
                return pollResponse.getBody();
            } else if (pollResponse.getStatusCode() == 202) {
                System.debug('Still processing, retrying immediately...');
            } else {
                throw new AuraHandledException('Polling failed: ' + pollResponse.getStatusCode() + ' - ' + pollResponse.getBody());
            }
        }
        throw new AuraHandledException('Timeout: Extraction did not complete after multiple retries.');
    }

    /**
     * Synchronous method: extracts attachments and saves them as Salesforce Files, returns file names and download URLs
     */
    public static ExtractAttachmentResult extractAndSave(String pdfBase64, String docName) {
        ExtractAttachmentResult result = new ExtractAttachmentResult();
        result.fileNames = new List<String>();
        result.downloadUrls = new List<String>();
        try {
            Map<String, Object> payload = new Map<String, Object>{
                'docName' => docName,
                'docContent' => pdfBase64,
                'async' => false
            };
            String jsonBody = JSON.serialize(payload);

            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(ENDPOINT_URL);
            request.setMethod('POST');
            request.setHeader('Authorization', 'Basic ' + API_KEY);
            request.setHeader('Content-Type', 'application/json');
            request.setBody(jsonBody);
            request.setTimeout(120000);
            HttpResponse response = http.send(request);

            String jsonResult;
            if (response.getStatusCode() == 200) {
                jsonResult = response.getBody();
            } else if (response.getStatusCode() == 202) {
                String locationUrl = response.getHeader('Location');
                if (String.isBlank(locationUrl)) {
                    result.error = 'ERROR: 202 Accepted but no Location header for polling.';
                    return result;
                }
                jsonResult = pollForExtractAttachmentResult(locationUrl, API_KEY);
            } else {
                result.error = 'ERROR: PDF4me attachment extraction failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }

            // Parse the JSON result and save each extracted file
            Map<String, Object> resultMap = (Map<String, Object>) JSON.deserializeUntyped(jsonResult);
            if (resultMap.containsKey('outputDocuments')) {
                List<Object> outputDocs = (List<Object>) resultMap.get('outputDocuments');
                for (Object doc : outputDocs) {
                    Map<String, Object> docMap = (Map<String, Object>) doc;
                    String fileName = (String) docMap.get('fileName');
                    String streamFile = (String) docMap.get('streamFile');
                    if (String.isNotBlank(streamFile)) {
                        Blob fileBlob = EncodingUtil.base64Decode(streamFile);
                        ContentVersion cv = new ContentVersion();
                        cv.Title = fileName;
                        cv.PathOnClient = fileName;
                        cv.VersionData = fileBlob;
                        cv.IsMajorVersion = true;
                        insert cv;
                        ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
                        String downloadUrl = '/sfc/servlet.shepherd/document/download/' + insertedCV.ContentDocumentId;
                        result.fileNames.add(fileName);
                        result.downloadUrls.add(downloadUrl);
                    }
                }
            }
            return result;
        } catch (Exception ex) {
            result.error = 'ERROR: ' + ex.getMessage();
            return result;
        }
    }

    /**
     * Makes a file public and returns the public URL
     */
    public static String makeFilePublic(String contentDocumentId) {
        try {
            ContentVersion cv = [
                SELECT Id
                FROM ContentVersion
                WHERE ContentDocumentId = :contentDocumentId
                ORDER BY VersionNumber DESC
                LIMIT 1
            ];

            ContentDistribution cd = new ContentDistribution();
            cd.Name = 'Public Link';
            cd.ContentVersionId = cv.Id;
            cd.PreferencesAllowViewInBrowser = true;
            cd.PreferencesAllowOriginalDownload = true;
            cd.PreferencesPasswordRequired = false;
            insert cd;
            cd = [SELECT DistributionPublicUrl FROM ContentDistribution WHERE Id = :cd.Id LIMIT 1];
            return cd.DistributionPublicUrl;
        } catch (Exception ex) {
            return 'ERROR: ' + ex.getMessage();
        }
    }
} 