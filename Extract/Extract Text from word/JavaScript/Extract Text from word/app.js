const fs = require('fs');
const path = require('path');

// API Configuration - PDF4me service for extracting text from Word documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_URL = `${BASE_URL}api/v2/ExtractTextFromWord`;
const WORD_FILE_PATH = "sample.docx"; // Path to the main Word file (.docx or .doc)
const OUTPUT_FILE = "extracted_text.txt"; // Output text file name

// Main function to extract text from Word document (handles retry logic and orchestration)
async function extractTextFromWord() {
    const max_retries = 10; // Number of times to retry if it fails
    const retry_delay = 10; // Wait 10 seconds between retries
    
    try {
        console.log('Extracting text from Word document...');
        
        // Check if the input Word file exists before proceeding
        if (!fs.existsSync(WORD_FILE_PATH)) {
            throw new Error(`Word file not found at ${WORD_FILE_PATH}`);
        }
        
        // Try multiple times in case of network errors or API issues
        for (let attempt = 1; attempt <= max_retries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${max_retries} - Extracting text from Word document...`);
                
                // Process the text extraction request
                const response = await processTextExtraction();
                
                // Handle the API response (200 success or 202 async)
                return await handleAPIResponse(response, OUTPUT_FILE);
                
            } catch (error) {
                // If this attempt failed, log the error
                console.error(`Attempt ${attempt} failed: ${error.message}`);
                
                // If we've tried all attempts, give up
                if (attempt === max_retries) {
                    throw new Error(`All ${max_retries} attempts failed. Last error: ${error.message}`);
                }
                
                // Wait before trying again
                console.log(`Waiting ${retry_delay} seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
            }
        }

    } catch (error) {
        // If everything failed, show the error
        console.error('Error extracting text from Word document:', error.message);
        throw error;
    }
}

// Function to process text extraction request
async function processTextExtraction() {
    // Read the Word file and convert it to base64 encoding
    let wordBase64;
    try {
        const wordContent = fs.readFileSync(WORD_FILE_PATH);
        wordBase64 = wordContent.toString('base64');
        console.log(`Word file read successfully`);
    } catch (error) {
        throw new Error(`Error reading Word file: ${error.message}`);
    }

    // Prepare the payload (data) to send to the API
    const payload = {
        docContent: wordBase64,                           // Base64 encoded Word document content
        docName: "output",                               // Name of the input Word file
        StartPageNumber: 1,                              // Starting page number
        EndPageNumber: 3,                                // Ending page number
        RemoveComments: true,                            // Remove comments option
        RemoveHeaderFooter: true,                        // Remove header/footer option
        AcceptChanges: true,                             // Accept tracked changes option
        async: true                                      // Enable asynchronous processing
    };

    // Set up HTTP headers for the API request
    const headers = {
        "Authorization": `Basic ${API_KEY}`,              // Authentication using provided API key
        "Content-Type": "application/json"               // Specify that we're sending JSON data
    };

    console.log("Sending text extraction request to PDF4me API...");
    
    // Make the API request to extract text from the Word document
    try {
        const response = await fetch(API_URL, {
            method: 'POST', // HTTP method to extract text
            headers: headers, // Authentication and content type headers
            body: JSON.stringify(payload) // Convert payload to JSON string
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (response.status === 200) {
            const buffer = await response.arrayBuffer();
            
            return {
                status: response.status,
                headers: response.headers,
                buffer: Buffer.from(buffer)
            };
        } else if (response.status === 202) {
            return {
                status: response.status,
                headers: response.headers
            };
        } else {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        throw new Error(`Error making API request: ${error.message}`);
    }
}

// Function to handle API responses (200 success or 202 async processing)
async function handleAPIResponse(response, outputPath) {
    if (response.status === 200) {
        // 200 - Success: text extraction completed immediately
        console.log(`✓ Success! Text extraction from Word completed!`);
        
        // Process and save the extracted text content
        await processExtractedText(response.buffer, response.headers, outputPath);
        return outputPath;
        
    } else if (response.status === 202) {
        // 202 - Accepted: API is processing the request asynchronously
        console.log(`202 - Request accepted. Processing asynchronously...`);
        
        // Wait for processing to complete and get the result
        return await pollForCompletion(response, outputPath);
        
    } else {
        // Other status codes - Error
        const errorText = response.buffer ? response.buffer.toString() : 'No error details';
        console.log(`Error response: ${errorText}`);
        throw new Error(`Error: ${response.status} - ${errorText}`);
    }
}

// Function to check if async processing is complete
async function pollForCompletion(response, outputPath) {
    const locationUrl = response.headers.get('Location'); // Get the URL to check status
    if (!locationUrl) {
        throw new Error('No polling URL received');
    }
    
    const max_retries = 10; // Check up to 10 times
    const retry_delay = 10; // Wait 10 seconds between checks
    
    // Poll the API until text extraction is complete
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
                console.log("✓ Success! Text extraction from Word completed!");
                
                // Get the extracted text data
                const buffer = await statusResponse.arrayBuffer();
                
                // Process and save the extracted text content
                await processExtractedText(Buffer.from(buffer), statusResponse.headers, outputPath);
                return outputPath;
                
            } else if (statusResponse.status === 202) {
                // Still processing, continue polling
                console.log('Still processing...');
                continue;
            } else {
                // Error occurred during processing
                const errorText = await statusResponse.text();
                throw new Error(`Error during processing: ${statusResponse.status} - ${errorText}`);
            }
            
        } catch (error) {
            console.error(`Error polling status: ${error.message}`);
            continue;
        }
    }
    
    // If we've checked too many times, give up
    throw new Error('Timeout: Text extraction did not complete after multiple retries');
}

