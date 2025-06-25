using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for PDF splitting by text functionality
/// This program demonstrates how to split PDF files by text using the PDF4ME API
/// </summary>
public class Program
{
    public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF text splitter with the HTTP client, PDF path, and API key
        var pdfTextSplitter = new PdfTextSplitter(httpClient, pdfPath, API_KEY);
        
        // Example: Split PDF by specific text
        Console.WriteLine("=== Splitting PDF by Text ===");
        var result = await pdfTextSplitter.SplitByTextAsync(
            text: "Nadal, who officially turned professional in 2001",
            splitTextPage: "before",
            fileNaming: "NameAsPerOrder"
        );
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Split PDFs saved to: {result}");
        else
            Console.WriteLine("PDF splitting by text failed.");
    }
}

/// <summary>
/// Class responsible for splitting PDF files by text using the PDF4ME API
/// </summary>
public class PdfTextSplitter
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;
    // File paths
    /// <summary>
    /// Path to the input PDF file to be split
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Directory where split PDF files will be saved
    /// </summary>
    private readonly string _outputDirectory;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the PDF text splitter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfTextSplitter(HttpClient httpClient, string inputPdfPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _apiKey = apiKey;
        _outputDirectory = inputPdfPath.Replace(".pdf", "_text_split_output");
    }

    /// <summary>
    /// Splits PDF by text asynchronously using the PDF4ME API
    /// </summary>
    /// <param name="text">The text string to search for in the PDF</param>
    /// <param name="splitTextPage">Where to split relative to text ("before", "after")</param>
    /// <param name="fileNaming">File naming convention for output files</param>
    /// <returns>Path to the split PDF files archive, or null if splitting failed</returns>
    public async Task<string?> SplitByTextAsync(
        string text,
        string splitTextPage = "before",
        string fileNaming = "NameAsPerOrder")
    {
        try
        {
            if (!File.Exists(_inputPdfPath))
            {
                Console.WriteLine($"PDF file not found: {_inputPdfPath}");
                return null;
            }

            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Prepare the API request payload
            var payload = new
            {
                docContent = pdfBase64,             // Base64 encoded PDF content
                docName = "output.pdf",             // Output document name
                text = text,                        // Text string to search for
                splitTextPage = splitTextPage,      // Where to split relative to text
                fileNaming = fileNaming,            // File naming convention
                async = true                        // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteTextSplitAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SplitByTextAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the PDF splitting by text operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the split PDF files archive, or null if splitting failed</returns>
    private async Task<string?> ExecuteTextSplitAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the text splitting operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/SplitByText");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the text splitting request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the split PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                string outputPath = Path.Combine(_outputDirectory, "text_split_result.zip");
                
                // Ensure output directory exists
                Directory.CreateDirectory(_outputDirectory);
                
                // Save the split PDF archive to the output path
                await File.WriteAllBytesAsync(outputPath, resultBytes);
                return outputPath;
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
                        string outputPath = Path.Combine(_outputDirectory, "text_split_result.zip");
                        
                        // Ensure output directory exists
                        Directory.CreateDirectory(_outputDirectory);
                        
                        await File.WriteAllBytesAsync(outputPath, resultBytes);
                        return outputPath;
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
                
                // Timeout if splitting doesn't complete within retry limit
                Console.WriteLine("Timeout: PDF splitting by text did not complete after multiple retries.");
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
        catch (Exception ex)
        {
            Console.WriteLine($"Error in ExecuteTextSplitAsync: {ex.Message}");
            return null;
        }
    }
}
