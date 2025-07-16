@isTest
public class UpdateHyperlinksAnnotationTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test data if needed
    }
    
    @isTest
    static void testUpdateHyperlinksAnnotation() {
        // Test data - sample base64 PDF content
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCi9QYXJlbnQgMiAwIFINCi9SZXNvdXJjZXMgPDwNCi9Gb250IDw8DQovRjEgNCAwIFINCj4+DQo+Pg0KL0NvbnRlbnRzIDUgMCBSDQo+Pg0KZW5kb2JqDQo0IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMQ0KL0Jhc2VGb250IC9IZWx2ZXRpY2ENCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nDQo+Pg0KZW5kb2JqDQo1IDAgb2JqDQo8PA0KL0xlbmd0aCA0NA0KPj4NCnN0cmVhbQ0KQlQNCjc1MCA1MDAgVHENCi9GMSAxMiBUZg0KVGVzdCBQREYgRG9jdW1lbnQKVGQNCmVuZHN0cmVhbQ0KZW5kb2JqDQp4cmVmDQowIDYNCjAwMDAwMDAwMDAgNjU1MzUgZiANCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
        
        // Create hyperlink updates
        Map<String, Object> hyperlinkUpdate = new Map<String, Object>{
            'SearchOn' => 'Text',
            'SearchValue' => 'http://www.google.com',
            'IsExpression' => true,
            'TextCurrentValue' => 'http://www.google.com',
            'TextNewValue' => 'https://pdf4me.com',
            'URLCurrentValue' => 'http://www.google.com',
            'URLNewValue' => 'https://pdf4me.com'
        };
        
        List<Map<String, Object>> hyperlinkUpdates = new List<Map<String, Object>>{hyperlinkUpdate};
        
        Test.startTest();
        
        // Test the main hyperlinks annotation update method
        UpdateHyperlinksAnnotation.updateHyperlinksAnnotation(samplePDFBase64, hyperlinkUpdates, true);
        
        Test.stopTest();
        
        // Verify that the method executed without throwing exceptions
        // In a real scenario, you would verify the results by checking ContentVersion records
        System.debug('Hyperlinks annotation update test completed successfully');
    }
    
    @isTest
    static void testMinimalHyperlinkUpdate() {
        // Test data - sample base64 PDF content
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCi9QYXJlbnQgMiAwIFINCi9SZXNvdXJjZXMgPDwNCi9Gb250IDw8DQovRjEgNCAwIFINCj4+DQo+Pg0KL0NvbnRlbnRzIDUgMCBSDQo+Pg0KZW5kb2JqDQo0IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMQ0KL0Jhc2VGb250IC9IZWx2ZXRpY2ENCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nDQo+Pg0KZW5kb2JqDQo1IDAgb2JqDQo8PA0KL0xlbmd0aCA0NA0KPj4NCnN0cmVhbQ0KQlQNCjc1MCA1MDAgVHENCi9GMSAxMiBUZg0KVGVzdCBQREYgRG9jdW1lbnQKVGQNCmVuZHN0cmVhbQ0KZW5kb2JqDQp4cmVmDQowIDYNCjAwMDAwMDAwMDAgNjU1MzUgZiANCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
        
        Test.startTest();
        
        // Test the minimal hyperlinks annotation update method
        UpdateHyperlinksAnnotation.testMinimalHyperlinkUpdate(samplePDFBase64);
        
        Test.stopTest();
        
        // Verify that the method executed without throwing exceptions
        System.debug('Minimal hyperlinks annotation update test completed successfully');
    }
    
    @isTest
    static void testUpdateHyperlinksAnnotationSynchronous() {
        // Test data - sample base64 PDF content
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCi9QYXJlbnQgMiAwIFINCi9SZXNvdXJjZXMgPDwNCi9Gb250IDw8DQovRjEgNCAwIFINCj4+DQo+Pg0KL0NvbnRlbnRzIDUgMCBSDQo+Pg0KZW5kb2JqDQo0IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMQ0KL0Jhc2VGb250IC9IZWx2ZXRpY2ENCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nDQo+Pg0KZW5kb2JqDQo1IDAgb2JqDQo8PA0KL0xlbmd0aCA0NA0KPj4NCnN0cmVhbQ0KQlQNCjc1MCA1MDAgVHENCi9GMSAxMiBUZg0KVGVzdCBQREYgRG9jdW1lbnQKVGQNCmVuZHN0cmVhbQ0KZW5kb2JqDQp4cmVmDQowIDYNCjAwMDAwMDAwMDAgNjU1MzUgZiANCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
        
        // Create hyperlink updates
        Map<String, Object> hyperlinkUpdate = new Map<String, Object>{
            'SearchOn' => 'Text',
            'SearchValue' => 'http://www.google.com',
            'IsExpression' => true,
            'TextCurrentValue' => 'http://www.google.com',
            'TextNewValue' => 'https://pdf4me.com',
            'URLCurrentValue' => 'http://www.google.com',
            'URLNewValue' => 'https://pdf4me.com'
        };
        
        List<Map<String, Object>> hyperlinkUpdates = new List<Map<String, Object>>{hyperlinkUpdate};
        
        Test.startTest();
        
        // Test synchronous processing
        UpdateHyperlinksAnnotation.updateHyperlinksAnnotation(samplePDFBase64, hyperlinkUpdates, false);
        
        Test.stopTest();
        
        // Verify that the method executed without throwing exceptions
        System.debug('Synchronous hyperlinks annotation update test completed successfully');
    }
    
    @isTest
    static void testUpdateHyperlinksAnnotationWithNullInput() {
        Test.startTest();
        
        // Test with null input
        UpdateHyperlinksAnnotation.updateHyperlinksAnnotation(null, null, true);
        
        Test.stopTest();
        
        // Verify that the method handled null input gracefully
        System.debug('Null input test completed successfully');
    }
    
    @isTest
    static void testUpdateHyperlinksAnnotationWithEmptyInput() {
        Test.startTest();
        
        // Test with empty input
        List<Map<String, Object>> emptyUpdates = new List<Map<String, Object>>();
        UpdateHyperlinksAnnotation.updateHyperlinksAnnotation('', emptyUpdates, true);
        
        Test.stopTest();
        
        // Verify that the method handled empty input gracefully
        System.debug('Empty input test completed successfully');
    }
    
    @isTest
    static void testUpdateHyperlinksAnnotationWithMultipleUpdates() {
        // Test data - sample base64 PDF content
        String samplePDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0tpZHMgWzMgMCBSXQ0KL0NvdW50IDENCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCi9QYXJlbnQgMiAwIFINCi9SZXNvdXJjZXMgPDwNCi9Gb250IDw8DQovRjEgNCAwIFINCj4+DQo+Pg0KL0NvbnRlbnRzIDUgMCBSDQo+Pg0KZW5kb2JqDQo0IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMQ0KL0Jhc2VGb250IC9IZWx2ZXRpY2ENCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nDQo+Pg0KZW5kb2JqDQo1IDAgb2JqDQo8PA0KL0xlbmd0aCA0NA0KPj4NCnN0cmVhbQ0KQlQNCjc1MCA1MDAgVHENCi9GMSAxMiBUZg0KVGVzdCBQREYgRG9jdW1lbnQKVGQNCmVuZHN0cmVhbQ0KZW5kb2JqDQp4cmVmDQowIDYNCjAwMDAwMDAwMDAgNjU1MzUgZiANCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
        
        // Create multiple hyperlink updates
        Map<String, Object> hyperlinkUpdate1 = new Map<String, Object>{
            'SearchOn' => 'Text',
            'SearchValue' => 'http://www.google.com',
            'IsExpression' => true,
            'TextCurrentValue' => 'http://www.google.com',
            'TextNewValue' => 'https://pdf4me.com',
            'URLCurrentValue' => 'http://www.google.com',
            'URLNewValue' => 'https://pdf4me.com'
        };
        
        Map<String, Object> hyperlinkUpdate2 = new Map<String, Object>{
            'SearchOn' => 'Text',
            'SearchValue' => 'http://www.example.com',
            'IsExpression' => true,
            'TextCurrentValue' => 'http://www.example.com',
            'TextNewValue' => 'https://example.org',
            'URLCurrentValue' => 'http://www.example.com',
            'URLNewValue' => 'https://example.org'
        };
        
        List<Map<String, Object>> hyperlinkUpdates = new List<Map<String, Object>>{hyperlinkUpdate1, hyperlinkUpdate2};
        
        Test.startTest();
        
        // Test with multiple hyperlink updates
        UpdateHyperlinksAnnotation.updateHyperlinksAnnotation(samplePDFBase64, hyperlinkUpdates, true);
        
        Test.stopTest();
        
        // Verify that the method executed without throwing exceptions
        System.debug('Multiple hyperlink updates test completed successfully');
    }
} 