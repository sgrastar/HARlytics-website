# Overview Tab

The Overview tab provides a comprehensive view of all HTTP requests captured in the HAR file, displaying key information in a table format.

## Request Details

For each HTTP request, the Overview tab displays:

- **Path**: The URL path of the request
- **Domain**: The server domain
- **Method**: HTTP method (GET, POST, PUT, etc.)
- **Status**: HTTP status code with color coding:
  - Green: Successful responses (2xx)
  - Yellow: Redirects (3xx)
  - Red: Client errors (4xx)
  - Dark Red: Server errors (5xx)
- **Type**: Content type classification (JS, CSS, Image, etc.)
- **MIME Type**: Specific content type
- **Indicators**: Visual flags for:
  - Authorization headers (A)
  - POST data (P)
  - Query parameters (Q)
  - Cookies (C)
- **Timestamp**: When the request was made
- **Time**: Total request duration
- **Size**: Response size
- **Waterfall**: Visual timing breakdown

## Waterfall Visualization

The waterfall chart shows the timeline of each request broken down into phases:

- **Queueing**: Time spent waiting in browser queue
- **DNS Lookup**: Domain name resolution time
- **Connection**: TCP connection establishment time
- **SSL**: TLS handshake time
- **Request**: Time to send the request
- **Waiting**: Time waiting for the server's response (TTFB)
- **Receiving**: Time downloading the response

Hovering over the waterfall displays detailed timing information for each phase.

## Detailed View

Clicking on any request expands it to show detailed information organized in tabs:

1. **Headers**: All request and response headers
2. **Payload**: Query parameters and POST data
3. **Timing**: Detailed timing breakdown
4. **Cookies**: Cookie exchange information

## Exporting Data

You can export the filtered data to CSV format by clicking the **Export Data to CSV** button in the top right corner. This creates a comprehensive spreadsheet with all request details for further analysis or documentation.
