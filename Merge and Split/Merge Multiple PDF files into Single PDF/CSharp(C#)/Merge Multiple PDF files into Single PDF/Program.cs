using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

/// <summary>
/// Main program class for PDF merging functionality
/// This program demonstrates how to merge multiple PDF files into a single PDF using the PDF4ME API
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
        // Update these paths to your PDF file locations
        List<string> pdfPaths = new List<string>
        {
            "sample.pdf",    // Update this path to your first PDF file
            "sample.pdf"    // Update this path to your second PDF file
        };
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF merger with the HTTP client, PDF paths, and API key
        var pdfMerger = new PdfMerger(httpClient, pdfPaths, API_KEY);
        
        // Perform the PDF merging operation
        var result = await pdfMerger.MergePdfsAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Merged PDF saved to: {result}");
        else
            Console.WriteLine("PDF merging failed.");
    }
}

/// <summary>
/// Class responsible for merging multiple PDF files using the PDF4ME API
/// </summary>
public class PdfMerger
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;

    // File paths
    /// <summary>
    /// List of input PDF file paths to be merged
    /// </summary>
    private readonly List<string> _inputPdfPaths;
    
    /// <summary>
    /// Path where the merged PDF will be saved
    /// </summary>
    private readonly string _outputPdfPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the PDF merger
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPaths">List of paths to the input PDF files</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfMerger(HttpClient httpClient, List<string> inputPdfPaths, string apiKey)
    {
        _httpClient = httpClient;
        _inputPdfPaths = inputPdfPaths;
        _apiKey = apiKey;
        _outputPdfPath = Path.Combine(Path.GetDirectoryName(inputPdfPaths[0]) ?? "/Users", "merged_output.pdf");
    }

    /// <summary>
    /// Merges multiple PDF files asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the merged PDF file, or null if merging failed</returns>
    public async Task<string?> MergePdfsAsync()
    {
        try
        {
            // Read and encode all PDF files
            List<string> pdfBase64Contents = new List<string>();
            
            foreach (string pdfPath in _inputPdfPaths)
            {
                if (!File.Exists(pdfPath))
                {
                    Console.WriteLine($"PDF file not found: {pdfPath}");
                    return null;
                }
                
                byte[] pdfBytes = await File.ReadAllBytesAsync(pdfPath);
                string pdfBase64 = Convert.ToBase64String(pdfBytes);
                pdfBase64Contents.Add(pdfBase64);
            }

            // Prepare the API request payload
            var payload = new
            {
                docContent = pdfBase64Contents,     // Base64 encoded PDF contents
                docName = "output.pdf",             // Output document name
                async = true                        // For big files and too many calls async is recommended to reduce the server load
            };

            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the merging operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/Merge");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the merging request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the merged PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the merged PDF to the output path
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
                        await File.WriteAllBytesAsync(_outputPdfPath, resultBytes);
                        return _outputPdfPath;
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
                
                // Timeout if merging doesn't complete within retry limit
                Console.WriteLine("Timeout: PDF merging did not complete after multiple retries.");
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
            Console.WriteLine($"Error: {ex.Message}");
            return null;
        }
    }
}