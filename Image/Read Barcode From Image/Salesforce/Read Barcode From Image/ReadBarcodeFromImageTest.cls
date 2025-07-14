@isTest
private class ReadBarcodeFromImageTest {
    @isTest static void testReadBarcodeFromImageAndSave() {
        // Mock base64 data (not a real image, just for flow testing)
        String imageBase64 = EncodingUtil.base64Encode(Blob.valueOf('fake image content'));
        String imageFileName = 'test_image.jpg';
        String imageType = 'JPG';

        ReadBarcodeFromImage.ReadBarcodeFromImageResult result = ReadBarcodeFromImage.readBarcodeFromImageAndSave(
            imageBase64,
            imageFileName,
            imageType
        );

        System.assertNotEquals(null, result, 'Result should not be null');
        // Since this is mock data, expect an error from the API
        System.assert(result.error != null, 'Should return an error for fake data');
        System.assert(result.base64 == null || result.base64.length() == 0, 'No base64 expected for fake data');
        System.assert(result.downloadUrl == null || result.downloadUrl.length() == 0, 'No downloadUrl expected for fake data');
    }
} 