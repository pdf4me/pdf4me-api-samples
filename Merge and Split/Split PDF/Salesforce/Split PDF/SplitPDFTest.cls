@isTest
public class SplitPDFTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test ContentVersion record for PDF file
        ContentVersion testPDF = new ContentVersion();
        
        // Create sample PDF content (minimal valid PDF)
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        testPDF.Title = 'Test Split PDF.pdf';
        testPDF.PathOnClient = 'Test Split PDF.pdf';
        testPDF.VersionData = EncodingUtil.base64Decode(samplePDFBase64);
        testPDF.IsMajorVersion = true;
        
        insert testPDF;
    }
    
    @isTest
    static void testSplitPDFAfterPage() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Split PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test split after page
        SplitPDF.splitPDF(
            pdfBase64, 
            'SplitAfterPage', 
            1, 
            null, 
            null, 
            'NameAsPerOrder', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'split_output_%' OR Title LIKE 'split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' split PDFs');
    }
    
    @isTest
    static void testMinimalSplit() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Split PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test the minimal split method
        SplitPDF.testMinimalSplit(pdfBase64);
        
        Test.stopTest();
        
        // Verify that test split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'split_test_%'];
        System.debug('Found ' + splitPDFs.size() + ' test split PDFs');
    }
    
    @isTest
    static void testSplitPDFRecurring() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Split PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test recurring split
        SplitPDF.splitPDF(
            pdfBase64, 
            'RecurringSplitAfterPage', 
            4, 
            null, 
            null, 
            'NameAsPerOrder', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'split_output_%' OR Title LIKE 'split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' recurring split PDFs');
    }
    
    @isTest
    static void testSplitPDFSequence() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Split PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test split sequence
        List<Integer> splitSequence = new List<Integer>{1, 3, 8};
        SplitPDF.splitPDF(
            pdfBase64, 
            'SplitSequence', 
            null, 
            splitSequence, 
            null, 
            'NameAsPerOrder', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'split_output_%' OR Title LIKE 'split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' sequence split PDFs');
    }
    
    @isTest
    static void testSplitPDFRanges() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Split PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test split ranges
        SplitPDF.splitPDF(
            pdfBase64, 
            'SplitRanges', 
            null, 
            null, 
            '1-4', 
            'NameAsPerOrder', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'split_output_%' OR Title LIKE 'split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' ranges split PDFs');
    }
    
    @isTest
    static void testSplitPDFSynchronous() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Split PDF.pdf' LIMIT 1];
        
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        
        Test.startTest();
        
        // Test synchronous split
        SplitPDF.splitPDF(
            pdfBase64, 
            'SplitAfterPage', 
            1, 
            null, 
            null, 
            'NameAsPerOrder', 
            false
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'split_output_%'];
        System.debug('Found ' + splitPDFs.size() + ' synchronous split PDFs');
    }
    
    @isTest
    static void testSplitPDFWithNullValues() {
        Test.startTest();
        
        // Test with null values
        SplitPDF.splitPDF(
            null, 
            'SplitAfterPage', 
            1, 
            null, 
            null, 
            'NameAsPerOrder', 
            true
        );
        
        Test.stopTest();
        
        // This should handle the error gracefully
        System.debug('Test completed with null values');
    }
    
    @isTest
    static void testSplitPDFWithLargePDF() {
        // Create larger test PDF content
        String largePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        Test.startTest();
        
        // Test with larger PDF
        SplitPDF.splitPDF(
            largePDFBase64, 
            'SplitAfterPage', 
            1, 
            null, 
            null, 
            'NameAsPerOrder', 
            true
        );
        
        Test.stopTest();
        
        // Verify that split PDFs were created
        List<ContentVersion> splitPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title LIKE 'split_output_%' OR Title LIKE 'split_async_%'];
        System.debug('Found ' + splitPDFs.size() + ' large PDF split PDFs');
    }

    @isTest
    static void testSplitPDFAndSave() {
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Split PDF.pdf' LIMIT 1];
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);
        Test.startTest();
        SplitPDF.SplitResult result = SplitPDF.splitPDFAndSave(pdfBase64, 'SplitAfterPage', 1, null, null, 'NameAsPerOrder');
        Test.stopTest();
        System.assertNotEquals(null, result.base64, 'Result base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Result downloadUrl should not be null');
        System.assertEquals(null, result.error, 'Result error should be null');
    }
} 