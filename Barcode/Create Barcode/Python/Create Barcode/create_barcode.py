import os
import base64
import requests
import time

def create_barcode():
    """
    Create standalone barcode or QR code using PDF4me API
    Process: Send API request with text and barcode type → Poll for completion → Save barcode image
    This action creates compliant barcodes or QR codes as standalone images
    """
    
    # API Configuration - PDF4me service for creating barcodes
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    output_path = "Barcode_create_output.png"  # Output barcode image file name
    
    # API endpoint for creating barcodes
    url = "https://api.pdf4me.com/api/v2/CreateBarcode"

    # Prepare the payload (data) to send to the API
    payload = {
        "text": "PDF4me Create Barcode Sample",            # Text to encode in barcode
        "barcodeType": "qrCode",                         # Barcode types: qrCode, code128, dataMatrix, aztec, hanXin, pdf417, etc.
        "hideText": False,                               # Hide barcode text: true=hide, false=show text alongside barcode
        "async": True                                    # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",              # Authentication using provided API key
        "Content-Type": "application/json"               # Specify that we're sending JSON data
    }

    print("Sending barcode creation request to PDF4me API...")
    
    # Make the API request to create barcode
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: barcode creation completed immediately
        print("✓ Success! Barcode creation completed!")
        
        # Save the barcode image
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

        # Poll the API until barcode creation is complete
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
                print("✓ Success! Barcode creation completed!")
                
                # Save the barcode image
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
    print("Creating barcode...")
    create_barcode()
