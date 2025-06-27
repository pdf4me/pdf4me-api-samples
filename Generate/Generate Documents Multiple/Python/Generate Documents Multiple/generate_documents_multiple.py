import base64
import requests
import time
import json
import os

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

def generate_documents_multiple(api_key, base_url, template_file_path, json_data_path, output_type="docx"):
    """
    Generate multiple documents using PDF4me API
    
    Args:
        api_key (str): API key for authentication
        base_url (str): Base URL for PDF4me API
        template_file_path (str): Path to the template file
        json_data_path (str): Path to the JSON data file
        output_type (str): Output format type (pdf, docx, html)
        
    Returns:
        requests.Response: Response from the API
        
    Raises:
        Exception: For API request errors
    """
    try:
        # Verify that the input DOCX template file exists
        if not os.path.exists(template_file_path):
            raise FileNotFoundError(f"DOCX file not found: {template_file_path}")
        
        # Read and encode the template file
        template_base64 = read_and_encode_file(template_file_path)
        
        # Read the JSON data
        json_data = read_json_data(json_data_path)
        
        # API endpoint for generating multiple documents
        url = f"{base_url}api/v2/GenerateDocumentMultiple"
        
        # Request headers
        headers = {
            'Authorization': f'Basic {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Request payload for multiple document generation (following C# logic)
        payload = {
            "templateFileType": "Docx",                    # Type of the template file
            "templateFileName": "sample.docx",             # Name of the template file
            "templateFileData": template_base64,           # Base64 encoded template content
            "documentDataType": "Json",                    # Type of data being provided
            "outputType": "Docx",                          # Desired output format
            "documentDataText": json_data,                 # JSON data to merge into template
            "async": True                                  # For big files and too many calls async is recommended to reduce the server load
        }
        
        # Alternative payload examples for different scenarios:
        
        # Example 1: Word template with JSON data outputting to PDF
        # payload = {
        #     "templateFileType": "Word",                  # Template file type (Word/HTML/PDF)
        #     "templateFileName": "sample.docx",           # Word template file name with extension
        #     "templateFileData": template_base64,         # Base64 encoded Word template content
        #     "documentDataType": "Json",                  # Data type (Json/XML)
        #     "outputType": "PDF",                         # Output format (PDF/Word/Excel/HTML)
        #     "documentDataText": json_data,               # JSON data as text
        #     "metaDataJson": "{}",                        # Additional metadata for fields in JSON format
        #     "async": True                                # Asynchronous processing recommended
        # }
        
        # Example 2: HTML template with JSON data outputting to PDF
        # payload = {
        #     "templateFileType": "HTML",                  # HTML template file type
        #     "templateFileName": "template.html",         # HTML template file name
        #     "templateFileData": template_base64,         # Base64 encoded HTML template
        #     "documentDataType": "Json",                  # JSON data type
        #     "outputType": "PDF",                         # Output as PDF document
        #     "documentDataText": json_data,               # JSON data as text
        #     "metaDataJson": "{}",                        # Additional metadata
        #     "async": True                                # Asynchronous processing
        # }
        
        # Example 3: Word template with XML data outputting to Excel
        # payload = {
        #     "templateFileType": "Word",                  # Word template file type
        #     "templateFileName": "sample.docx",           # Word template file name
        #     "templateFileData": template_base64,         # Base64 encoded Word template
        #     "documentDataType": "XML",                   # XML data type
        #     "outputType": "Excel",                       # Output as Excel file
        #     "documentDataText": xml_data,                # XML data as text (replace json_data with xml_data)
        #     "metaDataJson": "{}",                        # Additional metadata
        #     "async": True                                # Asynchronous processing
        # }
        
        # Example 4: PDF template with JSON data outputting to Word
        # payload = {
        #     "templateFileType": "PDF",                   # PDF template file type
        #     "templateFileName": "template.pdf",          # PDF template file name
        #     "templateFileData": template_base64,         # Base64 encoded PDF template
        #     "documentDataType": "Json",                  # JSON data type
        #     "outputType": "Word",                        # Output as Word document
        #     "documentDataText": json_data,               # JSON data as text
        #     "metaDataJson": "{}",                        # Additional metadata
        #     "async": True                                # Asynchronous processing
        # }
        
        # Example 5: Word template with data file (instead of text) outputting to HTML
        # payload = {
        #     "templateFileType": "Word",                  # Template file type
        #     "templateFileName": "sample.docx",           # Word template file name
        #     "templateFileData": template_base64,         # Base64 encoded Word template
        #     "documentDataType": "Json",                  # Data type
        #     "outputType": "HTML",                        # Output as HTML file
        #     "documentDataFile": data_file_base64,        # Base64 encoded data file (alternative to documentDataText)
        #     "metaDataJson": "{}",                        # Additional metadata for fields
        #     "async": True                                # Asynchronous processing
        # }
        
        # Example 6: HTML template with JSON data and file metadata outputting to PDF
        # payload = {
        #     "templateFileType": "HTML",                  # HTML template file type
        #     "templateFileName": "invoice.html",          # HTML template file name
        #     "templateFileData": template_base64,         # Base64 encoded HTML template
        #     "documentDataType": "Json",                  # JSON data type
        #     "outputType": "PDF",                         # Output as PDF
        #     "documentDataText": json_data,               # JSON data as text
        #     "fileMetaData": '{"author": "PDF4me", "title": "Generated Invoice"}',  # File metadata
        #     "metaDataJson": '{"customField": "value"}',  # Additional metadata for template fields
        #     "async": True                                # Asynchronous processing
        # }
        
        # Example 7: Complete payload with all possible parameters
        # payload = {
        #     "templateFileType": "Word",                  # Template file type (Word/HTML/PDF)
        #     "templateFileName": "complete_template.docx", # Template file name with extension
        #     "templateFileData": template_base64,         # Base64 encoded template content
        #     "documentDataType": "Json",                  # Data type (Json/XML)
        #     "outputType": "PDF",                         # Output format (PDF/Word/Excel/HTML)
        #     "documentDataFile": data_file_base64,        # Base64 encoded data file (optional)
        #     "documentDataText": json_data,               # Manual data entry (use if documentDataFile not provided)
        #     "fileMetaData": '{"author": "PDF4me", "subject": "Generated Document", "creator": "PDF4me API"}',  # File metadata
        #     "metaDataJson": '{"headerColor": "#FF0000", "footerText": "Confidential"}',  # Template field metadata
        #     "async": True                                # Asynchronous processing for better performance
        # }
        
        print("Sending generate documents multiple request...")
        response = requests.post(url, headers=headers, json=payload)
        return response
        
    except Exception as e:
        raise Exception(f"Error in generate documents multiple request: {str(e)}")

def handle_async_response_and_save(response, api_key, output_path):
    """
    Handle API response and save the generated document
    Following the C# logic for response processing
    
    Args:
        response (requests.Response): Response from the generate documents multiple API
        api_key (str): API key for authentication  
        output_path (str): Path where the generated document will be saved
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if response.status_code == 200:
            # Success: Simple success message + file saved
            print("Document generation completed successfully!")
            
            # Get content type to understand the response format from the API
            content_type = response.headers.get('content-type', 'unknown')
            print(f"Response Content-Type: {content_type}")
            
            # Read the response content as text to process it
            response_text = response.text
            print(f"Received {len(response_text)} characters")
            
            # Check if response is JSON (which contains the document data in a structured format)
            if 'application/json' in content_type or response_text.strip().startswith('{'):
                print("Processing JSON response...")
                try:
                    # Parse the JSON response to extract the document data
                    json_response = response.json()
                    
                    # PDF4ME API returns document data in outputDocuments[0].streamFile
                    # This is the standard response format for the GenerateDocumentMultiple endpoint
                    if 'outputDocuments' in json_response and len(json_response['outputDocuments']) > 0:
                        first_doc = json_response['outputDocuments'][0]
                        if 'streamFile' in first_doc:
                            # Extract the base64 encoded document data and convert it to bytes
                            base64_data = first_doc['streamFile']
                            result_bytes = base64.b64decode(base64_data)
                            print("Extracted document data from 'outputDocuments[0].streamFile'")
                        else:
                            raise Exception("'streamFile' property not found in outputDocuments[0]")
                    else:
                        raise Exception("'outputDocuments' array not found or empty")
                        
                except json.JSONDecodeError as json_ex:
                    print(f"Error processing JSON response: {json_ex}")
                    # Fallback: treat the response as raw binary data
                    result_bytes = response.content
                except Exception as json_ex:
                    print(f"Error processing JSON response: {json_ex}")
                    # Fallback: treat the response as raw binary data
                    result_bytes = response.content
            else:
                # Handle direct binary response (less common, but possible)
                result_bytes = response.content
            
            print(f"Final document size: {len(result_bytes)} bytes")
            
            # Validate that the result is actually a valid DOCX file by checking the file signature
            if len(result_bytes) > 0:
                # DOCX files start with PK (ZIP file signature) - this is the standard ZIP header
                if len(result_bytes) >= 2 and result_bytes[0] == 0x50 and result_bytes[1] == 0x4B:
                    print("Valid DOCX file signature detected")
                else:
                    print("Warning: Final result doesn't appear to be a valid DOCX file")
            
            # Save the generated document to the specified output path
            with open(output_path, 'wb') as output_file:
                output_file.write(result_bytes)
            print(f"Generated document saved to: {output_path}")
            return True
            
        elif response.status_code == 202:
            # Accepted: Asynchronous processing with retry logic
            print("Request accepted. Processing asynchronously...")
            
            # Extract the polling URL from response headers for checking generation status
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
                
                # Create polling request to check if document generation is complete
                poll_response = requests.get(location_url, headers=headers)
                
                # Handle successful completion of document generation
                if poll_response.status_code == 200:
                    print("Document generation completed successfully!")
                    
                    # Save the generated document
                    with open(output_path, 'wb') as output_file:
                        output_file.write(poll_response.content)
                    print(f"Generated document saved to: {output_path}")
                    return True
                    
                # Continue polling if document is still being processed
                elif poll_response.status_code == 202:
                    print("Still processing, waiting...")
                    continue
                    
                # Handle polling errors
                else:
                    print(f"Polling error: {poll_response.status_code}")
                    print(f"Response: {poll_response.text}")
                    return False
            
            # Timeout if generation doesn't complete within retry limit
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
    Main function to generate multiple documents
    This program demonstrates how to generate multiple documents using the PDF4ME API
    The program reads a DOCX template, combines it with JSON data, and generates output documents
    """
    try:
        # API Configuration - PDF4me service for generating multiple documents
        api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
        template_file_path = "sample.docx"  # Path to the template file
        json_data_path = "sample.json"  # Path to the JSON data file
        output_type = "docx"  # Output format type (pdf, docx, html)
        
        # Determine the correct file extension based on the requested output type
        output_extension_map = {
            "pdf": ".pdf",
            "docx": ".docx", 
            "html": ".html"
        }
        output_extension = output_extension_map.get(output_type.lower(), ".docx")
        
        # Create the output file path by replacing the input extension with the generated extension
        output_path = template_file_path.replace(".docx", f".generated{output_extension}")
        
        # API endpoint for generating multiple documents
        base_url = "https://api.pdf4me.com/"
        
        print("=== Generating Multiple Documents ===")
        print(f"Template file: {template_file_path}")
        print(f"JSON data file: {json_data_path}")
        print(f"Output file: {output_path}")
        print(f"Output type: {output_type}")
        
        # Generate multiple documents
        response = generate_documents_multiple(api_key, base_url, template_file_path, json_data_path, output_type)
        
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
