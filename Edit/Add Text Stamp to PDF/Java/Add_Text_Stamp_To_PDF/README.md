# Add Text Stamp to PDF - Java Implementation

This Java project demonstrates how to add a text stamp to a PDF document using the PDF4me API.

## Features
- Stamps custom text onto PDF pages.
- Configurable text, alignment, font size, color, opacity, and rotation.
- Asynchronous processing for efficient handling of large files.
- Built with standard Java `HttpClient`.

## Prerequisites
- Java 17 or higher
- A PDF4me API key (get one from [dev.pdf4me.com](https://dev.pdf4me.com/dashboard/#/api-keys/))
- A `sample.pdf` file in the project directory for testing.

## Project Structure
```
Add_Text_Stamp_To_PDF/
├── src/
│   └── Main.java
├── out/
├── .idea/
├── Add_Text_Stamp_To_PDF.iml
├── README.md
└── sample.pdf
```

## How to Use

1.  **Set API Key**: Open `src/Main.java` and replace `"YOUR_API_KEY_HERE"` with your actual PDF4me API key.
2.  **Add PDF**: Place your test PDF file named `sample.pdf` in the root of the `Add_Text_Stamp_To_PDF` directory.
3.  **Compile**:
    ```bash
    javac -d out src/Main.java
    ```
4.  **Run**:
    ```bash
    java -cp out Main
    ```

## Output
The resulting file, `sample.with_text_stamp.pdf`, will be saved in the same directory as the input PDF.

## Troubleshooting
- **401 Unauthorized**: Check if your API key is correct.
- **404 Not Found**: Ensure the API endpoint in the code is correct. The dev environment may not support all features.
- **File Not Found**: Make sure `sample.pdf` is in the correct directory. 