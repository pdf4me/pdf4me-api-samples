@isTest
public class GenerateCreateSwissQrBillTest {
    @isTest
    static void testCreateSwissQrBill_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new SwissQrBillMock(200));
        GenerateCreateSwissQrBill.SwissQrBillResult result = GenerateCreateSwissQrBill.createSwissQrBillAndSave(
            'dGVzdA==', 'test.pdf', 'CH0200700110003765824', 'Test AG', 'S', 'Test Strasse', '1', '8000', 'Zurich', '1000', 'CHF', 'Test Debt AG', 'S', 'Test Deb Strasse', '2', '8000', 'Zurich', 'NON', 'English', 'LineWithScissor'
        );
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(String.isBlank(result.error), 'Error should be blank');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }
    @isTest
    static void testCreateSwissQrBill_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new SwissQrBillMock(400));
        GenerateCreateSwissQrBill.SwissQrBillResult result = GenerateCreateSwissQrBill.createSwissQrBillAndSave(
            'dGVzdA==', 'test.pdf', 'CH0200700110003765824', 'Test AG', 'S', 'Test Strasse', '1', '8000', 'Zurich', '1000', 'CHF', 'Test Debt AG', 'S', 'Test Deb Strasse', '2', '8000', 'Zurich', 'NON', 'English', 'LineWithScissor'
        );
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertNotEquals(null, result.error, 'Error should not be null');
    }
    class SwissQrBillMock implements HttpCalloutMock {
        Integer status;
        SwissQrBillMock(Integer status) { this.status = status; }
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if(status == 200) {
                res.setStatusCode(200);
                res.setBodyAsBlob(Blob.valueOf('PDFDATA'));
            } else {
                res.setStatusCode(400);
                res.setBody('Error');
            }
            return res;
        }
    }
} 