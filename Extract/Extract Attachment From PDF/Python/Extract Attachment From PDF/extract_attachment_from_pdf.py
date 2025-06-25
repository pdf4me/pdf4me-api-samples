import os
import base64
import requests
import time
import json
import zipfile
from io import BytesIO

def extract_attachment_from_pdf():
    """
    Extract attachments from a PDF document using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save extracted attachments
    This action extracts all file attachments embedded within PDF documents
    """
    
    # API Configuration - PDF4me service for extracting attachments from PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/" # Replace with your actual API key
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_folder = "Extract_attachment_outputs"  # Output folder for extracted attachments
    
    # API endpoint for extracting attachments from PDF documents
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/ExtractAttachmentFromPdf"

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
        "docName": "output.pdf",                                   # Source PDF file name with .pdf extension
        "docContent": pdf_base64,                                  # Base64 encoded PDF document content
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print("Sending attachment extraction request to PDF4me API...")
    
    # Make the API request to extract attachments from the PDF
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
        # 200 - Success: attachment extraction completed immediately
        print("✓ Success! Attachment extraction completed!")
        
        # Save the extracted attachments
        try:
            # Check if response is JSON (metadata) or binary (ZIP file)
            content_type = response.headers.get('Content-Type', '')
            
            if 'application/json' in content_type:
                # Response contains JSON metadata about attachments
                attachment_data = response.json()
                
                # Process and save extracted attachments
                process_attachment_data(attachment_data, output_folder)
                
            else:
                # Response is likely a ZIP file or binary content
                output_file = os.path.join(output_folder, "extracted_attachments.zip")
                with open(output_file, "wb") as f:
                    f.write(response.content)
                print(f"Extracted attachments saved: {output_file}")
                
                # Try to extract ZIP if it's a ZIP file
                try:
                    with zipfile.ZipFile(BytesIO(response.content), 'r') as zip_ref:
                        zip_ref.extractall(output_folder)
                        print(f"ZIP file extracted to: {output_folder}")
                        
                        # List extracted files
                        extracted_files = zip_ref.namelist()
                        print(f"Extracted {len(extracted_files)} files:")
                        for filename in extracted_files:
                            print(f"  - {filename}")
                except zipfile.BadZipFile:
                    print("Response is not a ZIP file, saved as binary content")
                except Exception as e:
                    print(f"Error extracting ZIP: {e}")
                    
        except Exception as e:
            print(f"Error processing extracted attachments: {e}")
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
        max_retries = 15  # Retries for attachment extraction processing
        retry_delay = 10   # Delay for attachment extraction processing

        # Poll the API until attachment extraction is complete
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
                print("✓ Success! Attachment extraction completed!")
                
                # Save the extracted attachments
                try:
                    # Check if response is JSON (metadata) or binary (ZIP file)
                    content_type = response_extraction.headers.get('Content-Type', '')
                    
                    if 'application/json' in content_type:
                        # Response contains JSON metadata about attachments
                        attachment_data = response_extraction.json()
                        
                        # Process and save extracted attachments
                        process_attachment_data(attachment_data, output_folder)
                        
                    else:
                        # Response is likely a ZIP file or binary content
                        output_file = os.path.join(output_folder, "extracted_attachments.zip")
                        with open(output_file, "wb") as f:
                            f.write(response_extraction.content)
                        print(f"Extracted attachments saved: {output_file}")
                        
                        # Try to extract ZIP if it's a ZIP file
                        try:
                            with zipfile.ZipFile(BytesIO(response_extraction.content), 'r') as zip_ref:
                                zip_ref.extractall(output_folder)
                                print(f"ZIP file extracted to: {output_folder}")
                                
                                # List extracted files
                                extracted_files = zip_ref.namelist()
                                print(f"Extracted {len(extracted_files)} files:")
                                for filename in extracted_files:
                                    print(f"  - {filename}")
                        except zipfile.BadZipFile:
                            print("Response is not a ZIP file, saved as binary content")
                        except Exception as e:
                            print(f"Error extracting ZIP: {e}")
                            
                except Exception as e:
                    print(f"Error processing extracted attachments: {e}")
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
        print("Timeout: Attachment extraction did not complete after multiple retries")
        
    else:
        # Other status codes - Error
        print(f"Error: {response.status_code} - {response.text}")

