import os
import base64
import requests
import time

def add_barcode_to_pdf():
    """
    Add barcode to a PDF document using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save PDF with barcode
    This action allows adding various barcode types to PDF documents with control over position, size, and appearance
    """
    
    # API Configuration - PDF4me service for adding barcodes to PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_path = "Add_barcode_to_PDF_output.pdf"  # Output PDF file name
    
    # API endpoint for adding barcodes to PDF documents
    url = "https://api.pdf4me.com/api/v2/addbarcode"

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
        "text": "PDF4me Barcode Sample",                 # Text to encode in barcode
        "barcodeType": "qrCode",                         # Barcode types: qrCode, code128, dataMatrix, aztec, hanXin, pdf417, etc.
        "pages": "1-3",                                     # Page options: "", "1", "1,3,5", "2-5", "1,3,7-10", "2-" (empty = all pages)
        "alignX": "Right",                               # Horizontal alignment: "Left", "Center", "Right"
        "alignY": "Bottom",                                 # Vertical alignment: "Top", "Middle", "Bottom"
        "heightInMM": "40",                              # Height in millimeters (string, "0" for auto-detect)
        "widthInMM": "40",                               # Width in millimeters (string, "0" for auto-detect)
        "marginXInMM": "20",                             # Horizontal margin in millimeters (string)
        "marginYInMM": "20",                             # Vertical margin in millimeters (string)
        "heightInPt": "113",                             # Height in points (string, "0" for auto-detect)
        "widthInPt": "113",                              # Width in points (string, "0" for auto-detect)
        "marginXInPt": "57",                             # Horizontal margin in points (string)
        "marginYInPt": "57",                             # Vertical margin in points (string)
        "opacity": 100,                                  # Opacity (0-100): 0=transparent, 100=opaque
        "displayText": "below",                          # Text display: "above", "below"
        "hideText": False,                               # Hide barcode text (true/false)
        "showOnlyInPrint": False,                        # Show only in print (true/false)
        "isTextAbove": False,                            # Text position above barcode (true/false)
        "async": True                                    # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",              # Authentication using provided API key
        "Content-Type": "application/json"               # Specify that we're sending JSON data
    }

    print("Sending barcode addition request to PDF4me API...")
    
    # Make the API request to add barcode to the PDF
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: barcode addition completed immediately
        print("✓ Success! Barcode addition completed!")
        
        # Save the PDF with barcode
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

        # Poll the API until barcode addition is complete
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
                print("✓ Success! Barcode addition completed!")
                
                # Save the PDF with barcode
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
    print("Adding barcode to PDF...")
    add_barcode_to_pdf()
