public with sharing class GenerateCreateSwissQrBill {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/CreateSwissQrBill';

    // Result wrapper class
    public class SwissQrBillResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }

    // Synchronous method: creates a Swiss QR Bill, saves as Salesforce File, returns result object
    public static SwissQrBillResult createSwissQrBillAndSave(String pdfBase64, String docName, String iban, String crName, String crAddressType, String crStreet1, String crStreet2, String crPostalCode, String crCity, String amount, String currencyCode, String udName, String udAddressType, String udStreet1, String udStreet2, String udPostalCode, String udCity, String referenceType, String languageType, String separatorLine) {
        SwissQrBillResult result = new SwissQrBillResult();
        try {
            // Set reference value if referenceType is not 'NON'
            String reference = null;
            if (referenceType != null && referenceType != 'NON') {
                reference = '210000000003139471430009017'; // Sample valid QR reference
            }

            // Prepare the PDF4me API payload
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => pdfBase64,
                'docName' => docName,
                'iban' => iban,
                'crName' => crName,
                'crAddressType' => crAddressType,
                'crStreetOrAddressLine1' => crStreet1,
                'crStreetOrAddressLine2' => crStreet2,
                'crPostalCode' => crPostalCode,
                'crCity' => crCity,
                'amount' => amount,
                'currency' => currencyCode,
                'udName' => udName,
                'udAddressType' => udAddressType,
                'udStreetOrAddressLine1' => udStreet1,
                'udStreetOrAddressLine2' => udStreet2,
                'udPostalCode' => udPostalCode,
                'udCity' => udCity,
                'referenceType' => referenceType,
                'languageType' => languageType,
                'seperatorLine' => separatorLine,
                'async' => false
            };
            if (reference != null) {
                payload.put('reference', reference);
            }
            String jsonBody = JSON.serialize(payload);

            // Call the PDF4me API
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(ENDPOINT_URL);
            request.setMethod('POST');
            request.setHeader('Authorization', 'Basic ' + API_KEY);
            request.setHeader('Content-Type', 'application/json');
            request.setBody(jsonBody);
            HttpResponse response = http.send(request);

            Blob resultBlob;
            if (response.getStatusCode() == 200) {
                resultBlob = response.getBodyAsBlob();
            } else if (response.getStatusCode() == 202) {
                result.error = 'ERROR: 202 Accepted but async/polling not implemented in this version.';
                return result;
            } else {
                result.error = 'ERROR: PDF4me create Swiss QR Bill failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }

            // Get the processed PDF as base64
            result.base64 = EncodingUtil.base64Encode(resultBlob);

            // Save the processed PDF as a Salesforce File (ContentVersion)
            ContentVersion cv = new ContentVersion();
            cv.Title = docName;
            cv.PathOnClient = docName + '.pdf';
            cv.VersionData = resultBlob;
            cv.IsMajorVersion = true;
            insert cv;

            // Get the ContentDocumentId and build a download URL (relative path)
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