const fs = require('fs');
const path = require('path');

// API Configuration - PDF4me service for extracting attachments from PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_URL = `${BASE_URL}api/v2/ExtractAttachmentFromPdf`;
const INPUT_FILE = 'sample.pdf'; // Path to the main PDF file
const OUTPUT_FOLDER = 'Extract_attachment_outputs'; // Output folder for extracted attachments

// Main function to extract attachments from PDF (handles retry logic and orchestration)
async function extractAttachmentFromPDF() {
    const max_retries = 10; // Number of times to retry if it fails
    const retry_delay = 10; // Wait 10 seconds between retries
    
    try {
        console.log('Starting attachment extraction from PDF...');
        
        // Check if the input PDF file exists in the folder
        if (!fs.existsSync(INPUT_FILE)) {
            throw new Error(`Input file ${INPUT_FILE} not found`);
        }

        // Create output folder if it doesn't exist
        if (!fs.existsSync(OUTPUT_FOLDER)) {
            fs.mkdirSync(OUTPUT_FOLDER);
            console.log(`Created output folder: ${OUTPUT_FOLDER}`);
        }

        // Try multiple times in case of network errors or API issues
        for (let attempt = 1; attempt <= max_retries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${max_retries} - Extracting attachments from PDF...`);
                
                // Process the PDF file to extract attachments
                const response = await processAttachmentExtraction();
                
                // Handle the API response (200 success or 202 async)
                return await handleAPIResponse(response);
                
            } catch (error) {
                // If this attempt failed, log the error
                console.error(`Attempt ${attempt} failed: ${error.message}`);
                
                // If we've tried all attempts, give up
                if (attempt === max_retries) {
                    throw new Error(`All ${max_retries} attempts failed. Last error: ${error.message}`);
                }
                
                // Wait before trying again
                console.log(`Waiting ${retry_delay} seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, retry_delay * 1000)); // Wait 10 seconds
            }
        }

    } catch (error) {
        // If everything failed, show the error
        console.error('Error extracting attachments from PDF:', error.message);
        throw error; // Re-throw the error so the program knows it failed
    }
}

// Function to process PDF files and extract attachments
async function processAttachmentExtraction() {
    let pdfBase64; // Declare variable to store base64 content
    
    // Read the PDF file and convert it to base64 encoding
    try {
        const pdfContent = fs.readFileSync(INPUT_FILE);
        pdfBase64 = pdfContent.toString('base64'); // Convert to base64 (text format)
        console.log(`PDF file read successfully: ${pdfContent.length} bytes`);
    } catch (error) {
        throw new Error(`Error reading PDF file: ${error.message}`);
    }

    // Prepare the payload (data) to send to the API
    const payload = {
        docName: "output.pdf",                        // Source PDF file name with .pdf extension
        docContent: pdfBase64,                        // Base64 encoded PDF document content
        async: true                                   // Enable asynchronous processing
    };

    // Set up HTTP headers for the API request
    const headers = {
        "Authorization": `Basic ${API_KEY}`,           // Authentication using provided API key
        "Content-Type": "application/json"            // Specify that we're sending JSON data
    };

    console.log("Sending attachment extraction request to PDF4me API...");
    
    // Make the API request to extract attachments from the PDF
    try {
        const response = await fetch(API_URL, {
            method: 'POST', // HTTP method to extract attachments
            headers: headers, // Authentication and content type headers
            body: JSON.stringify(payload) // Convert payload to JSON string
        });
        
        return response; // Return the API response for handling
        
    } catch (error) {
        throw new Error(`Error making API request: ${error.message}`);
    }
}

