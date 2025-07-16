@isTest
public class ExtractPagesFromPDFTest {
    @TestSetup
    static void setupTestData() {
        ContentVersion testPDF = new ContentVersion();
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCj4+DQplbmRvYmoNCnhyZWYNCjAgNA0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNA0KL1Jvb3QgMSAwIFINCi9JbmZvIDQgMCBSDQo+Pg0Kc3RhcnR4cmVmDQoxODUNCjUlRU9G';
        testPDF.Title = 'Test Extract Pages PDF.pdf';
        testPDF.PathOnClient = 'Test Extract Pages PDF.pdf';
        testPDF.VersionData = EncodingUtil.base64Decode(samplePDFBase64);
        testPDF.IsMajorVersion = true;
        insert testPDF;
    }

    @isTest
    static void testExtractPagesAndSave() {
        // Create a sample PDF file as ContentVersion
        Blob samplePdf = Blob.valueOf('Sample PDF content');
        ContentVersion cv = new ContentVersion();
        cv.Title = 'TestExtractPages.pdf';
        cv.PathOnClient = 'TestExtractPages.pdf';
        cv.VersionData = samplePdf;
        cv.IsMajorVersion = true;
        insert cv;
        ContentVersion insertedCV = [SELECT VersionData FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        String pdfBase64 = EncodingUtil.base64Encode(insertedCV.VersionData);

        // Call the new synchronous method
        ExtractPagesFromPDF.ExtractPagesResult result = ExtractPagesFromPDF.extractPagesAndSave(
            pdfBase64, 'output.pdf', '1'
        );

        // Assert result fields
        System.assert(result != null, 'Result should not be null');
        System.assert(result.error == null, 'Error should be null for valid input');
        System.assert(String.isNotBlank(result.base64), 'Base64 should not be blank');
        System.assert(String.isNotBlank(result.downloadUrl), 'Download URL should not be blank');
    }
} 