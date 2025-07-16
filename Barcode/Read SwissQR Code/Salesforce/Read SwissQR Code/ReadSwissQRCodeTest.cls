@isTest
private class ReadSwissQRCodeTest {
    
    @isTest
    static void testReadSwissQRCodeAndSave_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new SynchronousSwissQRMock());
        
        // Use a minimal valid PDF base64 content for testing
        String validPDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgMyAwIFIgXQ0KPj4NCmVuZG9iag0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDIgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDQgMCBSDQo+Pg0KPj4NCi9NZWRpYUJveCBbIDAgMCA1OTUgODQyIF0NCi9Db250ZW50cyA1IDAgUg0KPj4NCmVuZG9iag0KNCAwIG9iag0KPDwNCi9UeXBlIC9Gb250DQovU3VidHlwZSAvVHlwZTENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZw0KPj4NCmVuZG9iag0KNSAwIG9iag0KPDwNCi9MZW5ndGggNDQNCj4+DQpzdHJlYW0NCi9GMSAxMiBUZg0KMCBnDQo5MCA3MjAgVGQNCi9UMSA8PA0KL0ZvbnQgL0YxDQo+Pg0KKEhlbGxvIFdvcmxkKSBUag0KRVQNCmVuZG9iag0KeHJlZg0KMCA2DQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
        
        ReadSwissQRCode.SwissQRResult result = ReadSwissQRCode.readSwissQRCodeAndSave(
            validPDFBase64, 'Test_SwissQR_Output'
        );
        Test.stopTest();
        
        // Assertions
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(null, result.error, 'Error should be null for successful operation');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
        System.assertNotEquals(null, result.qrData, 'QR data should not be null');
        System.assert(result.downloadUrl.contains('/sfc/servlet.shepherd/document/download/'), 'Download URL should contain the correct path');
    }

    @isTest
    static void testReadSwissQRCodeAndSave_Async() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new AsyncSwissQRMock());
        
        // Use a minimal valid PDF base64 content for testing
        String validPDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgMyAwIFIgXQ0KPj4NCmVuZG9iag0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDIgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDQgMCBSDQo+Pg0KPj4NCi9NZWRpYUJveCBbIDAgMCA1OTUgODQyIF0NCi9Db250ZW50cyA1IDAgUg0KPj4NCmVuZG9iag0KNCAwIG9iag0KPDwNCi9UeXBlIC9Gb250DQovU3VidHlwZSAvVHlwZTENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZw0KPj4NCmVuZG9iag0KNSAwIG9iag0KPDwNCi9MZW5ndGggNDQNCj4+DQpzdHJlYW0NCi9GMSAxMiBUZg0KMCBnDQo5MCA3MjAgVGQNCi9UMSA8PA0KL0ZvbnQgL0YxDQo+Pg0KKEhlbGxvIFdvcmxkKSBUag0KRVQNCmVuZG9iag0KeHJlZg0KMCA2DQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
        
        ReadSwissQRCode.SwissQRResult result = ReadSwissQRCode.readSwissQRCodeAndSave(
            validPDFBase64, 'Test_SwissQR_Async'
        );
        Test.stopTest();
        
        // Assertions
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(null, result.error, 'Error should be null for successful operation');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }

    @isTest
    static void testReadSwissQRCodeAndSave_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ErrorSwissQRMock());
        
        // Use a minimal valid PDF base64 content for testing
        String validPDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgMyAwIFIgXQ0KPj4NCmVuZG9iag0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDIgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDQgMCBSDQo+Pg0KPj4NCi9NZWRpYUJveCBbIDAgMCA1OTUgODQyIF0NCi9Db250ZW50cyA1IDAgUg0KPj4NCmVuZG9iag0KNCAwIG9iag0KPDwNCi9UeXBlIC9Gb250DQovU3VidHlwZSAvVHlwZTENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZw0KPj4NCmVuZG9iag0KNSAwIG9iag0KPDwNCi9MZW5ndGggNDQNCj4+DQpzdHJlYW0NCi9GMSAxMiBUZg0KMCBnDQo5MCA3MjAgVGQNCi9UMSA8PA0KL0ZvbnQgL0YxDQo+Pg0KKEhlbGxvIFdvcmxkKSBUag0KRVQNCmVuZG9iag0KeHJlZg0KMCA2DQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
        
        ReadSwissQRCode.SwissQRResult result = ReadSwissQRCode.readSwissQRCodeAndSave(
            validPDFBase64, 'Test_SwissQR_Error'
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
        cv.Title = 'Test Swiss QR Result';
        cv.PathOnClient = 'test.json';
        cv.VersionData = Blob.valueOf('{"qrData":{"field1":"value1","field2":"value2"}}');
        cv.IsMajorVersion = true;
        insert cv;
        
        // Get the ContentDocumentId
        ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        
        Test.startTest();
        String publicUrl = ReadSwissQRCode.makeFilePublic(insertedCV.ContentDocumentId);
        Test.stopTest();
        
        // Assertions
        System.assertNotEquals(null, publicUrl, 'Public URL should not be null');
        System.assert(!publicUrl.startsWith('ERROR:'), 'Public URL should not be an error');
    }

    // Mock for synchronous (200) response
    private class SynchronousSwissQRMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"qrData":{"field1":"value1","field2":"value2"}}');
            return res;
        }
    }

    // Mock for asynchronous (202) response and polling
    private class AsyncSwissQRMock implements HttpCalloutMock {
        Integer callCount = 0;
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if (req.getMethod() == 'POST') {
                res.setStatusCode(202);
                res.setHeader('Location', 'https://mock.polling.url/swissqr');
            } else if (req.getMethod() == 'GET' && req.getEndpoint().contains('mock.polling.url')) {
                // Simulate polling: first call returns 202, second returns 200
                if (callCount == 0) {
                    res.setStatusCode(202);
                    callCount++;
                } else {
                    res.setStatusCode(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.setBody('{"qrData":{"field1":"value1","field2":"value2"}}');
                }
            } else {
                res.setStatusCode(400);
                res.setBody('Bad request');
            }
            return res;
        }
    }

    // Mock for error response
    private class ErrorSwissQRMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(400);
            res.setBody('Bad Request - Invalid parameters');
            return res;
        }
    }
} 