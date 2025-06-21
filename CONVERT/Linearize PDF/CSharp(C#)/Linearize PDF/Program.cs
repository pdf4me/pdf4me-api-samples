using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for PDF linearization
/// This program demonstrates how to linearize PDF files for web optimization using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Path to the PDF file to be linearized
        string pdfPath = "sample.pdf";  // Use the local sample.pdf file
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        
        // Initialize the PDF linearizer
        var linearizer = new PdfLinearizer(httpClient, pdfPath);
        
        // Perform the linearization
        var result = await linearizer.LinearizePdfAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Linearized PDF saved to: {result}");
        else
            Console.WriteLine("PDF linearization failed.");
    }
}

/// <summary>
/// Class responsible for linearizing PDF files for web optimization using the PDF4ME API
/// </summary>
public class PdfLinearizer
{
    // Configuration constants
    private const string API_URL = "https://api.pdf4me.com/api/v2/LinearizePdf";
    private const string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";

    // File paths
    private readonly string _inputPdfPath;
    private readonly string _outputPdfPath;

    // HTTP client for API communication
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the PDF linearizer
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public PdfLinearizer(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        
        // Generate output PDF path with a unique suffix
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".linearized.pdf");

        // Set up HTTP headers for API authentication and content type
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    /// <summary>
    /// Linearizes the PDF file for web optimization asynchronously
    /// </summary>
    /// <returns>Path to the linearized PDF file, or null if linearization failed</returns>
    public async Task<string?> LinearizePdfAsync()
    {
        // Read the PDF file and convert to base64
        byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
        string pdfBase64 = Convert.ToBase64String(pdfBytes);

        // Prepare the API request payload with optimization settings
        var payload = new
        {
            docContent = pdfBase64,           // Base64 encoded PDF content
            docName = "output.pdf",           // Output document name
            optimizeProfile = "web",          // Optimization profile for web delivery
            async = "true"                    // Enable asynchronous processing
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Send the linearization request to the API
        var response = await _httpClient.PostAsync(API_URL, content);

        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the linearized PDF content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the linearized PDF to the output file
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
                
                // Poll the status URL
                var pollResponse = await _httpClient.GetAsync(locationUrl);

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
            
            // Timeout if linearization doesn't complete within retry limit
            Console.WriteLine("Timeout: PDF linearization did not complete after multiple retries.");
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