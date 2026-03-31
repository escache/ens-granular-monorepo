# Documentation Style Guide

This guide establishes the standard format and structure for all documentation in the ENS Granular Monorepo project.

## File Structure Standards

### 1. Header Format
All documentation files must start with:
```markdown
# [Document Title]

[Brief description of the document's purpose and scope]

## Table of Contents
1. [Section 1](#section-1)
2. [Section 2](#section-2)
...
```

### 2. Section Organization
- Use clear, descriptive headings (H2 for main sections, H3 for subsections)
- Include a Table of Contents for documents longer than 500 words
- Use consistent numbering and formatting

### 3. Code Examples
- Use proper language tags for code blocks
- Include context and explanations for code examples
- Use inline code formatting for variables, functions, and file names
- Include error handling and edge cases in examples

### 4. Cross-References
- Link to related documentation using relative paths
- Use descriptive link text
- Include "See also" sections for related topics

## Content Standards

### 1. Writing Style
- Use clear, concise language
- Write in active voice when possible
- Use consistent terminology throughout
- Include practical examples and use cases

### 2. Technical Accuracy
- Verify all code examples work
- Include version numbers for dependencies
- Update documentation when code changes
- Include troubleshooting sections

### 3. Accessibility
- Use descriptive alt text for images
- Structure content with proper headings
- Use bullet points and numbered lists appropriately
- Include summaries for complex topics

## Template Files

### Architecture Document Template
```markdown
# [System/Component Name] Architecture

[Brief description of the architecture and its purpose]

## Table of Contents
1. [Overview](#overview)
2. [Components](#components)
3. [Data Flow](#data-flow)
4. [Security Model](#security-model)
5. [Deployment](#deployment)
6. [References](#references)

## Overview

[High-level description of the system]

## Components

### Component 1
[Description and responsibilities]

### Component 2
[Description and responsibilities]

## Data Flow

[How data moves through the system]

## Security Model

[Security considerations and controls]

## Deployment

[How to deploy the system]

## References

[Links to related documentation and external resources]
```

### Implementation Document Template
```markdown
# [Feature Name] Implementation

[Brief description of what was implemented]

## Table of Contents
1. [Summary](#summary)
2. [Changes Made](#changes-made)
3. [Files Created](#files-created)
4. [Usage](#usage)
5. [Testing](#testing)
6. [Status](#status)

## Summary

[What was accomplished]

## Changes Made

### [Category 1]
- [Specific change 1]
- [Specific change 2]

### [Category 2]
- [Specific change 1]
- [Specific change 2]

## Files Created

### [File Type]
- `path/to/file.ext` - [Description]

## Usage

[How to use the implemented feature]

## Testing

[How to test the implementation]

## Status

**Completed**: [What's done]
**In Progress**: [What's being worked on]
**Pending**: [What's not started]
```

### API Document Template
```markdown
# [API Name] Documentation

[Brief description of the API]

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Examples](#examples)
5. [Error Handling](#error-handling)
6. [Rate Limits](#rate-limits)

## Overview

[What the API does and its purpose]

## Authentication

[How to authenticate with the API]

## Endpoints

### [HTTP Method] [Endpoint Path]

[Description of the endpoint]

**Parameters:**
- `param1` (type): [Description]
- `param2` (type): [Description]

**Response:**
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

## Examples

[Code examples showing how to use the API]

## Error Handling

[Common errors and how to handle them]

## Rate Limits

[Rate limiting information]
```

### Guide Template
```markdown
# [Guide Title]

[Brief description of what the guide covers]

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step-by-Step Instructions](#step-by-step-instructions)
3. [Troubleshooting](#troubleshooting)
4. [Next Steps](#next-steps)

## Prerequisites

[What you need before starting]

## Step-by-Step Instructions

### Step 1: [Action]
[Detailed instructions]

### Step 2: [Action]
[Detailed instructions]

## Troubleshooting

[Common issues and solutions]

## Next Steps

[What to do after completing the guide]
```

## File Naming Conventions

- Use UPPERCASE with hyphens for main documentation files
- Use descriptive names that indicate content
- Group related files with consistent prefixes
- Examples:
  - `ARCHITECTURE-OVERVIEW.md`
  - `IMPLEMENTATION-GUIDE.md`
  - `API-REFERENCE.md`

## Review Checklist

Before publishing documentation:

- [ ] File follows the appropriate template
- [ ] Table of Contents is included and accurate
- [ ] All code examples are tested and working
- [ ] Links are valid and point to correct locations
- [ ] Terminology is consistent throughout
- [ ] Grammar and spelling are correct
- [ ] Images have descriptive alt text
- [ ] Cross-references are included where appropriate

## Maintenance

- Update documentation when code changes
- Review and update quarterly
- Remove outdated information
- Add new sections as needed
- Keep examples current with latest versions
