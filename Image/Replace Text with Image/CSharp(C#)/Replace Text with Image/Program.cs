using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for Text to Image replacement in PDFs
/// This program demonstrates how to replace text in PDF documents with images using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Path to the PDF file to perform text replacement in
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        
        // Path to the replacement image file
        string imagePath = "sample.png";  // Update this path to your replacement image location
        
        // Text to be replaced with the image
        string replaceText = "enter_input_text";  // Update this to the text you want to replace
        
        const string BASE_URL = "https://api.pdf4me.com/";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the text replacer
        var textReplacer = new TextReplacer(httpClient, pdfPath, imagePath, replaceText);
        
        // Replace text with image in the PDF
        var result = await textReplacer.ReplaceTextWithImageAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF with text replaced by image saved to: {result}");
        else
            Console.WriteLine("Failed to replace text with image.");
    }
}

/// <summary>
/// Class responsible for replacing text in PDF documents with images using the PDF4ME API
/// </summary>
public class TextReplacer
{
    // Configuration constants
    private const string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";

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
    public TextReplacer(HttpClient httpClient, string inputPdfPath, string replacementImagePath, string replaceText)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _replacementImagePath = replacementImagePath;
        _replaceText = replaceText;
        
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
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
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
                    pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
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