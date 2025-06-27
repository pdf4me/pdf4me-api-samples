import os
import base64
import requests
import time
import json

def read_swissqr_code():
    """
    Read Swiss QR codes from PDF documents using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Extract QR data
    This action recognizes Swiss QR code data embedded in PDF documents and returns the structured data
    """
    
    # API Configuration - PDF4me service for reading Swiss QR codes from PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the Swiss QR PDF file
    output_path = "read_swissqr_code_output.json"  # Output file for Swiss QR data
    
    # API endpoint for reading Swiss QR codes from PDF documents
    base_url = "https://api.pdf4me.com"
    url = f"{base_url}/api/v2/ReadSwissQRBill"

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
        "docContent": pdf_base64,                        # Base64 encoded PDF content
        "docName": os.path.basename(pdf_file_path),      # PDF file name
        "async": True                                    # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",              # Authentication using provided API key
        "Content-Type": "application/json"               # Specify that we're sending JSON data
    }

    print("Sending Swiss QR reading request to PDF4me API...")
    
    # Make the API request to read Swiss QR code from the PDF
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: Swiss QR reading completed immediately
        print("✓ Success! Swiss QR reading completed!")
        
        # Parse and save the Swiss QR data
        try:
            swissqr_data = response.json() if response.content else response.text
            
            # Save the Swiss QR data to JSON file
            with open(output_path, "w", encoding='utf-8') as f:
                if isinstance(swissqr_data, dict):
                    json.dump(swissqr_data, f, indent=2, ensure_ascii=False)
                else:
                    f.write(str(swissqr_data))
            
            print(f"Swiss QR data saved: {output_path}")
            
            # Display found Swiss QR data
            if isinstance(swissqr_data, dict):
                print("Swiss QR Code Data:")
                for key, value in swissqr_data.items():
                    print(f"  {key}: {value}")
            else:
                print("Swiss QR data:", swissqr_data)
                
        except Exception as e:
            print(f"Error processing Swiss QR data: {e}")
            # Save raw response as fallback
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"Raw response saved: {output_path}")
        
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
        max_retries = 20
        retry_delay = 10

        # Poll the API until Swiss QR reading is complete
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
                print("✓ Success! Swiss QR reading completed!")
                
                # Parse and save the Swiss QR data
                try:
                    swissqr_data = response_conversion.json() if response_conversion.content else response_conversion.text
                    
                    # Save the Swiss QR data to JSON file
                    with open(output_path, "w", encoding='utf-8') as f:
                        if isinstance(swissqr_data, dict):
                            json.dump(swissqr_data, f, indent=2, ensure_ascii=False)
                        else:
                            f.write(str(swissqr_data))
                    
                    print(f"Swiss QR data saved: {output_path}")
                    
                    # Display found Swiss QR data
                    if isinstance(swissqr_data, dict):
                        print("Swiss QR Code Data:")
                        for key, value in swissqr_data.items():
                            print(f"  {key}: {value}")
                    else:
                        print("Swiss QR data:", swissqr_data)
                        
                except Exception as e:
                    print(f"Error processing Swiss QR data: {e}")
                    # Save raw response as fallback
                    with open(output_path, "wb") as f:
                        f.write(response_conversion.content)
                    print(f"Raw response saved: {output_path}")
                
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
    print("Reading Swiss QR code from PDF...")
    read_swissqr_code()
