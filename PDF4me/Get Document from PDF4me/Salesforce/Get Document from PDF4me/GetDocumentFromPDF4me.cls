public with sharing class GetDocumentFromPDF4me {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old';

    // Result wrapper class for get document operation
    public class GetDocumentResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }

    /**
     * Splits a PDF document by barcode using the PDF4me API.
     * Saves the split result (ZIP) as a Salesforce File and returns base64, download URL, and error (if any).
     * @param pdfBase64 The base64-encoded PDF document.
     * @param barcodeString The barcode string to search for.
     * @param barcodeFilter The filter type for barcode matching (startsWith, contains, equals).
     * @param barcodeType The type of barcode (qrcode, code128, code39).
     * @param splitBarcodePage Where to split relative to barcode (before, after).
     * @param combinePagesWithSameConsecutiveBarcodes Whether to combine pages with same consecutive barcodes.
     * @param pdfRenderDpi DPI for PDF rendering.
     * @return GetDocumentResult containing base64, downloadUrl, and error.
     */
    public static GetDocumentResult splitPdfByBarcodeAndSave(
        String pdfBase64,
        String barcodeString,
        String barcodeFilter,
        String barcodeType,
        String splitBarcodePage,
        Boolean combinePagesWithSameConsecutiveBarcodes,
        String pdfRenderDpi
    ) {
        GetDocumentResult result = new GetDocumentResult();
        try {
            // Prepare payload for PDF4me API
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => pdfBase64,
                'docName' => 'output.pdf',
                'barcodeString' => barcodeString,
                'barcodeFilter' => barcodeFilter,
                'barcodeType' => barcodeType,
                'splitBarcodePage' => splitBarcodePage,
                'combinePagesWithSameConsecutiveBarcodes' => combinePagesWithSameConsecutiveBarcodes,
                'pdfRenderDpi' => pdfRenderDpi,
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
                result.error = 'ERROR: PDF4me split by barcode failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }

            // Get the split file as base64 (could be a PDF or ZIP)
            result.base64 = EncodingUtil.base64Encode(resultBlob);

            // Save the split file as a Salesforce File (ContentVersion)
            String outputFileName = 'split_by_barcode.zip';
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