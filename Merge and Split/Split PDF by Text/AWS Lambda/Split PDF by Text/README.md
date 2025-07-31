# Split PDF by Text - AWS Lambda

AWS Lambda function to split PDF documents by text using PDF4me API.

## Setup

1. Install dependencies: `npm install`
2. Set environment variables:
   - `PDF4ME_API_KEY`: Your PDF4me API key
   - `OUTPUT_S3_BUCKET`: S3 bucket for output files
3. Deploy: `npm run deploy`

## Usage

Send POST request to `/split-pdf-by-text` with:
```json
{
  "inputPdfPath": "sample_text.pdf",
  "textString": "Chapter",
  "textFilter": "startsWith",
  "splitTextPage": "after",
  "caseSensitive": false,
  "combinePagesWithSameText": false
}
```

## Features

- Split PDF by text detection
- Multiple text filter options (startsWith, endsWith, contains, exact)
- Configurable split position (before/after/remove text)
- Case sensitive/insensitive text matching
- Combine consecutive pages with same text
- Async processing with polling
- Error handling 