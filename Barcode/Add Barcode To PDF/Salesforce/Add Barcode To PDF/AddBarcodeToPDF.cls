public with sharing class AddBarcodeToPDF {
    // Set your PDF4me API key here
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/addbarcode';

    // Result wrapper class
    public class BarcodeResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }



    // Helper method to poll for async result
    private static Blob pollForBarcodeResult(String locationUrl, String apiKey) {
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
        throw new AuraHandledException('Timeout: Barcode addition did not complete after multiple retries.');
    }

    // Combined method: adds barcode to PDF and saves as Salesforce File, returns both base64 and download URL
    public static BarcodeResult addBarcodeToPDFAndSave(String pdfBase64, String text, String barcodeType, String pages, String alignX, String alignY, Boolean hideText, String outputFileName) {
        BarcodeResult result = new BarcodeResult();
        try {
            // Step 1: Prepare the PDF4me API payload for barcode addition
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => pdfBase64,
                'docName' => outputFileName + '.pdf',
                'text' => text,
                'barcodeType' => barcodeType,
                'pages' => pages,
                'alignX' => alignX,
                'alignY' => alignY,
                'heightInMM' => '40',
                'widthInMM' => '40',
                'marginXInMM' => '20',
                'marginYInMM' => '20',
                'heightInPt' => '113',
                'widthInPt' => '113',
                'marginXInPt' => '57',
                'marginYInPt' => '57',
                'opacity' => 100,
                'displayText' => 'below',
                'hideText' => hideText,
                'showOnlyInPrint' => false,
                'isTextAbove' => false,
                'async' => false
            };
            String jsonBody = JSON.serialize(payload);

            // Step 2: Call the PDF4me API
            Http http = new Http();
            HttpRequest barcodeRequest = new HttpRequest();
            barcodeRequest.setEndpoint(ENDPOINT_URL);
            barcodeRequest.setMethod('POST');
            barcodeRequest.setHeader('Authorization', 'Basic ' + API_KEY);
            barcodeRequest.setHeader('Content-Type', 'application/json');
            barcodeRequest.setBody(jsonBody);
            HttpResponse barcodeResponse = http.send(barcodeRequest);

            Blob pdfBlob;
            if (barcodeResponse.getStatusCode() == 200) {
                pdfBlob = barcodeResponse.getBodyAsBlob();
            } else if (barcodeResponse.getStatusCode() == 202) {
                String locationUrl = barcodeResponse.getHeader('Location');
                if (String.isBlank(locationUrl)) {
                    result.error = 'ERROR: 202 Accepted but no Location header for polling.';
                    return result;
                }
                pdfBlob = pollForBarcodeResult(locationUrl, API_KEY);
            } else {
                result.error = 'ERROR: PDF4me barcode addition failed. Status code: ' + barcodeResponse.getStatusCode() + ' - ' + barcodeResponse.getBody();
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