import os
import base64
import requests
import time
import json

def classify_document():
    """
    Classify or identify documents based on file content using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save classification results
    This action analyzes document content to classify and identify document types and categories
    """
    
    # API Configuration - PDF4me service for classifying documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/" # Replace with your actual API key
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_path = "Classify_document_output.json"  # Output classification results file name
    
    # API endpoint for classifying documents
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/ClassifyDocument"

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
        "docContent": pdf_base64,                                  # Base64 encoded PDF document content
        "docName": "output.pdf",                                   # Source PDF file name with .pdf extension
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print("Sending document classification request to PDF4me API...")
    
    # Make the API request to classify the document
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
        # 200 - Success: document classification completed immediately
        print("✓ Success! Document classification completed!")
        
        # Parse and save the classification results
        try:
            classification_data = response.json()
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(classification_data, f, indent=2, ensure_ascii=False)
            print(f"Classification results saved: {output_path}")
            
            # Display basic classification information
            if isinstance(classification_data, dict):
                print("\nClassification Results:")
                for key, value in classification_data.items():
                    print(f"  {key}: {value}")
        except Exception as e:
            print(f"Error processing classification results: {e}")
            # Save raw response content as fallback
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
        max_retries = 20  # Increased retries for classification processing
        retry_delay = 15   # Increased delay for classification processing

        # Poll the API until document classification is complete
        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            # Check the processing status by calling the polling URL
            try:
                response_classification = requests.get(location_url, headers=headers, verify=False, timeout=60)
                
                print(f"Polling Status Code: {response_classification.status_code}")
                
            except Exception as e:
                print(f"Error polling status: {e}")
                continue

            if response_classification.status_code == 200:
                # 200 - Success: Processing completed
                print("✓ Success! Document classification completed!")
                
                # Parse and save the classification results
                try:
                    classification_data = response_classification.json()
                    with open(output_path, 'w', encoding='utf-8') as f:
                        json.dump(classification_data, f, indent=2, ensure_ascii=False)
                    print(f"Classification results saved: {output_path}")
                    
                    # Display basic classification information
                    if isinstance(classification_data, dict):
                        print("\nClassification Results:")
                        for key, value in classification_data.items():
                            print(f"  {key}: {value}")
                            
                except Exception as e:
                    print(f"Error processing classification results: {e}")
                    # Save raw response content as fallback
                    with open(output_path, "wb") as f:
                        f.write(response_classification.content)
                    print(f"Raw response saved: {output_path}")
                return
                
            elif response_classification.status_code == 202:
                # Still processing, continue polling
                print("Still processing...")
                continue
            else:
                # Error occurred during processing
                print(f"Error during processing: {response_classification.status_code} - {response_classification.text}")
                return

        # If we reach here, polling timed out
        print("Timeout: Document classification did not complete after multiple retries")
        
    else:
        # Other status codes - Error
        print(f"Error: {response.status_code} - {response.text}")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Classifying document...")
    classify_document()
