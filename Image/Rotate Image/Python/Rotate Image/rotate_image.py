import os
import base64
import requests
import time

def rotate_image():
    """
    Rotate image using PDF4me API
    Process: Read image → Encode to base64 → Send API request → Poll for completion → Save rotated image
    This action allows rotating images with custom angle, background color, and proportionate resize options
    """
    
    # API Configuration - PDF4me service for rotating image documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    image_file_path = "pdf4me.png"  # Path to the main image file
    output_path = "Rotate_image_output.png"  # Output image file name

    # API endpoint for rotating image documents
    base_url = "https://api.pdf4me.com"
    url = f"{base_url}api/v2/RotateImage"

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
        "Backgroundcolor": "#FFFFFF",                              # Background color for rotation (string format)
        "ProportionateResize": True,                               # Maintain proportions during rotation (boolean)
        "RotationAngle": 90,                                       # Rotation angle in degrees (integer)
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print("Sending image rotation request to PDF4me API...")
    
    # Make the API request to rotate the image
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False, timeout=300)  # 5 minute timeout
        
        # Log detailed response information for debugging 
        print(f"Response Status Code: {response.status_code} ({response.reason})")
        print("Response Headers:")
        for header_name, header_value in response.headers.items():
            print(f"  {header_name}: {header_value}")
        
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: image rotation completed immediately
        print("✓ Success! Image rotation completed!")
        
        # Save the rotated image
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"Rotated image saved: {output_path}")
        return
        
    elif response.status_code == 202:
        # 202 - Accepted: API is processing the request asynchronously
        print("202 - Request accepted. Processing asynchronously...")
        
        # Get the polling URL from the Location header for checking status
        location_url = response.headers.get('Location')
        print(f"Location URL: {location_url if location_url else 'NOT FOUND'}")
        
        if not location_url:
            print("Error: No polling URL found in response")
            return

        # Retry logic for polling the result
        max_retries = 20
        retry_delay = 10

        # Poll the API until image rotation is complete
        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            # Check the processing status by calling the polling URL
            try:
                response_conversion = requests.get(location_url, headers=headers, verify=False)
                print(f"Poll response status: {response_conversion.status_code} ({response_conversion.reason})")
            except Exception as e:
                print(f"Error polling status: {e}")
                continue

            if response_conversion.status_code == 200:
                # 200 - Success: Processing completed
                print("✓ Success! Image rotation completed!")
                
                # Save the rotated image
                with open(output_path, 'wb') as out_file:
                    out_file.write(response_conversion.content)
                print(f"Rotated image saved: {output_path}")
                return
                
            elif response_conversion.status_code == 202:
                # Still processing, continue polling
                print("Still processing (202)...")
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
    print("Rotating image...")
    rotate_image()
