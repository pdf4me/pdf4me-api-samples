using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for multiple document generation functionality
/// This program demonstrates how to generate multiple documents using the PDF4ME API
/// The program reads a DOCX template, combines it with JSON data, and generates output documents
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// Sets up the HTTP client, initializes the document generator, and processes the document
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Define the path to the input DOCX template file
        string docxPath = "sample.docx";  // Update this path to your DOCX file location
        
        // API base URL for PDF4ME service
        const string BASE_URL = "https://api.pdf4me.com/";
        
        // Create HTTP client for API communication with the base URL
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the document generator with the HTTP client and DOCX file path
        var documentGenerator = new DocumentMultipleGenerator(httpClient, docxPath);
        
        // Generate DOCX document using the template and JSON data
        Console.WriteLine("=== Generating DOCX Document ===");
        var docxResult = await documentGenerator.GenerateDocumentMultipleAsync("docx");
        
        // Display the result of document generation
        if (!string.IsNullOrEmpty(docxResult))
            Console.WriteLine($"Generated DOCX document saved to: {docxResult}");
        else
            Console.WriteLine("DOCX document generation failed.");
    }
}

/// <summary>
/// Class responsible for generating multiple documents using the PDF4ME API
/// Handles file reading, API communication, and response processing
/// </summary>
public class DocumentMultipleGenerator
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// This key is used for Basic Authentication with the PDF4ME API
    /// </summary>
    private const string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/ ";

    // File paths
    /// <summary>
    /// Path to the input DOCX file to be processed as a template
    /// </summary>
    private readonly string _inputDocxPath;
    
    /// <summary>
    /// Path where the generated documents will be saved (legacy field, not used in current implementation)
    /// </summary>
    private readonly string _outputDocxPath;

    /// <summary>
    /// HTTP client for making API requests to the PDF4ME service
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the document generator
    /// Sets up the file paths and stores the HTTP client for API communication
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputDocxPath">Path to the input DOCX file</param>
    public DocumentMultipleGenerator(HttpClient httpClient, string inputDocxPath)
    {
        _httpClient = httpClient;
        _inputDocxPath = inputDocxPath;
        _outputDocxPath = inputDocxPath.Replace(".pdf", ".generated.pdf"); // Legacy field
    }

    /// <summary>
    /// Generates multiple documents asynchronously using the PDF4ME API
    /// This method reads the template file, loads JSON data, and sends the request to the API
    /// </summary>
    /// <param name="outputType">Output format type (pdf, docx, html) - determines file extension</param>
    /// <returns>Path to the generated documents, or null if generation failed</returns>
    public async Task<string?> GenerateDocumentMultipleAsync(string outputType = "pdf")
    {
        try
        {
            // Verify that the input DOCX template file exists
            if (!File.Exists(_inputDocxPath))
            {
                Console.WriteLine($"DOCX file not found: {_inputDocxPath}");
                return null;
            }

            // Read the DOCX template file and convert it to base64 for API transmission
            byte[] docxBytes = await File.ReadAllBytesAsync(_inputDocxPath);
            string docxBase64 = Convert.ToBase64String(docxBytes);

            // Read JSON data from the sample data file that contains the data to merge into the template
            string jsonDataPath = "sample.json";
            if (!File.Exists(jsonDataPath))
            {
                Console.WriteLine($"JSON data file not found: {jsonDataPath}");
                return null;
            }
            
            string jsonData = await File.ReadAllTextAsync(jsonDataPath);

            // Determine the correct file extension based on the requested output type
            string outputExtension = outputType.ToLower() switch
            {
                "pdf" => ".pdf",
                "docx" => ".docx",
                "html" => ".html",
                _ => ".pdf" // Default to PDF if unknown type
            };
            
            // Create the output file path by replacing the input extension with the generated extension
            string outputPath = _inputDocxPath.Replace(".docx", $".generated{outputExtension}");

            // Prepare the API request payload for multiple document generation
            // This payload contains all the necessary information for the PDF4ME API
            var payload = new
            {
                templateFileType = "Docx",                    // Type of the template file
                templateFileName = "sample.docx",             // Name of the template file
                templateFileData = docxBase64,                // Base64 encoded template content
                documentDataType = "Json",                    // Type of data being provided
                outputType = "Docx",                          // Desired output format
                documentDataText = jsonData,                  // JSON data to merge into template
                async = false                                 // For big files and too many calls async is recommended to reduce the server load
            };

            // Execute the document generation and return the result
            return await ExecuteMultipleDocumentGenerationAsync(payload, outputPath);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GenerateDocumentMultipleAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the multiple document generation operation asynchronously
    /// This method handles the actual API communication, response processing, and file saving
    /// </summary>
    /// <param name="payload">API request payload containing template and data information</param>
    /// <param name="outputPath">Path where the generated document will be saved</param>
    /// <returns>Path to the generated documents, or null if generation failed</returns>
    private async Task<string?> ExecuteMultipleDocumentGenerationAsync(object payload, string outputPath)
    {
        try
        {
            // Serialize the payload to JSON and create HTTP content for the API request
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the multiple document generation operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/GenerateDocumentMultiple");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the multiple document generation request to the PDF4ME API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK) - document generated synchronously
            if ((int)response.StatusCode == 200)
            {
                // Get content type to understand the response format from the API
                string contentType = response.Content.Headers.ContentType?.ToString() ?? "unknown";
                Console.WriteLine($"Response Content-Type: {contentType}");
                
                // Read the response content as text to process it
                string responseText = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Received {responseText.Length} characters");
                
                byte[] resultBytes;
                
                // Check if response is JSON (which contains the document data in a structured format)
                if (contentType.Contains("application/json") || responseText.TrimStart().StartsWith("{"))
                {
                    Console.WriteLine("Processing JSON response...");
                    try
                    {
                        // Parse the JSON response to extract the document data
                        using JsonDocument jsonDoc = JsonDocument.Parse(responseText);
                        JsonElement root = jsonDoc.RootElement;
                        
                        // PDF4ME API returns document data in outputDocuments[0].streamFile
                        // This is the standard response format for the GenerateDocumentMultiple endpoint
                        if (root.TryGetProperty("outputDocuments", out JsonElement outputDocs) &&
                            outputDocs.ValueKind == JsonValueKind.Array &&
                            outputDocs.GetArrayLength() > 0)
                        {
                            var firstDoc = outputDocs[0];
                            if (firstDoc.TryGetProperty("streamFile", out JsonElement streamFile))
                            {
                                // Extract the base64 encoded document data and convert it to bytes
                                string base64Data = streamFile.GetString() ?? "";
                                resultBytes = Convert.FromBase64String(base64Data);
                                Console.WriteLine("Extracted document data from 'outputDocuments[0].streamFile'");
                            }
                            else
                            {
                                throw new Exception("'streamFile' property not found in outputDocuments[0]");
                            }
                        }
                        else
                        {
                            throw new Exception("'outputDocuments' array not found or empty");
                        }
                    }
                    catch (Exception jsonEx)
                    {
                        Console.WriteLine($"Error processing JSON response: {jsonEx.Message}");
                        // Fallback: treat the response as raw text data
                        resultBytes = Encoding.UTF8.GetBytes(responseText);
                    }
                }
                else
                {
                    // Handle direct binary response (less common, but possible)
                    resultBytes = await response.Content.ReadAsByteArrayAsync();
                }
                
                Console.WriteLine($"Final document size: {resultBytes.Length} bytes");
                
                // Validate that the result is actually a valid DOCX file by checking the file signature
                if (resultBytes.Length > 0)
                {
                    // DOCX files start with PK (ZIP file signature) - this is the standard ZIP header
                    if (resultBytes.Length >= 2 && resultBytes[0] == 0x50 && resultBytes[1] == 0x4B)
                    {
                        Console.WriteLine("Valid DOCX file signature detected");
                    }
                    else
                    {
                        Console.WriteLine("Warning: Final result doesn't appear to be a valid DOCX file");
                    }
                }
                
                // Save the generated document to the specified output path
                await File.WriteAllBytesAsync(outputPath, resultBytes);
                return outputPath;
            }
            // Handle asynchronous processing response (202 Accepted) - document generation in progress
            else if ((int)response.StatusCode == 202)
            {
                // Extract the polling URL from response headers for checking generation status
                string? locationUrl = response.Headers.Location?.ToString();
                if (string.IsNullOrEmpty(locationUrl) && response.Headers.TryGetValues("Location", out var values))
                    locationUrl = System.Linq.Enumerable.FirstOrDefault(values);

                if (string.IsNullOrEmpty(locationUrl))
                {
                    Console.WriteLine("No 'Location' header found in the response.");
                    return null;
                }

                // Poll for completion with retry logic for long-running operations
                int maxRetries = 10;
                int retryDelay = 10; // seconds between polling attempts

                for (int attempt = 0; attempt < maxRetries; attempt++)
                {
                    // Wait before polling to avoid overwhelming the server
                    await Task.Delay(retryDelay * 1000);
                    
                    // Create polling request to check if document generation is complete
                    using var pollRequest = new HttpRequestMessage(HttpMethod.Get, locationUrl);
                    pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
                    var pollResponse = await _httpClient.SendAsync(pollRequest);

                    // Handle successful completion of document generation
                    if ((int)pollResponse.StatusCode == 200)
                    {
                        byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                        await File.WriteAllBytesAsync(outputPath, resultBytes);
                        return outputPath;
                    }
                    // Continue polling if document is still being processed
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
            // Handle other error responses (4xx, 5xx status codes)
            else
            {
                Console.WriteLine($"Initial request failed: {(int)response.StatusCode}");
                Console.WriteLine(await response.Content.ReadAsStringAsync());
                return null;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in ExecuteMultipleDocumentGenerationAsync: {ex.Message}");
            return null;
        }
    }
}