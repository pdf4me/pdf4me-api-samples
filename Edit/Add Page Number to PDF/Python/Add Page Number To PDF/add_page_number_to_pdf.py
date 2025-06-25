import os
import base64
import requests
import time

def add_page_number_to_pdf():
    """
    Add page numbers to a PDF document using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save PDF with page numbers
    This action allows adding customizable page numbers to PDF documents with control over position, format, and styling
    """
    
    # API Configuration - PDF4me service for adding page numbers to PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_path = "Add_page_number_to_PDF_output.pdf"  # Output PDF file name
    
    # API endpoint for adding page numbers to PDF documents
    url = "https://api.pdf4me.com/api/v2/AddPageNumber"

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
        "pageNumberFormat": "Page 0 of 1",           # Format options: "Page {0}", "{0} of {1}", "Page {0} of {1}", "- {0} -", "[{0}/{1}]", "({0})", "{0}"
        "alignX": "right",                               # Horizontal alignment: "left", "center", "right"
        "alignY": "bottom",                              # Vertical alignment: "top", "middle", "bottom"
        "marginXinMM": 10,                               # Horizontal margin from edge in millimeters (0-100)
        "marginYinMM": 10,                               # Vertical margin from edge in millimeters (0-100)
        "fontSize": 12,                                  # Font size for page numbers (8-72)
        "isBold": True,                                  # Make page numbers bold (true/false)
        "isItalic": False,                               # Make page numbers italic (true/false)
        "skipFirstPage": False,                          # Skip numbering on first page (true/false)
        "async": True                                    # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",              # Authentication using provided API key
        "Content-Type": "application/json"               # Specify that we're sending JSON data
    }

    print("Sending page number request to PDF4me API...")
    
    # Make the API request to add page numbers to the PDF
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: page number addition completed immediately
        print("✓ Success! Page number addition completed!")
        
        # Save the PDF with page numbers
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

        # Poll the API until page number addition is complete
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
                print("✓ Success! Page number addition completed!")
                
                # Save the PDF with page numbers
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
    print("Adding page numbers to PDF...")
    add_page_number_to_pdf()
