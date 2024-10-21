import { truncateText, splitByLength } from '$lib/utils';

export function escapeForMermaid(str) {
  return str.replace(/:/g, '&#58;').replace(/\n/g, '<br>');
}

export function truncateAndEscape(str, length) {
  return escapeForMermaid(truncateText(str, length));
}

export function generateMermaidHeaderAndTitle(addTitle, sequenceTitle, addAutoNumber) {
    let mermaidCode = 'sequenceDiagram\n';
    if (addTitle && sequenceTitle) {
      mermaidCode += `title: ${sequenceTitle}\n`;
    }
    if (addAutoNumber) {
      mermaidCode += "autonumber\n";
    }
    return mermaidCode;
  }
  
  export function generateMermaidQueryString(entry, addRequestQueryString, truncateQueryStrings, truncateQueryStringsLength) {
    if (addRequestQueryString && entry.requestQueryString.length > 0) {
      let requestQueryStringString = '';
      
      if (truncateQueryStrings) {
        requestQueryStringString = entry.requestQueryString.map(Qstring => 
          `${truncateAndEscape(Qstring.name, truncateQueryStringsLength)}: ${truncateAndEscape(Qstring.value, truncateQueryStringsLength)}`
        ).join('<br>');
      } else {
        requestQueryStringString = entry.requestQueryString.map(Qstring => {
          const lines = splitByLength(`${Qstring.name}: ${Qstring.value}`, 50);
          return escapeForMermaid(lines.join('<br>'));
        }).join('<br>');
      }
      return `note over ${entry.domain}: [Query String]<br>${requestQueryStringString}\n`;
    }
    return '';
  }

  export function generateMermaidPostData(entry, addRequestPostData, truncatePostData, truncatePostDataLength) {
    if (addRequestPostData && entry.requestPostData) {
      let postDataString = '';
  
      if (truncatePostData) {
        postDataString = entry.requestPostData.params
          ? entry.requestPostData.params.map(param => `${truncateAndEscape(param.name, truncatePostDataLength)}: ${truncateAndEscape(param.value, truncatePostDataLength)}`).join('<br>')
          : truncateAndEscape(entry.requestPostData.text, truncatePostDataLength);
      } else {
        postDataString = entry.requestPostData.params
          ? entry.requestPostData.params.map(param => {
              const lines = splitByLength(`${param.name}: ${param.value}`, 50);
              return escapeForMermaid(lines.join('<br>'));
            }).join('<br>')
          : escapeForMermaid(splitByLength(entry.requestPostData.text, 50).join('<br>'));
      }
      return `note over ${entry.domain}: [postData] ${entry.requestPostData.mimeType}<br>${postDataString}\n`;
    }
    return '';
  }

  export function generateMermaidRequestCookies(entry, addRequestCookies, truncateReqCookie, truncateReqCookieLength) {
    if (addRequestCookies && entry.requestCookies.length > 0) {
      let cookieString = '';
  
      if (truncateReqCookie) {
        cookieString = entry.requestCookies.map(cookie => 
          `${truncateAndEscape(cookie.name, truncateReqCookieLength)}: ${truncateAndEscape(cookie.value, truncateReqCookieLength)}`
        ).join('<br>');
      } else {
        cookieString = entry.requestCookies.map(cookie => {
          const lines = splitByLength(`${cookie.name}: ${cookie.value}`, 50);
          return escapeForMermaid(lines.join('<br>'));
        }).join('<br>');
      }
      return `note over ${entry.domain}: [Request Cookies]<br>${cookieString}\n`;
    }
    return '';
  }

  export function generateMermaidResponse(entry, addLifeline) {
    let responseCode = '';
    const responseArrow = `${entry.status} - ${entry.responseMimeType}`;
  
    if (entry.status >= 300 && entry.status <= 399) {
      responseCode += `${entry.domain} -->> Browser: ${responseArrow}\n`;
    } else if (entry.status >= 400 && entry.status <= 599) {
      responseCode += `${entry.domain} --x Browser: ${responseArrow}\n`;
    } else {
      responseCode += `${entry.domain} ->> Browser: ${responseArrow}\n`;
    }
  
    if (addLifeline) {
      responseCode += `  deactivate ${entry.domain}\n`;
    }
  
    return responseCode;
  }


  export function generateMermaidResponseCookies(entry, addResponseCookies, truncateResCookie, truncateResCookieLength) {
    if (addResponseCookies && entry.responseCookies.length > 0) {
      let cookieString = '';
  
      if (truncateResCookie) {
        cookieString = entry.responseCookies.map(cookie => 
          `${truncateAndEscape(cookie.name, truncateResCookieLength)}: ${truncateAndEscape(cookie.value, truncateResCookieLength)}`
        ).join('<br>');
      } else {
        cookieString = entry.responseCookies.map(cookie => {
          const lines = splitByLength(`${cookie.name}: ${cookie.value}`, 50);
          return escapeForMermaid(lines.join('<br>'));
        }).join('<br>');
      }
      return `note over Browser: [Response Cookies]<br>${cookieString}\n`;
    }
    return '';
  }