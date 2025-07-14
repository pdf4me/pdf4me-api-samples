@isTest
public class ExtractPDFMetadataTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test data if needed
    }
    
    @isTest
    static void testExtractPdfMetadataAndSave() {
        // Create a sample PDF file as ContentVersion
        Blob samplePdf = Blob.valueOf('Sample PDF content');
        ContentVersion cv = new ContentVersion();
        cv.Title = 'TestExtractMetadata.pdf';
        cv.PathOnClient = 'TestExtractMetadata.pdf';
        cv.VersionData = samplePdf;
        cv.IsMajorVersion = true;
        insert cv;
        ContentVersion insertedCV = [SELECT VersionData FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        String pdfBase64 = EncodingUtil.base64Encode(insertedCV.VersionData);

        // Call the new synchronous method
        ExtractPDFMetadata.MetadataResult result = ExtractPDFMetadata.extractPdfMetadataAndSave(
            pdfBase64, 'output_metadata.json'
        );

        // Assert result fields
        System.assert(result != null, 'Result should not be null');
        System.assert(result.error == null, 'Error should be null for valid input');
        System.assert(String.isNotBlank(result.base64), 'Base64 should not be blank');
        System.assert(String.isNotBlank(result.downloadUrl), 'Download URL should not be blank');
    }
} 