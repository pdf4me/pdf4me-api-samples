import os
import base64
import requests
import time
import json

def extract_resources():
    """
    Extract text and images from a PDF document using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save extracted text and images
    This action extracts all text content and embedded images from PDF documents
    """
    
    # API Configuration - PDF4me service for extracting resources from PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/" # Replace with your actual API key
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_folder = "Extract_resources_outputs"  # Output folder for extracted resources
    
    # API endpoint for extracting resources from PDF documents
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/ExtractResources"

    # Check if the input PDF file exists before proceeding
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
        "docContent": pdf_base64,                                  # Base64 encoded PDF document content
        "docName": "sample.pdf",                                   # Name of the input PDF file
        "extractText": True,                                       # Extract text content from PDF
        "extractImage": True,                                      # Extract images from PDF
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print("Sending resource extraction request to PDF4me API...")
    
    # Make the API request to extract resources from the PDF
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
        # 200 - Success: resource extraction completed immediately
        print("✓ Success! Resource extraction completed!")
        
        # Save the extracted resources
        try:
            # Check if response is JSON (extracted data) or binary content
            content_type = response.headers.get('Content-Type', '')
            
            if 'application/json' in content_type:
                # Response contains JSON with extracted text and images
                resource_data = response.json()
                
                # Save complete resource data as JSON
                metadata_path = os.path.join(output_folder, "extracted_resources.json")
                with open(metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(resource_data, f, indent=2, ensure_ascii=False)
                print(f"Resource metadata saved: {metadata_path}")
                
                # Process extracted text
                if isinstance(resource_data, dict) and 'texts' in resource_data:
                    extracted_text = resource_data['texts']
                    if extracted_text:
                        text_path = os.path.join(output_folder, "extracted_text.txt")
                        with open(text_path, 'w', encoding='utf-8') as f:
                            if isinstance(extracted_text, list):
                                f.write('\n'.join(extracted_text))
                            else:
                                f.write(str(extracted_text))
                        print(f"Extracted text saved: {text_path}")
                        print(f"Text preview: {str(extracted_text)[:200]}...")
                    else:
                        print("No text content found in PDF")
                
                # Process extracted images - image detection
                images_found = False
                
                # Debug: Print all keys in response to understand structure
                print(f"Response keys: {list(resource_data.keys()) if isinstance(resource_data, dict) else 'Not a dict'}")
                
                # Try different possible field names for images
                image_fields = ['images', 'Images', 'imageData', 'extractedImages', 'img', 'pictures']
                
                for field_name in image_fields:
                    if isinstance(resource_data, dict) and field_name in resource_data:
                        images = resource_data[field_name]
                        print(f"Found '{field_name}' field with data type: {type(images)}")
                        
                        if images:
                            if isinstance(images, list):
                                print(f"Found {len(images)} images in '{field_name}' field")
                                for i, image_data in enumerate(images):
                                    print(f"Processing image {i+1}, type: {type(image_data)}")
                                    try:
                                        image_saved = False
                                        
                                        if isinstance(image_data, dict):
                                            # Try different possible content field names
                                            content_fields = ['content', 'data', 'base64', 'imageData', 'docContent']
                                            for content_field in content_fields:
                                                if content_field in image_data and image_data[content_field]:
                                                    print(f"Found image content in '{content_field}' field")
                                                    try:
                                                        image_content = base64.b64decode(image_data[content_field])
                                                        image_name = image_data.get('name', image_data.get('docName', f'extracted_image_{i+1}.png'))
                                                        image_path = os.path.join(output_folder, image_name)
                                                        
                                                        with open(image_path, 'wb') as f:
                                                            f.write(image_content)
                                                        print(f"✓ Image saved: {image_path} ({len(image_content)} bytes)")
                                                        images_found = True
                                                        image_saved = True
                                                        break
                                                    except Exception as e:
                                                        print(f"Error decoding image from '{content_field}': {e}")
                                        
                                        elif isinstance(image_data, str) and len(image_data) > 100:  # Likely base64 string
                                            print(f"Processing direct base64 string (length: {len(image_data)})")
                                            try:
                                                image_content = base64.b64decode(image_data)
                                                image_path = os.path.join(output_folder, f'extracted_image_{i+1}.png')
                                                
                                                with open(image_path, 'wb') as f:
                                                    f.write(image_content)
                                                print(f"✓ Image saved: {image_path} ({len(image_content)} bytes)")
                                                images_found = True
                                                image_saved = True
                                            except Exception as e:
                                                print(f"Error decoding direct base64: {e}")
                                        
                                        if not image_saved:
                                            print(f"Could not extract image {i+1}. Data structure:")
                                            if isinstance(image_data, dict):
                                                print(f"  Keys: {list(image_data.keys())}")
                                                for key, value in image_data.items():
                                                    print(f"  {key}: {type(value)} (length: {len(str(value)) if value else 0})")
                                            else:
                                                print(f"  Type: {type(image_data)}, Length: {len(str(image_data))}")
                                                
                                    except Exception as e:
                                        print(f"Error processing image {i+1}: {e}")
                                        
                            elif isinstance(images, dict):
                                # Single image object
                                print(f"Single image object found in '{field_name}'")
                                try:
                                    content_fields = ['content', 'data', 'base64', 'imageData', 'docContent']
                                    for content_field in content_fields:
                                        if content_field in images and images[content_field]:
                                            image_content = base64.b64decode(images[content_field])
                                            image_name = images.get('name', images.get('docName', 'extracted_image.png'))
                                            image_path = os.path.join(output_folder, image_name)
                                            
                                            with open(image_path, 'wb') as f:
                                                f.write(image_content)
                                            print(f"✓ Single image saved: {image_path} ({len(image_content)} bytes)")
                                            images_found = True
                                            break
                                except Exception as e:
                                    print(f"Error processing single image: {e}")
                            
                            elif isinstance(images, str) and len(images) > 100:
                                # Direct base64 string
                                print(f"Direct base64 string found in '{field_name}' (length: {len(images)})")
                                try:
                                    image_content = base64.b64decode(images)
                                    image_path = os.path.join(output_folder, f'extracted_image_{field_name}.png')
                                    
                                    with open(image_path, 'wb') as f:
                                        f.write(image_content)
                                    print(f"✓ Image saved: {image_path} ({len(image_content)} bytes)")
                                    images_found = True
                                except Exception as e:
                                    print(f"Error decoding {field_name} as base64: {e}")
                        else:
                            print(f"'{field_name}' field is empty")
                        break  # Found the field, no need to check others
                
                if not images_found:
                    print("No images found in PDF response")
                    # Debug: Show the entire response structure (first 1000 chars)
                    print(f"Full response preview: {str(resource_data)[:1000]}...")
                else:
                    print(f"✓ Successfully extracted images from PDF")
                
                # Display summary
                text_count = len(resource_data.get('texts', [])) if isinstance(resource_data.get('texts'), list) else (1 if resource_data.get('texts') else 0)
                image_count = len(resource_data.get('images', [])) if isinstance(resource_data.get('images'), list) else 0
                print(f"\nExtraction Summary:")
                print(f"  Text sections: {text_count}")
                print(f"  Images: {image_count}")
                
            else:
                # Response is binary content
                binary_path = os.path.join(output_folder, "extracted_resources.bin")
                with open(binary_path, "wb") as f:
                    f.write(response.content)
                print(f"Binary resource data saved: {binary_path}")
                
        except Exception as e:
            print(f"Error processing extracted resources: {e}")
            # Save raw response content as fallback
            fallback_path = os.path.join(output_folder, "raw_response.bin")
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
        max_retries = 20  # Increased retries for resource extraction processing
        retry_delay = 15   # Increased delay for resource extraction processing

        # Poll the API until resource extraction is complete
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
                print("✓ Success! Resource extraction completed!")
                
                # Save the extracted resources
                try:
                    # Check if response is JSON (extracted data) or binary content
                    content_type = response_extraction.headers.get('Content-Type', '')
                    
                    if 'application/json' in content_type:
                        # Response contains JSON with extracted text and images
                        resource_data = response_extraction.json()
                        
                        # Save complete resource data as JSON
                        metadata_path = os.path.join(output_folder, "extracted_resources.json")
                        with open(metadata_path, 'w', encoding='utf-8') as f:
                            json.dump(resource_data, f, indent=2, ensure_ascii=False)
                        print(f"Resource metadata saved: {metadata_path}")
                        
                        # Process extracted text
                        if isinstance(resource_data, dict) and 'texts' in resource_data:
                            extracted_text = resource_data['texts']
                            if extracted_text:
                                text_path = os.path.join(output_folder, "extracted_text.txt")
                                with open(text_path, 'w', encoding='utf-8') as f:
                                    if isinstance(extracted_text, list):
                                        f.write('\n'.join(extracted_text))
                                    else:
                                        f.write(str(extracted_text))
                                print(f"Extracted text saved: {text_path}")
                                print(f"Text preview: {str(extracted_text)[:200]}...")
                            else:
                                print("No text content found in PDF")
                        
                        # Process extracted images - Enhanced logic for better image detection
                        images_found = False
                        
                        # Debug: Print all keys in response to understand structure
                        print(f"Response keys: {list(resource_data.keys()) if isinstance(resource_data, dict) else 'Not a dict'}")
                        
                        # Try different possible field names for images
                        image_fields = ['images', 'Images', 'imageData', 'extractedImages', 'img', 'pictures']
                        
                        for field_name in image_fields:
                            if isinstance(resource_data, dict) and field_name in resource_data:
                                images = resource_data[field_name]
                                print(f"Found '{field_name}' field with data type: {type(images)}")
                                
                                if images:
                                    if isinstance(images, list):
                                        print(f"Found {len(images)} images in '{field_name}' field")
                                        for i, image_data in enumerate(images):
                                            print(f"Processing image {i+1}, type: {type(image_data)}")
                                            try:
                                                image_saved = False
                                                
                                                if isinstance(image_data, dict):
                                                    # Try different possible content field names
                                                    content_fields = ['content', 'data', 'base64', 'imageData', 'docContent']
                                                    for content_field in content_fields:
                                                        if content_field in image_data and image_data[content_field]:
                                                            print(f"Found image content in '{content_field}' field")
                                                            try:
                                                                image_content = base64.b64decode(image_data[content_field])
                                                                image_name = image_data.get('name', image_data.get('docName', f'extracted_image_{i+1}.png'))
                                                                image_path = os.path.join(output_folder, image_name)
                                                                
                                                                with open(image_path, 'wb') as f:
                                                                    f.write(image_content)
                                                                print(f"✓ Image saved: {image_path} ({len(image_content)} bytes)")
                                                                images_found = True
                                                                image_saved = True
                                                                break
                                                            except Exception as e:
                                                                print(f"Error decoding image from '{content_field}': {e}")
                                                
                                                elif isinstance(image_data, str) and len(image_data) > 100:  # Likely base64 string
                                                    print(f"Processing direct base64 string (length: {len(image_data)})")
                                                    try:
                                                        image_content = base64.b64decode(image_data)
                                                        image_path = os.path.join(output_folder, f'extracted_image_{i+1}.png')
                                                        
                                                        with open(image_path, 'wb') as f:
                                                            f.write(image_content)
                                                        print(f"✓ Image saved: {image_path} ({len(image_content)} bytes)")
                                                        images_found = True
                                                        image_saved = True
                                                    except Exception as e:
                                                        print(f"Error decoding direct base64: {e}")
                                                
                                                if not image_saved:
                                                    print(f"Could not extract image {i+1}. Data structure:")
                                                    if isinstance(image_data, dict):
                                                        print(f"  Keys: {list(image_data.keys())}")
                                                        for key, value in image_data.items():
                                                            print(f"  {key}: {type(value)} (length: {len(str(value)) if value else 0})")
                                                    else:
                                                        print(f"  Type: {type(image_data)}, Length: {len(str(image_data))}")
                                                        
                                            except Exception as e:
                                                print(f"Error processing image {i+1}: {e}")
                                                
                                    elif isinstance(images, dict):
                                        # Single image object
                                        print(f"Single image object found in '{field_name}'")
                                        try:
                                            content_fields = ['content', 'data', 'base64', 'imageData', 'docContent']
                                            for content_field in content_fields:
                                                if content_field in images and images[content_field]:
                                                    image_content = base64.b64decode(images[content_field])
                                                    image_name = images.get('name', images.get('docName', 'extracted_image.png'))
                                                    image_path = os.path.join(output_folder, image_name)
                                                    
                                                    with open(image_path, 'wb') as f:
                                                        f.write(image_content)
                                                    print(f"✓ Single image saved: {image_path} ({len(image_content)} bytes)")
                                                    images_found = True
                                                    break
                                        except Exception as e:
                                            print(f"Error processing single image: {e}")
                                    
                                    elif isinstance(images, str) and len(images) > 100:
                                        # Direct base64 string
                                        print(f"Direct base64 string found in '{field_name}' (length: {len(images)})")
                                        try:
                                            image_content = base64.b64decode(images)
                                            image_path = os.path.join(output_folder, f'extracted_image_{field_name}.png')
                                            
                                            with open(image_path, 'wb') as f:
                                                f.write(image_content)
                                            print(f"✓ Image saved: {image_path} ({len(image_content)} bytes)")
                                            images_found = True
                                        except Exception as e:
                                            print(f"Error decoding {field_name} as base64: {e}")
                                break  # Found the field, no need to check others
                        
                        if not images_found:
                            print("No images found in PDF response")
                            # Debug: Show the entire response structure (first 1000 chars)
                            print(f"Full response preview: {str(resource_data)[:1000]}...")
                        else:
                            print(f"✓ Successfully extracted images from PDF")
                        
                        # Display summary
                        text_count = len(resource_data.get('texts', [])) if isinstance(resource_data.get('texts'), list) else (1 if resource_data.get('texts') else 0)
                        image_count = len(resource_data.get('images', [])) if isinstance(resource_data.get('images'), list) else 0
                        print(f"\nExtraction Summary:")
                        print(f"  Text sections: {text_count}")
                        print(f"  Images: {image_count}")
                        
                    else:
                        # Response is binary content
                        binary_path = os.path.join(output_folder, "extracted_resources.bin")
                        with open(binary_path, "wb") as f:
                            f.write(response_extraction.content)
                        print(f"Binary resource data saved: {binary_path}")
                        
                except Exception as e:
                    print(f"Error processing extracted resources: {e}")
                    # Save raw response content as fallback
                    fallback_path = os.path.join(output_folder, "raw_response.bin")
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
        print("Timeout: Resource extraction did not complete after multiple retries")
        
    else:
        # Other status codes - Error
        print(f"Error: {response.status_code} - {response.text}")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Extracting resources from PDF...")
    extract_resources()
