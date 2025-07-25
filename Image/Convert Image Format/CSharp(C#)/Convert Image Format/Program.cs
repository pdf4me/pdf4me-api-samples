﻿using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Main program class for converting image formats
/// This program demonstrates how to convert image formats using the PDF4ME API
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
        // Path to the input image file - update this to your image file location
        string imagePath = "sample.jpg";
        // Target format for conversion (JPG, PNG, GIF, BMP, TIFF, WEBP)
        string targetFormat = "PNG";  // Update this to your desired output format
        
        // Create HTTP client for API communication
        using HttpClient httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(BASE_URL);
        
        // Initialize the image format converter with the HTTP client, image path, target format, and API key
        var imageFormatConverter = new ImageFormatConverter(httpClient, imagePath, targetFormat, API_KEY);
        
        // Convert the image format
        var result = await imageFormatConverter.ConvertImageFormatAsync();
        
        // Display the results
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Converted image saved to: {result}");
        else
            Console.WriteLine("Image format conversion failed.");
    }
}

/// <summary>
/// Class responsible for converting image formats using the PDF4ME API
/// </summary>
public class ImageFormatConverter
{
    // Configuration constants
    /// <summary>
    /// API key for authentication - Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/
    /// </summary>
    private readonly string _apiKey;
    
    // File paths and format
    /// <summary>
    /// Path to the input image file
    /// </summary>
    private readonly string _inputImagePath;
    
    /// <summary>
    /// Target format for conversion (JPG, PNG, GIF, BMP, TIFF, WEBP)
    /// </summary>
    private readonly string _targetFormat;
    
    /// <summary>
    /// Path where the converted image will be saved
    /// </summary>
    private readonly string _outputImagePath;

    /// <summary>
    /// HTTP client for making API requests
    /// </summary>
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Constructor to initialize the image format converter
    /// </summary>
    /// <param name="httpClient">HTTP client for API communication</param>
    /// <param name="inputImagePath">Path to the input image file</param>
    /// <param name="targetFormat">Target format for conversion</param>
    /// <param name="apiKey">API key for authentication</param>
    public ImageFormatConverter(HttpClient httpClient, string inputImagePath, string targetFormat, string apiKey)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        _targetFormat = targetFormat;
        _apiKey = apiKey;
        
        // Generate output path by replacing the original extension with the target format extension
        string originalExtension = Path.GetExtension(inputImagePath);
        string targetExtension = "." + targetFormat.ToLowerInvariant();
        _outputImagePath = inputImagePath.Replace(originalExtension, targetExtension);
    }

    /// <summary>
    /// Converts the image format asynchronously using the PDF4ME API
    /// </summary>
    /// <returns>Path to the converted image file, or null if conversion failed</returns>
    public async Task<string?> ConvertImageFormatAsync()
    {
        // Read the image file and convert it to base64 for API transmission
        byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
        string imageBase64 = Convert.ToBase64String(imageBytes);

        // Determine the original image type from file extension
        string originalImageType = GetImageTypeFromExtension(_inputImagePath);

        // Prepare the API request payload with format conversion parameters
        var payload = new
        {
            docContent = imageBase64,     // Base64 encoded image content
            docName = "output",           // Output document name
            imageType = originalImageType,  // Original image type (JPG, PNG, etc.)
            convertTo = _targetFormat,    // Target format for conversion
            async = true // For big file and too many calls async is recommended to reduce the server load.
        };

        // Serialize payload to JSON and create HTTP content
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        
        // Create HTTP request message for the format conversion operation
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v2/ConvertImageFormat");
        httpRequest.Content = content;
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
        
        // Send the format conversion request to the API
        var response = await _httpClient.SendAsync(httpRequest);

        // Handle immediate success response (200 OK)
        if ((int)response.StatusCode == 200)
        {
            // Read the converted image content from the response
            byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
            
            // Save the converted image to the output path
            await File.WriteAllBytesAsync(_outputImagePath, resultBytes);
            return _outputImagePath;
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
                    await File.WriteAllBytesAsync(_outputImagePath, resultBytes);
                    return _outputImagePath;
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
            
            // Timeout if format conversion doesn't complete within retry limit
            Console.WriteLine("Timeout: Image format conversion did not complete after multiple retries.");
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

    /// <summary>
    /// Determines the image type from the file extension
    /// </summary>
    /// <param name="filePath">Path to the image file</param>
    /// <returns>Image type string (JPG, PNG, etc.)</returns>
    private static string GetImageTypeFromExtension(string filePath)
    {
        string extension = Path.GetExtension(filePath).ToUpperInvariant();
        return extension switch
        {
            ".JPG" or ".JPEG" => "JPG",
            ".PNG" => "PNG",
            ".GIF" => "GIF",
            ".BMP" => "BMP",
            ".TIFF" or ".TIF" => "TIFF",
            ".WEBP" => "WEBP",
            _ => "JPG" // Default to JPG for unknown extensions
        };
    }
}