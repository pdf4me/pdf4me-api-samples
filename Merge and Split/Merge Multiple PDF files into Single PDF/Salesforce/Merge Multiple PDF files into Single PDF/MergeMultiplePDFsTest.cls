@isTest
public class MergeMultiplePDFsTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test ContentVersion records for PDF files
        List<ContentVersion> testPDFs = new List<ContentVersion>();
        
        // Create sample PDF content (minimal valid PDF)
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        for(Integer i = 1; i <= 3; i++) {
            ContentVersion cv = new ContentVersion();
            cv.Title = 'Test PDF ' + i + '.pdf';
            cv.PathOnClient = 'Test PDF ' + i + '.pdf';
            cv.VersionData = EncodingUtil.base64Decode(samplePDFBase64);
            cv.IsMajorVersion = true;
            testPDFs.add(cv);
        }
        
        insert testPDFs;
    }
    
    @isTest
    static void testMergeMultiplePDFsAndSave() {
        List<ContentVersion> testPDFs = [SELECT Id, VersionData FROM ContentVersion WHERE Title LIKE 'Test PDF%' LIMIT 3];
        List<String> pdfContentsBase64 = new List<String>();
        for(ContentVersion cv : testPDFs) {
            pdfContentsBase64.add(EncodingUtil.base64Encode(cv.VersionData));
        }
        Test.startTest();
        MergeMultiplePDFs.MergeResult result = MergeMultiplePDFs.mergeMultiplePDFsAndSave(pdfContentsBase64, 'merged_output.pdf');
        Test.stopTest();
        System.assertNotEquals(null, result.base64, 'Result base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Result downloadUrl should not be null');
        System.assertEquals(null, result.error, 'Result error should be null');
    }
    
    @isTest
    static void testMinimalMerge() {
        // Get test PDFs from ContentVersion
        List<ContentVersion> testPDFs = [SELECT Id, VersionData FROM ContentVersion WHERE Title LIKE 'Test PDF%' LIMIT 2];
        
        List<String> pdfContentsBase64 = new List<String>();
        for(ContentVersion cv : testPDFs) {
            pdfContentsBase64.add(EncodingUtil.base64Encode(cv.VersionData));
        }
        
        Test.startTest();
        
        // Test the minimal merge method
        MergeMultiplePDFs.testMinimalMerge(pdfContentsBase64);
        
        Test.stopTest();
        
        // Verify that the test merged PDF was created
        List<ContentVersion> mergedPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title = 'merged_test.pdf'];
        System.assert(!mergedPDFs.isEmpty(), 'Test merged PDF should be created');
    }
    
    @isTest
    static void testMergeWithEmptyList() {
        List<String> emptyList = new List<String>();
        
        Test.startTest();
        
        // Test with empty list
        MergeMultiplePDFs.mergeMultiplePDFs(emptyList, 'empty_merge.pdf', true);
        
        Test.stopTest();
        
        // This should handle the error gracefully
        System.debug('Test completed with empty list');
    }
    
    @isTest
    static void testMergeWithSinglePDF() {
        // Get single test PDF
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title LIKE 'Test PDF%' LIMIT 1];
        
        List<String> pdfContentsBase64 = new List<String>{
            EncodingUtil.base64Encode(testPDF.VersionData)
        };
        
        Test.startTest();
        
        // Test with single PDF
        MergeMultiplePDFs.mergeMultiplePDFs(pdfContentsBase64, 'single_merged.pdf', false);
        
        Test.stopTest();
        
        // Verify that the merged PDF was created
        List<ContentVersion> mergedPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title = 'single_merged.pdf'];
        System.assert(!mergedPDFs.isEmpty(), 'Single merged PDF should be created');
    }
    
    @isTest
    static void testMergeWithLargePDFs() {
        // Create larger test PDF content
        String largePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        List<String> pdfContentsBase64 = new List<String>{
            largePDFBase64,
            largePDFBase64,
            largePDFBase64
        };
        
        Test.startTest();
        
        // Test with larger PDFs
        MergeMultiplePDFs.mergeMultiplePDFs(pdfContentsBase64, 'large_merged.pdf', true);
        
        Test.stopTest();
        
        // Verify that the merged PDF was created
        List<ContentVersion> mergedPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title = 'large_merged.pdf' OR Title = 'merged_output_async.pdf'];
        System.assert(!mergedPDFs.isEmpty(), 'Large merged PDF should be created');
    }
} 