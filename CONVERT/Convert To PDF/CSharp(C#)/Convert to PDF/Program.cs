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
        string filePath = "sample.txt";  // Using a file in the current directory
        using HttpClient httpClient = new HttpClient();
        var converter = new ToPdfConverter(httpClient, filePath);
        var result = await converter.ConvertToPdfAsync();
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF file saved to: {result}");
        else
            Console.WriteLine("File to PDF conversion failed.");
    }
}

public class ToPdfConverter
{
    // Configuration constants
    private const string API_URL = "https://api-dev.pdf4me.com/api/v2/ConvertToPdf";
    private const string API_KEY = "ZWJhNjMwNDEtZTY4NC00YTViLWE2ZWMtYTliYjIzODEwMjEzOlV1TyU5JkxqTnJMa3AhRzdPWkR0ZVZ6Y3FaTWNpckRM";

    // File paths
    private readonly string _inputFilePath;
    private readonly string _outputPdfPath;

    private readonly HttpClient _httpClient;

    public ToPdfConverter(HttpClient httpClient, string inputFilePath)
    {
        _httpClient = httpClient;
        _inputFilePath = inputFilePath;
        _outputPdfPath = inputFilePath.Replace(".docx", ".pdf").Replace(".pptx", ".pdf").Replace(".xlsx", ".pdf").Replace(".png", ".pdf").Replace(".txt", ".pdf");

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string?> ConvertToPdfAsync()
    {
        byte[] fileBytes = await File.ReadAllBytesAsync(_inputFilePath);
        string fileBase64 = Convert.ToBase64String(fileBytes);

        var payload = new
        {
            docContent = fileBase64,
            docName = "output",
            async = "true"
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(API_URL, content);

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
                var pollResponse = await _httpClient.GetAsync(locationUrl);

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