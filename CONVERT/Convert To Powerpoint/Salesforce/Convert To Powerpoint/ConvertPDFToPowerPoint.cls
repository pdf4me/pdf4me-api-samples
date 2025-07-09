public with sharing class ConvertPDFToPowerPoint {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/ConvertPdfToPowerPoint';

    // Result wrapper class
    public class PowerPointResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }

    // Helper method to poll for async result
    private static Blob pollForPowerPointResult(String locationUrl, String apiKey) {
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
        throw new AuraHandledException('Timeout: PowerPoint conversion did not complete after multiple retries.');
    }

    // Combined method: converts PDF to PowerPoint and saves as Salesforce File, returns both base64 and download URL
    public static PowerPointResult convertPDFToPowerPointAndSave(String pdfBase64, String qualityType, String language, Boolean ocrWhenNeeded, Boolean outputFormat, Boolean mergeAllSheets, String outputFileName) {
        PowerPointResult result = new PowerPointResult();
        try {
            // Step 1: Prepare the PDF4me API payload for PowerPoint conversion
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => pdfBase64,
                'docName' => outputFileName + '.pdf',
                'qualityType' => qualityType,
                'language' => language,
                'ocrWhenNeeded' => ocrWhenNeeded,
                'outputFormat' => outputFormat,
                'mergeAllSheets' => mergeAllSheets,
                'async' => false
            };
            String jsonBody = JSON.serialize(payload);

            // Step 2: Call the PDF4me API
            Http http = new Http();
            HttpRequest pptRequest = new HttpRequest();
            pptRequest.setEndpoint(ENDPOINT_URL);
            pptRequest.setMethod('POST');
            pptRequest.setHeader('Authorization', 'Basic ' + API_KEY);
            pptRequest.setHeader('Content-Type', 'application/json');
            pptRequest.setBody(jsonBody);
            HttpResponse pptResponse = http.send(pptRequest);

            Blob pptBlob;
            if (pptResponse.getStatusCode() == 200) {
                pptBlob = pptResponse.getBodyAsBlob();
            } else if (pptResponse.getStatusCode() == 202) {
                String locationUrl = pptResponse.getHeader('Location');
                if (String.isBlank(locationUrl)) {
                    result.error = 'ERROR: 202 Accepted but no Location header for polling.';
                    return result;
                }
                pptBlob = pollForPowerPointResult(locationUrl, API_KEY);
            } else {
                result.error = 'ERROR: PDF4me PowerPoint conversion failed. Status code: ' + pptResponse.getStatusCode() + ' - ' + pptResponse.getBody();
                return result;
            }

            // Step 3: Get the PowerPoint as base64
            result.base64 = EncodingUtil.base64Encode(pptBlob);

            // Step 4: Save the PowerPoint as a Salesforce File (ContentVersion)
            ContentVersion cv = new ContentVersion();
            cv.Title = outputFileName;
            cv.PathOnClient = outputFileName + '.pptx';
            cv.VersionData = pptBlob;
            cv.IsMajorVersion = true;
            insert cv;

            // Step 5: Get the ContentDocumentId and build a download URL (relative path)
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