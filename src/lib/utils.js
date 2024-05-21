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
  
  export function truncateText(text,len) {
    if (text.length <= len) {
      return text;
    } else {
      return text.substring(0, len) + '...';
    }
  }

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
    if (bytes === 0) return '0 B';
  
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const sign = Math.sign(bytes);
    bytes = Math.abs(bytes);
  
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = (bytes / Math.pow(1024, i)).toFixed(1);
  
    return sign * value + ' ' + units[i];
  }
  
  export function exportToCSV(data, headers, logFilename) {
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', logFilename + '_cookie.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }