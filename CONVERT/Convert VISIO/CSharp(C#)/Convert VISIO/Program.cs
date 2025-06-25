using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for VISIO to PDF conversion
/// This program demonstrates how to convert VISIO files to PDF format using the PDF4ME API
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
        // Path to the VISIO file to be converted
        string visioPath = "sample.vsdx";  // Use the local sample.vsdx file
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        // Initialize the VISIO to PDF converter
        var converter = new VisioToPdfConverter(httpClient, visioPath);
        // Perform the conversion
        var result = await converter.ConvertVisioToPdfAsync();
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF file saved to: {result}");
        else
            Console.WriteLine("VISIO to PDF conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting VISIO files to PDF format using the PDF4ME API
/// </summary>
public class VisioToPdfConverter
{

    // File paths
    private readonly string _inputVisioPath;
    private readonly string _outputPdfPath;
    // HTTP client for API communication
    private readonly HttpClient _httpClient;
    /// <summary>
    /// Constructor to initialize the VISIO to PDF converter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputVisioPath">Path to the input VISIO file</param>
    public VisioToPdfConverter(HttpClient httpClient, string inputVisioPath)
    {
        _httpClient = httpClient;
        _inputVisioPath = inputVisioPath;
        // Generate output PDF path by replacing VISIO extensions with PDF
        _outputPdfPath = inputVisioPath.Replace(".vsdx", ".pdf").Replace(".vsd", ".pdf");
    }
    /// <summary>
    /// Converts the VISIO file to PDF format asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated PDF file, or null if conversion failed</returns>
    public async Task<string?> ConvertVisioToPdfAsync()
    {
        // Read the VISIO file and convert to base64
        byte[] visioBytes = await File.ReadAllBytesAsync(_inputVisioPath);
        string visioBase64 = Convert.ToBase64String(visioBytes);
        // Prepare the API request payload with conversion settings
        var payload = new
        {
            docContent = visioBase64,           // Base64 encoded VISIO content
            docName = "output",                 // Output document name
            OutputFormat = "string",            // Output format setting
            PageIndex = 3,                      // Starting page index
            PageCount = 10,                     // Number of pages to convert
            DefaultFont = "string",             // Default font setting
            IncludeHiddenPages = true,          // Include hidden pages
            PageSize = "string",                // Page size setting
            JpegQuality = 2,                    // JPEG quality setting
            SaveForegroundPage = true,          // Save foreground page
            IsPdfCompliant = true,              // Ensure PDF compliance
            ImageBrightness = 3.14,             // Image brightness setting
            ImageContrast = 3.14,               // Image contrast setting
            ImageColorMode = "string",          // Image color mode
            CompositingQuality = "string",      // Compositing quality
            InterpolationMode = "string",       // Interpolation mode
            PixelOffsetMode = "string",         // Pixel offset mode
            Resolution = 3.14,                  // Resolution setting
            Scale = 3.14,                       // Scale factor
            SmoothingMode = "string",           // Smoothing mode
            TiffCompression = "string",         // TIFF compression
            SaveToolBar = true,                 // Save toolbar
            AutoFit = true,                     // Auto-fit setting
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };
        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ConvertVisio?schemaVal=PDF");
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
            Console.WriteLine("Timeout: VISIO to PDF conversion did not complete after multiple retries.");
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