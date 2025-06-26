using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for getting tracking changes from Word documents functionality
/// This program demonstrates how to retrieve tracking changes from Word documents using the PDF4ME API
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
        string docxPath = "sample.docx";  // Update this path to your DOCX file location
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the tracking changes retriever with the HTTP client and DOCX file path
        var trackingChanges = new TrackingChangesInWord(httpClient, docxPath, API_KEY);
        
        // Get tracking changes from the Word document
        Console.WriteLine("=== Getting Tracking Changes from Word Document ===");
        var result = await trackingChanges.GetTrackingChangesInWordAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Tracking changes result saved to: {result}");
        else
            Console.WriteLine("Getting tracking changes failed.");
    }
}

/// <summary>
/// Class responsible for retrieving tracking changes from Word documents using the PDF4ME API
/// </summary>
public class TrackingChangesInWord
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;

    // File paths
    /// <summary>
    /// Path to the input Word document file to be processed
    /// </summary>
    private readonly string _inputDocxPath;
    
    /// <summary>
    /// Path where the tracking changes JSON result will be saved
    /// </summary>
    private readonly string _outputJsonPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the tracking changes retriever
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputDocxPath">Path to the input Word document file</param>
    /// <param name="apiKey">API key for authentication</param>
    public TrackingChangesInWord(HttpClient httpClient, string inputDocxPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputDocxPath = inputDocxPath;
        _outputJsonPath = inputDocxPath.Replace(".docx", ".tracking_changes.json");
        _apiKey = apiKey;
    }

    /// <summary>
    /// Retrieves tracking changes from Word document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the tracking changes JSON file, or null if retrieval failed</returns>
    public async Task<string?> GetTrackingChangesInWordAsync()
    {
        try
        {
            if (!File.Exists(_inputDocxPath))
            {
                Console.WriteLine($"Word document file not found: {_inputDocxPath}");
                return null;
            }

            byte[] docxBytes = await File.ReadAllBytesAsync(_inputDocxPath);
            string docxBase64 = Convert.ToBase64String(docxBytes);

            // Prepare the API request payload for retrieving tracking changes
            var payload = new
            {
                docName = "output.docx",      // Output document name
                docContent = docxBase64,      // Base64 encoded Word document content
                async = true                  // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteTrackingChangesRetrievalAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetTrackingChangesInWordAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the tracking changes retrieval operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the tracking changes JSON file, or null if retrieval failed</returns>
    private async Task<string?> ExecuteTrackingChangesRetrievalAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the tracking changes retrieval operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/GetTrackingChangesInWord");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the tracking changes retrieval request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the tracking changes JSON content from the response
                string resultJson = await response.Content.ReadAsStringAsync();
                
                // Save the tracking changes JSON to the output path
                await File.WriteAllTextAsync(_outputJsonPath, resultJson);
                return _outputJsonPath;
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
                        await File.WriteAllTextAsync(_outputJsonPath, resultJson);
                        return _outputJsonPath;
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
                
                // Timeout if retrieval doesn't complete within retry limit
                Console.WriteLine("Timeout: Getting tracking changes did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteTrackingChangesRetrievalAsync: {ex.Message}");
            return null;
        }
    }
}