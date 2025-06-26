import requests
import base64
import os
import time

def convert_html_to_pdf():
    """
    Convert an HTML file to PDF using PDF4Me API
    Process: Read HTML file → Encode to base64 → Send API request → Handle response → Save PDF
    HTML to PDF conversion preserves styling, layout, and formatting from web content
    """
    
    # API Configuration - PDF4Me service for converting HTML to PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/" # Replace with your actual API key
    input_path = "sample.html"  # Path to input HTML file
    output_path = "HTML_to_PDF_output.pdf"           # Output PDF file name
    
    # API endpoint for HTML to PDF conversion
    url = "https://api.pdf4me.com/api/v2/ConvertHtmlToPdf"

    # Check if the input HTML file exists before proceeding
    if not os.path.exists(input_path):
        print(f"Error: Input file not found at {input_path}")
        return

    # Read the HTML file and convert it to base64 encoding
    # Base64 encoding is required because the API expects text format, not binary data
    try:
        with open(input_path, "rb") as f:
            html_content = f.read()  # Read file as binary data
            html_base64 = base64.b64encode(html_content).decode("utf-8")  # Convert to base64 string
        print("HTML file successfully encoded to base64")
    except Exception as e:
        print(f"Error reading HTML file: {e}")
        return

    # Prepare the payload (data) to send to the API
    # This payload configures how the HTML will be converted to PDF
    payload = {
        "docContent": html_base64,        # Base64 encoded HTML document content
        "docName": "output.pdf",          # Name for the output file
        "indexFilePath": input_path,      # Path to the source HTML file (required by API)
        "layout": "Portrait",             # Page orientation: Portrait or Landscape
        "format": "A4",                   # Page size: A4, Letter, A5, A6, etc.
        "scale": 0.8,                     # Scaling factor for content (0.1 to 2.0)
        "topMargin": "40px",              # Top margin spacing
        "bottomMargin": "40px",           # Bottom margin spacing
        "leftMargin": "40px",             # Left margin spacing
        "rightMargin": "40px",            # Right margin spacing
        "printBackground": True,          # Include background colors and images
        "displayHeaderFooter": True,      # Show header and footer in PDF
        "async": True                     # Enable asynchronous processing
    }
    
    # Additional payload options you can customize:
    # - "layout": "Landscape" for horizontal orientation
    # - "format": "Letter", "A5", "A6" for different page sizes
    # - "scale": 1.0 for original size, 0.5 for half size, 2.0 for double size
    # - "printBackground": False to exclude backgrounds
    # - "displayHeaderFooter": False to hide headers/footers

    # Set up HTTP headers for the API request
    # Headers tell the server about authentication and content type
    headers = {
        "Authorization": f"Basic {api_key}",  # Authentication using Basic auth with API key
        "Content-Type": "application/json"    # We're sending JSON data
    }

    # Send the initial conversion request to the API
    print("Sending request to PDF4Me API...")
    print(f"Converting: {input_path} → {output_path}")
    print(f"Page format: {payload['format']} {payload['layout']}")
    response = requests.post(url, json=payload, headers=headers, verify=False)

    # Display debug information about the API response
    print(f"Status code: {response.status_code}")
    print(f"Response headers: {response.headers}")
    print(f"Response content length: {len(response.content)}")
    
    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 means "Success" - conversion completed successfully
        print("HTML to PDF conversion completed successfully!")
        
        # Check if response is a binary PDF file
        if (response.headers.get('content-type', '').startswith('application/pdf') or 
            response.headers.get('content-type', '') == 'application/octet-stream' or 
            response.content.startswith(b'%PDF')):
            print("Response is a direct PDF file")
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"PDF saved to {output_path}")
            print("HTML content has been converted to PDF format")
            return
        
        # Try to parse JSON response if it's not a binary PDF
        try:
            result = response.json()
            print("Successfully parsed JSON response")
            
            # Look for PDF data in different possible JSON locations
            pdf_base64 = None
            if "document" in result and "docData" in result["document"]:
                pdf_base64 = result["document"]["docData"]  # Common location 1
            elif "docData" in result:
                pdf_base64 = result["docData"]              # Common location 2
            elif "data" in result:
                pdf_base64 = result["data"]                 # Alternative location
            
            if pdf_base64:
                try:
                    # Decode base64 PDF data and save to file
                    pdf_bytes = base64.b64decode(pdf_base64)
                    with open(output_path, "wb") as f:
                        f.write(pdf_bytes)
                    print(f"PDF saved to {output_path}")
                    print("HTML content has been converted to PDF format")
                except Exception as e:
                    print(f"Error saving PDF: {e}")
            else:
                print("No PDF data found in the response.")
                print("Full response:", result)
                
        except Exception as e:
            print(f"Failed to parse JSON response: {e}")
            print(f"Raw response text: {response.text[:500]}...")  # Show first 500 characters
            
    elif response.status_code == 202:
        # 202 means "Accepted" - API is processing the conversion asynchronously
        print("Request accepted. PDF4Me is processing asynchronously...")
        
        # Get the polling URL from the Location header for checking status
        location_url = response.headers.get('Location')
        if not location_url:
            print("No 'Location' header found in the response.")
            return

        # Retry logic for polling the result
        max_retries = 10    # Maximum number of polling attempts
        retry_delay = 10    # seconds between each polling attempt

        # Poll the API until conversion is complete
        for attempt in range(max_retries):
            print(f"Waiting for result... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)  # Wait before next attempt

            # Check the conversion status by calling the polling URL
            response_conversion = requests.get(location_url, headers=headers, verify=False)

            if response_conversion.status_code == 200:
                # Conversion completed successfully
                print("HTML to PDF conversion completed successfully!")
                
                # Validate and save the converted PDF
                if (response_conversion.content.startswith(b'%PDF') or 
                    len(response_conversion.content) > 1000):
                    with open(output_path, 'wb') as out_file:
                        out_file.write(response_conversion.content)
                    print(f"PDF saved successfully to: {output_path}")
                    print("HTML content has been converted to PDF format")
                else:
                    print("Warning: Response doesn't appear to be a valid PDF")
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
        print("Timeout: HTML to PDF conversion did not complete after multiple retries.")
        
    else:
        # All other status codes are errors
        print(f"Error: Failed to convert HTML to PDF. Status code: {response.status_code}")
        print(f"Response text: {response.text}")
        return

# Main execution - Run the conversion when script is executed directly
if __name__ == "__main__":
    print("Starting HTML to PDF Conversion Process...")
    print("This converts HTML web content into PDF documents")
    print("Preserves styling, layout, images, and formatting")
    print("-" * 60)
    convert_html_to_pdf()
