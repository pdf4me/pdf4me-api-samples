import os
import base64
import requests
import time

def merge_multiple_pdf_files_into_single_pdf():
    """
    Merge multiple PDF files into single PDF using PDF4me API
    Process: Read PDFs → Encode to base64 → Send API request → Poll for completion → Save merged PDF
    This action combines multiple PDF documents into a single consolidated document
    """
    
    # API Configuration - PDF4me service for merging multiple PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_paths = ["sample1.pdf", "sample2.pdf"]  # List of PDF files to merge
    output_path = "Merged_pdf_output.pdf"  # Output merged PDF file name
    
    # API endpoint for merging PDF documents
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/Merge"

    # Check if all input PDF files exist before proceeding
    for pdf_file in pdf_file_paths:
        if not os.path.exists(pdf_file):
            print(f"Error: PDF file not found at {pdf_file}")
            return

    # Read all PDF files and convert them to base64 encoding
    pdf_contents_base64 = []
    try:
        for pdf_file in pdf_file_paths:
            with open(pdf_file, "rb") as f:
                pdf_content = f.read()
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
            pdf_contents_base64.append(pdf_base64)
            print(f"PDF file read successfully: {pdf_file} ({len(pdf_content)} bytes)")
    except Exception as e:
        print(f"Error reading PDF files: {e}")
        return

    # Prepare the payload (data) to send to the API
    payload = {
        "docContent": pdf_contents_base64,                         # Array of base64 encoded PDF contents
        "docName": os.path.basename(output_path),                  # Output PDF file name
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print("Sending PDF merge request to PDF4me API...")
    
    # Make the API request to merge the PDF files
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False, timeout=300)  # 5 minute timeout
        
        # Log detailed response information for debugging 
        print(f"Response Status Code: {response.status_code} ({response.reason})")
        print("Response Headers:")
        for header_name, header_value in response.headers.items():
            print(f"  {header_name}: {header_value}")
        
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: PDF merging completed immediately
        print("✓ Success! PDF merging completed!")
        
        # Save the merged PDF
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"Merged PDF saved: {output_path}")
        return
        
    elif response.status_code == 202:
        # 202 - Accepted: API is processing the request asynchronously
        print("202 - Request accepted. Processing asynchronously...")
        
        # Get the polling URL from the Location header for checking status
        location_url = response.headers.get('Location')
        print(f"Location URL: {location_url if location_url else 'NOT FOUND'}")
        
        if not location_url:
            print("Error: No polling URL found in response")
            return

        # Retry logic for polling the result
        max_retries = 20
        retry_delay = 10

        # Poll the API until PDF merging is complete
        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            # Check the processing status by calling the polling URL
            try:
                response_conversion = requests.get(location_url, headers=headers, verify=False)
                print(f"Poll response status: {response_conversion.status_code} ({response_conversion.reason})")
            except Exception as e:
                print(f"Error polling status: {e}")
                continue

            if response_conversion.status_code == 200:
                # 200 - Success: Processing completed
                print("✓ Success! PDF merging completed!")
                
                # Save the merged PDF
                with open(output_path, 'wb') as out_file:
                    out_file.write(response_conversion.content)
                print(f"Merged PDF saved: {output_path}")
                return
                
            elif response_conversion.status_code == 202:
                # Still processing, continue polling
                print("Still processing (202)...")
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
    print("Merging multiple PDF files into single PDF...")
    merge_multiple_pdf_files_into_single_pdf()
