using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for single document generation functionality
/// This program demonstrates how to generate a single document using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        string templatePath = "invoice_sample.html";  // Use the PDF invoice template
        
        const string BASE_URL = "https://api.pdf4me.com/";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the document generator with the HTTP client and template path
        var documentGenerator = new DocumentSingleGenerator(httpClient, templatePath);
        
        // Generate the document
        Console.WriteLine("=== Generating Single Document ===");
        var result = await documentGenerator.GenerateDocumentSingleAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Generated document saved to: {result}");
        else
            Console.WriteLine("Document generation failed.");
    }
}

/// <summary>
/// Class responsible for generating single documents using the PDF4ME API
/// </summary>
public class DocumentSingleGenerator
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private const string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/ ";

    // File paths
    /// <summary>
    /// Path to the input PDF file to be processed
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path where the generated document will be saved
    /// </summary>
    private readonly string _outputPdfPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the document generator
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public DocumentSingleGenerator(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _outputPdfPath = inputPdfPath.Replace(".html", ".generated.html");
    }

    /// <summary>
    /// Generates a single document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the generated document, or null if generation failed</returns>
    public async Task<string?> GenerateDocumentSingleAsync()
    {
        try
        {
            if (!File.Exists(_inputPdfPath))
            {
                Console.WriteLine($"Template file not found: {_inputPdfPath}");
                return null;
            }

            // Read the JSON data from the file
            string jsonDataPath = "invoice_sample_data.json";
            if (!File.Exists(jsonDataPath))
            {
                Console.WriteLine($"JSON data file not found: {jsonDataPath}");
                return null;
            }

            string jsonData = await File.ReadAllTextAsync(jsonDataPath);
            byte[] templateBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string templateBase64 = Convert.ToBase64String(templateBytes);

            // Prepare the API request payload for document generation
            var payload = new
            {
                templateFileType = "html",
                templateFileName = "invoice_template.html",
                templateFileData = templateBase64,
                documentDataType = "text",
                outputType = "html",
                documentDataText = jsonData,
                async = false
            };

            return await ExecuteDocumentGenerationAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GenerateDocumentSingleAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the document generation operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the generated document, or null if generation failed</returns>
    private async Task<string?> ExecuteDocumentGenerationAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the document generation operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/GenerateDocumentSingle");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the document generation request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the generated document content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the generated document to the output path
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
                    pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
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
                
                // Timeout if generation doesn't complete within retry limit
                Console.WriteLine("Timeout: Document generation did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteDocumentGenerationAsync: {ex.Message}");
            return null;
        }
    }
}
