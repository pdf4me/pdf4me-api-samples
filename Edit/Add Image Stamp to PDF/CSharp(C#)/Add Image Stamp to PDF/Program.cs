using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

/// <summary>
/// Main program class for adding image stamps to PDF functionality
/// This program demonstrates how to add image stamps to PDF documents using the PDF4ME API
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
        string imagePath = "sample.png"; // Path to the image file to be used as stamp
        
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the image stamp adder with the HTTP client and file paths
        var imageStampAdder = new PdfImageStampAdder(httpClient, pdfPath, imagePath);
        
        // Add image stamp to the PDF document
        Console.WriteLine("=== Adding Image Stamp to PDF Document ===");
        var result = await imageStampAdder.AddImageStampAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF with image stamp saved to: {result}");
        else
            Console.WriteLine("Image stamp addition failed.");
    }
}

/// <summary>
/// Class responsible for adding image stamps to PDF documents using the PDF4ME API
/// </summary>
public class PdfImageStampAdder
{

    
    // File paths
    /// <summary>
    /// Path to the input PDF file to be processed
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path to the input image file to be used as stamp
    /// </summary>
    private readonly string _inputImagePath;
    
    /// <summary>
    /// Path where the modified PDF will be saved
    /// </summary>
    private readonly string _outputPdfPath;
    
    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the image stamp adder
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    public PdfImageStampAdder(HttpClient httpClient, string inputPdfPath, string inputImagePath)
    {
        // Store the HTTP client for API requests
        _httpClient = httpClient;
        
        // Store input file paths
        _inputPdfPath = inputPdfPath;
        _inputImagePath = inputImagePath;
        
        // Generate output file path in the same directory as input PDF
        string outputFileName = Path.GetFileNameWithoutExtension(inputPdfPath) + ".with_image_stamp.pdf";
        _outputPdfPath = Path.Combine(Path.GetDirectoryName(inputPdfPath)!, outputFileName);
    }

    /// <summary>
    /// Adds image stamp to PDF document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the modified PDF document, or null if addition failed</returns>
    public async Task<string?> AddImageStampAsync()
    {
        try
        {
            // Validate that the input PDF file exists
            if (!File.Exists(_inputPdfPath))
            {
                Console.WriteLine($"PDF file not found: {_inputPdfPath}");
                return null;
            }

            // Validate that the input image file exists
            if (!File.Exists(_inputImagePath))
            {
                Console.WriteLine($"Image file not found: {_inputImagePath}");
                return null;
            }

            // Read PDF file content and convert to base64 for API transmission
            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Read and encode the image file to Base64 for stamp
            byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            // Prepare the API request payload for adding image stamp
            var payload = new
            {
                // PDF File content - Required: The content of the input file (base64)
                docContent = pdfBase64,
                // PDF File name - Required: Source PDF file name with .pdf extension
                docName = "sample.pdf",
                // Image file content - Required: The content of the image file (base64)
                imageFile = imageBase64,
                // Image file name - Required: Source image file name with extension
                imageName = "sample.png",
                // Page range where image stamp should be applied
                pages = "all",
                // Horizontal alignment of the image stamp
                alignX = "left",
                // Vertical alignment of the image stamp
                alignY = "top",
                // Height of the image stamp in millimeters
                heightInMM = "100",
                // Width of the image stamp in millimeters
                widthInMM = "100",
                // Horizontal margin in millimeters
                marginXInMM = "0",
                // Vertical margin in millimeters
                marginYInMM = "0",
                // Opacity of the image stamp (100 = fully opaque)
                opacity = 100,
                // Whether the stamp should only show in print
                showOnlyInPrint = false,
                // For big files and too many calls async is recommended to reduce the server load
                async = false
            };

            // Execute the image stamp addition operation
            return await ExecuteImageStampAdditionAsync(payload);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the image stamp process
            Console.WriteLine($"Error in AddImageStampAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the image stamp addition operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload containing PDF and image stamp data</param>
    /// <returns>Path to the modified PDF document, or null if addition failed</returns>
    private async Task<string?> ExecuteImageStampAdditionAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var jsonPayload = JsonSerializer.Serialize(payload);
            
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the image stamp addition operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ImageStamp");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the image stamp addition request to the API
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
                        // Read the completed PDF with image stamp from the response
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
                        return null;
                    }
                }
                
                // Timeout if image stamp addition doesn't complete within retry limit
                return null;
            }
            // Handle other error responses
            else
            {
                // Log the error response for debugging
                var errorContent = await response.Content.ReadAsStringAsync();
                return null;
            }
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during API communication
            return null;
        }
    }
}

 