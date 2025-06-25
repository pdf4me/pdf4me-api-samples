# PDF API Samples

This folder contains sample code demonstrating PDF operations using the PDF4ME API.

## Structure

```
PDF/
├── Get PDF Metadata/           # Extract metadata from PDF files
│   ├── CSharp(C#)/            # C# implementation
│   └── Java/                  # Java implementation
└── Repair PDF Document/        # Repair corrupted PDF files
    ├── CSharp(C#)/            # C# implementation
    └── Java/                  # Java implementation
```

## Available Operations

### 1. Get PDF Metadata
Extract metadata information from PDF files including:
- Document properties
- Page count
- File size
- Creation/modification dates
- And more...

**Languages:** C#, Java

### 2. Repair PDF Document
Repair corrupted or damaged PDF files to make them readable again.

**Languages:** C#, Java

## Prerequisites

### For C# Projects
- .NET 8.0 SDK or later
- Visual Studio 2022 or VS Code

### For Java Projects
- Java 8 or later
- Maven (optional, for dependency management)
- IntelliJ IDEA, Eclipse, or VS Code

## Getting Started

1. Clone this repository
2. Navigate to the specific operation and language you want to use
3. Follow the README instructions in each project folder
4. Make sure to configure your PDF4ME API credentials

## Notes

- Each project includes sample files for testing
- Build artifacts (`bin/`, `obj/`, `out/`) are ignored by git
- IDE-specific files are also ignored
- Make sure to add your API key to the configuration before running the samples 