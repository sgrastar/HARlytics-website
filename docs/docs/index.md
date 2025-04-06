
HARlytics is a powerful HTTP Archive (HAR) file analyzer that transforms complex HTTP traffic data into actionable insights. HAR files contain detailed information about web browser interactions with web servers, including request and response headers, timing data, cookies, and more. HARlytics makes this data accessible and meaningful for developers, QA engineers, and security professionals.

## Key Features

- **Advanced Filtering**: Quickly narrow down network requests by domain, HTTP method, status code, MIME type, and more
- **Comprehensive Views**: Analyze network traffic through detailed tables, sequence diagrams, and statistical visualizations
- **Cache & CDN Analysis**: Gain insights into caching behavior and Content Delivery Network performance
- **Cookie Tracking**: Monitor and analyze cookie exchanges between clients and servers
- **Export Options**: Save your findings in various formats for documentation and sharing

HARlytics helps you understand web application behavior, diagnose performance issues, validate security practices, and document complex system interactions through intuitive visual interfaces.

## Getting Started

### Loading HAR Files

HAR files are JSON-formatted archives that contain detailed information about web browser interactions. There are two ways to start using HARlytics:

1. **Using the Browser Extension**:
   - Install HARlytics from the [Chrome Web Store](https://chrome.google.com/webstore/detail/hecpjmmgpbecpeigmoilgcljdkidlbgm) or [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/harlytics/dhhndkibkdekohnpmhaeeegkcpmpjben)
   - Click the extension icon in your browser
   - Use your browser's developer tools to export a HAR file
   - Load the file into HARlytics

2. **Using the Web Version**:
   - Visit [https://cloud.harlytics.com/](https://cloud.harlytics.com/)
   - Click the file upload area or drag and drop a HAR file onto the page


After loading a file, HARlytics will display basic information about the HAR file including:
- Log version
- Creator information
- Page information (if available)
- Indicators for special content like authentication headers, cookies, and POST data

### Interface Overview

The HARlytics interface consists of:

1. **Action Area** (top): Contains file loading and filtering controls
2. **Display Area** (main): Shows the analyzed data through multiple tabs
3. **Status Indicators**: Badges showing what types of data are available in the loaded file

Once a file is loaded, you'll immediately see the Overview tab populated with all HTTP requests from the file, ready for analysis.