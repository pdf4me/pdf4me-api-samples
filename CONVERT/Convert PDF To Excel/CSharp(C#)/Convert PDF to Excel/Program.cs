using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class that demonstrates PDF to Excel conversion using PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Entry point of the application
    /// Converts a PDF file to Excel format using the PDF4ME API
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        // Path to the input PDF file - update this to your PDF file location
        string pdfPath = "sample.pdf";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        
        // Initialize the converter with the HTTP client and PDF path
        var converter = new PdfToExcelConverter(httpClient, pdfPath);
        
        // Perform the conversion asynchronously
        var result = await converter.ConvertPdfToExcelAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Excel file saved to: {result}");
        else
            Console.WriteLine("PDF to Excel conversion failed.");
    }
}

/// <summary>
/// Handles the conversion of PDF files to Excel format using the PDF4ME API
/// Supports both synchronous and asynchronous conversion modes
/// </summary>
public class PdfToExcelConverter
{
    // API Configuration
    /// <summary>
    /// The PDF4ME API endpoint for PDF to Excel conversion
    /// </summary>
    private const string API_URL = "https://api.pdf4me.com/api/v2/ConvertPdfToExcel";
    
    /// <summary>
    /// API key for authentication - replace with your actual API key from PDF4ME dashboard
    /// Get your key from: https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private const string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";

    // File paths
    /// <summary>
    /// Path to the input PDF file
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path where the output Excel file will be saved
    /// </summary>
    private readonly string _outputExcelPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Initializes a new instance of the PdfToExcelConverter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public PdfToExcelConverter(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        
        // Generate output path by replacing .pdf extension with .xlsx
        _outputExcelPath = inputPdfPath.Replace(".pdf", ".xlsx");

        // Configure HTTP client headers for API authentication and content negotiation
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    /// <summary>
    /// Converts the PDF file to Excel format asynchronously
    /// Handles both immediate responses (200) and asynchronous processing (202)
    /// </summary>
    /// <returns>Path to the generated Excel file, or null if conversion failed</returns>
    public async Task<string?> ConvertPdfToExcelAsync()
    {
        // Read the PDF file and convert to base64 for API transmission
        byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
        string pdfBase64 = Convert.ToBase64String(pdfBytes);

        // Prepare the API request payload with conversion parameters
        var payload = new
        {
            docContent = pdfBase64,        // Base64 encoded PDF content
            docName = "output.pdf",        // Document name for the API
            qualityType = "Draft",         // Quality setting for conversion
            language = "English",          // Language for OCR processing
            mergeAllSheets = false,        // Whether to merge all sheets into one
            outputFormat = "yes",          // Enable output formatting
            ocrWhenNeeded = "yes",         // Enable OCR when text extraction is needed
            async = "true"                 // Enable asynchronous processing
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Send the conversion request to the API
        var response = await _httpClient.PostAsync(API_URL, content);

        // Handle immediate success response (200)
        if ((int)response.StatusCode == 200)
        {
            // Read the response content and save as Excel file
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            await File.WriteAllBytesAsync(_outputExcelPath, resultBytes);
            return _outputExcelPath;
        }
        // Handle asynchronous processing response (202)
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

            // Polling configuration for async processing
            int maxRetries = 10;           // Maximum number of polling attempts
            int retryDelay = 10;           // Delay between polls in seconds

            // Poll the API until conversion is complete or timeout occurs
            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                // Wait before next poll
                await Task.Delay(retryDelay * 1000);
                
                // Check conversion status
                var pollResponse = await _httpClient.GetAsync(locationUrl);

                // Handle successful completion (200)
                if ((int)pollResponse.StatusCode == 200)
                {
                    // Download and save the completed Excel file
                    byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                    await File.WriteAllBytesAsync(_outputExcelPath, resultBytes);
                    return _outputExcelPath;
                }
                // Continue polling if still processing (202)
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
            
            // Timeout handling
            Console.WriteLine("Timeout: PDF to Excel conversion did not complete after multiple retries.");
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