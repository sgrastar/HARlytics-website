# Getting Started

## Loading HAR Files

HAR files are JSON-formatted archives that contain detailed information about web browser interactions. There are two ways to start using HARlytics:

1. **Using the Browser Extension**:
   - Install HARlytics from the [Chrome Web Store](https://chrome.google.com/webstore/detail/hecpjmmgpbecpeigmoilgcljdkidlbgm) or [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/harlytics/dhhndkibkdekohnpmhaeeegkcpmpjben)
   - Click the extension icon in your browser
   - Use your browser's developer tools to export a HAR file
   - Load the file into HARlytics

2. **Using the Web Version**:
   - Visit [https://cloud.harlytics.com/](https://cloud.harlytics.com/)
   - Click the file upload area or drag and drop a HAR file onto the page

![Screenshot of file loading](https://github.com/sgrastar/HARlytics/blob/images/images/screenshot_1_0_0_3.png)

After loading a file, HARlytics will display basic information about the HAR file including:
- Log version
- Creator information
- Page information (if available)
- Indicators for special content like authentication headers, cookies, and POST data

## Interface Overview

The HARlytics interface consists of:

1. **Action Area** (top): Contains file loading and filtering controls
2. **Display Area** (main): Shows the analyzed data through multiple tabs
3. **Status Indicators**: Badges showing what types of data are available in the loaded file

Once a file is loaded, you'll immediately see the Overview tab populated with all HTTP requests from the file, ready for analysis.