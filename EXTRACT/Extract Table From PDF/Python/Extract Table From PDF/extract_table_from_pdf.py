import os
import base64
import requests
import time
import json

def extract_table_from_pdf():
    """
    Extract table data from a PDF document using PDF4me API
    Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save extracted table data
    This action extracts table structures and data from PDF documents
    """
    
    # API Configuration - PDF4me service for extracting tables from PDF documents
    api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/" # Replace with your actual API key
    pdf_file_path = "sample.pdf"  # Path to the main PDF file
    output_folder = "Extract_table_outputs"  # Output folder for extracted tables
    
    # API endpoint for extracting tables from PDF documents
    base_url = "https://api.pdf4me.com/"
    url = f"{base_url}api/v2/ExtractTableFromPdf"

    # Check if the input PDF file exists before proceeding
    if not os.path.exists(pdf_file_path):
        print(f"Error: PDF file not found at {pdf_file_path}")
        return

    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"Created output folder: {output_folder}")

    # Read the PDF file and convert it to base64 encoding
    try:
        with open(pdf_file_path, "rb") as f:
            pdf_content = f.read()
        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        print(f"PDF file read successfully: {len(pdf_content)} bytes")
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return

    # Prepare the payload (data) to send to the API
    payload = {
        "docName": "output.pdf",                                   # Name of the input PDF file
        "docContent": pdf_base64,                                  # Base64 encoded PDF document content
        "async": True                                              # Enable asynchronous processing
    }

    # Set up HTTP headers for the API request
    headers = {
        "Authorization": f"Basic {api_key}",                       # Authentication using provided API key
        "Content-Type": "application/json"                        # Specify that we're sending JSON data
    }

    print("Sending table extraction request to PDF4me API...")
    
    # Make the API request to extract tables from the PDF
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
        # 200 - Success: table extraction completed immediately
        print("✓ Success! Table extraction completed!")
        
        # Save the extracted table data
        try:
            # Check if response is JSON (table data) or binary content
            content_type = response.headers.get('Content-Type', '')
            
            if 'application/json' in content_type:
                # Response contains JSON with extracted table data
                table_data = response.json()
                
                # Save complete table data as JSON
                metadata_path = os.path.join(output_folder, "extracted_tables.json")
                with open(metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(table_data, f, indent=2, ensure_ascii=False)
                print(f"Table metadata saved: {metadata_path}")
                
                # Process and save individual tables
                if isinstance(table_data, dict) and 'tables' in table_data:
                    tables = table_data['tables']
                    if tables and isinstance(tables, list):
                        print(f"Found {len(tables)} tables")
                        for i, table in enumerate(tables):
                            try:
                                # Save each table as separate JSON file
                                table_path = os.path.join(output_folder, f'table_{i+1}.json')
                                with open(table_path, 'w', encoding='utf-8') as f:
                                    json.dump(table, f, indent=2, ensure_ascii=False)
                                print(f"Table {i+1} saved: {table_path}")
                                
                                # Convert table to CSV if possible
                                if isinstance(table, dict) and 'rows' in table:
                                    csv_path = os.path.join(output_folder, f'table_{i+1}.csv')
                                    save_table_as_csv(table['rows'], csv_path)
                                elif isinstance(table, list):
                                    csv_path = os.path.join(output_folder, f'table_{i+1}.csv')
                                    save_table_as_csv(table, csv_path)
                                    
                            except Exception as e:
                                print(f"Error saving table {i+1}: {e}")
                    else:
                        print("No tables found in response")
                
                # Handle single table response
                elif isinstance(table_data, list):
                    # Direct table array
                    csv_path = os.path.join(output_folder, 'extracted_table.csv')
                    save_table_as_csv(table_data, csv_path)
                    print(f"Single table saved: {csv_path}")
                
                # Display table summary
                display_table_summary(table_data)
                
            else:
                # Response is binary content (possibly Excel or CSV)
                output_extension = determine_file_extension(response.headers)
                output_file = os.path.join(output_folder, f"extracted_tables{output_extension}")
                with open(output_file, "wb") as f:
                    f.write(response.content)
                print(f"Table data saved: {output_file}")
                
        except Exception as e:
            print(f"Error processing extracted table data: {e}")
            # Save raw response content as fallback
            fallback_path = os.path.join(output_folder, "raw_table_response.bin")
            with open(fallback_path, "wb") as f:
                f.write(response.content)
            print(f"Raw response saved: {fallback_path}")
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
        max_retries = 15  # Retries for table extraction processing
        retry_delay = 12   # Delay for table extraction processing

        # Poll the API until table extraction is complete
        for attempt in range(max_retries):
            print(f"Checking status... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)

            # Check the processing status by calling the polling URL
            try:
                response_extraction = requests.get(location_url, headers=headers, verify=False, timeout=60)
                
                print(f"Polling Status Code: {response_extraction.status_code}")
                
            except Exception as e:
                print(f"Error polling status: {e}")
                continue

            if response_extraction.status_code == 200:
                # 200 - Success: Processing completed
                print("✓ Success! Table extraction completed!")
                
                # Save the extracted table data
                try:
                    # Check if response is JSON (table data) or binary content
                    content_type = response_extraction.headers.get('Content-Type', '')
                    
                    if 'application/json' in content_type:
                        # Response contains JSON with extracted table data
                        table_data = response_extraction.json()
                        
                        # Save complete table data as JSON
                        metadata_path = os.path.join(output_folder, "extracted_tables.json")
                        with open(metadata_path, 'w', encoding='utf-8') as f:
                            json.dump(table_data, f, indent=2, ensure_ascii=False)
                        print(f"Table metadata saved: {metadata_path}")
                        
                        # Process and save individual tables
                        if isinstance(table_data, dict) and 'tables' in table_data:
                            tables = table_data['tables']
                            if tables and isinstance(tables, list):
                                print(f"Found {len(tables)} tables")
                                for i, table in enumerate(tables):
                                    try:
                                        # Save each table as separate JSON file
                                        table_path = os.path.join(output_folder, f'table_{i+1}.json')
                                        with open(table_path, 'w', encoding='utf-8') as f:
                                            json.dump(table, f, indent=2, ensure_ascii=False)
                                        print(f"Table {i+1} saved: {table_path}")
                                        
                                        # Convert table to CSV if possible
                                        if isinstance(table, dict) and 'rows' in table:
                                            csv_path = os.path.join(output_folder, f'table_{i+1}.csv')
                                            save_table_as_csv(table['rows'], csv_path)
                                        elif isinstance(table, list):
                                            csv_path = os.path.join(output_folder, f'table_{i+1}.csv')
                                            save_table_as_csv(table, csv_path)
                                            
                                    except Exception as e:
                                        print(f"Error saving table {i+1}: {e}")
                            else:
                                print("No tables found in response")
                        
                        # Handle single table response
                        elif isinstance(table_data, list):
                            # Direct table array
                            csv_path = os.path.join(output_folder, 'extracted_table.csv')
                            save_table_as_csv(table_data, csv_path)
                            print(f"Single table saved: {csv_path}")
                        
                        # Display table summary
                        display_table_summary(table_data)
                        
                    else:
                        # Response is binary content (possibly Excel or CSV)
                        output_extension = determine_file_extension(response_extraction.headers)
                        output_file = os.path.join(output_folder, f"extracted_tables{output_extension}")
                        with open(output_file, "wb") as f:
                            f.write(response_extraction.content)
                        print(f"Table data saved: {output_file}")
                        
                except Exception as e:
                    print(f"Error processing extracted table data: {e}")
                    # Save raw response content as fallback
                    fallback_path = os.path.join(output_folder, "raw_table_response.bin")
                    with open(fallback_path, "wb") as f:
                        f.write(response_extraction.content)
                    print(f"Raw response saved: {fallback_path}")
                return
                
            elif response_extraction.status_code == 202:
                # Still processing, continue polling
                print("Still processing...")
                continue
            else:
                # Error occurred during processing
                print(f"Error during processing: {response_extraction.status_code} - {response_extraction.text}")
                return

        # If we reach here, polling timed out
        print("Timeout: Table extraction did not complete after multiple retries")
        
    else:
        # Other status codes - Error
        print(f"Error: {response.status_code} - {response.text}")

def save_table_as_csv(table_rows, csv_path):
    """Convert table data to CSV format and save"""
    try:
        import csv
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            if table_rows and isinstance(table_rows, list):
                if isinstance(table_rows[0], list):
                    # Table is list of lists (rows with cells)
                    writer = csv.writer(csvfile)
                    for row in table_rows:
                        writer.writerow(row)
                elif isinstance(table_rows[0], dict):
                    # Table is list of dictionaries
                    if table_rows:
                        fieldnames = table_rows[0].keys()
                        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                        writer.writeheader()
                        for row in table_rows:
                            writer.writerow(row)
                print(f"✓ CSV table saved: {csv_path}")
    except Exception as e:
        print(f"Error saving CSV: {e}")

def determine_file_extension(headers):
    """Determine file extension based on content type"""
    content_type = headers.get('Content-Type', '').lower()
    if 'excel' in content_type or 'spreadsheet' in content_type:
        return '.xlsx'
    elif 'csv' in content_type:
        return '.csv'
    else:
        return '.bin'

def display_table_summary(table_data):
    """Display summary of extracted tables"""
    print("\n--- Table Extraction Summary ---")
    
    table_count = 0
    total_rows = 0
    
    if isinstance(table_data, dict) and 'tables' in table_data:
        tables = table_data['tables']
        if isinstance(tables, list):
            table_count = len(tables)
            for i, table in enumerate(tables):
                if isinstance(table, dict) and 'rows' in table:
                    rows = len(table['rows']) if isinstance(table['rows'], list) else 0
                    total_rows += rows
                    print(f"  Table {i+1}: {rows} rows")
                elif isinstance(table, list):
                    rows = len(table)
                    total_rows += rows
                    print(f"  Table {i+1}: {rows} rows")
    elif isinstance(table_data, list):
        table_count = 1
        total_rows = len(table_data)
        print(f"  Single table: {total_rows} rows")
    
    print(f"📊 Total tables extracted: {table_count}")
    print(f"📝 Total rows: {total_rows}")
    if table_count > 0:
        print("✅ Table extraction completed successfully!")
    else:
        print("⚠️  No tables were found in the PDF")

# Run the function when script is executed directly
if __name__ == "__main__":
    print("Extracting tables from PDF...")
    extract_table_from_pdf()
