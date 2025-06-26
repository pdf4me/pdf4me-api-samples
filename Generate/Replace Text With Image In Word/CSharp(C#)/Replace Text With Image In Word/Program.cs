using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for replacing text with images in Word documents functionality
/// This program demonstrates how to replace text with images in Word documents using the PDF4ME API
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
        string docxPath = "sample.docx";  // Update this path to your DOCX file location
        string imagePath = "sample.png";   // Update this path to your image file location
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the text replacer with the HTTP client, DOCX file path, and image path
        var textReplacer = new ReplaceTextWithImageInWord(httpClient, docxPath, imagePath, API_KEY);
        
        // Replace text with image in the Word document
        Console.WriteLine("=== Replacing Text with Image in Word Document ===");
        var result = await textReplacer.ReplaceTextWithImageInWordAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Modified document saved to: {result}");
        else
            Console.WriteLine("Text replacement failed.");
    }
}

/// <summary>
/// Class responsible for replacing text with images in Word documents using the PDF4ME API
/// </summary>
public class ReplaceTextWithImageInWord
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;

    // File paths
    /// <summary>
    /// Path to the input Word document file to be processed
    /// </summary>
    private readonly string _inputDocxPath;
    
    /// <summary>
    /// Path to the input image file to be used for replacement
    /// </summary>
    private readonly string _inputImagePath;
    
    /// <summary>
    /// Path where the modified Word document will be saved
    /// </summary>
    private readonly string _outputDocxPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the text replacer
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputDocxPath">Path to the input Word document file</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    /// <param name="apiKey">API key for authentication</param>
    public ReplaceTextWithImageInWord(HttpClient httpClient, string inputDocxPath, string inputImagePath, string apiKey)
    {
        _httpClient = httpClient;
        _inputDocxPath = inputDocxPath;
        _inputImagePath = inputImagePath;
        _outputDocxPath = inputDocxPath.Replace(".docx", ".modified.docx");
        _apiKey = apiKey;
    }

    /// <summary>
    /// Replaces text with image in Word document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the modified Word document, or null if replacement failed</returns>
    public async Task<string?> ReplaceTextWithImageInWordAsync()
    {
        try
        {
            if (!File.Exists(_inputDocxPath))
            {
                Console.WriteLine($"Word document file not found: {_inputDocxPath}");
                return null;
            }

            if (!File.Exists(_inputImagePath))
            {
                Console.WriteLine($"Image file not found: {_inputImagePath}");
                return null;
            }

            byte[] docxBytes = await File.ReadAllBytesAsync(_inputDocxPath);
            string docxBase64 = Convert.ToBase64String(docxBytes);

            byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            // Prepare the API request payload for text replacement with image
            var payload = new
            {
                docName = "output.docx",           // Output document name
                docContent = docxBase64,           // Base64 encoded Word document content
                ImageFileName = "stamp.png",       // Image file name
                ImageFileContent = imageBase64,    // Base64 encoded image content
                IsFirstPageSkip = false,           // Whether to skip the first page
                PageNumbers = "1",                 // Page numbers to process
                SearchText = "Djokovic",           // Text to search and replace
                async = true                       // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteTextReplacementAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in ReplaceTextWithImageInWordAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the text replacement operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the modified Word document, or null if replacement failed</returns>
    private async Task<string?> ExecuteTextReplacementAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the text replacement operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ReplaceTextWithImageInWord");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the text replacement request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the modified Word document content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the modified Word document to the output path
                await File.WriteAllBytesAsync(_outputDocxPath, resultBytes);
                return _outputDocxPath;
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
                        await File.WriteAllBytesAsync(_outputDocxPath, resultBytes);
                        return _outputDocxPath;
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
                
                // Timeout if replacement doesn't complete within retry limit
                Console.WriteLine("Timeout: Text replacement did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteTextReplacementAsync: {ex.Message}");
            return null;
        }
    }
}
