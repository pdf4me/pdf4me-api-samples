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
        string pdfPath = "sample.pdf";  // Update this path to your PDF file location
        string imagePath = "sample.png";  // Update this path to your replacement image location
        string replaceText = "enter_input_text";  // Update this to the text you want to replace
        
        using HttpClient httpClient = new HttpClient();
        var textReplacer = new TextReplacer(httpClient, pdfPath, imagePath, replaceText);
        var result = await textReplacer.ReplaceTextWithImageAsync();
        
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF with text replaced by image saved to: {result}");
        else
            Console.WriteLine("Failed to replace text with image.");
    }
}

public class TextReplacer
{
    // Configuration constants
    private const string API_URL = "https://api-dev.pdf4me.com/api/v2/ReplaceTextWithImage";
    private const string API_KEY = "ZWJhNjMwNDEtZTY4NC00YTViLWE2ZWMtYTliYjIzODEwMjEzOlV1TyU5JkxqTnJMa3AhRzdPWkR0ZVZ6Y3FaTWNpckRM";

    // File paths and parameters
    private readonly string _inputPdfPath;
    private readonly string _replacementImagePath;
    private readonly string _replaceText;
    private readonly string _outputPdfPath;

    private readonly HttpClient _httpClient;

    public TextReplacer(HttpClient httpClient, string inputPdfPath, string replacementImagePath, string replaceText)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _replacementImagePath = replacementImagePath;
        _replaceText = replaceText;
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".replaced.pdf");

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string?> ReplaceTextWithImageAsync()
    {
        try
        {
            // Read and encode the PDF
            byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
            string pdfBase64 = Convert.ToBase64String(pdfBytes);

            // Read and encode the replacement image
            byte[] imageBytes = await File.ReadAllBytesAsync(_replacementImagePath);
            string imageBase64 = Convert.ToBase64String(imageBytes);

            var payload = new
            {
                docContent = pdfBase64,
                docName = "output.pdf",
                replaceText = _replaceText,
                pageSequence = "all",
                imageContent = imageBase64,
                imageHeight = 10,
                imageWidth = 10,
                async = true
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
                Console.WriteLine("Timeout: Text replacement did not complete after multiple retries.");
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