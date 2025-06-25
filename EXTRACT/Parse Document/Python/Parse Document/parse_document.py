import os
import base64
import requests
import time
import json

def parse_document():
    """
    Parse documents using PDF4me API with template-based parsing
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save parsed results
    """
    
    # API Configuration
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/" # Replace with your actual API key
    pdf_file_path = "sample.pdf"
    output_path = "parsed_document.txt"
    
    # API endpoint
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/ParseDocument"

    # Check if PDF file exists
    if not os.path.exists(pdf_file_path):
        print(f"Error: PDF file not found at {pdf_file_path}")
        return

    # Read and encode PDF file
    try:
        with open(pdf_file_path, "rb") as f:
            pdf_content = f.read()
        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        print(f"PDF file read successfully: {len(pdf_content)} bytes")
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return

    # Prepare payload
    payload = {
        "docContent": pdf_base64,
        "docName": "output.pdf",
        "async": True
    }

    # Set headers
    headers = {
        "Authorization": f"Basic {api_key}",
        "Content-Type": "application/json"
    }

    print("Sending document parsing request to PDF4me API...")
    
    # Make API request
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False, timeout=300)
        print(f"Response Status Code: {response.status_code} ({response.reason})")
        
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle response
    if response.status_code == 200:
        print("✓ Success! Document parsing completed!")
        
        # Save parsing results
        try:
            parsing_data = response.json()
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write("Document Parsing Results\n")
                f.write("========================\n")
                f.write(f"Parsed on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
                # Extract key fields
                if 'documentType' in parsing_data:
                    f.write(f"Document Type: {parsing_data['documentType']}\n")
                if 'pageCount' in parsing_data:
                    f.write(f"Page Count: {parsing_data['pageCount']}\n")
                
                f.write("\nFull Response:\n")
                f.write(json.dumps(parsing_data, indent=2, ensure_ascii=False))
            
            print(f"Parsing results saved: {output_path}")
            
            # Display basic parsing information
            if isinstance(parsing_data, dict):
                print("\nParsing Results:")
                for key, value in parsing_data.items():
                    if key not in ['docContent', 'docData']:  # Skip large base64 fields
                        print(f"  {key}: {value}")
                        
        except Exception as e:
            print(f"Error processing parsing results: {e}")
            # Save raw response as fallback
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"Raw response saved: {output_path}")
        return
        
    elif response.status_code == 202:
        print("202 - Request accepted. Processing asynchronously...")
        
        # Get polling URL
        location_url = response.headers.get('Location')
        if not location_url:
            print("Error: No polling URL found in response")
            return

        # Polling logic
        max_retries = 15
        retry_delay = 10

        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            try:
                response_parsing = requests.get(location_url, headers=headers, verify=False, timeout=60)
                print(f"Polling Status Code: {response_parsing.status_code}")
                
            except Exception as e:
                print(f"Error polling status: {e}")
                continue

            if response_parsing.status_code == 200:
                print("✓ Success! Document parsing completed!")
                
                # Save parsing results
                try:
                    parsing_data = response_parsing.json()
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write("Document Parsing Results\n")
                        f.write("========================\n")
                        f.write(f"Parsed on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                        
                        # Extract key fields
                        if 'documentType' in parsing_data:
                            f.write(f"Document Type: {parsing_data['documentType']}\n")
                        if 'pageCount' in parsing_data:
                            f.write(f"Page Count: {parsing_data['pageCount']}\n")
                        
                        f.write("\nFull Response:\n")
                        f.write(json.dumps(parsing_data, indent=2, ensure_ascii=False))
                    
                    print(f"Parsing results saved: {output_path}")
                    
                    # Display basic parsing information
                    if isinstance(parsing_data, dict):
                        print("\nParsing Results:")
                        for key, value in parsing_data.items():
                            if key not in ['docContent', 'docData']:  # Skip large base64 fields
                                print(f"  {key}: {value}")
                                
                except Exception as e:
                    print(f"Error processing parsing results: {e}")
                    # Save raw response as fallback
                    with open(output_path, "wb") as f:
                        f.write(response_parsing.content)
                    print(f"Raw response saved: {output_path}")
                return
                
            elif response_parsing.status_code == 202:
                print("Still processing...")
                continue
            else:
                print(f"Error during processing: {response_parsing.status_code} - {response_parsing.text}")
                return

        print("Timeout: Document parsing did not complete after multiple retries")
        
    else:
        print(f"Error: {response.status_code} - {response.text}")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Parsing document...")
    parse_document()