// Function to handle API responses (200 success or 202 async processing)
async function handleAPIResponse(response) {
    // Handle the response from PDF4me
    if (response.status === 200) {
        // 200 - Success: attachment extraction completed immediately
        console.log("Success! Attachment extraction completed!");
        
        // Save the extracted attachments
        await saveExtractedAttachments(response);
        return OUTPUT_FOLDER; // Return the output folder name
        
    } else if (response.status === 202) {
        // 202 - Accepted: API is processing the request asynchronously
        console.log("202 - Request accepted. Processing asynchronously...");
        
        // Wait for processing to complete and get the result
        return await pollForCompletion(response);
        
    } else {
        // Other status codes - Error
        const errorText = await response.text(); // Get error message
        throw new Error(`Error: ${response.status} - ${errorText}`);
    }
}

// Function to check if async processing is complete
async function pollForCompletion(response) {
    const locationUrl = response.headers.get('Location'); // Get the URL to check status
    if (!locationUrl) {
        throw new Error('No polling URL received'); // Error if no URL provided
    }
    
    const max_retries = 10; // Check up to 10 times
    const retry_delay = 10; // Wait 10 seconds between checks
    
    // Poll the API until attachment extraction is complete
    for (let attempt = 0; attempt < max_retries; attempt++) {
        console.log(`Checking status... (Attempt ${attempt + 1}/${max_retries})`);
        
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
        
        // Check if processing is complete
        try {
            const statusResponse = await fetch(locationUrl, {
                headers: {
                    'Authorization': `Basic ${API_KEY}` // Your API key
                }
            });
            
            if (statusResponse.status === 200) {
                // 200 - Success: Processing completed
                console.log("Success! Attachment extraction completed!");
                
                // Save the extracted attachments
                await saveExtractedAttachments(statusResponse);
                return OUTPUT_FOLDER; // Return the folder path
                
            } else if (statusResponse.status === 202) {
                // Still processing, continue polling
                console.log('Still processing...');
                continue; // Go to next iteration
            } else {
                // Error occurred during processing
                const errorText = await statusResponse.text();
                throw new Error(`Error during processing: ${statusResponse.status} - ${errorText}`);
            }
            
        } catch (error) {
            console.error(`Error polling status: ${error.message}`);
            continue; // Try again on next iteration
        }
    }
    
    // If we've checked too many times, give up
    throw new Error('Timeout: Processing did not complete after multiple retries');
}

// Function to save extracted attachments
async function saveExtractedAttachments(response) {
    try {
        // Check if response is JSON (metadata) or binary (ZIP file)
        const contentType = response.headers.get('Content-Type', '');
        
        if (contentType.includes('application/json')) {
            // Response contains JSON metadata about attachments
            const attachmentData = await response.json();
            
            // Process and save extracted attachments
            await processAttachmentData(attachmentData);
            
        } else {
            // Response is likely a ZIP file or binary content
            const outputFile = path.join(OUTPUT_FOLDER, "extracted_attachments.zip");
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(outputFile, Buffer.from(buffer));
            console.log(`Extracted attachments saved: ${outputFile}`);
            
            // Try to extract ZIP if it's a ZIP file
            try {
                // Note: Node.js doesn't have built-in ZIP extraction, so we'll just save the file
                console.log("ZIP file saved. You can manually extract it to view the attachments.");
            } catch (error) {
                console.log("Response is not a ZIP file, saved as binary content");
            }
        }
        
    } catch (error) {
        console.error(`Error processing extracted attachments: ${error.message}`);
        // Save raw response content as fallback
        const fallbackPath = path.join(OUTPUT_FOLDER, "raw_response.bin");
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(fallbackPath, Buffer.from(buffer));
        console.log(`Raw response saved: ${fallbackPath}`);
    }
}

