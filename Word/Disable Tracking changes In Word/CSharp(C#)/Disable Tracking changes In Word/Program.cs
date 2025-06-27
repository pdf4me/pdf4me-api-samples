using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for disabling tracking changes in Word documents functionality
/// This program demonstrates how to disable tracking changes in Word documents using the PDF4ME API
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
        
        // Initialize the Word tracking changes disabler with the HTTP client and DOCX path
        var trackingDisabler = new DisableTrackingChangesInWord(httpClient, docxPath, API_KEY);
        
        // Disable tracking changes in the Word document
        Console.WriteLine("=== Disabling Tracking Changes in Word Document ===");
        var result = await trackingDisabler.DisableTrackingChangesInWordAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Document with tracking changes disabled saved to: {result}");
        else
            Console.WriteLine("Disabling tracking changes failed.");
    }
}

/// <summary>
/// Class responsible for disabling tracking changes in Word documents using the PDF4ME API
/// </summary>
public class DisableTrackingChangesInWord
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;

    // File paths
    /// <summary>
    /// Path to the input DOCX file to be processed
    /// </summary>
    private readonly string _inputDocxPath;
    
    /// <summary>
    /// Path where the processed DOCX file will be saved
    /// </summary>
    private readonly string _outputDocxPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the Word tracking changes disabler
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputDocxPath">Path to the input DOCX file</param>
    /// <param name="apiKey">API key for authentication</param>
    public DisableTrackingChangesInWord(HttpClient httpClient, string inputDocxPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputDocxPath = inputDocxPath;
        _outputDocxPath = inputDocxPath.Replace(".docx", ".tracking_disabled.docx");
        _apiKey = apiKey;
    }

    /// <summary>
    /// Disables tracking changes in Word document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the processed DOCX file, or null if processing failed</returns>
    public async Task<string?> DisableTrackingChangesInWordAsync()
    {
        try
        {
            if (!File.Exists(_inputDocxPath))
            {
                Console.WriteLine($"DOCX file not found: {_inputDocxPath}");
                return null;
            }

            byte[] docxBytes = await File.ReadAllBytesAsync(_inputDocxPath);
            string docxBase64 = Convert.ToBase64String(docxBytes);

            // Prepare the API request payload
            var payload = new
            {
                docName = "output.docx",                            // Output document name
                docContent = docxBase64,                            // Base64 encoded DOCX content
                async = true                                        // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteTrackingChangesDisableAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in DisableTrackingChangesInWordAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the tracking changes disable operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the processed DOCX file, or null if processing failed</returns>
    private async Task<string?> ExecuteTrackingChangesDisableAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the tracking changes disable operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/DisableTrackingChangesInWord");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the tracking changes disable request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the processed DOCX content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the processed DOCX to the output path
                await File.WriteAllBytesAsync(_outputDocxPath, resultBytes);
                return _outputDocxPath;
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
                        await File.WriteAllBytesAsync(_outputDocxPath, resultBytes);
                        return _outputDocxPath;
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
                Console.WriteLine("Timeout: Disabling tracking changes did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteTrackingChangesDisableAsync: {ex.Message}");
            return null;
        }
    }
}