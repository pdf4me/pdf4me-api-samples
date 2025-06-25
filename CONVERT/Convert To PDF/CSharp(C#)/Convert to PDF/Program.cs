using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for converting various file formats to PDF
/// This program demonstrates how to convert different file formats to PDF using the PDF4ME API
/// </summary>
public class Program
{
    public const string BASE_URL = "https://api.pdf4me.com/";
    public const string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        string filePath = "sample.txt";  // Using a file in the current directory

        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        var converter = new ToPdfConverter(httpClient, filePath);
        var result = await converter.ConvertToPdfAsync();
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF file saved to: {result}");
        else
            Console.WriteLine("File to PDF conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting various file formats to PDF using the PDF4ME API
/// </summary>
public class ToPdfConverter
{

    // File paths
    private readonly string _inputFilePath;
    private readonly string _outputPdfPath;

    // HTTP client for API communication
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the converter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputFilePath">Path to the input file</param>
    public ToPdfConverter(HttpClient httpClient, string inputFilePath)
    {
        _httpClient = httpClient;
        _inputFilePath = inputFilePath;
        _outputPdfPath = inputFilePath.Replace(".docx", ".pdf").Replace(".pptx", ".pdf").Replace(".xlsx", ".pdf").Replace(".png", ".pdf").Replace(".txt", ".pdf");
    }

    /// <summary>
    /// Converts the file to PDF format asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated PDF file, or null if conversion failed</returns>
    public async Task<string?> ConvertToPdfAsync()
    {
        byte[] fileBytes = await File.ReadAllBytesAsync(_inputFilePath);
        string fileBase64 = Convert.ToBase64String(fileBytes);

        var payload = new
        {
            docContent = fileBase64,
            docName = "output",
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ConvertToPdf");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        
        // Send the conversion request to the API
        var response = await _httpClient.SendAsync(httpRequest);

        if ((int)response.StatusCode == 200)
        {
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            await File.WriteAllBytesAsync(_outputPdfPath, resultBytes);
            return _outputPdfPath;
        }
        else if ((int)response.StatusCode == 202)
        {
            string? locationUrl = response.Headers.Location?.ToString();
            if (string.IsNullOrEmpty(locationUrl) && response.Headers.TryGetValues("Location", out var values))
                locationUrl = System.Linq.Enumerable.FirstOrDefault(values);

            if (string.IsNullOrEmpty(locationUrl))
            {
                Console.WriteLine("No 'Location' header found in the response.");
                return null;
            }

            int maxRetries = 10;
            int retryDelay = 10; // seconds

            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                await Task.Delay(retryDelay * 1000);
                
                // Create polling request
                using var pollRequest = new HttpRequestMessage(HttpMethod.Get, locationUrl);
                pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
                var pollResponse = await _httpClient.SendAsync(pollRequest);

                if ((int)pollResponse.StatusCode == 200)
                {
                    byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                    await File.WriteAllBytesAsync(_outputPdfPath, resultBytes);
                    return _outputPdfPath;
                }
                else if ((int)pollResponse.StatusCode == 202)
                {
                    continue;
                }
                else
                {
                    Console.WriteLine($"Polling error: {(int)pollResponse.StatusCode}");
                    Console.WriteLine(await pollResponse.Content.ReadAsStringAsync());
                    return null;
                }
            }
            Console.WriteLine("Timeout: File to PDF conversion did not complete after multiple retries.");
            return null;
        }
        else
        {
            Console.WriteLine($"Initial request failed: {(int)response.StatusCode}");
            Console.WriteLine(await response.Content.ReadAsStringAsync());
            return null;
        }
    }
}