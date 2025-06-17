import base64
import requests
import time

def convert_pdf_to_excel():
    
    BASE_URL = "https://api.pdf4me.com"
    
    ## get Your authentication key from https://dev.pdf4me.com/dashboard/#/api-keys/
    api_key = "******************************"
    
    pdf_file_path = "pdf file path" ## Please add the location of pdf file

    # Read and encode the PDF file to Base64
    with open(pdf_file_path, 'rb') as pdf_file:
        pdf_base64 = base64.b64encode(pdf_file.read()).decode('utf-8')

    # Construct JSON payload
    payload = {
        "docContent": pdf_base64,
        "docName": "output.pdf",
        "qualityType": "Draft", ## qualityType can be Draft or high. High quality calls are calculated 0.5 calls per page and draft quality is calculated 1 call per document (no page). Draft is economic but if high quality is required from ocr then High is recommended.
        "mergeAllSheets": True,
        "language": "English",
        "outputFormat": True,
        "ocrWhenNeeded": True
    }

    headers = {
        'Authorization': f'Basic {api_key}',
        'Content-Type': 'application/json'
    }

    url= "{}/api/v2/ConvertPdfToExcel".format(BASE_URL)
    # Initial conversion request
    response = requests.post(
        url,
        json=payload,
        headers=headers,
        verify=False
    )

    if response.status_code != 202:
        print(f" Initial request failed: {response.status_code}")
        print(response.text)
        return

    ## Get the job status url if job is finished.
    location_url = response.headers.get('Location')
    if not location_url:
        print(" No 'Location' header found in the response.")
        return

    # Retry logic for polling the result Rety mand delay can be increased according to file size
    max_retries = 10
    retry_delay = 10  # seconds

    for attempt in range(max_retries):
        print(f" Waiting for result... (Attempt {attempt + 1})")
        time.sleep(retry_delay)

        response_conversion = requests.get(location_url, headers=headers, verify=False)

        if response_conversion.status_code == 200:
            output_path = pdf_file_path.replace('.pdf', '.xlsx')
            with open(output_path, 'wb') as out_file:
                out_file.write(response_conversion.content)
            print(f" Excel file saved to: {output_path}")
            return
        elif response_conversion.status_code == 202:
            continue  # still processing
        else:
            print(f" Unexpected error: {response_conversion.status_code}")
            print(response_conversion.text)
            return

    print(" Timeout: PDF conversion did not complete after multiple retries.")

# Run the conversion
if __name__ == "__main__":
    convert_pdf_to_excel()
