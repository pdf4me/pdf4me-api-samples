@isTest
public class DisableTrackingChangesInWordTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test ContentVersion with sample DOCX data
        ContentVersion testDoc = new ContentVersion();
        testDoc.Title = 'Test Document.docx';
        testDoc.PathOnClient = 'Test Document.docx';
        testDoc.VersionData = Blob.valueOf('Sample DOCX content for testing');
        testDoc.IsMajorVersion = true;
        insert testDoc;
    }
    
    @isTest
    static void testDisableTrackingChangesInWordAndSave() {
        // Create a sample Word file as ContentVersion
        Blob sampleDocx = Blob.valueOf('Sample Word content');
        ContentVersion cv = new ContentVersion();
        cv.Title = 'TestDisableTracking.docx';
        cv.PathOnClient = 'TestDisableTracking.docx';
        cv.VersionData = sampleDocx;
        cv.IsMajorVersion = true;
        insert cv;
        ContentVersion insertedCV = [SELECT VersionData FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        String docxBase64 = EncodingUtil.base64Encode(insertedCV.VersionData);

        // Call the new synchronous method
        DisableTrackingChangesInWord.DisableTrackingResult result = DisableTrackingChangesInWord.disableTrackingChangesInWordAndSave(
            docxBase64, 'tracking_disabled.docx'
        );

        // Assert result fields
        System.assert(result != null, 'Result should not be null');
        System.assert(result.error == null, 'Error should be null for valid input');
        System.assert(String.isNotBlank(result.base64), 'Base64 should not be blank');
        System.assert(String.isNotBlank(result.downloadUrl), 'Download URL should not be blank');
    }
    
    @isTest
    static void testMinimalTrackingDisable() {
        // Get test document
        ContentVersion testDoc = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Document.docx' LIMIT 1];
        String docxBase64 = EncodingUtil.base64Encode(testDoc.VersionData);
        
        Test.startTest();
        
        // Test the minimal method
        DisableTrackingChangesInWord.testMinimalTrackingDisable(docxBase64);
        
        Test.stopTest();
        
        // Verify that the method was called
        System.debug('Test completed for testMinimalTrackingDisable');
    }
    
    @isTest
    static void testDisableTrackingChangesInWordSynchronous() {
        // Get test document
        ContentVersion testDoc = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Document.docx' LIMIT 1];
        String docxBase64 = EncodingUtil.base64Encode(testDoc.VersionData);
        
        Test.startTest();
        
        // Test synchronous processing
        DisableTrackingChangesInWord.disableTrackingChangesInWord(docxBase64, false);
        
        Test.stopTest();
        
        System.debug('Test completed for synchronous tracking changes disable');
    }
    
    @isTest
    static void testWithNullInput() {
        Test.startTest();
        
        // Test with null input
        try {
            DisableTrackingChangesInWord.disableTrackingChangesInWord(null, true);
        } catch (Exception e) {
            System.debug('Expected exception caught: ' + e.getMessage());
        }
        
        Test.stopTest();
        
        System.debug('Test completed for null input handling');
    }
    
    @isTest
    static void testWithEmptyInput() {
        Test.startTest();
        
        // Test with empty input
        try {
            DisableTrackingChangesInWord.disableTrackingChangesInWord('', true);
        } catch (Exception e) {
            System.debug('Expected exception caught: ' + e.getMessage());
        }
        
        Test.stopTest();
        
        System.debug('Test completed for empty input handling');
    }
    
    @isTest
    static void testWithInvalidBase64() {
        Test.startTest();
        
        // Test with invalid base64
        try {
            DisableTrackingChangesInWord.disableTrackingChangesInWord('invalid-base64-content', true);
        } catch (Exception e) {
            System.debug('Expected exception caught: ' + e.getMessage());
        }
        
        Test.stopTest();
        
        System.debug('Test completed for invalid base64 handling');
    }
    
    @isTest
    static void testLargeDocument() {
        // Create a larger test document
        String largeContent = 'Large DOCX content for testing. '.repeat(1000);
        Blob largeBlob = Blob.valueOf(largeContent);
        String largeBase64 = EncodingUtil.base64Encode(largeBlob);
        
        Test.startTest();
        
        // Test with large document
        DisableTrackingChangesInWord.disableTrackingChangesInWord(largeBase64, true);
        
        Test.stopTest();
        
        System.debug('Test completed for large document');
    }
    
    @isTest
    static void testMultipleCalls() {
        // Get test document
        ContentVersion testDoc = [SELECT Id, VersionData FROM ContentVersion WHERE Title = 'Test Document.docx' LIMIT 1];
        String docxBase64 = EncodingUtil.base64Encode(testDoc.VersionData);
        
        Test.startTest();
        
        // Test multiple calls
        DisableTrackingChangesInWord.disableTrackingChangesInWord(docxBase64, true);
        DisableTrackingChangesInWord.disableTrackingChangesInWord(docxBase64, false);
        DisableTrackingChangesInWord.testMinimalTrackingDisable(docxBase64);
        
        Test.stopTest();
        
        System.debug('Test completed for multiple calls');
    }
} 