import requests
import base64
import os
import time



def add_image_stamp_to_pdf():
    """
    Add image stamp to a PDF file using PDF4me API
    Process: Read PDF & Image → Encode to base64 → Send API request → Poll for completion → Save stamped PDF
    This action allows adding image watermarks/stamps to PDF documents for branding or copyright protection
    """
    
    # API Configuration - PDF4me service for adding image stamps to PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    image_file_path = "pdf4me.png"  # Path to the stamp image file
    output_path = "Add_image_stamp_to_PDF_output.pdf"  # Output PDF file name
    
    # API endpoint for adding image stamps to PDF documents
    url = "https://api.pdf4me.com/api/v2/ImageStamp"

    # Check if the input PDF file exists before proceeding
    if not os.path.exists(pdf_file_path):
        print(f"Error: PDF file not found at {pdf_file_path}")
        return
    if not os.path.exists(image_file_path):
        print(f"Error: Image file not found at {image_file_path}")
        return

    # Read the PDF file and convert it to base64 encoding
    try:
        with open(pdf_file_path, "rb") as f:
            pdf_base64 = base64.b64encode(f.read()).decode("utf-8")
        print(f"Reading PDF: {pdf_file_path}")
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return

    # Read the image file and convert it to base64 encoding
    try:
        with open(image_file_path, "rb") as f:
            image_base64 = base64.b64encode(f.read()).decode("utf-8")
        print(f"Reading image: {image_file_path}")
    except Exception as e:
        print(f"Error reading image: {e}")
        return

    # Prepare the payload (data) to send to the API
    payload = {
        "docContent": pdf_base64,                    # Base64 encoded PDF document content
        "docName": "output.pdf",                     # Output PDF file name
        "alignX": "Center",                          # Horizontal alignment: "Left", "Center", "Right"
        "alignY": "Middle",                          # Vertical alignment: "Top", "Middle", "Bottom"
        "imageFile": image_base64,                   # Base64 encoded image content
        "imageName": os.path.basename(image_file_path),  # Image file name with extension
        "pages": "",                                 # Page options: "", "1", "1,3,5", "2-5", "1,3,7-10", "2-"
        "heightInMM": "30",                          # Image height in millimeters (10-200)
        "widthInMM": "30",                           # Image width in millimeters (10-200)
        "heightInPx": "85",                          # Image height in pixels (20-600)
        "widthInPx": "85",                           # Image width in pixels (20-600)
        "marginXInMM": "10",                         # Horizontal margin in millimeters (0-100)
        "marginYInMM": "10",                         # Vertical margin in millimeters (0-100)
        "marginXInPx": "28",                         # Horizontal margin in pixels (0-300)
        "marginYInPx": "28",                         # Vertical margin in pixels (0-300)
        "opacity": 50,                               # Opacity (0-100): 0=invisible, 100=fully opaque
        "isBackground": True,                        # Place stamp in background/foreground (true/false)
        "showOnlyInPrint": False,                    # Show in view and print (true/false)
        "async": True                                # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",
        "Content-Type": "application/json"
    }

    # Send request
    print("Sending image stamp request...")
    response = requests.post(url, json=payload, headers=headers, verify=False)

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: image stamp addition completed immediately
        print("✓ Success! Image stamp addition completed!")
        
        # Save the stamped PDF file
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

        # Poll the API until image stamp addition is complete
        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            # Check the processing status by calling the polling URL
            response_conversion = requests.get(location_url, headers=headers, verify=False)

            if response_conversion.status_code == 200:
                # 200 - Success: Processing completed
                print("✓ Success! Image stamp addition completed!")
                
                # Save the stamped PDF
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
        print("Timeout: Image stamp addition did not complete after multiple retries")
        
    else:
        print(f"Error: {response.status_code} - {response.text}")

# Main execution
if __name__ == "__main__":
    print("Adding image stamp to PDF...")
    add_image_stamp_to_pdf()
