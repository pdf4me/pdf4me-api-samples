@isTest
public class ExtractTableFromPDFTest {
    @isTest
    static void testExtractAndSave_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractTableFromPDFMock(200));
        ExtractTableFromPDF.ExtractTableResult result = ExtractTableFromPDF.extractAndSave('dGVzdA==', 'input.pdf');
        Test.stopTest();
        System.assertEquals(1, result.tables.size(), 'Should extract one table');
        System.assertEquals(2, result.tables[0].size(), 'Table should have two rows');
        System.assertEquals('A', result.tables[0][0][0], 'First cell should be A');
        System.assert(result.downloadUrl.contains('/sfc/servlet.shepherd/document/download/'), 'Download URL should be present');
        System.assertEquals(null, result.error, 'Error should be null');
    }

    @isTest
    static void testExtractAndSave_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractTableFromPDFMock(400));
        ExtractTableFromPDF.ExtractTableResult result = ExtractTableFromPDF.extractAndSave('dGVzdA==', 'input.pdf');
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
        String publicUrl = ExtractTableFromPDF.makeFilePublic(insertedCV.ContentDocumentId);
        System.assert(publicUrl != null && publicUrl.startsWith('http'), 'Public URL should be returned');
    }

    // Mock for HTTP callouts
    class ExtractTableFromPDFMock implements HttpCalloutMock {
        Integer status;
        Integer pollCount = 0;
        ExtractTableFromPDFMock(Integer status) { this.status = status; }
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if (status == 200) {
                res.setStatusCode(200);
                res.setBody('{"tables":[{"rows":[["A","B"],["C","D"]]}]}');
            } else if (status == 202) {
                if (pollCount == 0) {
                    res.setStatusCode(202);
                    res.setHeader('Location', 'https://api.pdf4me.com/poll/123');
                    pollCount++;
                } else {
                    res.setStatusCode(200);
                    res.setBody('{"tables":[{"rows":[["A","B"],["C","D"]]}]}');
                }
            } else {
                res.setStatusCode(400);
                res.setBody('Error');
            }
            return res;
        }
    }
} 