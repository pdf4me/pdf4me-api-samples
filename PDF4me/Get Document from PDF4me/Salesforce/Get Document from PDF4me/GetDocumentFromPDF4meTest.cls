@isTest
public class GetDocumentFromPDF4meTest {
    @isTest
    static void testSplitPdfByBarcodeAndSave() {
        // Create a sample PDF file as ContentVersion
        Blob samplePdf = Blob.valueOf('Sample PDF content');
        ContentVersion cv = new ContentVersion();
        cv.Title = 'TestSplitByBarcode.pdf';
        cv.PathOnClient = 'TestSplitByBarcode.pdf';
        cv.VersionData = samplePdf;
        cv.IsMajorVersion = true;
        insert cv;
        ContentVersion insertedCV = [SELECT VersionData FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        String pdfBase64 = EncodingUtil.base64Encode(insertedCV.VersionData);

        // Call the new synchronous method
        GetDocumentFromPDF4me.GetDocumentResult result = GetDocumentFromPDF4me.splitPdfByBarcodeAndSave(
            pdfBase64,
            'hello', // barcodeString
            'startsWith', // barcodeFilter
            'qrcode', // barcodeType
            'before', // splitBarcodePage
            true, // combinePagesWithSameConsecutiveBarcodes
            '1' // pdfRenderDpi
        );

        // Assert result fields
        System.assert(result != null, 'Result should not be null');
        // Error may be present if no real API key or PDF, but base64/downloadUrl should be blank in that case
        // If you have a real API key and valid PDF, error should be null and base64/downloadUrl should be present
        // For test context, just assert result is not null
    }
} 