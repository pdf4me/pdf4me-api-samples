using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for replacing text with images functionality
/// This program demonstrates how to replace text in PDFs with images using the PDF4ME API
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
        // Path to the input PDF file
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        // Path to the image file to replace text with
        string imagePath = "sample.png";  // Update this path to your image file location
        // Text to be replaced with the image
        string replaceText = "PDF4ME";  // Update this to the text you want to replace
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the text replacer with the HTTP client, PDF path, image path, replace text, and API key
        var textReplacer = new TextReplacer(httpClient, pdfPath, imagePath, replaceText, API_KEY);
        
        // Perform the text replacement operation
        var result = await textReplacer.ReplaceTextWithImageAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF with text replaced saved to: {result}");
        else
            Console.WriteLine("Text replacement failed.");
    }
}

/// <summary>
/// Class responsible for replacing text with images in PDFs using the PDF4ME API
/// </summary>
public class TextReplacer
{
    // Configuration constants
    /// <summary>
    /// API key for authentication
    /// </summary>
    private readonly string _apiKey;

    // File paths and parameters
    /// <summary>
    /// Path to the input PDF file
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path to the replacement image file
    /// </summary>
    private readonly string _replacementImagePath;
    
    /// <summary>
    /// Text to be replaced with the image
    /// </summary>
    private readonly string _replaceText;
    
    /// <summary>
    /// Path where the modified PDF will be saved
    /// </summary>
    private readonly string _outputPdfPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the text replacer
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="replacementImagePath">Path to the replacement image file</param>
    /// <param name="replaceText">Text to be replaced with the image</param>
    /// <param name="apiKey">API key for authentication</param>
    public TextReplacer(HttpClient httpClient, string inputPdfPath, string replacementImagePath, string replaceText, string apiKey)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _replacementImagePath = replacementImagePath;
        _replaceText = replaceText;
        _apiKey = apiKey;
        
        // Generate output path by adding ".replaced" suffix to the original filename
        _outputPdfPath = inputPdfPath.Replace(Path.GetExtension(inputPdfPath), ".replaced" + Path.GetExtension(inputPdfPath));
    }

    /// <summary>
    /// Replaces text in the PDF with an image asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated PDF file with text replaced by image, or null if processing failed</returns>
    public async Task<string?> ReplaceTextWithImageAsync()
    {
        try
        {
            // Read the PDF file and convert to base64
            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Read the replacement image file and convert to base64
            byte[] imageBytes = await File.ReadAllBytesAsync(_replacementImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            // Prepare the API request payload with PDF, image, and replacement settings
            var payload = new
            {
                docContent = pdfBase64,           // Base64 encoded PDF content
                docName = "output.pdf",           // Output document name
                replaceText = _replaceText,       // Text to be replaced
                pageSequence = "all",             // Apply to all pages
                imageContent = imageBase64,       // Base64 encoded replacement image
                imageHeight = 10,                 // Image height in points
                imageWidth = 10,                  // Image width in points
                async = true // For big file and too many calls async is recommended to reduce the server load.
            };

            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ReplaceTextWithImage");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the text replacement request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the processed PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the processed PDF to the output file
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
            Console.WriteLine($"Error: {ex.Message}");
            return null;
        }
    }
}