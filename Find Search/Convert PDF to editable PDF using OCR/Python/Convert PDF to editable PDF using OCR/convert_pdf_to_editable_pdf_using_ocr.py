import base64
import requests
import json
import time
import os

# API Configuration - PDF4me service for converting PDF to editable PDF using OCR
api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
pdf_file_path = "sample.pdf"  # Path to the input PDF file
output_path = "editable_PDF_output.pdf"  # Output PDF file name

# API endpoint for converting PDF to editable PDF using OCR
base_url = "https://api.pdf4me.com/"
url = f"{base_url}api/v2/ConvertOcrPdf"


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


def convert_pdf_to_editable_ocr(base64_content, filename):
    """
    Send PDF to PDF4me API for OCR conversion to editable PDF
    Process: Prepare headers → Build payload → Send POST request → Handle response
    
    Args:
        base64_content (str): Base64 encoded PDF content
        filename (str): Name of the source PDF file
        
    Returns:
        dict: API response containing the converted file or processing status
        
    Raises:
        requests.RequestException: For API request errors
        Exception: For other processing errors
    """
    # Prepare headers for the API request
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {api_key}'
    }
    
    # Prepare payload with all required parameters for OCR conversion
    payload = {
        "docContent": base64_content,           # Base64 PDF content (Required)
        "docName": filename,                    # Source file name with proper extension (Required)
        "qualityType": "Draft",             
                                               # "Draft" - Suitable for normal PDFs, consumes 1 API call per file
                                               # "High" - Suitable for PDFs from Images and scanned documents, consumes 2 API calls per page
        "ocrWhenNeeded": "true",               # OCR Only When Needed (Required):
                                               # "true" - Skip recognition if text is already searchable
                                               # "false" - Always perform OCR regardless of existing text
        "language": "English",                  # Language (Optional):
                                               # Specify language of text in source file
                                               # Only use if output is not recognizable
                                               # Examples: "English", "Spanish", "French", "German", etc.
        "outputFormat": "true",                # Output Format (Required):
                                               # Must be in string format
                                               # "true" - Standard output format
        "isAsync": True,                       # isAsync (Required):
                                               # Boolean format for asynchronous processing
                                               # True - Process asynchronously (recommended for large files)
                                               # False - Process synchronously
        "mergeAllSheets": True                 # Merge All Sheets (Optional):
                                               # True - Merge all sheets if applicable
                                               # False - Keep sheets separate
    }
    
    print("Sending PDF to PDF4me API for OCR conversion...")
    
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
            print("Success! PDF converted successfully!")
            
            # Check if response has content before parsing JSON
            if response.text.strip():
                try:
                    return response.json()
                except json.JSONDecodeError:
                    print(f"Response Body (200): {response.text}")
                    print("Warning: Response is not valid JSON")
                    return {"docContent": None, "status": "success", "raw_response": response.text}
            else:
                print("Warning: Empty response body")
                return {"docContent": None, "status": "success", "raw_response": ""}
        
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
        print(f"Unexpected error during OCR conversion: {e}")
        raise


