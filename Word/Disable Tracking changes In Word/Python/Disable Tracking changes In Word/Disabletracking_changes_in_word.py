import base64
import requests
import json
import time
import os

# API Configuration - PDF4me service for disabling tracking changes in Word documents
api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
docx_file_path = "sample.docx"  # Path to the main Word document file
output_path = "sample.tracking_disabled.docx"  # Output Word document file name

# API endpoint for disabling tracking changes in Word documents
base_url = "https://api.pdf4me.com/"
url = f"{base_url}api/v2/DisableTrackingChangesInWord"


def read_and_encode_docx(file_path):
    """
    Read Word document file and convert it to base64 encoding
    Process: Check file existence → Read binary content → Encode to base64
    
    Args:
        file_path (str): Path to the Word document file to be processed
        
    Returns:
        str: Base64 encoded content of the Word document file
        
    Raises:
        FileNotFoundError: If the specified file doesn't exist
        Exception: For any other file reading errors
    """
    # Check if file exists before attempting to read
    if not os.path.exists(file_path):
        print(f"Error: Word document file not found at {file_path}")
        raise FileNotFoundError(f"Word document file not found: {file_path}")
    
    try:
        # Read the Word document file in binary mode
        with open(file_path, 'rb') as docx_file:
            docx_content = docx_file.read()
        
        # Convert binary content to base64 string
        base64_content = base64.b64encode(docx_content).decode('utf-8')
        print(f"Word document file read successfully: {len(docx_content)} bytes")
        
        return base64_content
    
    except Exception as e:
        print(f"Error reading Word document file: {e}")
        raise


def disable_tracking_changes_in_word(base64_content, filename):
    """
    Send Word document to PDF4me API for disabling tracking changes
    Process: Prepare headers → Build payload → Send POST request → Handle response
    
    Args:
        base64_content (str): Base64 encoded Word document content
        filename (str): Name of the source Word document file
        
    Returns:
        dict: API response containing the processed file or processing status
        
    Raises:
        requests.RequestException: For API request errors
        Exception: For other processing errors
    """
    # Prepare headers for the API request
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {api_key}'
    }
    
    # Prepare payload with all required parameters for disabling tracking changes (following C# logic)
    payload = {
        "docName": "output.docx",                                  # Output document name (Required)
        "docContent": base64_content,                              # Base64 encoded Word document content (Required)
        "async": True                                              # Asynchronous processing as requested
    }
    
    print("Sending Word document to PDF4me API for disabling tracking changes...")
    
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
            print("Success! Tracking changes disabled in Word document successfully!")
            
            # C# logic: API returns binary Word document content directly for 200 response
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
        print(f"Unexpected error during tracking changes disable: {e}")
        raise


def handle_async_response_and_save(api_response, output_filename):
    """
    Handle API response and save the processed Word document file
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
            print("Processing binary Word document response directly...")
            
            # Save the binary Word document content directly (following C# approach)
            with open(output_filename, 'wb') as output_file:
                output_file.write(api_response['binary_content'])
            
            print(f"Processed Word document saved successfully: {output_filename}")
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
                            
                            # Following C# logic: treat polling response as binary Word document content
                            try:
                                # Save the binary Word document content directly from polling response
                                with open(output_filename, 'wb') as output_file:
                                    output_file.write(status_response.content)
                                
                                print(f"Processed Word document saved successfully: {output_filename}")
                                print(f"Output file size: {len(status_response.content)} bytes")
                                return True
                                
                            except Exception as save_error:
                                print(f"Error saving Word document file from polling: {save_error}")
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
        print(f"Error saving processed Word document: {e}")
        return False


def main():
    """
    Main orchestrator function that coordinates the entire tracking changes disable process
    Process: Read Word document → Encode to base64 → Send API request → Handle response → Save processed document
    
    This function:
    1. Reads and encodes the input Word document
    2. Sends it to PDF4me API for disabling tracking changes
    3. Handles the response and saves the processed Word document file
    """
    try:
        print("Starting Word Document Tracking Changes Disable Process")
        print("=== Disabling Tracking Changes in Word Document ===")
        
        # Generate output filename based on input document name (following C# logic)
        output_filename = docx_file_path.replace('.docx', '.tracking_disabled.docx')
        
        print(f"Input Word document: {docx_file_path}")
        print(f"Output processed document: {output_filename}")
        print("Operation: Disable tracking changes")
        
        # Step 1: Read and encode the Word document file
        print("Reading and encoding Word document file...")
        base64_content = read_and_encode_docx(docx_file_path)
        
        # Step 2: Send to API for disabling tracking changes
        print("Processing tracking changes disable...")
        api_response = disable_tracking_changes_in_word(base64_content, os.path.basename(docx_file_path))
        
        # Step 3: Handle response and save processed file
        print("Processing response and saving file...")
        success = handle_async_response_and_save(api_response, output_filename)
        
        # Final summary
        if success:
            print("Tracking changes disable completed successfully!")
            print(f"Input file: {docx_file_path}")
            print(f"Processed file: {output_filename}")
            print("Word document tracking changes have been disabled")
            print("The processed document no longer shows tracked changes")
        else:
            print("Tracking changes disable initiated but may require manual checking")
            print("Check your PDF4me dashboard for async job completion")
    
    except Exception as e:
        print(f"Tracking changes disable failed: {e}")
        print("Please check your input file and API configuration")


# Execute the main function when script is run directly
if __name__ == "__main__":
    main()
