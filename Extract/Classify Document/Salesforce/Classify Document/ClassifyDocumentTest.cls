@isTest
public class ClassifyDocumentTest {
    @isTest
    static void testClassifyAndSave_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ClassifyDocumentMock(200));
        ClassifyDocument.ClassifyResult result = ClassifyDocument.classifyAndSave('dGVzdA==', 'input.pdf');
        Test.stopTest();
        System.assert(result.jsonResult != null && result.jsonResult.contains('Invoice'), 'Should contain Invoice in result');
        System.assert(result.downloadUrl.contains('/sfc/servlet.shepherd/document/download/'), 'Download URL should be present');
        System.assertEquals(null, result.error, 'Error should be null');
    }

    @isTest
    static void testClassifyAndSave_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ClassifyDocumentMock(400));
        ClassifyDocument.ClassifyResult result = ClassifyDocument.classifyAndSave('dGVzdA==', 'input.pdf');
        Test.stopTest();
        System.assert(result.error != null, 'Error should not be null');
    }

    @isTest
    static void testMakeFilePublic() {
        // Create a dummy ContentVersion
        ContentVersion cv = new ContentVersion();
        cv.Title = 'TestFile';
        cv.PathOnClient = 'TestFile.txt';
        cv.VersionData = Blob.valueOf('test');
        cv.IsMajorVersion = true;
        insert cv;
        ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        String publicUrl = ClassifyDocument.makeFilePublic(insertedCV.ContentDocumentId);
        System.assert(publicUrl != null && publicUrl.startsWith('http'), 'Public URL should be returned');
    }

    // Mock for HTTP callouts
    class ClassifyDocumentMock implements HttpCalloutMock {
        Integer status;
        Integer pollCount = 0;
        ClassifyDocumentMock(Integer status) { this.status = status; }
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if(status == 200) {
                res.setStatusCode(200);
                res.setBody('{"documentType":"Invoice","confidence":0.98}');
            } else if(status == 202) {
                if(pollCount == 0) {
                    res.setStatusCode(202);
                    res.setHeader('Location', 'https://api.pdf4me.com/poll/123');
                    pollCount++;
                } else {
                    res.setStatusCode(200);
                    res.setBody('{"documentType":"Invoice","confidence":0.98}');
                }
            } else {
                res.setStatusCode(400);
                res.setBody('Error');
            }
            return res;
        }
    }
} 