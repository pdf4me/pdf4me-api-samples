using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for PDF overlay functionality
/// This program demonstrates how to merge two PDF files one over another as overlay using the PDF4ME API
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
        string basePdfPath = "sample.pdf";      // Update this path to your base PDF file
        string layerPdfPath = "sample.pdf";    // Update this path to your overlay PDF file
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF overlayer with the HTTP client and PDF paths
        var pdfOverlayer = new PdfOverlayer(httpClient, basePdfPath, layerPdfPath, API_KEY);
        
        // Perform the PDF overlay operation
        var result = await pdfOverlayer.OverlayPdfsAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Overlayed PDF saved to: {result}");
        else
            Console.WriteLine("PDF overlay failed.");
    }
}

/// <summary>
/// Class responsible for overlaying PDF files using the PDF4ME API
/// </summary>
public class PdfOverlayer
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;

    // File paths
    /// <summary>
    /// Path to the base PDF file
    /// </summary>
    private readonly string _basePdfPath;
    
    /// <summary>
    /// Path to the layer PDF file that will be overlaid
    /// </summary>
    private readonly string _layerPdfPath;
    
    /// <summary>
    /// Path where the overlaid PDF will be saved
    /// </summary>
    private readonly string _outputPdfPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the PDF overlayer
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="basePdfPath">Path to the base PDF file</param>
    /// <param name="layerPdfPath">Path to the layer PDF file</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfOverlayer(HttpClient httpClient, string basePdfPath, string layerPdfPath, string apiKey)
    {
        _httpClient = httpClient;
        _basePdfPath = basePdfPath;
        _layerPdfPath = layerPdfPath;
        _apiKey = apiKey;
        _outputPdfPath = basePdfPath.Replace(".pdf", ".overlayed.pdf");
    }

    /// <summary>
    /// Overlays two PDF files asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the overlaid PDF file, or null if overlay failed</returns>
    public async Task<string?> OverlayPdfsAsync()
    {
        try
        {
            // Validate that both PDF files exist
            if (!File.Exists(_basePdfPath))
            {
                Console.WriteLine($"Base PDF file not found: {_basePdfPath}");
                return null;
            }

            if (!File.Exists(_layerPdfPath))
            {
                Console.WriteLine($"Layer PDF file not found: {_layerPdfPath}");
                return null;
            }

            // Read and encode the base PDF
            byte[] basePdfBytes = await File.ReadAllBytesAsync(_basePdfPath);
            string basePdfBase64 = Convert.ToBase64String(basePdfBytes);

            // Read and encode the layer PDF
            byte[] layerPdfBytes = await File.ReadAllBytesAsync(_layerPdfPath);
            string layerPdfBase64 = Convert.ToBase64String(layerPdfBytes);

            // Prepare the API request payload
            var payload = new
            {
                baseDocContent = basePdfBase64,     // Base64 encoded base PDF content
                baseDocName = "output.pdf",         // Base document name
                layerDocContent = layerPdfBase64,   // Base64 encoded layer PDF content
                layerDocName = "output.pdf",        // Layer document name
                async = true                        // For big files and too many calls async is recommended to reduce the server load
            };

            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the overlay operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/MergeOverlay");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the overlay request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the overlaid PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the overlaid PDF to the output path
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
                
                // Timeout if overlay doesn't complete within retry limit
                Console.WriteLine("Timeout: PDF overlay did not complete after multiple retries.");
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