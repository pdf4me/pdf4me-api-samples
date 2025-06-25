using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for adding image watermarks to images
/// This program demonstrates how to add image watermarks to images using the PDF4ME API
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
        // Path to the watermark image file - update this to your watermark image location
        string watermarkPath = "sample2.jpg";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the image watermarker with the HTTP client and file paths
        var imageWatermarker = new ImageWatermarker(httpClient, imagePath, watermarkPath, API_KEY);
        
        // Add image watermark to the image
        var result = await imageWatermarker.AddImageWatermarkAsync();
        
        // Display the results
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Watermarked image saved to: {result}");
        else
            Console.WriteLine("Image watermarking failed.");
    }
}

/// <summary>
/// Class responsible for adding image watermarks to images using the PDF4ME API
/// </summary>
public class ImageWatermarker
{

    // File paths
    /// <summary>
    /// Path to the input image file
    /// </summary>
    private readonly string _inputImagePath;
    
    /// <summary>
    /// Path to the watermark image file
    /// </summary>
    private readonly string _watermarkImagePath;
    
    /// <summary>
    /// Path where the watermarked image will be saved
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
    /// Constructor to initialize the image watermarker
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    /// <param name="watermarkImagePath">Path to the watermark image file</param>
    /// <param name="apiKey">API key for authentication</param>
    public ImageWatermarker(HttpClient httpClient, string inputImagePath, string watermarkImagePath, string apiKey)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        _watermarkImagePath = watermarkImagePath;
        _apiKey = apiKey;
        
        // Generate output path by adding ".watermarked" suffix to the original filename
        _outputImagePath = inputImagePath.Replace(Path.GetExtension(inputImagePath), ".watermarked" + Path.GetExtension(inputImagePath));
    }
    
    /// <summary>
    /// Adds an image watermark to the specified image asynchronously
    /// </summary>
    /// <returns>Path to the watermarked image file, or null if watermarking failed</returns>
    public async Task<string?> AddImageWatermarkAsync()
    {
        // Read the main image file and convert it to base64 for API transmission
        byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
        string imageBase64 = Convert.ToBase64String(imageBytes);
        
        // Read the watermark image file and convert it to base64 for API transmission
        byte[] watermarkBytes = await File.ReadAllBytesAsync(_watermarkImagePath);
        string watermarkBase64 = Convert.ToBase64String(watermarkBytes);
        
        // Prepare the API request payload with watermark configuration
        var payload = new
        {
            docName = Path.GetFileName(_inputImagePath),      // Original image filename
            docContent = imageBase64,                         // Base64 encoded main image content
            WatermarkFileName = Path.GetFileName(_watermarkImagePath),  // Watermark image filename
            WatermarkFileContent = watermarkBase64,           // Base64 encoded watermark image content
            Position = "diagonal",                            // Watermark position: diagonal placement
            Opacity = 1.0,                                    // Watermark opacity (1.0 = fully opaque)
            PositionX = 1,                                    // X position offset
            PositionY = 1,                                    // Y position offset
            Rotation = 45,                                    // Watermark rotation angle in degrees
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };
        
        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message for the watermark operation
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/AddImageWatermarkToImage");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
        
        // Send the watermarking request to the API
        var response = await _httpClient.SendAsync(httpRequest);
        
        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the watermarked image content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the watermarked image to the output path
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
            
            // Timeout if watermarking doesn't complete within retry limit
            Console.WriteLine("Timeout: Image watermarking did not complete after multiple retries.");
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