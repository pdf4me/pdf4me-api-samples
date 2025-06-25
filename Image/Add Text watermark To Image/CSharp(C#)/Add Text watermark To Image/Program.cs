using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for adding text watermarks to images
/// This program demonstrates how to add text watermarks to images using the PDF4ME API
/// </summary>
public class Program
{
    public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this application)</param>
    public static async Task Main(string[] args)
    {
        // Path to the input image file - update this to your image file location
        string imagePath = "sample.jpg";
        // Text to be used as watermark
        string watermarkText = "CONFIDENTIAL";  // Update this to your desired watermark text
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the text watermarker with the HTTP client, image path, watermark text, and API key
        var textWatermarker = new TextWatermarker(httpClient, imagePath, watermarkText, API_KEY);
        
        // Add text watermark to the image
        var result = await textWatermarker.AddTextWatermarkAsync();
        
        // Display the results
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Text watermarked image saved to: {result}");
        else
            Console.WriteLine("Text watermarking failed.");
    }
}

/// <summary>
/// Class responsible for adding text watermarks to images using the PDF4ME API
/// </summary>
public class TextWatermarker
{
    // File paths and watermark text
    /// <summary>
    /// Path to the input image file
    /// </summary>
    private readonly string _inputImagePath;
    
    /// <summary>
    /// Text to be used as watermark
    /// </summary>
    private readonly string _watermarkText;
    
    /// <summary>
    /// Path where the text watermarked image will be saved
    /// </summary>
    private readonly string _outputImagePath;
    
    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;
    
    /// <summary>
    /// API key for authentication
    /// </summary>
    private readonly string _apiKey;
    
    /// <summary>
    /// Constructor to initialize the text watermarker
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    /// <param name="watermarkText">Text to be used as watermark</param>
    /// <param name="apiKey">API key for authentication</param>
    public TextWatermarker(HttpClient httpClient, string inputImagePath, string watermarkText, string apiKey)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        _watermarkText = watermarkText;
        _apiKey = apiKey;
        
        // Generate output path by adding ".textwatermarked" suffix to the original filename
        _outputImagePath = inputImagePath.Replace(Path.GetExtension(inputImagePath), ".textwatermarked" + Path.GetExtension(inputImagePath));
    }
    
    /// <summary>
    /// Adds a text watermark to the specified image asynchronously
    /// </summary>
    /// <returns>Path to the text watermarked image file, or null if watermarking failed</returns>
    public async Task<string?> AddTextWatermarkAsync()
    {
        // Read the image file and convert it to base64 for API transmission
        byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
        string imageBase64 = Convert.ToBase64String(imageBytes);
        
        // Prepare the API request payload with text watermark configuration
        var payload = new
        {
            docName = Path.GetFileName(_inputImagePath),  // Original image filename
            docContent = imageBase64,                     // Base64 encoded image content
            WatermarkText = _watermarkText,               // Text to be used as watermark
            Position = "diagonal",                        // Watermark position: diagonal placement
            Opacity = 0.5,                                // Watermark opacity (0.5 = 50% transparent)
            PositionX = 10,                               // X position offset in pixels
            PositionY = 10,                               // Y position offset in pixels
            Rotation = 45,                                // Watermark rotation angle in degrees
            FontSize = 24,                                // Font size for the watermark text
            FontColor = "#FF0000",                        // Font color (red)
            FontFamily = "Arial",                         // Font family for the watermark text
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };
        
        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message for the text watermark operation
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/AddTextWatermarkToImage");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
        
        // Send the text watermarking request to the API
        var response = await _httpClient.SendAsync(httpRequest);
        
        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the text watermarked image content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the text watermarked image to the output path
            await File.WriteAllBytesAsync(_outputImagePath, resultBytes);
            return _outputImagePath;
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
                    await File.WriteAllBytesAsync(_outputImagePath, resultBytes);
                    return _outputImagePath;
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
            
            // Timeout if text watermarking doesn't complete within retry limit
            Console.WriteLine("Timeout: Text watermarking did not complete after multiple retries.");
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
}