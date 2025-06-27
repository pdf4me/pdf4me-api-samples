import base64
import requests
import json
import time


def convert_json_to_excel():
    api_url = "https://api.pdf4me.com/api/v2/ConvertJsonToExcel"
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
    output_path = "JSON_to_EXCEL_output.xlsx"

    # Path to your JSON file
    json_file_path = "row.json"
    with open(json_file_path, "r", encoding="utf-8") as f:
        json_str = f.read()
    json_base64 = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')

    payload = {
        "docContent": json_base64,           # Base64 encoded JSON content
        "docName": "output",                 # Output file name
        "worksheetName": "Sheet1",           # Excel worksheet name
        "isTitleWrapText": True,             # Wrap text in title cells (True/False)
        "isTitleBold": True,                 # Bold title row (True/False)
        "convertNumberAndDate": False,       # Auto-convert numbers and dates (True/False)
        "numberFormat": "11",                # Number format code (0-49)
        "dateFormat": "01/01/2025",          # Date format pattern
        "ignoreNullValues": False,           # Ignore null values (True/False)
        "firstRow": 1,                       # Starting row number (1-based)
        "firstColumn": 1,                    # Starting column number (1-based)
        "async": True                        # Enable asynchronous processing
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {api_key}"
    }

    # Initial conversion request
    response = requests.post(api_url, json=payload, headers=headers, verify=False)

    if response.status_code == 200:
        # 200 means "Success" - conversion completed successfully
        print("JSON to Excel conversion completed successfully!")
        with open(output_path, "wb") as f:
            f.write(response.content)
        print(f"Excel file saved successfully at:\n{output_path}")
        
    elif response.status_code == 202:
        # 202 means "Accepted" - API is processing the conversion asynchronously
        print("Request accepted. PDF4Me is processing asynchronously...")
        location_url = response.headers.get('Location')
        if not location_url:
            print("No 'Location' header found in the response.")
            return

        # Retry logic for polling the result
        max_retries = 10
        retry_delay = 10  # seconds

        for attempt in range(max_retries):
            print(f"Waiting for result... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            response_conversion = requests.get(location_url, headers=headers, verify=False)

            if response_conversion.status_code == 200:
                # Conversion completed successfully
                print("JSON to Excel conversion completed successfully!")
                with open(output_path, 'wb') as out_file:
                    out_file.write(response_conversion.content)
                print(f"Excel file saved successfully at:\n{output_path}")
                return
            elif response_conversion.status_code == 202:
                # Still processing, continue polling
                print("Still processing...")
                continue
            else:
                # Error occurred during processing
                print(f"Error during polling. Status code: {response_conversion.status_code}")
                print(f"Response text: {response_conversion.text}")
                return

        print("Timeout: JSON conversion did not complete after multiple retries.")
        
    else:
        # All other status codes are errors
        print(f"Error: Failed to convert JSON to Excel. Status code: {response.status_code}")
        print(f"Response text: {response.text}")
        return

if __name__ == "__main__":
    convert_json_to_excel()
