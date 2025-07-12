@isTest
public class GenerateGetTrackingChangesInWordTest {
    @isTest
    static void testGetTrackingChanges_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new GetTrackingChangesMock(200));
        GenerateGetTrackingChangesInWord.GetTrackingChangesResult result = GenerateGetTrackingChangesInWord.getTrackingChangesAndSave('dGVzdA==', 'output.docx');
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(String.isBlank(result.error), 'Error should be blank');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }
    @isTest
    static void testGetTrackingChanges_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new GetTrackingChangesMock(400));
        GenerateGetTrackingChangesInWord.GetTrackingChangesResult result = GenerateGetTrackingChangesInWord.getTrackingChangesAndSave('dGVzdA==', 'output.docx');
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertNotEquals(null, result.error, 'Error should not be null');
    }
    class GetTrackingChangesMock implements HttpCalloutMock {
        Integer status;
        GetTrackingChangesMock(Integer status) { this.status = status; }
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