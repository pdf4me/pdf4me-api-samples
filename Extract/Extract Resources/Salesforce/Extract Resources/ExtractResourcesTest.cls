@isTest
public class ExtractResourcesTest {
    @isTest
    static void testExtract_Sync() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractResourcesMock(200));
        ExtractResources.extract('dGVzdA==', 'input.pdf', true, true, UserInfo.getUserId());
        Test.stopTest();
    }
    
    @isTest
    static void testExtract_Async() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractResourcesMock(202));
        ExtractResources.extract('dGVzdA==', 'input.pdf', true, true, UserInfo.getUserId());
        Test.stopTest();
    }
    
    @isTest
    static void testExtract_Error() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new ExtractResourcesMock(400));
        ExtractResources.extract('dGVzdA==', 'input.pdf', true, true, UserInfo.getUserId());
        Test.stopTest();
    }
    
    class ExtractResourcesMock implements HttpCalloutMock {
        Integer status;
        Integer pollCount = 0;
        
        ExtractResourcesMock(Integer status) { 
            this.status = status; 
        }
        
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            
            if (status == 200) {
                res.setStatusCode(200);
                res.setBody('{"texts":["text1","text2"],"images":["img1","img2"]}');
            } else if (status == 202) {
                if (pollCount == 0) {
                    res.setStatusCode(202);
                    res.setHeader('Location', 'https://api.pdf4me.com/poll/123');
                    pollCount++;
                } else {
                    res.setStatusCode(200);
                    res.setBody('{"texts":["text1","text2"],"images":["img1","img2"]}');
                }
            } else {
                res.setStatusCode(400);
                res.setBody('Error');
            }
            return res;
        }
    }
} 