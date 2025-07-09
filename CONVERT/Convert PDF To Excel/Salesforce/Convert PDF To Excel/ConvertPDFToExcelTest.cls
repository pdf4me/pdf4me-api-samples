@isTest
private class ConvertPDFToExcelTest {
    
    @isTest
    static void testConvertPDFToExcelAndSave_Success() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new SuccessMock());
        
        ConvertPDFToExcel.ExcelResult result = ConvertPDFToExcel.convertPDFToExcelAndSave(
            'FAKE_BASE64_PDF', 'High', false, 'en', true, true, 'TestSpreadsheet'
        );
        
        Test.stopTest();
        
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(null, result.error, 'Should not have error');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
        System.assert(result.downloadUrl.contains('/sfc/servlet.shepherd/document/download/'), 'Should contain Salesforce download URL');
    }
    
    @isTest
    static void testConvertPDFToExcelAndSave_Async() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new AsyncMock());
        
        ConvertPDFToExcel.ExcelResult result = ConvertPDFToExcel.convertPDFToExcelAndSave(
            'FAKE_BASE64_PDF', 'High', false, 'en', true, true, 'TestSpreadsheet'
        );
        
        Test.stopTest();
        
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(null, result.error, 'Should not have error');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }
    
    @isTest
    static void testConvertPDFToExcelAndSave_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ErrorMock());
        
        ConvertPDFToExcel.ExcelResult result = ConvertPDFToExcel.convertPDFToExcelAndSave(
            'FAKE_BASE64_PDF', 'High', false, 'en', true, true, 'TestSpreadsheet'
        );
        
        Test.stopTest();
        
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertNotEquals(null, result.error, 'Should have error');
        System.assert(result.error.contains('ERROR:'), 'Error should contain ERROR prefix');
    }
    
    @isTest
    static void testMakeFilePublic_Success() {
        // Create a test ContentVersion
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Test Excel Spreadsheet';
        cv.PathOnClient = 'test.xlsx';
        cv.VersionData = Blob.valueOf('Test data');
        cv.IsMajorVersion = true;
        insert cv;
        
        ContentVersion insertedCV = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        
        Test.startTest();
        String publicUrl = ConvertPDFToExcel.makeFilePublic(insertedCV.ContentDocumentId);
        Test.stopTest();
        
        System.assertNotEquals(null, publicUrl, 'Public URL should not be null');
        System.assert(!publicUrl.contains('ERROR:'), 'Should not contain error');
    }
    
    @isTest
    static void testMakeFilePublic_Error() {
        Test.startTest();
        String publicUrl = ConvertPDFToExcel.makeFilePublic('InvalidId');
        Test.stopTest();
        
        System.assertNotEquals(null, publicUrl, 'Public URL should not be null');
        System.assert(publicUrl.contains('ERROR:'), 'Should contain error');
    }
    
    // Mock Classes
    private class SuccessMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setBody('FAKE_XLSX_DATA');
            return res;
        }
    }
    
    private class AsyncMock implements HttpCalloutMock {
        Integer callCount = 0;
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            if (req.getMethod() == 'POST') {
                res.setStatusCode(202);
                res.setHeader('Location', 'https://mock.polling.url/xlsx');
            } else if (req.getMethod() == 'GET' && req.getEndpoint().contains('mock.polling.url')) {
                if (callCount == 0) {
                    res.setStatusCode(202);
                    callCount++;
                } else {
                    res.setStatusCode(200);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setBody('FAKE_XLSX_DATA');
                }
            } else {
                res.setStatusCode(400);
                res.setBody('Bad request');
            }
            return res;
        }
    }
    
    private class ErrorMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(500);
            res.setBody('Internal Server Error');
            return res;
        }
    }
} 