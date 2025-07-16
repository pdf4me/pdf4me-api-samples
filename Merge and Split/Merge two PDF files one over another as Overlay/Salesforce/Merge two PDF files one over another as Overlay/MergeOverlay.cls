public with sharing class MergeOverlay {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/MergeOverlay';

    // Result wrapper class for overlay merge operation
    public class OverlayMergeResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }

    /**
     * Merges two PDF files one over another as overlay using the PDF4me API.
     * Saves the overlay merged PDF as a Salesforce File and returns base64, download URL, and error (if any).
     * @param basePDFBase64 The base64-encoded base PDF document (first layer).
     * @param basePDFName The name of the base PDF file.
     * @param layerPDFBase64 The base64-encoded layer PDF document (second layer).
     * @param layerPDFName The name of the layer PDF file.
     * @return OverlayMergeResult containing base64, downloadUrl, and error.
     */
    public static OverlayMergeResult mergeOverlayAndSave(String basePDFBase64, String basePDFName, String layerPDFBase64, String layerPDFName) {
        OverlayMergeResult result = new OverlayMergeResult();
        try {
            // Prepare payload for PDF4me API
            Map<String, Object> payload = new Map<String, Object>{
                'baseDocContent' => basePDFBase64,
                'baseDocName' => basePDFName,
                'layerDocContent' => layerPDFBase64,
                'layerDocName' => layerPDFName,
                'async' => false
            };
            String payloadJson = JSON.serialize(payload);

            // Call the PDF4me API
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(ENDPOINT_URL);
            request.setMethod('POST');
            request.setHeader('Authorization', 'Basic ' + API_KEY);
            request.setHeader('Content-Type', 'application/json');
            request.setBody(payloadJson);
            request.setTimeout(120000);
            HttpResponse response = http.send(request);

            Blob resultBlob;
            if (response.getStatusCode() == 200) {
                resultBlob = response.getBodyAsBlob();
            } else if (response.getStatusCode() == 202) {
                result.error = 'ERROR: 202 Accepted but async/polling not implemented in this version.';
                return result;
            } else {
                result.error = 'ERROR: PDF4me overlay merge failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }

            // Get the overlay merged PDF as base64
            result.base64 = EncodingUtil.base64Encode(resultBlob);

            // Save the overlay merged PDF as a Salesforce File (ContentVersion)
            String outputFileName = basePDFName + '_overlay_' + layerPDFName;
            ContentVersion cv = new ContentVersion();
            cv.Title = outputFileName;
            cv.PathOnClient = outputFileName;
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