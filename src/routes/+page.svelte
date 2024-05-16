<script>
    import { onMount } from 'svelte';
    import { formatTimestamp, truncateText, httpStatusCSSClass, exportToCSV } from '$lib/utils';
    import { Fileupload, Input, Label, Checkbox, Helper } from 'flowbite-svelte';
  
    let logVersion = '';
    let logCreator = '';
    let cookieChanges = [];
    let urlFilter = '';
    let notUrlFilter = '';
    let allSelected = true;
    let filterTimer = null;
    let typeCounts = {};
    let uniqueDomains = {};
  
    const communicationTypes = ['Fetch/XHR', 'Doc', 'CSS', 'JS', 'Font', 'Img', 'Media', 'Manifest', 'WS', 'Wasm', 'Other'];
    let selectedTypes = [...communicationTypes];
    let selectedCookies = new Set();
  
    onMount(() => {
      // initialize
    });
  
    function analyzeHAR(event) {
      console.log("analyzeHAR");
      const file = event.target.files[0];
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

        console.log(cookieChanges);
  
        selectedCookies = new Set(cookieChanges.flatMap(change => change.cookies.map(cookie => cookie.name)));
        
        typeCounts = cookieChanges.reduce((acc, change) => {
          acc[change.type] = (acc[change.type] || 0) + 1;
          return acc;
        }, {});

        uniqueDomains = [...new Set(cookieChanges.map(change => change.domain))].sort();
        console.log(uniqueDomains);

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
  
      return matchesUrlFilter && matchesNotUrlFilter && matchesTypeFilter;
    });
  
    $: cookieNames = new Set(filteredChanges.flatMap(change => change.cookies.map(cookie => cookie.name)));
  
    function handleEllipsisClick(event, url) {
      const ellipsisElement = event.target;
      ellipsisElement.textContent = url;
      ellipsisElement.classList.remove('ellipsis');
    }
  
    function handleExportCSV() {
      const csvData = filteredChanges.map(change => [
        change.type,
        change.timestamp,
        change.method,
        change.status,
        change.url,
        ...[...cookieNames].map(name => {
          const cookie = change.cookies.find(cookie => cookie.name === name);
          return cookie && selectedCookies.has(name) ? cookie.value : '';
        })
      ]);
      exportToCSV(csvData, ['Req. Type', 'Timestamp', 'Status', 'URL', ...cookieNames]);
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
      <div class="grid grid-cols-12">
        <div class="col-span-3">
          <!--<input type="file" accept=".har" on:change={analyzeHAR} />-->
          <Fileupload accept=".har" on:change={analyzeHAR}  size="sm" />
        </div>
      </div>
      
      <span>Log version : {logVersion} / {logCreator}</span><br>
      <div class="grid mb-2 md:grid-cols-6">
        <div>
        <Label for="urlFilter">Filter by URL (separate by |):</Label>
        <Input type="text" id="urlFilter" bind:value={urlFilter} on:input={handleFilterInput}  size="sm"/>
        </div>
        <div>
        <Label for="notUrlFilter">Exclude URLs containing (separate by |):</Label>
        <Input type="text" id="notUrlFilter" bind:value={notUrlFilter} on:input={handleFilterInput}  size="sm"/>
      </div>
      </div>

      <div id="filterType">
        <Label>
          <Checkbox bind:checked={allSelected} on:change={handleAllChange} />
          All
        </Label>
        {#each communicationTypes as type}
          <button
            class:selected={selectedTypes.includes(type)}
            on:click={() => handleTypeClick(type)}
          >
            {type} ({filteredChanges.filter(change => change.type === type).length}/{typeCounts[type] || 0})
          </button>
        {/each}
      </div>
      
      <div id="analyzeCookieAction">
        <button on:click={handleExportCSV}>Export to CSV</button>
      </div>
    </div>

    <div id="display">
      <div id="analyzeCookieDisplay">
      {#if selectedTypes.length === 0}
        <p>No data to display.</p>
      {:else if filteredChanges.length > 0}
        <table>
          <thead>
            <tr>
              <th class="timestamp">Timestamp</th>
              <th class="method">Method</th>
              <th class="status">Status</th>
              <th class="type">Type</th>
              <th>URL</th>
              {#each [...cookieNames] as name}
                <th>
                  <!--<input type="checkbox" id="{name}-checkbox" checked={selectedCookies.has(name)} on:change={(event) => handleCookieChange(event, name)}>{name}-->
                  {name}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each filteredChanges as change}
              <tr>
                <th class="timestamp">{change.timestamp}</th>
                <th class="method {change.method}"><span>{change.method}</span></th>
                <th class="status {httpStatusCSSClass(change.status)}">{change.status}</th>
                <th class="type"><span>{change.type}</span></th>
                <td>
                  <span class="ellipsis" title={change.url} on:click={(event) => handleEllipsisClick(event, change.url)}>
                    {truncateText(change.url)}
                  </span>
                </td>
                {#each [...cookieNames] as name}
                  <td>
                    {#if change.cookies.find(cookie => cookie.name === name)}
                      {#if selectedCookies.has(name)}
                        <span class="ellipsis" on:click={(event) => handleEllipsisClick(event, change.cookies.find(cookie => cookie.name === name).value)}>
                          {truncateText(change.cookies.find(cookie => cookie.name === name).value)}
                        </span>
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
  </div>

  </main>
  
    <style>
      main{
        font-family: Arial, Helvetica, sans-serif;
        font-size: 75%;
      }
      #action{
        height: 170px;
      }
      #display{
        height: 70vh;
        overflow: scroll;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      th, td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
        white-space: nowrap;
      }
      thead th {
        background-color: #f2f2f2;
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


      .ellipsis {
        cursor: pointer;
      }
      button {
      margin-right: 5px;
      padding: 5px 10px;
      border: 1px solid #ccc;
      background-color: #fff;
      cursor: pointer;
    }
    
    button.selected {
      background-color: #eee;
    }
    .ellipsis {
      cursor: pointer;
    }
    </style>