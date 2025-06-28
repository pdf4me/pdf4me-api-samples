using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for cropping images
/// This program demonstrates how to crop images using the PDF4ME API
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
        // Path to the input image file - update this to your image file location
        string imagePath = "sample.jpg";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the image cropper with the HTTP client, image path, and API key
        var imageCropper = new ImageCropper(httpClient, imagePath, API_KEY);
        
        // Crop the image
        var result = await imageCropper.CropImageAsync();
        
        // Display the results
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Cropped image saved to: {result}");
        else
            Console.WriteLine("Image cropping failed.");
    }
}

/// <summary>
/// Class responsible for cropping images using the PDF4ME API
/// </summary>
public class ImageCropper
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;
    
    // File paths
    /// <summary>
    /// Path to the input image file
    /// </summary>
    private readonly string _inputImagePath;
    
    /// <summary>
    /// Path where the cropped image will be saved
    /// </summary>
    private readonly string _outputImagePath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the image cropper
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    /// <param name="apiKey">API key for authentication</param>
    public ImageCropper(HttpClient httpClient, string inputImagePath, string apiKey)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        _apiKey = apiKey;
        
        // Generate output path by adding ".cropped" suffix to the original filename
        _outputImagePath = inputImagePath.Replace(Path.GetExtension(inputImagePath), ".cropped" + Path.GetExtension(inputImagePath));
    }

    /// <summary>
    /// Crops the image asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the cropped image file, or null if cropping failed</returns>
    public async Task<string?> CropImageAsync()
    {
        // Read the image file and convert it to base64 for API transmission
        byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
        string imageBase64 = Convert.ToBase64String(imageBytes);

        // Prepare the API request payload with cropping parameters
        var payload = new
        {
            docContent = imageBase64,     // Base64 encoded image content
            docName = "output",           // Output document name
            X = 100,                      // X coordinate of the top-left corner of the crop area
            Y = 100,                      // Y coordinate of the top-left corner of the crop area
            Width = 300,                  // Width of the crop area in pixels
            Height = 200,                 // Height of the crop area in pixels
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message for the crop operation
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/CropImage");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
        
        // Send the cropping request to the API
        var response = await _httpClient.SendAsync(httpRequest);

        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the cropped image content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the cropped image to the output path
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
            
            // Timeout if cropping doesn't complete within retry limit
            Console.WriteLine("Timeout: Image cropping did not complete after multiple retries.");
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
