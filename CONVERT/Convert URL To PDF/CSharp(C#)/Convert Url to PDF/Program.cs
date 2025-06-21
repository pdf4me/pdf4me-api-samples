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
        using HttpClient httpClient = new HttpClient();
        var converter = new UrlToPdfConverter(httpClient, pdfPath);
        var result = await converter.ConvertUrlToPdfAsync();
        if (!string.IsNullOrEmpty(result))
            Console.WriteLine($"PDF file saved to: {result}");
        else
            Console.WriteLine("URL to PDF conversion failed.");
    }
}

public class UrlToPdfConverter
{
    // Configuration constants
    private const string API_URL = "https://api-dev.pdf4me.com/api/v2/ConvertUrlToPdf";
    private const string API_KEY = "ZWJhNjMwNDEtZTY4NC00YTViLWE2ZWMtYTliYjIzODEwMjEzOlV1TyU5JkxqTnJMa3AhRzdPWkR0ZVZ6Y3FaTWNpckRM";

    // File paths
    private readonly string _inputPdfPath;
    private readonly string _outputPdfPath;

    private readonly HttpClient _httpClient;

    public UrlToPdfConverter(HttpClient httpClient, string inputPdfPath)
    {
        _httpClient = httpClient;
        _inputPdfPath = inputPdfPath;
        _outputPdfPath = inputPdfPath.Replace(".pdf", ".url2pdf.pdf");

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", API_KEY);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string?> ConvertUrlToPdfAsync()
    {
        byte[] pdfBytes = await File.ReadAllBytesAsync(_inputPdfPath);
        string pdfBase64 = Convert.ToBase64String(pdfBytes);

        var payload = new
        {
            webUrl = "https://www.google.com",
            authType = "NoAuth",
            username = "userName",
            password = "1234",
            docContent = pdfBase64,
            docName = "output.pdf",
            layout = "landscape",
            format = "A4",
            scale = 0.8,
            topMargin = "40px",
            leftMargin = "40px",
            rightMargin = "40px",
            bottomMargin = "40px",
            printBackground = true,
            displayHeaderFooter = true,
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
            Console.WriteLine("Timeout: URL to PDF conversion did not complete after multiple retries.");
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
