import base64
import requests
import json
import time
import os

# API Configuration - PDF4me service for creating Swiss QR Bills
api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
pdf_file_path = "sample.pdf"  # Path to the main PDF file
output_path = "sample.swissqr.pdf"  # Output Swiss QR Bill PDF file name

# API endpoint for creating Swiss QR Bills
base_url = "https://api.pdf4me.com/"
url = f"{base_url}api/v2/CreateSwissQrBill"


def read_and_encode_pdf(file_path):
    """
    Read PDF file and convert it to base64 encoding
    Process: Check file existence → Read binary content → Encode to base64
    
    Args:
        file_path (str): Path to the PDF file to be processed
        
    Returns:
        str: Base64 encoded content of the PDF file
        
    Raises:
        FileNotFoundError: If the specified file doesn't exist
        Exception: For any other file reading errors
    """
    # Check if file exists before attempting to read
    if not os.path.exists(file_path):
        print(f"Error: PDF file not found at {file_path}")
        raise FileNotFoundError(f"PDF file not found: {file_path}")
    
    try:
        # Read the PDF file in binary mode
        with open(file_path, 'rb') as pdf_file:
            pdf_content = pdf_file.read()
        
        # Convert binary content to base64 string
        base64_content = base64.b64encode(pdf_content).decode('utf-8')
        print(f"PDF file read successfully: {len(pdf_content)} bytes")
        
        return base64_content
    
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        raise


def create_swiss_qr_bill(base64_content, filename):
    """
    Send PDF to PDF4me API for Swiss QR Bill creation
    Process: Prepare headers → Build payload → Send POST request → Handle response
    
    Args:
        base64_content (str): Base64 encoded PDF content
        filename (str): Name of the source PDF file
        
    Returns:
        dict: API response containing the Swiss QR Bill or processing status
        
    Raises:
        requests.RequestException: For API request errors
        Exception: For other processing errors
    """
    # Prepare headers for the API request
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {api_key}'
    }
    
    # Prepare payload with all required parameters for Swiss QR Bill creation (following C# logic)
    payload = {
        "docContent": base64_content,                              # Base64 encoded PDF content (Required)
        "docName": "test.pdf",                                     # Document name (Required)
        "iban": "CH0200700110003765824",                           # Swiss IBAN for the creditor (Required)
        "crName": "Test AG",                                       # Creditor name (Required)
        "crAddressType": "S",                                      # Creditor address type (S = Structured) (Required)
        "crStreetOrAddressLine1": "Test Strasse",                  # Creditor street (Required)
        "crStreetOrAddressLine2": "1",                             # Creditor street number (Required)
        "crPostalCode": "8000",                                    # Creditor postal code (Required)
        "crCity": "Zurich",                                        # Creditor city (Required)
        "amount": "1000",                                          # Payment amount (Required)
        "currency": "CHF",                                         # Currency (Swiss Franc) (Required)
        "udName": "Test Debt AG",                                  # Ultimate debtor name (Required)
        "udAddressType": "S",                                      # Ultimate debtor address type (Required)
        "udStreetOrAddressLine1": "Test Deb Strasse",              # Ultimate debtor street (Required)
        "udStreetOrAddressLine2": "2",                             # Ultimate debtor street number (Required)
        "udPostalCode": "8000",                                    # Ultimate debtor postal code (Required)
        "udCity": "Zurich",                                        # Ultimate debtor city (Required)
        "referenceType": "NON",                                    # Reference type (NON = No reference) (Required)
        "languageType": "English",                                 # Language for the QR bill (Required)
        "seperatorLine": "LineWithScissor",                        # Separator line style (Required)
        "async": True                                              # Asynchronous processing as requested
    }
    
    print("Sending PDF to PDF4me API for Swiss QR Bill creation...")
    
    try:
        # Send POST request to PDF4me API
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        # Log detailed response information for debugging 
        print(f"Response Status Code: {response.status_code} ({response.reason})")
        print("Response Headers:")
        for header_name, header_value in response.headers.items():
            print(f"  {header_name}: {header_value}")
        
        # Handle different response status codes
        if response.status_code == 200:
            print("Success! Swiss QR Bill created successfully!")
            
            # C# logic: API returns binary PDF content directly for 200 response
            return {"binary_content": response.content, "status": "success"}
        
        elif response.status_code == 202:
            print("Request accepted. Processing asynchronously...")
            
            # Get the polling URL from the Location header for checking status
            location_url = response.headers.get('Location')
            print(f"Location URL: {location_url if location_url else 'NOT FOUND'}")
            
            # Check if response has content before parsing JSON
            if response.text.strip():
                try:
                    return response.json()
                except json.JSONDecodeError:
                    print(f"Response Body (202): {response.text}")
                    return {"jobId": None, "location": location_url, "status": "processing", "raw_response": response.text}
            else:
                print("Empty response body for async request")
                return {"jobId": None, "location": location_url, "status": "processing", "raw_response": ""}
        
        else:
            print(f"Error: {response.status_code} - {response.text}")
            response.raise_for_status()
    
    except requests.Timeout:
        print("Error: Request timeout. The API took too long to respond.")
        raise
    except requests.RequestException as e:
        print(f"API Request Error: {e}")
        raise
    except Exception as e:
        print(f"Unexpected error during Swiss QR Bill creation: {e}")
        raise


