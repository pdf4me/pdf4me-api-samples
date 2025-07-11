@isTest
public class ExtractFormDataFromPDFTest {
    @isTest
    static void testExtractAndSave_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractFormDataFromPDFMock(200));
        ExtractFormDataFromPDF.ExtractFormDataResult result = ExtractFormDataFromPDF.extractAndSave('dGVzdA==', 'input.pdf');
        Test.stopTest();
        System.assertEquals(1, result.formFields.size(), 'Should extract one form field');
        System.assertEquals('field1', result.formFields[0].get('name'), 'Field name should match');
        System.assertEquals('val1', result.formFields[0].get('value'), 'Field value should match');
        System.assert(result.downloadUrl.contains('/sfc/servlet.shepherd/document/download/'), 'Download URL should be present');
        System.assertEquals(null, result.error, 'Error should be null');
    }

    @isTest
    static void testExtractAndSave_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractFormDataFromPDFMock(400));
        ExtractFormDataFromPDF.ExtractFormDataResult result = ExtractFormDataFromPDF.extractAndSave('dGVzdA==', 'input.pdf');
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
        String publicUrl = ExtractFormDataFromPDF.makeFilePublic(insertedCV.ContentDocumentId);
        System.assert(publicUrl != null && publicUrl.startsWith('http'), 'Public URL should be returned');
    }

    // Mock for HTTP callouts
    class ExtractFormDataFromPDFMock implements HttpCalloutMock {
        Integer status;
        Integer pollCount = 0;
        ExtractFormDataFromPDFMock(Integer status) { this.status = status; }
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if (status == 200) {
                res.setStatusCode(200);
                res.setBody('{"formFields":[{"name":"field1","value":"val1"}]}');
            } else if (status == 202) {
                if (pollCount == 0) {
                    res.setStatusCode(202);
                    res.setHeader('Location', 'https://api.pdf4me.com/poll/123');
                    pollCount++;
                } else {
                    res.setStatusCode(200);
                    res.setBody('{"formFields":[{"name":"field1","value":"val1"}]}');
                }
            } else {
                res.setStatusCode(400);
                res.setBody('Error');
            }
            return res;
        }
    }
} 