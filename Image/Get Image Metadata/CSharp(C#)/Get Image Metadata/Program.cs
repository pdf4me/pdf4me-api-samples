using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class Program
{
    public static async Task Main(string[] args)
    {
        string imagePath = "sample.jpg";  // Update this path to your image file location
        
        using HttpClient httpClient = new HttpClient();
        var imageMetadataExtractor = new ImageMetadataExtractor(httpClient, imagePath);
        var result = await imageMetadataExtractor.GetImageMetadataAsync();
        
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Image metadata:\n{result}");
        else
            Console.WriteLine("Failed to extract image metadata.");
    }
}

public class ImageMetadataExtractor
{
    // Configuration constants
    private const string API_URL = "https://api-dev.pdf4me.com/api/v2/GetImageMetadata";
    private const string API_KEY = "ZWJhNjMwNDEtZTY4NC00YTViLWE2ZWMtYTliYjIzODEwMjEzOlV1TyU5JkxqTnJMa3AhRzdPWkR0ZVZ6Y3FaTWNpckRM";

    // File paths
    private readonly string _inputImagePath;

    private readonly HttpClient _httpClient;

    public ImageMetadataExtractor(HttpClient httpClient, string inputImagePath)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string?> GetImageMetadataAsync()
    {
        try
        {
            // Read and encode the image
            byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            // Determine image type from file extension
            string imageType = GetImageTypeFromExtension(_inputImagePath);

            var payload = new
            {
                docContent = imageBase64,
                docName = Path.GetFileName(_inputImagePath),
                imageType = imageType,
                async = true
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(API_URL, content);

            if ((int)response.StatusCode == 200)
            {
                string resultJson = await response.Content.ReadAsStringAsync();
                return FormatMetadataJson(resultJson);
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
                    var pollResponse = await _httpClient.GetAsync(locationUrl);

                    if ((int)pollResponse.StatusCode == 200)
                    {
                        string resultJson = await pollResponse.Content.ReadAsStringAsync();
                        return FormatMetadataJson(resultJson);
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
                Console.WriteLine("Timeout: Image metadata extraction did not complete after multiple retries.");
                return null;
            }
            else
            {
                Console.WriteLine($"Initial request failed: {(int)response.StatusCode}");
                Console.WriteLine(await response.Content.ReadAsStringAsync());
                return null;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            return null;
        }
    }

    private string GetImageTypeFromExtension(string filePath)
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
            _ => "JPG" // Default to JPG if unknown extension
        };
    }

    private string FormatMetadataJson(string jsonString)
    {
        try
        {
            // Parse and pretty-print the JSON for better readability
            using JsonDocument document = JsonDocument.Parse(jsonString);
            return JsonSerializer.Serialize(document, new JsonSerializerOptions { WriteIndented = true });
        }
        catch
        {
            // If JSON parsing fails, return the original string
            return jsonString;
        }
    }
}