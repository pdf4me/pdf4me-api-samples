import base64
import requests
import time
import json

def read_and_encode_word(file_path):
    """
    Read and encode Word document file to base64 string
    
    Args:
        file_path (str): Path to the Word document file
        
    Returns:
        str: Base64 encoded string of the Word document
        
    Raises:
        FileNotFoundError: If the Word document file doesn't exist
        Exception: For other file reading errors
    """
    try:
        with open(file_path, 'rb') as file:
            file_content = file.read()
            return base64.b64encode(file_content).decode('utf-8')
    except FileNotFoundError:
        raise FileNotFoundError(f"Word document file not found: {file_path}")
    except Exception as e:
        raise Exception(f"Error reading Word document file: {str(e)}")

def enable_tracking_changes_word(api_key, base_url, word_file_path):
    """
    Enable tracking changes in Word document using PDF4me API
    
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
        
        # API endpoint for enabling tracking changes in Word documents
        url = f"{base_url}api/v2/EnableTrackingChangesInWord"
        
        # Request headers
        headers = {
            'Authorization': f'Basic {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Request payload
        payload = {
            "docName": "output.docx",      # Output document name
            "docContent": word_base64,     # Base64 encoded Word document content
            "async": True                  # For big files and too many calls async is recommended to reduce the server load
        }
        
        print("Sending enable tracking changes request...")
        response = requests.post(url, headers=headers, json=payload)
        return response
        
    except Exception as e:
        raise Exception(f"Error in enable tracking changes request: {str(e)}")

def handle_async_response_and_save(response, api_key, output_path):
    """
    Handle API response and save the Word document with tracking enabled
    
    Args:
        response (requests.Response): Response from the enable tracking changes API
        api_key (str): API key for authentication  
        output_path (str): Path where the Word document with tracking enabled will be saved
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if response.status_code == 200:
            # Success: Simple success message + file saved
            print("Enable tracking changes completed successfully!")
            
            # Save the Word document with tracking enabled
            with open(output_path, 'wb') as output_file:
                output_file.write(response.content)
            print(f"Word document with tracking enabled saved to: {output_path}")
            return True
            
        elif response.status_code == 202:
            # Accepted: Asynchronous processing with retry logic
            print("Request accepted. Processing asynchronously...")
            
            # Get the location URL for polling
            location_url = response.headers.get('Location')
            if not location_url:
                print("No 'Location' header found in the response.")
                return False
            
            print(f"Polling URL: {location_url}")
            
            # Poll for completion with retry logic
            max_retries = 20
            retry_delay = 10  # seconds
            
            headers = {
                'Authorization': f'Basic {api_key}'
            }
            
            for attempt in range(max_retries):
                print(f"Polling attempt {attempt + 1}/{max_retries}...")
                time.sleep(retry_delay)
                
                poll_response = requests.get(location_url, headers=headers)
                
                if poll_response.status_code == 200:
                    # Processing completed successfully
                    print("Enable tracking changes completed successfully!")
                    
                    # Save the Word document with tracking enabled
                    with open(output_path, 'wb') as output_file:
                        output_file.write(poll_response.content)
                    print(f"Word document with tracking enabled saved to: {output_path}")
                    return True
                    
                elif poll_response.status_code == 202:
                    # Still processing, continue polling
                    print("Still processing, waiting...")
                    continue
                    
                else:
                    # Error in polling
                    print(f"Polling error: {poll_response.status_code}")
                    print(f"Response: {poll_response.text}")
                    return False
            
            print("Timeout: Enable tracking changes did not complete after multiple retries.")
            return False
            
        else:
            # Other codes: Error message with status code and response text
            print(f"Enable tracking changes failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error handling response: {str(e)}")
        return False

def main():
    """
    Main function to enable tracking changes in Word document
    """
    try:
        # API Configuration - PDF4me service for enabling tracking changes in Word documents
        api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
        word_file_path = "sample.docx"  # Path to the main Word document file
        output_path = "sample.tracking.docx"  # Output Word document file name
        
        # API endpoint for enabling tracking changes in Word documents
        base_url = "https://api.pdf4me.com/"
        
        print("=== Enabling Tracking Changes in Word Document ===")
        print(f"Input file: {word_file_path}")
        print(f"Output file: {output_path}")
        
        # Enable tracking changes in Word document
        response = enable_tracking_changes_word(api_key, base_url, word_file_path)
        
        # Handle response and save result
        success = handle_async_response_and_save(response, api_key, output_path)
        
        if success:
            print("Enable tracking changes operation completed successfully!")
        else:
            print("Enable tracking changes operation failed!")
            
    except Exception as e:
        print(f"Error in main execution: {str(e)}")

if __name__ == "__main__":
    main()
