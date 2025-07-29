# PDF4me Barcode Sample - Minimal

A minimal example of adding barcodes to PDF documents using the PDF4me API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Replace the API key in `add_barcode_to_pdf.js`:
   - Get your API key from: https://dev.pdf4me.com/dashboard/#/api-keys
   - Replace the `API_KEY` constant in the file

3. Ensure you have a `sample.pdf` file in the directory (one is already included)

## Usage

Run the script:
```bash
npm start
```

Or directly:
```bash
node add_barcode_to_pdf.js
```

The script will:
1. Read the `sample.pdf` file
2. Send it to the PDF4me API to add a QR code barcode
3. Save the result as `output_with_barcode.pdf`

## Files

- `add_barcode_to_pdf.js` - Main script that adds barcodes to PDFs
- `sample.pdf` - Sample PDF file for testing
- `package.json` - Node.js dependencies (only axios)
- `README.md` - This file

## Customization

You can modify the barcode settings in the `createPayload()` function:
- `text` - Text to encode in the barcode
- `barcodeType` - Type of barcode (qrCode, code128, dataMatrix, etc.)
- `pages` - Which pages to add barcodes to
- `alignX/alignY` - Position alignment
- `heightInMM/widthInMM` - Barcode dimensions
- And many more options... 