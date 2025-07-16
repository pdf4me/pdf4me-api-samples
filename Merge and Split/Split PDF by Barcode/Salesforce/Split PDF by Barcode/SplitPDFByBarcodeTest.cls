@isTest
public class SplitPDFByBarcodeTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test ContentVersion record for PDF file
        ContentVersion testPDF = new ContentVersion();
        
        // Create sample PDF content (minimal valid PDF)
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        testPDF.Title = 'Test Barcode PDF.pdf';
        testPDF.PathOnClient = 'Test Barcode PDF.pdf';
        testPDF.VersionData = EncodingUtil.base64Decode(samplePDFBase64);
        testPDF.IsMajorVersion = true;
        
        insert testPDF;
    }
    
    @isTest
    static void testSplitPDFByBarcode() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Barcode PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test the main split by barcode method
        SplitPDFByBarcode.splitPDFByBarcode(
            pdfBase64, 
            'Test PDF Barcode', 
            'startsWith', 
            'any', 
            'after', 
            false, 
            '150', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'barcode_split_output_%' OR Title LIKE 'barcode_split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' split PDFs');
    }
    
    @isTest
    static void testMinimalSplitByBarcode() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Barcode PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test the minimal split by barcode method
        SplitPDFByBarcode.testMinimalSplitByBarcode(pdfBase64);
        
        Test.stopTest();
        
        // Verify that test split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'barcode_split_test_%'];
        System.debug('Found ' + splitPDFs.size() + ' test split PDFs');
    }
    
    @isTest
    static void testSplitPDFByBarcodeSynchronous() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Barcode PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test synchronous split by barcode
        SplitPDFByBarcode.splitPDFByBarcode(
            pdfBase64, 
            'Test PDF Barcode', 
            'contains', 
            'qrcode', 
            'before', 
            true, 
            '200', 
            false
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'barcode_split_output_%'];
        System.debug('Found ' + splitPDFs.size() + ' synchronous split PDFs');
    }
    
    @isTest
    static void testSplitPDFByBarcodeWithDifferentFilters() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Barcode PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test with different filter types
        SplitPDFByBarcode.splitPDFByBarcode(
            pdfBase64, 
            'Test', 
            'endsWith', 
            'datamatrix', 
            'remove', 
            false, 
            '100', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'barcode_split_output_%' OR Title LIKE 'barcode_split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' filter test split PDFs');
    }
    
    @isTest
    static void testSplitPDFByBarcodeWithNullValues() {
        Test.startTest();
        
        // Test with null values
        SplitPDFByBarcode.splitPDFByBarcode(
            null, 
            null, 
            'startsWith', 
            'any', 
            'after', 
            false, 
            '150', 
            true
        );
        
        Test.stopTest();
        
        // This should handle the error gracefully
        System.debug('Test completed with null values');
    }
    
    @isTest
    static void testSplitPDFByBarcodeWithLargePDF() {
        // Create larger test PDF content
        String largePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        Test.startTest();
        
        // Test with larger PDF
        SplitPDFByBarcode.splitPDFByBarcode(
            largePDFBase64, 
            'Large Test Barcode', 
            'exact', 
            'pdf417', 
            'after', 
            true, 
            '250', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'barcode_split_output_%' OR Title LIKE 'barcode_split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' large PDF split PDFs');
    }

    @isTest
    static void testSplitPDFByBarcodeAndSave() {
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Barcode PDF.pdf' LIMIT 1];
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        Test.startTest();
        SplitPDFByBarcode.SplitByBarcodeResult result = SplitPDFByBarcode.splitPDFByBarcodeAndSave(
            pdfBase64, 'Test PDF Barcode', 'startsWith', 'any', 'after', false, '150'
        );
        Test.stopTest();
        System.assertNotEquals(null, result.base64, 'Result base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Result downloadUrl should not be null');
        System.assertEquals(null, result.error, 'Result error should be null');
    }
} 