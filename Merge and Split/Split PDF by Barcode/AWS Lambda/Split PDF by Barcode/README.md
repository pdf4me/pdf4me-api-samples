# Split PDF by Barcode - AWS Lambda

AWS Lambda function to split PDF documents by barcode using PDF4me API.

## Setup

1. Install dependencies: `npm install`
2. Set environment variables:
   - `PDF4ME_API_KEY`: Your PDF4me API key
   - `OUTPUT_S3_BUCKET`: S3 bucket for output files
3. Deploy: `npm run deploy`

## Usage

Send POST request to `/split-pdf-by-barcode` with:
```json
{
  "inputPdfPath": "sample_barcode.pdf",
  "barcodeString": "Test PDF Barcode",
  "barcodeFilter": "startsWith",
  "barcodeType": "any",
  "splitBarcodePage": "after"
}
```

## Features

- Split PDF by barcode detection
- Multiple barcode filter options
- Support for various barcode types
- Async processing with polling
- Error handling 