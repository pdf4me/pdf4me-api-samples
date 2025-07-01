const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Extract specific text from a PDF document using regular expressions with PDF4me API
 * Process: Read PDF → Encode to base64 → Send API request with regex pattern → Poll for completion → Save extracted text
 * This action extracts text matching specific patterns/expressions from PDF documents
 */
async function extractTextByExpression() {
    // API Configuration - PDF4me service for extracting text by expression from PDF documents
    const apiKey = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
    const pdfFilePath = "sample.pdf"; // Path to the main PDF file
    const outputFolder = "Extract_text_by_expression_outputs"; // Output folder for extracted text
    
    // Text extraction parameters
    const expression = "%"; // Regular expression pattern to search for (example: %, US, email patterns, etc.)
    const pageSequence = "1-3"; // Page range: "1-" for all pages, "1,2,3" for specific pages, "1-5" for range
    
    // API endpoint for extracting text by expression from PDF documents
    const baseUrl = "https://api.pdf4me.com/";
    const url = `${baseUrl}api/v2/ExtractTextByExpression`;

    // Check if the input PDF file exists before proceeding
    if (!fs.existsSync(pdfFilePath)) {
        console.log(`Error: PDF file not found at ${pdfFilePath}`);
        return;
    }

    // Create output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
        console.log(`Created output folder: ${outputFolder}`);
    }

    // Read the PDF file and convert it to base64 encoding
    let pdfBase64;
    try {
        const pdfContent = fs.readFileSync(pdfFilePath);
        pdfBase64 = pdfContent.toString('base64');
        console.log(`PDF file read successfully: ${pdfContent.length} bytes`);
    } catch (error) {
        console.log(`Error reading PDF file: ${error.message}`);
        return;
    }

    // Prepare the payload (data) to send to the API
    const payload = {
        docContent: pdfBase64, // Base64 encoded PDF document content
        docName: "output.pdf", // Name of the input PDF file
        expression: expression, // Regular expression pattern to search for
        pageSequence: pageSequence, // Page range to process
        async: true // Enable asynchronous processing
    };

    // Set up HTTP headers for the API request
    const headers = {
        "Authorization": `Basic ${apiKey}`, // Authentication using provided API key
        "Content-Type": "application/json" // Specify that we're sending JSON data
    };

    console.log(`Extracting text matching pattern '${expression}' from pages ${pageSequence}...`);
    console.log("Sending text extraction request to PDF4me API...");
    
    // Make the API request to extract text by expression from the PDF
    try {
        const response = await makeHttpRequest(url, 'POST', headers, JSON.stringify(payload));
        
        console.log(`Response Status Code: ${response.statusCode} (${response.statusMessage})`);
        
        // Handle different response scenarios based on status code
        if (response.statusCode === 200) {
            // 200 - Success: text extraction completed immediately
            console.log("Success! Text extraction by expression completed!");
            
            // Save the extracted text data
            try {
                // Parse the JSON response containing extracted text
                const textData = JSON.parse(response.body);
                
                // Save complete extraction data as JSON
                const metadataPath = path.join(outputFolder, "extracted_text_by_expression.json");
                fs.writeFileSync(metadataPath, JSON.stringify(textData, null, 2), 'utf8');
                console.log(`Extraction metadata saved: ${metadataPath}`);
                
                // Process and save extracted text matches
                await processExtractedText(textData, outputFolder, expression, pageSequence);
                    
            } catch (error) {
                console.log(`Error processing extracted text data: ${error.message}`);
                // Save raw response content as fallback
                const fallbackPath = path.join(outputFolder, "raw_text_response.json");
                fs.writeFileSync(fallbackPath, response.body, 'utf8');
                console.log(`Raw response saved: ${fallbackPath}`);
            }
            return;
            
        } else if (response.statusCode === 202) {
            // 202 - Accepted: API is processing the request asynchronously
            console.log("202 - Request accepted. Processing asynchronously...");
            
            // Get the polling URL from the Location header for checking status
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                console.log("Error: No polling URL found in response");
                return;
            }

            // Retry logic for polling the result
            const maxRetries = 10; // Retries for text extraction processing
            const retryDelay = 10; // Delay for text extraction processing

            // Poll the API until text extraction is complete
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                console.log(`Checking status... (Attempt ${attempt + 1}/${maxRetries})`);
                await sleep(retryDelay * 1000);

                // Check the processing status by calling the polling URL
                try {
                    const responseExtraction = await makeHttpRequest(locationUrl, 'GET', headers);
                    console.log(`Polling Status Code: ${responseExtraction.statusCode}`);
                    
                    if (responseExtraction.statusCode === 200) {
                        // 200 - Success: Processing completed
                        console.log("Success! Text extraction by expression completed!");
                        
                        // Save the extracted text data
                        try {
                            // Parse the JSON response containing extracted text
                            const textData = JSON.parse(responseExtraction.body);
                            
                            // Save complete extraction data as JSON
                            const metadataPath = path.join(outputFolder, "extracted_text_by_expression.json");
                            fs.writeFileSync(metadataPath, JSON.stringify(textData, null, 2), 'utf8');
                            console.log(`Extraction metadata saved: ${metadataPath}`);
                            
                            // Process and save extracted text matches
                            await processExtractedText(textData, outputFolder, expression, pageSequence);
                                
                        } catch (error) {
                            console.log(`Error processing extracted text data: ${error.message}`);
                            // Save raw response content as fallback
                            const fallbackPath = path.join(outputFolder, "raw_text_response.json");
                            fs.writeFileSync(fallbackPath, responseExtraction.body, 'utf8');
                            console.log(`Raw response saved: ${fallbackPath}`);
                        }
                        return;
                        
                    } else if (responseExtraction.statusCode === 202) {
                        // Still processing, continue polling
                        console.log("Still processing...");
                        continue;
                    } else {
                        // Error occurred during processing
                        console.log(`Error during processing: ${responseExtraction.statusCode} - ${responseExtraction.body}`);
                        return;
                    }
                    
                } catch (error) {
                    console.log(`Error polling status: ${error.message}`);
                    continue;
                }
            }

            // If we reach here, polling timed out
            console.log("Timeout: Text extraction did not complete after multiple retries");
            
        } else {
            // Other status codes - Error
            console.log(`Error: ${response.statusCode} - ${response.body}`);
        }
        
    } catch (error) {
        console.log(`Error making API request: ${error.message}`);
        return;
    }
}

