import os
import base64
import requests
import time

def add_html_header_footer_to_pdf():
    """
    Add HTML content as header or footer to a PDF document using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save PDF with HTML header/footer
    This action allows adding HTML content as headers, footers, or both to PDF documents
    """
    
    # API Configuration - PDF4me service for adding HTML headers/footers to PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_path = "Add_header_footer_to_PDF_output.pdf"  # Output PDF file name
    
    # API endpoint for adding HTML headers/footers to PDF documents
    url = "https://api.pdf4me.com/api/v2/AddHtmlHeaderFooter"

    # Check if the input PDF file exists before proceeding
    if not os.path.exists(pdf_file_path):
        print(f"Error: PDF file not found at {pdf_file_path}")
        return

    # Read the PDF file and convert it to base64 encoding
    try:
        with open(pdf_file_path, "rb") as f:
            pdf_content = f.read()
        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        print(f"PDF file read successfully: {len(pdf_content)} bytes")
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return

    # Prepare the payload (data) to send to the API
    payload = {
        "docContent": pdf_base64,                        # Base64 encoded PDF document content
        "docName": "output.pdf",                         # Output PDF file name
        "htmlContent": "<div style='text-align: center; font-family: Arial; font-size: 12px; color: #FF0000;'>Document Header PDF4me </div>",  # HTML content (plain HTML, not base64)
        "pages": "",                                     # Page options: "", "1", "1,3,5", "2-5", "1,3,7-10", "2-" (empty string = all pages)
        "location": "Header",                            # Location options: "Header", "Footer", "Both"
        "skipFirstPage": False,                          # Skip first page (true/false)
        "marginLeft": 20.0,                              # Left margin in pixels (double)
        "marginRight": 20.0,                             # Right margin in pixels (double)
        "marginTop": 50.0,                               # Top margin in pixels (double)
        "marginBottom": 50.0,                            # Bottom margin in pixels (double)
        "async": True                                    # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",              # Authentication using provided API key
        "Content-Type": "application/json"               # Specify that we're sending JSON data
    }

    print("Sending HTML header/footer request to PDF4me API...")
    
    # Make the API request to add HTML header/footer to the PDF
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: HTML header/footer addition completed immediately
        print("✓ Success! HTML header/footer addition completed!")
        
        # Save the PDF with HTML header/footer
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"File saved: {output_path}")
        return
        
    elif response.status_code == 202:
        # 202 - Accepted: API is processing the request asynchronously
        print("202 - Request accepted. Processing asynchronously...")
        
        # Get the polling URL from the Location header for checking status
        location_url = response.headers.get('Location')
        if not location_url:
            print("Error: No polling URL found in response")
            return

        # Retry logic for polling the result
        max_retries = 10
        retry_delay = 10

        # Poll the API until HTML header/footer addition is complete
        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            # Check the processing status by calling the polling URL
            try:
                response_conversion = requests.get(location_url, headers=headers, verify=False)
            except Exception as e:
                print(f"Error polling status: {e}")
                continue

            if response_conversion.status_code == 200:
                # 200 - Success: Processing completed
                print("✓ Success! HTML header/footer addition completed!")
                
                # Save the PDF with HTML header/footer
                with open(output_path, 'wb') as out_file:
                    out_file.write(response_conversion.content)
                print(f"File saved: {output_path}")
                return
                
            elif response_conversion.status_code == 202:
                # Still processing, continue polling
                continue
            else:
                # Error occurred during processing
                print(f"Error during processing: {response_conversion.status_code} - {response_conversion.text}")
                return

        # If we reach here, polling timed out
        print("Timeout: Processing did not complete after multiple retries")
        
    else:
        # Other status codes - Error
        print(f"Error: {response.status_code} - {response.text}")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Adding HTML header/footer to PDF...")
    add_html_header_footer_to_pdf()
