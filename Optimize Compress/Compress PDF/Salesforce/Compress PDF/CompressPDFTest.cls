@isTest
public class CompressPDFTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test ContentVersion record for PDF file
        ContentVersion testPDF = new ContentVersion();
        
        // Create sample PDF content (minimal valid PDF)
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        
        testPDF.Title = 'Test Compress PDF.pdf';
        testPDF.PathOnClient = 'Test Compress PDF.pdf';
        testPDF.VersionData = EncodingUtil.base64Decode(samplePDFBase64);
        testPDF.IsMajorVersion = true;
        
        insert testPDF;
    }
    
    @isTest
    static void testCompressPdfAndSave() {
        // Get test PDF from ContentVersion
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Compress PDF.pdf' LIMIT 1];
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);

        // Call the new synchronous method
        CompressPDF.CompressResult result = CompressPDF.compressPdfAndSave(
            pdfBase64, 'compressed_output.pdf', 'Web'
        );

        // Assert result fields
        System.assert(result != null, 'Result should not be null');
        System.assert(result.error == null, 'Error should be null for valid input');
        System.assert(String.isNotBlank(result.base64), 'Base64 should not be blank');
        System.assert(String.isNotBlank(result.downloadUrl), 'Download URL should not be blank');
    }

    @isTest
    static void testCompressPdfAndSaveWithDifferentProfiles() {
        ContentVersion testPDF = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Compress PDF.pdf' LIMIT 1];
        String pdfBase64 = EncodingUtil.base64Encode(testPDF.VersionData);

        // Test with different optimization profiles
        CompressPDF.CompressResult resultPrint = CompressPDF.compressPdfAndSave(
            pdfBase64, 'compressed_print.pdf', 'Print'
        );
        CompressPDF.CompressResult resultScreen = CompressPDF.compressPdfAndSave(
            pdfBase64, 'compressed_screen.pdf', 'Screen'
        );

        System.assert(resultPrint != null && resultPrint.error == null, 'Print profile should succeed');
        System.assert(resultScreen != null && resultScreen.error == null, 'Screen profile should succeed');
    }

    @isTest
    static void testCompressPdfAndSaveWithNullValues() {
        // Test with null values
        CompressPDF.CompressResult result = CompressPDF.compressPdfAndSave(null, 'compressed_null.pdf', 'Web');
        // Should handle error gracefully
        System.assert(result != null, 'Result should not be null');
        System.assert(result.error != null, 'Error should be present for null input');
    }
} 