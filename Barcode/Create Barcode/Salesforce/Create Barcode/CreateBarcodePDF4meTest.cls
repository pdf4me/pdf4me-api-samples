@isTest
private class CreateBarcodePDF4meTest {
    
    @isTest
    static void testCreateBarcodeAndSave_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new SynchronousBarcodeMock());
        
        CreateBarcodePDF4me.BarcodeResult result = CreateBarcodePDF4me.createBarcodeAndSave(
            'Test Text', 'qrCode', false, 'Test_Barcode_Output'
        );
        Test.stopTest();
        
        // Assertions
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(null, result.error, 'Error should be null for successful operation');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
        System.assert(result.downloadUrl.contains('/sfc/servlet.shepherd/document/download/'), 'Download URL should contain the correct path');
    }

    @isTest
    static void testCreateBarcodeAndSave_Async() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new AsyncBarcodeMock());
        
        CreateBarcodePDF4me.BarcodeResult result = CreateBarcodePDF4me.createBarcodeAndSave(
            'Test Text', 'qrCode', false, 'Test_Barcode_Async'
        );
        Test.stopTest();
        
        // Assertions
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(null, result.error, 'Error should be null for successful operation');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }

    @isTest
    static void testCreateBarcodeAndSave_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ErrorBarcodeMock());
        
        CreateBarcodePDF4me.BarcodeResult result = CreateBarcodePDF4me.createBarcodeAndSave(
            'Test Text', 'qrCode', false, 'Test_Barcode_Error'
        );
        Test.stopTest();
        
        // Assertions
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertNotEquals(null, result.error, 'Error should not be null for failed operation');
        System.assertEquals(null, result.base64, 'Base64 should be null for failed operation');
        System.assertEquals(null, result.downloadUrl, 'Download URL should be null for failed operation');
    }

    @isTest
    static void testMakeFilePublic() {
        // Create a test ContentVersion
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Test Barcode';
        cv.PathOnClient = 'test.png';
        cv.VersionData = Blob.valueOf('Test Image Content');
        cv.IsMajorVersion = true;
        insert cv;
        
        // Get the ContentDocumentId
        ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        
        Test.startTest();
        String publicUrl = CreateBarcodePDF4me.makeFilePublic(insertedCV.ContentDocumentId);
        Test.stopTest();
        
        // Assertions
        System.assertNotEquals(null, publicUrl, 'Public URL should not be null');
        System.assert(!publicUrl.startsWith('ERROR:'), 'Public URL should not be an error');
    }

    // Mock for synchronous (200) response
    private class SynchronousBarcodeMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setHeader('Content-Type', 'image/png');
            res.setBody('FAKE_IMAGE_DATA');
            return res;
        }
    }

    // Mock for asynchronous (202) response and polling
    private class AsyncBarcodeMock implements HttpCalloutMock {
        Integer callCount = 0;
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if (req.getMethod() == 'POST') {
                res.setStatusCode(202);
                res.setHeader('Location', 'https://mock.polling.url/barcode');
            } else if (req.getMethod() == 'GET' && req.getEndpoint().contains('mock.polling.url')) {
                // Simulate polling: first call returns 202, second returns 200
                if (callCount == 0) {
                    res.setStatusCode(202);
                    callCount++;
                } else {
                    res.setStatusCode(200);
                    res.setHeader('Content-Type', 'image/png');
                    res.setBody('FAKE_IMAGE_DATA');
                }
            } else {
                res.setStatusCode(400);
                res.setBody('Bad request');
            }
            return res;
        }
    }

    // Mock for error response
    private class ErrorBarcodeMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(400);
            res.setBody('Bad Request - Invalid parameters');
            return res;
        }
    }
} 