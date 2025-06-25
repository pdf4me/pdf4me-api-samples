using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for adding HTML header/footer to PDF functionality
/// This program demonstrates how to add HTML header/footer to PDF documents using the PDF4ME API
/// </summary>
public class Program
{
    public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Define file path for input PDF document
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the HTML header/footer adder with the HTTP client and PDF file path
        var htmlHeaderFooterAdder = new PdfHtmlHeaderFooterAdder(httpClient, pdfPath);
        
        // Add HTML header/footer to the PDF document
        Console.WriteLine("=== Adding HTML Header/Footer to PDF Document ===");
        var result = await htmlHeaderFooterAdder.AddHtmlHeaderFooterAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF with HTML header/footer saved to: {result}");
        else
            Console.WriteLine("HTML header/footer addition failed.");
    }
}

/// <summary>
/// Class responsible for adding HTML header/footer to PDF documents using the PDF4ME API
/// </summary>
public class PdfHtmlHeaderFooterAdder
{
    // Configuration constants
    /// <summary>
    
    // File paths
    /// <summary>
    /// Path to the input PDF file to be processed
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path where the modified PDF will be saved
    /// </summary>
    private readonly string _outputPdfPath;
    
    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the HTML header/footer adder
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public PdfHtmlHeaderFooterAdder(HttpClient httpClient, string inputPdfPath)
    {
        // Store the HTTP client for API requests
        _httpClient = httpClient;
        
        // Store input PDF file path
        _inputPdfPath = inputPdfPath;
        
        // Generate output file path in the current directory
        string outputFileName = Path.GetFileNameWithoutExtension(inputPdfPath) + ".with_html_header_footer.pdf";
        _outputPdfPath = Path.Combine(Directory.GetCurrentDirectory(), outputFileName);
    }

    /// <summary>
    /// Adds HTML header/footer to PDF document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the modified PDF document, or null if addition failed</returns>
    public async Task<string?> AddHtmlHeaderFooterAsync()
    {
        try
        {
            // Validate that the input PDF file exists
            if (!File.Exists(_inputPdfPath))
            {
                Console.WriteLine($"PDF file not found: {_inputPdfPath}");
                return null;
            }

            // Read PDF file content and convert to base64 for API transmission
            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Prepare the API request payload for adding HTML header/footer
            var payload = new
            {
                // PDF File content - Required: The content of the input file (base64)
                docContent = pdfBase64,
                // PDF File name - Required: Source PDF file name with .pdf extension
                docName = "sample.pdf",
                // HTML Header content - Custom HTML for the header
                headerHtml = "<div style='text-align: center; font-size: 12px; color: #333;'>Company Header - Confidential Document</div>",
                // HTML Footer content - Custom HTML for the footer
                footerHtml = "<div style='text-align: center; font-size: 10px; color: #666;'>Page {page} of {total} - Generated on {date}</div>",
                // Page range where header/footer should be applied
                pages = "all",
                // For big files and too many calls async is recommended to reduce the server load
                async = true
            };

            // Execute the HTML header/footer addition operation
            return await ExecuteHtmlHeaderFooterAdditionAsync(payload);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the HTML header/footer process
            Console.WriteLine($"Error in AddHtmlHeaderFooterAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the HTML header/footer addition operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload containing PDF and HTML header/footer data</param>
    /// <returns>Path to the modified PDF document, or null if addition failed</returns>
    private async Task<string?> ExecuteHtmlHeaderFooterAdditionAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the HTML header/footer addition operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/AddHtmlHeaderFooter");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the HTML header/footer addition request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the modified PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the modified PDF to the output path
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

                // Validate that we received a polling URL
                if (string.IsNullOrEmpty(locationUrl))
                {
                    Console.WriteLine("No 'Location' header found in the response.");
                    return null;
                }

                // Poll for completion with retry logic
                int maxRetries = 10;     // Maximum number of polling attempts
                int retryDelay = 10;     // Delay between polling attempts in seconds

                for (int attempt = 0; attempt < maxRetries; attempt++)
                {
                    // Wait before polling to allow processing time
                    await Task.Delay(retryDelay * 1000);
                    
                    // Create polling request to check processing status
                    using var pollRequest = new HttpRequestMessage(HttpMethod.Get, locationUrl);
                    pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
                    var pollResponse = await _httpClient.SendAsync(pollRequest);

                    // Handle successful completion
                    if ((int)pollResponse.StatusCode == 200)
                    {
                        // Read the completed PDF with HTML header/footer from the response
                        byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                        await File.WriteAllBytesAsync(_outputPdfPath, resultBytes);
                        return _outputPdfPath;
                    }
                    // Continue polling if still processing
                    else if ((int)pollResponse.StatusCode == 202)
                    {
                        continue; // Continue polling
                    }
                    // Handle polling errors
                    else
                    {
                        Console.WriteLine($"Polling error: {(int)pollResponse.StatusCode}");
                        Console.WriteLine(await pollResponse.Content.ReadAsStringAsync());
                        return null;
                    }
                }
                
                // Timeout if HTML header/footer addition doesn't complete within retry limit
                Console.WriteLine("Timeout: HTML header/footer addition did not complete after multiple retries.");
                return null;
            }
            // Handle other error responses
            else
            {
                // Log the error response for debugging
                Console.WriteLine($"Initial request failed: {(int)response.StatusCode}");
                Console.WriteLine(await response.Content.ReadAsStringAsync());
                return null;
            }
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during API communication
            Console.WriteLine($"Error in ExecuteHtmlHeaderFooterAdditionAsync: {ex.Message}");
            return null;
        }
    }
}

 