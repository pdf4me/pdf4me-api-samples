public with sharing class SplitPDFByBarcode {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old';

    // Result wrapper class for split by barcode operation
    public class SplitByBarcodeResult {
        public String base64;
        public String downloadUrl;
        public String error;
    }

    /**
     * Splits a PDF document by barcode using the PDF4me API.
     * Saves the first split PDF as a Salesforce File and returns base64, download URL, and error (if any).
     * @param pdfBase64 The base64-encoded PDF document to split.
     * @param barcodeString The barcode string to search for.
     * @param barcodeFilter The filter type: 'startsWith', 'endsWith', 'contains', 'exact'.
     * @param barcodeType The barcode type: 'any', 'datamatrix', 'qrcode', 'pdf417'.
     * @param splitBarcodePage The split position: 'before', 'after', 'remove'.
     * @param combinePagesWithSameConsecutiveBarcodes Whether to combine consecutive pages with same barcode.
     * @param pdfRenderDpi The PDF render DPI.
     * @return SplitByBarcodeResult containing base64, downloadUrl, and error for the first split PDF.
     */
    public static SplitByBarcodeResult splitPDFByBarcodeAndSave(
        String pdfBase64,
        String barcodeString,
        String barcodeFilter,
        String barcodeType,
        String splitBarcodePage,
        Boolean combinePagesWithSameConsecutiveBarcodes,
        String pdfRenderDpi
    ) {
        SplitByBarcodeResult result = new SplitByBarcodeResult();
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

            if (response.getStatusCode() == 200) {
                // Parse the JSON response to get split documents
                Object responseData = JSON.deserializeUntyped(response.getBody());
                String docContent;
                String docName;
                if (responseData instanceof List<Object>) {
                    // Handle array of split documents
                    List<Object> splitDocuments = (List<Object>) responseData;
                    if (!splitDocuments.isEmpty() && splitDocuments[0] instanceof Map<String, Object>) {
                        Map<String, Object> docMap = (Map<String, Object>) splitDocuments[0];
                        docContent = (String) docMap.get('docContent');
                        docName = (String) docMap.get('docName');
                    } else {
                        result.error = 'ERROR: No split documents returned.';
                        return result;
                    }
                } else if (responseData instanceof Map<String, Object>) {
                    Map<String, Object> responseMap = (Map<String, Object>) responseData;
                    if (responseMap.containsKey('splitedDocuments')) {
                        Object splitedDocs = responseMap.get('splitedDocuments');
                        if (splitedDocs instanceof List<Object> && !((List<Object>)splitedDocs).isEmpty()) {
                            Map<String, Object> docMap = (Map<String, Object>)((List<Object>)splitedDocs)[0];
                            docContent = (String) docMap.get('streamFile');
                            docName = (String) docMap.get('fileName');
                        } else {
                            result.error = 'ERROR: No split documents in splitedDocuments.';
                            return result;
                        }
                    } else if (responseMap.containsKey('docContent') && responseMap.containsKey('docName')) {
                        docContent = (String) responseMap.get('docContent');
                        docName = (String) responseMap.get('docName');
                    } else {
                        result.error = 'ERROR: Unexpected response structure.';
                        return result;
                    }
                } else {
                    result.error = 'ERROR: Unexpected response type.';
                    return result;
                }

                // Save the first split PDF as a Salesforce File (ContentVersion)
                Blob pdfBlob = EncodingUtil.base64Decode(docContent);
                result.base64 = docContent;
                ContentVersion cv = new ContentVersion();
                cv.Title = docName;
                cv.PathOnClient = docName;
                cv.VersionData = pdfBlob;
                cv.IsMajorVersion = true;
                insert cv;

                // Get the ContentDocumentId and build a download URL (relative path)
                ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
                result.downloadUrl = '/sfc/servlet.shepherd/document/download/' + insertedCV.ContentDocumentId;
                return result;
            } else if (response.getStatusCode() == 202) {
                result.error = 'ERROR: 202 Accepted but async/polling not implemented in this version.';
                return result;
            } else {
                result.error = 'ERROR: PDF4me split by barcode failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }
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