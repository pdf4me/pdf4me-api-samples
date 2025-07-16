@isTest
private class AddImageWatermarkToImageTest {
    @isTest static void testAddImageWatermarkAndSave() {
        // Mock base64 data (not a real image, just for flow testing)
        String imageBase64 = EncodingUtil.base64Encode(Blob.valueOf('fake image content'));
        String watermarkBase64 = EncodingUtil.base64Encode(Blob.valueOf('fake watermark content'));
        String imageFileName = 'test_image.jpg';
        String watermarkFileName = 'test_watermark.png';
        String position = 'Center';
        Decimal opacity = 0.5;
        Integer horizontalOffset = 0;
        Integer verticalOffset = 0;
        Decimal positionX = null;
        Decimal positionY = null;
        Decimal rotation = 0;

        AddImageWatermarkToImage.ImageWatermarkResult result = AddImageWatermarkToImage.addImageWatermarkAndSave(
            imageBase64,
            watermarkBase64,
            imageFileName,
            watermarkFileName,
            position,
            opacity,
            horizontalOffset,
            verticalOffset,
            positionX,
            positionY,
            rotation
        );

        System.assertNotEquals(null, result, 'Result should not be null');
        // Since this is mock data, expect an error from the API
        System.assert(result.error != null, 'Should return an error for fake data');
        System.assert(result.base64 == null || result.base64.length() == 0, 'No base64 expected for fake data');
        System.assert(result.downloadUrl == null || result.downloadUrl.length() == 0, 'No downloadUrl expected for fake data');
    }
} 