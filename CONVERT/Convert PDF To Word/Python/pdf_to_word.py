import base64
import requests
import time
import os

def convert_pdf_to_word():
    """
    Convert a PDF file to Word document format using PDF4Me API
    Process: Read PDF file → Encode to base64 → Send API request → Poll for completion → Save Word document
    PDF to Word conversion transforms PDF content into editable document format with preserved formatting
    """
    
    # API Configuration - PDF4Me service for converting PDF documents to Word documents
    url = "https://api.pdf4me.com/api/v2/ConvertPdfToWord"
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
    pdf_file_path = "sample.pdf"    # Path to input PDF file
    output_path = "PDF_to_Word_output.docx"              # Output Word document file name

    # Check if the input PDF file exists before proceeding
    if not os.path.exists(pdf_file_path):
        print(f"Error: Input PDF file not found at {pdf_file_path}")
        return

    # Read the PDF file and convert it to base64 encoding
    # Base64 encoding converts binary PDF data into text format for API transmission
    try:
        with open(pdf_file_path, 'rb') as pdf_file:
            pdf_content = pdf_file.read()  # Read PDF as binary data
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')  # Convert to base64 string
        print("PDF file successfully encoded to base64")
        print(f"Converting: {pdf_file_path} → {output_path}")
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return

    # Prepare the payload (data) to send to the API
    # This payload configures the PDF to Word conversion settings
    payload = {
        "docContent": pdf_base64,    # Base64 encoded PDF document content
        "docName": "test.pdf",       # Name of the source PDF file for reference
        "qualityType": "Draft",      # Quality setting: Draft (faster) or Quality (better accuracy)
        "language": "English",       # OCR language for text recognition in images/scanned PDFs
        "mergeAllSheets": True,      # Combine multiple pages into single document flow
        "outputFormat": True,        # Preserve original formatting when possible
        "ocrWhenNeeded": True,       # Use OCR (Optical Character Recognition) for scanned PDFs
        "async": True                # Enable asynchronous processing
    }
    
    # About PDF to Word conversion features:
    # - qualityType "Draft": Faster conversion, good for simple PDFs with clear text
    # - qualityType "Quality": Slower but more accurate, better for complex layouts
    # - mergeAllSheets: Maintains document flow across multiple PDF pages
    # - ocrWhenNeeded: Essential for scanned PDFs or PDFs with image-based text
    # - language: Improves OCR accuracy for non-English text recognition
    # - outputFormat: Tries to maintain original fonts, colors, paragraph styles, and layout

    # Set up HTTP headers for the API request
    # Headers provide authentication and specify the data format being sent
    headers = {
        'Authorization': f'Basic {api_key}',  # Authentication using Basic auth with API key
        'Content-Type': 'application/json'    # We're sending JSON data to the API
    }

    # Send the initial conversion request to the API
    print("Sending PDF to Word conversion request to PDF4Me API...")
    print("Transforming PDF content into editable Word document format...")
    response = requests.post(
        url,
        json=payload,      # Send the payload as JSON
        headers=headers,   # Include authentication headers
        verify=False       # Skip SSL certificate verification
    )

    # Display debug information about the API response
    print(f"Status code: {response.status_code}")
    print(f"Response headers: {response.headers}")
    print(f"Response content length: {len(response.content)}")

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 means "Success" - conversion completed successfully
        print("PDF to Word conversion completed successfully!")
        
        # Validate the response contains Word document data
        if len(response.content) > 1000:  # Word files are typically larger than 1KB
            with open(output_path, 'wb') as out_file:
                out_file.write(response.content)
            print(f"Word document saved successfully to: {output_path}")
            print("PDF content has been transformed into editable Word document format")
            print("You can now open the file in Microsoft Word, LibreOffice Writer, or Google Docs")
        else:
            print("Warning: Response seems too small to be a valid Word document")
            print(f"Response size: {len(response.content)} bytes")
        return
        
    elif response.status_code == 202:
        # 202 means "Accepted" - API is processing the conversion asynchronously
        print("Request accepted. PDF4Me is processing the conversion asynchronously...")
        
        # Get the polling URL from the Location header
        # This URL is used to check the conversion progress and retrieve the result
        location_url = response.headers.get('Location')
        if not location_url:
            print("No 'Location' header found in the response.")
            print("Cannot proceed without polling URL for checking conversion status.")
            return

        print(f"Polling URL: {location_url}")

        # Retry logic for polling the conversion result
        max_retries = 10    # Maximum number of polling attempts before timeout
        retry_delay = 10    # seconds to wait between each polling attempt

        # Poll the API until conversion is complete or timeout occurs
        for attempt in range(max_retries):
            print(f"Waiting for conversion result... (Attempt {attempt + 1}/{max_retries})")
            print("Processing PDF content and creating editable Word document...")
            time.sleep(retry_delay)  # Wait before checking status again

            # Check the conversion status by calling the polling URL
            try:
                response_conversion = requests.get(location_url, headers=headers, verify=False)
                
                # Display current status for debugging and user feedback
                print(f"Response status code: {response_conversion.status_code}")
                
                if response_conversion.status_code == 200:
                    # Conversion completed successfully - save the Word document
                    print("PDF to Word conversion completed successfully!")
                    
                    # Validate the response contains Word document data
                    if len(response_conversion.content) > 1000:  # Word files are typically larger than 1KB
                        with open(output_path, 'wb') as out_file:
                            out_file.write(response_conversion.content)
                        print(f"Word document saved successfully to: {output_path}")
                        print("PDF content has been transformed into editable Word document format")
                        print("You can now open the file in Microsoft Word, LibreOffice Writer, or Google Docs")
                    else:
                        print("Warning: Response seems too small to be a valid Word document")
                        print(f"Response size: {len(response_conversion.content)} bytes")
                    return
                    
                elif response_conversion.status_code == 202:
                    # Still processing, continue polling
                    print("Conversion still in progress...")
                    continue
                else:
                    # Error occurred during processing
                    print(f"Error during polling. Status code: {response_conversion.status_code}")
                    print(f"Response text: {response_conversion.text}")
                    return
                    
            except requests.exceptions.RequestException as e:
                # Handle network or request errors during polling
                print(f"Request failed during polling: {str(e)}")
                if attempt < max_retries - 1:  # Don't sleep on the last attempt
                    print("Network error occurred, retrying...")
                    continue
                else:
                    print("Max retries reached due to network errors. Giving up.")
                    return

        # If we reach here, polling timed out
        print("Timeout: PDF to Word conversion did not complete after multiple retries.")
        print("The conversion may be taking longer due to PDF complexity or server load.")
        print("Please check if the PDF file is valid and try again later.")
        
    else:
        # All other status codes are errors
        print(f"Error: Failed to convert PDF to Word. Status code: {response.status_code}")
        print(f"Response text: {response.text}")
        return

# Main execution - Run the conversion when script is executed directly
if __name__ == "__main__":
    print("Starting PDF to Word Conversion Process...")
    print("This transforms PDF content into editable Word document format")
    print("Perfect for converting contracts, reports, and documents back to editable format")
    print("The process handles both text-based and scanned PDFs using OCR technology")
    print("Preserves formatting, fonts, paragraphs, and document structure")
    print("-" * 80)
    convert_pdf_to_word()
