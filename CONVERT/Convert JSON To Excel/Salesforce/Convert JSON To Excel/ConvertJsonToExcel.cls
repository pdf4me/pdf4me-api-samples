public with sharing class ConvertJsonToExcel {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/ConvertJsonToExcel';

    // Helper method to poll for async result
    private static Blob pollForJsonToExcelResult(String locationUrl, String apiKey) {
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
        throw new AuraHandledException('Timeout: JSON to Excel conversion did not complete after multiple retries.');
    }

    // Combined method: converts JSON to Excel and saves as Salesforce File, returns both base64 and download URL
    public static JsonToExcelResult convertJsonToExcelAndSave(String jsonBase64, String worksheetName, Boolean isTitleWrapText, Boolean isTitleBold, Boolean convertNumberAndDate, String numberFormat, String dateFormat, Boolean ignoreNullValues, Integer firstRow, Integer firstColumn, String outputFileName) {
        JsonToExcelResult result = new JsonToExcelResult();
        try {
            // Step 1: Prepare the PDF4me API payload for JSON to Excel conversion
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => jsonBase64,
                'docName' => outputFileName + '.json',
                'worksheetName' => worksheetName,
                'isTitleWrapText' => isTitleWrapText,
                'isTitleBold' => isTitleBold,
                'convertNumberAndDate' => convertNumberAndDate,
                'numberFormat' => numberFormat,
                'dateFormat' => dateFormat,
                'ignoreNullValues' => ignoreNullValues,
                'firstRow' => firstRow,
                'firstColumn' => firstColumn,
                'async' => false
            };
            String jsonBody = JSON.serialize(payload);

            // Step 2: Call the PDF4me API
            Http http = new Http();
            HttpRequest jsonRequest = new HttpRequest();
            jsonRequest.setEndpoint(ENDPOINT_URL);
            jsonRequest.setMethod('POST');
            jsonRequest.setHeader('Authorization', 'Basic ' + API_KEY);
            jsonRequest.setHeader('Content-Type', 'application/json');
            jsonRequest.setBody(jsonBody);
            HttpResponse jsonResponse = http.send(jsonRequest);

            Blob excelBlob;
            if (jsonResponse.getStatusCode() == 200) {
                excelBlob = jsonResponse.getBodyAsBlob();
            } else if (jsonResponse.getStatusCode() == 202) {
                String locationUrl = jsonResponse.getHeader('Location');
                if (String.isBlank(locationUrl)) {
                    result.error = 'ERROR: 202 Accepted but no Location header for polling.';
                    return result;
                }
                excelBlob = pollForJsonToExcelResult(locationUrl, API_KEY);
            } else {
                result.error = 'ERROR: PDF4me JSON to Excel conversion failed. Status code: ' + jsonResponse.getStatusCode() + ' - ' + jsonResponse.getBody();
                return result;
            }

            // Step 3: Get the Excel as base64
            result.base64 = EncodingUtil.base64Encode(excelBlob);

            // Step 4: Save the Excel as a Salesforce File (ContentVersion)
            ContentVersion cv = new ContentVersion();
            cv.Title = outputFileName;
            cv.PathOnClient = outputFileName + '.xlsx';
            cv.VersionData = excelBlob;
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