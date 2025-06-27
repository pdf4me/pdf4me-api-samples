import base64
import requests
import time
import json
import os

def read_and_encode_word(file_path):
    """
    Read Word document file and convert it to base64 encoding
    
    Args:
        file_path (str): Path to the Word document file to be processed
        
    Returns:
        str: Base64 encoded content of the Word document file
        
    Raises:
        FileNotFoundError: If the specified file doesn't exist
        Exception: For any other file reading errors
    """
    # Check if file exists before attempting to read
    if not os.path.exists(file_path):
        print(f"Error: Word document file not found at {file_path}")
        raise FileNotFoundError(f"Word document file not found: {file_path}")
    
    try:
        # Read the Word document file in binary mode
        with open(file_path, 'rb') as word_file:
            word_content = word_file.read()
        
        # Convert binary content to base64 string
        base64_content = base64.b64encode(word_content).decode('utf-8')
        print(f"Word document file read successfully: {len(word_content)} bytes")
        
        return base64_content
    
    except Exception as e:
        print(f"Error reading Word document file: {e}")
        raise

def get_tracking_changes_word(api_key, base_url, word_file_path):
    """
    Get tracking changes from Word document using PDF4me API
    
    Args:
        api_key (str): API key for authentication
        base_url (str): Base URL for PDF4me API
        word_file_path (str): Path to the input Word document file
        
    Returns:
        requests.Response: Response from the API
        
    Raises:
        Exception: For API request errors
    """
    try:
        # Read and encode the Word document file
        word_base64 = read_and_encode_word(word_file_path)
        
        # API endpoint for getting tracking changes from Word documents
        url = f"{base_url}api/v2/GetTrackingChangesInWord"
        
        # Request headers
        headers = {
            'Authorization': f'Basic {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Request payload for getting tracking changes (following C# logic)
        payload = {
            "docName": "output.docx",      # Output document name
            "docContent": word_base64,     # Base64 encoded Word document content
            "async": True                  # For big files and too many calls async is recommended to reduce the server load
        }
        
        print("Sending get tracking changes request...")
        response = requests.post(url, headers=headers, json=payload)
        return response
        
    except Exception as e:
        raise Exception(f"Error in get tracking changes request: {str(e)}")

def handle_async_response_and_save(response, api_key, output_path):
    """
    Handle API response and save the tracking changes JSON file
    Following the C# logic for response processing
    
    Args:
        response (requests.Response): Response from the get tracking changes API
        api_key (str): API key for authentication  
        output_path (str): Path where the tracking changes JSON will be saved
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if response.status_code == 200:
            # Success: Simple success message + file saved
            print("Getting tracking changes completed successfully!")
            
            # Read the tracking changes JSON content from the response (following C# logic)
            result_json = response.text
            
            # Save the tracking changes JSON to the output path
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write(result_json)
            print(f"Tracking changes JSON saved to: {output_path}")
            return True
            
        elif response.status_code == 202:
            # Accepted: Asynchronous processing with retry logic
            print("Request accepted. Processing asynchronously...")
            
            # Extract the polling URL from response headers for checking processing status
            location_url = response.headers.get('Location')
            if not location_url:
                print("No 'Location' header found in the response.")
                return False
            
            print(f"Polling URL: {location_url}")
            
            # Poll for completion with retry logic for long-running operations
            max_retries = 10
            retry_delay = 10  # seconds between polling attempts
            
            headers = {
                'Authorization': f'Basic {api_key}'
            }
            
            for attempt in range(max_retries):
                print(f"Polling attempt {attempt + 1}/{max_retries}...")
                # Wait before polling to avoid overwhelming the server
                time.sleep(retry_delay)
                
                # Create polling request to check if processing is complete
                poll_response = requests.get(location_url, headers=headers)
                
                # Handle successful completion of tracking changes retrieval
                if poll_response.status_code == 200:
                    print("Getting tracking changes completed successfully!")
                    
                    # Save the tracking changes JSON
                    result_json = poll_response.text
                    with open(output_path, 'w', encoding='utf-8') as output_file:
                        output_file.write(result_json)
                    print(f"Tracking changes JSON saved to: {output_path}")
                    return True
                    
                # Continue polling if still being processed
                elif poll_response.status_code == 202:
                    print("Still processing, waiting...")
                    continue
                    
                # Handle polling errors
                else:
                    print(f"Polling error: {poll_response.status_code}")
                    print(f"Response: {poll_response.text}")
                    return False
            
            # Timeout if processing doesn't complete within retry limit
            print("Timeout: Getting tracking changes did not complete after multiple retries.")
            return False
            
        else:
            # Other codes: Error message with status code and response text
            print(f"Getting tracking changes failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error handling response: {str(e)}")
        return False

def main():
    """
    Main function to get tracking changes from Word document
    This program demonstrates how to retrieve tracking changes from Word documents using the PDF4ME API
    The program reads a Word document and extracts all tracking changes information as JSON
    """
    try:
        # API Configuration - PDF4me service for getting tracking changes from Word documents
        api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
        word_file_path = "sample.docx"  # Path to the main Word document file
        output_path = "sample.tracking_changes.json"  # Output JSON file name with tracking changes
        
        # API endpoint for getting tracking changes from Word documents
        base_url = "https://api.pdf4me.com/"
        
        print("=== Getting Tracking Changes from Word Document ===")
        print(f"Input Word file: {word_file_path}")
        print(f"Output JSON file: {output_path}")
        print("Extracting tracking changes information...")
        
        # Get tracking changes from Word document
        response = get_tracking_changes_word(api_key, base_url, word_file_path)
        
        # Handle response and save result
        success = handle_async_response_and_save(response, api_key, output_path)
        
        if success:
            print("Get tracking changes operation completed successfully!")
            print(f"Input file: {word_file_path}")
            print(f"Tracking changes JSON: {output_path}")
            print("All tracking changes have been extracted and saved as JSON")
            print("The JSON contains details about all revisions, comments, and changes")
        else:
            print("Get tracking changes operation failed!")
            
    except Exception as e:
        print(f"Error in main execution: {str(e)}")
        print("Please check your input file and API configuration")

if __name__ == "__main__":
    main()
