using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for compressing images using PDF4ME API
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
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        
        // Initialize the image compressor with the HTTP client and image path
        var imageCompressor = new ImageCompressor(httpClient, imagePath);
        
        // Compress the image
        var result = await imageCompressor.CompressImageAsync();
        
        // Display the results
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Compressed image saved to: {result}");
        else
            Console.WriteLine("Image compression failed.");
    }
}

/// <summary>
/// Class responsible for compressing images using the PDF4ME API
/// </summary>
public class ImageCompressor
{
    // Configuration constants
    /// <summary>
    /// The PDF4ME API endpoint for image compression
    /// </summary>
    private const string API_URL = "https://api.pdf4me.com/api/v2/CompressImage";
    
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
    /// Path where the compressed image will be saved
    /// </summary>
    private readonly string _outputImagePath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Initializes a new instance of the ImageCompressor class
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    public ImageCompressor(HttpClient httpClient, string inputImagePath)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        
        // Generate output filename by adding ".compressed" before the extension
        _outputImagePath = inputImagePath.Replace(Path.GetExtension(inputImagePath), ".compressed" + Path.GetExtension(inputImagePath));

        // Set up HTTP client headers for authentication and content type
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    /// <summary>
    /// Compresses the specified image file asynchronously
    /// </summary>
    /// <returns>The path to the saved compressed image, or null if compression failed</returns>
    public async Task<string?> CompressImageAsync()
    {
        try
        {
            // Read the image file and convert it to base64 for API transmission
            byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            // Determine image type from file extension for proper compression handling
            string imageType = GetImageTypeFromExtension(_inputImagePath);

            // Prepare the API request payload with compression settings
            var payload = new
            {
                docContent = imageBase64,                     // Base64 encoded image content
                docName = Path.GetFileName(_inputImagePath),  // Original image filename
                imageType = imageType,                        // Type of image (JPG, PNG, etc.)
                compressionLevel = "Low",                     // Compression level (Low, Medium, High)
                async = true                                  // Enable asynchronous processing
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
                Console.WriteLine("Timeout: Image compression did not complete after multiple retries.");
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

    /// <summary>
    /// Determines the image type based on the file extension
    /// </summary>
    /// <param name="filePath">Path to the image file</param>
    /// <returns>The image type as a string (JPG, PNG, GIF, BMP, TIFF, WEBP)</returns>
    private string GetImageTypeFromExtension(string filePath)
    {
        string extension = Path.GetExtension(filePath).ToUpperInvariant();
        return extension switch
        {
            ".JPG" or ".JPEG" => "JPG",
            ".PNG" => "PNG",
            ".GIF" => "GIF",
            ".BMP" => "BMP",
            ".TIFF" or ".TIF" => "TIFF",
            ".WEBP" => "WEBP",
            _ => "JPG" // Default to JPG if unknown extension
        };
    }
}