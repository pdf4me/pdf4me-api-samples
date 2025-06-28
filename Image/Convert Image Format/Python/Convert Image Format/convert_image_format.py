import os
import base64
import requests
import time

def convert_image_format():
    """
    Convert image format using PDF4me API
    Process: Read image → Encode to base64 → Send API request → Poll for completion → Save converted image
    This action allows converting images between different formats (BMP, GIF, JPG, PNG, TIFF)
    """
    
    # API Configuration - PDF4me service for converting image format
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    image_file_path = "sample_image.jpg"  # Path to the main image file
    output_path = "Convert_image_format_output.png"  # Output image file name
    
    # API endpoint for converting image format
    base_url = "https://api.pdf4me.com"
    url = f"{base_url}api/v2/ConvertImageFormat"

    # Check if the input file exists before proceeding
    if not os.path.exists(image_file_path):
        print(f"Error: Image file not found at {image_file_path}")
        return

    # Read the image file and convert it to base64 encoding
    try:
        with open(image_file_path, "rb") as f:
            image_content = f.read()
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        print(f"Image file read successfully: {len(image_content)} bytes")
    except Exception as e:
        print(f"Error reading image file: {e}")
        return

    # Prepare the payload (data) to send to the API
    payload = {
        "docContent": image_base64,                                # Base64 encoded image content
        "docName": os.path.basename(image_file_path),              # Name of the input image file
        "currentImageFormat": "JPG",                               # Current format options: BMP, GIF, JPG, PNG, TIFF
        "newImageFormat": "PNG",                                   # New format options: BMP, GIF, JPG, PNG, TIFF
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print("Sending image format conversion request to PDF4me API...")
    
    # Make the API request to convert the image format
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: conversion completed immediately
        print("✓ Success! Image format conversion completed!")
        
        # Save the converted image
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"File saved: {output_path}")
        return
        
    elif response.status_code == 202:
        # 202 - Accepted: API is processing the request asynchronously
        print("202 - Request accepted. Processing asynchronously...")
        
        # Get the polling URL from the Location header for checking status
        location_url = response.headers.get('Location')
        if not location_url:
            print("Error: No polling URL found in response")
            return

        # Retry logic for polling the result
        max_retries = 10
        retry_delay = 10

        # Poll the API until conversion is complete
        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            # Check the processing status by calling the polling URL
            try:
                response_conversion = requests.get(location_url, headers=headers, verify=False)
            except Exception as e:
                print(f"Error polling status: {e}")
                continue

            if response_conversion.status_code == 200:
                # 200 - Success: Processing completed
                print("✓ Success! Image format conversion completed!")
                
                # Save the converted image
                with open(output_path, 'wb') as out_file:
                    out_file.write(response_conversion.content)
                print(f"File saved: {output_path}")
                return
                
            elif response_conversion.status_code == 202:
                # Still processing, continue polling
                continue
            else:
                # Error occurred during processing
                print(f"Error during processing: {response_conversion.status_code} - {response_conversion.text}")
                return

        # If we reach here, polling timed out
        print("Timeout: Processing did not complete after multiple retries")
        
    else:
        # Other status codes - Error
        print(f"Error: {response.status_code} - {response.text}")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Converting image format...")
    convert_image_format()
