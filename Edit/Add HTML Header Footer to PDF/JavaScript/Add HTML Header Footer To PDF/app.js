const fs = require('fs');
const path = require('path');

/**
 * Add HTML content as header or footer to a PDF document using PDF4me API
 * Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save PDF with HTML header/footer
 * This action allows adding HTML content as headers, footers, or both to PDF documents
 */
async function addHtmlHeaderFooterToPdf() {
    // API Configuration - PDF4me service for adding HTML headers/footers to PDF documents
    const apiKey = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
    const pdfFilePath = "sample.pdf";  // Path to the main PDF file
    const outputPath = "Add_header_footer_to_PDF_output.pdf";  // Output PDF file name
    
    // API endpoint for adding HTML headers/footers to PDF documents
    const baseUrl = "https://api.pdf4me.com/";
    const url = `${baseUrl}api/v2/AddHtmlHeaderFooter`;

    // Check if the input PDF file exists before proceeding
    if (!fs.existsSync(pdfFilePath)) {
        console.log(`Error: PDF file not found at ${pdfFilePath}`);
        return;
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
        docContent: pdfBase64,                        // Base64 encoded PDF document content
        docName: "output.pdf",                        // Output PDF file name
        htmlContent: "<div style='text-align: center; font-family: Arial; font-size: 12px; color: #FF0000;'>Document Header PDF4me </div>",  // HTML content (plain HTML, not base64)
        pages: "",                                    // Page options: "", "1", "1,3,5", "2-5", "1,3,7-10", "2-" (empty string = all pages)
        location: "Header",                           // Location options: "Header", "Footer", "Both"
        skipFirstPage: false,                         // Skip first page (true/false)
        marginLeft: 20.0,                             // Left margin in pixels (double)
        marginRight: 20.0,                            // Right margin in pixels (double)
        marginTop: 50.0,                              // Top margin in pixels (double)
        marginBottom: 50.0,                           // Bottom margin in pixels (double)
        async: true                                   // Enable asynchronous processing
    };

    // Set up HTTP headers for the API request
    const headers = {
        "Authorization": `Basic ${apiKey}`,           // Authentication using provided API key
        "Content-Type": "application/json"           // Specify that we're sending JSON data
    };

    console.log("Sending HTML header/footer request to PDF4me API...");
    
    // Make the API request to add HTML header/footer to the PDF
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        // Handle different response scenarios based on status code
        if (response.status === 200) {
            // 200 - Success: HTML header/footer addition completed immediately
            console.log("✓ Success! HTML header/footer addition completed!");
            
            // Save the PDF with HTML header/footer
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(outputPath, Buffer.from(buffer));
            
            console.log(`File saved: ${outputPath}`);
            return;
            
        } else if (response.status === 202) {
            // 202 - Accepted: API is processing the request asynchronously
            console.log("202 - Request accepted. Processing asynchronously...");
            
            // Get the polling URL from the Location header for checking status
            const locationUrl = response.headers.get('Location');
            if (!locationUrl) {
                console.log("Error: No polling URL found in response");
                return;
            }

            // Retry logic for polling the result
            const maxRetries = 10;
            const retryDelay = 10;

            // Poll the API until HTML header/footer addition is complete
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                console.log(`Checking status... (Attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));

                // Check the processing status by calling the polling URL
                try {
                    const responseConversion = await fetch(locationUrl, {
                        method: 'GET',
                        headers: headers
                    });

                    if (responseConversion.status === 200) {
                        // 200 - Success: Processing completed
                        console.log("✓ Success! HTML header/footer addition completed!");
                        
                        // Save the PDF with HTML header/footer
                        const buffer = await responseConversion.arrayBuffer();
                        fs.writeFileSync(outputPath, Buffer.from(buffer));
                        console.log(`File saved: ${outputPath}`);
                        return;
                        
                    } else if (responseConversion.status === 202) {
                        // Still processing, continue polling
                        continue;
                    } else {
                        // Error occurred during processing
                        const errorText = await responseConversion.text();
                        console.log(`Error during processing: ${responseConversion.status} - ${errorText}`);
                        return;
                    }
                } catch (error) {
                    console.log(`Error polling status: ${error.message}`);
                    continue;
                }
            }

            // If we reach here, polling timed out
            console.log("Timeout: Processing did not complete after multiple retries");
            
        } else {
            // Other status codes - Error
            const errorText = await response.text();
            console.log(`Error: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.log(`Error making API request: ${error.message}`);
        return;
    }
}

// Run the function when script is executed directly
if (require.main === module) {
    console.log("Adding HTML header/footer to PDF...");
    addHtmlHeaderFooterToPdf().catch(error => {
        console.log(`Error: ${error.message}`);
    });
}

module.exports = { addHtmlHeaderFooterToPdf }; 