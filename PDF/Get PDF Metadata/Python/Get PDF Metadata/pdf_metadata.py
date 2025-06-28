import base64
import requests
import json
import time
import os

# API Configuration - PDF4me service for extracting PDF metadata
api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
pdf_file_path = "sample.pdf"  # Path to the input PDF file
output_path = "sample.metadata.json"  # Output JSON metadata file name

# API endpoint for extracting PDF metadata
base_url = "https://api.pdf4me.com/"
url = f"{base_url}api/v2/GetPdfMetadata"


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


def extract_pdf_metadata(base64_content, filename):
    """
    Send PDF to PDF4me API for metadata extraction
    Process: Prepare headers → Build payload → Send POST request → Handle response
    
    Args:
        base64_content (str): Base64 encoded PDF content
        filename (str): Name of the source PDF file
        
    Returns:
        dict: API response containing the metadata or processing status
        
    Raises:
        requests.RequestException: For API request errors
        Exception: For other processing errors
    """
    # Prepare headers for the API request
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {api_key}'
    }
    
    # Prepare payload with all required parameters for metadata extraction (following C# logic)
    payload = {
        "docContent": base64_content,               # Base64 encoded PDF content (Required)
        "docName": "output.pdf",                    # Output document name (Required)
        "async": True                               # Asynchronous processing as requested
    }
    
    print("Sending PDF to PDF4me API for metadata extraction...")
    
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
            print("Success! PDF metadata extracted successfully!")
            
            # C# logic: API returns JSON metadata directly for 200 response
            try:
                metadata_json = response.json()
                return {"metadata_content": metadata_json, "status": "success"}
            except json.JSONDecodeError:
                # If not JSON, treat as text response
                return {"metadata_content": response.text, "status": "success"}
        
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
        print(f"Unexpected error during metadata extraction: {e}")
        raise


def handle_async_response_and_save(api_response, output_filename):
    """
    Handle API response and save the extracted metadata JSON file
    Process: Check response type → Handle sync/async → Save JSON or poll status
    
    Args:
        api_response (dict): Response from the PDF4me API
        output_filename (str): Name for the output JSON file
        
    Returns:
        bool: True if file was saved successfully, False otherwise
    """
    try:
        # Handle synchronous response (status 200) - Following C# logic
        if 'metadata_content' in api_response and api_response.get('status') == 'success':
            print("Processing metadata JSON response directly...")
            
            # Save the metadata JSON content (following C# approach)
            with open(output_filename, 'w', encoding='utf-8') as output_file:
                if isinstance(api_response['metadata_content'], dict):
                    json.dump(api_response['metadata_content'], output_file, indent=2, ensure_ascii=False)
                else:
                    output_file.write(str(api_response['metadata_content']))
            
            print(f"PDF metadata saved successfully: {output_filename}")
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
                            
                            # Following C# logic: treat polling response as JSON metadata
                            try:
                                # Save the JSON metadata content directly from polling response
                                metadata_json = status_response.json()
                                with open(output_filename, 'w', encoding='utf-8') as output_file:
                                    json.dump(metadata_json, output_file, indent=2, ensure_ascii=False)
                                
                                print(f"PDF metadata saved successfully: {output_filename}")
                                return True
                                
                            except json.JSONDecodeError:
                                # If not JSON, save as text
                                with open(output_filename, 'w', encoding='utf-8') as output_file:
                                    output_file.write(status_response.text)
                                
                                print(f"PDF metadata saved successfully: {output_filename}")
                                return True
                                
                            except Exception as save_error:
                                print(f"Error saving metadata file from polling: {save_error}")
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
        print(f"Error saving metadata file: {e}")
        return False


def main():
    """
    Main orchestrator function that coordinates the entire PDF metadata extraction process
    Process: Read PDF → Encode to base64 → Send API request → Handle response → Save metadata JSON
    
    This function:
    1. Reads and encodes the input PDF
    2. Sends it to PDF4me API for metadata extraction
    3. Handles the response and saves the metadata JSON file
    """
    try:
        print("Starting PDF Metadata Extraction Process")
        
        # Generate output filename based on input PDF name (following C# logic)
        output_filename = pdf_file_path.replace('.pdf', '.metadata.json')
        
        print(f"Input PDF: {pdf_file_path}")
        print(f"Output metadata file: {output_filename}")
        
        # Step 1: Read and encode the PDF file
        print("Reading and encoding PDF file...")
        base64_content = read_and_encode_pdf(pdf_file_path)
        
        # Step 2: Send to API for metadata extraction
        print("Processing metadata extraction...")
        api_response = extract_pdf_metadata(base64_content, os.path.basename(pdf_file_path))
        
        # Step 3: Handle response and save metadata file
        print("Processing response and saving metadata...")
        success = handle_async_response_and_save(api_response, output_filename)
        
        # Final summary
        if success:
            print("PDF metadata extraction completed successfully!")
            print(f"Input file: {pdf_file_path}")
            print(f"Metadata file: {output_filename}")
            print("PDF metadata has been extracted and saved as JSON")
        else:
            print("PDF metadata extraction initiated but may require manual checking")
            print("Check your PDF4me dashboard for async job completion")
    
    except Exception as e:
        print(f"PDF metadata extraction failed: {e}")
        print("Please check your input file and API configuration")


# Execute the main function when script is run directly
if __name__ == "__main__":
    main()
