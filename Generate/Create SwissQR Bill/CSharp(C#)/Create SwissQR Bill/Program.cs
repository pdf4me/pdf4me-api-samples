using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for Swiss QR Bill creation functionality
/// This program demonstrates how to create Swiss QR Bills using the PDF4ME API
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
        
        // Initialize the Swiss QR Bill creator with the HTTP client and PDF path
        var swissQrCreator = new SwissQrBillCreator(httpClient, pdfPath);
        
        // Create Swiss QR Bill from the PDF
        Console.WriteLine("=== Creating Swiss QR Bill ===");
        var result = await swissQrCreator.CreateSwissQrBillAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Swiss QR Bill saved to: {result}");
        else
            Console.WriteLine("Swiss QR Bill creation failed.");
    }
}

/// <summary>
/// Class responsible for creating Swiss QR Bills using the PDF4ME API
/// </summary>
public class SwissQrBillCreator
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private const string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/ ";

    // File paths
    /// <summary>
    /// Path to the input PDF file to be processed
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path where the Swiss QR Bill PDF file will be saved
    /// </summary>
    private readonly string _outputPdfPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the Swiss QR Bill creator
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public SwissQrBillCreator(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".swissqr.pdf");
    }

    /// <summary>
    /// Creates Swiss QR Bill asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the Swiss QR Bill PDF file, or null if creation failed</returns>
    public async Task<string?> CreateSwissQrBillAsync()
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

            // Prepare the API request payload for Swiss QR Bill creation
            var payload = new
            {
                docContent = pdfBase64,                   // Base64 encoded PDF content at root level
                docName = "test.pdf",                     // Document name
                iban = "CH0200700110003765824",           // Swiss IBAN for the creditor
                crName = "Test AG",                       // Creditor name
                crAddressType = "S",                      // Creditor address type (S = Structured)
                crStreetOrAddressLine1 = "Test Strasse",  // Creditor street
                crStreetOrAddressLine2 = "1",             // Creditor street number
                crPostalCode = "8000",                    // Creditor postal code
                crCity = "Zurich",                        // Creditor city
                amount = "1000",                          // Payment amount
                currency = "CHF",                         // Currency (Swiss Franc)
                udName = "Test Debt AG",                  // Ultimate debtor name
                udAddressType = "S",                      // Ultimate debtor address type
                udStreetOrAddressLine1 = "Test Deb Strasse", // Ultimate debtor street
                udStreetOrAddressLine2 = "2",             // Ultimate debtor street number
                udPostalCode = "8000",                    // Ultimate debtor postal code
                udCity = "Zurich",                        // Ultimate debtor city
                referenceType = "NON",                    // Reference type (NON = No reference)
                languageType = "English",                 // Language for the QR bill
                seperatorLine = "LineWithScissor",        // Separator line style
                async = true                              // For big files and too many calls async is recommended to reduce the server load
            };

            return await ExecuteSwissQrBillCreationAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in CreateSwissQrBillAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the Swiss QR Bill creation operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the Swiss QR Bill PDF file, or null if creation failed</returns>
    private async Task<string?> ExecuteSwissQrBillCreationAsync(object payload)
    {
        try
        {
            // Serialize payload to JSON and create HTTP content
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            
            // Create HTTP request message for the Swiss QR Bill creation operation
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/CreateSwissQrBill");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
            
            // Send the Swiss QR Bill creation request to the API
            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                // Read the Swiss QR Bill PDF content from the response
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                
                // Save the Swiss QR Bill PDF to the output path
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
                
                // Timeout if creation doesn't complete within retry limit
                Console.WriteLine("Timeout: Swiss QR Bill creation did not complete after multiple retries.");
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
            Console.WriteLine($"Error in ExecuteSwissQrBillCreationAsync: {ex.Message}");
            return null;
        }
    }
}