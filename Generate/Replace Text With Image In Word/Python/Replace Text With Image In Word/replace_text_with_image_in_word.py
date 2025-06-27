import base64
import requests
import time
import json
import os

def read_and_encode_file(file_path):
    """
    Read file and convert it to base64 encoding
    
    Args:
        file_path (str): Path to the file to be processed
        
    Returns:
        str: Base64 encoded content of the file
        
    Raises:
        FileNotFoundError: If the specified file doesn't exist
        Exception: For any other file reading errors
    """
    # Check if file exists before attempting to read
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        raise FileNotFoundError(f"File not found: {file_path}")
    
    try:
        # Read the file in binary mode
        with open(file_path, 'rb') as file:
            file_content = file.read()
        
        # Convert binary content to base64 string
        base64_content = base64.b64encode(file_content).decode('utf-8')
        print(f"File read successfully: {len(file_content)} bytes")
        
        return base64_content
    
    except Exception as e:
        print(f"Error reading file: {e}")
        raise

def replace_text_with_image_word(api_key, base_url, word_file_path, image_file_path):
    """
    Replace text with image in Word document using PDF4me API
    
    Args:
        api_key (str): API key for authentication
        base_url (str): Base URL for PDF4me API
        word_file_path (str): Path to the input Word document file
        image_file_path (str): Path to the input image file
        
    Returns:
        requests.Response: Response from the API
        
    Raises:
        Exception: For API request errors
    """
    try:
        # Read and encode the Word document file
        word_base64 = read_and_encode_file(word_file_path)
        
        # Read and encode the image file
        image_base64 = read_and_encode_file(image_file_path)
        
        # API endpoint for replacing text with image in Word documents
        url = f"{base_url}api/v2/ReplaceTextWithImageInWord"
        
        # Request headers
        headers = {
            'Authorization': f'Basic {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Request payload for replacing text with image (following C# logic)
        payload = {
            "docName": "output.docx",           # Output document name
            "docContent": word_base64,          # Base64 encoded Word document content
            "ImageFileName": "sample.png",       # Image file name
            "ImageFileContent": image_base64,   # Base64 encoded image content
            "IsFirstPageSkip": False,           # Whether to skip the first page
            "PageNumbers": "1",                 # Page numbers to process
            "SearchText": "SIGN_HERE",           # Text to search and replace
            "async": True                       # For big files and too many calls async is recommended to reduce the server load
        }
        
        print("Sending replace text with image request...")
        response = requests.post(url, headers=headers, json=payload)
        return response
        
    except Exception as e:
        raise Exception(f"Error in replace text with image request: {str(e)}")

def handle_async_response_and_save(response, api_key, output_path):
    """
    Handle API response and save the modified Word document
    Following the C# logic for response processing
    
    Args:
        response (requests.Response): Response from the replace text with image API
        api_key (str): API key for authentication  
        output_path (str): Path where the modified Word document will be saved
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if response.status_code == 200:
            # Success: Simple success message + file saved
            print("Text replacement with image completed successfully!")
            
            # Read the modified Word document content from the response (following C# logic)
            result_bytes = response.content
            
            # Save the modified Word document to the output path
            with open(output_path, 'wb') as output_file:
                output_file.write(result_bytes)
            print(f"Modified Word document saved to: {output_path}")
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
                
                # Handle successful completion of text replacement
                if poll_response.status_code == 200:
                    print("Text replacement with image completed successfully!")
                    
                    # Save the modified Word document
                    result_bytes = poll_response.content
                    with open(output_path, 'wb') as output_file:
                        output_file.write(result_bytes)
                    print(f"Modified Word document saved to: {output_path}")
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
            print("Timeout: Text replacement did not complete after multiple retries.")
            return False
            
        else:
            # Other codes: Error message with status code and response text
            print(f"Text replacement failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error handling response: {str(e)}")
        return False

def main():
    """
    Main function to replace text with image in Word document
    This program demonstrates how to replace text with images in Word documents using the PDF4ME API
    The program reads a Word document and an image file, then replaces specified text with the image
    """
    try:
        # API Configuration - PDF4me service for replacing text with image in Word documents
        api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
        word_file_path = "sample.docx"  # Path to the main Word document file
        image_file_path = "sample.png"  # Path to the image file
        output_path = "sample.modified.docx"  # Output Word document file name
        
        # API endpoint for replacing text with image in Word documents
        base_url = "https://api.pdf4me.com/"
        
        print("=== Replacing Text with Image in Word Document ===")
        print(f"Input Word file: {word_file_path}")
        print(f"Input image file: {image_file_path}")
        print(f"Output file: {output_path}")
        print("Replacing text 'Djokovic' with image...")
        
        # Replace text with image in Word document
        response = replace_text_with_image_word(api_key, base_url, word_file_path, image_file_path)
        
        # Handle response and save result
        success = handle_async_response_and_save(response, api_key, output_path)
        
        if success:
            print("Replace text with image operation completed successfully!")
            print(f"Input Word file: {word_file_path}")
            print(f"Input image file: {image_file_path}")
            print(f"Modified Word file: {output_path}")
            print("Text has been successfully replaced with the image")
        else:
            print("Replace text with image operation failed!")
            
    except Exception as e:
        print(f"Error in main execution: {str(e)}")
        print("Please check your input files and API configuration")

if __name__ == "__main__":
    main()
