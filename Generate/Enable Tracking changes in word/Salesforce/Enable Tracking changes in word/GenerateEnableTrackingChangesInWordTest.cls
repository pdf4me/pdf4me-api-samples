@isTest
public class GenerateEnableTrackingChangesInWordTest {
    @isTest
    static void testEnableTrackingChanges_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new EnableTrackingMock(200));
        GenerateEnableTrackingChangesInWord.TrackingChangesResult result = GenerateEnableTrackingChangesInWord.enableTrackingChangesAndSave('dGVzdA==', 'output.docx');
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(String.isBlank(result.error), 'Error should be blank');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }
    @isTest
    static void testEnableTrackingChanges_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new EnableTrackingMock(400));
        GenerateEnableTrackingChangesInWord.TrackingChangesResult result = GenerateEnableTrackingChangesInWord.enableTrackingChangesAndSave('dGVzdA==', 'output.docx');
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertNotEquals(null, result.error, 'Error should not be null');
    }
    class EnableTrackingMock implements HttpCalloutMock {
        Integer status;
        EnableTrackingMock(Integer status) { this.status = status; }
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if(status == 200) {
                res.setStatusCode(200);
                res.setBodyAsBlob(Blob.valueOf('DOCDATA'));
            } else {
                res.setStatusCode(400);
                res.setBody('Error');
            }
            return res;
        }
    }
} 