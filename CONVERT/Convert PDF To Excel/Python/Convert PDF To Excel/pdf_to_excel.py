import base64
import requests
import time
import os

def convert_pdf_to_excel():
    """
    Convert a PDF file to Excel format using PDF4Me API
    Process: Read PDF file → Encode to base64 → Send API request → Poll for completion → Save Excel file
    PDF to Excel conversion extracts tables, text, and data from PDF into spreadsheet format
    """
    
    # API Configuration - PDF4Me service for converting PDF documents to Excel spreadsheets
    url = "https://api.pdf4me.com/api/v2/ConvertPdfToExcel"
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
    pdf_file_path = "sample.pdf"  # Path to input PDF file
    output_path = "PDF_to_EXCEL_output.xlsx"               # Output Excel file name

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
    # This payload configures the PDF to Excel conversion settings
    payload = {
        "docContent": pdf_base64,    # Base64 encoded PDF document content
        "docName": "output.pdf",     # Name of the source PDF file for reference
        "qualityType": "Draft",      # Quality setting: Draft (faster) or Quality (better accuracy)
        "mergeAllSheets": True,      # Combine all Excel sheets into one (True) or separate sheets (False)
        "language": "English",       # OCR language for text recognition in images/scanned PDFs
        "outputFormat": True,        # Preserve original formatting when possible
        "ocrWhenNeeded": True,       # Use OCR (Optical Character Recognition) for scanned PDFs
        "async": True                # Enable asynchronous processing
    }
    
    # About PDF to Excel conversion features:
    # - qualityType "Draft": Faster conversion, good for simple PDFs with clear tables
    # - qualityType "Quality": Slower but more accurate, better for complex layouts
    # - mergeAllSheets: Useful when PDF has multiple pages with related data
    # - ocrWhenNeeded: Essential for scanned PDFs or PDFs with image-based text
    # - language: Improves OCR accuracy for non-English text
    # - outputFormat: Tries to maintain original cell formatting, colors, fonts

    # Set up HTTP headers for the API request
    # Headers provide authentication and specify the data format being sent
    headers = {
        'Authorization': f'Basic {api_key}',  # Authentication using Basic auth with API key
        'Content-Type': 'application/json'    # We're sending JSON data to the API
    }

    # Send the initial conversion request to the API
    print("Sending PDF to Excel conversion request to PDF4Me API...")
    print("Extracting tables, text, and data from PDF into spreadsheet format...")
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
        print("PDF to Excel conversion completed successfully!")
        
        # Validate the response contains Excel data
        if len(response.content) > 1000:  # Excel files are typically larger than 1KB
            with open(output_path, 'wb') as out_file:
                out_file.write(response.content)
            print(f"Excel file saved successfully to: {output_path}")
            print("PDF data has been extracted and converted to Excel spreadsheet format")
            print("You can now open the file in Excel, LibreOffice Calc, or Google Sheets")
        else:
            print("Warning: Response seems too small to be a valid Excel file")
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
            print("Processing PDF content and extracting data into Excel format...")
            time.sleep(retry_delay)  # Wait before checking status again

            # Check the conversion status by calling the polling URL
            response_conversion = requests.get(location_url, headers=headers, verify=False)

            if response_conversion.status_code == 200:
                # Conversion completed successfully - save the Excel file
                print("PDF to Excel conversion completed successfully!")
                
                # Validate the response contains Excel data
                if len(response_conversion.content) > 1000:  # Excel files are typically larger than 1KB
                    with open(output_path, 'wb') as out_file:
                        out_file.write(response_conversion.content)
                    print(f"Excel file saved successfully to: {output_path}")
                    print("PDF data has been extracted and converted to Excel spreadsheet format")
                    print("You can now open the file in Excel, LibreOffice Calc, or Google Sheets")
                else:
                    print("Warning: Response seems too small to be a valid Excel file")
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

        # If we reach here, polling timed out
        print("Timeout: PDF to Excel conversion did not complete after multiple retries.")
        print("The conversion may be taking longer due to PDF complexity or server load.")
        
    else:
        # All other status codes are errors
        print(f"Error: Failed to convert PDF to Excel. Status code: {response.status_code}")
        print(f"Response text: {response.text}")
        return

# Main execution - Run the conversion when script is executed directly
if __name__ == "__main__":
    print("Starting PDF to Excel Conversion Process...")
    print("This extracts tables, text, and data from PDF files into Excel format")
    print("Perfect for converting financial reports, data tables, and structured documents")
    print("The process handles both text-based and scanned PDFs using OCR technology")
    print("-" * 80)
    convert_pdf_to_excel()
