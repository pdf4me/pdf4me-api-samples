public with sharing class ExtractPDFMetadata {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/GetPdfMetadata';

    // Result wrapper class for extract metadata operation
    public class MetadataResult {
        public String base64; // base64-encoded JSON metadata
        public String downloadUrl;
        public String error;
    }

    /**
     * Extracts metadata from a PDF document using the PDF4me API.
     * Saves the metadata JSON as a Salesforce File and returns base64, download URL, and error (if any).
     * @param pdfBase64 The base64-encoded PDF document.
     * @param outputFileName The name for the output metadata file (e.g., 'pdf_metadata.json').
     * @return MetadataResult containing base64 (JSON), downloadUrl, and error.
     */
    public static MetadataResult extractPdfMetadataAndSave(String pdfBase64, String outputFileName) {
        MetadataResult result = new MetadataResult();
        try {
            // Prepare payload for PDF4me API
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => pdfBase64,
                'docName' => 'input.pdf',
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

            if (response.getStatusCode() == 200) {
                String metadataJson = response.getBody();
                result.base64 = EncodingUtil.base64Encode(Blob.valueOf(metadataJson));

                // Save the metadata JSON as a Salesforce File (ContentVersion)
                ContentVersion cv = new ContentVersion();
                cv.Title = outputFileName;
                cv.PathOnClient = outputFileName;
                cv.VersionData = Blob.valueOf(metadataJson);
                cv.IsMajorVersion = true;
                insert cv;

                // Get the ContentDocumentId and build a download URL (relative path)
                ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
                result.downloadUrl = '/sfc/servlet.shepherd/document/download/' + insertedCV.ContentDocumentId;
            } else if (response.getStatusCode() == 202) {
                result.error = 'ERROR: 202 Accepted but async/polling not implemented in this version.';
                return result;
            } else {
                result.error = 'ERROR: PDF4me extract metadata failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }
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