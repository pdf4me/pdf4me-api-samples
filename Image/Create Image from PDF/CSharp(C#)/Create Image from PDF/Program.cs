using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for creating images from PDF files using PDF4ME API
/// </summary>
public class Program
{
    public static readonly string BASE_URL = "https://api.pdf4me.com/";
    public static readonly string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this application)</param>
    public static async Task Main(string[] args)
    {
        // Path to the input PDF file - update this to your PDF file location
        string pdfPath = "sample.pdf";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF to image converter with the HTTP client, PDF path, and API key
        var pdfToImageConverter = new PdfToImageConverter(httpClient, pdfPath, API_KEY);
        
        // Create images from the PDF
        var result = await pdfToImageConverter.CreateImagesFromPdfAsync();
        
        // Display the results
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Images created and saved to: {result}");
        else
            Console.WriteLine("PDF to image conversion failed.");
    }
}

/// <summary>
/// Class responsible for creating images from PDF files using the PDF4ME API
/// </summary>
public class PdfToImageConverter
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;

    // File paths
    /// <summary>
    /// Path to the input PDF file
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Directory where the output images will be saved
    /// </summary>
    private readonly string _outputDirectory;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Initializes a new instance of the PdfToImageConverter class
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfToImageConverter(HttpClient httpClient, string inputPdfPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _apiKey = apiKey;
        
        // Get the directory of the input PDF file for output location
        _outputDirectory = Path.GetDirectoryName(inputPdfPath) ?? "/Users/";
    }

    /// <summary>
    /// Creates images from the specified PDF file asynchronously
    /// </summary>
    /// <returns>The path to the saved image, or null if conversion failed</returns>
    public async Task<string?> CreateImagesFromPdfAsync()
    {
        try
        {
            // Read the PDF file and convert it to base64 for API transmission
            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Prepare the API request payload with image creation settings
            var payload = new
            {
                docContent = pdfBase64,                       // Base64 encoded PDF content
                docname = "output",                           // Output document name
                imageAction = new
                {
                    WidthPixel = "50",                        // Width of the output image in pixels
                    ImageExtension = "jpeg",                  // Output image format
                    PageSelection = new
                    {
                        PageNrs = new int[] { 1, 1 }         // Page range to convert (first page only)
                    }
                },
                pageNrs = "1",                                // Page numbers to process
                async = true // For big file and too many calls async is recommended to reduce the server load.
            };

            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Send the initial request to the API
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/CreateImages");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200)
            if ((int)response.StatusCode == 200)
            {
                // Read the response as bytes and save to file
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                string outputPath = Path.Combine(_outputDirectory, "output.jpg");
                await File.WriteAllBytesAsync(outputPath, resultBytes);
                return outputPath;
            }
            // Handle asynchronous processing response (202)
            else if ((int)response.StatusCode == 202)
            {
                // Extract the polling URL from the Location header
                string? locationUrl = response.Headers.Location?.ToString();
                if (string.IsNullOrEmpty(locationUrl) && response.Headers.TryGetValues("Location", out var values))
                    locationUrl = System.Linq.Enumerable.FirstOrDefault(values);

                if (string.IsNullOrEmpty(locationUrl))
                {
                    Console.WriteLine("No 'Location' header found in the response.");
                    return null;
                }

                // Polling configuration
                int maxRetries = 10;      // Maximum number of polling attempts
                int retryDelay = 10;      // Delay between polling attempts in seconds

                // Poll the API until processing is complete
                for (int attempt = 0; attempt < maxRetries; attempt++)
                {
                    // Wait before making the next polling request
                    await Task.Delay(retryDelay * 1000);
                    
                    // Make polling request
                    using var pollRequest = new HttpRequestMessage(HttpMethod.Get, locationUrl);
                    pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
                    var pollResponse = await _httpClient.SendAsync(pollRequest);

                    // Handle successful completion
                    if ((int)pollResponse.StatusCode == 200)
                    {
                        // Read the response as bytes and save to file
                        byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                        string outputPath = Path.Combine(_outputDirectory, "output.jpg");
                        await File.WriteAllBytesAsync(outputPath, resultBytes);
                        return outputPath;
                    }
                    // Handle still processing
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
                
                // Handle timeout after maximum retries
                Console.WriteLine("Timeout: PDF to image conversion did not complete after multiple retries.");
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
            // Handle any exceptions during processing
            Console.WriteLine($"Error: {ex.Message}");
            return null;
        }
    }
}
