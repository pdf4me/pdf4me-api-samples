# Create Image from PDF - Java Sample

## Setup Instructions for Jackson JSON Library

This sample requires the Jackson JSON library for parsing API responses. The required JARs are included in the `lib/` directory.

### If you use an IDE (IntelliJ IDEA, Eclipse, etc.):
- **Add the `lib` directory as a library/dependency in your project/module settings.**
  - **IntelliJ IDEA:** Right-click the `lib` folder → "Add as Library..."
  - **Eclipse:** Right-click the project → Properties → Java Build Path → Add JARs... → Select all JARs in `lib/`
- This will resolve any linter/import errors for `com.fasterxml.jackson.*` classes in your editor.

### If you use the command line:
- **Compile:**
  ```sh
  javac -cp 'lib/*' src/Main.java
  ```
- **Run:**
  ```sh
  java -cp 'lib/*:src' Main
  ```

---

# Usage

This sample demonstrates how to use the PDF4me API to create images from a PDF file. It will save the output images and the raw JSON response in the `PDF_to_Images_outputs` folder.

## Input
- Place your input PDF as `sample.pdf` in this directory.

## Output
- Output images and the raw JSON response will be saved in `PDF_to_Images_outputs/`.

---

# Original Instructions

A Java prototype for creating images from PDF files using the PDF4Me API.

## Structure

- src/Main.java: Main entry point
- .gitignore: Ignore rules
- README.md: Project info
- out/: Output directory (ignored)
- .idea/: IntelliJ config (optional)

## TODO
- Implement PDF to image logic
- Add API integration 