def handle_async_response_and_save(api_response, output_filename):
    """
    Handle API response and save the converted editable PDF file
    Process: Check response type → Handle sync/async → Save file or poll status
    
    Args:
        api_response (dict): Response from the PDF4me API
        output_filename (str): Name for the output file
        
    Returns:
        bool: True if file was saved successfully, False otherwise
    """
    try:
        # Handle synchronous response (status 200)
        if 'docContent' in api_response and api_response['docContent']:
            print("Processing synchronous response...")
            
            # Decode base64 content to binary
            decoded_content = base64.b64decode(api_response['docContent'])
            
            # Save the converted PDF file
            with open(output_filename, 'wb') as output_file:
                output_file.write(decoded_content)
            
            print(f"Editable PDF saved successfully: {output_filename}")
            return True
        
        # Handle direct binary PDF content (not wrapped in JSON)
        elif 'raw_response' in api_response and api_response.get('status') == 'success':
            print("Processing direct binary PDF response...")
            
            # Check if it's binary PDF content
            raw_content = api_response['raw_response']
            if isinstance(raw_content, str) and raw_content.startswith('%PDF'):
                # Convert string back to bytes if needed
                try:
                    with open(output_filename, 'wb') as output_file:
                        output_file.write(raw_content.encode('latin1'))
                    
                    print(f"Editable PDF saved successfully: {output_filename}")
                    return True
                except Exception as e:
                    print(f"Error saving direct PDF content: {e}")
                    return False
        
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
                
                # Implement retry logic for async processing
                max_retries = 20
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
                            
                            # Check if response has content
                            if status_response.text.strip():
                                response_text = status_response.text.strip()
                                
                                try:
                                    # First try to parse as JSON
                                    poll_result = status_response.json()
                                    if 'docContent' in poll_result and poll_result['docContent']:
                                        # Decode base64 content to binary from JSON response
                                        decoded_content = base64.b64decode(poll_result['docContent'])
                                        
                                        # Save the converted PDF file
                                        with open(output_filename, 'wb') as output_file:
                                            output_file.write(decoded_content)
                                        
                                        print(f"Editable PDF saved successfully: {output_filename}")
                                        return True
                                    else:
                                        print("No docContent found in JSON response")
                                        return False
                                        
                                except json.JSONDecodeError:
                                    # Response is not JSON, check if it's direct PDF content or base64
                                    
                                    # Check if response starts with PDF header (binary PDF content)
                                    if status_response.content.startswith(b'%PDF'):
                                        print("Response is direct PDF binary content, saving directly...")
                                        
                                        try:
                                            # Save the PDF content directly (it's already binary)
                                            with open(output_filename, 'wb') as output_file:
                                                output_file.write(status_response.content)
                                            
                                            print(f"Editable PDF saved successfully: {output_filename}")
                                            print(f"Output file size: {len(status_response.content)} bytes")
                                            return True
                                            
                                        except Exception as save_error:
                                            print(f"Error saving PDF file: {save_error}")
                                            return False
                                    
                                    else:
                                        # Try to decode as base64 if it's not direct PDF content
                                        print("Response is base64 content, decoding...")
                                        
                                        try:
                                            # Try to decode the response as base64
                                            decoded_content = base64.b64decode(response_text)
                                            
                                            # Save the converted PDF file
                                            with open(output_filename, 'wb') as output_file:
                                                output_file.write(decoded_content)
                                            
                                            print(f"Editable PDF saved successfully: {output_filename}")
                                            print(f"Output file size: {len(decoded_content)} bytes")
                                            return True
                                            
                                        except Exception as base64_error:
                                            print(f"Error decoding base64 content: {base64_error}")
                                            print(f"Response preview: {response_text[:100]}...")
                                            return False
                            else:
                                print("Warning: Empty poll response body")
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
        print(f"Error saving converted PDF: {e}")
        return False


def main():
    """
    Main orchestrator function that coordinates the entire OCR conversion process
    Process: Read PDF → Encode to base64 → Send API request → Handle response → Save output
    
    This function:
    1. Reads and encodes the input PDF
    2. Sends it to PDF4me API for OCR conversion
    3. Handles the response and saves the editable PDF
    """
    try:
        print("Starting PDF to Editable PDF OCR Conversion Process")
        
        # Step 1: Read and encode the PDF file
        print("Reading and encoding PDF file...")
        base64_content = read_and_encode_pdf(pdf_file_path)
        
        # Step 2: Send to API for OCR conversion
        print("Converting PDF using OCR...")
        api_response = convert_pdf_to_editable_ocr(base64_content, os.path.basename(pdf_file_path))
        
        # Step 3: Handle response and save converted file
        print("Processing response and saving file...")
        success = handle_async_response_and_save(api_response, output_path)
        
        # Final summary
        if success:
            print("PDF OCR Conversion completed successfully!")
            print(f"Input file: {pdf_file_path}")
            print(f"Output file: {output_path}")
            print("Your PDF is now editable and searchable!")
        else:
            print("Conversion initiated but may require manual checking")
            print("Check your PDF4me dashboard for async job completion")
    
    except Exception as e:
        print(f"Conversion failed: {e}")
        print("Please check your input file and API configuration")


# Execute the main function when script is run directly
if __name__ == "__main__":
    main()
