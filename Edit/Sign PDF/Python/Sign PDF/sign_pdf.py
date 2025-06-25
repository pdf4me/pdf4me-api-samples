import os
import base64
import requests
import time

def sign_pdf():
    """
    Add signature to a PDF document using PDF4me API
    Process: Read PDF & Signature → Encode to base64 → Send API request → Poll for completion → Save signed PDF
    This action allows adding signature images to PDF documents with control over position, size, and appearance
    """
    
    # API Configuration - PDF4me service for adding signatures to PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    signature_file_path = "dev.jpg"  # Path to the signature image file
    output_path = "Add_sign_to_PDF_output.pdf"  # Output PDF file name
    
    # API endpoint for adding signatures to PDF documents
    url = "https://api.pdf4me.com/api/v2/SignPdf"

    # Check if the input PDF file exists before proceeding
    if not os.path.exists(pdf_file_path):
        print(f"Error: PDF file not found at {pdf_file_path}")
        return

    # Check if the signature image file exists before proceeding
    if not os.path.exists(signature_file_path):
        print(f"Error: Signature image file not found at {signature_file_path}")
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

    # Read the signature image file and convert it to base64 encoding
    try:
        with open(signature_file_path, "rb") as f:
            signature_content = f.read()
        signature_base64 = base64.b64encode(signature_content).decode('utf-8')
        print(f"Signature image read successfully: {len(signature_content)} bytes")
    except Exception as e:
        print(f"Error reading signature image: {e}")
        return

    # Prepare the payload (data) to send to the API
    payload = {
        "docContent": pdf_base64,                        # Base64 encoded PDF document content
        "docName": "output.pdf",                         # Output PDF file name
        "imageFile": signature_base64,                   # Base64 encoded signature image content
        "imageName": os.path.basename(signature_file_path),  # Signature image file name with extension
        "pages": "1-3",                                    # Page options: "1", "1,3,5", "2-5", "1,3,7-10", "2-"
        "alignX": "right",                               # Horizontal alignment: "Left", "Center", "Right"
        "alignY": "bottom",                              # Vertical alignment: "Top", "Middle", "Bottom"
        "widthInMM": "50",                               # Signature width in millimeters (10-200)
        "heightInMM": "25",                              # Signature height in millimeters (10-200)
        "widthInPx": "142",                              # Signature width in pixels (20-600)
        "heightInPx": "71",                              # Signature height in pixels (20-600)
        "marginXInMM": "20",                             # Horizontal margin in millimeters (0-100)
        "marginYInMM": "20",                             # Vertical margin in millimeters (0-100)
        "marginXInPx": "57",                             # Horizontal margin in pixels (0-300)
        "marginYInPx": "57",                             # Vertical margin in pixels (0-300)
        "opacity": "100",                                # Opacity (0-100): 0=invisible, 100=fully opaque
        "showOnlyInPrint": True,                        # Show signature in view and print (true/false)
        "isBackground": False,                           # Place signature in background/foreground (true/false)
        "async": True                                    # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",              # Authentication using provided API key
        "Content-Type": "application/json"               # Specify that we're sending JSON data
    }

    print("Sending signature request to PDF4me API...")
    
    # Make the API request to add signature to the PDF
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: signature addition completed immediately
        print("✓ Success! Signature addition completed!")
        
        # Save the signed PDF
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

        # Poll the API until signature addition is complete
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
                print("✓ Success! Signature addition completed!")
                
                # Save the signed PDF
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
    print("Adding signature to PDF...")
    sign_pdf()
