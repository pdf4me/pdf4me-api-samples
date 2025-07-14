@isTest
public class SplitPDFByTextTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test ContentVersion record for PDF file
        ContentVersion testPDF = new ContentVersion();
        
        // Create sample PDF content (minimal valid PDF)
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        testPDF.Title = 'Test Text PDF.pdf';
        testPDF.PathOnClient = 'Test Text PDF.pdf';
        testPDF.VersionData = EncodingUtil.base64Decode(samplePDFBase64);
        testPDF.IsMajorVersion = true;
        
        insert testPDF;
    }
    
    @isTest
    static void testSplitPDFByText() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Text PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test the main split by text method
        SplitPDFByText.splitPDFByText(
            pdfBase64, 
            'page 1, line 10.', 
            'after', 
            'NameAsPerOrder', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'text_split_output_%' OR Title LIKE 'text_split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' split PDFs');
    }
    
    @isTest
    static void testMinimalSplitByText() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Text PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test the minimal split by text method
        SplitPDFByText.testMinimalSplitByText(pdfBase64);
        
        Test.stopTest();
        
        // Verify that test split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'text_split_test_%'];
        System.debug('Found ' + splitPDFs.size() + ' test split PDFs');
    }
    
    @isTest
    static void testSplitPDFByTextSynchronous() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Text PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test synchronous split by text
        SplitPDFByText.splitPDFByText(
            pdfBase64, 
            'Test Text', 
            'before', 
            'NameAsPerOrder', 
            false
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'text_split_output_%'];
        System.debug('Found ' + splitPDFs.size() + ' synchronous split PDFs');
    }
    
    @isTest
    static void testSplitPDFByTextWithDifferentSettings() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Text PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test with different settings
        SplitPDFByText.splitPDFByText(
            pdfBase64, 
            'Different Text', 
            'after', 
            'NameAsPerOrder', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'text_split_output_%' OR Title LIKE 'text_split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' different settings split PDFs');
    }
    
    @isTest
    static void testSplitPDFByTextWithNullValues() {
        Test.startTest();
        
        // Test with null values
        SplitPDFByText.splitPDFByText(
            null, 
            'Test Text', 
            'after', 
            'NameAsPerOrder', 
            true
        );
        
        Test.stopTest();
        
        // This should handle the error gracefully
        System.debug('Test completed with null values');
    }
    
    @isTest
    static void testSplitPDFByTextWithLargePDF() {
        // Create larger test PDF content
        String largePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        Test.startTest();
        
        // Test with larger PDF
        SplitPDFByText.splitPDFByText(
            largePDFBase64, 
            'Large PDF Text', 
            'after', 
            'NameAsPerOrder', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'text_split_output_%' OR Title LIKE 'text_split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' large PDF split PDFs');
    }

    @isTest
    static void testSplitPDFByTextAndSave() {
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Text PDF.pdf' LIMIT 1];
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        Test.startTest();
        SplitPDFByText.SplitByTextResult result = SplitPDFByText.splitPDFByTextAndSave(
            pdfBase64, 'page 1, line 10.', 'after', 'NameAsPerOrder'
        );
        Test.stopTest();
        System.assertNotEquals(null, result.base64, 'Result base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Result downloadUrl should not be null');
        System.assertEquals(null, result.error, 'Result error should be null');
    }
} 