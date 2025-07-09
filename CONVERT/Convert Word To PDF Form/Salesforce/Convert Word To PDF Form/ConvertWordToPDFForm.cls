public with sharing class ConvertWordToPDFForm {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/ConvertWordToPdfForm';

    // Result wrapper class
    public class PDFResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }

    // Helper method to poll for async result
    private static Blob pollForPDFResult(String locationUrl, String apiKey) {
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
        throw new AuraHandledException('Timeout: Word to PDF form conversion did not complete after multiple retries.');
    }

    // Combined method: converts Word to PDF form and saves as Salesforce File, returns both base64 and download URL
    public static PDFResult convertWordToPDFFormAndSave(String wordBase64, String outputFileName) {
        PDFResult result = new PDFResult();
        try {
            // Step 1: Prepare the PDF4me API payload for Word to PDF form conversion
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => wordBase64,
                'docName' => outputFileName + '.docx',
                'async' => false
            };
            String jsonBody = JSON.serialize(payload);

            // Step 2: Call the PDF4me API
            Http http = new Http();
            HttpRequest pdfRequest = new HttpRequest();
            pdfRequest.setEndpoint(ENDPOINT_URL);
            pdfRequest.setMethod('POST');
            pdfRequest.setHeader('Authorization', 'Basic ' + API_KEY);
            pdfRequest.setHeader('Content-Type', 'application/json');
            pdfRequest.setBody(jsonBody);
            HttpResponse pdfResponse = http.send(pdfRequest);

            Blob pdfBlob;
            if (pdfResponse.getStatusCode() == 200) {
                pdfBlob = pdfResponse.getBodyAsBlob();
            } else if (pdfResponse.getStatusCode() == 202) {
                String locationUrl = pdfResponse.getHeader('Location');
                if (String.isBlank(locationUrl)) {
                    result.error = 'ERROR: 202 Accepted but no Location header for polling.';
                    return result;
                }
                pdfBlob = pollForPDFResult(locationUrl, API_KEY);
            } else {
                result.error = 'ERROR: PDF4me Word to PDF form conversion failed. Status code: ' + pdfResponse.getStatusCode() + ' - ' + pdfResponse.getBody();
                return result;
            }

            // Step 3: Get the PDF as base64
            result.base64 = EncodingUtil.base64Encode(pdfBlob);

            // Step 4: Save the PDF as a Salesforce File (ContentVersion)
            ContentVersion cv = new ContentVersion();
            cv.Title = outputFileName;
            cv.PathOnClient = outputFileName + '.pdf';
            cv.VersionData = pdfBlob;
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