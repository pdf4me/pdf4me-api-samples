@isTest
public class ConvertPdfToEditablePdfUsingOcrTest {
    @isTest
    static void testConvertAndSave_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ConvertPdfToEditablePdfUsingOcrMock(200));
        ConvertPdfToEditablePdfUsingOcr.EditablePdfResult result = ConvertPdfToEditablePdfUsingOcr.convertAndSave('dGVzdA==', 'input', 'Draft', true, 'English', 'true', true);
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(String.isBlank(result.error), 'Error should be blank');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }

    @isTest
    static void testConvertAndSave_Async() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ConvertPdfToEditablePdfUsingOcrMock(202));
        ConvertPdfToEditablePdfUsingOcr.EditablePdfResult result = ConvertPdfToEditablePdfUsingOcr.convertAndSave('dGVzdA==', 'input', 'Draft', true, 'English', 'true', true);
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(String.isBlank(result.error), 'Error should be blank');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }

    @isTest
    static void testConvertAndSave_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ConvertPdfToEditablePdfUsingOcrMock(400));
        ConvertPdfToEditablePdfUsingOcr.EditablePdfResult result = ConvertPdfToEditablePdfUsingOcr.convertAndSave('dGVzdA==', 'input', 'Draft', true, 'English', 'true', true);
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertNotEquals(null, result.error, 'Error should not be null');
    }

    class ConvertPdfToEditablePdfUsingOcrMock implements HttpCalloutMock {
        Integer status;
        Integer pollCount = 0;
        ConvertPdfToEditablePdfUsingOcrMock(Integer status) { this.status = status; }
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if (status == 200) {
                res.setStatusCode(200);
                res.setBodyAsBlob(Blob.valueOf('PDFDATA'));
            } else if (status == 202) {
                if (pollCount == 0) {
                    res.setStatusCode(202);
                    res.setHeader('Location', 'https://api.pdf4me.com/poll/123');
                    pollCount++;
                } else {
                    res.setStatusCode(200);
                    res.setBodyAsBlob(Blob.valueOf('PDFDATA'));
                }
            } else {
                res.setStatusCode(400);
                res.setBody('Error');
            }
            return res;
        }
    }
} 