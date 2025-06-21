using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for Image Metadata extraction
/// This program demonstrates how to extract metadata from images using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Path to the image file to extract metadata from
        string imagePath = "sample.jpg";  // Update this path to your image file location
        const string BASE_URL = "https://api.pdf4me.com/";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the image metadata extractor
        var imageMetadataExtractor = new ImageMetadataExtractor(httpClient, imagePath);
        
        // Extract metadata from the image
        var result = await imageMetadataExtractor.GetImageMetadataAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Image metadata:\n{result}");
        else
            Console.WriteLine("Failed to extract image metadata.");
    }
}

/// <summary>
/// Class responsible for extracting metadata from images using the PDF4ME API
/// </summary>
public class ImageMetadataExtractor
{
    // Configuration constants
    private const string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";

    // File paths
    private readonly string _inputImagePath;

    // HTTP client for API communication
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the image metadata extractor
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    public ImageMetadataExtractor(HttpClient httpClient, string inputImagePath)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
    }

    /// <summary>
    /// Extracts metadata from the image asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Formatted JSON string containing image metadata, or null if extraction failed</returns>
    public async Task<string?> GetImageMetadataAsync()
    {
        try
        {
            // Read the image file and convert to base64
            byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            // Determine image type from file extension for proper API handling
            string imageType = GetImageTypeFromExtension(_inputImagePath);

            // Prepare the API request payload with image data
            var payload = new
            {
                docContent = imageBase64,           // Base64 encoded image content
                docName = Path.GetFileName(_inputImagePath),  // Original filename
                imageType = imageType,              // Image format type (JPG, PNG, etc.)
                async = true // For big file and too many calls async is recommended to reduce the server load.
            };

            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/GetImageMetadata");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the metadata extraction request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the metadata JSON from the response
                string resultJson = await response.Content.ReadAsStringAsync();
                return FormatMetadataJson(resultJson);
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
                        string resultJson = await pollResponse.Content.ReadAsStringAsync();
                        return FormatMetadataJson(resultJson);
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
                
                // Timeout if extraction doesn't complete within retry limit
                Console.WriteLine("Timeout: Image metadata extraction did not complete after multiple retries.");
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

    /// <summary>
    /// Determines the image type from the file extension for API compatibility
    /// </summary>
    /// <param name="filePath">Path to the image file</param>
    /// <returns>Image type string (JPG, PNG, GIF, BMP, TIFF, WEBP)</returns>
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

    /// <summary>
    /// Formats the metadata JSON response for better readability
    /// </summary>
    /// <param name="jsonString">Raw JSON string from the API response</param>
    /// <returns>Pretty-printed JSON string, or original string if parsing fails</returns>
    private string FormatMetadataJson(string jsonString)
    {
        try
        {
            // Parse and pretty-print the JSON for better readability
            using JsonDocument document = JsonDocument.Parse(jsonString);
            return JsonSerializer.Serialize(document, new JsonSerializerOptions { WriteIndented = true });
        }
        catch
        {
            // If JSON parsing fails, return the original string
            return jsonString;
        }
    }
}