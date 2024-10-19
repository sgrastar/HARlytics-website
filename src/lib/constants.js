// /src/lib/constants.js

export const statusRanges = [
    { label: '200', min: 200, max: 299 },
    { label: '300', min: 300, max: 399 },
    { label: '400', min: 400, max: 499 },
    { label: '500', min: 500, max: 599 },
    { label: 'Other', min: 0, max: 199, other: true },
  ];
  
  export const communicationTypes = ['Fetch/XHR', 'Doc', 'CSS', 'JS', 'Font', 'Img', 'Media', 'Manifest', 'WS', 'Wasm', 'Other'];
  
  export const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'CONNECT', 'HEAD'];