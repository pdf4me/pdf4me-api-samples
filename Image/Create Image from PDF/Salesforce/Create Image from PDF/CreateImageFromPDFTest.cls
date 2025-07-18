@isTest
private class CreateImageFromPDFTest {
    @isTest static void testCreateImageFromPDFAndSave() {
        // Mock base64 data (not a real PDF, just for flow testing)
        String pdfBase64 = EncodingUtil.base64Encode(Blob.valueOf('fake pdf content'));
        String pdfFileName = 'test.pdf';
        String widthPixel = '800';
        String imageExtension = 'jpg';
        String pageNrs = '1-2';

        CreateImageFromPDF.CreateImageFromPDFResult result = CreateImageFromPDF.createImageFromPDFAndSave(
            pdfBase64,
            pdfFileName,
            widthPixel,
            imageExtension,
            pageNrs
        );

        System.assertNotEquals(null, result, 'Result should not be null');
        // Since this is mock data, expect an error from the API
        System.assert(result.error != null, 'Should return an error for fake data');
        System.assert(result.base64 == null || result.base64.length() == 0, 'No base64 expected for fake data');
        System.assert(result.downloadUrl == null || result.downloadUrl.length() == 0, 'No downloadUrl expected for fake data');
    }
} 