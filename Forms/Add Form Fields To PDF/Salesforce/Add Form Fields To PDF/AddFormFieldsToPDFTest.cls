@isTest
public class AddFormFieldsToPDFTest {
    @isTest
    static void testAddFormField_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new AddFormFieldsToPDFMock(200));
        AddFormFieldsToPDF.FormFieldResult result = AddFormFieldsToPDF.addFormFieldAndSave(
            'dGVzdA==', 'input.pdf', 'New input text', 300, 300, 'Input Field Name', 4, '1', 'TextBox'
        );
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(String.isBlank(result.error), 'Error should be blank');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }
    
    @isTest
    static void testAddFormField_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new AddFormFieldsToPDFMock(400));
        AddFormFieldsToPDF.FormFieldResult result = AddFormFieldsToPDF.addFormFieldAndSave(
            'dGVzdA==', 'input.pdf', 'New input text', 300, 300, 'Input Field Name', 4, '1', 'TextBox'
        );
        Test.stopTest();
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertNotEquals(null, result.error, 'Error should not be null');
    }
    
    class AddFormFieldsToPDFMock implements HttpCalloutMock {
        Integer status;
        AddFormFieldsToPDFMock(Integer status) { this.status = status; }
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