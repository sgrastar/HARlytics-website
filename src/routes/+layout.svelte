<script>
    import "../app.css";
    import { onMount } from 'svelte';
    import { Badge, Button, Modal } from 'flowbite-svelte';
  
    let isLive = false;
    let scrollingModal = false;
    let licenseText = '';

    onMount(async() => {
      if (typeof window !== 'undefined') {
        isLive = window.location.protocol !== 'chrome-extension:';
      }
      const response = await fetch('licenses.txt');
      licenseText = await response.text();
    });
  </script>
  
  <header class="text-white body-font bg-gray-600">
    <div class=" mx-auto flex flex-wrap px-4 py-1 flex-col md:flex-row items-center">
      <div>
        <span class="">HAR Analyzer</span>
        {#if isLive}
          <Badge large color="indigo" class="ml-4">Cloud Edition</Badge>
        {/if}
      </div>
      
      <nav class="md:ml-auto flex flex-wrap items-center space-x-2 text-base justify-center">
        <Button color="light" size="sm" class=" px-2 py-0" on:click={() => (scrollingModal = true)} autoclose>License</Button>
        
      </nav>
    
    </div>
  </header>

  <Modal title="License" bind:open={scrollingModal}>
    <h3 class="text-lg font-semibold ">HAR Analyzer</h3>
    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
      The MIT License (MIT)
      </p>
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
      Copyright (c) 2024 Yuta Hoshina &lt;yuta@sgrastar.org&gt;<br>(<a href="https://github.com/sgrastar/har-analyzer" target="_blank">https://github.com/sgrastar/har-analyzer</a>)
      </p>
      
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
      Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to deal
      in the Software without restriction, including without limitation the rights
      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:
      </p>
      
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.</p>
      
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
      SOFTWARE.</p>
<hr />
    <pre style="width: 100%;white-space: pre-wrap; font-size:75%;">{licenseText}</pre>
    
  </Modal>

  <slot />