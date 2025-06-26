import base64
import requests
import json
import time
import os

# API Configuration - PDF4me service for filling PDF forms
api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
pdf_file_path = "sample.pdf"  # Path to the PDF file with form fields
output_path = "fill_PDF_form_output.pdf"  # Output PDF file name

# API endpoint for filling PDF forms
base_url = "https://api.pdf4me.com/"
url = f"{base_url}api/v2/FillPdfForm"


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


def fill_pdf_form(base64_content, filename, form_data):
    """
    Send PDF to PDF4me API for filling form fields
    Process: Prepare headers → Build payload → Send POST request → Handle response
    
    Args:
        base64_content (str): Base64 encoded PDF content
        filename (str): Name of the source PDF file
        form_data (dict): Form field data to fill in the PDF
        
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
    
    # Create form fields array from form data (following C# logic)
    input_form_data = []
    for field_name, field_value in form_data.items():
        input_form_data.append({
            "fieldName": field_name,
            "fieldValue": field_value
        })
    
    # Prepare payload with all required parameters for filling PDF forms
    payload = {
        "templateDocName": filename,                # Template document name (Required)
        "templateDocContent": base64_content,       # Base64 PDF content (Required)
        "dataArray": json.dumps(form_data),         # JSON data array with form field values (Required)
        "outputType": "pdf",                        # Output type - must be pdf (Required)
        "inputDataType": "json",                    # Input data type - json format (Required)
        "metaData": "",                             # Additional metadata (Optional)
        "metaDataJson": "",                         # Additional JSON metadata (Optional)
        "InputFormData": input_form_data,           # Array of form field objects (Required)
        "async": True                               # Asynchronous processing as requested
    }
    
    print("Sending PDF to PDF4me API for filling form fields...")
    
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
            print("Success! PDF form filled successfully!")
            
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
        print(f"Unexpected error during PDF form filling: {e}")
        raise


def handle_async_response_and_save(api_response, output_filename):
    """
    Handle API response and save the processed PDF file
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
            
            print(f"Filled PDF form saved successfully: {output_filename}")
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
                            
                            # Following C# logic: treat polling response as binary PDF content
                            try:
                                # Save the binary PDF content directly from polling response
                                with open(output_filename, 'wb') as output_file:
                                    output_file.write(status_response.content)
                                
                                print(f"Filled PDF form saved successfully: {output_filename}")
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
        print(f"Error saving processed PDF: {e}")
        return False


def main():
    """
    Main orchestrator function that coordinates the entire PDF form filling process
    Process: Read PDF → Encode to base64 → Send API request → Handle response → Save output
    
    This function:
    1. Reads and encodes the input PDF
    2. Sends it to PDF4me API for filling form fields
    3. Handles the response and saves the processed PDF
    """
    try:
        print("Starting PDF Form Filling Process")
        
        # Configure form field data to fill (following C# example)
        form_data = {
            "firstname": "John",                    # First name field value
            "lastname": "Adams",                    # Last name field value
            "gender": "Male",                     # Gender field value
        }
        
        print("Form data to fill:")
        for field_name, field_value in form_data.items():
            print(f"  {field_name}: {field_value}")
        
        # Step 1: Read and encode the PDF file
        print("Reading and encoding PDF file...")
        base64_content = read_and_encode_pdf(pdf_file_path)
        
        # Step 2: Send to API for filling form fields
        print("Processing PDF form filling...")
        api_response = fill_pdf_form(base64_content, os.path.basename(pdf_file_path), form_data)
        
        # Step 3: Handle response and save processed file
        print("Processing response and saving file...")
        success = handle_async_response_and_save(api_response, output_path)
        
        # Final summary
        if success:
            print("PDF form filling completed successfully!")
            print(f"Input file: {pdf_file_path}")
            print(f"Output file: {output_path}")
            print(f"Filled {len(form_data)} form fields")
        else:
            print("PDF form filling initiated but may require manual checking")
            print("Check your PDF4me dashboard for async job completion")
    
    except Exception as e:
        print(f"PDF form filling failed: {e}")
        print("Please check your input file and API configuration")


# Execute the main function when script is run directly
if __name__ == "__main__":
    main()
