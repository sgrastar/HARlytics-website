# Sequence Tab

The Sequence tab visualizes HTTP interactions as sequence diagrams, making it easy to understand the flow of communication between the browser and servers.

## Sequence Diagram View

The main area of this tab displays a Mermaid-based sequence diagram showing:

- **Actors**: Browser and server domains
- **Messages**: HTTP requests and responses with methods and status codes
- **Notes**: Additional information like query parameters, POST data, and cookies

The diagram visually presents the chronological flow of requests and responses, making it much easier to understand complex interactions than looking at raw logs.

## Diagram Settings

The left panel provides extensive customization options:

### General Settings
- **Add Auto-number**: Numbers each message in sequence
- **Add Title**: Displays a custom title in the diagram
- **Add Lifeline**: Shows activation and destruction markers for each actor

### Notes Settings
- **Show QueryString**: Displays URL query parameters
- **Show postData**: Includes POST data in the diagram
- **Show Request Cookies**: Displays cookies sent to the server
- **Show Response Cookies**: Shows cookies set by the server

Each of these options includes further settings for truncating lengthy values, with sliders to control how many characters to display.

## Export Options

The Sequence tab offers multiple export formats:

1. **PNG/SVG Export**:
   - Choose PNG or SVG format
   - Set transparency or white background (PNG only)
   - Control output dimensions
   - Preview in a new tab
   - Copy to clipboard

2. **Mermaid Code Export**:
   - Copy the raw Mermaid code
   - Use in documentation or other diagramming tools

3. **PlantUML Code Export**:
   - Copy the PlantUML version of the diagram
   - Use with PlantUML tools

Sequence diagrams are particularly valuable for:
- Documenting system behavior
- Understanding application flows
- Analyzing authentication processes
- Identifying unnecessary requests