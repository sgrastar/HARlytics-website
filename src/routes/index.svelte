<script>
    import FileUpload from '$lib/FileUpload.svelte';
    import CookieTable from '$lib/CookieTable.svelte';
    import { onMount } from 'svelte';
  
    let cookieChanges = [];
  
    onMount(() => {
      // ここで初期化処理を行うことができます
    });
  
    function handleFileUpload(event) {
      const file = event.detail;
      // アップロードされたファイルを処理するロジックをここに追加します
    }
  </script>
  
  <main>
    <h1>HAR Cookie Analyzer</h1>
    <FileUpload on:upload={handleFileUpload} />
    <CookieTable {cookieChanges} />
  </main>