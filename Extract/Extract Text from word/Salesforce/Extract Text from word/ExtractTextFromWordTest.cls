@isTest
public class ExtractTextFromWordTest {
    @isTest
    static void testExtractAndSave_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractTextFromWordMock(200));
        ExtractTextFromWord.ExtractTextFromWordResult result = ExtractTextFromWord.extractAndSave('dGVzdA==', 'input.docx', 1, 3, true, true, true);
        Test.stopTest();
        System.assertEquals('Extracted text content', result.textResult, 'Extracted text should match');
        System.assert(result.downloadUrl.contains('/sfc/servlet.shepherd/document/download/'), 'Download URL should be present');
        System.assertEquals(null, result.error, 'Error should be null');
    }

    @isTest
    static void testExtractAndSave_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractTextFromWordMock(400));
        ExtractTextFromWord.ExtractTextFromWordResult result = ExtractTextFromWord.extractAndSave('dGVzdA==', 'input.docx', 1, 3, true, true, true);
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
        String publicUrl = ExtractTextFromWord.makeFilePublic(insertedCV.ContentDocumentId);
        System.assert(publicUrl != null && publicUrl.startsWith('http'), 'Public URL should be returned');
    }

    // Mock for HTTP callouts
    class ExtractTextFromWordMock implements HttpCalloutMock {
        Integer status;
        Integer pollCount = 0;
        ExtractTextFromWordMock(Integer status) { this.status = status; }
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if (status == 200) {
                res.setStatusCode(200);
                res.setBody('Extracted text content');
            } else if (status == 202) {
                if (pollCount == 0) {
                    res.setStatusCode(202);
                    res.setHeader('Location', 'https://api.pdf4me.com/poll/123');
                    pollCount++;
                } else {
                    res.setStatusCode(200);
                    res.setBody('Extracted text content');
                }
            } else {
                res.setStatusCode(400);
                res.setBody('Error');
            }
            return res;
        }
    }
} 