def handle_async_response_and_save(api_response, output_filename):
    """
    Handle API response and save the Swiss QR Bill PDF file
    Process: Check response type → Handle sync/async → Save file or poll status
    
    Args:
        api_response (dict): Response from the PDF4me API
        output_filename (str): Name for the output file
        
    Returns:
        bool: True if file was saved successfully, False otherwise
    """
    try:
        # Handle synchronous response (status 200) - Following C# logic
        if 'binary_content' in api_response and api_response.get('status') == 'success':
            print("Processing binary PDF response directly...")
            
            # Save the binary PDF content directly (following C# approach)
            with open(output_filename, 'wb') as output_file:
                output_file.write(api_response['binary_content'])
            
            print(f"Swiss QR Bill PDF saved successfully: {output_filename}")
            print(f"Output file size: {len(api_response['binary_content'])} bytes")
            return True
        
        # Handle asynchronous response (status 202)
        elif 'jobId' in api_response or 'requestId' in api_response or 'location' in api_response:
            print("Handling asynchronous processing...")
            
            # Get job/request ID or location URL for polling
            job_id = api_response.get('jobId') or api_response.get('requestId')
            location_url = api_response.get('location')
            
            if job_id:
                print(f"Job ID: {job_id}")
            if location_url:
                print(f"Polling URL: {location_url}")
            
            # If we have a location URL, implement polling
            if location_url:
                # Prepare headers for polling requests
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f"Basic {api_key}"
                }
                
                # Implement retry logic for async processing (following C# logic)
                max_retries = 10
                retry_delay = 10  # seconds
                
                for attempt in range(max_retries):
                    print(f"Checking job status... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(retry_delay)
                    
                    try:
                        # Poll the location URL for completion
                        status_response = requests.get(location_url, headers=headers, verify=False)
                        print(f"Poll response status: {status_response.status_code} ({status_response.reason})")
                        
                        if status_response.status_code == 200:
                            print("Processing completed!")
                            
                            # Following C# logic: treat polling response as binary PDF content
                            try:
                                # Save the binary PDF content directly from polling response
                                with open(output_filename, 'wb') as output_file:
                                    output_file.write(status_response.content)
                                
                                print(f"Swiss QR Bill PDF saved successfully: {output_filename}")
                                print(f"Output file size: {len(status_response.content)} bytes")
                                return True
                                
                            except Exception as save_error:
                                print(f"Error saving PDF file from polling: {save_error}")
                                return False
                                
                        elif status_response.status_code == 202:
                            print("Still processing...")
                            continue
                        else:
                            print(f"Error during polling: {status_response.status_code} - {status_response.text}")
                            return False
                            
                    except Exception as e:
                        print(f"Error polling status: {e}")
                        continue
                
                print("Timeout: Processing did not complete after multiple retries")
                return False
            else:
                print("No polling URL available for async job")
                print("Check your PDF4me dashboard for the completed file")
                return False
        
        else:
            print("Error: Invalid API response format")
            return False
    
    except Exception as e:
        print(f"Error saving Swiss QR Bill PDF: {e}")
        return False


def main():
    """
    Main orchestrator function that coordinates the entire Swiss QR Bill creation process
    Process: Read PDF → Encode to base64 → Send API request → Handle response → Save Swiss QR Bill PDF
    
    This function:
    1. Reads and encodes the input PDF
    2. Sends it to PDF4me API for Swiss QR Bill creation
    3. Handles the response and saves the Swiss QR Bill PDF file
    """
    try:
        print("Starting Swiss QR Bill Creation Process")
        print("=== Creating Swiss QR Bill ===")
        
        # Generate output filename based on input PDF name (following C# logic)
        output_filename = pdf_file_path.replace('.pdf', '.swissqr.pdf')
        
        print(f"Input PDF: {pdf_file_path}")
        print(f"Output Swiss QR Bill PDF: {output_filename}")
        print("QR Bill Details:")
        print("  Creditor: Test AG, Test Strasse 1, 8000 Zurich")
        print("  Debtor: Test Debt AG, Test Deb Strasse 2, 8000 Zurich")
        print("  Amount: CHF 1000")
        print("  IBAN: CH0200700110003765824")
        print("  Language: English")
        
        # Step 1: Read and encode the PDF file
        print("Reading and encoding PDF file...")
        base64_content = read_and_encode_pdf(pdf_file_path)
        
        # Step 2: Send to API for Swiss QR Bill creation
        print("Processing Swiss QR Bill creation...")
        api_response = create_swiss_qr_bill(base64_content, os.path.basename(pdf_file_path))
        
        # Step 3: Handle response and save Swiss QR Bill file
        print("Processing response and saving file...")
        success = handle_async_response_and_save(api_response, output_filename)
        
        # Final summary
        if success:
            print("Swiss QR Bill creation completed successfully!")
            print(f"Input file: {pdf_file_path}")
            print(f"Swiss QR Bill file: {output_filename}")
            print("Swiss QR Bill has been generated with all payment details")
            print("The QR code contains all necessary information for Swiss banking")
        else:
            print("Swiss QR Bill creation initiated but may require manual checking")
            print("Check your PDF4me dashboard for async job completion")
    
    except Exception as e:
        print(f"Swiss QR Bill creation failed: {e}")
        print("Please check your input file and API configuration")


# Execute the main function when script is run directly
if __name__ == "__main__":
    main()
