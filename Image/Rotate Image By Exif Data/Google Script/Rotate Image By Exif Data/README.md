# Rotate Image By EXIF Data - Google Apps Script

This Google Apps Script automatically rotates images based on their EXIF orientation data using the PDF4Me API. It corrects image orientation by reading the camera's orientation information embedded in the image metadata.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input and Output folders
- An image file with EXIF orientation data in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `rotate_image_by_exif_data.gs`

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
   var outputFileName = 'corrected.jpg';
   ```

## Usage

1. **Prepare your image file:**
   - Place your image file in the Input folder
   - Update the `inputFileName` variable to match your file name

2. **Run the script:**
   - Save the script
   - Click the "Run" button
   - Grant necessary permissions when prompted

3. **Check results:**
   - The corrected image will be saved in the Output folder
   - Check the execution logs for status information

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/RotateImageByExifData`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageName": "corrected.jpg",
  "imageContent": "base64_encoded_image_content",
  "async": true
}
```

## How EXIF Orientation Works

### EXIF Orientation Values
- **1:** Normal (no rotation needed)
- **2:** Mirror horizontal
- **3:** Rotate 180°
- **4:** Mirror vertical
- **5:** Mirror horizontal and rotate 270° CW
- **6:** Rotate 90° CW
- **7:** Mirror horizontal and rotate 90° CW
- **8:** Rotate 270° CW

### Common Scenarios
- **Mobile photos:** Often have orientation issues due to camera orientation
- **Digital cameras:** May record orientation data when held in different positions
- **Scanned images:** Usually don't have EXIF orientation data
- **Edited images:** May lose or have modified EXIF data

## Supported Input Formats

- JPG (JPEG) - Most common for EXIF data
- TIFF - Supports EXIF orientation
- PNG - Limited EXIF support
- Other formats that support EXIF metadata

## Supported Output Formats

- JPG (JPEG)
- PNG
- TIFF
- And other common image formats

## Error Handling

The script includes comprehensive error handling:

- **File not found:** Checks if input file exists
- **API errors:** Handles HTTP error responses
- **Authentication errors:** Validates API key
- **Processing errors:** Monitors async job status
- **Timeout handling:** Prevents infinite polling
- **No EXIF data:** Handles images without orientation data

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
   - Verify image contains EXIF data

4. **"No EXIF orientation data" result:**
   - Some images may not contain EXIF orientation data
   - The script will still process the image successfully
   - Output image will be identical to input if no orientation data exists

5. **"Timeout" error:**
   - Large images may take longer to process
   - Increase the `maxAttempts` value if needed

### Performance Tips

- Use images with EXIF data for best results
- JPG files from cameras/phones typically have orientation data
- Processing is generally fast for most image sizes
- Images without EXIF data process very quickly

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys
- Be aware that EXIF data may contain sensitive information

## Performance Notes

- Processing time depends on image size
- Large images may require async processing
- EXIF reading is generally fast
- Network latency may impact response times

## Best Practices

1. **Image selection:** Use images from cameras/phones for best results
2. **Format preference:** JPG files typically have the most EXIF data
3. **Testing:** Test with sample images before batch processing
4. **Backup:** Keep original images as backup
5. **Verification:** Check results to ensure proper orientation

## Example Use Cases

### Mobile Photography
- Correct photos taken with phones in different orientations
- Fix selfie orientation issues
- Correct landscape/portrait orientation
- Fix photos taken upside down

### Digital Photography
- Correct camera orientation issues
- Fix photos taken in different camera positions
- Correct orientation for professional photography
- Fix batch processing of camera photos

### Content Management
- Automatically correct image orientation in collections
- Prepare images for web display
- Standardize image orientation across platforms
- Fix orientation for social media posts

### Document Processing
- Correct scanned document orientation
- Fix orientation for OCR processing
- Prepare documents for archiving
- Correct orientation for printing

## When to Use This Tool

### Best Use Cases
- **Mobile photos:** Photos taken with smartphones
- **Camera photos:** Images from digital cameras
- **Unexplained orientation issues:** Images that appear sideways or upside down
- **Batch processing:** Multiple images with orientation problems

### Limited Use Cases
- **Scanned images:** Usually don't have EXIF data
- **Edited images:** May have lost EXIF orientation data
- **Screenshots:** Don't contain camera orientation data
- **Generated images:** Artificially created images

## EXIF Orientation Examples

### Normal Orientation (1)
```
Original: Landscape photo taken normally
Result: No rotation applied
```

### Rotate 90° Clockwise (6)
```
Original: Portrait photo taken with phone held normally
Result: Rotated 90° clockwise to correct orientation
```

### Rotate 180° (3)
```
Original: Photo taken upside down
Result: Rotated 180° to correct orientation
```

### Rotate 270° Clockwise (8)
```
Original: Portrait photo taken with phone rotated
Result: Rotated 270° clockwise to correct orientation
```

## Before and After Examples

### Before (with EXIF orientation):
```
Image: phone_photo.jpg
EXIF Orientation: 6 (rotate 90° CW)
Appearance: Sideways in viewers
```

### After (corrected):
```
Image: corrected_phone_photo.jpg
EXIF Orientation: 1 (normal)
Appearance: Properly oriented in viewers
```

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help

## Additional Notes

- EXIF orientation correction preserves image quality
- The process automatically detects and applies the correct rotation
- Processing preserves original image file
- Images without EXIF data are processed without changes
- This tool is particularly useful for mobile and camera photos
- Consider using this tool as part of an automated image processing workflow 