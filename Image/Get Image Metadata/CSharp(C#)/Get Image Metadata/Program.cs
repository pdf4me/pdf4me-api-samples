using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for extracting image metadata
/// This program demonstrates how to extract metadata from images using the PDF4ME API
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
        string imagePath = "sample.png";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the image metadata extractor with the HTTP client, image path, and API key
        var imageMetadataExtractor = new ImageMetadataExtractor(httpClient, imagePath, API_KEY);
        
        // Extract metadata from the image
        var result = await imageMetadataExtractor.GetImageMetadataAsync();
        
        // Display the results
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Image metadata extracted and saved to: {result}");
        else
            Console.WriteLine("Image metadata extraction failed.");
    }
}

/// <summary>
/// Class responsible for extracting metadata from images using the PDF4ME API
/// </summary>
public class ImageMetadataExtractor
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
    /// HTTP client for API communication
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the image metadata extractor
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    /// <param name="apiKey">API key for authentication</param>
    public ImageMetadataExtractor(HttpClient httpClient, string inputImagePath, string apiKey)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        _apiKey = apiKey;
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
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
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
                    pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
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
                
                // Timeout if metadata extraction doesn't complete within retry limit
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
            // Handle any exceptions during processing
            Console.WriteLine($"Error: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Determines the image type from the file extension
    /// </summary>
    /// <param name="filePath">Path to the image file</param>
    /// <returns>Image type string (JPG, PNG, etc.)</returns>
    private static string GetImageTypeFromExtension(string filePath)
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
            _ => "JPG" // Default to JPG for unknown extensions
        };
    }

    /// <summary>
    /// Formats the metadata JSON for better readability and saves it to a file
    /// </summary>
    /// <param name="jsonString">Raw JSON string from the API</param>
    /// <returns>Path to the saved metadata file</returns>
    private string FormatMetadataJson(string jsonString)
    {
        try
        {
            // Parse and format the JSON for better readability
            var jsonDocument = JsonDocument.Parse(jsonString);
            var formattedJson = JsonSerializer.Serialize(jsonDocument, new JsonSerializerOptions { WriteIndented = true });
            
            // Save the formatted JSON to a file
            string outputPath = Path.Combine(Path.GetDirectoryName(_inputImagePath) ?? ".", "Image_metadata_output.json");
            File.WriteAllText(outputPath, formattedJson);
            
            return outputPath;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error formatting JSON: {ex.Message}");
            return null;
        }
    }
}