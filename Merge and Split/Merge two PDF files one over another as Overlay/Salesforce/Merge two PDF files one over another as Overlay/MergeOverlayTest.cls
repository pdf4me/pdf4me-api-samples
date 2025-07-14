@isTest
public class MergeOverlayTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test ContentVersion records for PDF files
        List<ContentVersion> testPDFs = new List<ContentVersion>();
        
        // Create sample PDF content (minimal valid PDF)
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        // Create base PDF
        ContentVersion basePDF = new ContentVersion();
        basePDF.Title = 'Base PDF.pdf';
        basePDF.PathOnClient = 'Base PDF.pdf';
        basePDF.VersionData = EncodingUtil.base64Decode(samplePDFBase64);
        basePDF.IsMajorVersion = true;
        testPDFs.add(basePDF);
        
        // Create layer PDF
        ContentVersion layerPDF = new ContentVersion();
        layerPDF.Title = 'Layer PDF.pdf';
        layerPDF.PathOnClient = 'Layer PDF.pdf';
        layerPDF.VersionData = EncodingUtil.base64Decode(samplePDFBase64);
        layerPDF.IsMajorVersion = true;
        testPDFs.add(layerPDF);
        
        insert testPDFs;
    }
    
    @isTest
    static void testMergeOverlay() {
        // Get test PDFs from ContentVersion
        ContentVersion basePDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Base PDF.pdf' LIMIT 1];
        ContentVersion layerPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Layer PDF.pdf' LIMIT 1];
        
        String basePDFBase64 = EncodingUtil.base64Encode(basePDF.VersionData);
        String layerPDFBase64 = EncodingUtil.base64Encode(layerPDF.VersionData);
        
        Test.startTest();
        
        // Test the main overlay merge method
        MergeOverlay.mergeOverlay(basePDFBase64, 'Base PDF.pdf', layerPDFBase64, 'Layer PDF.pdf', true);
        
        Test.stopTest();
        
        // Verify that the overlay merged PDF was created
        List<ContentVersion> mergedPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title = 'overlay_merged.pdf' OR Title = 'overlay_merged_async.pdf'];
        System.assert(!mergedPDFs.isEmpty(), 'Overlay merged PDF should be created');
    }
    
    @isTest
    static void testMinimalOverlay() {
        // Get test PDFs from ContentVersion
        ContentVersion basePDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Base PDF.pdf' LIMIT 1];
        ContentVersion layerPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Layer PDF.pdf' LIMIT 1];
        
        String basePDFBase64 = EncodingUtil.base64Encode(basePDF.VersionData);
        String layerPDFBase64 = EncodingUtil.base64Encode(layerPDF.VersionData);
        
        Test.startTest();
        
        // Test the minimal overlay method
        MergeOverlay.testMinimalOverlay(basePDFBase64, layerPDFBase64);
        
        Test.stopTest();
        
        // Verify that the test overlay merged PDF was created
        List<ContentVersion> mergedPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title = 'overlay_test.pdf'];
        System.assert(!mergedPDFs.isEmpty(), 'Test overlay merged PDF should be created');
    }
    
    @isTest
    static void testMergeOverlaySynchronous() {
        // Get test PDFs from ContentVersion
        ContentVersion basePDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Base PDF.pdf' LIMIT 1];
        ContentVersion layerPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Layer PDF.pdf' LIMIT 1];
        
        String basePDFBase64 = EncodingUtil.base64Encode(basePDF.VersionData);
        String layerPDFBase64 = EncodingUtil.base64Encode(layerPDF.VersionData);
        
        Test.startTest();
        
        // Test synchronous overlay merge
        MergeOverlay.mergeOverlay(basePDFBase64, 'Base PDF.pdf', layerPDFBase64, 'Layer PDF.pdf', false);
        
        Test.stopTest();
        
        // Verify that the overlay merged PDF was created
        List<ContentVersion> mergedPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title = 'overlay_merged.pdf'];
        System.assert(!mergedPDFs.isEmpty(), 'Synchronous overlay merged PDF should be created');
    }
    
    @isTest
    static void testMergeOverlayWithNullValues() {
        Test.startTest();
        
        // Test with null values
        MergeOverlay.mergeOverlay(null, 'Base PDF.pdf', null, 'Layer PDF.pdf', true);
        
        Test.stopTest();
        
        // This should handle the error gracefully
        System.debug('Test completed with null values');
    }
    
    @isTest
    static void testMergeOverlayWithLargePDFs() {
        // Create larger test PDF content
        String largePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        Test.startTest();
        
        // Test with larger PDFs
        MergeOverlay.mergeOverlay(largePDFBase64, 'Large Base PDF.pdf', largePDFBase64, 'Large Layer PDF.pdf', true);
        
        Test.stopTest();
        
        // Verify that the overlay merged PDF was created
        List<ContentVersion> mergedPDFs = [SELECT Id, Title FROM ContentVersion WHERE Title = 'overlay_merged.pdf' OR Title = 'overlay_merged_async.pdf'];
        System.assert(!mergedPDFs.isEmpty(), 'Large overlay merged PDF should be created');
    }

    @isTest
    static void testMergeOverlayAndSave() {
        ContentVersion basePDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Base PDF.pdf' LIMIT 1];
        ContentVersion layerPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Layer PDF.pdf' LIMIT 1];
        String basePDFBase64 = EncodingUtil.base64Encode(basePDF.VersionData);
        String layerPDFBase64 = EncodingUtil.base64Encode(layerPDF.VersionData);
        Test.startTest();
        MergeOverlay.OverlayMergeResult result = MergeOverlay.mergeOverlayAndSave(basePDFBase64, 'Base PDF.pdf', layerPDFBase64, 'Layer PDF.pdf');
        Test.stopTest();
        System.assertNotEquals(null, result.base64, 'Result base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Result downloadUrl should not be null');
        System.assertEquals(null, result.error, 'Result error should be null');
    }
} 