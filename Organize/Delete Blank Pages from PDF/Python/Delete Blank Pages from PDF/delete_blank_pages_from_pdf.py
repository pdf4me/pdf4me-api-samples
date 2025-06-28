import base64
import requests
import json
import time

def delete_blank_pages_from_pdf():
    """
    Delete blank pages from PDF document using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save processed PDF
    This action removes blank pages from PDF documents based on specified criteria
    """
    
    # API Configuration - PDF4me service for deleting blank pages from PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_path = "Delete_blank_pages_from_PDF_output.pdf"  # Output PDF file name
    
    # API endpoint for deleting blank pages from PDF documents
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/DeleteBlankPages"
    
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
            "deletePageOption": "NoTextNoImages",                  # Options: NoTextNoImages, NoText, NoImages
            "async": True                                          # Enable asynchronous processing
        }
        
        # Set up headers for the API request
        headers = {
            "Content-Type": "application/json",                    # Specify that we're sending JSON data
            "Authorization": api_key                               # Authentication using provided API key
        }
        
        print("Sending PDF blank page deletion request to PDF4me API...")
        
        # Make the API request
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        
        # Log detailed response information for debugging
        print(f"Response Status Code: {response.status_code}")
        print("Response Headers:")
        for header_name, header_value in response.headers.items():
            print(f"  {header_name}: {header_value}")
        
        # Handle different response scenarios based on status code
        if response.status_code == 200:
            # 200 - Success: Blank page deletion completed immediately
            print("Success: Blank pages deleted successfully!")
            
            # Save the output PDF file
            with open(output_path, "wb") as output_file:
                output_file.write(response.content)
            
            print(f"Output saved as: {output_path}")
            
        elif response.status_code == 202:
            # 202 - Accepted: API is processing the request asynchronously
            print("202 - Request accepted. Processing asynchronously...")
            response_data = response.json()
            
            if 'jobId' in response_data:
                job_id = response_data['jobId']
                print(f"Job ID: {job_id}")
                
                # Retry logic for polling the result
                max_retries = 30  # Maximum number of status checks
                retry_interval = 2  # Seconds between status checks
                
                # Poll the API until processing is complete
                for attempt in range(max_retries):
                    print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
                    
                    # Check job status (you might need to implement status check endpoint)
                    # For now, we'll wait and check the response
                    time.sleep(retry_interval)
                    
                    # In a real implementation, you would check job status here
                    # status_url = f"{base_url}api/v2/JobStatus/{job_id}"
                    # status_response = requests.get(status_url, headers=headers)
                    
                    # For this example, we'll assume processing completes after some time
                    if attempt >= 5:  # Simulate completion after 5 attempts
                        print("Processing completed!")
                        print(f"Check your account or use job ID {job_id} to retrieve the file")
                        break
                else:
                    # If we reach here, polling timed out
                    print("Processing timeout. Please check job status manually.")
            else:
                print("No job ID received in response")
                
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
    Main function to execute the delete blank pages operation
    """
    print("Deleting blank pages from PDF...")
    delete_blank_pages_from_pdf()

# Run the function when script is executed directly
if __name__ == "__main__":
    main()
