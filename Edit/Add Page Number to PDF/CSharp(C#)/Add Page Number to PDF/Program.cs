using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for adding page numbers to PDF functionality
/// This program demonstrates how to add page numbers to PDF documents using the PDF4ME API
/// </summary>
public class Program
{
    public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Define file path for input PDF document
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the page number adder with the HTTP client, PDF file path, and API key
        var pageNumberAdder = new PdfPageNumberAdder(httpClient, pdfPath, API_KEY);
        
        // Add page numbers to the PDF document
        Console.WriteLine("=== Adding Page Numbers to PDF Document ===");
        var result = await pageNumberAdder.AddPageNumbersAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF with page numbers saved to: {result}");
        else
            Console.WriteLine("Page number addition failed.");
    }
}

/// <summary>
/// Class responsible for adding page numbers to PDF documents using the PDF4ME API
/// </summary>
public class PdfPageNumberAdder
{

    
    // File paths
    /// <summary>
    /// Path to the input PDF file to be processed
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path where the modified PDF will be saved
    /// </summary>
    private readonly string _outputPdfPath;
    
    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// API key for authentication
    /// </summary>
    private readonly string _apiKey;

    /// <summary>
    /// Constructor to initialize the page number adder
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfPageNumberAdder(HttpClient httpClient, string inputPdfPath, string apiKey)
    {
        // Store the HTTP client for API requests
        _httpClient = httpClient;
        
        // Store input PDF file path
        _inputPdfPath = inputPdfPath;
        
        // Store API key
        _apiKey = apiKey;
        
        // Generate output file path in the same directory as input PDF
        string outputFileName = Path.GetFileNameWithoutExtension(inputPdfPath) + ".with_page_numbers.pdf";
        _outputPdfPath = Path.Combine(Path.GetDirectoryName(inputPdfPath)!, outputFileName);
    }

    /// <summary>
    /// Adds page numbers to PDF document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the modified PDF document, or null if addition failed</returns>
    public async Task<string?> AddPageNumbersAsync()
    {
        try
        {
            // Validate that the input PDF file exists
            if (!File.Exists(_inputPdfPath))
            {
                Console.WriteLine($"PDF file not found: {_inputPdfPath}");
                return null;
            }

            // Read PDF file content and convert to base64 for API transmission
            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Prepare the API request payload for adding page numbers
            var payload = new
            {
                // PDF File content - Required: The content of the input file (base64)
                docContent = pdfBase64,
                // PDF File name - Required: Source PDF file name with .pdf extension
                docName = "sample.pdf",
                // Page number format - Custom format for page numbers
                pageNumberFormat = "Page {page} of {total}",
                // Horizontal alignment of page numbers
                alignX = "center",
                // Vertical alignment of page numbers
                alignY = "bottom",
                // Font size for page numbers
                fontSize = 12,
                // Font color for page numbers (hex color code)
                fontColor = "#000000",
                // Page range where page numbers should be applied
                pages = "all",
                // Horizontal margin in millimeters
                marginXInMM = 0,
                // Vertical margin in millimeters
                marginYInMM = 10,
                // Opacity of the page numbers (100 = fully opaque)
                opacity = 100,
                // Whether page numbers are in background
                isBackground = false,
                // For big files and too many calls async is recommended to reduce the server load
                async = true
            };

            // Execute the page number addition operation
            return await ExecutePageNumberAdditionAsync(payload);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the page number process
            Console.WriteLine($"Error in AddPageNumbersAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the page number addition operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload containing PDF and page number data</param>
    /// <returns>Path to the modified PDF document, or null if addition failed</returns>
    private async Task<string?> ExecutePageNumberAdditionAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the page number addition operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/AddPageNumbers");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the page number addition request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the modified PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the modified PDF to the output path
                await File.WriteAllBytesAsync(_outputPdfPath, resultBytes);
                return _outputPdfPath;
            }
            // Handle asynchronous processing response (202 Accepted)
            else if ((int)response.StatusCode == 202)
            {
                // Extract the polling URL from response headers
                string? locationUrl = response.Headers.Location?.ToString();
                if (string.IsNullOrEmpty(locationUrl) && response.Headers.TryGetValues("Location", out var values))
                    locationUrl = System.Linq.Enumerable.FirstOrDefault(values);

                // Validate that we received a polling URL
                if (string.IsNullOrEmpty(locationUrl))
                {
                    Console.WriteLine("No 'Location' header found in the response.");
                    return null;
                }

                // Poll for completion with retry logic
                int maxRetries = 10;     // Maximum number of polling attempts
                int retryDelay = 10;     // Delay between polling attempts in seconds

                for (int attempt = 0; attempt < maxRetries; attempt++)
                {
                    // Wait before polling to allow processing time
                    await Task.Delay(retryDelay * 1000);
                    
                    // Create polling request to check processing status
                    using var pollRequest = new HttpRequestMessage(HttpMethod.Get, locationUrl);
                    pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
                    var pollResponse = await _httpClient.SendAsync(pollRequest);

                    // Handle successful completion
                    if ((int)pollResponse.StatusCode == 200)
                    {
                        // Read the completed PDF with page numbers from the response
                        byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                        await File.WriteAllBytesAsync(_outputPdfPath, resultBytes);
                        return _outputPdfPath;
                    }
                    // Continue polling if still processing
                    else if ((int)pollResponse.StatusCode == 202)
                    {
                        continue; // Continue polling
                    }
                    // Handle polling errors
                    else
                    {
                        Console.WriteLine($"Polling error: {(int)pollResponse.StatusCode}");
                        Console.WriteLine(await pollResponse.Content.ReadAsStringAsync());
                        return null;
                    }
                }
                
                // Timeout if page number addition doesn't complete within retry limit
                Console.WriteLine("Timeout: Page number addition did not complete after multiple retries.");
                return null;
            }
            // Handle other error responses
            else
            {
                // Log the error response for debugging
                Console.WriteLine($"Initial request failed: {(int)response.StatusCode}");
                Console.WriteLine(await response.Content.ReadAsStringAsync());
                return null;
            }
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during API communication
            Console.WriteLine($"Error in ExecutePageNumberAdditionAsync: {ex.Message}");
            return null;
        }
    }
}

 