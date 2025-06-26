using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for Word document tracking changes enablement functionality
/// This program demonstrates how to enable tracking changes in Word documents using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        string wordPath = "sample.docx";  // Update this path to your Word file location
        
        const string BASE_URL = "https://api.pdf4me.com/";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the Word tracking enabler with the HTTP client and Word file path
        var trackingEnabler = new WordTrackingEnabler(httpClient, wordPath);
        
        // Enable tracking changes in the Word document
        Console.WriteLine("=== Enabling Tracking Changes in Word Document ===");
        var result = await trackingEnabler.EnableTrackingChangesAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Word document with tracking enabled saved to: {result}");
        else
            Console.WriteLine("Tracking changes enablement failed.");
    }
}

/// <summary>
/// Class responsible for enabling tracking changes in Word documents using the PDF4ME API
/// </summary>
public class WordTrackingEnabler
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private const string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/ ";

    // File paths
    /// <summary>
    /// Path to the input Word document file to be processed
    /// </summary>
    private readonly string _inputWordPath;
    
    /// <summary>
    /// Path where the Word document with tracking enabled will be saved
    /// </summary>
    private readonly string _outputWordPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the Word tracking enabler
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputWordPath">Path to the input Word document file</param>
    public WordTrackingEnabler(HttpClient httpClient, string inputWordPath)
    {
        _httpClient = httpClient;
        _inputWordPath = inputWordPath;
        _outputWordPath = inputWordPath.Replace(".docx", ".tracking.docx").Replace(".doc", ".tracking.doc");
    }

    /// <summary>
    /// Enables tracking changes in Word document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the Word document with tracking enabled, or null if enablement failed</returns>
    public async Task<string?> EnableTrackingChangesAsync()
    {
        try
        {
            if (!File.Exists(_inputWordPath))
            {
                Console.WriteLine($"Word document file not found: {_inputWordPath}");
                return null;
            }

            byte[] wordBytes = await File.ReadAllBytesAsync(_inputWordPath);
            string wordBase64 = Convert.ToBase64String(wordBytes);

            // Prepare the API request payload for enabling tracking changes
            var payload = new
            {
                docName = "output.docx",      // Output document name
                docContent = wordBase64,      // Base64 encoded Word document content
                async = true                  // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteTrackingChangesEnablementAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in EnableTrackingChangesAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the tracking changes enablement operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the Word document with tracking enabled, or null if enablement failed</returns>
    private async Task<string?> ExecuteTrackingChangesEnablementAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the tracking changes enablement operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/EnableTrackingChangesInWord");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the tracking changes enablement request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the Word document content with tracking enabled from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the Word document with tracking enabled to the output path
                await File.WriteAllBytesAsync(_outputWordPath, resultBytes);
                return _outputWordPath;
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
                        byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                        await File.WriteAllBytesAsync(_outputWordPath, resultBytes);
                        return _outputWordPath;
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
                
                // Timeout if enablement doesn't complete within retry limit
                Console.WriteLine("Timeout: Tracking changes enablement did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteTrackingChangesEnablementAsync: {ex.Message}");
            return null;
        }
    }
}