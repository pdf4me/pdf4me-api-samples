# Merge Two PDF Files as Overlay - AWS Lambda

AWS Lambda function to merge two PDF files as overlay using PDF4me API.

## Setup

1. Install dependencies: `npm install`
2. Set environment variables:
   - `PDF4ME_API_KEY`: Your PDF4me API key
   - `OUTPUT_S3_BUCKET`: S3 bucket for output files
3. Deploy: `npm run deploy`

## Usage

Send POST request to `/merge-overlay` with:
```json
{
  "basePdfFile": "s3://bucket/base.pdf",
  "layerPdfFile": "s3://bucket/layer.pdf"
}
```

## Features

- Merge two PDFs as overlay
- S3 integration
- Async processing with polling
- Error handling 