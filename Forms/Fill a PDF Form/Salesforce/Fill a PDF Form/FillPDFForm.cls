public with sharing class FillPDFForm {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/FillPdfForm';

    // Result wrapper class
    public class FillFormResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }

    // Synchronous method: fills PDF form, saves as Salesforce File, returns result object
    public static FillFormResult fillFormAndSave(String pdfBase64, String docName, Map<String, String> formData) {
        FillFormResult result = new FillFormResult();
        try {
            // Prepare the PDF4me API payload
        List<Object> inputFormData = new List<Object>();
        for (String key : formData.keySet()) {
            inputFormData.add(new Map<String, Object>{
                'fieldName' => key, 
                'fieldValue' => formData.get(key)
            });
        }
        Map<String, Object> payload = new Map<String, Object>{
            'templateDocName' => docName,
            'templateDocContent' => pdfBase64,
            'dataArray' => JSON.serialize(formData),
            'outputType' => 'pdf',
            'inputDataType' => 'json',
            'metaData' => '',
            'metaDataJson' => '',
            'InputFormData' => inputFormData,
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
                result.error = 'ERROR: PDF4me fill form failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
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