# Remove EXIF Tags From Image - Google Apps Script

This Google Apps Script removes EXIF (Exchangeable Image File Format) metadata from images using the PDF4Me API. It helps protect privacy by stripping out potentially sensitive information embedded in image files.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input and Output folders
- An image file in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `remove_exif_tags_from_image.gs`

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
   var outputFileName = 'cleaned.jpg';
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
   - The cleaned image will be saved in the Output folder
   - Check the execution logs for status information

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/RemoveExifTagsFromImage`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageName": "cleaned.jpg",
  "imageContent": "base64_encoded_image_content",
  "isAsync": true
}
```

## What EXIF Data Contains

EXIF tags can include various types of metadata:

### Camera Information
- **Make and Model:** Camera manufacturer and model
- **Lens Information:** Focal length, aperture settings
- **Serial Numbers:** Camera and lens serial numbers

### Shooting Details
- **Date and Time:** When the photo was taken
- **Exposure Settings:** Shutter speed, ISO, aperture
- **Flash Information:** Flash usage and settings
- **White Balance:** Color temperature settings

### Location Data
- **GPS Coordinates:** Latitude and longitude
- **Altitude:** Elevation above sea level
- **Location Names:** City, country, landmarks

### Software Information
- **Editing Software:** Programs used to edit the image
- **Processing History:** Changes made to the image
- **Copyright Information:** Photographer details

### Device Information
- **Device Model:** Phone or camera model
- **Software Version:** Operating system and app versions
- **Orientation:** How the device was held

## Supported Input Formats

- JPG (JPEG)
- PNG
- TIFF
- And other formats that support EXIF data

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
- **No EXIF data:** Handles images without EXIF tags

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

4. **"No EXIF data found" message:**
   - Some images may not contain EXIF metadata
   - The script will still process the image successfully
   - Output image will be identical to input if no EXIF data exists

5. **"Timeout" error:**
   - Large images may take longer to process
   - Increase the `maxAttempts` value if needed

### Performance Tips

- EXIF removal is generally fast for most image sizes
- Processing time depends on image size and complexity
- Images without EXIF data process very quickly
- Consider file size when processing multiple images

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys
- Be aware that EXIF data may contain sensitive information

## Privacy Benefits

### Location Privacy
- Removes GPS coordinates that could reveal your location
- Eliminates address and landmark information
- Protects against location tracking

### Device Privacy
- Removes camera and device identification
- Eliminates software version information
- Protects against device fingerprinting

### Personal Information
- Removes photographer details and copyright info
- Eliminates timestamps that could reveal patterns
- Protects against personal identification

### Metadata Privacy
- Removes all embedded metadata
- Prevents data mining and analysis
- Ensures clean, anonymous images

## Performance Notes

- Processing time depends on image size
- Large images may require async processing
- EXIF removal is generally fast
- Network latency may impact response times

## Best Practices

1. **Privacy protection:** Use this tool for images shared publicly
2. **Batch processing:** Process multiple images for consistent privacy
3. **Testing:** Verify EXIF removal with metadata tools
4. **Backup:** Keep original images with EXIF data if needed
5. **Documentation:** Note which images have been cleaned

## Example Use Cases

### Social Media Sharing
- Remove location data before posting photos
- Eliminate device information from shared images
- Protect privacy when sharing personal photos
- Ensure anonymous image sharing

### Business Applications
- Clean product photos for public use
- Remove internal metadata from marketing materials
- Protect company information in shared images
- Ensure professional image presentation

### Legal and Compliance
- Meet privacy requirements for image sharing
- Comply with data protection regulations
- Remove sensitive metadata for legal documents
- Ensure anonymous evidence submission

### Content Creation
- Clean images for public distribution
- Remove personal information from creative works
- Ensure privacy in portfolio submissions
- Protect identity in online content

## Before and After Example

### Before (with EXIF data):
```
Image: vacation_photo.jpg
Size: 2.4 MB
EXIF Data:
  Make: Canon
  Model: EOS 5D Mark IV
  DateTime: 2023:08:15 14:30:25
  GPSLatitude: 40.7128
  GPSLongitude: -74.0060
  Copyright: John Doe
```

### After (EXIF removed):
```
Image: cleaned_vacation_photo.jpg
Size: 2.3 MB
EXIF Data: None
```

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help

## Additional Notes

- EXIF removal preserves image quality and visual content
- File size may be slightly reduced after EXIF removal
- The process is irreversible - keep original files if needed
- Some image formats may not support EXIF data
- Processing preserves original image file
- Consider using this tool as part of a privacy workflow 