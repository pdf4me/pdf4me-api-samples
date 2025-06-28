import os
import base64
import requests
import time
import json

def split_pdf_by_barcode():
    # API Configuration - PDF4me service for splitting PDF by barcode
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample_barcode.pdf"  # Path to the main PDF file
    output_folder = "Split_PDF_Barcode_outputs"  # Output folder for split PDF files
    
    # Check if the input file exists before proceeding
    if not os.path.exists(pdf_file_path):
        print(f"Error: PDF file not found at {pdf_file_path}")
        return

    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"Created output folder: {output_folder}")

    # Read and encode the PDF file to base64 format
    try:
        with open(pdf_file_path, "rb") as f:
            pdf_content = base64.b64encode(f.read()).decode('utf-8')
        print(f"PDF file loaded: {pdf_file_path} (Base64 length: {len(pdf_content)} characters)")
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return

    # API endpoint for splitting PDF by barcode
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/SplitPdfByBarcode_old"
    
    # Request headers with authentication
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {api_key}'
    }
    
    # Request payload with PDF content and barcode split parameters
    payload = {
        "docContent": pdf_content,                                  # Base64 encoded PDF content
        "docName": "output.pdf",                                   # Output PDF file name
        "barcodeString": "Test PDF Barcode",                                  # Barcode string to search for
        "barcodeFilter": "startsWith",                             # Filter type: startsWith, endsWith, contains, exact
        "barcodeType": "any",                                   # Barcode type: any, datamatrix, qrcode, pdf417
        "splitBarcodePage": "after",                              # Split position: before, after, remove
        "combinePagesWithSameConsecutiveBarcodes": False,           # Combine consecutive pages with same barcode
        "pdfRenderDpi": "150",                                     # PDF render DPI
        "async": True                                              # Enable asynchronous processing
    }

    print("Sending PDF barcode split request to PDF4me API...")
    
    # Make the API request to split PDF by barcode
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
        # 200 - Success: PDF splitting completed immediately
        print("✓ Success! PDF barcode splitting completed!")
        print("Parsing API response...")
        
        # Parse JSON response to get split PDF documents
        try:
            split_data = response.json()
            print(f"Response type: {type(split_data)}")
            
            if isinstance(split_data, list):
                print(f"Found {len(split_data)} split PDF documents in response")
                # Handle array of split documents
                for i, document in enumerate(split_data):
                    print(f"Processing document {i+1}...")
                    print(f"Document keys: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                    
                    if isinstance(document, dict) and 'docContent' in document and 'docName' in document:
                        # Decode base64 content and save each PDF
                        base64_content = document['docContent']
                        print(f"Base64 content length: {len(base64_content)} characters")
                        
                        try:
                            pdf_content = base64.b64decode(base64_content)
                            print(f"Decoded PDF content length: {len(pdf_content)} bytes")
                            
                            output_filename = os.path.join(output_folder, document['docName'])
                            
                            with open(output_filename, "wb") as f:
                                f.write(pdf_content)
                            print(f"✓ Split PDF {i+1} saved: {output_filename} ({len(pdf_content)} bytes)")
                            
                        except Exception as decode_error:
                            print(f"Error decoding base64 for document {i+1}: {decode_error}")
                            # Save base64 content as text file for debugging
                            debug_filename = os.path.join(output_folder, f"debug_doc_{i+1}_base64.txt")
                            with open(debug_filename, "w") as f:
                                f.write(base64_content)
                            print(f"Base64 content saved for debugging: {debug_filename}")
                    else:
                        print(f"Document {i+1} missing required fields (docContent/docName)")
                        print(f"Available fields: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                
                print(f"✓ All {len(split_data)} split PDF documents processed in folder: {output_folder}")
            else:
                print("Response is not a list - checking for splitedDocuments structure...")
                if isinstance(split_data, dict) and 'splitedDocuments' in split_data:
                    # Handle splitedDocuments structure
                    print("Found splitedDocuments structure in response")
                    split_documents = split_data['splitedDocuments']
                    
                    if isinstance(split_documents, list) and len(split_documents) > 0:
                        print(f"Found {len(split_documents)} split PDF documents in response")
                        # Handle array of split documents
                        for i, document in enumerate(split_documents):
                            print(f"Processing document {i+1}...")
                            print(f"Document keys: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                            
                            if isinstance(document, dict) and 'streamFile' in document and 'fileName' in document:
                                # Decode base64 content and save each PDF
                                base64_content = document['streamFile']
                                print(f"Base64 content length: {len(base64_content)} characters")
                                
                                try:
                                    pdf_content = base64.b64decode(base64_content)
                                    print(f"Decoded PDF content length: {len(pdf_content)} bytes")
                                    
                                    output_filename = os.path.join(output_folder, document['fileName'])
                                    
                                    with open(output_filename, "wb") as f:
                                        f.write(pdf_content)
                                    print(f"✓ Split PDF {i+1} saved: {output_filename} ({len(pdf_content)} bytes)")
                                    
                                except Exception as decode_error:
                                    print(f"Error decoding base64 for document {i+1}: {decode_error}")
                                    # Save base64 content as text file for debugging
                                    debug_filename = os.path.join(output_folder, f"debug_doc_{i+1}_base64.txt")
                                    with open(debug_filename, "w") as f:
                                        f.write(base64_content)
                                    print(f"Base64 content saved for debugging: {debug_filename}")
                            else:
                                print(f"Document {i+1} missing required fields (streamFile/fileName)")
                                print(f"Available fields: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                        
                        print(f"✓ All {len(split_documents)} split PDF documents processed in folder: {output_folder}")
                    else:
                        print("splitedDocuments is empty or not a list")
                        with open(f"{output_folder}/raw_response.json", "w") as f:
                            json.dump(split_data, f, indent=2)
                        print(f"Raw JSON response saved to: {output_folder}/raw_response.json")
                
                elif isinstance(split_data, dict) and 'docContent' in split_data and 'docName' in split_data:
                    # Handle single document response
                    print("Found single document in response")
                    base64_content = split_data['docContent']
                    pdf_content = base64.b64decode(base64_content)
                    output_filename = os.path.join(output_folder, split_data['docName'])
                    
                    with open(output_filename, "wb") as f:
                        f.write(pdf_content)
                    print(f"✓ Single PDF saved: {output_filename} ({len(pdf_content)} bytes)")
                else:
                    print("Unexpected response format - saving raw response for analysis")
                    with open(f"{output_folder}/raw_response.json", "w") as f:
                        json.dump(split_data, f, indent=2)
                    print(f"Raw JSON response saved to: {output_folder}/raw_response.json")
                    
        except Exception as e:
            print(f"Error parsing split PDF documents: {e}")
            # Save raw response as fallback
            with open(f"{output_folder}/raw_response.bin", "wb") as f:
                f.write(response.content)
            print(f"Raw response saved to: {output_folder}/raw_response.bin")
        
        return
        
    elif response.status_code == 202:
        # 202 - Accepted: API is processing the request asynchronously
        print("202 - Request accepted. Processing asynchronously...")
        
        # Get the polling URL from the Location header for checking status
        location_url = response.headers.get('Location')
        print(f"Location URL: {location_url if location_url else 'NOT FOUND'}")
        
        if not location_url:
            print("Error: No polling URL found in response")
            return

        # Retry logic for polling the result
        max_retries = 20
        retry_delay = 10

        # Poll the API until PDF barcode splitting is complete
        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            # Check the processing status by calling the polling URL
            try:
                response_split = requests.get(location_url, headers=headers, verify=False)
                print(f"Poll response status: {response_split.status_code} ({response_split.reason})")
            except Exception as e:
                print(f"Error polling status: {e}")
                continue

            if response_split.status_code == 200:
                # 200 - Success: Processing completed
                print("✓ Success! PDF barcode splitting completed!")
                
                # Parse JSON response to get split PDF documents
                try:
                    print("Parsing polling response...")
                    split_data = response_split.json()
                    print(f"Response type: {type(split_data)}")
                    
                    if isinstance(split_data, list):
                        print(f"Found {len(split_data)} split PDF documents in response")
                        # Handle array of split documents
                        for i, document in enumerate(split_data):
                            print(f"Processing document {i+1}...")
                            print(f"Document keys: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                            
                            if isinstance(document, dict) and 'docContent' in document and 'docName' in document:
                                # Decode base64 content and save each PDF
                                base64_content = document['docContent']
                                print(f"Base64 content length: {len(base64_content)} characters")
                                
                                try:
                                    pdf_content = base64.b64decode(base64_content)
                                    print(f"Decoded PDF content length: {len(pdf_content)} bytes")
                                    
                                    output_filename = os.path.join(output_folder, document['docName'])
                                    
                                    with open(output_filename, "wb") as f:
                                        f.write(pdf_content)
                                    print(f"✓ Split PDF {i+1} saved: {output_filename} ({len(pdf_content)} bytes)")
                                    
                                except Exception as decode_error:
                                    print(f"Error decoding base64 for document {i+1}: {decode_error}")
                                    # Save base64 content as text file for debugging
                                    debug_filename = os.path.join(output_folder, f"debug_doc_{i+1}_base64.txt")
                                    with open(debug_filename, "w") as f:
                                        f.write(base64_content)
                                    print(f"Base64 content saved for debugging: {debug_filename}")
                            else:
                                print(f"Document {i+1} missing required fields (docContent/docName)")
                                print(f"Available fields: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                        
                        print(f"✓ All {len(split_data)} split PDF documents processed in folder: {output_folder}")
                    else:
                        print("Response is not a list - checking for splitedDocuments structure...")
                        if isinstance(split_data, dict) and 'splitedDocuments' in split_data:
                            # Handle splitedDocuments structure
                            print("Found splitedDocuments structure in response")
                            split_documents = split_data['splitedDocuments']
                            
                            if isinstance(split_documents, list) and len(split_documents) > 0:
                                print(f"Found {len(split_documents)} split PDF documents in response")
                                # Handle array of split documents
                                for i, document in enumerate(split_documents):
                                    print(f"Processing document {i+1}...")
                                    print(f"Document keys: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                                    
                                    if isinstance(document, dict) and 'streamFile' in document and 'fileName' in document:
                                        # Decode base64 content and save each PDF
                                        base64_content = document['streamFile']
                                        print(f"Base64 content length: {len(base64_content)} characters")
                                        
                                        try:
                                            pdf_content = base64.b64decode(base64_content)
                                            print(f"Decoded PDF content length: {len(pdf_content)} bytes")
                                            
                                            output_filename = os.path.join(output_folder, document['fileName'])
                                            
                                            with open(output_filename, "wb") as f:
                                                f.write(pdf_content)
                                            print(f"✓ Split PDF {i+1} saved: {output_filename} ({len(pdf_content)} bytes)")
                                            
                                        except Exception as decode_error:
                                            print(f"Error decoding base64 for document {i+1}: {decode_error}")
                                            # Save base64 content as text file for debugging
                                            debug_filename = os.path.join(output_folder, f"debug_doc_{i+1}_base64.txt")
                                            with open(debug_filename, "w") as f:
                                                f.write(base64_content)
                                            print(f"Base64 content saved for debugging: {debug_filename}")
                                    else:
                                        print(f"Document {i+1} missing required fields (streamFile/fileName)")
                                        print(f"Available fields: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                                
                                print(f"✓ All {len(split_documents)} split PDF documents processed in folder: {output_folder}")
                            else:
                                print("splitedDocuments is empty or not a list")
                                with open(f"{output_folder}/raw_response.json", "w") as f:
                                    json.dump(split_data, f, indent=2)
                                print(f"Raw JSON response saved to: {output_folder}/raw_response.json")
                        
                        elif isinstance(split_data, dict) and 'docContent' in split_data and 'docName' in split_data:
                            # Handle single document response
                            print("Found single document in response")
                            base64_content = split_data['docContent']
                            pdf_content = base64.b64decode(base64_content)
                            output_filename = os.path.join(output_folder, split_data['docName'])
                            
                            with open(output_filename, "wb") as f:
                                f.write(pdf_content)
                            print(f"✓ Single PDF saved: {output_filename} ({len(pdf_content)} bytes)")
                        else:
                            print("Unexpected response format - saving raw response for analysis")
                            with open(f"{output_folder}/raw_response.json", "w") as f:
                                json.dump(split_data, f, indent=2)
                            print(f"Raw JSON response saved to: {output_folder}/raw_response.json")
                            
                except Exception as e:
                    print(f"Error parsing split PDF documents: {e}")
                    # Save raw response as fallback
                    with open(f"{output_folder}/raw_response.bin", "wb") as f:
                        f.write(response_split.content)
                    print(f"Raw response saved to: {output_folder}/raw_response.bin")
                
                return
                
            elif response_split.status_code == 202:
                # Still processing, continue polling
                print("Still processing (202)...")
                continue
            else:
                # Error occurred during processing
                print(f"Error during processing: {response_split.status_code} - {response_split.text}")
                return

        # If we reach here, polling timed out
        print("Timeout: Processing did not complete after multiple retries")
        
    else:
        # Other status codes - Error
        print(f"Error: {response.status_code} - {response.text}")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Splitting PDF by barcode...")
    split_pdf_by_barcode()
