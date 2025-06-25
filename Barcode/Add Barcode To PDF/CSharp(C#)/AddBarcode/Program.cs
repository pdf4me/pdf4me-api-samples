using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for adding barcodes to PDF documents
/// This program demonstrates how to add barcodes to PDF files using the PDF4ME API
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
        // Path to the PDF file to add barcode to
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF barcode adder
        var barcodeAdder = new PdfBarcodeAdder(httpClient, pdfPath, API_KEY);
        
        // Perform the barcode addition
        var result = await barcodeAdder.AddBarcodeAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Barcoded PDF file saved to: {result}");
        else
            Console.WriteLine("Barcode addition failed.");
    }
}

/// <summary>
/// Class responsible for adding barcodes to PDF documents using the PDF4ME API
/// </summary>
public class PdfBarcodeAdder
{
 
    
    // File paths
    private readonly string _inputPdfPath;
    private readonly string _outputPdfPath;
    private readonly string _apiKey;
    // HTTP client for API communication
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the PDF barcode adder
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfBarcodeAdder(HttpClient httpClient, string inputPdfPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        
        // Generate output PDF path with a unique suffix
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".barcoded.pdf");
        _apiKey = apiKey;
    }

    /// <summary>
    /// Adds a barcode to the PDF file asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated barcoded PDF file, or null if operation failed</returns>
    public async Task<string?> AddBarcodeAsync()
    {
        // Read the PDF file and convert to base64
        byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
        string pdfBase64 = Convert.ToBase64String(pdfBytes);

        // Prepare the API request payload with barcode settings
        var payload = new
        {
            alignX = "Right",
            alignY = "Top",
            docContent = pdfBase64,           // Base64 encoded PDF content
            docName = Path.GetFileName(_inputPdfPath),
            text = "hello",
            barcodeType = "qrCode",
            pages = "1",
            heightInMM = "40",
            widthInMM = "40",
            marginXInMM = "20",
            marginYInMM = "20",
            heightInPt = "20",
            widthInPt = "20",
            marginXInPt = "10",
            marginYInPt = "10",
            opacity = 100,
            displayText = "above",
            hideText = true,
            showOnlyInPrint = false,
            isTextAbove = true,
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/addbarcode");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
        
        // Send the barcode addition request to the API
        var response = await _httpClient.SendAsync(httpRequest);

        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the barcoded PDF content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the barcoded PDF file to the output path
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
                pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
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
            
            // Timeout if barcode addition doesn't complete within retry limit
            Console.WriteLine("Timeout: PDF barcode addition did not complete after multiple retries.");
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

 