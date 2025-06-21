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
        var imageResizer = new ImageResizer(httpClient, imagePath);
        var result = await imageResizer.ResizeImageAsync();
        
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"Resized image saved to: {result}");
        else
            Console.WriteLine("Image resizing failed.");
    }
}

public class ImageResizer
{
    // Configuration constants
    private const string API_URL = "https://api-dev.pdf4me.com/api/v2/ResizeImage?schemaVal=Percentange";
    private const string API_KEY = "ZWJhNjMwNDEtZTY4NC00YTViLWE2ZWMtYTliYjIzODEwMjEzOlV1TyU5JkxqTnJMa3AhRzdPWkR0ZVZ6Y3FaTWNpckRM";

    // File paths
    private readonly string _inputImagePath;
    private readonly string _outputImagePath;

    private readonly HttpClient _httpClient;

    public ImageResizer(HttpClient httpClient, string inputImagePath)
    {
        _httpClient = httpClient;
        _inputImagePath = inputImagePath;
        _outputImagePath = inputImagePath.Replace(Path.GetExtension(inputImagePath), ".resized" + Path.GetExtension(inputImagePath));

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string?> ResizeImageAsync()
    {
        try
        {
            // Read and encode the image
            byte[] imageBytes = await File.ReadAllBytesAsync(_inputImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            var payload = new
            {
                docName = Path.GetFileName(_inputImagePath),
                docContent = imageBase64,
                ImageResizeType = "Percentage",
                ResizePercentage = "20.1010",
                Width = 60,
                Height = 60,
                MaintainAspectRatio = true,
                async = true
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(API_URL, content);

            if ((int)response.StatusCode == 200)
            {
                byte[] resultBytes = await response.Content.ReadAsByteArrayAsync();
                await File.WriteAllBytesAsync(_outputImagePath, resultBytes);
                return _outputImagePath;
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
                        byte[] resultBytes = await pollResponse.Content.ReadAsByteArrayAsync();
                        await File.WriteAllBytesAsync(_outputImagePath, resultBytes);
                        return _outputImagePath;
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
                Console.WriteLine("Timeout: Image resizing did not complete after multiple retries.");
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
}