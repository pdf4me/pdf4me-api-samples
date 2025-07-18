@isTest
private class AddTextWatermarkToImageTest {
    @isTest static void testAddTextWatermarkAndSave() {
        // Mock base64 data (not a real image, just for flow testing)
        String imageBase64 = EncodingUtil.base64Encode(Blob.valueOf('fake image content'));
        String imageFileName = 'test_image.jpg';
        String watermarkText = 'Sample Watermark';
        String textPosition = 'bottomleft';
        String fontFamily = 'Arial';
        Integer fontSize = 12;
        String textColour = '#000000';
        Boolean isBold = true;
        Boolean isUnderline = false;
        Boolean isItalic = false;
        Decimal opacity = 0.5;
        Decimal rotationAngle = 0;
        Decimal positionX = null;
        Decimal positionY = null;

        AddTextWatermarkToImage.TextWatermarkResult result = AddTextWatermarkToImage.addTextWatermarkAndSave(
            imageBase64,
            imageFileName,
            watermarkText,
            textPosition,
            fontFamily,
            fontSize,
            textColour,
            isBold,
            isUnderline,
            isItalic,
            opacity,
            rotationAngle,
            positionX,
            positionY
        );

        System.assertNotEquals(null, result, 'Result should not be null');
        // Since this is mock data, expect an error from the API
        System.assert(result.error != null, 'Should return an error for fake data');
        System.assert(result.base64 == null || result.base64.length() == 0, 'No base64 expected for fake data');
        System.assert(result.downloadUrl == null || result.downloadUrl.length() == 0, 'No downloadUrl expected for fake data');
    }
} 