@isTest
public class FillPDFFormTest {
    @isTest
    static void testFillForm_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new FillPDFFormMock(200));
        Map<String, String> formData = new Map<String, String>{
            'firstname' => 'John', 
            'lastname' => 'Adams', 
            'gender' => 'Male'
        };
        FillPDFForm.FillFormResult result = FillPDFForm.fillFormAndSave('dGVzdA==', 'input.pdf', formData);
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(String.isBlank(result.error), 'Error should be blank');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }
    
    @isTest
    static void testFillForm_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new FillPDFFormMock(400));
        Map<String, String> formData = new Map<String, String>{
            'firstname' => 'John', 
            'lastname' => 'Adams', 
            'gender' => 'Male'
        };
        FillPDFForm.FillFormResult result = FillPDFForm.fillFormAndSave('dGVzdA==', 'input.pdf', formData);
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertNotEquals(null, result.error, 'Error should not be null');
    }
    
    class FillPDFFormMock implements HttpCalloutMock {
        Integer status;
        FillPDFFormMock(Integer status) { this.status = status; }
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if (status == 200) {
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