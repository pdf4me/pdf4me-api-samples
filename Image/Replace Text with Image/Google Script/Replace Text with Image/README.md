# Replace Text with Image - Google Apps Script

This Google Apps Script replaces text in images with other images using the PDF4Me API. It can find specific text in an image and replace it with a replacement image, allowing for dynamic content modification and branding.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input and Output folders
- An input image file and a replacement image file in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `replace_text_with_image.gs`

2. **Configure API Key:**
   ```javascript
   // Set your PDF4Me API key
   var apiKey = 'YOUR_API_KEY_HERE';
   ```

3. **Set up Google Drive Folders:**
   - Create a folder named "Input" in your Google Drive
   - Create a folder named "Output" in your Google Drive
   - Place your input image and replacement image in the Input folder

4. **Configure File Names:**
   ```javascript
   var inputFileName = 'input.jpg';
   var replacementImageFileName = 'replacement.png';
   var outputFileName = 'modified.jpg';
   ```

## Usage

1. **Prepare your image files:**
   - Place your input image in the Input folder
   - Place your replacement image in the Input folder
   - Update the file name variables to match your files

2. **Configure text replacement settings:**
   ```javascript
   var textToReplace = 'REPLACE_ME'; // Text to find and replace
   var scale = 1.0; // Scale factor for replacement image (0.1 to 10.0)
   var position = 'center'; // Position of replacement image
   ```

3. **Run the script:**
   - Save the script
   - Click the "Run" button
   - Grant necessary permissions when prompted

4. **Check results:**
   - The modified image will be saved in the Output folder
   - Check the execution logs for status information

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/ReplaceTextWithImage`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageName": "modified.jpg",
  "imageContent": "base64_encoded_input_image",
  "replacementImageContent": "base64_encoded_replacement_image",
  "textToReplace": "REPLACE_ME",
  "scale": 1.0,
  "position": "center",
  "isAsync": true
}
```

## Configuration Options

### Text to Replace
- **textToReplace:** The exact text string to find and replace
- Text matching is case-sensitive
- Use exact text as it appears in the image
- Consider using OCR to identify text in images

### Scale Factor
- **scale:** Size multiplier for the replacement image (0.1 to 10.0)
- Values less than 1.0 make the replacement image smaller
- Values greater than 1.0 make the replacement image larger
- 1.0 maintains original size

### Position Options
- **top-left:** Upper left corner
- **top-center:** Top center
- **top-right:** Upper right corner
- **center-left:** Left center
- **center:** Center of the image (default)
- **center-right:** Right center
- **bottom-left:** Lower left corner
- **bottom-center:** Bottom center
- **bottom-right:** Lower right corner

## Supported Input Formats

### Input Image
- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF
- WebP

### Replacement Image
- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF
- WebP

## Supported Output Formats

- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF
- WebP

## Error Handling

The script includes comprehensive error handling:

- **File not found:** Checks if input files exist
- **API errors:** Handles HTTP error responses
- **Authentication errors:** Validates API key
- **Processing errors:** Monitors async job status
- **Timeout handling:** Prevents infinite polling
- **Text not found:** Handles cases where specified text is not found

## Troubleshooting

### Common Issues

1. **"File not found" error:**
   - Ensure both input and replacement files exist in the Input folder
   - Check the file name variables match your actual file names

2. **"API key invalid" error:**
   - Verify your PDF4Me API key is correct
   - Ensure the API key has sufficient permissions

3. **"Processing failed" error:**
   - Check if the image files are corrupted
   - Ensure image formats are supported
   - Verify the text to replace exists in the input image

4. **"Text not found" result:**
   - Check the exact text spelling and case
   - Ensure the text is clearly visible in the image
   - Consider using OCR to identify text in the image
   - Verify text is not part of a larger word

5. **"Timeout" error:**
   - Large images may take longer to process
   - Increase the `maxAttempts` value if needed

### Performance Tips

- Use high-quality images for better text recognition
- Ensure good contrast between text and background
- Choose appropriate scale factors for replacement images
- Test with smaller images first
- Consider image resolution when setting scale values

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys
- Be aware that image content may contain sensitive information

## Performance Notes

- Processing time depends on image size and complexity
- Large images may require async processing
- Text recognition accuracy affects replacement success
- Network latency may impact response times

## Best Practices

1. **Text preparation:** Ensure text is clearly visible and readable
2. **Replacement image:** Use appropriate size and format for replacement
3. **Scale testing:** Test different scale values for optimal results
4. **Position planning:** Choose positions that work well with your content
5. **Backup:** Keep original images as backup

## Example Use Cases

### Branding and Marketing
- Replace placeholder text with company logos
- Add branding elements to images
- Customize marketing materials with dynamic content
- Replace generic text with specific product information

### Content Personalization
- Add personalized elements to images
- Replace generic placeholders with user-specific content
- Customize templates with individual information
- Add dynamic content to static images

### Document Processing
- Replace watermarks with official stamps
- Add signatures to documents
- Replace placeholder images with actual content
- Customize forms with specific information

### Creative Design
- Replace text elements with graphical elements
- Add decorative elements to images
- Create dynamic compositions
- Replace text with icons or symbols

## Use Case Examples

### Logo Replacement
```javascript
var textToReplace = 'COMPANY_NAME';
var scale = 0.8;
var position = 'top-right';
```

### Signature Addition
```javascript
var textToReplace = 'SIGN_HERE';
var scale = 1.2;
var position = 'bottom-center';
```

### Watermark Replacement
```javascript
var textToReplace = 'DRAFT';
var scale = 0.5;
var position = 'center';
```

## Text Recognition Tips

### Image Quality
- **Resolution:** Higher resolution = better text recognition
- **Contrast:** Clear contrast between text and background
- **Focus:** Sharp, in-focus images work best
- **Lighting:** Well-lit images with minimal shadows

### Text Characteristics
- **Font type:** Standard fonts work better than decorative fonts
- **Font size:** Larger text is easier to recognize
- **Text orientation:** Horizontal text is most accurate
- **Text clarity:** Clean, uncluttered text works best

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help

## Additional Notes

- Text recognition accuracy varies based on image quality and text characteristics
- The replacement process preserves image quality
- Multiple text instances may be replaced if they match exactly
- Processing preserves original image file
- Consider using this tool as part of an automated content generation workflow 