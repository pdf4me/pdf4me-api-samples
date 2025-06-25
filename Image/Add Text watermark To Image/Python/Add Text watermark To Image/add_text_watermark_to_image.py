import os
import base64
import requests
import time

def add_text_watermark_to_image():
    """
    Add text watermark to an image using PDF4me API
    Process: Read image → Encode to base64 → Send API request → Poll for completion → Save watermarked image
    This action allows adding text watermarks to images with control over position, font, color, and formatting
    """
    
    # API Configuration - PDF4me service for adding text watermark to image documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
    image_file_path = "sample_image.jpg"  # Path to the main image file
    output_path = "Add_text_watermark_to_image_output.jpg"  # Output image file name
    
    # API endpoint for adding text watermark to image documents
    base_url = "https://api.pdf4me.com"
    url = f"{base_url}api/v2/AddTextWatermarkToImage"

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
        "docName": os.path.basename(image_file_path),              # Name of the input image file
        "docContent": image_base64,                                # Base64 encoded image content
        "WatermarkText": "PDF4me Sample Text",                     # Text to be used as watermark
        "TextPosition": "bottomleft",                              # Position options: topright, topleft, bottomright, bottomleft, centralhorizontal, diagonal, centralvertical, custom
        "TextFontFamily": "Arial",                                 # Font family for the watermark text
        "TextFontSize": 50,                                        # Font size for the watermark text (integer)
        "TextColour": "#b4351a",                                   # Text color in hex format
        "IsBold": True,                                           # Make text bold (true/false)
        "IsUnderline": False,                                      # Make text underlined (true/false)
        "IsItalic": True,                                         # Make text italic (true/false)
        "Opacity": 1.0,                                           # Text opacity (0.0 to 1.0)
        "RotationAngle": 0.0,                                     # Rotation angle for the text (float)
        "PositionX": 272.0,                                       # X position for custom positioning (float)
        "PositionY": 0.0,                                         # Y position for custom positioning (float)
        "async": True                                             # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                      # Authentication using provided API key
        "Content-Type": "application/json"                       # Specify that we're sending JSON data
    }

    print("Sending text watermark request to PDF4me API...")
    
    # Make the API request to add text watermark to the image
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
    except Exception as e:
        print(f"Error making API request: {e}")
        return

    # Handle different response scenarios based on status code
    if response.status_code == 200:
        # 200 - Success: watermark addition completed immediately
        print("✓ Success! Text watermark addition completed!")
        
        # Save the watermarked image
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

        # Poll the API until watermark addition is complete
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
                print("✓ Success! Text watermark addition completed!")
                
                # Save the watermarked image
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
    print("Adding text watermark to image...")
    add_text_watermark_to_image()
