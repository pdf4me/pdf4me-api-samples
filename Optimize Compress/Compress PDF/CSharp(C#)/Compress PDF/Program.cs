using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for PDF optimization functionality
/// This program demonstrates how to optimize PDF files using the PDF4ME API
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
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF optimizer with the HTTP client, PDF path, and API key
        var pdfOptimizer = new PdfOptimizer(httpClient, pdfPath, API_KEY);
        
        // Example: Optimize PDF with web profile
        Console.WriteLine("=== Optimizing PDF ===");
        var result = await pdfOptimizer.OptimizePdfAsync(
            optimizeProfile: "Web",
            async: true
        );
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Optimized PDF saved to: {result}");
        else
            Console.WriteLine("PDF optimization failed.");
    }
}

/// <summary>
/// Class responsible for optimizing PDF files using the PDF4ME API
/// </summary>
public class PdfOptimizer
{
    // Configuration constants
    /// <summary>

    // File paths
    /// <summary>
    /// Path to the input PDF file to be optimized
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path where the optimized PDF file will be saved
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
    /// Constructor to initialize the PDF optimizer
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfOptimizer(HttpClient httpClient, string inputPdfPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _apiKey = apiKey;
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".optimized.pdf");
    }

    /// <summary>
    /// Optimizes PDF asynchronously using the PDF4ME API
    /// </summary>
    /// <param name="optimizeProfile">Optimization profile (e.g., "Web", "Print", "Screen")</param>
    /// <param name="async">Whether to use asynchronous processing for large files</param>
    /// <returns>Path to the optimized PDF file, or null if optimization failed</returns>
    public async Task<string?> OptimizePdfAsync(
        string optimizeProfile = "Web",
        bool async = true)
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
                optimizeProfile = optimizeProfile,                  // Optimization profile
                async = true                                        // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteOptimizationAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in OptimizePdfAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the PDF optimization operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the optimized PDF file, or null if optimization failed</returns>
    private async Task<string?> ExecuteOptimizationAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the optimization operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/Optimize");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the optimization request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the optimized PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the optimized PDF to the output path
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
                
                // Timeout if optimization doesn't complete within retry limit
                Console.WriteLine("Timeout: PDF optimization did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteOptimizationAsync: {ex.Message}");
            return null;
        }
    }
}