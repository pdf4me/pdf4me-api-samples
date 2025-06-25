# Configuration Guide

This guide will help you configure the PDF4ME API samples to run successfully.

## 🔑 API Key Setup

### Step 1: Get Your API Key

1. Visit [PDF4ME Developer Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. Sign up for a free account if you don't have one
3. Generate a new API key
4. Copy the API key to your clipboard

### Step 2: Configure the API Key

Choose one of the following methods:

#### Method 1: Environment Variable (Recommended)

**Windows:**
```cmd
set PDF4ME_API_KEY=your_actual_api_key_here
```

**macOS/Linux:**
```bash
export PDF4ME_API_KEY=your_actual_api_key_here
```

**To make it permanent on macOS/Linux:**
```bash
echo 'export PDF4ME_API_KEY=your_actual_api_key_here' >> ~/.bashrc
source ~/.bashrc
```

#### Method 2: Direct Code Modification

**For C# projects:**
Edit the `API_KEY` constant in the respective `Program.cs` files:

```csharp
public static readonly string API_KEY = "your_actual_api_key_here";
```

**For Java projects:**
Edit the `API_KEY` constant in the respective `Main.java` files:

```java
private static final String API_KEY = "your_actual_api_key_here";
```

## 🧪 Testing Your Configuration

### Quick Test

Run one of the sample projects to verify your configuration:

**C# Test:**
```bash
cd "Forms/Add Form Fields To PDF/CSharp(C#)/Add Form Fields To PDF"
dotnet run
```

**Java Test:**
```bash
cd "Forms/Add Form Fields To PDF/Java/Add_Form_Fields_To_PDF"
javac -d . src/Main.java
java Main
```

### Expected Output

If configured correctly, you should see:
```
=== Adding Form Field to PDF ===
PDF with form field saved to: sample.withformfield.pdf
```

## 🛠️ Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Make sure you've set the environment variable correctly
   - Restart your terminal/command prompt after setting the variable
   - Check for typos in the API key

2. **"PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory
   - The sample PDF files are included in the repository

3. **"Network timeout"**
   - Check your internet connection
   - Verify firewall settings aren't blocking the API calls
   - Try again in a few minutes (API might be temporarily unavailable)

4. **"Unauthorized" or "401" errors**
   - Verify your API key is correct
   - Check if your API key has expired
   - Ensure you're using the correct API key format

### Verification Commands

**Check if environment variable is set:**
```bash
# macOS/Linux
echo $PDF4ME_API_KEY

# Windows
echo %PDF4ME_API_KEY%
```

**Test API connectivity:**
```bash
curl -H "Authorization: Basic YOUR_API_KEY" https://api.pdf4me.com/api/v2/health
```

## 📝 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PDF4ME_API_KEY` | Your PDF4ME API key | Yes | None |
| `PDF4ME_BASE_URL` | API base URL | No | `https://api.pdf4me.com/` |

## 🔒 Security Notes

- Never commit your API key to version control
- Use environment variables instead of hardcoding keys
- Keep your API key secure and don't share it publicly
- Rotate your API key periodically for better security 