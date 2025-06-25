using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for PDF metadata extraction functionality
/// This program demonstrates how to extract metadata from PDF files using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        
        const string BASE_URL = "https://api.pdf4me.com/";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF metadata extractor with the HTTP client and PDF path
        var metadataExtractor = new GetPdfMetadata(httpClient, pdfPath);
        
        // Extract PDF metadata
        Console.WriteLine("=== Extracting PDF Metadata ===");
        var result = await metadataExtractor.GetPdfMetadataAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF metadata saved to: {result}");
        else
            Console.WriteLine("Getting PDF metadata failed.");
    }
}

/// <summary>
/// Class responsible for extracting metadata from PDF files using the PDF4ME API
/// </summary>
public class GetPdfMetadata
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private const string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";

    // File paths
    /// <summary>
    /// Path to the input PDF file to extract metadata from
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path where the metadata JSON file will be saved
    /// </summary>
    private readonly string _outputJsonPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the PDF metadata extractor
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public GetPdfMetadata(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _outputJsonPath = inputPdfPath.Replace(".pdf", ".metadata.json");
    }

    /// <summary>
    /// Extracts PDF metadata asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the metadata JSON file, or null if extraction failed</returns>
    public async Task<string?> GetPdfMetadataAsync()
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
                docContent = pdfBase64,                             // Base64 encoded PDF content
                docName = "output.pdf",                             // Output document name
                async = true                                        // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteMetadataExtractionAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetPdfMetadataAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the PDF metadata extraction operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the metadata JSON file, or null if extraction failed</returns>
    private async Task<string?> ExecuteMetadataExtractionAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the metadata extraction operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/GetPdfMetadata");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the metadata extraction request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the metadata JSON from the response
                string resultJson = await response.Content.ReadAsStringAsync();
                
                // Save the metadata JSON to the output path
                await File.WriteAllTextAsync(_outputJsonPath, resultJson);
                return _outputJsonPath;
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
                        string resultJson = await pollResponse.Content.ReadAsStringAsync();
                        await File.WriteAllTextAsync(_outputJsonPath, resultJson);
                        return _outputJsonPath;
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
                
                // Timeout if extraction doesn't complete within retry limit
                Console.WriteLine("Timeout: Getting PDF metadata did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteMetadataExtractionAsync: {ex.Message}");
            return null;
        }
    }
}