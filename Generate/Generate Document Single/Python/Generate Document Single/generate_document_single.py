import base64
import requests
import time
import json

def read_and_encode_file(file_path):
    """
    Read and encode file to base64 string
    
    Args:
        file_path (str): Path to the file
        
    Returns:
        str: Base64 encoded string of the file
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        Exception: For other file reading errors
    """
    try:
        with open(file_path, 'rb') as file:
            file_content = file.read()
            return base64.b64encode(file_content).decode('utf-8')
    except FileNotFoundError:
        raise FileNotFoundError(f"File not found: {file_path}")
    except Exception as e:
        raise Exception(f"Error reading file: {str(e)}")

def read_json_data(json_file_path):
    """
    Read JSON data from file
    
    Args:
        json_file_path (str): Path to the JSON data file
        
    Returns:
        str: JSON data as string
        
    Raises:
        FileNotFoundError: If the JSON file doesn't exist
        Exception: For other file reading errors
    """
    try:
        with open(json_file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"JSON data file not found: {json_file_path}")
    except Exception as e:
        raise Exception(f"Error reading JSON data file: {str(e)}")

def generate_document_single(api_key, base_url, template_file_path, json_data_path):
    """
    Generate single document using PDF4me API
    
    Args:
        api_key (str): API key for authentication
        base_url (str): Base URL for PDF4me API
        template_file_path (str): Path to the template file
        json_data_path (str): Path to the JSON data file
        
    Returns:
        requests.Response: Response from the API
        
    Raises:
        Exception: For API request errors
    """
    try:
        # Read and encode the template file
        template_base64 = read_and_encode_file(template_file_path)
        
        # Read the JSON data
        json_data = read_json_data(json_data_path)
        
        # API endpoint for generating single document
        url = f"{base_url}api/v2/GenerateDocumentSingle"
        
        # Request headers
        headers = {
            'Authorization': f'Basic {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Request payload for HTML template with JSON data
        payload = {
            "templateFileType": "html",              # Template file type (Word/HTML/PDF)
            "templateFileName": "invoice_template.html",  # Template file name with proper extension
            "templateFileData": template_base64,     # Base64 encoded template file content
            "documentDataType": "text",              # Document data type (JSON/XML)
            "outputType": "html",                    # Output document type (PDF/Word/Excel/HTML)
            "documentDataText": json_data,           # JSON/XML data as text (required if documentDataFile not mapped)
            "async": True                            # For big files and too many calls async is recommended to reduce the server load
        }
        
        # Alternative payload examples for different scenarios:
        
        # Example 1: Word template with JSON data outputting to PDF
        # payload = {
        #     "templateFileType": "Word",              # Template file type
        #     "templateFileName": "template.docx",     # Word template file name
        #     "templateFileData": template_base64,     # Base64 encoded Word template
        #     "documentDataType": "JSON",              # Data type
        #     "outputType": "PDF",                     # Output as PDF
        #     "documentDataText": json_data,           # JSON data as text
        #     "metaDataJson": "{}",                    # Additional metadata for fields in JSON format
        #     "async": True
        # }
        
        # Example 2: PDF template with XML data outputting to Word
        # payload = {
        #     "templateFileType": "PDF",               # PDF template file type
        #     "templateFileName": "template.pdf",      # PDF template file name
        #     "templateFileData": template_base64,     # Base64 encoded PDF template
        #     "documentDataType": "XML",               # XML data type
        #     "outputType": "Word",                    # Output as Word document
        #     "documentDataText": xml_data,            # XML data as text
        #     "metaDataJson": "{}",                    # Additional metadata
        #     "async": True
        # }
        
        # Example 3: HTML template with JSON data outputting to Excel
        # payload = {
        #     "templateFileType": "HTML",              # HTML template file type
        #     "templateFileName": "template.html",     # HTML template file name
        #     "templateFileData": template_base64,     # Base64 encoded HTML template
        #     "documentDataType": "JSON",              # JSON data type
        #     "outputType": "Excel",                   # Output as Excel file
        #     "documentDataText": json_data,           # JSON data as text
        #     "metaDataJson": "{}",                    # Additional metadata
        #     "async": True
        # }
        
        # Example 4: Word template with data file (instead of text)
        # payload = {
        #     "templateFileType": "Word",              # Template file type
        #     "templateFileName": "template.docx",     # Word template file name
        #     "templateFileData": template_base64,     # Base64 encoded Word template
        #     "documentDataType": "JSON",              # Data type
        #     "outputType": "PDF",                     # Output as PDF
        #     "documentDataFile": data_file_base64,    # Base64 encoded data file (alternative to documentDataText)
        #     "metaDataJson": "{}",                    # Additional metadata
        #     "async": True
        # }
        
        # Example 5: Complete payload with all optional parameters
        # payload = {
        #     "templateFileType": "DOCX",              # Template file type (default: DOCX)
        #     "templateFileName": "invoice.docx",      # Template file name with extension
        #     "templateFileData": template_base64,     # Base64 encoded template content
        #     "documentDataType": "JSON",              # Data type (default: JSON)
        #     "outputType": "PDF",                     # Output type (default: DOCX)
        #     "documentDataFile": data_file_base64,    # Base64 encoded data file
        #     "documentDataText": json_data,           # Manual data entry (use if documentDataFile not mapped)
        #     "fileMetaData": "{}",                    # Any additional metadata for fields
        #     "metaDataJson": "{}",                    # Output metadata in JSON format
        #     "async": True
        # }
        
        print("Sending generate document single request...")
        response = requests.post(url, headers=headers, json=payload)
        return response
        
    except Exception as e:
        raise Exception(f"Error in generate document single request: {str(e)}")

def handle_async_response_and_save(response, api_key, output_path):
    """
    Handle API response and save the generated document
    
    Args:
        response (requests.Response): Response from the generate document single API
        api_key (str): API key for authentication  
        output_path (str): Path where the generated document will be saved
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if response.status_code == 200:
            # Success: Simple success message + file saved
            print("Document generation completed successfully!")
            
            # Save the generated document
            with open(output_path, 'wb') as output_file:
                output_file.write(response.content)
            print(f"Generated document saved to: {output_path}")
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
                    print("Document generation completed successfully!")
                    
                    # Save the generated document
                    with open(output_path, 'wb') as output_file:
                        output_file.write(poll_response.content)
                    print(f"Generated document saved to: {output_path}")
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
            
            print("Timeout: Document generation did not complete after multiple retries.")
            return False
            
        else:
            # Other codes: Error message with status code and response text
            print(f"Document generation failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error handling response: {str(e)}")
        return False

def main():
    """
    Main function to generate single document
    """
    try:
        # API Configuration - PDF4me service for generating single document
        api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
        template_file_path = "invoice_sample.html"  # Path to the template file
        json_data_path = "invoice_sample_data.json"  # Path to the JSON data file
        output_path = "invoice_sample.generated.html"  # Output document file name
        
        # API endpoint for generating single document
        base_url = "https://api.pdf4me.com/"
        
        print("=== Generating Single Document ===")
        print(f"Template file: {template_file_path}")
        print(f"JSON data file: {json_data_path}")
        print(f"Output file: {output_path}")
        
        # Generate single document
        response = generate_document_single(api_key, base_url, template_file_path, json_data_path)
        
        # Handle response and save result
        success = handle_async_response_and_save(response, api_key, output_path)
        
        if success:
            print("Document generation operation completed successfully!")
        else:
            print("Document generation operation failed!")
            
    except Exception as e:
        print(f"Error in main execution: {str(e)}")

if __name__ == "__main__":
    main()
