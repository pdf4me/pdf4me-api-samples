@isTest
private class ReplaceTextWithImageTest {
    @isTest static void testReplaceTextWithImageAndSave() {
        // Mock base64 data (not a real PDF or image, just for flow testing)
        String pdfBase64 = EncodingUtil.base64Encode(Blob.valueOf('fake pdf content'));
        String pdfFileName = 'test.pdf';
        String replaceText = 'PLACEHOLDER';
        String pageSequence = '1';
        String imageBase64 = EncodingUtil.base64Encode(Blob.valueOf('fake image content'));
        Integer imageHeight = 100;
        Integer imageWidth = 100;

        ReplaceTextWithImage.ReplaceTextWithImageResult result = ReplaceTextWithImage.replaceTextWithImageAndSave(
            pdfBase64,
            pdfFileName,
            replaceText,
            pageSequence,
            imageBase64,
            imageHeight,
            imageWidth
        );

        System.assertNotEquals(null, result, 'Result should not be null');
        // Since this is mock data, expect an error from the API
        System.assert(result.error != null, 'Should return an error for fake data');
        System.assert(result.base64 == null || result.base64.length() == 0, 'No base64 expected for fake data');
        System.assert(result.downloadUrl == null || result.downloadUrl.length() == 0, 'No downloadUrl expected for fake data');
    }
} 