public with sharing class AddFormFieldsToPDF {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/AddFormField';

    // Result wrapper class
    public class FormFieldResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }

    // Synchronous method: adds form field, saves as Salesforce File, returns result object
    public static FormFieldResult addFormFieldAndSave(String pdfBase64, String docName, String initialValue, Integer positionX, Integer positionY, String fieldName, Integer size, String pages, String formFieldType) {
        FormFieldResult result = new FormFieldResult();
        try {
            // Prepare the PDF4me API payload
        Map<String, Object> payload = new Map<String, Object>{
            'docContent' => pdfBase64,
            'docName' => docName,
            'initialValue' => initialValue,
            'positionX' => positionX,
            'positionY' => positionY,
            'fieldName' => fieldName,
            'Size' => size,
            'pages' => pages,
            'formFieldType' => formFieldType,
                'async' => false
            };
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
                result.error = 'ERROR: PDF4me add form field failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
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