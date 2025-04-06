# Filtering Capabilities

HARlytics provides powerful filtering tools to help you focus on specific aspects of network traffic.

## Domain Filtering

The domain filter allows you to select which websites' traffic you want to analyze:

1. Use the **Filter by Domain** dropdown to select one or more domains
2. Each domain shows a count of how many requests it contains
3. Click **Select All Domains** to include everything
4. Domains are automatically extracted from the loaded HAR file

This is particularly useful when analyzing complex applications that make requests to multiple services or third-party domains.

## URL Filtering

For more precise filtering:

1. Use the **URL Filters** text box to enter comma-separated search terms
2. HARlytics will display requests that match ALL of the provided terms
3. Use the prefix `-` before a term to exclude requests containing that text
4. The filter examines both domain and path components of URLs

For example, entering `api, users` will show only requests that contain both "api" and "users" in their URL.

## Method, Status, MIME Type, and Message Filters

HARlytics provides specialized filters for different request properties:

1. **Method Filter**: Select which HTTP methods to include (GET, POST, PUT, etc.)
2. **Status Filter**: Filter by HTTP status code ranges (1xx, 2xx, 3xx, 4xx, 5xx)
3. **MIME Type Filter**: Focus on specific content types (JS, CSS, HTML, Images, etc.)
4. **Message Filter**: Select requests based on their message elements:
   - Authorization headers
   - Query parameters
   - POST data
   - Set-Cookie headers
   - Plain requests (without special elements)

Each filter shows counts of matching requests for easy reference. When active, filters are highlighted in blue to indicate they're being applied.

These filters can be combined to create highly specific views, such as "show only failed POST requests to the API domain that contain authorization headers."