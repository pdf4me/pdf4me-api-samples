import os
import base64
import requests
import time
import json

def extract_text_by_expression():
    """
    Extract specific text from a PDF document using regular expressions with PDF4me API
    Process: Read PDF → Encode to base64 → Send API request with regex pattern → Poll for completion → Save extracted text
    This action extracts text matching specific patterns/expressions from PDF documents
    """
    
    # API Configuration - PDF4me service for extracting text by expression from PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/" # Replace with your actual API key
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_folder = "Extract_text_by_expression_outputs"  # Output folder for extracted text
    
    # Text extraction parameters
    expression = "%"  # Regular expression pattern to search for (example: %, US, email patterns, etc.)
    page_sequence = "1-3"  # Page range: "1-" for all pages, "1,2,3" for specific pages, "1-5" for range
    
    # API endpoint for extracting text by expression from PDF documents
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/ExtractTextByExpression"

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
        "docName": "output.pdf",                                   # Name of the input PDF file
        "expression": expression,                                  # Regular expression pattern to search for
        "pageSequence": page_sequence,                             # Page range to process
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print(f"Extracting text matching pattern '{expression}' from pages {page_sequence}...")
    print("Sending text extraction request to PDF4me API...")
    
    # Make the API request to extract text by expression from the PDF
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
        print("✓ Success! Text extraction by expression completed!")
        
        # Save the extracted text data
        try:
            # Parse the JSON response containing extracted text
            text_data = response.json()
            
            # Save complete extraction data as JSON
            metadata_path = os.path.join(output_folder, "extracted_text_by_expression.json")
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(text_data, f, indent=2, ensure_ascii=False)
            print(f"Extraction metadata saved: {metadata_path}")
            
            # Process and save extracted text matches
            process_extracted_text(text_data, output_folder, expression, page_sequence)
                
        except Exception as e:
            print(f"Error processing extracted text data: {e}")
            # Save raw response content as fallback
            fallback_path = os.path.join(output_folder, "raw_text_response.json")
            with open(fallback_path, "w", encoding='utf-8') as f:
                f.write(response.text)
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
        retry_delay = 8   # Delay for text extraction processing

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
                print("✓ Success! Text extraction by expression completed!")
                
                # Save the extracted text data
                try:
                    # Parse the JSON response containing extracted text
                    text_data = response_extraction.json()
                    
                    # Save complete extraction data as JSON
                    metadata_path = os.path.join(output_folder, "extracted_text_by_expression.json")
                    with open(metadata_path, 'w', encoding='utf-8') as f:
                        json.dump(text_data, f, indent=2, ensure_ascii=False)
                    print(f"Extraction metadata saved: {metadata_path}")
                    
                    # Process and save extracted text matches
                    process_extracted_text(text_data, output_folder, expression, page_sequence)
                        
                except Exception as e:
                    print(f"Error processing extracted text data: {e}")
                    # Save raw response content as fallback
                    fallback_path = os.path.join(output_folder, "raw_text_response.json")
                    with open(fallback_path, "w", encoding='utf-8') as f:
                        f.write(response_extraction.text)
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

def process_extracted_text(text_data, output_folder, expression, page_sequence):
    """Process and save extracted text matches in multiple formats"""
    
    try:
        # Handle different response formats
        text_matches = []
        
        # Check for text list in response
        if isinstance(text_data, dict):
            # Look for common field names that might contain the extracted text
            for field_name in ['textList', 'text_list', 'texts', 'matches', 'results', 'data']:
                if field_name in text_data:
                    text_matches = text_data[field_name]
                    break
            
            # If no specific field found, check if the whole response is the text list
            if not text_matches and 'expression' in str(text_data):
                # Might be a structured response, look for text values
                for key, value in text_data.items():
                    if isinstance(value, list) and value:
                        text_matches = value
                        break
        
        elif isinstance(text_data, list):
            # Direct text list
            text_matches = text_data
        
        # Save individual matches as text file
        if text_matches:
            # Save all matches in a single text file
            text_file_path = os.path.join(output_folder, "extracted_matches.txt")
            with open(text_file_path, 'w', encoding='utf-8') as f:
                f.write(f"Text Extraction Results\n")
                f.write(f"======================\n")
                f.write(f"Expression: {expression}\n")
                f.write(f"Pages: {page_sequence}\n")
                f.write(f"Total Matches: {len(text_matches)}\n\n")
                
                for i, match in enumerate(text_matches, 1):
                    f.write(f"Match {i}: {match}\n")
            
            print(f"✓ Text matches saved: {text_file_path}")
            
            # Save matches as CSV for easy analysis
            csv_path = os.path.join(output_folder, "extracted_matches.csv")
            save_matches_as_csv(text_matches, csv_path, expression, page_sequence)
            
            # Display extraction summary
            display_extraction_summary(text_matches, expression, page_sequence)
            
        else:
            print("⚠️  No text matches found for the specified expression")
            
            # Add debug information to the main JSON file
            if isinstance(text_data, dict):
                text_data.update({
                    "message": "No matches found",
                    "expression": expression,
                    "page_sequence": page_sequence,
                    "response_structure": str(type(text_data))
                })
            
            print("Debug information added to main JSON file")
            
    except Exception as e:
        print(f"Error processing extracted text: {e}")

def save_matches_as_csv(text_matches, csv_path, expression, page_sequence):
    """Save text matches as CSV format"""
    try:
        import csv
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            
            # Write header
            writer.writerow(['Match_Number', 'Extracted_Text', 'Expression_Used', 'Pages_Processed'])
            
            # Write matches
            for i, match in enumerate(text_matches, 1):
                writer.writerow([i, match, expression, page_sequence])
                
        print(f"✓ CSV file saved: {csv_path}")
    except Exception as e:
        print(f"Error saving CSV: {e}")

def display_extraction_summary(text_matches, expression, page_sequence):
    """Display summary of text extraction results"""
    print("\n--- Text Extraction Summary ---")
    print(f"🔍 Expression: '{expression}'")
    print(f"📄 Pages processed: {page_sequence}")
    print(f"✅ Total matches found: {len(text_matches)}")
    
    if text_matches:
        print("\n📝 First few matches:")
        for i, match in enumerate(text_matches[:5], 1):
            # Truncate long matches for display
            display_match = match[:50] + "..." if len(match) > 50 else match
            print(f"  {i}. {display_match}")
        
        if len(text_matches) > 5:
            print(f"  ... and {len(text_matches) - 5} more matches")
        
        # Show unique matches if there are duplicates
        unique_matches = list(set(text_matches))
        if len(unique_matches) < len(text_matches):
            print(f"📊 Unique matches: {len(unique_matches)}")
    
    print("✅ Text extraction by expression completed successfully!")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Extracting text by expression from PDF...")
    extract_text_by_expression()
