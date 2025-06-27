using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for protecting PDF documents functionality
/// This program demonstrates how to protect PDF documents using the PDF4ME API
/// </summary>
public class Program
{
    public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    
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
        
        // Initialize the document protector with the HTTP client and PDF path
        var documentProtector = new ProtectDocument(httpClient, pdfPath, API_KEY);
        
        // Protect the PDF document
        Console.WriteLine("=== Protecting PDF Document ===");
        var result = await documentProtector.ProtectDocumentAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Protected document saved to: {result}");
        else
            Console.WriteLine("Document protection failed.");
    }
}

/// <summary>
/// Class responsible for protecting PDF documents using the PDF4ME API
/// </summary>
public class ProtectDocument
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;

    // File paths
    /// <summary>
    /// Path to the input PDF file to be processed
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path where the protected PDF file will be saved
    /// </summary>
    private readonly string _outputPdfPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the document protector
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="apiKey">API key for authentication</param>
    public ProtectDocument(HttpClient httpClient, string inputPdfPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".protected.pdf");
        _apiKey = apiKey;
    }

    /// <summary>
    /// Protects PDF document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the protected PDF file, or null if processing failed</returns>
    public async Task<string?> ProtectDocumentAsync()
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
                docName = "output.pdf",                             // Output document name
                docContent = pdfBase64,                             // Base64 encoded PDF content
                password = "1234",                                  // Password for the protected PDF
                pdfPermission = "All",                              // PDF permissions
                async = true                                        // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteDocumentProtectionAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in ProtectDocumentAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the document protection operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the protected PDF file, or null if processing failed</returns>
    private async Task<string?> ExecuteDocumentProtectionAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the document protection operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/Protect");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the document protection request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the protected PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the protected PDF to the output path
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
                
                // Timeout if processing doesn't complete within retry limit
                Console.WriteLine("Timeout: Document protection did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteDocumentProtectionAsync: {ex.Message}");
            return null;
        }
    }
}