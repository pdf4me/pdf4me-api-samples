# Split PDF by Swiss QR - AWS Lambda

AWS Lambda function to split PDF documents by Swiss QR using PDF4me API.

## Setup

1. Install dependencies: `npm install`
2. Set environment variables:
   - `PDF4ME_API_KEY`: Your PDF4me API key
   - `OUTPUT_S3_BUCKET`: S3 bucket for output files
3. Deploy: `npm run deploy`

## Usage

Send POST request to `/split-pdf-by-swiss-qr` with:
```json
{
  "inputPdfPath": "SwissQR.pdf",
  "splitQRPage": "after",
  "pdfRenderDpi": "150",
  "combinePagesWithSameBarcodes": false,
  "returnAsZip": false
}
```

## Features

- Split PDF by Swiss QR detection
- Configurable split position (before/after QR)
- Multiple PDF render DPI options
- Combine consecutive pages with same QR
- Return as individual files or ZIP
- Error handling 