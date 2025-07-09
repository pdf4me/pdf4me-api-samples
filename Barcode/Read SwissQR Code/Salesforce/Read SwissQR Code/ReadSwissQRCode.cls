public with sharing class ReadSwissQRCode {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/ReadSwissQRBill';

    // Result wrapper class
    public class SwissQRResult {
        public String base64;
        public String downloadUrl;
        public String error;
        public String qrData;
    }

    // Helper method to poll for async result
    private static Blob pollForSwissQRResult(String locationUrl, String apiKey) {
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
                return pollResponse.getBodyAsBlob();
            } else if (pollResponse.getStatusCode() == 202) {
                System.debug('Still processing, retrying immediately...');
                // No sleep, just continue to next iteration
            } else {
                throw new AuraHandledException('Polling failed: ' + pollResponse.getStatusCode() + ' - ' + pollResponse.getBody());
            }
        }
        throw new AuraHandledException('Timeout: Swiss QR reading did not complete after multiple retries.');
    }

    // Combined method: reads Swiss QR codes from PDF and saves results as Salesforce File, returns both base64 and download URL
    public static SwissQRResult readSwissQRCodeAndSave(String pdfBase64, String outputFileName) {
        SwissQRResult result = new SwissQRResult();
        try {
            // Step 1: Prepare the PDF4me API payload for Swiss QR reading
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => pdfBase64,
                'docName' => outputFileName + '.pdf',
                'async' => false
            };
            String jsonBody = JSON.serialize(payload);

            // Step 2: Call the PDF4me API
            Http http = new Http();
            HttpRequest qrRequest = new HttpRequest();
            qrRequest.setEndpoint(ENDPOINT_URL);
            qrRequest.setMethod('POST');
            qrRequest.setHeader('Authorization', 'Basic ' + API_KEY);
            qrRequest.setHeader('Content-Type', 'application/json');
            qrRequest.setBody(jsonBody);
            HttpResponse qrResponse = http.send(qrRequest);

            Blob resultBlob;
            if (qrResponse.getStatusCode() == 200) {
                resultBlob = qrResponse.getBodyAsBlob();
            } else if (qrResponse.getStatusCode() == 202) {
                String locationUrl = qrResponse.getHeader('Location');
                if (String.isBlank(locationUrl)) {
                    result.error = 'ERROR: 202 Accepted but no Location header for polling.';
                    return result;
                }
                resultBlob = pollForSwissQRResult(locationUrl, API_KEY);
            } else {
                result.error = 'ERROR: PDF4me Swiss QR reading failed. Status code: ' + qrResponse.getStatusCode() + ' - ' + qrResponse.getBody();
                return result;
            }

            // Step 3: Get the result as base64
            result.base64 = EncodingUtil.base64Encode(resultBlob);

            // Step 4: Parse QR data from response
            String responseBody = qrResponse.getBody();
            if (String.isNotBlank(responseBody)) {
                result.qrData = responseBody;
            }

            // Step 5: Save the result as a Salesforce File (ContentVersion)
            ContentVersion cv = new ContentVersion();
            cv.Title = outputFileName;
            cv.PathOnClient = outputFileName + '.json';
            cv.VersionData = resultBlob;
            cv.IsMajorVersion = true;
            insert cv;

            // Step 6: Get the ContentDocumentId and build a download URL (relative path)
            ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
            result.downloadUrl = '/sfc/servlet.shepherd/document/download/' + insertedCV.ContentDocumentId;

            return result;
        } catch (Exception ex) {
            result.error = 'ERROR: ' + ex.getMessage();
            return result;
        }
    }

    // Method to make a file public and return the public URL
    public static String makeFilePublic(String contentDocumentId) {
        try {
            // Get the latest ContentVersion Id for the ContentDocument
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
            // Query again to get the public URL
            cd = [SELECT DistributionPublicUrl FROM ContentDistribution WHERE Id = :cd.Id LIMIT 1];
            return cd.DistributionPublicUrl;
        } catch (Exception ex) {
            return 'ERROR: ' + ex.getMessage();
        }
    }
} 