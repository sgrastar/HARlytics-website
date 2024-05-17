<script>
  import { onMount } from 'svelte';
  import { formatTimestamp, truncateText, httpStatusCSSClass, exportToCSV } from '$lib/utils';
  import { Fileupload, Input, Label, Button, Toggle, Tabs, TabItem } from 'flowbite-svelte';
  import { ChevronDoubleRightOutline, ChevronDoubleLeftOutline,FileCsvOutline,DrawSquareOutline,ChartPieSolid, WindowOutline, BarsFromLeftOutline } from 'flowbite-svelte-icons';

  let logFilename = '';
  let logVersion = '';
  let logCreator = '';
  let cookieChanges = [];
  let urlFilter = '';
  let notUrlFilter = '';
  let allSelected = true;
  let filterTimer = null;
  let statusCounts = {};
  let typeCounts = {};
  let uniqueDomains = {};
  let isUrlTruncated = true;
  let isPathTruncated = true;
  let isDomainTruncated = true;
  let isTimestampTruncated = true;
  let truncatedCookies = {};

  const statusRanges = [
    { label: '100', min: 100, max: 199 },
    { label: '200', min: 200, max: 299 },
    { label: '300', min: 300, max: 399 },
    { label: '400', min: 400, max: 499 },
    { label: '500', min: 500, max: 599 },
    { label: 'Other', min: 0, max: 99, other: true },
  ];
  let selectedStatusRanges = [...statusRanges];
  let allStatusSelected = true;

  const communicationTypes = ['Fetch/XHR', 'Doc', 'CSS', 'JS', 'Font', 'Img', 'Media', 'Manifest', 'WS', 'Wasm', 'Other'];
  let selectedTypes = [...communicationTypes];
  let selectedCookies = new Set();

  onMount(() => {
    // initialize
  });

  function analyzeHAR(event) {
    //console.log("analyzeHAR");
    const file = event.target.files[0];
    logFilename = file.name;
    //console.log(logFilename.split('.').slice(0, -1).join('.'));
    const reader = new FileReader();

    reader.onload = function (e) {
      const harContent = JSON.parse(e.target.result);
      const entries = harContent.log.entries;
      logVersion = harContent.log.version;
      logCreator = harContent.log.creator.name + "(" +  harContent.log.creator.version +  ")";

      cookieChanges = entries.map(entry => {
        const url = new URL(entry.request.url);
        const domain = url.hostname;
        const path = url.pathname;
        return {
          url: entry.request.url,
          method: entry.request.method,
          domain: domain,
          path: path,
          timestamp: formatTimestamp(new Date(entry.startedDateTime)),
          status: entry.response.status,
          cookies: entry.request.cookies,
          type: getCommunicationType(entry)
        };
      });

      //console.log(cookieChanges);

      selectedCookies = new Set(cookieChanges.flatMap(change => change.cookies.map(cookie => cookie.name)));
      
      statusCounts = cookieChanges.reduce((acc, change) => {
        const statusRange = statusRanges.find(range =>
          (range.other && (change.status < 100 || change.status >= 600 || isNaN(change.status))) ||
          (change.status >= range.min && change.status <= range.max)
        );
        acc[statusRange.label] = (acc[statusRange.label] || 0) + 1;
        return acc;
      }, {});

      //console.log(statusCounts);
      
      typeCounts = cookieChanges.reduce((acc, change) => {
        acc[change.type] = (acc[change.type] || 0) + 1;
        return acc;
      }, {});

      uniqueDomains = [...new Set(cookieChanges.map(change => change.domain))].sort();
      console.log(uniqueDomains);

      isUrlTruncated = true;
      truncatedCookies = {};
      selectedCookies.forEach(cookieName => {
        truncatedCookies[cookieName] = true;
      });
    };

    reader.readAsText(file);
  }

  function getCommunicationType(entry) {
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

  $: filteredChanges = cookieChanges.filter(change => {
    const url = change.url.toLowerCase();
    const urlFilters = urlFilter.split('|').map(filter => filter.trim().toLowerCase());
    const notUrlFilters = notUrlFilter.split('|').map(filter => filter.trim().toLowerCase());

    const matchesUrlFilter = (urlFilters[0] && !urlFilter.endsWith('|')) ? urlFilters.some(filter => url.includes(filter)) : true;
    const matchesNotUrlFilter = (notUrlFilters[0] && !notUrlFilter.endsWith('|')) ? !notUrlFilters.some(filter => url.includes(filter)) : true;
    const matchesTypeFilter = selectedTypes.length === 0 || selectedTypes.includes(change.type);
    const matchesStatusFilter = selectedStatusRanges.some(range =>
      (range.other && (change.status < 100 || change.status >= 600 || isNaN(change.status))) ||
      (change.status >= range.min && change.status <= range.max)
    );

    return matchesUrlFilter && matchesNotUrlFilter && matchesTypeFilter && matchesStatusFilter;
  });
  $: cookieNames = new Set(filteredChanges.flatMap(change => change.cookies.map(cookie => cookie.name)));

  function toggleUrlTruncation() {
    isUrlTruncated = !isUrlTruncated;
  }

  function togglePathTruncation() {
    isPathTruncated = !isPathTruncated;
  }

  function toggleDomainTruncation() {
    isDomainTruncated = !isDomainTruncated;
  }

  function toggleTimestampTruncation() {
    isTimestampTruncated = !isTimestampTruncated;
  }

  function toggleCookieTruncation(cookieName) {
    truncatedCookies[cookieName] = !truncatedCookies[cookieName];
  }

  function handleExportCSV() {
  const csvData = filteredChanges.map(change => [
    change.path,
    change.domain,
    change.type,
    change.status,
    change.method,
    change.timestamp,
    ...[...cookieNames].map(name => {
      if (change.cookies) {
        const cookie = change.cookies.find(cookie => cookie.name === name);
        return cookie && selectedCookies.has(name) ? cookie.value : '';
      } else {
        return '';
      }
    })
  ]);
  exportToCSV(csvData, ['Path', 'Domain', 'Type', 'Status', 'Method', 'Timestamp', ...cookieNames], logFilename);
}

function handleStatusRangeClick(statusRange) {
    if (selectedStatusRanges.includes(statusRange)) {
      selectedStatusRanges = selectedStatusRanges.filter(range => range !== statusRange);
    } else {
      selectedStatusRanges = [...selectedStatusRanges, statusRange];
    }
    allStatusSelected = selectedStatusRanges.length === statusRanges.length;
  }

  function handleAllStatusChange(event) {
    allStatusSelected = event.target.checked;
    if (allStatusSelected) {
      selectedStatusRanges = [...statusRanges];
    } else {
      selectedStatusRanges = [];
    }
  }

  function handleTypeClick(type) {
    if (selectedTypes.includes(type)) {
      selectedTypes = selectedTypes.filter(t => t !== type);
    } else {
      selectedTypes = [...selectedTypes, type];
    }
    allSelected = selectedTypes.length === communicationTypes.length;
  }

  function handleAllChange(event) {
    allSelected = event.target.checked;
    if (allSelected) {
      selectedTypes = [...communicationTypes];
    } else {
      selectedTypes = [];
    }
  }

  function handleFilterInput() {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(() => {
      urlFilter = urlFilter.trim();
      notUrlFilter = notUrlFilter.trim();
    }, 1000);
  }

  function handleCookieChange(event, cookieName) {
    if (event.target.checked) {
      console.log(selectedCookies);
      console.log(cookieName);
      selectedCookies.add(cookieName);
    } else {
      selectedCookies.delete(cookieName);
    }
  }
</script>
<main class="p-4">
  <div id="action">
    <div class="grid grid-cols-12 mb-2">
      <div class="col-span-3 bg-red-100 p-2">
        <Fileupload accept=".har" on:change={analyzeHAR}  size="sm" />
        <span>Log version : {logVersion} / {logCreator}</span><br>
      </div>

      <div class="col-span-7 bg-indigo-200 p-2">
        <div class="grid grid-cols-2  flex space-x-2">
          <div>
            <Label for="urlFilter">Filter by URL (separate by |):</Label>
            <Input type="text" id="urlFilter" bind:value={urlFilter} on:input={handleFilterInput}  size="sm"/>
          </div>
          <div>
            <Label for="notUrlFilter">Exclude URLs containing (separate by |):</Label>
            <Input type="text" id="notUrlFilter" bind:value={notUrlFilter} on:input={handleFilterInput}  size="sm"/>
          </div>
        </div>
      </div>

      <div class="bg-orange-100 col-end-13 col-span-2 p-2">
        <div id="analyzeCookieAction">
          <Button size="xs" on:click={handleExportCSV}><FileCsvOutline class="w-4 h-4 me-2" />Export CookieData to CSV</Button>
        </div>
      </div>
    </div>
    
    
    

    <div id="filterStatus" class="grid grid-cols-12 gap-4 mb-0.5 p-2 flex items-center rounded">
      <div class="text-right">
        <span class="font-bold">Status Filter</span>
      </div>
  
      <div class="flex justify-start text-sm">
        <Toggle size="small" bind:checked={allStatusSelected} on:change={handleAllStatusChange}>
          All
        </Toggle>
      </div>
  
      <div class="col-span-10 flex space-x-1">
        {#each statusRanges as statusRange}
          <Button
            size="xs"
            class="px-2 py-0.5 font-normal"
            color={selectedStatusRanges.includes(statusRange) ? 'dark' : 'light'}
            on:click={() => handleStatusRangeClick(statusRange)}
          >
            {statusRange.label} ({filteredChanges.filter(change =>
              (statusRange.other && (change.status < 100 || change.status >= 600 || isNaN(change.status))) ||
              (change.status >= statusRange.min && change.status <= statusRange.max)
            ).length}/{statusCounts[statusRange.label] || 0})
          </Button>
        {/each}
      </div>
    </div>
  
    <div id="filterType" class="grid grid-cols-12 gap-4 mb-2 p-2 flex items-center rounded">
      <div class="text-right">
        <span class="font-bold">Type Filter</span>
      </div>
      
      <div class="flex justify-start">
        <Toggle size="small" bind:checked={allSelected} on:change={handleAllChange}>
          All
        </Toggle>
      </div>

      <div class="col-span-10 flex space-x-1" >
        {#each communicationTypes as type}
          <Button
            size="xs"
            class="px-2 py-0.5 font-normal"
            color={selectedTypes.includes(type) ? 'dark' : 'light'}
            on:click={() => handleTypeClick(type)}
          >
            {type} ({filteredChanges.filter(change => change.type === type).length}/{typeCounts[type] || 0})
          </Button>
        {/each}
      </div>
    </div>
    
    
  </div>
  
  <div id="display">
    <Tabs tabStyle="underline">
      <TabItem>
        <div slot="title" class="flex items-center gap-2">
          <ChartPieSolid />Overview
        </div>
        <div id="analyzeOverviewDisplay"></div>
      </TabItem>
      <TabItem>
        <div slot="title" class="flex items-center gap-2">
          <BarsFromLeftOutline />Detail
        </div>
        <div id="analyzeDetailDisplay"></div>
      </TabItem>
      <TabItem>
        <div slot="title" class="flex items-center gap-2">
          <DrawSquareOutline />Sequence
        </div>
        <div id="analyzeSequenceDisplay"></div>
      </TabItem>
      <TabItem open>
        <div slot="title" class="flex items-center gap-2">
          <WindowOutline />Cookie
        </div>
        <div id="analyzeCookieDisplay">
      {#if selectedTypes.length === 0}
        <p>No data to display.</p>
      {:else if filteredChanges.length > 0}
      <table>
        <thead>
          <tr>
            <th class="path">
              Path
              {#if filteredChanges.some(change => change.path.length > 20)}
                <button type="button" on:click={togglePathTruncation} aria-label="Toggle path truncation">
                  {#if isPathTruncated}
                    <ChevronDoubleRightOutline />
                  {:else}
                    <ChevronDoubleLeftOutline />
                  {/if}
                </button>
              {/if}
            </th>
            <th class="domain">
              Domain
              {#if filteredChanges.some(change => change.domain.length > 30)}
                <button type="button" on:click={toggleDomainTruncation} aria-label="Toggle domain truncation">
                  {#if isDomainTruncated}
                    <ChevronDoubleRightOutline />
                  {:else}
                    <ChevronDoubleLeftOutline />
                  {/if}
                </button>
              {/if}
            </th>
            <th class="type">Type</th>
            <th class="status">Status</th>
            <th class="method">Method</th>
            <th class="timestamp">
              Timestamp
              {#if filteredChanges.some(change => change.timestamp.length > 10)}
                <button type="button" on:click={toggleTimestampTruncation} aria-label="Toggle timestamp truncation">
                  {#if isTimestampTruncated}
                    <ChevronDoubleRightOutline />
                  {:else}
                    <ChevronDoubleLeftOutline />
                  {/if}
                </button>
              {/if}
            </th>
            {#each [...cookieNames] as name}
              <th>
                {#if name.length > 20 || filteredChanges.some(change => change.cookies.find(cookie => cookie.name === name && cookie.value.length > 20))}
                  <span title={name}>{truncatedCookies[name] ? truncateText(name, 20) : name}</span>
                  <button type="button" on:click={() => toggleCookieTruncation(name)} aria-label="Toggle cookie truncation for {name}">
                    {#if truncatedCookies[name]}
                      <ChevronDoubleRightOutline />
                    {:else}
                      <ChevronDoubleLeftOutline />
                    {/if}
                  </button>
                {:else}
                  {name}
                {/if}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each filteredChanges as change}
            <tr>
              <th class="path">
                {#if change.path.length > 20}
                  <span title={change.path}>{isPathTruncated ? truncateText(change.path, 20) : change.path}</span>
                {:else}
                  {change.path}
                {/if}
              </th>
              <th class="domain">
                {#if change.domain.length > 30}
                  <span title={change.domain}>{isDomainTruncated ? truncateText(change.domain, 30) : change.domain}</span>
                {:else}
                  {change.domain}
                {/if}
              </th>
              <th class="type"><span>{change.type}</span></th>
              <th class="status {httpStatusCSSClass(change.status)}">{change.status}</th>
              <th class="method {change.method}"><span>{change.method}</span></th>
              <th class="timestamp">
                {#if change.timestamp.length > 10}
                  <span title={change.timestamp}>{isTimestampTruncated ? truncateText(change.timestamp, 10) : change.timestamp}</span>
                {:else}
                  {change.timestamp}
                {/if}
              </th>
              {#each [...cookieNames] as name}
                <td>
                  {#if change.cookies.find(cookie => cookie.name === name)}
                    {#if selectedCookies.has(name)}
                      {#if name.length > 20 || change.cookies.find(cookie => cookie.name === name).value.length > 20}
                        <span title={change.cookies.find(cookie => cookie.name === name).value}>
                          {truncatedCookies[name] ? truncateText(change.cookies.find(cookie => cookie.name === name).value, 20) : change.cookies.find(cookie => cookie.name === name).value}
                        </span>
                      {:else}
                        {change.cookies.find(cookie => cookie.name === name).value}
                      {/if}
                    {/if}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
      {:else}
        <p>No data to display.</p>
      {/if}
        </div>
      </TabItem>
    </Tabs>
</div>
</main>

<style>
  main{
    /*font-family: Arial, Helvetica, sans-serif;*/
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: 75%;
  }
  #action{
    height: 100%;
  }
  /*
  #display{
    height: 60vh;
    overflow: scroll;
  }
  */
  #analyzeCookieDisplay{
    height: 55vh;
    overflow: scroll;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid black;
    padding: 3px 8px;
    text-align: left;
    white-space: nowrap;
  }

  thead th {
    /* 縦スクロール時に固定する */
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    /* tbody内のセルより手前に表示する */
    z-index: 1;
  }
  th:first-child {
    /* 横スクロール時に固定する */
    position: -webkit-sticky;
    position: sticky;
    left: 0;

  }
  thead th:first-child {
    /* ヘッダー行内の他のセルより手前に表示する */
    z-index: 2;
  }
  thead th {
    background-color: #f2f2f2;
  }
  
  thead th.path{
    width: 8em;
    background-color: #f2f2f2;
  }
  thead th.domain{
    width: 8em;
    background-color: #f2f2f2;
  }
  thead th.timestamp{
    width: 14em;
  }
  thead th.method{
    width: 8em;
  }

  thead th.timestamp{
    width: 14em;
  }
  thead th.method{
    width: 8em;
  }

  thead th.status{
    width: 4em;
  }
  thead th.type{
    width: 11em;
  }
  thead th > * {
    display: inline-block;
    vertical-align: middle;
  }

  thead th button {
    margin-left: 5px;
  }
  tbody th{
    font-weight: normal;
  }
  
  tbody th.path{
    background-color: #f2f2f2;
  }
  tbody th.domain{
    background-color: #f2f2f2;
  }
  tbody th.timestamp {
    background: #efefef;
    text-align: center;
    font-size: 100%;
    color: #333;
  }
  tbody th.method {
    background: #efefef;
    text-align: center;
    font-size: 100%;
    color: #333;
  }
  tbody th.type {
    background: #efefef;
    text-align: center;
    font-size: 100%;
    color: #333;
  }
  tbody th.status{
    text-align: center;
  }
  tbody th.status.success {
      background: #99ffa2;
  }

  tbody th.status.redirect {
      background: #eaff99;
  }
  tbody th.status.cliError {
      background: rgb(255, 153, 161);
  }

  .truncate-icon {
    cursor: pointer;
  }
  #filterStatus,
  #filterType {
    background: #c7c6c6b5;
    vertical-align: center;
  }

</style>