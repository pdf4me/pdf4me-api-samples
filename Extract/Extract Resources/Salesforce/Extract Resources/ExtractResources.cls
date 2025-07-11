public with sharing class ExtractResources {
    public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
    public static final String ENDPOINT_URL = 'https://api.pdf4me.com/api/v2/ExtractResources';

    public class ExtractResourcesResult {
        public List<String> texts;
        public List<String> imageDownloadUrls;
        public String downloadUrl;
        public String error;
    }

    private static String pollForExtractResourcesResult(String locationUrl, String apiKey) {
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
                return pollResponse.getBody();
            } else if (pollResponse.getStatusCode() == 202) {
                System.debug('Still processing, retrying immediately...');
            } else {
                throw new AuraHandledException('Polling failed: ' + pollResponse.getStatusCode() + ' - ' + pollResponse.getBody());
            }
        }
        throw new AuraHandledException('Timeout: Extraction did not complete after multiple retries.');
    }

    public static ExtractResourcesResult extractAndSave(String pdfBase64, String docName, Boolean extractText, Boolean extractImage) {
        ExtractResourcesResult result = new ExtractResourcesResult();
        result.texts = new List<String>();
        result.imageDownloadUrls = new List<String>();
        try {
            Map<String, Object> payload = new Map<String, Object>{
                'docContent' => pdfBase64,
                'docName' => docName,
                'extractText' => extractText,
                'extractImage' => extractImage,
                'async' => false
            };
            String jsonBody = JSON.serialize(payload);

            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(ENDPOINT_URL);
            request.setMethod('POST');
            request.setHeader('Authorization', 'Basic ' + API_KEY);
            request.setHeader('Content-Type', 'application/json');
            request.setBody(jsonBody);
            request.setTimeout(120000);
            HttpResponse response = http.send(request);

            String jsonResult;
            if (response.getStatusCode() == 200) {
                jsonResult = response.getBody();
            } else if (response.getStatusCode() == 202) {
                String locationUrl = response.getHeader('Location');
                if (String.isBlank(locationUrl)) {
                    result.error = 'ERROR: 202 Accepted but no Location header for polling.';
                    return result;
                }
                jsonResult = pollForExtractResourcesResult(locationUrl, API_KEY);
            } else {
                result.error = 'ERROR: PDF4me resource extraction failed. Status code: ' + response.getStatusCode() + ' - ' + response.getBody();
                return result;
            }

            Map<String, Object> resultMap = (Map<String, Object>) JSON.deserializeUntyped(jsonResult);
            if (resultMap.containsKey('texts')) {
                List<Object> texts = (List<Object>) resultMap.get('texts');
                for (Object text : texts) {
                    result.texts.add((String)text);
                }
            }
            if (resultMap.containsKey('images')) {
                List<Object> images = (List<Object>) resultMap.get('images');
                for (Integer i = 0; i < images.size(); i++) {
                    String imageBase64 = (String) images[i];
                    if (String.isNotBlank(imageBase64)) {
                        Blob imageBlob = EncodingUtil.base64Decode(imageBase64);
                        String imageName = 'Extracted_Image_' + (i + 1) + '.png';
                        ContentVersion cv = new ContentVersion();
                        cv.Title = imageName;
                        cv.PathOnClient = imageName;
                        cv.VersionData = imageBlob;
                        cv.IsMajorVersion = true;
                        insert cv;
                        ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
                        String downloadUrl = '/sfc/servlet.shepherd/document/download/' + insertedCV.ContentDocumentId;
                        result.imageDownloadUrls.add(downloadUrl);
                    }
                }
            }

            Blob jsonBlob = Blob.valueOf(jsonResult);
            ContentVersion cv = new ContentVersion();
            cv.Title = docName + '_resources';
            cv.PathOnClient = docName + '_resources.json';
            cv.VersionData = jsonBlob;
            cv.IsMajorVersion = true;
            insert cv;

            ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
            result.downloadUrl = '/sfc/servlet.shepherd/document/download/' + insertedCV.ContentDocumentId;

            return result;
        } catch (Exception ex) {
            if (result == null) {
                result = new ExtractResourcesResult();
                result.texts = new List<String>();
                result.imageDownloadUrls = new List<String>();
            }
            result.error = 'ERROR: ' + ex.getMessage();
            return result;
        }
    }

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