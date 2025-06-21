using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for extracting text from images using PDF4ME API
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
        
        // Initialize the text extractor with the HTTP client and image path
        var imageTextExtractor = new ImageTextExtractor(httpClient, imagePath);
        
        // Extract text from the image
        var result = await imageTextExtractor.ExtractTextFromImageAsync();
        
        // Display the results
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Extracted text:\n{result}");
        else
            Console.WriteLine("Failed to extract text from image.");
    }
}

/// <summary>
/// Class responsible for extracting text from images using the PDF4ME API
/// </summary>
public class ImageTextExtractor
{
    // Configuration constants
    /// <summary>
    /// The PDF4ME API endpoint for image text extraction
    /// </summary>
    private const string API_URL = "https://api.pdf4me.com/api/v2/ImageExtractText";
    
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
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Initializes a new instance of the ImageTextExtractor class
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    public ImageTextExtractor(HttpClient httpClient, string inputImagePath)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;

        // Set up HTTP client headers for authentication and content type
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    /// <summary>
    /// Extracts text from the specified image file asynchronously
    /// </summary>
    /// <returns>The extracted text, or null if extraction failed</returns>
    public async Task<string?> ExtractTextFromImageAsync()
    {
        try
        {
            // Read the image file and convert it to base64 for API transmission
            byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            // Prepare the API request payload
            var payload = new
            {
                docName = Path.GetFileName(_inputImagePath),  // Original filename
                docContent = imageBase64,                     // Base64 encoded image content
                async = true                                  // Enable asynchronous processing
            };

            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Send the initial request to the API
            var response = await _httpClient.PostAsync(API_URL, content);

            // Log detailed response information for debugging
            Console.WriteLine($"Response Status Code: {(int)response.StatusCode} ({response.StatusCode})");
            Console.WriteLine($"Response Headers:");
            foreach (var header in response.Headers)
            {
                Console.WriteLine($"  {header.Key}: {string.Join(", ", header.Value)}");
            }
            Console.WriteLine($"Content Headers:");
            foreach (var header in response.Content.Headers)
            {
                Console.WriteLine($"  {header.Key}: {string.Join(", ", header.Value)}");
            }

            // Handle immediate success response (200)
            if ((int)response.StatusCode == 200)
            {
                string resultJson = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Response Body (200): {resultJson}");
                return ParseExtractedText(resultJson);
            }
            // Handle asynchronous processing response (202)
            else if ((int)response.StatusCode == 202)
            {
                Console.WriteLine("Received 202 status - starting polling...");
                
                // Extract the polling URL from the Location header
                string? locationUrl = response.Headers.Location?.ToString();
                if (string.IsNullOrEmpty(locationUrl) && response.Headers.TryGetValues("Location", out var values))
                    locationUrl = System.Linq.Enumerable.FirstOrDefault(values);

                Console.WriteLine($"Location URL: {locationUrl ?? "NOT FOUND"}");

                if (string.IsNullOrEmpty(locationUrl))
                {
                    Console.WriteLine("No 'Location' header found in the response.");
                    return null;
                }

                // Polling configuration
                int maxRetries = 50;      // Maximum number of polling attempts
                int retryDelay = 10;      // Delay between polling attempts in seconds

                // Poll the API until processing is complete
                for (int attempt = 0; attempt < maxRetries; attempt++)
                {
                    Console.WriteLine($"Polling attempt {attempt + 1}/{maxRetries}...");
                    
                    // Wait before making the next polling request
                    await Task.Delay(retryDelay * 1000);
                    
                    // Make polling request
                    var pollResponse = await _httpClient.GetAsync(locationUrl);

                    Console.WriteLine($"Poll response status: {(int)pollResponse.StatusCode} ({pollResponse.StatusCode})");

                    // Handle successful completion
                    if ((int)pollResponse.StatusCode == 200)
                    {
                        string resultJson = await pollResponse.Content.ReadAsStringAsync();
                        Console.WriteLine($"Poll response body (200): {resultJson}");
                        return ParseExtractedText(resultJson);
                    }
                    // Handle still processing
                    else if ((int)pollResponse.StatusCode == 202)
                    {
                        Console.WriteLine("Still processing (202)...");
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
                Console.WriteLine("Timeout: Text extraction did not complete after multiple retries.");
                return null;
            }
            // Handle other error responses
            else
            {
                Console.WriteLine($"Initial request failed: {(int)response.StatusCode}");
                string responseBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Response Body: {responseBody}");
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
    /// Parses the JSON response from the API to extract the text content
    /// </summary>
    /// <param name="jsonString">The JSON response string from the API</param>
    /// <returns>The extracted text or formatted JSON if parsing fails</returns>
    private string ParseExtractedText(string jsonString)
    {
        try
        {
            // Parse the JSON response to extract the text content
            using JsonDocument document = JsonDocument.Parse(jsonString);
            
            // Try to find the extracted text in the response using different possible property names
            if (document.RootElement.TryGetProperty("text", out var textElement))
            {
                return textElement.GetString() ?? "No text found";
            }
            else if (document.RootElement.TryGetProperty("extractedText", out var extractedTextElement))
            {
                return extractedTextElement.GetString() ?? "No text found";
            }
            else if (document.RootElement.TryGetProperty("content", out var contentElement))
            {
                return contentElement.GetString() ?? "No text found";
            }
            else
            {
                // If we can't find a specific text property, return the formatted JSON for debugging
                return JsonSerializer.Serialize(document, new JsonSerializerOptions { WriteIndented = true });
            }
        }
        catch
        {
            // If JSON parsing fails, return the original string
            return jsonString;
        }
    }
}
