using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for creating standalone barcodes
/// This program demonstrates how to create barcodes using the PDF4ME API
/// </summary>
public class Program
{
    // Configuration constants
    public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the barcode creator
        var barcodeCreator = new BarcodeCreator(httpClient, API_KEY);
        
        // Perform the barcode creation
        var result = await barcodeCreator.CreateBarcodeAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Barcode image saved to: {result}");
        else
            Console.WriteLine("Barcode creation failed.");
    }
}

/// <summary>
/// Class responsible for creating standalone barcodes using the PDF4ME API
/// </summary>
public class BarcodeCreator
{
    // Output file path
    private readonly string _outputImagePath;
    private readonly string _apiKey;
    // HTTP client for API communication
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the barcode creator
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="apiKey">API key for authentication</param>
    public BarcodeCreator(HttpClient httpClient, string apiKey)
    {
        _httpClient = httpClient;
        _outputImagePath = "Barcode_create_output.png";
        _apiKey = apiKey;
    }

    /// <summary>
    /// Creates a standalone barcode asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated barcode image file, or null if operation failed</returns>
    public async Task<string?> CreateBarcodeAsync()
    {
        // Prepare the API request payload with barcode settings
        var payload = new
        {
            text = "PDF4me Create Barcode Sample",
            barcodeType = "qrCode",
            hideText = false,
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/CreateBarcode");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
        
        // Send the barcode creation request to the API
        var response = await _httpClient.SendAsync(httpRequest);

        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the barcode image content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the barcode image file to the output path
            await File.WriteAllBytesAsync(_outputImagePath, resultBytes);
            return _outputImagePath;
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
                pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
                var pollResponse = await _httpClient.SendAsync(pollRequest);

                // Handle successful completion
                if ((int)pollResponse.StatusCode == 200)
                {
                    byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                    await File.WriteAllBytesAsync(_outputImagePath, resultBytes);
                    return _outputImagePath;
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
            
            // Timeout if barcode creation doesn't complete within retry limit
            Console.WriteLine("Timeout: Barcode creation did not complete after multiple retries.");
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

 