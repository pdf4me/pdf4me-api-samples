﻿using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for PDF to PowerPoint conversion
/// This program demonstrates how to convert PDF files to PowerPoint format using the PDF4ME API
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
        // Path to the PDF file to be converted
        string pdfPath = "sample.pdf";  // Use the local sample.pdf file
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF to PowerPoint converter
        var converter = new PdfToPowerPointConverter(httpClient, pdfPath, API_KEY);
        
        // Perform the conversion
        var result = await converter.ConvertPdfToPowerPointAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PowerPoint file saved to: {result}");
        else
            Console.WriteLine("PDF to PowerPoint conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting PDF files to PowerPoint format using the PDF4ME API
/// </summary>
public class PdfToPowerPointConverter
{
  

    // File paths
    private readonly string _inputPdfPath;
    private readonly string _outputPowerPointPath;

    // HTTP client for API communication
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    /// <summary>
    /// Constructor to initialize the PDF to PowerPoint converter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfToPowerPointConverter(HttpClient httpClient, string inputPdfPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _apiKey = apiKey;
        
        // Generate output PowerPoint path by replacing PDF extension with PPTX
        _outputPowerPointPath = inputPdfPath.Replace(".pdf", ".pptx");
    }

    /// <summary>
    /// Converts the PDF file to PowerPoint format asynchronously using HttpRequestMessage pattern
    /// </summary>
    /// <returns>Path to the generated PowerPoint file, or null if conversion failed</returns>
    public async Task<string?> ConvertPdfToPowerPointAsync()
    {
        // Read the PDF file and convert to base64
        byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
        string pdfBase64 = Convert.ToBase64String(pdfBytes);

        // Prepare the API request payload with conversion settings
        var payload = new
        {
            docContent = pdfBase64,           // Base64 encoded PDF content
            docName = "test.pdf",             // Output document name
            qualityType = "Draft",            // Quality setting for conversion
            language = "English",             // Language for OCR processing
            ocrWhenNeeded = "true",           // Enable OCR when needed
            outputFormat = "true",            // Output format setting
            mergeAllSheets = true,            // Merge all sheets into one
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ConvertPdfToPowerPoint");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
        
        // Send the conversion request to the API
        var response = await _httpClient.SendAsync(httpRequest);

        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the PowerPoint content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the PowerPoint file to the output path
            await File.WriteAllBytesAsync(_outputPowerPointPath, resultBytes);
            return _outputPowerPointPath;
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
                    await File.WriteAllBytesAsync(_outputPowerPointPath, resultBytes);
                    return _outputPowerPointPath;
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
            Console.WriteLine("Timeout: PDF to PowerPoint conversion did not complete after multiple retries.");
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