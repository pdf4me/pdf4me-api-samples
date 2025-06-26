using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for signing PDF functionality
/// This program demonstrates how to sign PDF documents using the PDF4ME API
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
        // Define file paths for input documents
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        string imagePath = "sample.png"; // Path to the signature image
        

        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF signer with the HTTP client, file paths, and API key
        var pdfSigner = new PdfSigner(httpClient, pdfPath, imagePath, API_KEY);
        
        // Sign the PDF document
        Console.WriteLine("=== Signing PDF Document ===");
        var result = await pdfSigner.SignPdfAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Signed PDF saved to: {result}");
        else
            Console.WriteLine("PDF signing failed.");
    }
}

/// <summary>
/// Class responsible for signing PDF documents using the PDF4ME API
/// </summary>
public class PdfSigner
{
    
    // File paths
    /// <summary>
    /// Path to the input PDF file to be processed
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path to the signature image file
    /// </summary>
    private readonly string _inputImagePath;
    
    /// <summary>
    /// Path where the signed PDF will be saved
    /// </summary>
    private readonly string _outputPdfPath;
    
    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// API key for authentication
    /// </summary>
    private readonly string _apiKey;

    /// <summary>
    /// Constructor to initialize the PDF signer
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="inputImagePath">Path to the signature image file</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfSigner(HttpClient httpClient, string inputPdfPath, string inputImagePath, string apiKey)
    {
        // Store the HTTP client for API requests
        _httpClient = httpClient;
        
        // Store input file paths
        _inputPdfPath = inputPdfPath;
        _inputImagePath = inputImagePath;
        
        // Store API key
        _apiKey = apiKey;
        
        // Generate output file path in the same directory as input PDF
        string outputFileName = Path.GetFileNameWithoutExtension(inputPdfPath) + ".signed.pdf";
        _outputPdfPath = Path.Combine(Path.GetDirectoryName(inputPdfPath)!, outputFileName);
    }

    /// <summary>
    /// Signs PDF document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the signed PDF document, or null if signing failed</returns>
    public async Task<string?> SignPdfAsync()
    {
        try
        {
            // Validate that the input PDF file exists
            if (!File.Exists(_inputPdfPath))
            {
                Console.WriteLine($"PDF file not found: {_inputPdfPath}");
                return null;
            }

            // Validate that the signature image file exists
            if (!File.Exists(_inputImagePath))
            {
                Console.WriteLine($"Signature image file not found: {_inputImagePath}");
                return null;
            }

            // Read the PDF file and convert to Base64 for API transmission
            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Read and encode the signature image file to Base64
            byte[] signatureImageBytes = await File.ReadAllBytesAsync(_inputImagePath);
            string signatureImageBase64 = Convert.ToBase64String(signatureImageBytes);

            // Prepare the API request payload for signing PDF
            var payload = new
            {
                alignX = "right",                    // Horizontal alignment of signature (right side)
                alignY = "bottom",                   // Vertical alignment of signature (bottom)
                docContent = pdfBase64,              // Base64 encoded PDF content
                docName = "output.pdf",              // Name for the output document
                imageName = Path.GetFileName(_inputImagePath), // Name of the signature image
                imageFile = signatureImageBase64,    // Base64 encoded signature image
                pages = "1",                         // Page number where signature should appear
                marginXInMM = 20,                    // Horizontal margin in millimeters
                marginYInMM = 20,                    // Vertical margin in millimeters
                opacity = 100,                       // Opacity of the signature (100 = fully opaque)
                isBackground = false,                // Whether signature is in background
                // For big files and too many calls async is recommended to reduce the server load
                async = true                         // Enable asynchronous processing
            };

            // Execute the PDF signing operation
            return await ExecutePdfSigningAsync(payload);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the signing process
            Console.WriteLine($"Error in SignPdfAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the PDF signing operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload containing PDF and signature data</param>
    /// <returns>Path to the signed PDF document, or null if signing failed</returns>
    private async Task<string?> ExecutePdfSigningAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the PDF signing operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ImageStamp");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
            
            // Send the PDF signing request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the signed PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the signed PDF to the output path
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
                    pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
                    var pollResponse = await _httpClient.SendAsync(pollRequest);

                    // Handle successful completion
                    if ((int)pollResponse.StatusCode == 200)
                    {
                        // Read the completed signed PDF from the response
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
                
                // Timeout if PDF signing doesn't complete within retry limit
                Console.WriteLine("Timeout: PDF signing did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecutePdfSigningAsync: {ex.Message}");
            return null;
        }
    }
}