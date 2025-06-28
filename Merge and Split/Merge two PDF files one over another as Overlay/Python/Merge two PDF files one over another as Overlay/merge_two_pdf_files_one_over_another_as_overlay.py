import os
import base64
import requests
import time

def merge_two_pdf_files_one_over_another_as_overlay():
    """
    Merge two PDF files one over another as overlay using PDF4me API
    Process: Read PDFs → Encode to base64 → Send API request → Poll for completion → Save overlay PDF
    This action overlays one PDF document on top of another with precision content integration
    """
    
    # API Configuration - PDF4me service for merging PDF documents as overlay
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    base_pdf_file_path = "sample1.pdf"  # Path to the base PDF file (first layer)
    layer_pdf_file_path = "sample2.pdf"  # Path to the layer PDF file (second layer)
    output_path = "Merge_overlay_output.pdf"  # Output overlay PDF file name
    
    # API endpoint for merging PDF documents as overlay
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/MergeOverlay"

    # Check if both input PDF files exist before proceeding
    if not os.path.exists(base_pdf_file_path):
        print(f"Error: Base PDF file not found at {base_pdf_file_path}")
        return
    
    if not os.path.exists(layer_pdf_file_path):
        print(f"Error: Layer PDF file not found at {layer_pdf_file_path}")
        return

    # Read the base PDF file and convert it to base64 encoding
    try:
        with open(base_pdf_file_path, "rb") as f:
            base_pdf_content = f.read()
        base_pdf_base64 = base64.b64encode(base_pdf_content).decode('utf-8')
        print(f"Base PDF file read successfully: {base_pdf_file_path} ({len(base_pdf_content)} bytes)")
    except Exception as e:
        print(f"Error reading base PDF file: {e}")
        return

    # Read the layer PDF file and convert it to base64 encoding
    try:
        with open(layer_pdf_file_path, "rb") as f:
            layer_pdf_content = f.read()
        layer_pdf_base64 = base64.b64encode(layer_pdf_content).decode('utf-8')
        print(f"Layer PDF file read successfully: {layer_pdf_file_path} ({len(layer_pdf_content)} bytes)")
    except Exception as e:
        print(f"Error reading layer PDF file: {e}")
        return

    # Prepare the payload (data) to send to the API
    payload = {
        "baseDocContent": base_pdf_base64,                         # Base64 encoded base PDF content (first layer)
        "baseDocName": os.path.basename(base_pdf_file_path),       # Name of the base PDF file
        "layerDocContent": layer_pdf_base64,                       # Base64 encoded layer PDF content (second layer)
        "layerDocName": os.path.basename(layer_pdf_file_path),     # Name of the layer PDF file
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print("Sending PDF overlay merge request to PDF4me API...")
    
    # Make the API request to merge the PDF files as overlay
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
        # 200 - Success: PDF overlay merging completed immediately
        print("✓ Success! PDF overlay merging completed!")
        
        # Save the overlay merged PDF
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"Overlay merged PDF saved: {output_path}")
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

        # Poll the API until PDF overlay merging is complete
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
                print("✓ Success! PDF overlay merging completed!")
                
                # Save the overlay merged PDF
                with open(output_path, 'wb') as out_file:
                    out_file.write(response_conversion.content)
                print(f"Overlay merged PDF saved: {output_path}")
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
    print("Merging two PDF files one over another as overlay...")
    merge_two_pdf_files_one_over_another_as_overlay()
