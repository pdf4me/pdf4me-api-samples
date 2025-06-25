import os
import base64
import requests
import time
import json

def extract_text_from_word():
    """
    Extract text content from a Word document using PDF4me API
    Process: Read Word file → Encode to base64 → Send API request → Poll for completion → Save extracted text
    This action extracts text content from Word documents with options for page range and content filtering
    """
    
    # API Configuration - PDF4me service for extracting text from Word documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/" # Replace with your actual API key
    word_file_path = "sample.docx"  # Path to the main Word file (.docx or .doc)
    

    
    # API endpoint for extracting text from Word documents
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/ExtractTextFromWord"

    # Check if the input Word file exists before proceeding
    if not os.path.exists(word_file_path):
        print(f"Error: Word file not found at {word_file_path}")
        return

    # Read the Word file and convert it to base64 encoding
    try:
        with open(word_file_path, "rb") as f:
            word_content = f.read()
        word_base64 = base64.b64encode(word_content).decode('utf-8')
        print(f"Word file read successfully: {len(word_content)} bytes")
    except Exception as e:
        print(f"Error reading Word file: {e}")
        return

    # Prepare the payload (data) to send to the API
    payload = {
        "docContent": word_base64,                                 # Base64 encoded Word document content
        "docName": "output",                                       # Name of the input Word file
        "StartPageNumber": 1,                                      # Starting page number
        "EndPageNumber": 3,                                        # Ending page number
        "RemoveComments": True,                                    # Remove comments option
        "RemoveHeaderFooter": True,                                # Remove header/footer option
        "AcceptChanges": True,                                     # Accept tracked changes option
        "async": False                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print(f"Extracting text from pages {payload['StartPageNumber']}-{payload['EndPageNumber']}...")
    print(f"Options: Remove Comments={payload['RemoveComments']}, Remove Headers/Footers={payload['RemoveHeaderFooter']}, Accept Changes={payload['AcceptChanges']}")
    print("Sending text extraction request to PDF4me API...")
    
    # Make the API request to extract text from the Word document
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
        # 200 - Success: text extraction completed immediately
        print("✓ Success! Text extraction from Word completed!")
        
        # Save the extracted text content
        try:
            # Check if response is JSON (structured data) or binary content (text file)
            content_type = response.headers.get('Content-Type', '')
            
            if 'application/json' in content_type:
                # Response contains JSON with extracted text data
                text_data = response.json()
                
                # Save complete extraction data as JSON (excluding base64 docData)
                metadata_path = "extracted_text_from_word.json"
                # Remove base64 docData field to keep JSON clean
                clean_data = {k: v for k, v in text_data.items() if k not in ['docData', 'docContent']}
                with open(metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(clean_data, f, indent=2, ensure_ascii=False)
                print(f"Extraction metadata saved: {metadata_path}")
                
                # Process and save extracted text content
                process_extracted_text_data(text_data, payload['StartPageNumber'], payload['EndPageNumber'])
                
            else:
                # Response is binary content - likely base64 encoded text
                try:
                    # Try to decode as base64 first
                    decoded_content = base64.b64decode(response.content).decode('utf-8')
                    
                    # Save as text file
                    output_file = "extracted_text.txt"
                    with open(output_file, "w", encoding='utf-8') as f:
                        f.write(f"Text Extraction from Word Document\n")
                        f.write(f"===================================\n")
                        f.write(f"Pages: {payload['StartPageNumber']}-{payload['EndPageNumber']}\n")
                        f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                        f.write(decoded_content)
                    
                    print(f"✓ Extracted text saved: {output_file}")
                    display_text_summary(decoded_content, payload['StartPageNumber'], payload['EndPageNumber'])
                    
                except:
                    # If base64 decoding fails, try as plain text
                    try:
                        text_content = response.text
                        output_file = "extracted_text.txt"
                        with open(output_file, "w", encoding='utf-8') as f:
                            f.write(f"Text Extraction from Word Document\n")
                            f.write(f"===================================\n")
                            f.write(f"Pages: {payload['StartPageNumber']}-{payload['EndPageNumber']}\n")
                            f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                            f.write(text_content)
                        
                        print(f"✓ Extracted text saved: {output_file}")
                        display_text_summary(text_content, payload['StartPageNumber'], payload['EndPageNumber'])
                        
                    except:
                        # Save as binary file if all else fails
                        output_file = "extracted_text_raw.bin"
                        with open(output_file, "wb") as f:
                            f.write(response.content)
                        print(f"Raw content saved: {output_file}")
                
        except Exception as e:
            print(f"Error processing extracted text: {e}")
            # Save raw response content as fallback
            fallback_path = "raw_text_response.bin"
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
        max_retries = 15  # Retries for text extraction processing
        retry_delay = 10   # Delay for text extraction processing

        # Poll the API until text extraction is complete
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
                print("✓ Success! Text extraction from Word completed!")
                
                # Save the extracted text content
                try:
                    # Check if response is JSON (structured data) or binary content (text file)
                    content_type = response_extraction.headers.get('Content-Type', '')
                    
                    if 'application/json' in content_type:
                        # Response contains JSON with extracted text data
                        text_data = response_extraction.json()
                        
                        # Save complete extraction data as JSON (excluding base64 docData)
                        metadata_path = "extracted_text_from_word.json"
                        # Remove base64 docData field to keep JSON clean
                        clean_data = {k: v for k, v in text_data.items() if k not in ['docData', 'docContent']}
                        with open(metadata_path, 'w', encoding='utf-8') as f:
                            json.dump(clean_data, f, indent=2, ensure_ascii=False)
                        print(f"Extraction metadata saved: {metadata_path}")
                        
                        # Process and save extracted text content
                        process_extracted_text_data(text_data, payload['StartPageNumber'], payload['EndPageNumber'])
                        
                    else:
                        # Response is binary content - likely base64 encoded text
                        try:
                            # Try to decode as base64 first
                            decoded_content = base64.b64decode(response_extraction.content).decode('utf-8')
                            
                            # Save as text file
                            output_file = "extracted_text.txt"
                            with open(output_file, "w", encoding='utf-8') as f:
                                f.write(f"Text Extraction from Word Document\n")
                                f.write(f"===================================\n")
                                f.write(f"Pages: {payload['StartPageNumber']}-{payload['EndPageNumber']}\n")
                                f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                                f.write(decoded_content)
                            
                            print(f"✓ Extracted text saved: {output_file}")
                            display_text_summary(decoded_content, payload['StartPageNumber'], payload['EndPageNumber'])
                            
                        except:
                            # If base64 decoding fails, try as plain text
                            try:
                                text_content = response_extraction.text
                                output_file = "extracted_text.txt"
                                with open(output_file, "w", encoding='utf-8') as f:
                                    f.write(f"Text Extraction from Word Document\n")
                                    f.write(f"===================================\n")
                                    f.write(f"Pages: {payload['StartPageNumber']}-{payload['EndPageNumber']}\n")
                                    f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                                    f.write(text_content)
                                
                                print(f"✓ Extracted text saved: {output_file}")
                                display_text_summary(text_content, payload['StartPageNumber'], payload['EndPageNumber'])
                                
                            except:
                                # Save as binary file if all else fails
                                output_file = "extracted_text_raw.bin"
                                with open(output_file, "wb") as f:
                                    f.write(response_extraction.content)
                                print(f"Raw content saved: {output_file}")
                        
                except Exception as e:
                    print(f"Error processing extracted text: {e}")
                    # Save raw response content as fallback
                    fallback_path = "raw_text_response.bin"
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
        print("Timeout: Text extraction did not complete after multiple retries")
        
    else:
        # Other status codes - Error
        print(f"Error: {response.status_code} - {response.text}")

def process_extracted_text_data(text_data, start_page, end_page):
    """Process and save extracted text data in .txt format"""
    
    try:
        # Handle different response formats
        extracted_text = ""
        
        # Check for text content in response
        if isinstance(text_data, dict):
            # Look for common field names that might contain the extracted text
            for field_name in ['text', 'content', 'extractedText', 'textContent', 'result', 'data', 'docData']:
                if field_name in text_data and text_data[field_name]:
                    content = text_data[field_name]
                    
                    # If it's base64 encoded, decode it
                    if field_name == 'docData' or (isinstance(content, str) and len(content) > 100 and content.replace('+', '').replace('/', '').replace('=', '').isalnum()):
                        try:
                            extracted_text = base64.b64decode(content).decode('utf-8')
                            break
                        except:
                            extracted_text = content
                            break
                    else:
                        extracted_text = content
                        break
        
        elif isinstance(text_data, str):
            # Direct text content - check if it's base64
            if len(text_data) > 100 and text_data.replace('+', '').replace('/', '').replace('=', '').isalnum():
                try:
                    extracted_text = base64.b64decode(text_data).decode('utf-8')
                except:
                    extracted_text = text_data
            else:
                extracted_text = text_data
        
        # Save extracted text to .txt file
        if extracted_text:
            # Save as plain text file
            text_file_path = "extracted_text.txt"
            with open(text_file_path, 'w', encoding='utf-8') as f:
                f.write(f"Text Extraction from Word Document\n")
                f.write(f"===================================\n")
                f.write(f"Pages: {start_page}-{end_page}\n")
                f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(extracted_text)
            
            print(f"✓ Text content saved: {text_file_path}")
            
            # Display text summary
            display_text_summary(extracted_text, start_page, end_page)
            
        else:
            print("⚠️  No text content found in the response")
            
            # Create empty text file with debug info
            text_file_path = "extracted_text.txt"
            with open(text_file_path, 'w', encoding='utf-8') as f:
                f.write(f"Text Extraction from Word Document\n")
                f.write(f"===================================\n")
                f.write(f"Pages: {start_page}-{end_page}\n")
                f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write("No text content found in the response.\n")
                f.write(f"Response structure: {type(text_data)}\n")
                if isinstance(text_data, dict):
                    f.write(f"Available fields: {list(text_data.keys())}\n")
            
            print(f"Debug text file created: {text_file_path}")
            
    except Exception as e:
        print(f"Error processing extracted text: {e}")
        
        # Create error text file
        text_file_path = "extracted_text.txt"
        with open(text_file_path, 'w', encoding='utf-8') as f:
            f.write(f"Text Extraction from Word Document\n")
            f.write(f"===================================\n")
            f.write(f"Pages: {start_page}-{end_page}\n")
            f.write(f"Extracted on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"Error occurred during text extraction: {e}\n")
        
        print(f"Error text file created: {text_file_path}")

def determine_output_extension(headers):
    """Determine file extension based on content type"""
    content_type = headers.get('Content-Type', '').lower()
    if 'text/plain' in content_type:
        return '.txt'
    elif 'application/json' in content_type:
        return '.json'
    else:
        return '.bin'

def display_text_summary(text_content, start_page, end_page):
    """Display summary of text extraction results"""
    print("\n--- Text Extraction Summary ---")
    print(f"📄 Pages processed: {start_page}-{end_page}")
    
    if text_content and text_content != "Binary content":
        char_count = len(text_content)
        word_count = len(text_content.split())
        line_count = len(text_content.splitlines())
        
        print(f"📝 Characters extracted: {char_count:,}")
        print(f"🔤 Words extracted: {word_count:,}")
        print(f"📏 Lines extracted: {line_count:,}")
        
        # Show first few lines of extracted text
        lines = text_content.splitlines()
        if lines:
            print("\n📖 First few lines of extracted text:")
            for i, line in enumerate(lines[:3], 1):
                # Truncate long lines for display
                display_line = line[:80] + "..." if len(line) > 80 else line
                if display_line.strip():  # Only show non-empty lines
                    print(f"  {i}. {display_line}")
            
            if len(lines) > 3:
                print(f"  ... and {len(lines) - 3} more lines")
        
        print(" Text extraction from Word completed successfully!")
    else:
        print("  No readable text content was extracted")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Extracting text from Word document...")
    extract_text_from_word()
