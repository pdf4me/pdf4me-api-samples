import os
import requests
import time

def convert_url_to_pdf():
    """
    Convert a web URL to PDF using PDF4Me API
    Process: Send URL → Configure page settings → Send API request → Poll for completion → Save PDF
    URL to PDF conversion captures web pages with all styling, images, and layout preserved
    """
    
    # API Configuration - PDF4Me service for converting web URLs to PDF documents
    api_url = "https://api.pdf4me.com/api/v2/ConvertUrlToPdf"
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
    
    # Target web page to convert and output configuration
    target_url = "https://en.wikipedia.org/wiki/Microsoft_Power_Automate"  # Web page URL to convert
    output_path = "URL_to_PDF_output.pdf"  # Output PDF file name (simple filename, not full path)

    # Prepare the payload (data) to send to the API
    # This payload configures the URL to PDF conversion settings according to API documentation
    payload = {
        "webUrl": target_url,           # Web URL of the page to be converted to PDF
        "authType": "NoAuth",           # Authentication type for URL website (NoAuth, Basic, etc.)
        "username": "",                 # Username if authentication is required (empty for NoAuth)
        "password": "",                 # Password if authentication is required (empty for NoAuth)
        "docContent": "",               # Base64 PDF content (empty for URL conversion)
        "docName": output_path,         # Output PDF file name with extension
        "layout": "portrait",           # Page orientation: "portrait" or "landscape"
        "format": "A4",                 # Page format: A0-A8, Tabloid, Legal, Statement, Executive
        "scale": 1.0,                   # Scale factor for the web page (decimal format, e.g., 0.8 = 80%)
        "topMargin": "20px",            # Top margin of PDF (string format with px unit)
        "leftMargin": "20px",           # Left margin of PDF (string format with px unit)
        "rightMargin": "20px",          # Right margin of PDF (string format with px unit)
        "bottomMargin": "20px",         # Bottom margin of PDF (string format with px unit)
        "printBackground": True,        # Include background colors and images (boolean)
        "displayHeaderFooter": False,   # Show header and footer in PDF (boolean)
        "async": True                   # Enable asynchronous processing
    }
    
    # About URL to PDF conversion features:
    # - Captures complete web pages including CSS styles, images, and JavaScript elements
    # - Maintains original layout and formatting as closely as possible
    # - Supports various page formats and orientations for different use cases
    # - Can handle both static HTML content and dynamic web pages
    # - Preserves interactive elements like clickable links in the PDF
    # - Customizable margins and scaling for optimal PDF layout
    # - Background printing option for complete visual fidelity

    # Set up HTTP headers for the API request
    # Headers provide authentication and specify the data format being sent
    headers = {
        "Content-Type": "application/json",   # We're sending JSON data to the API
        "Authorization": f"Basic {api_key}"   # Authentication using Basic auth with API key
    }

    print("Starting URL to PDF Conversion Process...")
    print(f"Converting web page: {target_url}")
    print(f"Output file: {output_path}")
    print("Capturing web page with all styling and layout...")

    # Send the initial conversion request to the API
    print("Sending URL to PDF conversion request to PDF4Me API...")
    response = requests.post(api_url, json=payload, headers=headers, verify=False)

    # Display debug information about the API response
    print(f"Initial response status code: {response.status_code}")
    print(f"Response headers: {dict(response.headers)}")
    print(f"Response content length: {len(response.content)} bytes")

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 means "Success" - conversion completed successfully
        print("URL to PDF conversion completed successfully!")
        
        # Check if response is a binary PDF file
        content_type = response.headers.get('Content-Type', '')
        print(f"Response Content-Type: {content_type}")
        
        # Validate that the response is a PDF file
        if (response.content.startswith(b'%PDF') or 
            'pdf' in content_type.lower() or 
            len(response.content) > 1000):
            
            # Save the PDF file to the current directory
            with open(output_path, 'wb') as f:
                f.write(response.content)
            
            print(f"PDF saved successfully to: {output_path}")
            print("Web page has been converted to PDF format")
            print("The PDF preserves the original web page layout, styling, and content")
            print(f"File size: {len(response.content)} bytes")
        else:
            print("Warning: Response doesn't appear to be a valid PDF")
            print(f"Content-Type: {content_type}")
            print(f"Response size: {len(response.content)} bytes")
            print("First 200 bytes of response:")
            print(response.content[:200])
        return
        
    elif response.status_code == 202:
        # 202 means "Accepted" - API is processing the conversion asynchronously
        print("Request accepted. PDF4Me is processing the web page conversion asynchronously...")
        
        # Get the polling URL from the Location header
        # This URL is used to check the conversion progress and retrieve the result
        location_url = response.headers.get('Location')
        print(f"Location header for polling: {location_url}")
        
        # Verify that we received a polling URL for checking conversion status
        if not location_url:
            print("No 'Location' header found in the response.")
            print("Cannot proceed without polling URL for checking conversion status.")
            return

        # Retry logic for polling the conversion result
        max_retries = 10    # Maximum number of polling attempts before timeout
        retry_delay = 10    # seconds to wait between each polling attempt

        # Poll the API until conversion is complete or timeout occurs
        for attempt in range(max_retries):
            print(f"Waiting for conversion result... (Attempt {attempt + 1}/{max_retries})")
            print("Processing web page content and generating PDF...")
            time.sleep(retry_delay)  # Wait before checking status again

            # Check the conversion status by calling the polling URL
            try:
                poll_response = requests.get(location_url, headers=headers, verify=False)
                
                # Display current status for debugging and user feedback
                print(f"Poll status code: {poll_response.status_code}")
                
                if poll_response.status_code == 200:
                    # Conversion completed successfully - validate and save the PDF
                    print("URL to PDF conversion completed successfully!")
                    
                    # Check the content type to ensure we received a PDF
                    content_type = poll_response.headers.get("Content-Type", "")
                    print(f"Response Content-Type: {content_type}")
                    
                    # Validate that the response is a PDF file
                    if (poll_response.content.startswith(b'%PDF') or 
                        'pdf' in content_type.lower() or 
                        len(poll_response.content) > 1000):
                        
                        # Save the PDF file to the current directory
                        with open(output_path, "wb") as f:
                            f.write(poll_response.content)
                        
                        print(f"PDF saved successfully to: {output_path}")
                        print("Web page has been converted to PDF format")
                        print("The PDF preserves the original web page layout, styling, and content")
                        print(f"File size: {len(poll_response.content)} bytes")
                    else:
                        print("Warning: Response doesn't appear to be a valid PDF")
                        print(f"Content-Type: {content_type}")
                        print(f"Response size: {len(poll_response.content)} bytes")
                        print("First 200 bytes of response:")
                        print(poll_response.content[:200])
                    return
                    
                elif poll_response.status_code == 202:
                    # Still processing, continue polling
                    print("Web page conversion still in progress...")
                    continue
                else:
                    # Error occurred during processing
                    print(f"Error during polling. Status code: {poll_response.status_code}")
                    print(f"Response text: {poll_response.text}")
                    return
                    
            except requests.exceptions.RequestException as e:
                # Handle network or request errors during polling
                print(f"Request failed during polling: {str(e)}")
                if attempt < max_retries - 1:  # Don't sleep on the last attempt
                    print("Network error occurred, retrying...")
                    continue
                else:
                    print("Max retries reached due to network errors. Giving up.")
                    return

        # If we reach here, polling timed out
        print("Timeout: URL to PDF conversion did not complete after multiple retries.")
        print("The conversion may be taking longer due to web page complexity or server load.")
        print("Please check if the URL is valid and accessible, then try again later.")
        
    else:
        # All other status codes are errors
        print(f"Error: Failed to convert URL to PDF. Status code: {response.status_code}")
        print(f"Response text: {response.text}")
        return

# Main execution - Run the conversion when script is executed directly
if __name__ == "__main__":
    print("Starting URL to PDF Conversion Process...")
    print("This converts web pages into PDF documents while preserving layout and styling")
    print("Perfect for archiving web content, creating offline documentation, or generating reports")
    print("The process captures CSS styles, images, and maintains the original web page appearance")
    print("Supports various page formats, margins, and scaling options for optimal PDF output")
    print("-" * 90)
    convert_url_to_pdf()
