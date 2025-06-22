import os
import base64
import requests
import time
import json

def read_barcode_from_pdf():
    """
    Read barcodes or QR codes from a PDF document using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Extract barcode data
    This action recognizes text embedded in barcodes automatically and returns the data
    """
    
    # API Configuration - PDF4me service for reading barcodes from PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_path = "Read_barcode_output.json"  # Output file for barcode data
    
    # API endpoint for reading barcodes from PDF documents
    url = "https://api.pdf4me.com/api/v2/ReadBarcodes"

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
        "barcodeType": ["all"],                          # Barcode types: ["all"], ["qrCode"], ["dataMatrix"], ["code128"], etc.
        "pages": "all",                                  # Page options: "all", "1", "1,3,5", "2-5", "1,3,7-10", "2-"
        "async": True                                    # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",              # Authentication using provided API key
        "Content-Type": "application/json"               # Specify that we're sending JSON data
    }

    print("Sending barcode reading request to PDF4me API...")
    
    # Make the API request to read barcodes from the PDF
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: barcode reading completed immediately
        print("✓ Success! Barcode reading completed!")
        
        # Parse and save the barcode data
        try:
            barcode_data = response.json() if response.content else response.text
            
            # Save the barcode data to JSON file
            with open(output_path, "w", encoding='utf-8') as f:
                if isinstance(barcode_data, dict):
                    json.dump(barcode_data, f, indent=2, ensure_ascii=False)
                else:
                    f.write(str(barcode_data))
            
            print(f"Barcode data saved: {output_path}")
            
            # Display found barcodes
            if isinstance(barcode_data, dict) and 'barcodes' in barcode_data:
                print(f"Found {len(barcode_data['barcodes'])} barcode(s):")
                for i, barcode in enumerate(barcode_data['barcodes'], 1):
                    print(f"  {i}. Type: {barcode.get('type', 'Unknown')}, Text: {barcode.get('text', 'No text')}")
            else:
                print("Barcode data:", barcode_data)
                
        except Exception as e:
            print(f"Error processing barcode data: {e}")
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
        max_retries = 10
        retry_delay = 10

        # Poll the API until barcode reading is complete
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
                print("✓ Success! Barcode reading completed!")
                
                # Parse and save the barcode data
                try:
                    barcode_data = response_conversion.json() if response_conversion.content else response_conversion.text
                    
                    # Save the barcode data to JSON file
                    with open(output_path, "w", encoding='utf-8') as f:
                        if isinstance(barcode_data, dict):
                            json.dump(barcode_data, f, indent=2, ensure_ascii=False)
                        else:
                            f.write(str(barcode_data))
                    
                    print(f"Barcode data saved: {output_path}")
                    
                    # Display found barcodes
                    if isinstance(barcode_data, dict) and 'barcodes' in barcode_data:
                        print(f"Found {len(barcode_data['barcodes'])} barcode(s):")
                        for i, barcode in enumerate(barcode_data['barcodes'], 1):
                            print(f"  {i}. Type: {barcode.get('type', 'Unknown')}, Text: {barcode.get('text', 'No text')}")
                    else:
                        print("Barcode data:", barcode_data)
                        
                except Exception as e:
                    print(f"Error processing barcode data: {e}")
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
    print("Reading barcodes from PDF...")
    read_barcode_from_pdf()