// Function to process attachment data and save in .txt format
async function processAttachmentData(attachmentData) {
    try {
        let attachmentsFound = 0;
        
        // Check for outputDocuments structure
        if (attachmentData && attachmentData.outputDocuments && Array.isArray(attachmentData.outputDocuments)) {
            const outputDocs = attachmentData.outputDocuments;
            
            for (let i = 0; i < outputDocs.length; i++) {
                const doc = outputDocs[i];
                if (doc && typeof doc === 'object') {
                    // Extract file information
                    const filename = doc.fileName || `attachment_${i+1}.txt`;
                    const streamFile = doc.streamFile || '';
                    const barcodeText = doc.barcodeText || null;
                    const docText = doc.docText || null;
                    
                    const baseName = path.parse(filename).name;
                    
                    // Process streamFile content
                    if (streamFile) {
                        try {
                            // Decode base64 content
                            const decodedContent = Buffer.from(streamFile, 'base64').toString('utf-8');
                            
                            // Create output filename with .txt extension
                            const outputFilename = `${baseName}_extracted.txt`;
                            const outputPath = path.join(OUTPUT_FOLDER, outputFilename);
                            
                            // Save as text file
                            const content = `Extracted Attachment Content
============================
Original filename: ${filename}
Extracted on: ${new Date().toISOString()}

${decodedContent}`;
                            
                            fs.writeFileSync(outputPath, content, 'utf-8');
                            console.log(`Attachment content saved: ${outputPath}`);
                            attachmentsFound++;
                            
                        } catch (error) {
                            console.error(`Error decoding attachment ${i+1}: ${error.message}`);
                        }
                    }
                    
                    // Process barcodeText content
                    if (barcodeText && barcodeText !== "null" && String(barcodeText).trim()) {
                        try {
                            let contentToSave;
                            
                            // Check if it's base64 encoded
                            if (typeof barcodeText === 'string' && barcodeText.length > 10) {
                                try {
                                    // Try to decode as base64
                                    contentToSave = Buffer.from(barcodeText, 'base64').toString('utf-8');
                                } catch {
                                    // If not base64, use as is
                                    contentToSave = barcodeText;
                                }
                            } else {
                                contentToSave = String(barcodeText);
                            }
                            
                            // Save barcode text file
                            const barcodeFilename = `${baseName}_barcode.txt`;
                            const barcodePath = path.join(OUTPUT_FOLDER, barcodeFilename);
                            
                            const barcodeContent = `Extracted Barcode Text
======================
Source filename: ${filename}
Extracted on: ${new Date().toISOString()}

${contentToSave}`;
                            
                            fs.writeFileSync(barcodePath, barcodeContent, 'utf-8');
                            console.log(`Barcode text saved: ${barcodePath}`);
                            attachmentsFound++;
                            
                        } catch (error) {
                            console.error(`Error processing barcode text: ${error.message}`);
                        }
                    } else {
                        // Create file showing null barcode
                        const barcodeFilename = `${baseName}_barcode.txt`;
                        const barcodePath = path.join(OUTPUT_FOLDER, barcodeFilename);
                        
                        const barcodeContent = `Extracted Barcode Text
======================
Source filename: ${filename}
Extracted on: ${new Date().toISOString()}

null`;
                        
                        fs.writeFileSync(barcodePath, barcodeContent, 'utf-8');
                        console.log(`Barcode file created (null): ${barcodePath}`);
                    }
                    
                    // Process docText content
                    if (docText && docText !== "null" && String(docText).trim()) {
                        try {
                            let contentToSave;
                            
                            // Check if it's base64 encoded
                            if (typeof docText === 'string' && docText.length > 10) {
                                try {
                                    // Try to decode as base64
                                    contentToSave = Buffer.from(docText, 'base64').toString('utf-8');
                                } catch {
                                    // If not base64, use as is
                                    contentToSave = docText;
                                }
                            } else {
                                contentToSave = String(docText);
                            }
                            
                            // Save doc text file
                            const doctextFilename = `${baseName}_doctext.txt`;
                            const doctextPath = path.join(OUTPUT_FOLDER, doctextFilename);
                            
                            const doctextContent = `Extracted Document Text
========================
Source filename: ${filename}
Extracted on: ${new Date().toISOString()}

${contentToSave}`;
                            
                            fs.writeFileSync(doctextPath, doctextContent, 'utf-8');
                            console.log(`Document text saved: ${doctextPath}`);
                            attachmentsFound++;
                            
                        } catch (error) {
                            console.error(`Error processing document text: ${error.message}`);
                        }
                    } else {
                        // Create file showing null docText
                        const doctextFilename = `${baseName}_doctext.txt`;
                        const doctextPath = path.join(OUTPUT_FOLDER, doctextFilename);
                        
                        const doctextContent = `Extracted Document Text
========================
Source filename: ${filename}
Extracted on: ${new Date().toISOString()}

null`;
                        
                        fs.writeFileSync(doctextPath, doctextContent, 'utf-8');
                        console.log(`Document text file created (null): ${doctextPath}`);
                    }
                }
            }
        }
        
        // Check for legacy attachments structure
        else if (attachmentData && attachmentData.attachments && Array.isArray(attachmentData.attachments)) {
            const attachments = attachmentData.attachments;
            
            for (let i = 0; i < attachments.length; i++) {
                const attachment = attachments[i];
                if (attachment && attachment.docContent) {
                    try {
                        // Decode base64 content and save attachment
                        const attachmentContent = Buffer.from(attachment.docContent, 'base64');
                        const attachmentFilename = attachment.docName || `attachment_${i+1}`;
                        
                        // Determine if content is text or binary
                        try {
                            // Try to decode as text
                            const textContent = attachmentContent.toString('utf-8');
                            
                            // Save as text file
                            const baseName = path.parse(attachmentFilename).name;
                            const outputFilename = `${baseName}_extracted.txt`;
                            const outputPath = path.join(OUTPUT_FOLDER, outputFilename);
                            
                            const content = `Extracted Attachment Content
============================
Original filename: ${attachmentFilename}
Extracted on: ${new Date().toISOString()}

${textContent}`;
                            
                            fs.writeFileSync(outputPath, content, 'utf-8');
                            console.log(`Attachment content saved: ${outputPath}`);
                            attachmentsFound++;
                            
                        } catch (error) {
                            // Save as binary file if not text
                            const attachmentPath = path.join(OUTPUT_FOLDER, attachmentFilename);
                            fs.writeFileSync(attachmentPath, attachmentContent);
                            console.log(`Binary attachment saved: ${attachmentPath}`);
                            attachmentsFound++;
                        }
                        
                    } catch (error) {
                        console.error(`Error saving attachment ${i+1}: ${error.message}`);
                    }
                }
            }
        }
        
        // Summary
        if (attachmentsFound > 0) {
            console.log(`\n--- Attachment Extraction Summary ---`);
            console.log(`Total attachments extracted: ${attachmentsFound}`);
            console.log("Attachment extraction completed successfully!");
        } else {
            console.log("No attachments found in the PDF");
            
            // Create info file
            const infoPath = path.join(OUTPUT_FOLDER, "extraction_info.txt");
            const infoContent = `Attachment Extraction Results
==============================
Extracted on: ${new Date().toISOString()}

No attachments were found in the PDF document.
Response structure: ${attachmentData ? Object.keys(attachmentData).join(', ') : 'No data'}`;
            
            fs.writeFileSync(infoPath, infoContent, 'utf-8');
            console.log(`Extraction info saved: ${infoPath}`);
        }
        
    } catch (error) {
        console.error(`Error processing attachment data: ${error.message}`);
        
        // Create error file
        const errorPath = path.join(OUTPUT_FOLDER, "extraction_error.txt");
        const errorContent = `Attachment Extraction Error
===========================
Error occurred on: ${new Date().toISOString()}

Error details: ${error.message}`;
        
        fs.writeFileSync(errorPath, errorContent, 'utf-8');
        console.log(`Error info saved: ${errorPath}`);
    }
}

// Main function to run the attachment extraction
async function main() {
    try {
        console.log("Extracting attachments from PDF...");
        const result = await extractAttachmentFromPDF();
        console.log(`\nAttachment extraction completed! Check the '${result}' folder for extracted files.`);
    } catch (error) {
        console.error("Attachment extraction failed:", error.message);
        process.exit(1); // Exit with error code
    }
}

// Run the main function if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = { extractAttachmentFromPDF }; 