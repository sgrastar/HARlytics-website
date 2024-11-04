export function formatTimestamp(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }
  

  export function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  export const escapeForMermaid = (text) => {
    return text
      .replace(/\\/g, '\\\\')   // バックスラッシュ
      .replace(/\$/g, '\\$')    // ドル記号
      .replace(/\#/g, '\\#')    // ハッシュ記号
      .replace(/\_/g, '\\_')    // アンダースコア
      .replace(/\~/g, '\\~')    // チルダ
      .replace(/\*/g, '\\*')    // アスタリスク
      .replace(/\+/g, '\\+')    // プラス記号
      .replace(/\=/g, '\\=')    // イコール記号
      .replace(/\|/g, '\\|')    // バーティカルバー
      .replace(/\[/g, '\\[')    // 開き角括弧
      .replace(/\]/g, '\\]')    // 閉じ角括弧
      .replace(/\{/g, '\\{')    // 開き波括弧
      .replace(/\}/g, '\\}')    // 閉じ波括弧
      .replace(/\(/g, '\\(')    // 開き丸括弧
      .replace(/\)/g, '\\)')    // 閉じ丸括弧
      .replace(/\>/g, '\\>')    // 大なり記号
      .replace(/\</g, '\\<')    // 小なり記号
      .replace(/\n/g, '\\n')    // 改行
      .replace(/\r/g, '\\r')    // 復帰
      .replace(/\t/g, '\\t')    // タブ
      .replace(/\'/g, '\\\'')   // シングルクォート
      .replace(/\"/g, '\\"');   // ダブルクォート
  };

  export function httpStatusCSSClass(statusNo) {
    if (100 <= statusNo && statusNo <= 199) {
      return "info"; // Information responses
    } else if(200 <= statusNo && statusNo <= 299){
      return "success"; // Successful responses
    } else if(300 <= statusNo && statusNo <= 399){
      return "redirect"; // Redirection responses
    } else if(400 <= statusNo && statusNo <= 499){
      return "cliError"; // Client-side error responses
    } else if(500 <= statusNo && statusNo <= 599){
      return "srvError"; // Server-side error responses
    }else{
      return "other";
    }
  }

  export function formatTime(time) {
    let formattedTime = '';
  
    if (time < 1000) {
      formattedTime = time.toFixed(0) + " ms";
    } else if (time < 60000) {
      formattedTime = (time / 1000).toFixed(2) + " s";
    } else if (time < 3600000) {
      const minutes = Math.floor(time / 60000);
      const seconds = ((time % 60000) / 1000).toFixed(0);
      formattedTime = minutes + " min " + (seconds < 10 ? '0' : '') + seconds + " s";
    } else {
      const hours = Math.floor(time / 3600000);
      const minutes = Math.floor((time % 3600000) / 60000);
      const seconds = ((time % 60000) / 1000).toFixed(0);
      formattedTime = hours + " h " + (minutes < 10 ? '0' : '') + minutes + " min " + (seconds < 10 ? '0' : '') + seconds + " s";
    }
  
    return formattedTime;
  }

  export function formatBytes(bytes) {
    if (bytes == 0) return '0 B';
  
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const sign = Math.sign(bytes);
    bytes = Math.abs(bytes);
  
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = (bytes / Math.pow(1024, i)).toFixed(1);
  
    return sign * value + ' ' + units[i];
  }
  
  export function exportToCSV(data, headers, logFilename, suffix) {
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', logFilename + suffix +'.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  
  export function splitByLength(text, length) {
    const lines = [];
    for (let i = 0; i < text.length; i += length) {
      lines.push(text.slice(i, i + length));
    }
    return lines;
  }
  
  export function parseCacheControl(cacheControlHeader) {
    const directives = cacheControlHeader.split(',').map(directive => directive.trim());
    const parsedDirectives = {};
  
    for (const directive of directives) {
      const [key, value] = directive.split('=');
      parsedDirectives[key] = value ? parseInt(value, 10) : true;
    }
    return parsedDirectives;
  }
  
  export function isResponseCached(ageInSeconds, parsedCacheControl) {
    if (ageInSeconds !== null) {
      return true;
    }
    if (parsedCacheControl['no-cache'] || parsedCacheControl['no-store']) {
      return false;
    }
    if (parsedCacheControl['max-age'] || parsedCacheControl['s-maxage']) {
      return true;
    }
    return false;
  }
  
  export function getCommunicationType(entry) {
    const contentType = entry.response.content.mimeType;
    if (!contentType) {
      return 'Other';
    } else if (contentType.includes('json') || contentType.includes('xml')) {
      return 'Fetch/XHR';
    } else if (contentType.includes('html')) {
      return 'Doc';
    } else if (contentType.includes('css')) {
      return 'CSS';
    } else if (contentType.includes('javascript')) {
      return 'JS';
    } else if (contentType.includes('font')) {
      return 'Font';
    } else if (contentType.includes('image')) {
      return 'Img';
    } else if (contentType.includes('audio') || contentType.includes('video')) {
      return 'Media';
    } else if (contentType.includes('manifest')) {
      return 'Manifest';
    } else if (entry._webSocketMessages) {
      return 'WS';
    } else if (contentType.includes('wasm')) {
      return 'Wasm';
    } else {
      return 'Other';
    }
  }
  
  export function getTopDomain(domain) {
    const parts = domain.split('.');
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }
    return domain;
  }

export function aggregateData(entries, key) {
  const aggregatedData = entries.reduce((acc, entry) => {
    const value = entry[key].replace( /\//g , "\/" );
    if (acc[value]) {
      acc[value]++;
    } else {
      acc[value] = 1;
    }
    return acc;
  }, {});

  return Object.entries(aggregatedData).map(([name, value]) => ({ name, value }));
}

export function copyTextarea(elemId) {
  var element = document.getElementById(elemId);
  navigator.clipboard.writeText(element.value);
}


export function formatGMTtoUTC(gmtDateString) {
  if (!gmtDateString) return '';
  
  try {
      const date = new Date(gmtDateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toISOString().slice(0, -5).replace('T', ' ');
  } catch {
      return '';
  }
}

export function formatToLocalTime(gmtDateString) {
  if (!gmtDateString) return '';
  
  try {
      const date = new Date(gmtDateString);
      if (isNaN(date.getTime())) return '';
      
      // タイムゾーン名を取得（例：'JST'）
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // タイムゾーンのオフセットを取得（例：'+0900'）
      const offset = date.getTimezoneOffset();
      const offsetHours = Math.abs(Math.floor(offset / 60)).toString().padStart(2, '0');
      const offsetMinutes = Math.abs(offset % 60).toString().padStart(2, '0');
      const offsetSign = offset <= 0 ? '+' : '-';
      const offsetString = `${offsetSign}${offsetHours}${offsetMinutes}`;
      
      return `${date.toLocaleString()} (${timeZone}, UTC${offsetString})`;
  } catch {
      return '';
  }
}

export function formatPostDataValue(value) {
  // nullやundefinedの処理
  if (value === null || value === undefined) {
    return '[null]';
  }

  // ArrayBufferとTypedArrayの処理
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    return '[Binary Data]';
  }

  // オブジェクトや配列の処理
  if (typeof value === 'object') {
    try {
      // 深いネストされたオブジェクトの場合は概要のみ表示
      if (JSON.stringify(value).length > 1000) {
        return '[Complex Object]';
      }
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return '[Complex Object]';
    }
  }

  // 長いテキストの処理
  if (typeof value === 'string') {
    // URLエンコードされている可能性のあるデータのデコードを試みる
    try {
      const decoded = decodeURIComponent(value);
      // デコードしたデータが元のデータと異なり、かつ読みやすい場合のみデコード結果を使用
      if (decoded !== value && /^[\x20-\x7E\s]+$/.test(decoded)) {
        return decoded;
      }
    } catch (e) {
      // デコードに失敗した場合は元のデータを使用
    }
    
    // 長すぎるテキストの truncate
    if (value.length > 500) {
      return value.substring(0, 500) + '... [Text Truncated]';
    }
    return value;
  }

  // その他の基本型はそのまま文字列化
  return String(value);
}

 // postDataの表示用に整形する関数
export function normalizePostData(postData) {
  if (!postData) return [];

  // mimeTypeに基づいて適切な処理を行う
  const result = [];
  
  // Content-Type に基づく処理
  if (postData.mimeType) {
    result.push({
      name: 'Content-Type',
      value: postData.mimeType
    });
  }

  // text/plainの場合
  if (postData.text) {
    try {
      // URLエンコードされたデータの処理
      if (postData.mimeType?.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(postData.text);
        for (const [key, value] of params) {
          result.push({
            name: key,
            value: formatPostDataValue(value)
          });
        }
      } else {
        result.push({
          name: 'Raw Data',
          value: formatPostDataValue(postData.text)
        });
      }
    } catch (e) {
      result.push({
        name: 'Raw Data',
        value: formatPostDataValue(postData.text)
      });
    }
  }

  // paramsがある場合（マルチパートフォームデータなど）
  if (postData.params) {
    postData.params.forEach(param => {
      result.push({
        name: param.name,
        value: formatPostDataValue(param.value)
      });
    });
  }

  return result;
}