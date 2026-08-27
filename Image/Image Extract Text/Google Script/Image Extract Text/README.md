# Image Extract Text - Google Apps Script

This Google Apps Script extracts text from images using Optical Character Recognition (OCR) via the PDF4Me API. It can recognize and extract text from various types of images including scanned documents, screenshots, and photographs.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input and Output folders
- An image file in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `image_extract_text.gs`

2. **Configure API Key:**
   ```javascript
   // Set your PDF4Me API key
   var apiKey = 'YOUR_API_KEY_HERE';
   ```

3. **Set up Google Drive Folders:**
   - Create a folder named "Input" in your Google Drive
   - Create a folder named "Output" in your Google Drive
   - Place your image file in the Input folder

4. **Configure File Names:**
   ```javascript
   var inputFileName = 'input.jpg';
   var outputFileName = 'extracted_text.txt';
   ```

## Usage

1. **Prepare your image file:**
   - Place your image file in the Input folder
   - Update the `inputFileName` variable to match your file name

2. **Configure OCR settings:**
   ```javascript
   var language = 'en'; // Language code for OCR (en, de, fr, es, etc.)
   var confidence = 0.8; // Minimum confidence threshold (0.0 to 1.0)
   ```

3. **Run the script:**
   - Save the script
   - Click the "Run" button
   - Grant necessary permissions when prompted

4. **Check results:**
   - The extracted text will be saved as a text file in the Output folder
   - Check the execution logs for status information

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/ImageExtractText`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageContent": "base64_encoded_image_content",
  "language": "en",
  "confidence": 0.8,
  "isAsync": true
}
```

## Configuration Options

### Language Support
- **language:** Specify the language of the text in the image
- Common language codes:
  - `en` - English
  - `de` - German
  - `fr` - French
  - `es` - Spanish
  - `it` - Italian
  - `pt` - Portuguese
  - `nl` - Dutch
  - `ru` - Russian
  - `ja` - Japanese
  - `ko` - Korean
  - `zh` - Chinese
  - And many more

### Confidence Threshold
- **confidence:** Minimum confidence level for text recognition (0.0 to 1.0)
- Higher values (0.8-1.0) = More accurate but may miss some text
- Lower values (0.5-0.7) = More text detected but may include errors
- Recommended range: 0.7 to 0.9

## Supported Input Formats

- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF
- WebP
- And other common image formats

## Output Format

- Plain text file (.txt)
- UTF-8 encoding
- Preserves line breaks and basic formatting
- No special formatting or styling

## Error Handling

The script includes comprehensive error handling:

- **File not found:** Checks if input file exists
- **API errors:** Handles HTTP error responses
- **Authentication errors:** Validates API key
- **Processing errors:** Monitors async job status
- **Timeout handling:** Prevents infinite polling
- **OCR failures:** Handles cases where no text is detected

## Troubleshooting

### Common Issues

1. **"File not found" error:**
   - Ensure the input file exists in the Input folder
   - Check the `inputFileName` variable matches your file name

2. **"API key invalid" error:**
   - Verify your PDF4Me API key is correct
   - Ensure the API key has sufficient permissions

3. **"Processing failed" error:**
   - Check if the image file is corrupted
   - Ensure image format is supported
   - Verify image contains readable text

4. **"No text detected" result:**
   - Check image quality and resolution
   - Ensure text is clearly visible and readable
   - Try adjusting confidence threshold
   - Verify language setting matches text language

5. **"Timeout" error:**
   - Large or complex images may take longer to process
   - Increase the `maxAttempts` value if needed

### Performance Tips

- Use high-quality images for better OCR results
- Ensure good contrast between text and background
- Avoid heavily compressed or low-resolution images
- Choose appropriate language setting for best accuracy
- Test with different confidence thresholds

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys
- Be aware that OCR may process sensitive information

## Performance Notes

- Processing time depends on image size and complexity
- Large images may require async processing
- OCR accuracy depends on image quality and text clarity
- Network latency may impact response times

## Best Practices

1. **Image quality:** Use clear, high-resolution images
2. **Text clarity:** Ensure text is well-contrasted and readable
3. **Language selection:** Choose the correct language for best results
4. **Confidence tuning:** Adjust confidence threshold based on needs
5. **Testing:** Test with sample images before processing large batches

## Example Use Cases

### Document Digitization
- Extract text from scanned documents
- Convert printed materials to digital text
- Process historical documents and archives
- Digitize handwritten notes (if legible)

### Data Extraction
- Extract information from forms and receipts
- Process business cards and contact information
- Extract text from screenshots
- Parse text from product labels

### Content Analysis
- Analyze text content in images
- Extract quotes from memes or social media posts
- Process text from charts and diagrams
- Extract captions from images

### Accessibility
- Make image content accessible to screen readers
- Convert image-based text to searchable content
- Create text alternatives for images
- Improve content discoverability

## OCR Quality Factors

### Image Quality
- **Resolution:** Higher resolution = better accuracy
- **Contrast:** Clear contrast between text and background
- **Focus:** Sharp, in-focus images work best
- **Lighting:** Well-lit images with minimal shadows

### Text Characteristics
- **Font type:** Standard fonts work better than decorative fonts
- **Font size:** Larger text is easier to recognize
- **Text orientation:** Horizontal text is most accurate
- **Language:** Correct language setting improves accuracy

### Processing Settings
- **Confidence threshold:** Balance accuracy vs. completeness
- **Language selection:** Match the actual text language
- **Image preprocessing:** Clean, uncluttered images work best

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help

## Additional Notes

- OCR accuracy varies based on image quality and text characteristics
- Handwritten text recognition is limited and less accurate
- Complex layouts may affect text extraction order
- Special characters and symbols may not be recognized
- Processing preserves original image file 