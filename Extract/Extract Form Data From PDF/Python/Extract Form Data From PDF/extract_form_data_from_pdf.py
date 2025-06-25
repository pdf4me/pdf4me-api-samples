import os
import base64
import requests
import time
import json

def extract_form_data_from_pdf():
    """
    Extract form data from a PDF document using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save extracted form data
    This action extracts all form field data and values from PDF documents containing fillable forms
    """
    
    # API Configuration - PDF4me service for extracting form data from PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/" # Replace with your actual API key
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_path = "Extract_form_data_output.json"  # Output form data file name
    
    # API endpoint for extracting form data from PDF documents
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/ExtractPdfFormData"

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
        "docName": "output.pdf",                                   # Source PDF file name with .pdf extension
        "docContent": pdf_base64,                                  # Base64 encoded PDF document content
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print("Sending form data extraction request to PDF4me API...")
    
    # Make the API request to extract form data from the PDF
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
        # 200 - Success: form data extraction completed immediately
        print("✓ Success! Form data extraction completed!")
        
        # Save the extracted form data
        try:
            # Check if response is JSON (form data) or binary content
            content_type = response.headers.get('Content-Type', '')
            
            if 'application/json' in content_type:
                # Response contains JSON form data
                form_data = response.json()
                
                # Save form data as JSON
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(form_data, f, indent=2, ensure_ascii=False)
                print(f"Form data saved: {output_path}")
                
                # Display extracted form data summary
                if isinstance(form_data, dict):
                    print("\nExtracted Form Data:")
                    if 'formFields' in form_data:
                        fields = form_data['formFields']
                        print(f"Found {len(fields)} form fields:")
                        for i, field in enumerate(fields[:10]):  # Show first 10 fields
                            field_name = field.get('name', 'Unknown')
                            field_value = field.get('value', 'Empty')
                            field_type = field.get('type', 'Unknown')
                            print(f"  {i+1}. {field_name} ({field_type}): {field_value}")
                        if len(fields) > 10:
                            print(f"  ... and {len(fields) - 10} more fields")
                    else:
                        # Display top-level data if no formFields structure
                        for key, value in list(form_data.items())[:5]:
                            print(f"  {key}: {value}")
                        if len(form_data) > 5:
                            print(f"  ... and {len(form_data) - 5} more entries")
            else:
                # Response is binary content
                with open(output_path.replace('.json', '.bin'), "wb") as f:
                    f.write(response.content)
                print(f"Binary form data saved: {output_path.replace('.json', '.bin')}")
                
        except Exception as e:
            print(f"Error processing extracted form data: {e}")
            # Save raw response content as fallback
            fallback_path = output_path.replace('.json', '_raw.bin')
            with open(fallback_path, "wb") as f:
                f.write(response.content)
            print(f"Raw response saved: {fallback_path}")
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
        max_retries = 15  # Retries for form data extraction processing
        retry_delay = 10   # Delay for form data extraction processing

        # Poll the API until form data extraction is complete
        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            # Check the processing status by calling the polling URL
            try:
                response_extraction = requests.get(location_url, headers=headers, verify=False, timeout=60)
                
                print(f"Polling Status Code: {response_extraction.status_code}")
                
            except Exception as e:
                print(f"Error polling status: {e}")
                continue

            if response_extraction.status_code == 200:
                # 200 - Success: Processing completed
                print("✓ Success! Form data extraction completed!")
                
                # Save the extracted form data
                try:
                    # Check if response is JSON (form data) or binary content
                    content_type = response_extraction.headers.get('Content-Type', '')
                    
                    if 'application/json' in content_type:
                        # Response contains JSON form data
                        form_data = response_extraction.json()
                        
                        # Save form data as JSON
                        with open(output_path, 'w', encoding='utf-8') as f:
                            json.dump(form_data, f, indent=2, ensure_ascii=False)
                        print(f"Form data saved: {output_path}")
                        
                        # Display extracted form data summary
                        if isinstance(form_data, dict):
                            print("\nExtracted Form Data:")
                            if 'formFields' in form_data:
                                fields = form_data['formFields']
                                print(f"Found {len(fields)} form fields:")
                                for i, field in enumerate(fields[:10]):  # Show first 10 fields
                                    field_name = field.get('name', 'Unknown')
                                    field_value = field.get('value', 'Empty')
                                    field_type = field.get('type', 'Unknown')
                                    print(f"  {i+1}. {field_name} ({field_type}): {field_value}")
                                if len(fields) > 10:
                                    print(f"  ... and {len(fields) - 10} more fields")
                            else:
                                # Display top-level data if no formFields structure
                                for key, value in list(form_data.items())[:5]:
                                    print(f"  {key}: {value}")
                                if len(form_data) > 5:
                                    print(f"  ... and {len(form_data) - 5} more entries")
                    else:
                        # Response is binary content
                        with open(output_path.replace('.json', '.bin'), "wb") as f:
                            f.write(response_extraction.content)
                        print(f"Binary form data saved: {output_path.replace('.json', '.bin')}")
                        
                except Exception as e:
                    print(f"Error processing extracted form data: {e}")
                    # Save raw response content as fallback
                    fallback_path = output_path.replace('.json', '_raw.bin')
                    with open(fallback_path, "wb") as f:
                        f.write(response_extraction.content)
                    print(f"Raw response saved: {fallback_path}")
                return
                
            elif response_extraction.status_code == 202:
                # Still processing, continue polling
                print("Still processing...")
                continue
            else:
                # Error occurred during processing
                print(f"Error during processing: {response_extraction.status_code} - {response_extraction.text}")
                return

        # If we reach here, polling timed out
        print("Timeout: Form data extraction did not complete after multiple retries")
        
    else:
        # Other status codes - Error
        print(f"Error: {response.status_code} - {response.text}")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Extracting form data from PDF...")
    extract_form_data_from_pdf()
