using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for HTML to PDF conversion
/// This program demonstrates how to convert HTML files to PDF format using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Path to the HTML file to be converted
        string htmlPath = "sample.html";  // Use the local sample.html file
        const string BASE_URL = "https://api.pdf4me.com/";
        // Configuration constants
        private const string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";   
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the HTML to PDF converter
        var htmlConverter = new HtmlToPdfConverter(httpClient, htmlPath);
        
        // Perform the conversion
        var result = await htmlConverter.ConvertHtmlToPdfAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF converted and saved to: {result}");
        else
            Console.WriteLine("HTML to PDF conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting HTML files to PDF format using the PDF4ME API
/// </summary>
public class HtmlToPdfConverter
{
    
    // File paths
    private readonly string _inputHtmlPath;
    private readonly string _outputPdfPath;
    
    // HTTP client for API communication
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the HTML to PDF converter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputHtmlPath">Path to the input HTML file</param>
    public HtmlToPdfConverter(HttpClient httpClient, string inputHtmlPath)
    {
        _httpClient = httpClient;
        _inputHtmlPath = inputHtmlPath;
        
        // Generate output PDF path by replacing HTML extension with PDF
        _outputPdfPath = inputHtmlPath.Replace(".html", ".pdf").Replace(".htm", ".pdf");
    }

    /// <summary>
    /// Converts the HTML file to PDF format asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated PDF file, or null if conversion failed</returns>
    public async Task<string?> ConvertHtmlToPdfAsync()
    {
        // Read the HTML file and convert to base64
        byte[] htmlBytes = await File.ReadAllBytesAsync(_inputHtmlPath);
        string htmlBase64 = Convert.ToBase64String(htmlBytes);

        // Prepare the API request payload with conversion settings
        var payload = new
        {
            docContent = htmlBase64,           // Base64 encoded HTML content
            docName = "output.pdf",            // Output document name
            indexFilePath = _inputHtmlPath,    // Path to the HTML file
            layout = "Portrait",               // Page orientation
            format = "A4",                     // Page format
            scale = 0.8,                       // Scale factor
            topMargin = "40px",                // Top margin
            bottomMargin = "40px",             // Bottom margin
            leftMargin = "40px",               // Left margin
            rightMargin = "40px",              // Right margin
            printBackground = true,            // Include background colors/images
            displayHeaderFooter = true,        // Show headers and footers
            async = true                    // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ConvertHtmlToPdf");
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
            Console.WriteLine("Timeout: HTML to PDF conversion did not complete after multiple retries.");
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