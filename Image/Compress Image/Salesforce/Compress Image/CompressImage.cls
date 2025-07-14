public with sharing class CompressImage {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/CompressImage';

    // Result wrapper class
    public class CompressImageResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }

    /**
     * Compresses an image, saves as Salesforce File, returns base64 and download URL
     */
    public static CompressImageResult compressImageAndSave(
        String imageBase64,
        String imageFileName,
        String imageType,
        String compressionLevel
    ) {
        CompressImageResult result = new CompressImageResult();
        try {
            // Prepare the PDF4me API payload (only non-null fields)
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => imageBase64,
                'docName' => imageFileName,
                'async' => false
            };
            if (imageType != null) payload.put('imageType', imageType);
            if (compressionLevel != null) payload.put('compressionLevel', compressionLevel);
            String jsonBody = JSON.serialize(payload);

            // Call the PDF4me API
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(ENDPOINT_URL);
        request.setMethod('POST');
        request.setHeader('Authorization', 'Basic ' + API_KEY);
        request.setHeader('Content-Type', 'application/json');
            request.setBody(jsonBody);
            request.setTimeout(120000); // 120 seconds
            HttpResponse response = http.send(request);

            Blob resultBlob;
            if (response.getStatusCode() == 200) {
                resultBlob = response.getBodyAsBlob();
            } else if (response.getStatusCode() == 202) {
                result.error = 'ERROR: 202 Accepted but async/polling not implemented in this version.';
                return result;
            } else {
                result.error = 'ERROR: PDF4me compress image failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }

            // Get the processed image as base64
            result.base64 = EncodingUtil.base64Encode(resultBlob);

            // Save the processed image as a Salesforce File (ContentVersion)
            ContentVersion cv = new ContentVersion();
            cv.Title = imageFileName + '_compressed';
            cv.PathOnClient = imageFileName + '_compressed.jpg';
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

    /**
     * Makes a Salesforce File public and returns the public URL
     * @param contentDocumentId The ContentDocumentId of the file
     * @return The public URL or error message
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