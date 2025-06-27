// See https://aka.ms/new-console-template for more information

using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

/// <summary>
/// Main program class for PDF splitting functionality
/// This program demonstrates how to split PDF files using various methods with the PDF4ME API
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
        
        // Initialize the PDF splitter with the HTTP client, PDF path, and API key
        var pdfSplitter = new PdfSplitter(httpClient, pdfPath, API_KEY);
        
        // Example 1: Split after every page (RecurringSplitAfterPage)
        Console.WriteLine("=== Example 1: Split after every page ===");
        var result1 = await pdfSplitter.SplitRecurringAfterPageAsync(1);
        if (!string.IsNullOrEmpty(result1))
            Console.WriteLine($"Split PDFs saved to: {result1}");
        
        // Example 2: Split after specific page (SplitAfterPage)
        Console.WriteLine("\n=== Example 2: Split after page 1 ===");
        var result2 = await pdfSplitter.SplitAfterPageAsync(1);
        if (!string.IsNullOrEmpty(result2))
            Console.WriteLine($"Split PDFs saved to: {result2}");
        
        // Example 3: Split at specific page sequence (SplitSequence)
        Console.WriteLine("\n=== Example 3: Split at page 1 ===");
        var result3 = await pdfSplitter.SplitSequenceAsync(new int[] { 1 });
        if (!string.IsNullOrEmpty(result3))
            Console.WriteLine($"Split PDFs saved to: {result3}");
        
        // Example 4: Split by page ranges (SplitRanges)
        Console.WriteLine("\n=== Example 4: Split pages 1-4 ===");
        var result4 = await pdfSplitter.SplitRangesAsync("1-4");
        if (!string.IsNullOrEmpty(result4))
            Console.WriteLine($"Split PDFs saved to: {result4}");
    }
}

/// <summary>
/// Class responsible for splitting PDF files using the PDF4ME API
/// </summary>
public class PdfSplitter
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
    /// Constructor to initialize the PDF splitter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfSplitter(HttpClient httpClient, string inputPdfPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _apiKey = apiKey;
        _outputDirectory = inputPdfPath.Replace(".pdf", "_split_output");
    }

    /// <summary>
    /// Splits PDF after every specified number of pages asynchronously
    /// </summary>
    /// <param name="splitAfterPage">Number of pages after which to split</param>
    /// <returns>Path to the split PDF files archive, or null if splitting failed</returns>
    public async Task<string?> SplitRecurringAfterPageAsync(int splitAfterPage)
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
                splitAction = "RecurringSplitAfterPage",  // Split action type
                splitActionNumber = splitAfterPage,       // Number of pages after which to split
                fileNaming = "NameAsPerOrder",            // File naming convention
                async = true                              // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteSplitAsync(payload, "recurring_split");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SplitRecurringAfterPageAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Splits PDF after a specific page asynchronously
    /// </summary>
    /// <param name="splitAfterPage">Page number after which to split</param>
    /// <returns>Path to the split PDF files archive, or null if splitting failed</returns>
    public async Task<string?> SplitAfterPageAsync(int splitAfterPage)
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
                splitAction = "SplitAfterPage",     // Split action type
                splitActionNumber = splitAfterPage, // Page number after which to split
                fileNaming = "NameAsPerOrder",      // File naming convention
                async = true                        // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteSplitAsync(payload, "split_after_page");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SplitAfterPageAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Splits PDF at specific page sequence asynchronously
    /// </summary>
    /// <param name="splitSequence">Array of page numbers at which to split</param>
    /// <returns>Path to the split PDF files archive, or null if splitting failed</returns>
    public async Task<string?> SplitSequenceAsync(int[] splitSequence)
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
                splitAction = "SplitSequence",      // Split action type
                splitSequence = splitSequence,      // Array of page numbers at which to split
                fileNaming = "NameAsPerOrder",      // File naming convention
                async = true                        // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteSplitAsync(payload, "split_sequence");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SplitSequenceAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Splits PDF by page ranges asynchronously
    /// </summary>
    /// <param name="splitRanges">Page ranges string (e.g., "1-4,7-10")</param>
    /// <returns>Path to the split PDF files archive, or null if splitting failed</returns>
    public async Task<string?> SplitRangesAsync(string splitRanges)
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
                splitAction = "SplitRanges",        // Split action type
                splitRanges = splitRanges,          // Page ranges string
                fileNaming = "NameAsPerOrder",      // File naming convention
                async = true                        // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteSplitAsync(payload, "split_ranges");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SplitRangesAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the PDF splitting operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <param name="operationName">Name of the operation for output file naming</param>
    /// <returns>Path to the split PDF files archive, or null if splitting failed</returns>
    private async Task<string?> ExecuteSplitAsync(object payload, string operationName)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the splitting operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/SplitPdf");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the splitting request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the split PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                string outputPath = Path.Combine(_outputDirectory, $"{operationName}_result.zip");
                
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
                        string outputPath = Path.Combine(_outputDirectory, $"{operationName}_result.zip");
                        
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
                Console.WriteLine($"Timeout: PDF splitting ({operationName}) did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteSplitAsync: {ex.Message}");
            return null;
        }
    }
}