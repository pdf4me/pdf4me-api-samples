@isTest
public class GenerateReplaceTextWithImageInWordTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test ContentVersion records for Word document and image
        ContentVersion wordDoc = new ContentVersion();
        wordDoc.Title = 'TestDocument.docx';
        wordDoc.PathOnClient = 'TestDocument.docx';
        wordDoc.VersionData = Blob.valueOf('Test Word Document Content');
        wordDoc.IsMajorVersion = true;
        insert wordDoc;
        
        ContentVersion imageFile = new ContentVersion();
        imageFile.Title = 'TestImage.png';
        imageFile.PathOnClient = 'TestImage.png';
        imageFile.VersionData = Blob.valueOf('Test Image Content');
        imageFile.IsMajorVersion = true;
        insert imageFile;
    }
    
    @isTest
    static void testReplaceTextWithImage_Success() {
        // Arrange
        ContentVersion wordDoc = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'TestDocument.docx' LIMIT 1];
        ContentVersion imageFile = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'TestImage.png' LIMIT 1];
        
        String wordBase64 = EncodingUtil.base64Encode(wordDoc.VersionData);
        String imageBase64 = EncodingUtil.base64Encode(imageFile.VersionData);
        String docName = 'TestDocument.docx';
        String imageFileName = 'TestImage.png';
        Boolean isFirstPageSkip = false;
        String pageNumbers = '1,2,3';
        String searchText = 'REPLACE_ME';
        
        // Act & Assert
        Test.startTest();
        
        // Set up mock HTTP response
        Test.setMock(HttpCalloutMock.class, new PDF4meMockResponse(200, 'Success'));
        
        GenerateReplaceTextWithImageInWord.ReplaceTextWithImageResult result = GenerateReplaceTextWithImageInWord.replaceTextWithImageAndSave(
            wordBase64, imageBase64, docName, imageFileName, isFirstPageSkip, pageNumbers, searchText
        );
        
        Test.stopTest();
        
        // Verify that ContentVersion was created (this would happen in the future method)
        // Note: Future methods run asynchronously, so we can't directly test the result
        // in the same transaction
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(String.isBlank(result.error), 'Error should be blank');
        System.assertNotEquals(null, result.base64, 'Base64 should not be null');
        System.assertNotEquals(null, result.downloadUrl, 'Download URL should not be null');
    }
    
    @isTest
    static void testReplaceTextWithImage_Error() {
        // Arrange
        ContentVersion wordDoc = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'TestDocument.docx' LIMIT 1];
        ContentVersion imageFile = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'TestImage.png' LIMIT 1];
        
        String wordBase64 = EncodingUtil.base64Encode(wordDoc.VersionData);
        String imageBase64 = EncodingUtil.base64Encode(imageFile.VersionData);
        String docName = 'TestDocument.docx';
        String imageFileName = 'TestImage.png';
        Boolean isFirstPageSkip = false;
        String pageNumbers = '1';
        String searchText = 'REPLACE_ME';
        
        // Act & Assert
        Test.startTest();
        
        // Set up mock HTTP response for error
        Test.setMock(HttpCalloutMock.class, new PDF4meMockResponse(400, 'Bad Request'));
        
        GenerateReplaceTextWithImageInWord.ReplaceTextWithImageResult result = GenerateReplaceTextWithImageInWord.replaceTextWithImageAndSave(
            wordBase64, imageBase64, docName, imageFileName, isFirstPageSkip, pageNumbers, searchText
        );
        
        Test.stopTest();
        
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertNotEquals(null, result.error, 'Error should not be null');
    }
    
    // Mock classes for testing
    public class PDF4meMockResponse implements HttpCalloutMock {
        private Integer statusCode;
        private String body;
        
        public PDF4meMockResponse(Integer statusCode, String body) {
            this.statusCode = statusCode;
            this.body = body;
        }
        
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(statusCode);
            if (statusCode == 200) {
                response.setBodyAsBlob(Blob.valueOf('Processed Word Document'));
            } else {
                response.setBody('Error');
            }
            return response;
        }
    }
} 