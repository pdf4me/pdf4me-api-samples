using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for replacing text with images in PDFs
/// This program demonstrates how to replace text with images in PDF files using the PDF4ME API
/// </summary>
public class Program
{
    public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this application)</param>
    public static async Task Main(string[] args)
    {
        // Path to the input PDF file - update this to your PDF file location
        string pdfPath = "sample.pdf";
        // Path to the replacement image file - update this to your image file location
        string imagePath = "sample.png";
        // Text to be replaced with the image
        string replaceText = "REPLACE_ME";  // Update this to the text you want to replace
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the text replacer with the HTTP client, PDF path, image path, replace text, and API key
        var textReplacer = new TextReplacer(httpClient, pdfPath, imagePath, replaceText, API_KEY);
        
        // Replace text with image in the PDF
        var result = await textReplacer.ReplaceTextWithImageAsync();
        
        // Display the results
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF with text replaced by image saved to: {result}");
        else
            Console.WriteLine("Text replacement failed.");
    }
}

/// <summary>
/// Class responsible for replacing text with images in PDF files using the PDF4ME API
/// </summary>
public class TextReplacer
{
    // Configuration constants
    private readonly string _apiKey;

    // File paths and parameters
    private readonly string _inputPdfPath;
    private readonly string _replacementImagePath;
    private readonly string _replaceText;
    private readonly string _outputPdfPath;

    // HTTP client for API communication
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
        
        // Generate output PDF path with a unique suffix to indicate text replacement
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".replaced.pdf");
    }

    /// <summary>
    /// Replaces text in the PDF with an image asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated PDF file with text replaced by image, or null if processing failed</returns>
    public async Task<string?> ReplaceTextWithImageAsync()
    {
        try
        {
            // Read the PDF file and convert it to base64 for API transmission
            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Read the replacement image file and convert it to base64 for API transmission
            byte[] imageBytes = await File.ReadAllBytesAsync(_replacementImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            // Prepare the API request payload with text replacement parameters
            var payload = new
            {
                docContent = pdfBase64,                       // Base64 encoded PDF content
                docName = Path.GetFileName(_inputPdfPath),    // Original PDF filename
                replaceText = _replaceText,                   // Text to be replaced
                replaceImageContent = imageBase64,            // Base64 encoded replacement image content
                replaceImageName = Path.GetFileName(_replacementImagePath),  // Replacement image filename
                async = true // For big file and too many calls async is recommended to reduce the server load.
            };

            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the text replacement operation
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
                
                // Timeout if text replacement doesn't complete within retry limit
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
            // Handle any exceptions during processing
            Console.WriteLine($"Error: {ex.Message}");
            return null;
        }
    }
}