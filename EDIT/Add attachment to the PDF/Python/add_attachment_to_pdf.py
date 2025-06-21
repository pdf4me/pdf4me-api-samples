import os
import base64
import requests
import time

def add_attachment_to_pdf():
    """
    Add file attachments to a PDF document using PDF4me API
    Process: Read PDF & Attachment → Encode to base64 → Send API request → Poll for completion → Save PDF with attachments
    This action allows attaching files (like .txt, .doc, .jpg, etc.) to PDF documents for additional document management
    """
    
    # API Configuration - PDF4me service for adding file attachments to PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    attachment_file_path = "sample.txt"  # Path to the attachment file
    output_path = "Add_attachment_to_PDF_output.pdf"  # Output PDF file name
    
    # API endpoint for adding attachments to PDF documents
    url = "https://api.pdf4me.com/api/v2/AddAttachmentToPdf"

    # Check if the input PDF file exists before proceeding
    if not os.path.exists(pdf_file_path):
        print(f"Error: PDF file not found at {pdf_file_path}")
        return

    # Check if the attachment file exists before proceeding
    if not os.path.exists(attachment_file_path):
        print(f"Error: Attachment file not found at {attachment_file_path}")
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

    # Read the attachment file and convert it to base64 encoding
    try:
        with open(attachment_file_path, "rb") as f:
            attachment_content = f.read()
        attachment_base64 = base64.b64encode(attachment_content).decode('utf-8')
        print(f"Attachment file read successfully: {len(attachment_content)} bytes")
    except Exception as e:
        print(f"Error reading attachment file: {e}")
        return

    # Prepare the payload (data) to send to the API
    payload = {
        "docName": "output.pdf",                          # Output PDF file name
        "docContent": pdf_base64,                         # Base64 encoded PDF document content
        "attachments": [                                  # Array of attachments to add to the PDF
            {
                "docName": os.path.basename(attachment_file_path),  # Attachment file name with extension
                "docContent": attachment_base64           # Base64 encoded attachment content
            }
        ],
        "async": True                                     # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",              # Authentication using provided API key
        "Content-Type": "application/json"               # Specify that we're sending JSON data
    }

    print("Sending attachment request to PDF4me API...")
    
    # Make the API request to add attachments to the PDF
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: attachment addition completed immediately
        print("✓ Success! Attachment addition completed!")
        
        # Save the PDF with attachments
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"File saved: {output_path}")
        print("📎 To access the attachment, open the PDF in a PDF viewer and look for the attachment panel")
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

        # Poll the API until attachment addition is complete
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
                print("✓ Success! Attachment addition completed!")
                
                # Save the PDF with attachments
                with open(output_path, 'wb') as out_file:
                    out_file.write(response_conversion.content)
                print(f"File saved: {output_path}")
                print("📎 To access the attachment, open the PDF in a PDF viewer and look for the attachment panel")
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
        # Handle API errors
        print(f"Error: {response.status_code} - {response.text}")

# Run the function when script is executed directly
if __name__ == "__main__":
    add_attachment_to_pdf()
