public with sharing class ExtractTextFromWord {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/ExtractTextFromWord';

    /**
     * Result wrapper for text extraction from Word
     */
    public class ExtractTextFromWordResult {
        public String textResult; // The extracted text
        public String downloadUrl; // Download URL for the extracted text file
        public String error; // Error message if any
    }

    /**
     * Helper method to poll for async result (for 202 responses)
     */
    private static String pollForExtractTextFromWordResult(String locationUrl, String apiKey) {
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
     * Synchronous method: extracts text from Word and saves as Salesforce File, returns text and download URL
     */
    public static ExtractTextFromWordResult extractAndSave(String wordBase64, String docName, Integer startPage, Integer endPage, Boolean removeComments, Boolean removeHeaderFooter, Boolean acceptChanges) {
        ExtractTextFromWordResult result = new ExtractTextFromWordResult();
        try {
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => wordBase64,
                'docName' => docName,
                'StartPageNumber' => startPage,
                'EndPageNumber' => endPage,
                'RemoveComments' => removeComments,
                'RemoveHeaderFooter' => removeHeaderFooter,
                'AcceptChanges' => acceptChanges,
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

            String textResult;
            if (response.getStatusCode() == 200) {
                textResult = response.getBody();
            } else if (response.getStatusCode() == 202) {
                String locationUrl = response.getHeader('Location');
                if (String.isBlank(locationUrl)) {
                    result.error = 'ERROR: 202 Accepted but no Location header for polling.';
                    return result;
                }
                textResult = pollForExtractTextFromWordResult(locationUrl, API_KEY);
            } else {
                result.error = 'ERROR: PDF4me text extraction from Word failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }

            // Save the extracted text as a Salesforce File (ContentVersion)
            Blob textBlob = Blob.valueOf(textResult);
            ContentVersion cv = new ContentVersion();
            cv.Title = docName + '_extracted_text';
            cv.PathOnClient = docName + '_extracted_text.txt';
            cv.VersionData = textBlob;
            cv.IsMajorVersion = true;
            insert cv;

            ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
            result.downloadUrl = '/sfc/servlet.shepherd/document/download/' + insertedCV.ContentDocumentId;
            result.textResult = textResult;

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