using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for PDF splitting by Swiss QR functionality
/// This program demonstrates how to split PDF files by Swiss QR barcode using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        
        const string BASE_URL = "https://api.pdf4me.com/";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF barcode splitter with the HTTP client and PDF path
        var pdfBarcodeSplitter = new PdfBarcodeSplitter(httpClient, pdfPath);
        
        // Example: Split PDF by QR code barcode (Swiss QR or regular QR)
        Console.WriteLine("=== Splitting PDF by QR Code Barcode ===");
        var result = await pdfBarcodeSplitter.SplitByBarcodeAsync(
            barcodeString: "hello",
            barcodeFilter: "startsWith",
            barcodeType: "qrcode",
            splitBarcodePage: "before",
            combinePagesWithSameConsecutiveBarcodes: true,
            pdfRenderDpi: "1"
        );
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Split PDFs saved to: {result}");
        else
            Console.WriteLine("PDF splitting by barcode failed.");
    }
}

/// <summary>
/// Class responsible for splitting PDF files by Swiss QR barcode using the PDF4ME API
/// </summary>
public class PdfBarcodeSplitter
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private const string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";

    // File paths
    /// <summary>
    /// Path to the input PDF file to be split
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Directory where split PDF files will be saved
    /// </summary>
    private readonly string _outputDirectory;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the PDF barcode splitter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public PdfBarcodeSplitter(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _outputDirectory = inputPdfPath.Replace(".pdf", "_swiss_qr_split_output");
    }

    /// <summary>
    /// Splits PDF by Swiss QR barcode asynchronously using the PDF4ME API
    /// </summary>
    /// <param name="barcodeString">The barcode string to search for</param>
    /// <param name="barcodeFilter">Filter type for barcode matching (e.g., "startsWith", "contains", "equals")</param>
    /// <param name="barcodeType">Type of barcode (e.g., "qrcode", "code128", "code39")</param>
    /// <param name="splitBarcodePage">Where to split relative to barcode ("before", "after")</param>
    /// <param name="combinePagesWithSameConsecutiveBarcodes">Whether to combine pages with same consecutive barcodes</param>
    /// <param name="pdfRenderDpi">DPI for PDF rendering</param>
    /// <returns>Path to the split PDF files archive, or null if splitting failed</returns>
    public async Task<string?> SplitByBarcodeAsync(
        string barcodeString,
        string barcodeFilter = "startsWith",
        string barcodeType = "qrcode",
        string splitBarcodePage = "before",
        bool combinePagesWithSameConsecutiveBarcodes = true,
        string pdfRenderDpi = "1")
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

            // Prepare the API request payload
            var payload = new
            {
                docContent = pdfBase64,                             // Base64 encoded PDF content
                docName = "output.pdf",                             // Output document name
                barcodeString = barcodeString,                      // Barcode string to search for
                barcodeFilter = barcodeFilter,                      // Filter type for barcode matching
                barcodeType = barcodeType,                          // Type of barcode
                splitBarcodePage = splitBarcodePage,                // Where to split relative to barcode
                combinePagesWithSameConsecutiveBarcodes = combinePagesWithSameConsecutiveBarcodes,  // Combine pages with same consecutive barcodes
                pdfRenderDpi = pdfRenderDpi,                        // DPI for PDF rendering
                async = true                                        // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteBarcodeSplitAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SplitByBarcodeAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the PDF splitting by Swiss QR barcode operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the split PDF files archive, or null if splitting failed</returns>
    private async Task<string?> ExecuteBarcodeSplitAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the Swiss QR barcode splitting operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/SplitPdfByBarcode_old");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the Swiss QR barcode splitting request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the split PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                string outputPath = Path.Combine(_outputDirectory, "swiss_qr_split_result.zip");
                
                // Ensure output directory exists
                Directory.CreateDirectory(_outputDirectory);
                
                // Save the split PDF archive to the output path
                await File.WriteAllBytesAsync(outputPath, resultBytes);
                return outputPath;
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
                        string outputPath = Path.Combine(_outputDirectory, "swiss_qr_split_result.zip");
                        
                        // Ensure output directory exists
                        Directory.CreateDirectory(_outputDirectory);
                        
                        await File.WriteAllBytesAsync(outputPath, resultBytes);
                        return outputPath;
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
                
                // Timeout if splitting doesn't complete within retry limit
                Console.WriteLine("Timeout: PDF splitting by barcode did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteBarcodeSplitAsync: {ex.Message}");
            return null;
        }
    }
}