/**
 * Make HTTP request using built-in Node.js modules
 */
function makeHttpRequest(url, method, headers, body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: headers
        };

        const req = client.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(body);
        }
        
        req.end();
    });
}

/**
 * Sleep function for delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process and save extracted text matches in multiple formats
 */
async function processExtractedText(textData, outputFolder, expression, pageSequence) {
    try {
        // Handle different response formats
        let textMatches = [];
        
        // Check for text list in response
        if (typeof textData === 'object' && textData !== null) {
            // Look for common field names that might contain the extracted text
            const fieldNames = ['textList', 'text_list', 'texts', 'matches', 'results', 'data'];
            for (const fieldName of fieldNames) {
                if (textData[fieldName]) {
                    textMatches = textData[fieldName];
                    break;
                }
            }
            
            // If no specific field found, check if the whole response is the text list
            if (!textMatches && JSON.stringify(textData).includes('expression')) {
                // Might be a structured response, look for text values
                for (const [key, value] of Object.entries(textData)) {
                    if (Array.isArray(value) && value.length > 0) {
                        textMatches = value;
                        break;
                    }
                }
            }
        } else if (Array.isArray(textData)) {
            // Direct text list
            textMatches = textData;
        }
        
        // Save individual matches as text file
        if (textMatches.length > 0) {
            // Save all matches in a single text file
            const textFilePath = path.join(outputFolder, "extracted_matches.txt");
            let textContent = "Text Extraction Results\n";
            textContent += "======================\n";
            textContent += `Expression: ${expression}\n`;
            textContent += `Pages: ${pageSequence}\n`;
            textContent += `Total Matches: ${textMatches.length}\n\n`;
            
            textMatches.forEach((match, index) => {
                textContent += `Match ${index + 1}: ${match}\n`;
            });
            
            fs.writeFileSync(textFilePath, textContent, 'utf8');
            console.log(`Text matches saved: ${textFilePath}`);
            
            // Save matches as CSV for easy analysis
            const csvPath = path.join(outputFolder, "extracted_matches.csv");
            await saveMatchesAsCsv(textMatches, csvPath, expression, pageSequence);
            
            // Display extraction summary
            displayExtractionSummary(textMatches, expression, pageSequence);
            
        } else {
            console.log("No text matches found for the specified expression");
            
            // Add debug information to the main JSON file
            if (typeof textData === 'object' && textData !== null) {
                textData.message = "No matches found";
                textData.expression = expression;
                textData.page_sequence = pageSequence;
                textData.response_structure = typeof textData;
            }
            
            console.log("Debug information added to main JSON file");
        }
        
    } catch (error) {
        console.log(`Error processing extracted text: ${error.message}`);
    }
}

/**
 * Save text matches as CSV format
 */
async function saveMatchesAsCsv(textMatches, csvPath, expression, pageSequence) {
    try {
        let csvContent = "Match_Number,Extracted_Text,Expression_Used,Pages_Processed\n";
        
        textMatches.forEach((match, index) => {
            // Escape quotes in the match text for CSV
            const escapedMatch = match.replace(/"/g, '""');
            csvContent += `${index + 1},"${escapedMatch}","${expression}","${pageSequence}"\n`;
        });
        
        fs.writeFileSync(csvPath, csvContent, 'utf8');
        console.log(`CSV file saved: ${csvPath}`);
    } catch (error) {
        console.log(`Error saving CSV: ${error.message}`);
    }
}

/**
 * Display summary of text extraction results
 */
function displayExtractionSummary(textMatches, expression, pageSequence) {
    console.log("\n--- Text Extraction Summary ---");
    console.log(`Expression: '${expression}'`);
    console.log(`Pages processed: ${pageSequence}`);
    console.log(`Total matches found: ${textMatches.length}`);
    
    if (textMatches.length > 0) {
        console.log("\nFirst few matches:");
        const displayCount = Math.min(5, textMatches.length);
        for (let i = 0; i < displayCount; i++) {
            // Truncate long matches for display
            const displayMatch = textMatches[i].length > 50 
                ? textMatches[i].substring(0, 50) + "..." 
                : textMatches[i];
            console.log(`  ${i + 1}. ${displayMatch}`);
        }
        
        if (textMatches.length > 5) {
            console.log(`  ... and ${textMatches.length - 5} more matches`);
        }
        
        // Show unique matches if there are duplicates
        const uniqueMatches = [...new Set(textMatches)];
        if (uniqueMatches.length < textMatches.length) {
            console.log(`Unique matches: ${uniqueMatches.length}`);
        }
    }
    
    console.log("Text extraction by expression completed successfully!");
}

// Run the function when script is executed directly
if (require.main === module) {
    console.log("Extracting text by expression from PDF...");
    extractTextByExpression().catch(error => {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { extractTextByExpression }; 