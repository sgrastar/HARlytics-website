<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    export let data = [];
    export let width = 400;
    export let height = 400;
    export let innerRadius = 0;
    export let outerRadius = Math.min(width, height) / 2;
    export let colorScheme = d3.schemeCategory10;
  
    let chart;
    let arcs = [];
  
    function createChart() {
      const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
  
      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
  
      const color = d3.scaleOrdinal(colorScheme);
  
      arcs = pie(data);
  
      d3.select(chart)
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i))
        .attr('stroke', 'white')
        .style('stroke-width', '2px');
    }
  
    onMount(createChart);
  
    $: {
      if (chart) {
        createChart();
      }
    }
  </script>
  
  <div bind:this={chart} class="chart"></div>
  
  <style>
    .chart {
      width: 100%;
      height: 100%;
    }
  </style>