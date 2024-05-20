<script>
  import { onMount } from 'svelte';
  import { formatTimestamp, truncateText, httpStatusCSSClass, exportToCSV } from '$lib/utils';
  import { Fileupload, Input, Label, Button, Toggle, Tabs, TabItem, MultiSelect } from 'flowbite-svelte';
  import { ChevronDoubleRightOutline, ChevronDoubleLeftOutline,FileCsvOutline,DrawSquareOutline,ChartPieSolid, WindowOutline, BarsFromLeftOutline } from 'flowbite-svelte-icons';

  let logFilename = '';
  let logVersion = '';
  let logCreator = '';
  let entries = [];
  let urlFilter = '';
  let notUrlFilter = '';
  let allSelected = true;
  let filterTimer = null;
  let statusCounts = {};
  let typeCounts = {};
  let uniqueDomains = [];
  let domainCounts = {};
  let selectedDomains = [];
  let isUrlTruncated = true;
  let isPathTruncated = true;
  let isDomainTruncated = true;
  let isTimestampTruncated = true;
  let truncatedValues = {};

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
  let selectedValues = new Set();

  onMount(() => {
    // initialize
  });

  function analyzeHAR(event) {
    const file = event.target.files[0];
    logFilename = file.name;
    const reader = new FileReader();

    reader.onload = function (e) {
      const harContent = JSON.parse(e.target.result);
      entries = harContent.log.entries;
      logVersion = harContent.log.version;
      logCreator = harContent.log.creator.name + "(" +  harContent.log.creator.version +  ")";

      entries = entries.map(entry => {
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
          values: entry.request.cookies,
          type: getCommunicationType(entry)
        };
      });

      selectedValues = new Set(entries.flatMap(entry => entry.values.map(value => value.name)));
      
      statusCounts = entries.reduce((acc, entry) => {
        const statusRange = statusRanges.find(range =>
          (range.other && (entry.status < 100 || entry.status >= 600 || isNaN(entry.status))) ||
          (entry.status >= range.min && entry.status <= range.max)
        );
        acc[statusRange.label] = (acc[statusRange.label] || 0) + 1;
        return acc;
      }, {});

      typeCounts = entries.reduce((acc, entry) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
        return acc;
      }, {});

      uniqueDomains = [...new Set(entries.map(entry => entry.domain))];

      domainCounts = entries.reduce((acc, entry) => {
        acc[entry.domain] = (acc[entry.domain] || 0) + 1;
        return acc;
      }, {});

      isUrlTruncated = true;
      truncatedValues = {};
      selectedValues.forEach(valueName => {
        truncatedValues[valueName] = true;
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

  function getTopDomain(domain) {
    const parts = domain.split('.');
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }
    return domain;
  }
  
  $: filteredEntries = entries.filter(entry => {
    const url = entry.url.toLowerCase();
    const urlFilters = urlFilter.split('|').map(filter => filter.trim().toLowerCase());
    const notUrlFilters = notUrlFilter.split('|').map(filter => filter.trim().toLowerCase());

    const matchesUrlFilter = (urlFilters[0] && !urlFilter.endsWith('|')) ? urlFilters.some(filter => url.includes(filter)) : true;
    const matchesNotUrlFilter = (notUrlFilters[0] && !notUrlFilter.endsWith('|')) ? !notUrlFilters.some(filter => url.includes(filter)) : true;
    const matchesTypeFilter = selectedTypes.length === 0 || selectedTypes.includes(entry.type);
    const matchesStatusFilter = selectedStatusRanges.some(range =>
      (range.other && (entry.status < 100 || entry.status >= 600 || isNaN(entry.status))) ||
      (entry.status >= range.min && entry.status <= range.max)
    );
    const matchesDomainFilter = selectedDomains.length === 0 || selectedDomains.includes(entry.domain);

    return matchesUrlFilter && matchesNotUrlFilter && matchesTypeFilter && matchesStatusFilter && matchesDomainFilter;
    
  });

  $: allValueNames = new Set(entries.flatMap(entry => entry.values.map(value => value.name)));
  $: valueNames = new Set(filteredEntries.flatMap(entry => entry.values.map(value => value.name)));

  $: domainOptions = uniqueDomains
    .sort((a, b) => {
      const topDomainA = getTopDomain(a);
      const topDomainB = getTopDomain(b);
      return topDomainA.localeCompare(topDomainB) || a.localeCompare(b);
    })
    .map(domain => ({
      value: domain,
      name: `${domain} (${domainCounts[domain] || 0})`
    }));

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

  function toggleValueTruncation(valueName) {
    truncatedValues[valueName] = !truncatedValues[valueName];
  }

  function handleExportCSV() {
  const csvData = filteredEntries.map(entry => [
    entry.path,
    entry.domain,
    entry.type,
    entry.status,
    entry.method,
    entry.timestamp,
    ...[...allValueNames].map(name => {
      if (entry.values) {
        const value = entry.values.find(value => value.name === name);
        return value && selectedValues.has(name) ? value.value : '';
      } else {
        return '';
      }
    })
  ]);
  exportToCSV(csvData, ['Path', 'Domain', 'Type', 'Status', 'Method', 'Timestamp', ...allValueNames], logFilename);
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

  function handleSelectAllDomains() {
    selectedDomains = [...uniqueDomains];
  }

  function handleFilterInput() {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(() => {
      urlFilter = urlFilter.trim();
      notUrlFilter = notUrlFilter.trim();
    }, 1000);
  }


  function handleValueChange(event, valueName) {
    if (event.target.checked) {
      selectedValues.add(valueName);
    } else {
      selectedValues.delete(valueName);
    }
  }
</script>
<main class="p-4">
  <div id="action">
    <div class="grid grid-cols-12 mb-2 space-x-1">
      <div class="col-span-3 bg-red-100 p-2  rounded">
        <div class="mb-2">
          <Label for="fileUpload">Select HAR file</Label>
          <Fileupload id="fileUpload" accept=".har" on:change={analyzeHAR}  size="sm" />
        </div>
        
        <span>Log version : {logVersion} / {logCreator}</span><br>
      </div>

      <div class="col-span-7 bg-gray-200 p-2 rounded">

        <div class="grid grid-cols-12 mb-2 flex items-center">
          <div class="col-span-10" id="domainFilterDiv">
            <Label for="domainFilter">Filter by Domain:</Label>
            <MultiSelect id="domainFilter" bind:value={selectedDomains} items={domainOptions} size="sm" placeholder="Load the file and select the domain(s) you want to analyze..." />
            
          </div>
          <div class="col-span-2 flex justify-center">
            <Button size="xs" color="light" on:click={handleSelectAllDomains}>Select All Domains</Button>
          </div>
        </div>

        <div class="grid grid-cols-12">

          <div class="col-span-6">
            <Label for="urlFilter">Filter by URL (separate by |):</Label>
            <Input type="text" id="urlFilter" bind:value={urlFilter} on:input={handleFilterInput}  size="sm"/>
          </div>
          <div class="col-span-6 ml-2">
            <Label for="notUrlFilter">Exclude URLs containing (separate by |):</Label>
            <Input type="text" id="notUrlFilter" bind:value={notUrlFilter} on:input={handleFilterInput}  size="sm"/>
          </div>

          
        </div>
      </div>

      <div class="bg-orange-100 col-end-13 col-span-2 p-2  rounded">
        <div id="analyzeValueAction">
          <Button size="xs" on:click={handleExportCSV}><FileCsvOutline class="w-4 h-4 me-2" />Export Data to CSV</Button>
        </div>
      </div>
    </div>
    

    <div id="filters" class="grid grid-cols-12 flex items-center space-x-1">

      <div id="filterStatus" class="col-span-5 grid grid-cols-12 gap-4 p-2 flex items-center bg-gray-100 rounded">
        <div class="col-span-3 grid grid-cols-6 flex items-center">
          <div class="col-span-4 flex justify-center content-center">
            <span class="font-bold">Status Filter</span>
          </div>
      
          <div class="flex justify-start text-sm flex items-center">
            <Toggle size="small" bind:checked={allStatusSelected} on:change={handleAllStatusChange}>
              All
            </Toggle>
          </div>
        </div>
    
        <div class="col-span-9 flex space-x-1">
          {#each statusRanges as statusRange}
            <Button
              size="xs"
              class="px-2 py-0.5 font-normal"
              color={selectedStatusRanges.includes(statusRange) ? 'dark' : 'light'}
              on:click={() => handleStatusRangeClick(statusRange)}
            >
              {statusRange.label} ({filteredEntries.filter(entry =>
                (statusRange.other && (entry.status < 100 || entry.status >= 600 || isNaN(entry.status))) ||
                (entry.status >= statusRange.min && entry.status <= statusRange.max)
              ).length}/{statusCounts[statusRange.label] || 0})
            </Button>
          {/each}
        </div>
      </div>
  
      <div id="filterType" class="col-span-7 grid grid-cols-12 gap-4 p-2 flex items-center bg-gray-100 rounded">
        <div class="text-right content-center">
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
              class="px-2 py-0.5font-normal"
              color={selectedTypes.includes(type) ? 'dark' : 'light'}
              on:click={() => handleTypeClick(type)}
            >
              {type} ({filteredEntries.filter(entry => entry.type === type).length}/{typeCounts[type] || 0})
            </Button>
          {/each}
        </div>
      </div>
    </div>
  </div>
  <div id="display">
    <Tabs tabStyle="underline">
      <TabItem >
        <div slot="title" class="flex items-center gap-2">
          <ChartPieSolid size="sm" />Overview
        </div>
        <div id="analyzeOverviewDisplay"></div>
      </TabItem>
      <TabItem >
        <div slot="title" class="flex items-center gap-2">
          <BarsFromLeftOutline size="sm" />Detail
        </div>
        <div id="analyzeDetailDisplay">
          {#if selectedTypes.length === 0}
            <p>No data to display.</p>
          {:else if filteredEntries.length > 0}
          <table>
            <thead>
              <tr>
                <th class="path">
                  Path
                  {#if filteredEntries.some(entry => entry.path.length > 30)}
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
                  {#if filteredEntries.some(entry => entry.domain.length > 30)}
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
                  {#if filteredEntries.some(entry => entry.timestamp.length > 10)}
                    <button type="button" on:click={toggleTimestampTruncation} aria-label="Toggle timestamp truncation">
                      {#if isTimestampTruncated}
                        <ChevronDoubleRightOutline />
                      {:else}
                        <ChevronDoubleLeftOutline />
                      {/if}
                    </button>
                  {/if}
                </th>
                {#each [...allValueNames] as name}
                  {#if valueNames.has(name)}
                    <th>
                      {#if name.length > 20 || filteredEntries.some(entry => entry.values.find(value => value.name === name && value.value.length > 20))}
                        <span title={name}>{truncatedValues[name] ? truncateText(name, 20) : name}</span>
                        <button type="button" on:click={() => toggleValueTruncation(name)} aria-label="Toggle value truncation for {name}">
                          {#if truncatedValues[name]}
                            <ChevronDoubleRightOutline />
                          {:else}
                            <ChevronDoubleLeftOutline />
                          {/if}
                        </button>
                      {:else}
                        {name}
                      {/if}
                    </th>
                  {/if}
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each filteredEntries as entry}
                <tr>
                  <th class="path">
                    {#if entry.path.length > 30}
                      <span title={entry.domain}{entry.path}>{isPathTruncated ? truncateText(entry.path, 30) : entry.path}</span>
                    {:else}
                      {entry.path}
                    {/if}
                  </th>
                  <th class="domain">
                    {#if entry.domain.length > 30}
                      <span title={entry.domain}>{isDomainTruncated ? truncateText(entry.domain, 30) : entry.domain}</span>
                    {:else}
                      {entry.domain}
                    {/if}
                  </th>
                  <th class="type"><span>{entry.type}</span></th>
                  <th class="status {httpStatusCSSClass(entry.status)}">{entry.status}</th>
                  <th class="method {entry.method}"><span>{entry.method}</span></th>
                  <th class="timestamp">
                    {#if entry.timestamp.length > 10}
                      <span title={entry.timestamp}>{isTimestampTruncated ? truncateText(entry.timestamp, 10) : entry.timestamp}</span>
                    {:else}
                      {entry.timestamp}
                    {/if}
                  </th>
                  {#each [...allValueNames] as name}
                    {#if valueNames.has(name)}
                      <td>
                        {#if entry.values.find(value => value.name === name)}
                          {#if selectedValues.has(name)}
                            {#if name.length > 20 || entry.values.find(value => value.name === name).value.length > 20}
                              <span title={entry.values.find(value => value.name === name).value}>
                                {truncatedValues[name] ? truncateText(entry.values.find(value => value.name === name).value, 20) : entry.values.find(value => value.name === name).value}
                              </span>
                            {:else}
                              {entry.values.find(value => value.name === name).value}
                            {/if}
                          {/if}
                        {/if}
                      </td>
                    {/if}
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
      <TabItem>
        <div slot="title" class="flex items-center gap-2">
          <DrawSquareOutline size="sm" />Sequence
        </div>
        <div id="analyzeSequenceDisplay"></div>
      </TabItem>
      <TabItem open>
        <div slot="title" class="flex items-center gap-2">
          <WindowOutline size="sm" />Cookie
        </div>
        <div id="analyzeCookieDisplay">
      {#if selectedTypes.length === 0}
        <p>No data to display.</p>
      {:else if filteredEntries.length > 0}
      <table>
        <thead>
          <tr>
            <th class="path">
              Path
              {#if filteredEntries.some(entry => entry.path.length > 30)}
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
              {#if filteredEntries.some(entry => entry.domain.length > 30)}
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
              {#if filteredEntries.some(entry => entry.timestamp.length > 10)}
                <button type="button" on:click={toggleTimestampTruncation} aria-label="Toggle timestamp truncation">
                  {#if isTimestampTruncated}
                    <ChevronDoubleRightOutline />
                  {:else}
                    <ChevronDoubleLeftOutline />
                  {/if}
                </button>
              {/if}
            </th>
            {#each [...allValueNames] as name}
              {#if valueNames.has(name)}
                <th>
                  {#if name.length > 20 || filteredEntries.some(entry => entry.values.find(value => value.name === name && value.value.length > 20))}
                    <span title={name}>{truncatedValues[name] ? truncateText(name, 20) : name}</span>
                    <button type="button" on:click={() => toggleValueTruncation(name)} aria-label="Toggle value truncation for {name}">
                      {#if truncatedValues[name]}
                        <ChevronDoubleRightOutline />
                      {:else}
                        <ChevronDoubleLeftOutline />
                      {/if}
                    </button>
                  {:else}
                    {name}
                  {/if}
                </th>
              {/if}
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each filteredEntries as entry}
            <tr>
              <th class="path">
                {#if entry.path.length > 30}
                  <span title={entry.domain}{entry.path}>{isPathTruncated ? truncateText(entry.path, 30) : entry.path}</span>
                {:else}
                  {entry.path}
                {/if}
              </th>
              <th class="domain">
                {#if entry.domain.length > 30}
                  <span title={entry.domain}>{isDomainTruncated ? truncateText(entry.domain, 30) : entry.domain}</span>
                {:else}
                  {entry.domain}
                {/if}
              </th>
              <th class="type"><span>{entry.type}</span></th>
              <th class="status {httpStatusCSSClass(entry.status)}">{entry.status}</th>
              <th class="method {entry.method}"><span>{entry.method}</span></th>
              <th class="timestamp">
                {#if entry.timestamp.length > 10}
                  <span title={entry.timestamp}>{isTimestampTruncated ? truncateText(entry.timestamp, 10) : entry.timestamp}</span>
                {:else}
                  {entry.timestamp}
                {/if}
              </th>
              {#each [...allValueNames] as name}
                {#if valueNames.has(name)}
                  <td>
                    {#if entry.values.find(value => value.name === name)}
                      {#if selectedValues.has(name)}
                        {#if name.length > 20 || entry.values.find(value => value.name === name).value.length > 20}
                          <span title={entry.values.find(value => value.name === name).value}>
                            {truncatedValues[name] ? truncateText(entry.values.find(value => value.name === name).value, 20) : entry.values.find(value => value.name === name).value}
                          </span>
                        {:else}
                          {entry.values.find(value => value.name === name).value}
                        {/if}
                      {/if}
                    {/if}
                  </td>
                {/if}
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
    font-size: 80%;
  }
  #action{
    height: 100%;
  }

  :global(#domainFilterDiv div[role="listbox"]){
    background: #fff;
  }

  :global(#domainFilterDiv div[role="listbox"] span){
    height: 5.5em;
    overflow: auto;
  }

  #analyzeCookieDisplay{
    height: 53vh;
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
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  th:first-child {
    position: -webkit-sticky;
    position: sticky;
    left: 0;
  }

  thead th:first-child{
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
  

</style>