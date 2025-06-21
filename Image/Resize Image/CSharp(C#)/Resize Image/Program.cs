using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for image resizing functionality
/// This program demonstrates how to resize images using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Path to the input image file to be resized
        string imagePath = "sample.jpg";  // Update this path to your image file location
        const string BASE_URL = "https://api.pdf4me.com/";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the image resizer with the HTTP client and image path
        var imageResizer = new ImageResizer(httpClient, imagePath);
        
        // Perform the image resizing operation
        var result = await imageResizer.ResizeImageAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Resized image saved to: {result}");
        else
            Console.WriteLine("Image resizing failed.");
    }
}

/// <summary>
/// Class responsible for resizing images using the PDF4ME API
/// </summary>
public class ImageResizer
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private const string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";

    // File paths
    /// <summary>
    /// Path to the input image file
    /// </summary>
    private readonly string _inputImagePath;
    
    /// <summary>
    /// Path where the resized image will be saved
    /// </summary>
    private readonly string _outputImagePath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the image resizer
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    public ImageResizer(HttpClient httpClient, string inputImagePath)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        
        // Generate output path by adding ".resized" suffix to the original filename
        _outputImagePath = inputImagePath.Replace(Path.GetExtension(inputImagePath), ".resized" + Path.GetExtension(inputImagePath));
    }

    /// <summary>
    /// Resizes the image asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the resized image file, or null if resizing failed</returns>
    public async Task<string?> ResizeImageAsync()
    {
        // Read the image file and convert it to base64 for API transmission
        byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
        string imageBase64 = Convert.ToBase64String(imageBytes);

        // Prepare the API request payload with resizing parameters
        var payload = new
        {
            docName = Path.GetFileName(_inputImagePath),  // Original filename
            docContent = imageBase64,                     // Base64 encoded image content
            ImageResizeType = "Percentage",               // Resize type: Percentage-based resizing
            ResizePercentage = "20.1010",                 // Resize percentage (20.1010% of original size)
            Width = 60,                                   // Target width in pixels
            Height = 60,                                  // Target height in pixels
            MaintainAspectRatio = true,                   // Maintain aspect ratio during resizing
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message for the resize operation
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ResizeImage?schemaVal=Percentange");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        
        // Send the resizing request to the API
        var response = await _httpClient.SendAsync(httpRequest);

        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the resized image content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the resized image to the output path
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
                pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
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
            
            // Timeout if resizing doesn't complete within retry limit
            Console.WriteLine("Timeout: Image resizing did not complete after multiple retries.");
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