def clean_base64_from_json(data):
    """Remove base64 content fields to keep JSON clean and readable"""
    if isinstance(data, dict):
        cleaned_data = {}
        for key, value in data.items():
            if key in ['streamFile', 'docContent', 'docData']:
                # Replace base64 content with a note
                cleaned_data[key] = f"[Base64 content removed - {len(str(value))} characters]"
            elif isinstance(value, (dict, list)):
                cleaned_data[key] = clean_base64_from_json(value)
            else:
                cleaned_data[key] = value
        return cleaned_data
    elif isinstance(data, list):
        return [clean_base64_from_json(item) for item in data]
    else:
        return data

def process_attachment_data(attachment_data, output_folder):
    """Process and save extracted attachment data in .txt format"""
    
    try:
        attachments_found = 0
        
        # Check for outputDocuments structure (as shown in the example)
        if isinstance(attachment_data, dict) and 'outputDocuments' in attachment_data:
            output_docs = attachment_data['outputDocuments']
            
            if isinstance(output_docs, list):
                for i, doc in enumerate(output_docs):
                    if isinstance(doc, dict):
                                                 # Extract file information
                        filename = doc.get('fileName', f'attachment_{i+1}.txt')
                        stream_file = doc.get('streamFile', '')
                        barcode_text = doc.get('barcodeText', None)
                        doc_text = doc.get('docText', None)
                        
                        base_name = os.path.splitext(filename)[0]
                        
                        # Process streamFile content
                        if stream_file:
                            try:
                                # Decode base64 content
                                decoded_content = base64.b64decode(stream_file).decode('utf-8')
                                
                                # Create output filename with .txt extension
                                output_filename = f"{base_name}_extracted.txt"
                                output_path = os.path.join(output_folder, output_filename)
                                
                                # Save as text file
                                with open(output_path, 'w', encoding='utf-8') as f:
                                    f.write(f"Extracted Attachment Content\n")
                                    f.write(f"============================\n")
                                    f.write(f"Original filename: {filename}\n")
                                    f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                                    f.write(decoded_content)
                                
                                print(f"✓ Attachment content saved: {output_path}")
                                attachments_found += 1
                                
                            except Exception as e:
                                print(f"Error decoding attachment {i+1}: {e}")
                        
                        # Process barcodeText content
                        if barcode_text and barcode_text != "null" and str(barcode_text).strip():
                            try:
                                # Check if it's base64 encoded
                                if isinstance(barcode_text, str) and len(barcode_text) > 10:
                                    try:
                                        # Try to decode as base64
                                        decoded_barcode = base64.b64decode(barcode_text).decode('utf-8')
                                        content_to_save = decoded_barcode
                                    except:
                                        # If not base64, use as is
                                        content_to_save = barcode_text
                                else:
                                    content_to_save = str(barcode_text)
                                
                                # Save barcode text file
                                barcode_filename = f"{base_name}_barcode.txt"
                                barcode_path = os.path.join(output_folder, barcode_filename)
                                
                                with open(barcode_path, 'w', encoding='utf-8') as f:
                                    f.write(f"Extracted Barcode Text\n")
                                    f.write(f"======================\n")
                                    f.write(f"Source filename: {filename}\n")
                                    f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                                    f.write(content_to_save)
                                
                                print(f"✓ Barcode text saved: {barcode_path}")
                                attachments_found += 1
                                
                            except Exception as e:
                                print(f"Error processing barcode text: {e}")
                        else:
                            # Create file showing null barcode
                            barcode_filename = f"{base_name}_barcode.txt"
                            barcode_path = os.path.join(output_folder, barcode_filename)
                            
                            with open(barcode_path, 'w', encoding='utf-8') as f:
                                f.write(f"Extracted Barcode Text\n")
                                f.write(f"======================\n")
                                f.write(f"Source filename: {filename}\n")
                                f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                                f.write("null")
                            
                            print(f"✓ Barcode file created (null): {barcode_path}")
                        
                        # Process docText content
                        if doc_text and doc_text != "null" and str(doc_text).strip():
                            try:
                                # Check if it's base64 encoded
                                if isinstance(doc_text, str) and len(doc_text) > 10:
                                    try:
                                        # Try to decode as base64
                                        decoded_doctext = base64.b64decode(doc_text).decode('utf-8')
                                        content_to_save = decoded_doctext
                                    except:
                                        # If not base64, use as is
                                        content_to_save = doc_text
                                else:
                                    content_to_save = str(doc_text)
                                
                                # Save doc text file
                                doctext_filename = f"{base_name}_doctext.txt"
                                doctext_path = os.path.join(output_folder, doctext_filename)
                                
                                with open(doctext_path, 'w', encoding='utf-8') as f:
                                    f.write(f"Extracted Document Text\n")
                                    f.write(f"=======================\n")
                                    f.write(f"Source filename: {filename}\n")
                                    f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                                    f.write(content_to_save)
                                
                                print(f"✓ Document text saved: {doctext_path}")
                                attachments_found += 1
                                
                            except Exception as e:
                                print(f"Error processing document text: {e}")
                        else:
                            # Create file showing null docText
                            doctext_filename = f"{base_name}_doctext.txt"
                            doctext_path = os.path.join(output_folder, doctext_filename)
                            
                            with open(doctext_path, 'w', encoding='utf-8') as f:
                                f.write(f"Extracted Document Text\n")
                                f.write(f"=======================\n")
                                f.write(f"Source filename: {filename}\n")
                                f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                                f.write("null")
                            
                            print(f"✓ Document text file created (null): {doctext_path}")
        
        # Check for legacy attachments structure
        elif isinstance(attachment_data, dict) and 'attachments' in attachment_data:
            attachments = attachment_data['attachments']
            
            if isinstance(attachments, list):
                for i, attachment in enumerate(attachments):
                    if isinstance(attachment, dict) and 'docContent' in attachment:
                        try:
                            # Decode base64 content and save attachment
                            attachment_content = base64.b64decode(attachment['docContent'])
                            attachment_filename = attachment.get('docName', f'attachment_{i+1}')
                            
                            # Determine if content is text or binary
                            try:
                                # Try to decode as text
                                text_content = attachment_content.decode('utf-8')
                                
                                # Save as text file
                                base_name = os.path.splitext(attachment_filename)[0]
                                output_filename = f"{base_name}_extracted.txt"
                                output_path = os.path.join(output_folder, output_filename)
                                
                                with open(output_path, 'w', encoding='utf-8') as f:
                                    f.write(f"Extracted Attachment Content\n")
                                    f.write(f"============================\n")
                                    f.write(f"Original filename: {attachment_filename}\n")
                                    f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                                    f.write(text_content)
                                
                                print(f"✓ Attachment content saved: {output_path}")
                                attachments_found += 1
                                
                            except UnicodeDecodeError:
                                # Save as binary file if not text
                                attachment_path = os.path.join(output_folder, attachment_filename)
                                with open(attachment_path, 'wb') as f:
                                    f.write(attachment_content)
                                print(f"✓ Binary attachment saved: {attachment_path}")
                                attachments_found += 1
                                
                        except Exception as e:
                            print(f"Error saving attachment {i+1}: {e}")
        
        # Summary
        if attachments_found > 0:
            print(f"\n--- Attachment Extraction Summary ---")
            print(f"📎 Total attachments extracted: {attachments_found}")
            print("✅ Attachment extraction completed successfully!")
        else:
            print("⚠️  No attachments found in the PDF")
            
            # Create info file
            info_path = os.path.join(output_folder, "extraction_info.txt")
            with open(info_path, 'w', encoding='utf-8') as f:
                f.write(f"Attachment Extraction Results\n")
                f.write(f"=============================\n")
                f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write("No attachments were found in the PDF document.\n")
                if isinstance(attachment_data, dict):
                    f.write(f"Response structure: {list(attachment_data.keys())}\n")
            print(f"Extraction info saved: {info_path}")
            
    except Exception as e:
        print(f"Error processing attachment data: {e}")
        
        # Create error file
        error_path = os.path.join(output_folder, "extraction_error.txt")
        with open(error_path, 'w', encoding='utf-8') as f:
            f.write(f"Attachment Extraction Error\n")
            f.write(f"===========================\n")
            f.write(f"Error occurred on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"Error details: {e}\n")
        print(f"Error info saved: {error_path}")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Extracting attachments from PDF...")
    extract_attachment_from_pdf()
