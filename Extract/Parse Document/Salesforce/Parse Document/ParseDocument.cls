public with sharing class ParseDocument {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/ParseDocument';

    /**
     * Result wrapper for document parsing
     */
    public class ParseDocumentResult {
        public Map<String, Object> parsedData; // Parsed data from the document
        public String downloadUrl; // Download URL for the JSON result
        public String error; // Error message if any
    }

    /**
     * Helper method to poll for async result (for 202 responses)
     */
    private static String pollForParseDocumentResult(String locationUrl, String apiKey) {
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
        throw new AuraHandledException('Timeout: Parsing did not complete after multiple retries.');
    }

    /**
     * Synchronous method: parses document and saves as Salesforce File, returns parsed data and download URL
     */
    public static ParseDocumentResult parseAndSave(String pdfBase64, String docName, String templateName, String templateId) {
        ParseDocumentResult result = new ParseDocumentResult();
        try {
            if (String.isBlank(templateName) && String.isBlank(templateId)) {
                result.error = 'ERROR: Either templateName or templateId must be provided.';
                return result;
            }
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => pdfBase64,
                'docName' => docName,
                'async' => false
            };
            if (!String.isBlank(templateName)) {
                payload.put('templateName', templateName);
            }
            if (!String.isBlank(templateId)) {
                payload.put('templateId', templateId);
            }
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
                jsonResult = pollForParseDocumentResult(locationUrl, API_KEY);
            } else {
                result.error = 'ERROR: PDF4me document parsing failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }

            // Parse the JSON result and extract parsed data
            Map<String, Object> resultMap = (Map<String, Object>) JSON.deserializeUntyped(jsonResult);
            if (resultMap.containsKey('parsedData')) {
                result.parsedData = (Map<String, Object>) resultMap.get('parsedData');
            }

            // Save the JSON result as a Salesforce File (ContentVersion)
            Blob jsonBlob = Blob.valueOf(jsonResult);
            ContentVersion cv = new ContentVersion();
            cv.Title = docName + '_parsed';
            cv.PathOnClient = docName + '_parsed.json';
            cv.VersionData = jsonBlob;
            cv.IsMajorVersion = true;
            insert cv;

            ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
            result.downloadUrl = '/sfc/servlet.shepherd/document/download/' + insertedCV.ContentDocumentId;

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