import requests
import base64
import os
import time

def convert_word_to_pdf_form():
    """
    Convert a Word document to PDF form using PDF4Me API
    Process: Read Word file → Encode to base64 → Send API request → Handle response → Save PDF form
    """
    
    # API Configuration - PDF4Me service for converting Word to PDF forms
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
    input_path = "sample.docx"  # Path to input Word document
    output_path = "Word_to_PDF_Form_output.pdf"          # Output PDF form file name
    
    # API endpoint for Word to PDF form conversion
    url = "https://api.pdf4me.com/api/v2/ConvertWordToPdfForm"

    # Step 1: Check if the input Word file exists
    if not os.path.exists(input_path):
        print(f"Error: Input file not found at {input_path}")
        return

    # Step 2: Read the Word file and convert it to base64 encoding
    # Base64 encoding is required because the API expects text format, not binary data
    try:
        with open(input_path, "rb") as f:
            word_content = f.read()  # Read file as binary data
            word_base64 = base64.b64encode(word_content).decode("utf-8")  # Convert to base64 string
        print("Word file successfully encoded to base64")
    except Exception as e:
        print(f"Error reading Word file: {e}")
        return

    # Step 3: Prepare the payload (data) to send to the API
    # This is the minimal payload required for Word to PDF form conversion
    payload = {
        "docContent": word_base64,    # Base64 encoded Word document content
        "docName": "output.pdf",      # Name for the output PDF file
        "async": True                 # Enable asynchronous processing
    }

    # Step 4: Set up HTTP headers for the API request
    # Headers tell the server about authentication and content type
    headers = {
        "Authorization": f"Basic {api_key}",  # Authentication using Basic auth with API key
        "Content-Type": "application/json"    # We're sending JSON data
    }

    # Step 5: Send the initial conversion request to the API
    print("Sending request to PDF4Me API...")
    print(f"Converting: {input_path} → {output_path}")
    response = requests.post(url, json=payload, headers=headers, verify=False)

    # Step 6: Display debug information about the API response
    print(f"Status code: {response.status_code}")
    print(f"Response headers: {response.headers}")
    print(f"Response content length: {len(response.content)}")
    
    # Step 7: Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 means "Success" - conversion completed successfully
        print("Word to PDF form conversion completed successfully!")
        
        # Step 8a: Check if response is a binary PDF file
        if (response.headers.get('content-type', '').startswith('application/pdf') or 
            response.headers.get('content-type', '') == 'application/octet-stream' or 
            response.content.startswith(b'%PDF')):
            print("Response is a direct PDF file")
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"PDF form saved to {output_path}")
            return
        
        # Step 8b: Try to parse JSON response if it's not a binary PDF
        try:
            result = response.json()
            print("Successfully parsed JSON response")
            
            # Look for PDF data in different possible JSON locations
            pdf_base64 = None
            if "document" in result and "docData" in result["document"]:
                pdf_base64 = result["document"]["docData"]  # Common location 1
            elif "docData" in result:
                pdf_base64 = result["docData"]              # Common location 2
            elif "data" in result:
                pdf_base64 = result["data"]                 # Alternative location
            
            if pdf_base64:
                try:
                    # Decode base64 PDF data and save to file
                    pdf_bytes = base64.b64decode(pdf_base64)
                    with open(output_path, "wb") as f:
                        f.write(pdf_bytes)
                    print(f"PDF form saved to {output_path}")
                except Exception as e:
                    print(f"Error saving PDF: {e}")
            else:
                print("No PDF data found in the response.")
                print("Full response:", result)
                
        except Exception as e:
            print(f"Failed to parse JSON response: {e}")
            print(f"Raw response text: {response.text[:500]}...")  # Show first 500 characters
            
    elif response.status_code == 202:
        # 202 means "Accepted" - API is processing the conversion asynchronously
        print("Request accepted. PDF4Me is processing asynchronously...")
        
        # Get the polling URL from the Location header
        location_url = response.headers.get('Location')
        if not location_url:
            print("No 'Location' header found in the response.")
            return

        # Retry logic for polling the result
        max_retries = 10    # Maximum number of polling attempts
        retry_delay = 10    # seconds between each polling attempt

        # Step 9: Poll the API until conversion is complete
        for attempt in range(max_retries):
            print(f"Waiting for result... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)  # Wait before next attempt

            # Check the conversion status by calling the polling URL
            response_conversion = requests.get(location_url, headers=headers, verify=False)

            if response_conversion.status_code == 200:
                # Conversion completed successfully
                print("Word to PDF form conversion completed successfully!")
                
                # Step 10: Validate and save the PDF form
                if (response_conversion.content.startswith(b'%PDF') or 
                    len(response_conversion.content) > 1000):
                    with open(output_path, 'wb') as out_file:
                        out_file.write(response_conversion.content)
                    print(f"PDF form saved successfully to: {output_path}")
                else:
                    print("Warning: Response doesn't appear to be a valid PDF")
                    print(f"First 100 bytes: {response_conversion.content[:100]}")
                return
                
            elif response_conversion.status_code == 202:
                # Still processing, continue polling
                print("Still processing...")
                continue
            else:
                # Error occurred during processing
                print(f"Error during polling. Status code: {response_conversion.status_code}")
                print(f"Response text: {response_conversion.text}")
                return

        # If we reach here, polling timed out
        print("Timeout: Word to PDF form conversion did not complete after multiple retries.")
        
    else:
        # All other status codes are errors
        print(f"Error: Failed to convert Word to PDF form. Status code: {response.status_code}")
        print(f"Response text: {response.text}")
        return

# Step 10: Main execution - Run the conversion when script is executed directly
if __name__ == "__main__":
    print("Starting Word to PDF Form conversion...")
    print("This converts Word documents into PDF forms with fillable fields")
    print("-" * 60)
    convert_word_to_pdf_form()
