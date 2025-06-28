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
        
        // Initialize the text extractor with the HTTP client, image path, and API key
        var imageTextExtractor = new ImageTextExtractor(httpClient, imagePath, API_KEY);
        
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
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;

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
    /// <param name="apiKey">API key for authentication</param>
    public ImageTextExtractor(HttpClient httpClient, string inputImagePath, string apiKey)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        _apiKey = apiKey;
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
                async = true // For big file and too many calls async is recommended to reduce the server load.
            };

            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Send the initial request to the API
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ImageExtractText");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            var response = await _httpClient.SendAsync(httpRequest);

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
                    using var pollRequest = new HttpRequestMessage(HttpMethod.Get, locationUrl);
                    pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
                    var pollResponse = await _httpClient.SendAsync(pollRequest);

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
    /// Parses the extracted text from the JSON response
    /// </summary>
    /// <param name="jsonString">JSON string containing the extracted text</param>
    /// <returns>The extracted text, or null if parsing failed</returns>
    private string ParseExtractedText(string jsonString)
    {
        try
        {
            // Try to parse the JSON response
            using JsonDocument document = JsonDocument.Parse(jsonString);
            
            // Look for common text extraction result patterns
            if (document.RootElement.TryGetProperty("text", out var textElement))
            {
                return textElement.GetString() ?? "No text found";
            }
            else if (document.RootElement.TryGetProperty("result", out var resultElement))
            {
                if (resultElement.TryGetProperty("text", out var resultTextElement))
                {
                    return resultTextElement.GetString() ?? "No text found";
                }
                return resultElement.GetString() ?? "No text found";
            }
            else if (document.RootElement.ValueKind == JsonValueKind.String)
            {
                // If the response is just a string, return it directly
                return document.RootElement.GetString() ?? "No text found";
            }
            else
            {
                // If we can't find the text in the expected format, return the full JSON for debugging
                Console.WriteLine("Could not parse text from response, returning full JSON:");
                return jsonString;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing JSON response: {ex.Message}");
            return jsonString; // Return the raw response if parsing fails
        }
    }
}
