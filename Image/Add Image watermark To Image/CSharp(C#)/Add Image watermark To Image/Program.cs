using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for adding image watermarks to images using PDF4ME API
/// </summary>
public class Program
{
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
        
        // Initialize the image watermarker with the HTTP client and file paths
        var imageWatermarker = new ImageWatermarker(httpClient, imagePath, watermarkPath);
        
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
    // Configuration constants
    /// <summary>
    /// The PDF4ME API endpoint for adding image watermarks to images
    /// </summary>
    private const string API_URL = "https://api.pdf4me.com/api/v2/AddImageWatermarkToImage";
    
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private const string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";

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
    /// Initializes a new instance of the ImageWatermarker class
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    /// <param name="watermarkImagePath">Path to the watermark image file</param>
    public ImageWatermarker(HttpClient httpClient, string inputImagePath, string watermarkImagePath)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        _watermarkImagePath = watermarkImagePath;
        
        // Generate output filename by adding ".watermarked" before the extension
        _outputImagePath = inputImagePath.Replace(Path.GetExtension(inputImagePath), ".watermarked" + Path.GetExtension(inputImagePath));

        // Set up HTTP client headers for authentication and content type
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    /// <summary>
    /// Adds an image watermark to the specified image file asynchronously
    /// </summary>
    /// <returns>The path to the saved watermarked image, or null if watermarking failed</returns>
    public async Task<string?> AddImageWatermarkAsync()
    {
        try
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
                docName = Path.GetFileName(_inputImagePath),           // Original image filename
                docContent = imageBase64,                              // Base64 encoded main image content
                WatermarkFileName = Path.GetFileName(_watermarkImagePath),  // Watermark image filename
                WatermarkFileContent = watermarkBase64,               // Base64 encoded watermark image content
                Position = "diagonal",                                // Watermark position on the image
                Opacity = 1.0,                                        // Watermark opacity (0.0 to 1.0)
                PositionX = 1,                                        // X position offset
                PositionY = 1,                                        // Y position offset
                Rotation = 45,                                        // Watermark rotation angle in degrees
                async = true                                          // Enable asynchronous processing
            };

            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Send the initial request to the API
            var response = await _httpClient.PostAsync(API_URL, content);

            // Handle immediate success response (200)
            if ((int)response.StatusCode == 200)
            {
                // Read the response as bytes and save to file
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                await File.WriteAllBytesAsync(_outputImagePath, resultBytes);
                return _outputImagePath;
            }
            // Handle asynchronous processing response (202)
            else if ((int)response.StatusCode == 202)
            {
                // Extract the polling URL from the Location header
                string? locationUrl = response.Headers.Location?.ToString();
                if (string.IsNullOrEmpty(locationUrl) && response.Headers.TryGetValues("Location", out var values))
                    locationUrl = System.Linq.Enumerable.FirstOrDefault(values);

                if (string.IsNullOrEmpty(locationUrl))
                {
                    Console.WriteLine("No 'Location' header found in the response.");
                    return null;
                }

                // Polling configuration
                int maxRetries = 10;      // Maximum number of polling attempts
                int retryDelay = 10;      // Delay between polling attempts in seconds

                // Poll the API until processing is complete
                for (int attempt = 0; attempt < maxRetries; attempt++)
                {
                    // Wait before making the next polling request
                    await Task.Delay(retryDelay * 1000);
                    
                    // Make polling request
                    var pollResponse = await _httpClient.GetAsync(locationUrl);

                    // Handle successful completion
                    if ((int)pollResponse.StatusCode == 200)
                    {
                        // Read the response as bytes and save to file
                        byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                        await File.WriteAllBytesAsync(_outputImagePath, resultBytes);
                        return _outputImagePath;
                    }
                    // Handle still processing
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
                
                // Handle timeout after maximum retries
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
        catch (Exception ex)
        {
            // Handle any exceptions during processing
            Console.WriteLine($"Error: {ex.Message}");
            return null;
        }
    }
}