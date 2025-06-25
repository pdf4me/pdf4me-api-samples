using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for PDF OCR conversion functionality
/// This program demonstrates how to convert PDF files to editable PDF using OCR via the PDF4ME API
/// </summary>
public class Program
{
    public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location

        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the OCR converter with the HTTP client and PDF path
        var ocrConverter = new PdfOcrConverter(httpClient, pdfPath);
        
        // Convert PDF to editable PDF using OCR
        Console.WriteLine("=== Converting PDF to Editable PDF using OCR ===");
        var result = await ocrConverter.ConvertOcrPdfAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"OCR converted PDF saved to: {result}");
        else
            Console.WriteLine("OCR PDF conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting PDF files to editable PDF using OCR via the PDF4ME API
/// </summary>
public class PdfOcrConverter
{
    // Configuration constants

    // File paths
    /// <summary>
    /// Path to the input PDF file to be converted
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path where the OCR converted PDF file will be saved
    /// </summary>
    private readonly string _outputPdfPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the OCR converter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public PdfOcrConverter(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".ocr.pdf");
    }

    /// <summary>
    /// Converts PDF to editable PDF using OCR asynchronously via the PDF4ME API
    /// </summary>
    /// <returns>Path to the OCR converted PDF file, or null if conversion failed</returns>
    public async Task<string?> ConvertOcrPdfAsync()
    {
        try
        {
            if (!File.Exists(_inputPdfPath))
            {
                Console.WriteLine($"PDF file not found: {_inputPdfPath}");
                return null;
            }

            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Prepare the API request payload for OCR conversion
            var payload = new
            {
                docContent = pdfBase64,                             // Base64 encoded PDF content
                docName = "sample.pdf",                             // Output document name
                qualityType = "Draft",                              // OCR quality setting
                ocrWhenNeeded = "true",                             // Enable OCR when needed
                language = "English",                               // OCR language
                outputFormat = "true",                              // Maintain output format
                mergeAllSheets = true,                              // Merge all sheets
                isAsync = true                                      // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteOcrConversionAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in ConvertOcrPdfAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the OCR conversion operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the OCR converted PDF file, or null if conversion failed</returns>
    private async Task<string?> ExecuteOcrConversionAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the OCR conversion operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ConvertOcrPdf");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the OCR conversion request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the OCR converted PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the OCR converted PDF to the output path
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
                
                // Timeout if conversion doesn't complete within retry limit
                Console.WriteLine("Timeout: OCR PDF conversion did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteOcrConversionAsync: {ex.Message}");
            return null;
        }
    }
}