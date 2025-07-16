public with sharing class AddImageWatermarkToImage {
    // Set your PDF4me API key here
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/AddImageWatermarkToImage';

    // Result wrapper class
    public class ImageWatermarkResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }

    // Adds an image watermark to an image, saves as Salesforce File, returns base64 and download URL
    public static ImageWatermarkResult addImageWatermarkAndSave(
        String imageBase64,
        String watermarkBase64,
        String imageFileName,
        String watermarkFileName,
        String position,
        Decimal opacity,
        Integer horizontalOffset,
        Integer verticalOffset,
        Decimal positionX,
        Decimal positionY,
        Decimal rotation
    ) {
        ImageWatermarkResult result = new ImageWatermarkResult();
        try {
            // Prepare the PDF4me API payload
            Map<String, Object> payload = new Map<String, Object>{
                'docName' => imageFileName,
                'docContent' => imageBase64,
                'watermarkFileName' => watermarkFileName,
                'watermarkFileContent' => watermarkBase64,
                'position' => position,
                'opacity' => opacity,
                'horizontalOffset' => horizontalOffset,
                'verticalOffset' => verticalOffset,
                'rotation' => rotation,
                'async' => false
            };
            if (positionX != null) payload.put('positionX', positionX);
            if (positionY != null) payload.put('positionY', positionY);
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
                result.error = 'ERROR: PDF4me add image watermark failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }

            // Get the processed image as base64
            result.base64 = EncodingUtil.base64Encode(resultBlob);

            // Save the processed image as a Salesforce File (ContentVersion)
            ContentVersion cv = new ContentVersion();
            cv.Title = imageFileName + '_with_watermark';
            cv.PathOnClient = imageFileName + '_with_watermark.jpg';
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