using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for Word to PDF Form conversion
/// This program demonstrates how to convert Word files to PDF form format using the PDF4ME API
/// </summary>
public class Program
{	public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Path to the Word file to be converted
        string wordPath = "sample.docx";  // Use the local sample.docx file
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        // Initialize the Word to PDF Form converter
        var converter = new WordToPdfFormConverter(httpClient, wordPath, API_KEY);
        // Perform the conversion
        var result = await converter.ConvertWordToPdfFormAsync();
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF Form file saved to: {result}");
        else
            Console.WriteLine("Word to PDF Form conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting Word files to PDF form format using the PDF4ME API
/// </summary>
public class WordToPdfFormConverter
{
    // File paths
    private readonly string _inputWordPath;
    private readonly string _outputPdfPath;
    // HTTP client for API communication
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    /// <summary>
    /// Constructor to initialize the Word to PDF Form converter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputWordPath">Path to the input Word file</param>
    /// <param name="apiKey">API key for authentication</param>
    public WordToPdfFormConverter(HttpClient httpClient, string inputWordPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputWordPath = inputWordPath;
        _apiKey = apiKey;
        // Generate output PDF path by replacing Word extensions with PDF
        _outputPdfPath = inputWordPath.Replace(".docx", ".pdf").Replace(".doc", ".pdf");
    }
    /// <summary>
    /// Converts the Word file to PDF form format asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated PDF form file, or null if conversion failed</returns>
    public async Task<string?> ConvertWordToPdfFormAsync()
    {
        // Read the Word file and convert to base64
        byte[] wordBytes = await File.ReadAllBytesAsync(_inputWordPath);
        string wordBase64 = Convert.ToBase64String(wordBytes);
        // Prepare the API request payload with conversion settings
        var payload = new
        {
            docContent = wordBase64,           // Base64 encoded Word content
            docName = "output.pdf",            // Output document name
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };
        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ConvertWordToPdfForm");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
        // Send the conversion request to the API
        var response = await _httpClient.SendAsync(httpRequest);
        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the PDF content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            // Save the PDF to the output file
            await File.WriteAllBytesAsync(_outputPdfPath, resultBytes);
            return _outputPdfPath;
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
                    await File.WriteAllBytesAsync(_outputPdfPath, resultBytes);
                    return _outputPdfPath;
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
            // Timeout if conversion doesn't complete within retry limit
            Console.WriteLine("Timeout: Word to PDF Form conversion did not complete after multiple retries.");
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