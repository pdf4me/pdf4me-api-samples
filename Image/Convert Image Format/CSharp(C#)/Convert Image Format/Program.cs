using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for converting image formats using PDF4ME API
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
        
        // Target format for conversion - update this to your desired output format (JPG, PNG, GIF, BMP, TIFF, WEBP)
        string targetFormat = "PNG";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        
        // Initialize the image format converter with the HTTP client, image path, and target format
        var imageFormatConverter = new ImageFormatConverter(httpClient, imagePath, targetFormat);
        
        // Convert the image format
        var result = await imageFormatConverter.ConvertImageFormatAsync();
        
        // Display the results
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Converted image saved to: {result}");
        else
            Console.WriteLine("Image format conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting image formats using the PDF4ME API
/// </summary>
public class ImageFormatConverter
{
    // Configuration constants
    /// <summary>
    /// The PDF4ME API endpoint for image format conversion
    /// </summary>
    private const string API_URL = "https://api.pdf4me.com/api/v2/ConvertImageFormat";
    
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private const string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";

    // File paths and format
    /// <summary>
    /// Path to the input image file
    /// </summary>
    private readonly string _inputImagePath;
    
    /// <summary>
    /// Target format for conversion
    /// </summary>
    private readonly string _targetFormat;
    
    /// <summary>
    /// Path where the converted image will be saved
    /// </summary>
    private readonly string _outputImagePath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Initializes a new instance of the ImageFormatConverter class
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    /// <param name="targetFormat">Target format for conversion</param>
    public ImageFormatConverter(HttpClient httpClient, string inputImagePath, string targetFormat)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        _targetFormat = targetFormat.ToUpperInvariant();
        
        // Generate output path with new format extension
        string currentExtension = Path.GetExtension(_inputImagePath);
        string newExtension = GetExtensionFromFormat(_targetFormat);
        _outputImagePath = _inputImagePath.Replace(currentExtension, newExtension);

        // Set up HTTP client headers for authentication and content type
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    /// <summary>
    /// Converts the specified image file to the target format asynchronously
    /// </summary>
    /// <returns>The path to the saved converted image, or null if conversion failed</returns>
    public async Task<string?> ConvertImageFormatAsync()
    {
        try
        {
            // Read the image file and convert it to base64 for API transmission
            byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            // Determine current image format from file extension
            string currentFormat = GetFormatFromExtension(_inputImagePath);

            // Prepare the API request payload with format conversion settings
            var payload = new
            {
                docContent = imageBase64,                     // Base64 encoded image content
                docName = Path.GetFileName(_inputImagePath),  // Original image filename
                currentImageFormat = currentFormat,           // Current format of the image
                newImageFormat = _targetFormat,               // Target format for conversion
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
                Console.WriteLine("Timeout: Image format conversion did not complete after multiple retries.");
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
    /// Determines the image format based on the file extension
    /// </summary>
    /// <param name="filePath">Path to the image file</param>
    /// <returns>The image format as a string (JPG, PNG, GIF, BMP, TIFF, WEBP)</returns>
    private string GetFormatFromExtension(string filePath)
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

    /// <summary>
    /// Gets the file extension for a given image format
    /// </summary>
    /// <param name="format">The image format (JPG, PNG, GIF, BMP, TIFF, WEBP)</param>
    /// <returns>The corresponding file extension with dot prefix</returns>
    private string GetExtensionFromFormat(string format)
    {
        return format.ToUpperInvariant() switch
        {
            "JPG" or "JPEG" => ".jpg",
            "PNG" => ".png",
            "GIF" => ".gif",
            "BMP" => ".bmp",
            "TIFF" => ".tiff",
            "WEBP" => ".webp",
            _ => ".jpg" // Default to JPG if unknown format
        };
    }
}