using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

/// <summary>
/// Main program class for extracting resources from images functionality
/// This program demonstrates how to extract resources from images using the PDF4ME API
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
        string imagePath = "sample.pdf";  // Update this path to your image file location
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the image resource extractor with the HTTP client and image path
        var resourceExtractor = new ImageResourceExtractor(httpClient, imagePath, API_KEY);
        
        // Extract resources from the image
        Console.WriteLine("=== Extracting Resources from PDF ===");
        var result = await resourceExtractor.ExtractResourcesAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Resource extraction result saved to: {result}");
        else
            Console.WriteLine("Resource extraction failed.");
    }
}

/// <summary>
/// Class responsible for extracting resources from images using the PDF4ME API
/// </summary>
public class ImageResourceExtractor
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;

    // File paths
    /// <summary>
    /// Path to the input image file to be processed
    /// </summary>
    private readonly string _inputImagePath;
    
    /// <summary>
    /// Path where the resource extraction result will be saved as DOCX
    /// </summary>
    private readonly string _outputPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the image resource extractor
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    /// <param name="apiKey">API key for authentication</param>
    public ImageResourceExtractor(HttpClient httpClient, string inputImagePath, string apiKey)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        _apiKey = apiKey;
        _outputPath = "resource_extraction_result.docx";
    }

    /// <summary>
    /// Extracts resources from image asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the resource extraction result file, or null if extraction failed</returns>
    public async Task<string?> ExtractResourcesAsync()
    {
        try
        {
            if (!File.Exists(_inputImagePath))
            {
                Console.WriteLine($"Image file not found: {_inputImagePath}");
                return null;
            }

            byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            // Prepare the API request payload
            var payload = new
            {
                docContent = imageBase64,
                docName = "sample.pdf",
                extractText = true,
                extractImage = true,
                async = true                                        // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteResourceExtractionAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in ExtractResourcesAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the resource extraction operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the resource extraction result file, or null if extraction failed</returns>
    private async Task<string?> ExecuteResourceExtractionAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the resource extraction operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ExtractResources");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the resource extraction request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the resource extraction result from the response
                string resultContent = await response.Content.ReadAsStringAsync();
                
                // Parse the JSON response and create DOCX output
                return await CreateDocxFromResourceResult(resultContent);
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
                        return await CreateDocxFromResourceResult(resultContent);
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
                Console.WriteLine("Timeout: Resource extraction did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteResourceExtractionAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Creates a DOCX file from the resource extraction result
    /// </summary>
    /// <param name="jsonResponse">JSON response from the API</param>
    /// <returns>Path to the created DOCX file, or null if creation failed</returns>
    private async Task<string?> CreateDocxFromResourceResult(string jsonResponse)
    {
        try
        {
            // Parse the JSON response
            var response = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
            
            // Create a new Word document
            using (WordprocessingDocument wordDoc = WordprocessingDocument.Create(_outputPath, WordprocessingDocumentType.Document))
            {
                // Add a main document part
                MainDocumentPart mainPart = wordDoc.AddMainDocumentPart();
                mainPart.Document = new Document();
                Body body = mainPart.Document.AppendChild(new Body());

                // Add a title paragraph
                Paragraph titleParagraph = new Paragraph();
                Run titleRun = new Run();
                Text titleText = new Text("Resource Extraction Result");
                titleRun.Append(titleText);
                titleParagraph.Append(titleRun);
                body.AppendChild(titleParagraph);

                // Add a blank line
                body.AppendChild(new Paragraph());

                // Add resource details
                if (response.TryGetProperty("resources", out var resourcesElement))
                {
                    Paragraph resourcesParagraph = new Paragraph();
                    Run resourcesRun = new Run();
                    Text resourcesText = new Text($"Number of Resources: {resourcesElement.GetArrayLength()}");
                    resourcesRun.Append(resourcesText);
                    resourcesParagraph.Append(resourcesRun);
                    body.AppendChild(resourcesParagraph);
                }

                // Add the full JSON response as formatted text
                body.AppendChild(new Paragraph());
                Paragraph jsonParagraph = new Paragraph();
                Run jsonRun = new Run();
                Text jsonText = new Text("Full Response:");
                jsonRun.Append(jsonText);
                jsonParagraph.Append(jsonRun);
                body.AppendChild(jsonParagraph);

                Paragraph responseParagraph = new Paragraph();
                Run responseRun = new Run();
                Text responseText = new Text(jsonResponse);
                responseRun.Append(responseText);
                responseParagraph.Append(responseRun);
                body.AppendChild(responseParagraph);
            }

            return _outputPath;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating DOCX file: {ex.Message}");
            return null;
        }
    }
}