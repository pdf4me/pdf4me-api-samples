using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for PDF to Word conversion
/// This program demonstrates how to convert PDF files to Word format using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Path to the PDF file to be converted
        string pdfPath = "sample.pdf";  // Use the local sample.pdf file
        const string BASE_URL = "https://api.pdf4me.com/";
        // Configuration constants
   		 private const string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF to Word converter
        var converter = new PdfToWordConverter(httpClient, pdfPath);
        
        // Perform the conversion
        var result = await converter.ConvertPdfToWordAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Word file saved to: {result}");
        else
            Console.WriteLine("PDF to Word conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting PDF files to Word format using the PDF4ME API
/// </summary>
public class PdfToWordConverter
{

    // File paths
    private readonly string _inputPdfPath;
    private readonly string _outputWordPath;

    // HTTP client for API communication
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the PDF to Word converter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public PdfToWordConverter(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        
        // Generate output Word path by replacing PDF extension with DOCX
        _outputWordPath = inputPdfPath.Replace(".pdf", ".docx");
    }

    /// <summary>
    /// Converts the PDF file to Word format asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated Word file, or null if conversion failed</returns>
    public async Task<string?> ConvertPdfToWordAsync()
    {
        // Read the PDF file and convert to base64
        byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
        string pdfBase64 = Convert.ToBase64String(pdfBytes);

        // Prepare the API request payload with conversion settings
        var payload = new
        {
            docContent = pdfBase64,           // Base64 encoded PDF content
            docName = "test.pdf",             // Output document name
            qualityType = "Draft",            // Quality setting for conversion
            language = "English",             // Language for OCR processing
            mergeAllSheets = true,            // Merge all sheets into one
            outputFormat = "xyz",             // Output format setting
            ocrWhenNeeded = "true",           // Enable OCR when needed
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ConvertPdfToWord");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        
        // Send the conversion request to the API
        var response = await _httpClient.SendAsync(httpRequest);

        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the Word content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the Word file to the output path
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
            
            // Timeout if conversion doesn't complete within retry limit
            Console.WriteLine("Timeout: PDF to Word conversion did not complete after multiple retries.");
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
