const fs = require('fs');
const path = require('path');

/**
 * Extract Resources from PDF using PDF4Me API
 * Extracts text content and embedded images from PDF documents
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for extracting resources from PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ExtractResources`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to the main PDF file
const OUTPUT_FOLDER = "Extract_resources_outputs";      // Output folder for extracted resources

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the resource extraction process
 * Handles file validation, extraction, and result processing
 */
async function extractResources() {
    console.log("Starting PDF Resource Extraction Process...");
    console.log("This extracts text content and embedded images from PDF documents");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        // Create output folder if it doesn't exist
        if (!fs.existsSync(OUTPUT_FOLDER)) {
            fs.mkdirSync(OUTPUT_FOLDER);
            console.log(`Created output folder: ${OUTPUT_FOLDER}`);
        }

        console.log(`Extracting resources from: ${INPUT_PDF_PATH}`);

        // Process the extraction
        const result = await processResourceExtraction();

        // Handle the result
        await handleExtractionResult(result);

    } catch (error) {
        console.error("Extraction failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core extraction logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processResourceExtraction() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file read successfully: ${pdfContent.length} bytes`);

    // Prepare the extraction payload
    const payload = {
        docContent: pdfBase64,           // Base64 encoded PDF document content
        docName: "sample.pdf",           // Name of the input PDF file
        extractText: true,               // Extract text content from PDF
        extractImage: true,              // Extract images from PDF
        async: true                      // Enable asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending resource extraction request to PDF4Me API...");

    // Make the initial API request
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    console.log(`Status code: ${response.status}`);

    // Handle different response scenarios
    if (response.status === 202) {
        // Asynchronous processing - poll for completion
        console.log("Request accepted. PDF4Me is processing asynchronously...");
        
        const locationUrl = response.headers.get('Location');
        if (!locationUrl) {
            throw new Error("No 'Location' header found in the response for polling");
        }

        return await pollForCompletion(locationUrl, headers);

    } else if (response.status === 200) {
        // Synchronous processing - immediate result
        console.log("Resource extraction completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the extraction result and saves extracted resources
 * Processes both text content and images from the response
 */
async function handleExtractionResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for processing
        const buffer = Buffer.from(result);
        
        // Try to parse as JSON first (most common response format)
        try {
            const resourceData = JSON.parse(buffer.toString());
            console.log("Successfully parsed JSON response");
            
            // Save complete resource data as JSON
            const metadataPath = path.join(OUTPUT_FOLDER, "extracted_resources.json");
            fs.writeFileSync(metadataPath, JSON.stringify(resourceData, null, 2));
            console.log(`Resource metadata saved: ${metadataPath}`);
            
            // Process extracted text
            await processExtractedText(resourceData);
            
            // Process extracted images
            await processExtractedImages(resourceData);
            
            // Display summary
            displayExtractionSummary(resourceData);
            
        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            
            // If JSON parsing fails, save as binary file
            const binaryPath = path.join(OUTPUT_FOLDER, "extracted_resources.bin");
            fs.writeFileSync(binaryPath, buffer);
            console.log(`Binary resource data saved: ${binaryPath}`);
        }

    } catch (error) {
        throw new Error(`Error processing extracted resources: ${error.message}`);
    }
}

/**
 * Processes extracted text content from the response
 */
async function processExtractedText(resourceData) {
    if (resourceData.texts && resourceData.texts.length > 0) {
        const textPath = path.join(OUTPUT_FOLDER, "extracted_text.txt");
        const textContent = Array.isArray(resourceData.texts) 
            ? resourceData.texts.join('\n') 
            : resourceData.texts;
        
        fs.writeFileSync(textPath, textContent, 'utf8');
        console.log(`Extracted text saved: ${textPath}`);
    } else {
        console.log("No text content found in PDF");
    }
}

/**
 * Processes extracted images from the response
 * Handles different image data formats and field names
 */
async function processExtractedImages(resourceData) {
    const imageFields = ['images', 'Images', 'imageData', 'extractedImages', 'img', 'pictures'];
    let imagesFound = false;
    
    for (const fieldName of imageFields) {
        if (resourceData[fieldName]) {
            const images = resourceData[fieldName];
            console.log(`Found '${fieldName}' field with data type: ${typeof images}`);
            
            if (Array.isArray(images)) {
                console.log(`Found ${images.length} images in '${fieldName}' field`);
                
                for (let i = 0; i < images.length; i++) {
                    const imageData = images[i];
                    console.log(`Processing image ${i + 1}, type: ${typeof imageData}`);
                    
                    const imageSaved = await saveImageData(imageData, i + 1);
                    if (imageSaved) {
                        imagesFound = true;
                    }
                }
            } else if (typeof images === 'object') {
                // Single image object
                console.log(`Single image object found in '${fieldName}'`);
                const imageSaved = await saveImageData(images, 1);
                if (imageSaved) {
                    imagesFound = true;
                }
            } else if (typeof images === 'string' && images.length > 100) {
                // Direct base64 string
                console.log(`Direct base64 string found in '${fieldName}' (length: ${images.length})`);
                const imageSaved = await saveBase64Image(images, fieldName);
                if (imageSaved) {
                    imagesFound = true;
                }
            }
            
            break; // Found the field, no need to check others
        }
    }
    
    if (!imagesFound) {
        console.log("No images found in PDF response");
    } else {
        console.log("Successfully extracted images from PDF");
    }
}

/**
 * Saves image data from various formats
 */
async function saveImageData(imageData, index) {
    try {
        if (typeof imageData === 'object') {
            // Try different possible content field names
            const contentFields = ['content', 'data', 'base64', 'imageData', 'docContent'];
            
            for (const contentField of contentFields) {
                if (imageData[contentField]) {
                    console.log(`Found image content in '${contentField}' field`);
                    
                    try {
                        const imageContent = Buffer.from(imageData[contentField], 'base64');
                        const imageName = imageData.name || imageData.docName || `extracted_image_${index}.png`;
                        const imagePath = path.join(OUTPUT_FOLDER, imageName);
                        
                        fs.writeFileSync(imagePath, imageContent);
                        console.log(`Image saved: ${imagePath} (${imageContent.length} bytes)`);
                        return true;
                    } catch (error) {
                        console.log(`Error decoding image from '${contentField}': ${error.message}`);
                    }
                }
            }
        } else if (typeof imageData === 'string' && imageData.length > 100) {
            // Likely base64 string
            console.log(`Processing direct base64 string (length: ${imageData.length})`);
            return await saveBase64Image(imageData, index);
        }
        
        console.log(`Could not extract image ${index}. Data structure:`, typeof imageData);
        if (typeof imageData === 'object') {
            console.log(`Keys: ${Object.keys(imageData)}`);
        }
        
        return false;
    } catch (error) {
        console.log(`Error processing image ${index}: ${error.message}`);
        return false;
    }
}

/**
 * Saves a base64 encoded image
 */
async function saveBase64Image(base64Data, identifier) {
    try {
        const imageContent = Buffer.from(base64Data, 'base64');
        const imagePath = path.join(OUTPUT_FOLDER, `extracted_image_${identifier}.png`);
        
        fs.writeFileSync(imagePath, imageContent);
        console.log(`Image saved: ${imagePath} (${imageContent.length} bytes)`);
        return true;
    } catch (error) {
        console.log(`Error decoding base64 image: ${error.message}`);
        return false;
    }
}

/**
 * Displays a summary of extracted resources
 */
function displayExtractionSummary(resourceData) {
    const textCount = Array.isArray(resourceData.texts) ? resourceData.texts.length : (resourceData.texts ? 1 : 0);
    const imageCount = Array.isArray(resourceData.images) ? resourceData.images.length : 0;
    
    console.log("\nExtraction Summary:");
    console.log(`  Text sections: ${textCount}`);
    console.log(`  Images: ${imageCount}`);
}

/**
 * Polls the API for async completion with retry logic
 * Handles 202 (processing) and 200 (completed) status codes
 */
async function pollForCompletion(locationUrl, headers) {
    console.log(`Polling URL: ${locationUrl}`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`Waiting for result... (Attempt ${attempt}/${MAX_RETRIES})`);
        
        // Wait before polling
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

        try {
            const response = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            console.log(`Polling status code: ${response.status}`);

            if (response.status === 200) {
                // Processing completed
                console.log("Resource extraction completed!");
                return await response.arrayBuffer();
                
            } else if (response.status === 202) {
                // Still processing, continue polling
                console.log("Still processing...");
                continue;
                
            } else {
                // Error occurred during processing
                const errorText = await response.text();
                throw new Error(`Error during processing: ${response.status} - ${errorText}`);
            }

        } catch (error) {
            console.log(`Error polling status: ${error.message}`);
            continue;
        }
    }

    // If we reach here, polling timed out
    throw new Error("Timeout: Resource extraction did not complete after multiple retries");
}

// Run the function when script is executed directly
if (require.main === module) {
    console.log("Extracting resources from PDF...");
    extractResources();
} 