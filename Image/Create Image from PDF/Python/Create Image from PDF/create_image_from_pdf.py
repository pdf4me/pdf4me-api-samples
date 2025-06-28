import os
import base64
import requests
import time
import json

def create_image_from_pdf():
    """
    Create images from PDF pages using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save converted images
    This action allows converting PDF pages to images with control over format, size, and page selection
    """
    
    # API Configuration - PDF4me service for creating images from PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_folder = "PDF_to_Images_outputs"  # Output folder for converted images
    
    # API endpoint for creating images from PDF documents
    url = "https://api.pdf4me.com/api/v2/CreateImages"

    # Check if the input file exists before proceeding
    if not os.path.exists(pdf_file_path):
        print(f"Error: PDF file not found at {pdf_file_path}")
        return

    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"Created output folder: {output_folder}")

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
        "docContent": pdf_base64,                                  # Base64 encoded PDF content
        "docname": os.path.basename(pdf_file_path),                # Name of the input PDF file
        "imageAction": {
            "WidthPixel": "800",                                   # Width of the output image in pixels
            "ImageExtension": "jpeg",                              # Output format: jpg, jpeg, bmp, gif, jb2, jp2, jpf, jpx, png, tif, tiff
            "PageSelection": {
                "PageNrs": [1, 2, 3]                              # Array of page numbers to convert (1-based indexing)
            }
        },
        "pageNrs": "1-2",                                          # Page range as string (e.g., "1", "1,3,5", "2-5", "1,3,7-10", "2-")
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print("Sending PDF to image conversion request to PDF4me API...")
    
    # Make the API request to create images from PDF
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
        # 200 - Success: PDF to image conversion completed immediately
        print("✓ Success! PDF to image conversion completed!")
        
        # Parse JSON response to get converted images array
        try:
            print("Parsing API response...")
            image_data = response.json()
            print(f"Response type: {type(image_data)}")
            
            if isinstance(image_data, list):
                print(f"Found {len(image_data)} converted images in response")
                # Handle array of converted images
                for i, document in enumerate(image_data):
                    print(f"Processing image {i+1}...")
                    print(f"Document keys: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                    
                    if isinstance(document, dict) and 'docContent' in document and 'docName' in document:
                        # Decode base64 content and save each image
                        base64_content = document['docContent']
                        print(f"Base64 content length: {len(base64_content)} characters")
                        
                        try:
                            image_content = base64.b64decode(base64_content)
                            print(f"Decoded image content length: {len(image_content)} bytes")
                            
                            output_filename = os.path.join(output_folder, document['docName'])
                            
                            with open(output_filename, "wb") as f:
                                f.write(image_content)
                            print(f"✓ Converted image {i+1} saved: {output_filename} ({len(image_content)} bytes)")
                            
                        except Exception as decode_error:
                            print(f"Error decoding base64 for image {i+1}: {decode_error}")
                            # Save base64 content as text file for debugging
                            debug_filename = os.path.join(output_folder, f"debug_img_{i+1}_base64.txt")
                            with open(debug_filename, "w") as f:
                                f.write(base64_content)
                            print(f"Base64 content saved for debugging: {debug_filename}")
                    else:
                        print(f"Image {i+1} missing required fields (docContent/docName)")
                        print(f"Available fields: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                
                print(f"✓ All {len(image_data)} converted images processed in folder: {output_folder}")
            else:
                print("Response is not a list - checking for outputDocuments structure...")
                if isinstance(image_data, dict) and 'outputDocuments' in image_data:
                    # Handle outputDocuments structure
                    print("Found outputDocuments structure in response")
                    output_documents = image_data['outputDocuments']
                    
                    if isinstance(output_documents, list) and len(output_documents) > 0:
                        print(f"Found {len(output_documents)} converted images in response")
                        # Handle array of converted images
                        for i, document in enumerate(output_documents):
                            print(f"Processing image {i+1}...")
                            print(f"Document keys: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                            
                            if isinstance(document, dict) and 'streamFile' in document and 'fileName' in document:
                                # Decode base64 content and save each image
                                base64_content = document['streamFile']
                                print(f"Base64 content length: {len(base64_content)} characters")
                                
                                try:
                                    image_content = base64.b64decode(base64_content)
                                    print(f"Decoded image content length: {len(image_content)} bytes")
                                    
                                    output_filename = os.path.join(output_folder, document['fileName'])
                                    
                                    with open(output_filename, "wb") as f:
                                        f.write(image_content)
                                    print(f"✓ Converted image {i+1} saved: {output_filename} ({len(image_content)} bytes)")
                                    
                                except Exception as decode_error:
                                    print(f"Error decoding base64 for image {i+1}: {decode_error}")
                                    # Save base64 content as text file for debugging
                                    debug_filename = os.path.join(output_folder, f"debug_img_{i+1}_base64.txt")
                                    with open(debug_filename, "w") as f:
                                        f.write(base64_content)
                                    print(f"Base64 content saved for debugging: {debug_filename}")
                            else:
                                print(f"Image {i+1} missing required fields (streamFile/fileName)")
                                print(f"Available fields: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                        
                        print(f"✓ All {len(output_documents)} converted images processed in folder: {output_folder}")
                    else:
                        print("outputDocuments is empty or not a list")
                        with open(f"{output_folder}/raw_response.json", "w") as f:
                            json.dump(image_data, f, indent=2)
                        print(f"Raw JSON response saved to: {output_folder}/raw_response.json")
                
                elif isinstance(image_data, dict) and 'docContent' in image_data and 'docName' in image_data:
                    # Handle single image response (legacy format)
                    print("Found single image in response")
                    base64_content = image_data['docContent']
                    image_content = base64.b64decode(base64_content)
                    output_filename = os.path.join(output_folder, image_data['docName'])
                    
                    with open(output_filename, "wb") as f:
                        f.write(image_content)
                    print(f"✓ Single image saved: {output_filename} ({len(image_content)} bytes)")
                else:
                    print("Unexpected response format - saving raw response for analysis")
                    with open(f"{output_folder}/raw_response.json", "w") as f:
                        json.dump(image_data, f, indent=2)
                    print(f"Raw JSON response saved to: {output_folder}/raw_response.json")
                    
        except Exception as e:
            print(f"Error parsing converted images: {e}")
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

        # Poll the API until PDF to image conversion is complete
        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            # Check the processing status by calling the polling URL
            try:
                response_conversion = requests.get(location_url, headers=headers, verify=False)
                print(f"Poll response status: {response_conversion.status_code} ({response_conversion.reason})")
            except Exception as e:
                print(f"Error polling status: {e}")
                continue

            if response_conversion.status_code == 200:
                # 200 - Success: Processing completed
                print("✓ Success! PDF to image conversion completed!")
                
                # Parse JSON response to get converted images array
                try:
                    print("Parsing polling response...")
                    image_data = response_conversion.json()
                    print(f"Response type: {type(image_data)}")
                    
                    if isinstance(image_data, list):
                        print(f"Found {len(image_data)} converted images in response")
                        # Handle array of converted images
                        for i, document in enumerate(image_data):
                            print(f"Processing image {i+1}...")
                            print(f"Document keys: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                            
                            if isinstance(document, dict) and 'docContent' in document and 'docName' in document:
                                # Decode base64 content and save each image
                                base64_content = document['docContent']
                                print(f"Base64 content length: {len(base64_content)} characters")
                                
                                try:
                                    image_content = base64.b64decode(base64_content)
                                    print(f"Decoded image content length: {len(image_content)} bytes")
                                    
                                    output_filename = os.path.join(output_folder, document['docName'])
                                    
                                    with open(output_filename, "wb") as f:
                                        f.write(image_content)
                                    print(f"✓ Converted image {i+1} saved: {output_filename} ({len(image_content)} bytes)")
                                    
                                except Exception as decode_error:
                                    print(f"Error decoding base64 for image {i+1}: {decode_error}")
                                    # Save base64 content as text file for debugging
                                    debug_filename = os.path.join(output_folder, f"debug_img_{i+1}_base64.txt")
                                    with open(debug_filename, "w") as f:
                                        f.write(base64_content)
                                    print(f"Base64 content saved for debugging: {debug_filename}")
                            else:
                                print(f"Image {i+1} missing required fields (docContent/docName)")
                                print(f"Available fields: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                        
                        print(f"✓ All {len(image_data)} converted images processed in folder: {output_folder}")
                    else:
                        print("Response is not a list - checking for outputDocuments structure...")
                        if isinstance(image_data, dict) and 'outputDocuments' in image_data:
                            # Handle outputDocuments structure
                            print("Found outputDocuments structure in response")
                            output_documents = image_data['outputDocuments']
                            
                            if isinstance(output_documents, list) and len(output_documents) > 0:
                                print(f"Found {len(output_documents)} converted images in response")
                                # Handle array of converted images
                                for i, document in enumerate(output_documents):
                                    print(f"Processing image {i+1}...")
                                    print(f"Document keys: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                                    
                                    if isinstance(document, dict) and 'streamFile' in document and 'fileName' in document:
                                        # Decode base64 content and save each image
                                        base64_content = document['streamFile']
                                        print(f"Base64 content length: {len(base64_content)} characters")
                                        
                                        try:
                                            image_content = base64.b64decode(base64_content)
                                            print(f"Decoded image content length: {len(image_content)} bytes")
                                            
                                            output_filename = os.path.join(output_folder, document['fileName'])
                                            
                                            with open(output_filename, "wb") as f:
                                                f.write(image_content)
                                            print(f"✓ Converted image {i+1} saved: {output_filename} ({len(image_content)} bytes)")
                                            
                                        except Exception as decode_error:
                                            print(f"Error decoding base64 for image {i+1}: {decode_error}")
                                            # Save base64 content as text file for debugging
                                            debug_filename = os.path.join(output_folder, f"debug_img_{i+1}_base64.txt")
                                            with open(debug_filename, "w") as f:
                                                f.write(base64_content)
                                            print(f"Base64 content saved for debugging: {debug_filename}")
                                    else:
                                        print(f"Image {i+1} missing required fields (streamFile/fileName)")
                                        print(f"Available fields: {list(document.keys()) if isinstance(document, dict) else 'Not a dict'}")
                                
                                print(f"✓ All {len(output_documents)} converted images processed in folder: {output_folder}")
                            else:
                                print("outputDocuments is empty or not a list")
                                with open(f"{output_folder}/raw_response.json", "w") as f:
                                    json.dump(image_data, f, indent=2)
                                print(f"Raw JSON response saved to: {output_folder}/raw_response.json")
                        
                        elif isinstance(image_data, dict) and 'docContent' in image_data and 'docName' in image_data:
                            # Handle single image response (legacy format)
                            print("Found single image in response")
                            base64_content = image_data['docContent']
                            image_content = base64.b64decode(base64_content)
                            output_filename = os.path.join(output_folder, image_data['docName'])
                            
                            with open(output_filename, "wb") as f:
                                f.write(image_content)
                            print(f"✓ Single image saved: {output_filename} ({len(image_content)} bytes)")
                        else:
                            print("Unexpected response format - saving raw response for analysis")
                            with open(f"{output_folder}/raw_response.json", "w") as f:
                                json.dump(image_data, f, indent=2)
                            print(f"Raw JSON response saved to: {output_folder}/raw_response.json")
                            
                except Exception as e:
                    print(f"Error parsing converted images: {e}")
                    # Save raw response as fallback
                    with open(f"{output_folder}/raw_response.bin", "wb") as f:
                        f.write(response_conversion.content)
                    print(f"Raw response saved to: {output_folder}/raw_response.bin")
                
                return
                
            elif response_conversion.status_code == 202:
                # Still processing, continue polling
                print("Still processing (202)...")
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
    print("Creating images from PDF...")
    create_image_from_pdf()
