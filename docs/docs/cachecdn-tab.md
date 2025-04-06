# Cache/CDN Tab

The Cache/CDN tab provides specialized insights into content caching and Content Delivery Network behaviors present in the captured network traffic.

## Display Modes

This tab offers three different view modes accessible via radio buttons:

1. **Cache Status**: Focuses on the freshness and storage policies of cached resources
2. **CDN Delivery Status**: Shows how content is delivered through CDNs
3. **Resource Validation**: Details how resources are validated for freshness

## Cache Analysis

The Cache Status view shows:

- **CDN**: Detected CDN provider (Cloudflare, Akamai, Fastly, etc.)
- **Source**: Where the content was served from (CDN, Origin, Disk Cache)
- **CDN Freshness**: Whether the resource is fresh or stale in the CDN cache
- **Browser Freshness**: Whether the resource is fresh or stale in the browser cache
- **Storage**: Cache storage policy (Public, Private, No-Store)
- **TTL**: Time-to-live for the cached resource
- **Policy**: Additional cache directives

This view helps identify resources that aren't being cached efficiently or that have suboptimal cache policies.

## CDN Analysis

The CDN Delivery Status view shows:

- **Protocol**: HTTP version used (HTTP/1.1, HTTP/2, HTTP/3)
- **Location**: The CDN edge location that served the content
- **CDN Cache Status**: The caching status reported by the CDN
- **Content-Encoding**: Compression method used

HARlytics automatically detects popular CDNs including Cloudflare, Akamai, Fastly, CloudFront, and more, showing detailed information about how they handled each request.

## Resource Validation

The Resource Validation view focuses on how browsers validate cached resources:

- **ETag**: Entity tag for validating resource freshness
- **Last-Modified**: When the resource was last updated
- **Age**: How long the resource has been in cache

## Detailed View

Clicking on any entry reveals detailed information about the caching headers and CDN-specific metadata, helping you understand exactly how the resource is being cached and delivered.

This tab is invaluable for optimizing website performance by ensuring resources are cached properly and delivered efficiently through CDNs.