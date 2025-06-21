import base64
import requests
import os
import time

# API Configuration - PDF4Me service for converting Visio files
api_url = "https://api.pdf4me.com/api/v2/ConvertVisio?schemaVal=PDF"
api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"

# File paths - Input Visio file and output converted file
input_path = "E-Commerce.vsdx"  # Change to your Visio file (.vsdx, .vsd, .vsdm)
output_path = "VISIO_to_PDF_output.pdf"  # Output file will be saved in current directory

def convert_visio_to_pdf():
    """
    Convert a Visio file to PDF (or other formats) using PDF4Me API
    Process: Read file → Encode to base64 → Send API request → Handle response → Save result
    """
    
    # Step 1: Read the Visio file and convert it to base64 encoding
    # Base64 encoding is required because API expects text format, not binary
    try:
        with open(input_path, "rb") as f:
            file_base64 = base64.b64encode(f.read()).decode("utf-8")
        print("Visio file successfully encoded to base64")
    except Exception as e:
        print(f"Error reading Visio file: {e}")
        return

    # Step 2: Prepare the payload (data) to send to the API
    # This payload is specifically for PDF output format
    payload = {
        "docContent": file_base64,           # Base64 encoded file content
        "docName": "output",                 # Name for the output file
        "OutputFormat": "PDF",               # Desired output format (PDF/JPG/PNG/TIFF)
        "IsPdfCompliant": True,              # Make PDF compliant with standards
        "PageIndex": 0,                      # Start from first page (0-indexed)
        "PageCount": 5,                      # Number of pages to convert (1-100)
        "IncludeHiddenPages": True,          # Include hidden pages (True/False)
        "SaveForegroundPage": True,          # Save foreground elements (True/False)
        "SaveToolBar": True,                 # Include toolbar (True/False)
        "AutoFit": True,                     # Auto-fit content to page (True/False)
        "async": True                        # Enable asynchronous processing
    }

    # Alternative payload examples for other output formats:
    
    # For JPG Output - Image format with quality settings
    # payload = {
    #     "docContent": file_base64,
    #     "docName": "output",
    #     "OutputFormat": "JPG",               # JPEG image format
    #     "PageIndex": 0,
    #     "PageCount": 5,
    #     "JpegQuality": 80,                   # Image quality (0-100, higher = better quality)
    #     "ImageBrightness": 1.0,              # Brightness adjustment (1.0 = normal)
    #     "ImageContrast": 1.0,                # Contrast adjustment (1.0 = normal)
    #     "ImageColorMode": "RGB",             # Color mode: RGB or Grayscale
    #     "CompositingQuality": "HighQuality", # Quality of image compositing
    #     "InterpolationMode": "High",         # Image scaling quality
    #     "PixelOffsetMode": "HighQuality",    # Pixel rendering quality
    #     "Resolution": 300,                   # DPI resolution (300 = high quality)
    #     "Scale": 1.0,                        # Scaling factor (1.0 = original size)
    #     "SmoothingMode": "HighQuality",      # Anti-aliasing quality
    #     "AutoFit": True
    # }

    # For PNG Output - Lossless image format with transparency support
    # payload = {
    #     "docContent": file_base64,
    #     "docName": "output",
    #     "OutputFormat": "PNG",               # PNG image format (supports transparency)
    #     "PageIndex": 0,
    #     "PageCount": 5,
    #     "ImageBrightness": 1.0,
    #     "ImageContrast": 1.0,
    #     "ImageColorMode": "RGBA",            # RGBA (with alpha/transparency) or RGB
    #     "CompositingQuality": "HighQuality",
    #     "InterpolationMode": "High",
    #     "PixelOffsetMode": "HighQuality",
    #     "Resolution": 300,
    #     "Scale": 1.0,
    #     "SmoothingMode": "HighQuality",
    #     "AutoFit": True
    # }

    # For TIFF Output - High-quality format often used for archival/printing
    # payload = {
    #     "docContent": file_base64,
    #     "docName": "output",
    #     "OutputFormat": "TIFF",              # TIFF image format
    #     "PageIndex": 0,
    #     "PageCount": 5,
    #     "ImageBrightness": 1.0,
    #     "ImageContrast": 1.0,
    #     "ImageColorMode": "Grayscale",       # Grayscale or RGB
    #     "TiffCompression": "LZW",            # Compression: LZW, None, or CCITT4
    #     "Resolution": 300,
    #     "Scale": 1.0,
    #     "SmoothingMode": "HighQuality",
    #     "AutoFit": True
    # }

    # Step 3: Set up HTTP headers for the API request
    # Headers tell the server what type of data we're sending and our authentication
    headers = {
        "Content-Type": "application/json",   # We're sending JSON data
        "Authorization": f"Basic {api_key}"   # Authentication using Basic auth with API key
    }

    # Step 4: Send the initial conversion request to the API
    print("Sending request to PDF4Me API...")
    response = requests.post(api_url, json=payload, headers=headers, verify=False)

    # Step 5: Debug information - show what the API returned
    print(f"Status code: {response.status_code}")
    print(f"Response headers: {response.headers}")
    print(f"Response content length: {len(response.content)}")

    # Step 6: Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 means "Success" - conversion completed successfully
        print("Visio conversion completed successfully!")
        
        # Step 7: Validate the response and save the file
        if response.content.startswith(b'%PDF') or len(response.content) > 1000:
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"File saved successfully at: {output_path}")
        else:
            print("Warning: Response doesn't appear to be a valid file")
            print(f"First 100 bytes: {response.content[:100]}")
        return
        
    elif response.status_code == 202:
        # 202 means "Accepted" - API is processing asynchronously
        print("Request accepted. PDF4Me is processing the conversion asynchronously...")
        
        # Get the polling URL from the Location header
        location_url = response.headers.get('Location')
        if not location_url:
            print("No 'Location' header found in the response.")
            return

        # Retry logic for polling the result
        max_retries = 10    # Maximum number of polling attempts
        retry_delay = 10    # seconds between each polling attempt

        # Step 8: Poll the API until conversion is complete
        for attempt in range(max_retries):
            print(f"Waiting for result... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)  # Wait before next attempt

            # Check the conversion status
            response_conversion = requests.get(location_url, headers=headers, verify=False)

            if response_conversion.status_code == 200:
                # Conversion completed successfully
                print("Visio conversion completed successfully!")
                
                # Step 9: Validate and save the result
                if response_conversion.content.startswith(b'%PDF') or len(response_conversion.content) > 1000:
                    with open(output_path, 'wb') as out_file:
                        out_file.write(response_conversion.content)
                    print(f"File saved successfully at: {output_path}")
                else:
                    print("Warning: Response doesn't appear to be a valid file")
                    print(f"First 100 bytes: {response_conversion.content[:100]}")
                return
                
            elif response_conversion.status_code == 202:
                # Still processing, continue polling
                print("Still processing...")
                continue
            else:
                # Error occurred during processing
                print(f"Error during polling. Status code: {response_conversion.status_code}")
                print(f"Response text: {response_conversion.text}")
                return

        # If we reach here, polling timed out
        print("Timeout: Visio conversion did not complete after multiple retries.")
        
    else:
        # All other status codes are errors
        print(f"Error: Failed to convert Visio file. Status code: {response.status_code}")
        print(f"Response text: {response.text}")
        return

# Step 9: Main execution - Run the conversion when script is executed directly
if __name__ == "__main__":
    print("Starting Visio to PDF conversion...")
    print(f"Input file: {input_path}")
    print(f"Output file: {output_path}")
    print("-" * 50)
    convert_visio_to_pdf()
