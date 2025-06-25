using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for adding text stamps to PDF functionality
/// This program demonstrates how to add text stamps to PDF documents using the PDF4ME API
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
        // Using relative path that works from the project directory
        // Users can place their PDF file in the same directory as the executable
        string pdfPath = "sample.pdf";
        
        // Alternative: If you want to use a specific path, uncomment and modify the line below
        // string pdfPath = Path.Combine(Directory.GetCurrentDirectory(), "sample.pdf");
        
        // Check if the sample PDF exists, if not provide helpful instructions
        if (!File.Exists(pdfPath))
        {
            Console.WriteLine("=== PDF4ME Text Stamp Sample ===");
            Console.WriteLine($"PDF file '{pdfPath}' not found in the current directory.");
            Console.WriteLine("Please ensure you have a PDF file named 'sample.pdf' in the same directory as this executable.");
            Console.WriteLine("Or modify the 'pdfPath' variable in the code to point to your PDF file.");
            Console.WriteLine("Example: string pdfPath = \"C:\\\\path\\\\to\\\\your\\\\document.pdf\";");
            return;
        }
        
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the text stamp adder with the HTTP client and PDF file path
        var textStampAdder = new PdfTextStampAdder(httpClient, pdfPath);
        
        // Add text stamp to the PDF document
        Console.WriteLine("=== Adding Text Stamp to PDF Document ===");
        var result = await textStampAdder.AddTextStampAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF with text stamp saved to: {result}");
        else
            Console.WriteLine("Text stamp addition failed.");
    }
}

/// <summary>
/// Class responsible for adding text stamps to PDF documents using the PDF4ME API
/// </summary>
public class PdfTextStampAdder
{

    
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
    /// Constructor to initialize the text stamp adder
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public PdfTextStampAdder(HttpClient httpClient, string inputPdfPath)
    {
        // Store the HTTP client for API requests
        _httpClient = httpClient;
        
        // Store input PDF file path
        _inputPdfPath = inputPdfPath;
        
        // Generate output file path in the same directory as input PDF
        string outputFileName = Path.GetFileNameWithoutExtension(inputPdfPath) + ".with_text_stamp.pdf";
        _outputPdfPath = Path.Combine(Path.GetDirectoryName(inputPdfPath)!, outputFileName);
    }

    /// <summary>
    /// Adds text stamp to PDF document asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the modified PDF document, or null if addition failed</returns>
    public async Task<string?> AddTextStampAsync()
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

            // Prepare the API request payload for adding text stamp
            var payload = new
            {
                // PDF File content - Required: The content of the input file (base64)
                docContent = pdfBase64,
                // PDF File name - Required: Source PDF file name with .pdf extension
                docName = "output.pdf",
                // Text content to be stamped on the PDF
                text = "CONFIDENTIAL",
                // Horizontal alignment of the text stamp
                alignX = "center",
                // Vertical alignment of the text stamp
                alignY = "middle",
                // Font size for the text stamp
                fontSize = 24,
                // Font color for the text stamp (hex color code)
                fontColor = "#FF0000",
                // Page range where text stamp should be applied
                pages = "1",
                // Horizontal margin in millimeters
                marginXInMM = 0,
                // Vertical margin in millimeters
                marginYInMM = 0,
                // Opacity of the text stamp (50 = 50% transparent)
                opacity = 50,
                // Whether text stamp is in background
                isBackground = false,
                // Rotation angle of the text stamp in degrees
                rotation = 45,
                // For big files and too many calls async is recommended to reduce the server load
                async = true
            };

            // Execute the text stamp addition operation
            return await ExecuteTextStampAdditionAsync(payload);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the text stamp process
            Console.WriteLine($"Error in AddTextStampAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the text stamp addition operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload containing PDF and text stamp data</param>
    /// <returns>Path to the modified PDF document, or null if addition failed</returns>
    private async Task<string?> ExecuteTextStampAdditionAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the text stamp addition operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/Stamp");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the text stamp addition request to the API
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
                        // Read the completed PDF with text stamp from the response
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
                
                // Timeout if text stamp addition doesn't complete within retry limit
                Console.WriteLine("Timeout: PDF text stamp addition did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteTextStampAdditionAsync: {ex.Message}");
            return null;
        }
    }
}