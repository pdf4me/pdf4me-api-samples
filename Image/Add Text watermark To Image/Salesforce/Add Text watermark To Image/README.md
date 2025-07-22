# Add Text Watermark To Image - Salesforce Implementation

This project demonstrates how to add text watermarks to images using the PDF4Me API with Salesforce Apex.

## ✅ Features

- Add text watermarks to various image formats (PNG, JPG, GIF, etc.)
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Configurable text, font, color, position, and opacity
- Salesforce integration ready

## Prerequisites

- Salesforce org with API access
- PDF4Me API key
- Internet connection for API access
- Apex development environment (Developer Console, VS Code, etc.)

## Project Structure

```
Add Text watermark To Image/
├── AddTextWatermarkToImage.cls           # Main Apex class
├── AddTextWatermarkToImageTest.cls       # Test class
├── Executable_Anonymous_code_AddTextWatermarkToImage.txt  # Anonymous Apex example
├── README.md                             # This documentation
└── sample.png                            # Sample input image
```

## Setup

1. **Deploy the Apex classes** to your Salesforce org:
   - `AddTextWatermarkToImage.cls`
   - `AddTextWatermarkToImageTest.cls`

2. **Configure your API key** in the Apex class:
   ```apex
   private static final String API_KEY = 'your-api-key-here';
   ```

3. **Upload your input image** as a Static Resource or use a Document record:
   - Image file (PNG, JPG, GIF, etc.)

4. **Execute the code** using the anonymous Apex example or call the methods from your application

## Usage

### Method 1: Anonymous Apex Execution

1. Open Developer Console in Salesforce
2. Go to Debug → Open Execute Anonymous Window
3. Copy and paste the content from `Executable_Anonymous_code_AddTextWatermarkToImage.txt`
4. Update the API key and file path as needed
5. Execute the code

### Method 2: Apex Class Integration

```apex
// Create an instance of the class
AddTextWatermarkToImage watermarker = new AddTextWatermarkToImage();

// Call the method with your image and text settings
String result = watermarker.addTextWatermarkToImage('your-image-id', 'CONFIDENTIAL');
```

### Expected Output

```
=== Adding Text Watermark to Image ===
This adds text watermarks to images with configurable styling
Returns watermarked image with applied text watermark
------------------------------------------------------------
Input image file: sample.png
Output image file: watermarked_output.png
Adding text watermark...
Reading and encoding image file...
Image file read successfully: 12345 bytes
Sending add text watermark request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/AddTextWatermarkToImage/...
Polling attempt 1/10...
Text watermark addition completed successfully!
Watermarked image saved to: watermarked_output.png
Text watermark addition operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/AddTextWatermarkToImage
```

## Specific Settings

### Text Watermark Parameters
- **imageContent**: Base64 encoded image content
- **imageName**: Input image name
- **text**: Text to be added as watermark
- **position**: Watermark position (top-left, top-right, bottom-left, bottom-right, center)
- **fontSize**: Font size in pixels
- **fontColor**: Font color (hex code or color name)
- **opacity**: Watermark opacity (0.0 to 1.0)
- **async**: `true` for asynchronous processing (recommended for large images)

## Implementation Details

### Key Components

1. **File Reading**: Reads input image from Salesforce and converts to Base64
2. **Request Building**: Constructs JSON payload with image content and text watermark settings
3. **API Communication**: Sends HTTP POST request to PDF4Me API using HttpCallout
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the watermarked image

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects callout limits and governor limits

## API Endpoints

### Add Text Watermark
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/AddTextWatermarkToImage`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "imageContent": "base64-encoded-image",
  "imageName": "sample.png",
  "text": "CONFIDENTIAL",
  "position": "bottom-right",
  "fontSize": 24,
  "fontColor": "#FF0000",
  "opacity": 0.7,
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the watermarked image as binary data

### Asynchronous Response (202 Accepted)
```json
{
  "jobId": "job-12345",
  "status": "Accepted"
}
```

## Error Handling

The application includes comprehensive error handling for:

- **File Operations**: Missing files, permission issues
- **API Communication**: Network errors, timeouts
- **Response Processing**: Invalid responses, unexpected status codes
- **Base64 Operations**: Encoding/decoding errors
- **Salesforce Limits**: Callout limits, governor limits

## Dependencies

### Salesforce Requirements
- API access enabled
- Remote site settings for `api.pdf4me.com`
- Appropriate permissions for file access

### Setup Remote Site Settings

1. Go to Setup → Security → Remote Site Settings
2. Add new remote site:
   - Remote Site Name: `PDF4MeAPI`
   - Remote Site URL: `https://api.pdf4me.com`
   - Active: `true`
   - Disable Protocol Security: `false`

## Security Considerations

- **API Key Protection**: Store API keys securely in Custom Settings or Named Credentials
- **File Validation**: Validate input files before processing
- **Error Information**: Avoid exposing sensitive information in error messages
- **HTTPS**: All API communications use HTTPS
- **Salesforce Security**: Respect org security settings and sharing rules

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your API key is correct
   - Check if the key has necessary permissions

2. **File Not Found**
   - Ensure the image exists in your Salesforce org
   - Check file permissions and sharing settings

3. **Network Errors**
   - Verify remote site settings are configured correctly
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Image Format**
   - Ensure image file is in a supported format (PNG, JPG, GIF, etc.)
   - Check if image file is corrupted

5. **Text Not Visible**
   - Adjust font size, color, or opacity for better visibility
   - Consider text position relative to image content

6. **Salesforce Limits**
   - Check callout limits (100 per transaction)
   - Monitor governor limits for CPU time and heap size
   - Consider using Queueable jobs for large images

### Debug Mode

Enable detailed logging by setting:
```apex
private static final Boolean DEBUG_MODE = true;
```

## Sample Files

- **sample.png**: Sample input image
- **watermarked_output.png**: Generated watermarked image

## Expected Workflow

1. **Input**: Image file and text watermark settings
2. **Processing**: Add text watermark to image with specified styling
3. **Output**: Watermarked image

## Testing

Run the test class to verify functionality:

```apex
Test.startTest();
AddTextWatermarkToImageTest.runTests();
Test.stopTest();
```

## Next Steps

- Implement batch processing for multiple images
- Add support for different image formats
- Integrate with Lightning components
- Add progress tracking for large images

## Future Enhancements

- **Lightning Component**: Create a user-friendly interface
- **Batch Processing**: Handle multiple images simultaneously
- **Preview Feature**: Show watermark preview before processing
- **Custom Options**: Configure font family, rotation, and effects
- **Advanced Options**: Support for multiple text watermarks on one image
- **Platform Events**: Notify users when processing is complete

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 