// Function to process and save extracted text data
async function processExtractedText(buffer, headers, outputPath) {
    try {
        // Check if response is JSON (structured data) or binary content (text file)
        const contentType = headers.get('Content-Type', '');
        
        if (contentType.includes('application/json')) {
            // Response contains JSON with extracted text data
            const textData = JSON.parse(buffer.toString());
            
            // Save complete extraction data as JSON (excluding base64 docData)
            const metadataPath = "extracted_text_from_word.json";
            const cleanData = {};
            for (const [key, value] of Object.entries(textData)) {
                if (!['docData', 'docContent'].includes(key)) {
                    cleanData[key] = value;
                }
            }
            fs.writeFileSync(metadataPath, JSON.stringify(cleanData, null, 2));
            console.log(`Extraction metadata saved: ${metadataPath}`);
            
            // Process and save extracted text content
            await processExtractedTextData(textData, outputPath);
            
        } else {
            // Response is binary content - likely base64 encoded text
            try {
                // Try to decode as base64 first
                const decodedContent = Buffer.from(buffer.toString(), 'base64').toString('utf-8');
                
                // Save as text file
                await saveTextFile(decodedContent, outputPath);
                
            } catch {
                // If base64 decoding fails, try as plain text
                try {
                    const textContent = buffer.toString('utf-8');
                    await saveTextFile(textContent, outputPath);
                    
                } catch {
                    // Save as binary file if all else fails
                    const rawOutputPath = "extracted_text_raw.bin";
                    fs.writeFileSync(rawOutputPath, buffer);
                    console.log(`Raw content saved: ${rawOutputPath}`);
                }
            }
        }
        
    } catch (error) {
        console.error(`Error processing extracted text: ${error.message}`);
        // Save raw response content as fallback
        const fallbackPath = "raw_text_response.bin";
        fs.writeFileSync(fallbackPath, buffer);
        console.log(`Raw response saved: ${fallbackPath}`);
    }
}

// Function to process extracted text data in JSON format
async function processExtractedTextData(textData, outputPath) {
    try {
        // Handle different response formats
        let extractedText = "";
        
        // Check for text content in response
        if (typeof textData === 'object') {
            // Look for common field names that might contain the extracted text
            const fieldNames = ['text', 'content', 'extractedText', 'textContent', 'result', 'data', 'docData'];
            
            for (const fieldName of fieldNames) {
                if (textData[fieldName]) {
                    let content = textData[fieldName];
                    
                    // If it's base64 encoded, decode it
                    if (fieldName === 'docData' || (typeof content === 'string' && content.length > 100 && /^[A-Za-z0-9+/=]+$/.test(content))) {
                        try {
                            extractedText = Buffer.from(content, 'base64').toString('utf-8');
                            break;
                        } catch {
                            extractedText = content;
                            break;
                        }
                    } else {
                        extractedText = content;
                        break;
                    }
                }
            }
        } else if (typeof textData === 'string') {
            // Direct text content - check if it's base64
            if (textData.length > 100 && /^[A-Za-z0-9+/=]+$/.test(textData)) {
                try {
                    extractedText = Buffer.from(textData, 'base64').toString('utf-8');
                } catch {
                    extractedText = textData;
                }
            } else {
                extractedText = textData;
            }
        }
        
        // Save extracted text to .txt file
        if (extractedText) {
            await saveTextFile(extractedText, outputPath);
            
            // Display text summary
            displayTextSummary(extractedText);
            
        } else {
            console.log("⚠️  No text content found in the response");
            
            // Create empty text file with debug info
            const debugContent = `Text Extraction from Word Document
===================================
Pages: 1-3
Extracted on: ${new Date().toISOString()}

No text content found in the response.
Response structure: ${typeof textData}
Available fields: ${typeof textData === 'object' ? Object.keys(textData).join(', ') : 'N/A'}`;
            
            fs.writeFileSync(outputPath, debugContent, 'utf-8');
            console.log(`Debug text file created: ${outputPath}`);
        }
        
    } catch (error) {
        console.error(`Error processing extracted text: ${error.message}`);
        
        // Create error text file
        const errorContent = `Text Extraction from Word Document
===================================
Pages: 1-3
Extracted on: ${new Date().toISOString()}

Error occurred during text extraction: ${error.message}`;
        
        fs.writeFileSync(outputPath, errorContent, 'utf-8');
        console.log(`Error text file created: ${outputPath}`);
    }
}

// Function to save text content to file
async function saveTextFile(textContent, outputPath) {
    const header = `Text Extraction from Word Document
===================================
Pages: 1-3
Extracted on: ${new Date().toISOString()}

`;
    
    fs.writeFileSync(outputPath, header + textContent, 'utf-8');
    console.log(`✓ Extracted text saved: ${outputPath}`);
    displayTextSummary(textContent);
}

// Function to display summary of text extraction results
function displayTextSummary(textContent) {
    if (textContent && textContent !== "Binary content") {
        const charCount = textContent.length;
        const wordCount = textContent.split(/\s+/).length;
        const lineCount = textContent.split('\n').length;
        
        console.log(`Text extracted: ${charCount.toLocaleString()} characters, ${wordCount.toLocaleString()} words, ${lineCount.toLocaleString()} lines`);
    } else {
        console.log("No readable text content was extracted");
    }
}

// Main function to run the text extraction
async function main() {
    try {
        // Start the text extraction process
        await extractTextFromWord();
        
    } catch (error) {
        // If anything goes wrong, show the error and exit
        console.error('Text extraction failed:', error.message);
        process.exit(1); // Exit with error code (1 means failure)
    }
}

// Run the application if this file is executed directly (not imported)
if (require.main === module) {
    main(); // Start the main function
} 