import base64
import requests
import json
import time


def convert_json_to_excel():
    api_url = "https://api.pdf4me.com/api/v2/ConvertJsonToExcel"
    api_key = "Please Get API Key From https://dev.pdf4me.com/dashboard/#/api-keys/"
    output_path = "JSON_to_EXCEL_output.xlsx"

    # Path to your JSON file
    json_file_path = "row.json"
    with open(json_file_path, "r", encoding="utf-8") as f:
        json_str = f.read()
    json_base64 = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')

    payload = {
        "docContent": json_base64,
        "docName": "output",
        "worksheetName": "Sheet1",
        "isTitleWrapText": True,
        "isTitleBold": True,
        "convertNumberAndDate": False,
        "numberFormat": "11",
        "dateFormat": "01/01/2025",
        "ignoreNullValues": False,
        "firstRow": 1,
        "firstColumn": 1
    }

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
                print(f"Excel file saved successfully at:\n{output_path}")
                return
            elif response_conversion.status_code == 202:
                continue  # still processing
            else:
                print(f"Unexpected error: {response_conversion.status_code}")
                print(response_conversion.text)
                return

        print("Timeout: JSON conversion did not complete after multiple retries.")
        
    elif response.status_code == 200:
        with open(output_path, "wb") as f:
            f.write(response.content)
        print(f"Excel file saved successfully at:\n{output_path}")
    else:
        print(f"Initial request failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    convert_json_to_excel()
