import requests
import base64
import os
import time

def linearize_pdf():
    """
    Linearize a PDF document using PDF4Me API
    Process: Read PDF file → Encode to base64 → Send API request → Handle response → Save linearized PDF
    PDF linearization optimizes documents for web viewing with faster loading and progressive display
    """
    
    # API Configuration - PDF4Me service for linearizing PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
    input_path = "sample.pdf"  # Path to input PDF file
    output_path = "Linearize_PDF_output.pdf"        # Output linearized PDF file name
    
    # API endpoint for PDF linearization
    url = "https://api.pdf4me.com/api/v2/LinearizePdf"

    # Check if the input PDF file exists before proceeding
    if not os.path.exists(input_path):
        print(f"Error: Input file not found at {input_path}")
        return

    # Read the PDF file and convert it to base64 encoding
    # Base64 encoding is required because the API expects text format, not binary data
    try:
        with open(input_path, "rb") as f:
            pdf_content = f.read()  # Read file as binary data
            pdf_base64 = base64.b64encode(pdf_content).decode("utf-8")  # Convert to base64 string
        print("PDF file successfully encoded to base64")
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return

    # Prepare the payload (data) to send to the API
    # This payload configures the linearization and optimization settings
    payload = {
        "docContent": pdf_base64,     # Base64 encoded PDF document content
        "docName": "output.pdf",      # Name for the output file
        "optimizeProfile": "web",     # Optimization: web/Max/Print/Default/WebMax/PrintMax/PrintGray/Compress/CompressMax
        "async": True                 # Enable asynchronous processing
    }
    
    # Available optimization profiles:
    # - "web": Optimized for web viewing (fast loading, progressive display)
    # - "Max": Maximum compression (smallest file size, slower processing)
    # - "Print": Optimized for printing (correct fonts, colors, resolution)
    # - "Default": Standard optimization balance
    # - "WebMax": Maximum web optimization (best for online viewing)
    # - "PrintMax": Maximum print optimization (best quality for printing)
    # - "PrintGray": Print optimized with grayscale conversion
    # - "Compress": General compression without specific optimization
    # - "CompressMax": Maximum compression with aggressive size reduction

    # Set up HTTP headers for the API request
    # Headers tell the server about authentication and content type
    headers = {
        "Authorization": f"Basic {api_key}",  # Authentication using Basic auth with API key
        "Content-Type": "application/json"    # We're sending JSON data
    }

    # Send the initial linearization request to the API
    print("Sending request to PDF4Me API...")
    print(f"Linearizing: {input_path} → {output_path}")
    print(f"Optimization profile: {payload['optimizeProfile']}")
    print("Optimizing PDF for web viewing and faster loading...")
    response = requests.post(url, json=payload, headers=headers, verify=False)

    # Display debug information about the API response
    print(f"Status code: {response.status_code}")
    print(f"Response headers: {response.headers}")
    print(f"Response content length: {len(response.content)}")
    
    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 means "Success" - linearization completed successfully
        print("PDF linearization completed successfully!")
        
        # Check if response is a binary PDF file
        if (response.headers.get('content-type', '').startswith('application/pdf') or 
            response.headers.get('content-type', '') == 'application/octet-stream' or 
            response.content.startswith(b'%PDF')):
            print("Response is a direct PDF file")
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"Linearized PDF saved to {output_path}")
            print("PDF is now optimized for web viewing and faster loading")
            return
        
        # Try to parse JSON response if it's not a binary PDF
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
                    print(f"Linearized PDF saved to {output_path}")
                    print("PDF is now optimized for web viewing and faster loading")
                except Exception as e:
                    print(f"Error saving PDF: {e}")
            else:
                print("No PDF data found in the response.")
                print("Full response:", result)
                
        except Exception as e:
            print(f"Failed to parse JSON response: {e}")
            print(f"Raw response text: {response.text[:500]}...")  # Show first 500 characters
            
    elif response.status_code == 202:
        # 202 means "Accepted" - API is processing the linearization asynchronously
        print("Request accepted. PDF4Me is processing asynchronously...")
        
        # Get the polling URL from the Location header for checking status
        location_url = response.headers.get('Location')
        if not location_url:
            print("No 'Location' header found in the response.")
            return

        # Retry logic for polling the result
        max_retries = 10    # Maximum number of polling attempts
        retry_delay = 10    # seconds between each polling attempt

        # Poll the API until linearization is complete
        for attempt in range(max_retries):
            print(f"Waiting for result... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)  # Wait before next attempt

            # Check the linearization status by calling the polling URL
            response_conversion = requests.get(location_url, headers=headers, verify=False)

            if response_conversion.status_code == 200:
                # Linearization completed successfully
                print("PDF linearization completed successfully!")
                
                # Validate and save the linearized PDF
                if (response_conversion.content.startswith(b'%PDF') or 
                    len(response_conversion.content) > 1000):
                    with open(output_path, 'wb') as out_file:
                        out_file.write(response_conversion.content)
                    print(f"Linearized PDF saved successfully to: {output_path}")
                    print("PDF is now optimized for web viewing and faster loading")
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
        print("Timeout: PDF linearization did not complete after multiple retries.")
        
    else:
        # All other status codes are errors
        print(f"Error: Failed to linearize PDF. Status code: {response.status_code}")
        print(f"Response text: {response.text}")
        return

# Main execution - Run the linearization when script is executed directly
if __name__ == "__main__":
    print("Starting PDF Linearization Process...")
    print("This optimizes PDF documents for web viewing with faster loading")
    print("Linearized PDFs display progressively as they download")
    print("Perfect for web applications and online document viewing")
    print("-" * 65)
    linearize_pdf()
