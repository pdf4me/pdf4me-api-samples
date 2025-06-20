import base64
import requests
import os
import time

def convert_to_pdf():
    api_url = "https://api.pdf4me.com/api/v2/ConvertToPdf"                               # API endpoint for converting documents to PDF
    api_key = "Please Get API Key From https://dev.pdf4me.com/dashboard/#/api-keys/"     # Replace with your actual API key
    input_path= "sample_pdf.docx"                                                        # Path to the input document file (can be DOCX, PPTX, etc.)     
    output_path = "Document_to_PDF_output.pdf"

    # Read and encode the input file to Base64
    with open(input_path, "rb") as f:
        file_base64 = base64.b64encode(f.read()).decode("utf-8")

    payload = {
        "docContent": file_base64,
        "docName": "output"
    }
    #set the headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {api_key}"
    }
    
    # Initial conversion request
    response = requests.post(api_url, json=payload, headers=headers, verify=False)
    
    if response.status_code == 202:
        location_url = response.headers.get('Location')
        if not location_url:
            print("No 'Location' header found in the response.")
            return

        # Retry logic for polling the result
        max_retries = 10
        retry_delay = 10  # seconds

        for attempt in range(max_retries):
            print(f"Waiting for result... (Attempt {attempt + 1})")
            time.sleep(retry_delay)

            response_conversion = requests.get(location_url, headers=headers, verify=False)

            if response_conversion.status_code == 200:
                with open(output_path, 'wb') as out_file:
                    out_file.write(response_conversion.content)
                print(f"PDF file saved successfully at:\n{output_path}")
                return
            elif response_conversion.status_code == 202:
                continue  # still processing
            else:
                print(f"Unexpected error: {response_conversion.status_code}")
                print(response_conversion.text)
                return

        print("Timeout: Document conversion did not complete after multiple retries.")
        
    elif response.status_code == 200:
        with open(output_path, "wb") as f:
            f.write(response.content)
        print(f"PDF file saved successfully at:\n{output_path}")
    else:
        print(f"Initial request failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    convert_to_pdf()
