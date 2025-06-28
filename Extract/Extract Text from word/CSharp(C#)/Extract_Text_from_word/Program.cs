using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for extracting text from Word documents functionality
/// This program demonstrates how to extract text from Word documents using the PDF4ME API
/// </summary>
public class Program
{
    public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        string wordPath = "sample.docx";  // Update this path to your Word file location
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the Word text extractor with the HTTP client and Word path
        var textExtractor = new WordTextExtractor(httpClient, wordPath, API_KEY);
        
        // Extract text from the Word document
        Console.WriteLine("=== Extracting Text from Word Document ===");
        var result = await textExtractor.ExtractTextAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Text extraction result saved to: {result}");
        else
            Console.WriteLine("Text extraction failed.");
    }
}

/// <summary>
/// Class responsible for extracting text from Word documents using the PDF4ME API
/// </summary>
public class WordTextExtractor
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;

    // File paths
    /// <summary>
    /// Path to the input Word file to be processed
    /// </summary>
    private readonly string _inputWordPath;
    
    /// <summary>
    /// Path where the text extraction result will be saved
    /// </summary>
    private readonly string _outputPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the Word text extractor
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputWordPath">Path to the input Word file</param>
    /// <param name="apiKey">API key for authentication</param>
    public WordTextExtractor(HttpClient httpClient, string inputWordPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputWordPath = inputWordPath;
        _apiKey = apiKey;
        _outputPath = "word_text_extraction_result.json";
    }

    /// <summary>
    /// Extracts text from Word document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the text extraction result file, or null if extraction failed</returns>
    public async Task<string?> ExtractTextAsync()
    {
        try
        {
            if (!File.Exists(_inputWordPath))
            {
                Console.WriteLine($"Word file not found: {_inputWordPath}");
                return null;
            }

            byte[] wordBytes = await File.ReadAllBytesAsync(_inputWordPath);
            string wordBase64 = Convert.ToBase64String(wordBytes);

            // Prepare the API request payload
            var payload = new
            {
                docContent = wordBase64,
                docName = "output.docx",                                      // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteWordTextExtractionAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in ExtractTextAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the Word text extraction operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the text extraction result file, or null if extraction failed</returns>
    private async Task<string?> ExecuteWordTextExtractionAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the Word text extraction operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ExtractTextFromWord");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the Word text extraction request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the text extraction result from the response
                string resultContent = await response.Content.ReadAsStringAsync();
                
                // Save the text extraction result to the output path
                await File.WriteAllTextAsync(_outputPath, resultContent);
                return _outputPath;
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
                        string resultContent = await pollResponse.Content.ReadAsStringAsync();
                        await File.WriteAllTextAsync(_outputPath, resultContent);
                        return _outputPath;
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
                
                // Timeout if processing doesn't complete within retry limit
                Console.WriteLine("Timeout: Text extraction did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteWordTextExtractionAsync: {ex.Message}");
            return null;
        }
    }
}