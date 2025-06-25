using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for URL to PDF conversion
/// This program demonstrates how to convert a URL to PDF using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Path to the PDF file to be used as template
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        const string BASE_URL = "https://api.pdf4me.com/";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the URL to PDF converter
        var converter = new UrlToPdfConverter(httpClient, pdfPath);
        
        // Perform the conversion
        var result = await converter.ConvertUrlToPdfAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF file saved to: {result}");
        else
            Console.WriteLine("URL to PDF conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting URLs to PDF format using the PDF4ME API
/// </summary>
public class UrlToPdfConverter
{
    // Configuration constants
    private const string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";

    // File paths
    private readonly string _inputPdfPath;
    private readonly string _outputPdfPath;

    // HTTP client for API communication
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the URL to PDF converter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF template file</param>
    public UrlToPdfConverter(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        
        // Generate output PDF path with a unique suffix
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".url2pdf.pdf");
    }

    /// <summary>
    /// Converts a URL to PDF format asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated PDF file, or null if conversion failed</returns>
    public async Task<string?> ConvertUrlToPdfAsync()
    {
        // Read the PDF template file and convert to base64
        byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
        string pdfBase64 = Convert.ToBase64String(pdfBytes);

        // Prepare the API request payload with URL and conversion settings
        var payload = new
        {
            webUrl = "https://www.google.com",    // URL to convert to PDF
            authType = "NoAuth",                  // Authentication type for the URL
            username = "userName",                // Username for authentication (if needed)
            password = "1234",                    // Password for authentication (if needed)
            docContent = pdfBase64,               // Base64 encoded PDF template content
            docName = "output.pdf",               // Output document name
            layout = "landscape",                 // Page layout (landscape or portrait)
            format = "A4",                        // Page format (A4, Letter, etc.)
            scale = 0.8,                          // Scale factor for the content
            topMargin = "40px",                   // Top margin
            leftMargin = "40px",                  // Left margin
            rightMargin = "40px",                 // Right margin
            bottomMargin = "40px",                // Bottom margin
            printBackground = true,               // Include background graphics
            displayHeaderFooter = true,           // Display headers and footers
            async = true                          // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ConvertUrlToPdf");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        
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
            Console.WriteLine("Timeout: URL to PDF conversion did not complete after multiple retries.");
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
