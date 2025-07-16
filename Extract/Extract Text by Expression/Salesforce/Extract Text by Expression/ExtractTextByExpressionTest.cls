@isTest
public class ExtractTextByExpressionTest {
    @isTest
    static void testExtractAndSave_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractTextByExpressionMock(200));
        ExtractTextByExpression.ExtractTextByExpressionResult result = ExtractTextByExpression.extractAndSave('dGVzdA==', 'input.pdf', '%', '1-3');
        Test.stopTest();
        System.assertEquals(2, result.matches.size(), 'Should extract two matches');
        System.assertEquals('match1', result.matches[0], 'First match should be match1');
        System.assert(result.downloadUrl.contains('/sfc/servlet.shepherd/document/download/'), 'Download URL should be present');
        System.assertEquals(null, result.error, 'Error should be null');
    }

    @isTest
    static void testExtractAndSave_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractTextByExpressionMock(400));
        ExtractTextByExpression.ExtractTextByExpressionResult result = ExtractTextByExpression.extractAndSave('dGVzdA==', 'input.pdf', '%', '1-3');
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
        String publicUrl = ExtractTextByExpression.makeFilePublic(insertedCV.ContentDocumentId);
        System.assert(publicUrl != null && publicUrl.startsWith('http'), 'Public URL should be returned');
    }

    // Mock for HTTP callouts
    class ExtractTextByExpressionMock implements HttpCalloutMock {
        Integer status;
        Integer pollCount = 0;
        ExtractTextByExpressionMock(Integer status) { this.status = status; }
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if (status == 200) {
                res.setStatusCode(200);
                res.setBody('{"matches":["match1","match2"]}');
            } else if (status == 202) {
                if (pollCount == 0) {
                    res.setStatusCode(202);
                    res.setHeader('Location', 'https://api.pdf4me.com/poll/123');
                    pollCount++;
                } else {
                    res.setStatusCode(200);
                    res.setBody('{"matches":["match1","match2"]}');
                }
            } else {
                res.setStatusCode(400);
                res.setBody('Error');
            }
            return res;
        }
    }
} 