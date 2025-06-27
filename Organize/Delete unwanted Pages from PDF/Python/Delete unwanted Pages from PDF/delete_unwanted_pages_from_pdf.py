import base64
import requests
import json
import time

def delete_unwanted_pages_from_pdf():
    """
    Delete unwanted pages from PDF document using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save processed PDF
    This action removes specified pages from PDF documents based on page numbers or ranges
    """
    
    # API Configuration - PDF4me service for deleting unwanted pages from PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_path = "Delete_unwanted_pages_from_PDF_output.pdf"  # Output PDF file name
    
    # API endpoint for deleting unwanted pages from PDF documents
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/DeletePages"
    
    try:
        # Read and encode the PDF file to base64
        print("Reading PDF file...")
        with open(pdf_file_path, "rb") as file:
            pdf_content = file.read()
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        
        print(f"PDF file read successfully: {pdf_file_path} ({len(pdf_content)} bytes)")
        
        # Prepare the API request payload
        payload = {
            "docContent": pdf_base64,                              # Base64 encoded PDF content
            "docName": "output.pdf",                               # Output PDF file name
            "pageNumbers": "2-4",                                    # Page numbers to delete (e.g. "2" or "1,3,5" or "2-4")
            "async": True                                          # Enable asynchronous processing
        }
        
        # Set up headers for the API request
        headers = {
            "Content-Type": "application/json",                    # Specify that we're sending JSON data
            "Authorization": api_key                               # Authentication using provided API key
        }
        
        print("Sending PDF page deletion request to PDF4me API...")
        
        # Make the API request
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        
        # Log detailed response information for debugging
        print(f"Response Status Code: {response.status_code}")
        print("Response Headers:")
        for header_name, header_value in response.headers.items():
            print(f"  {header_name}: {header_value}")
        
        # Handle different response scenarios based on status code
        if response.status_code == 200:
            # 200 - Success: Page deletion completed immediately
            print("Success: Unwanted pages deleted successfully!")
            
            # Save the output PDF file
            with open(output_path, "wb") as output_file:
                output_file.write(response.content)
            
            print(f"Output saved as: {output_path}")
            
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

            # Poll the API until page deletion is complete
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
                    print("Success! Page deletion completed!")
                    
                    # Save the processed PDF
                    with open(output_path, 'wb') as out_file:
                        out_file.write(response_conversion.content)
                    print(f"Processed PDF saved: {output_path}")
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
            print(f"Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except FileNotFoundError:
        print(f"Error: PDF file '{pdf_file_path}' not found!")
        print("Please make sure the PDF file exists in the same directory as this script.")
        
    except requests.exceptions.RequestException as e:
        print(f"Network Error: {e}")
        
    except Exception as e:
        print(f"Unexpected Error: {e}")

def main():
    """
    Main function to execute the delete unwanted pages operation
    """
    print("Deleting unwanted pages from PDF...")
    delete_unwanted_pages_from_pdf()

# Run the function when script is executed directly
if __name__ == "__main__":
    main()
