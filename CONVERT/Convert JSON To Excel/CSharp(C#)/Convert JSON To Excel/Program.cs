using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for JSON to Excel conversion
/// This program demonstrates how to convert JSON files to Excel format using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Path to the JSON file to be converted
        string jsonPath = "sample.json";  // Use the local sample.json file
         const string BASE_URL = "https://api.pdf4me.com/"; 
        // Configuration constants
        private const string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the JSON to Excel converter
        var converter = new JsonToExcelConverter(httpClient, jsonPath);
        
        // Perform the conversion
        var result = await converter.ConvertJsonToExcelAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Excel file saved to: {result}");
        else
            Console.WriteLine("JSON to Excel conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting JSON files to Excel format using the PDF4ME API
/// </summary>
public class JsonToExcelConverter
{


    // File paths
    private readonly string _inputJsonPath;
    private readonly string _outputExcelPath;

    // HTTP client for API communication
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the JSON to Excel converter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputJsonPath">Path to the input JSON file</param>
    public JsonToExcelConverter(HttpClient httpClient, string inputJsonPath)
    {
        _httpClient = httpClient;
        _inputJsonPath = inputJsonPath;
        
        // Generate output Excel path by replacing JSON extension with XLSX
        _outputExcelPath = inputJsonPath.Replace(".json", ".xlsx");
        
    }

    /// <summary>
    /// Converts the JSON file to Excel format asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated Excel file, or null if conversion failed</returns>
    public async Task<string?> ConvertJsonToExcelAsync()
    {
        // Read the JSON file and convert to base64
        byte[] jsonBytes = await File.ReadAllBytesAsync(_inputJsonPath);
        string jsonBase64 = Convert.ToBase64String(jsonBytes);

        // Prepare the API request payload with conversion settings
        var payload = new
        {
            docContent = jsonBase64,           // Base64 encoded JSON content
            docName = "output",                // Output document name
            worksheetName = "Sheet1",          // Excel worksheet name
            isTitleWrapText = true,            // Enable text wrapping for titles
            isTitleBold = true,                // Make titles bold
            convertNumberAndDate = false,      // Don't convert numbers and dates
            numberFormat = "11",               // Number format code
            dateFormat = "01/01/2025",         // Date format
            ignoreNullValues = false,          // Include null values
            firstRow = 1,                      // Starting row
            firstColumn = 1,                   // Starting column
            async = true                     // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ConvertJsonToExcel");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        
        // Send the conversion request to the API
        var response = await _httpClient.SendAsync(httpRequest);

        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the Excel content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the Excel file to the output path
            await File.WriteAllBytesAsync(_outputExcelPath, resultBytes);
            return _outputExcelPath;
        }
        // Handle asynchronous processing response (202 Accepted)
        else if ((int)response.StatusCode == 202)
        {
            // Extract the polling URL from response headers
            string? locationUrl = response.Headers.Location?.ToString();
            if (string.IsNullOrEmpty(locationUrl) && response.Headers.TryGetValues("Location", out var values))
                locationUrl = System.Linq.Enumerable.FirstOrDefault(values);

            if (string.IsNullOrEmpty(locationUrl))
            {
                Console.WriteLine("No 'Location' header found in the response.");
                return null;
            }

            // Poll for completion with retry logic
            int maxRetries = 10;
            int retryDelay = 10; // seconds

            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                // Wait before polling
                await Task.Delay(retryDelay * 1000);
                
                // Create polling request
                using var pollRequest = new HttpRequestMessage(HttpMethod.Get, locationUrl);
                pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
                var pollResponse = await _httpClient.SendAsync(pollRequest);

                // Handle successful completion
                if ((int)pollResponse.StatusCode == 200)
                {
                    byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                    await File.WriteAllBytesAsync(_outputExcelPath, resultBytes);
                    return _outputExcelPath;
                }
                // Continue polling if still processing
                else if ((int)pollResponse.StatusCode == 202)
                {
                    continue;
                }
                // Handle polling errors
                else
                {
                    Console.WriteLine($"Polling error: {(int)pollResponse.StatusCode}");
                    Console.WriteLine(await pollResponse.Content.ReadAsStringAsync());
                    return null;
                }
            }
            
            // Timeout if conversion doesn't complete within retry limit
            Console.WriteLine("Timeout: JSON to Excel conversion did not complete after multiple retries.");
            return null;
        }
        // Handle other error responses
        else
        {
            Console.WriteLine($"Initial request failed: {(int)response.StatusCode}");
            Console.WriteLine(await response.Content.ReadAsStringAsync());
            return null;
        }
    }
}