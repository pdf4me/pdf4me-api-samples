const fs = require('fs');
const path = require('path');

/**
 * Simple test script to verify the setup
 */
async function testSetup() {
    console.log("Testing Extract Text by Expression setup...");
    
    try {
        // Check if sample.pdf exists
        const pdfPath = "sample.pdf";
        if (fs.existsSync(pdfPath)) {
            const stats = fs.statSync(pdfPath);
            console.log(`Sample PDF found: ${pdfPath} (${stats.size} bytes)`);
        } else {
            console.log(`Sample PDF not found: ${pdfPath}`);
            console.log("Please place a sample.pdf file in this directory");
        }
        
        // Check if package.json exists
        const packagePath = "package.json";
        if (fs.existsSync(packagePath)) {
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            console.log(`Package.json found: ${packageData.name} v${packageData.version}`);
        } else {
            console.log("Package.json not found");
        }
        
        // Check if app.js exists
        const appPath = "app.js";
        if (fs.existsSync(appPath)) {
            console.log(`Main application file found: ${appPath}`);
        } else {
            console.log("Main application file not found");
        }
        
        console.log("\nSetup test completed!");
        console.log("To run the application: npm start");
        console.log("Or directly: node app.js");
        
    } catch (error) {
        console.log(`Error during setup test: ${error.message}`);
    }
}

// Run the test
testSetup(); 