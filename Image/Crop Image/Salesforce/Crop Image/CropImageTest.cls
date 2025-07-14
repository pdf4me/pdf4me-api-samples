@isTest
private class CropImageTest {
    @isTest static void testCropImageAndSave() {
        // Mock base64 data (not a real image, just for flow testing)
        String imageBase64 = EncodingUtil.base64Encode(Blob.valueOf('fake image content'));
        String imageFileName = 'test_image.jpg';
        String cropType = 'Border';
        Integer leftBorder = 10;
        Integer rightBorder = 10;
        Integer topBorder = 10;
        Integer bottomBorder = 10;
        Integer upperLeftX = null;
        Integer upperLeftY = null;
        Integer width = null;
        Integer height = null;

        CropImage.CropImageResult result = CropImage.cropImageAndSave(
            imageBase64,
            imageFileName,
            cropType,
            leftBorder,
            rightBorder,
            topBorder,
            bottomBorder,
            upperLeftX,
            upperLeftY,
            width,
            height
        );

        System.assertNotEquals(null, result, 'Result should not be null');
        // Since this is mock data, expect an error from the API
        System.assert(result.error != null, 'Should return an error for fake data');
        System.assert(result.base64 == null || result.base64.length() == 0, 'No base64 expected for fake data');
        System.assert(result.downloadUrl == null || result.downloadUrl.length() == 0, 'No downloadUrl expected for fake data');
    }
} 