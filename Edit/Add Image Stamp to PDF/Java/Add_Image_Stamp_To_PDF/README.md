# Add Image Stamp to PDF - Java Implementation

This Java project demonstrates how to add image stamps to PDF documents using the PDF4ME API. The application allows you to overlay images (stamps) onto PDF documents with configurable positioning and sizing.

## Features

- **Image Stamp Addition**: Add image stamps to PDF documents
- **Multiple Image Formats**: Support for PNG, JPG, JPEG, GIF, and other common image formats
- **Configurable Positioning**: Set stamp position (top-left, center, bottom-right, etc.)
- **Size Control**: Configure stamp size and scaling
- **Page Range Support**: Apply stamps to specific pages or all pages
- **Asynchronous Processing**: Handle large files efficiently with async processing
- **Error Handling**: Comprehensive error handling and validation

## Project Structure

```
Add_Image_Stamp_To_PDF/
├── src/
│   └── Main.java              # Main application class
├── Add_Image_Stamp_To_PDF.iml # IntelliJ IDEA module file
├── README.md                  # This documentation file
├── sample.pdf                 # Sample PDF file for testing
├── stamp.png                  # Sample image stamp for testing
└── out/                       # Compiled output directory (created on build)
```

## Prerequisites

- **Java 11 or higher**
- **PDF4ME API Key** - Get your API key from [PDF4ME Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
- **IntelliJ IDEA** (recommended) or any Java IDE
- **Sample files** for testing

## Setup Instructions

### 1. Get API Key
1. Visit [PDF4ME Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. Create or copy your API key
3. Update the `API_KEY` constant in `Main.java`

### 2. Prepare Sample Files
- Place a PDF file named `sample.pdf` in the project root
- Place an image file named `stamp.png` in the project root
- Supported image formats: PNG, JPG, JPEG, GIF, BMP, TIFF

### 3. Configure the Application
Edit `Main.java` and update the file paths:
```java
String pdfPath = "sample.pdf";  // Your PDF file path
String imagePath = "stamp.png"; // Your image stamp file path
String outputPath = "Add_image_stamp_to_PDF_output.pdf"; // Output file name
```

## Usage

### Compile the Project
```bash
javac -d out src/Main.java
```

### Run the Application
```bash
java -cp out Main
```

### Expected Output
```
=== Adding Image Stamp to PDF Document ===
PDF file read successfully: 14601 bytes
Image stamp read successfully: 2048 bytes
Sending image stamp request to PDF4ME API...
✓ Success! Image stamp addition completed!
File saved: Add_image_stamp_to_PDF_output.pdf
Done: Add_image_stamp_to_PDF_output.pdf
```

## API Configuration

### Endpoint
- **Production**: `https://api.pdf4me.com/api/v2/AddImageStamp`

### Authentication
- **Method**: Basic Authentication
- **Format**: `Authorization: Basic {API_KEY}`

### Request Payload Structure
```json
{
  "docContent": "base64_encoded_pdf_content",
  "docName": "sample.pdf",
  "imageContent": "base64_encoded_image_content",
  "imageName": "stamp.png",
  "pages": "all",
  "position": "center",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 100,
  "opacity": 0.8,
  "async": true
}
```

### Response Handling
- **200 OK**: Immediate success, PDF returned in response body
- **202 Accepted**: Async processing, poll Location header for completion
- **4xx/5xx**: Error responses with detailed error messages

## Configuration Options

### Stamp Positioning
- **position**: "top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"
- **x, y**: Custom coordinates in pixels
- **width, height**: Stamp dimensions in pixels
- **opacity**: Transparency level (0.0 to 1.0)

### Page Selection
- **"all"**: Apply to all pages
- **"1"**: Apply to page 1 only
- **"1,3,5"**: Apply to specific pages
- **"2-5"**: Apply to page range
- **"1,3,7-10"**: Mixed page selection

## Error Handling

The application includes comprehensive error handling for:
- **File Not Found**: Missing PDF or image files
- **Invalid File Formats**: Unsupported image or PDF formats
- **API Errors**: Authentication, rate limiting, and processing errors
- **Network Issues**: Connection timeouts and HTTP errors
- **Async Timeouts**: Processing timeout after maximum retries

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check your API key is correct
   - Ensure you're using the right environment (dev vs production)

2. **400 Bad Request**
   - Verify file formats are supported
   - Check payload structure matches API requirements

3. **File Not Found**
   - Ensure sample.pdf and stamp.png exist in project root
   - Check file paths are correct

4. **Timeout Errors**
   - Large files may take longer to process
   - Increase timeout values if needed

### Debug Mode
Enable debug output by uncommenting debug statements in the code:
```java
System.out.println("Debug: " + debugInfo);
```

## API Reference

For detailed API documentation, visit:
- [PDF4ME API Documentation](https://dev.pdf4me.com/docs/)
- [AddImageStamp Endpoint](https://dev.pdf4me.com/docs/api/AddImageStamp)

## License

This project is provided as a sample implementation for the PDF4ME API.

## Support

For technical support:
- [PDF4ME Support](https://dev.pdf4me.com/support/)
- [API Documentation](https://dev.pdf4me.com/docs/)
- [Community Forum](https://dev.pdf4me.com/community/) 