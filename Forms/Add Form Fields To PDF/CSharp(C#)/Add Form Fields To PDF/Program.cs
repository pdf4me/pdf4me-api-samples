﻿using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for adding form fields to PDF functionality
/// This program demonstrates how to add form fields to PDF files using the PDF4ME API
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
        // Path to the PDF file to add form fields to
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF form field adder
        var formFieldAdder = new PdfFormFieldAdder(httpClient, pdfPath, API_KEY);
        
        // Add form field to the PDF
        Console.WriteLine("=== Adding Form Field to PDF ===");
        var result = await formFieldAdder.AddFormFieldAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF with form field saved to: {result}");
        else
            Console.WriteLine("Form field addition failed.");
    }
}

/// <summary>
/// Class responsible for adding form fields to PDF files using the PDF4ME API
/// </summary>
public class PdfFormFieldAdder
{
    // File paths
    private readonly string _inputPdfPath;
    private readonly string _outputPdfPath;
    
    // HTTP client for API communication
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    /// <summary>
    /// Constructor to initialize the PDF form field adder
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    /// <param name="apiKey">API key for authentication</param>
    public PdfFormFieldAdder(HttpClient httpClient, string inputPdfPath, string apiKey)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _apiKey = apiKey;
        
        // Generate output PDF path by adding suffix
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".withformfield.pdf");
    }

    /// <summary>
    /// Adds form field to PDF asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the PDF with form field, or null if addition failed</returns>
    public async Task<string?> AddFormFieldAsync()
    {
        if (!File.Exists(_inputPdfPath))
        {
            Console.WriteLine($"PDF file not found: {_inputPdfPath}");
            return null;
        }

        // Read the PDF file and convert to base64
        byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
        string pdfBase64 = Convert.ToBase64String(pdfBytes);

        // Prepare the API request payload
        var payload = new
        {
            docContent = pdfBase64,                             // Base64 encoded PDF content
            docName = "sample.pdf",                             // Output document name
            initialValue = "input text",                        // Initial value for the form field
            positionX = 300,                                    // X position of the form field
            positionY = 300,                                    // Y position of the form field
            fieldName = "Input Field Name",                     // Name of the form field
            Size = 4,                                           // Size of the form field
            pages = "1",                                        // Page number where to add the field
            formFieldType = "TextBox",                          // Type of form field
            async = true                                        // For big files and too many calls async is recommended to reduce the server load
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/AddFormField");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
        
        // Send the form field addition request to the API
        var response = await _httpClient.SendAsync(httpRequest);

        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the PDF content with form field from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the PDF with form field to the output path
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
                pollRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
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
            
            // Timeout if form field addition doesn't complete within retry limit
            Console.WriteLine("Timeout: Form field addition did not complete after multiple retries.");
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