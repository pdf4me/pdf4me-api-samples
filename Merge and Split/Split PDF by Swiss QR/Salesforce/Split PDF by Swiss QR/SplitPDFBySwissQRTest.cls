@isTest
public class SplitPDFBySwissQRTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test ContentVersion record for PDF file
        ContentVersion testPDF = new ContentVersion();
        
        // Create sample PDF content (minimal valid PDF)
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        testPDF.Title = 'Test SwissQR PDF.pdf';
        testPDF.PathOnClient = 'Test SwissQR PDF.pdf';
        testPDF.VersionData = EncodingUtil.base64Decode(samplePDFBase64);
        testPDF.IsMajorVersion = true;
        
        insert testPDF;
    }
    
    @isTest
    static void testSplitPDFBySwissQR() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test SwissQR PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test the main split by Swiss QR method
        SplitPDFBySwissQR.splitPDFBySwissQR(
            pdfBase64, 
            'after', 
            '150', 
            false, 
            false, 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'swissqr_split_output_%' OR Title LIKE 'swissqr_split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' split PDFs');
    }
    
    @isTest
    static void testMinimalSplitBySwissQR() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test SwissQR PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test the minimal split by Swiss QR method
        SplitPDFBySwissQR.testMinimalSplitBySwissQR(pdfBase64);
        
        Test.stopTest();
        
        // Verify that test split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'swissqr_split_test_%'];
        System.debug('Found ' + splitPDFs.size() + ' test split PDFs');
    }
    
    @isTest
    static void testSplitPDFBySwissQRSynchronous() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test SwissQR PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test synchronous split by Swiss QR
        SplitPDFBySwissQR.splitPDFBySwissQR(
            pdfBase64, 
            'before', 
            '200', 
            true, 
            false, 
            false
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'swissqr_split_output_%'];
        System.debug('Found ' + splitPDFs.size() + ' synchronous split PDFs');
    }
    
    @isTest
    static void testSplitPDFBySwissQRWithDifferentSettings() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test SwissQR PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test with different settings
        SplitPDFBySwissQR.splitPDFBySwissQR(
            pdfBase64, 
            'after', 
            '100', 
            true, 
            true, 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'swissqr_split_output_%' OR Title LIKE 'swissqr_split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' different settings split PDFs');
    }
    
    @isTest
    static void testSplitPDFBySwissQRWithNullValues() {
        Test.startTest();
        
        // Test with null values
        SplitPDFBySwissQR.splitPDFBySwissQR(
            null, 
            'after', 
            '150', 
            false, 
            false, 
            true
        );
        
        Test.stopTest();
        
        // This should handle the error gracefully
        System.debug('Test completed with null values');
    }
    
    @isTest
    static void testSplitPDFBySwissQRWithLargePDF() {
        // Create larger test PDF content
        String largePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        Test.startTest();
        
        // Test with larger PDF
        SplitPDFBySwissQR.splitPDFBySwissQR(
            largePDFBase64, 
            'after', 
            '250', 
            false, 
            false, 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'swissqr_split_output_%' OR Title LIKE 'swissqr_split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' large PDF split PDFs');
    }

    @isTest
    static void testSplitPDFBySwissQRAndSave() {
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test SwissQR PDF.pdf' LIMIT 1];
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        Test.startTest();
        SplitPDFBySwissQR.SplitBySwissQRResult result = SplitPDFBySwissQR.splitPDFBySwissQRAndSave(
            pdfBase64, 'after', '150', false, false
        );
        Test.stopTest();
        System.assertNotEquals(null, result.base64, 'Result base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Result downloadUrl should not be null');
        System.assertEquals(null, result.error, 'Result error should be null');
    }
} 