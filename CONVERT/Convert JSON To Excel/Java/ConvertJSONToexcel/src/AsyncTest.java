import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

/**
 * Async Test for JSON to Excel Converter
 * Demonstrates concurrent processing capabilities
 */
public class AsyncTest {
    
    public static void main(String[] args) {
        System.out.println("Async JSON to Excel Converter Test");
        System.out.println("=".repeat(50));
        
        // Sample JSON data for testing
        String sampleJson1 = """
            [
                {"name": "John Doe", "age": 30, "city": "New York", "salary": 75000, "department": "Engineering"},
                {"name": "Jane Smith", "age": 25, "city": "Los Angeles", "salary": 65000, "department": "Marketing"}
            ]
            """;
            
        String sampleJson2 = """
            [
                {"product": "Laptop", "price": 1200, "category": "Electronics", "stock": 50},
                {"product": "Mouse", "price": 25, "category": "Electronics", "stock": 200},
                {"product": "Keyboard", "price": 80, "category": "Electronics", "stock": 75}
            ]
            """;
            
        String sampleJson3 = """
            [
                {"id": 1, "name": "Project Alpha", "status": "Active", "budget": 50000, "team_size": 8},
                {"id": 2, "name": "Project Beta", "status": "Completed", "budget": 35000, "team_size": 5},
                {"id": 3, "name": "Project Gamma", "status": "Planning", "budget": 75000, "team_size": 12}
            ]
            """;
        
        try {
            System.out.println("Starting concurrent async conversions...");
            
            // Progress callbacks for each conversion
            Consumer<String> progress1 = message -> System.out.println("Conversion 1: " + message);
            Consumer<String> progress2 = message -> System.out.println("Conversion 2: " + message);
            Consumer<String> progress3 = message -> System.out.println("Conversion 3: " + message);
            
            // Start all conversions concurrently
            CompletableFuture<Void> future1 = Main.convertJsonStringToExcelAsync(sampleJson1, "output1.xlsx", progress1);
            CompletableFuture<Void> future2 = Main.convertJsonStringToExcelAsync(sampleJson2, "output2.xlsx", progress2);
            CompletableFuture<Void> future3 = Main.convertJsonStringToExcelAsync(sampleJson3, "output3.xlsx", progress3);
            
            System.out.println("All conversions started concurrently. Waiting for completion...");
            
            // Wait for all to complete
            CompletableFuture<Void> allFutures = CompletableFuture.allOf(future1, future2, future3);
            allFutures.get(10, TimeUnit.MINUTES); // 10 minute timeout
            
            System.out.println("\n✅ All concurrent conversions completed successfully!");
            System.out.println("📁 Output files: output1.xlsx, output2.xlsx, output3.xlsx");
            
        } catch (Exception e) {
            System.err.println("\n❌ Concurrent conversion test failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 