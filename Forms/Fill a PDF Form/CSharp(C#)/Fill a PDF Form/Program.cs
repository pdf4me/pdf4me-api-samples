using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

/// <summary>
/// Main program class for filling PDF forms functionality
/// This program demonstrates how to fill PDF forms using the PDF4ME API
/// </summary>
public class Program
{
    /// <summary>
    /// Main entry point of the application
    /// </summary>
    /// <param name="args">Command line arguments (not used in this example)</param>
    public static async Task Main(string[] args)
    {
        string pdfPath = "sample.pdf";  // Using PDF with form fields
        
        const string BASE_URL = "https://api.pdf4me.com/";
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the PDF form filler with the HTTP client and PDF path
        var formFiller = new PdfFormFiller(httpClient, pdfPath);
        
        // Fill the PDF form
        Console.WriteLine("=== Filling PDF Form ===");
        var result = await formFiller.FillPdfFormAsync();
        
        // Display the result
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Filled PDF form saved to: {result}");
        else
            Console.WriteLine("PDF form filling failed.");
    }
}

/// <summary>
/// Class responsible for filling PDF forms using the PDF4ME API
/// </summary>
public class PdfFormFiller
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private const string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";

    // File paths
    /// <summary>
    /// Path to the input PDF file to fill
    /// </summary>
    private readonly string _inputPdfPath;
    
    /// <summary>
    /// Path where the filled PDF form will be saved
    /// </summary>
    private readonly string _outputPdfPath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the PDF form filler
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputPdfPath">Path to the input PDF file</param>
    public PdfFormFiller(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".filled.pdf");
    }

    /// <summary>
    /// Fills PDF form asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the filled PDF form, or null if filling failed</returns>
    public async Task<string?> FillPdfFormAsync()
    {
        try
        {
            if (!File.Exists(_inputPdfPath))
            {
                Console.WriteLine($"ERROR: PDF file not found: {_inputPdfPath}");
                return null;
            }

            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Create form fields with your provided values
            var formFields = new List<object>
            {
                new { fieldName = "firstname", fieldValue = "John" },
                new { fieldName = "lastname", fieldValue = "Adams" },
                new { fieldName = "gender", fieldValue = "Female" },
                new { fieldName = "member", fieldValue = "Basic" }
            };

            // Create a JSON data object matching the form fields
            var jsonData = new
            {
                firstname = "John",
                lastname = "Adams",
                gender = "Female",
                member = "Stoke"
            };

            // Prepare the API request payload
            var payload = new
            {
                templateDocName = "sample.pdf",
                templateDocContent = pdfBase64,
                dataArray = JsonSerializer.Serialize(jsonData),
                outputType = "pdf",
                inputDataType = "json",
                metaData = "",
                metaDataJson = "",
                InputFormData = formFields.ToArray()
            };

            return await ExecuteFormFillingAsync(payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR in FillPdfFormAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Executes the PDF form filling operation asynchronously
    /// </summary>
    /// <param name="payload">API request payload</param>
    /// <returns>Path to the filled PDF form, or null if filling failed</returns>
    private async Task<string?> ExecuteFormFillingAsync(object payload)
    {
        try
        {
            string jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/FillPdfForm");
            httpRequest.Content = content;
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);

            var response = await _httpClient.SendAsync(httpRequest);

            // Handle immediate success response (200 OK)
            if ((int)response.StatusCode == 200)
            {
                using var responseStream = await response.Content.ReadAsStreamAsync();
                using var ms = new MemoryStream();
                await responseStream.CopyToAsync(ms);
                byte[] resultBytes = ms.ToArray();
                await File.WriteAllBytesAsync(_outputPdfPath, resultBytes);
                return _outputPdfPath;
            }
            // Handle asynchronous processing response (202 Accepted)
            else if ((int)response.StatusCode == 202)
            {
                string? locationUrl = response.Headers.Location?.ToString();
                if (string.IsNullOrEmpty(locationUrl) && response.Headers.TryGetValues("Location", out var values))
                    locationUrl = System.Linq.Enumerable.FirstOrDefault(values);

                if (string.IsNullOrEmpty(locationUrl))
                {
                    Console.WriteLine("ERROR: No 'Location' header found in the response.");
                    return null;
                }

                int maxRetries = 10;
                int retryDelay = 10; // seconds

                for (int attempt = 0; attempt < maxRetries; attempt++)
                {
                    await Task.Delay(retryDelay * 1000);
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
                        string errorContent = await pollResponse.Content.ReadAsStringAsync();
                        Console.WriteLine($"ERROR: Polling error: {(int)pollResponse.StatusCode}");
                        Console.WriteLine($"ERROR: Poll response content: {errorContent}");
                        return null;
                    }
                }
                Console.WriteLine("ERROR: Timeout: PDF form filling did not complete after multiple retries.");
                return null;
            }
            else
            {
                string errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"ERROR: Initial request failed: {(int)response.StatusCode}");
                Console.WriteLine($"ERROR: Response content: {errorContent}");
                return null;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR in ExecuteFormFillingAsync: {ex.Message}");
            return null;
        }
    }
}