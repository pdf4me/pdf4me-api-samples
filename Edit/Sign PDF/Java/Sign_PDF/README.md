# Sign PDF - Java Implementation

This Java project demonstrates how to digitally sign a PDF document with an image using the PDF4me API.

## Features
- Signs a PDF with a specified image.
- Configurable alignment, margins, opacity, and page selection.
- Asynchronous processing for efficient handling of large files.
- Built with standard Java `HttpClient`.

## Prerequisites
- Java 17 or higher
- A PDF4me API key (get one from [dev.pdf4me.com](https://dev.pdf4me.com/dashboard/#/api-keys/))
- A `sample.pdf` file in the project directory for testing.
- A `sample.png` signature image file in the project directory.

## Project Structure
```
Sign_PDF/
├── src/
│   └── Main.java
├── out/
├── .idea/
├── Sign_PDF.iml
├── README.md
├── sample.pdf
└── sample.png
```

## How to Use

1.  **Set API Key**: Open `src/Main.java` and replace `"Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/"` with your actual PDF4me API key.
2.  **Add Files**: Place your test PDF (`sample.pdf`) and signature image (`sample.png`) in the root of the `Sign_PDF` directory.
3.  **Compile**:
    ```bash
    javac -d out src/Main.java
    ```
4.  **Run**:
    ```bash
    java -cp out Main
    ```

## Output
The resulting file, `sample.signed.pdf`, will be saved in the same directory as the input PDF.

## Troubleshooting
- **401 Unauthorized**: Check if your API key is correct and has the necessary permissions.
- **404 Not Found**: Ensure the API endpoint in the code is correct. The dev environment may not support all features.
- **File Not Found**: Make sure `sample.pdf` and `sample.png` are in the correct directory. 