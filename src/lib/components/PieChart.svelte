<script>
    import { onMount } from 'svelte';
    import * as d3 from "d3";
    
    export let data;
    export let width = 350;
    export let height = 230;
    export let innerRadius = 0;
    export let outerRadius = Math.min(width, height) / 2 - 20;
    export let colorScheme = d3.schemePaired;
  
    let chartElement;
    let arcs = [];
  
    function createChart() {
      const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
  
      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
  
      const labelArc = d3.arc()
        .innerRadius(outerRadius * 0.9)
        .outerRadius(outerRadius * 0.9);
  
      const color = d3.scaleOrdinal(colorScheme);
  
      arcs = pie(data);
  
      d3.select(chartElement)
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i))
        .attr('stroke', 'white')
        .style('stroke-width', '2px');
  
      d3.select(chartElement)
        .selectAll('polyline')
        .data(arcs.filter(d => d.value > 0))
        .join('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function(d) {
          var posA = arc.centroid(d);
          var posB = labelArc.centroid(d);
          var posC = labelArc.centroid(d);
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          posC[0] = outerRadius * 0.95 * (midangle < Math.PI ? 1 : -1);
          return [posA, posB, posC];
        });
  
      d3.select(chartElement)
        .selectAll('text')
        .data(arcs.filter(d => d.value > 0))
        .join('text')
        .attr('transform', function(d) {
          var pos = labelArc.centroid(d);
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          pos[0] = outerRadius * 0.99 * (midangle < Math.PI ? 1 : -1);
          return 'translate(' + pos + ')';
        })
        .attr('dy', '.35em')
        .style('text-anchor', function(d) {
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          return (midangle < Math.PI ? 'start' : 'end');
        })
        .text(function(d) {
          const total = d3.sum(data, d => d.value);
          const percent = Math.round(1000 * d.data.value / total) / 10;
          return `${d.data.name} (${percent}%)`;
        });
    }
  
    onMount(() => {
      createChart();
    });
  
    $: {
      if (data) {
        createChart();
      }
    }
  </script>
  
  <div class="chart-container">
    <svg bind:this={chartElement} {width} {height} viewBox="-175 -115 350 230">
      <g transform="translate({width / 2}, {height / 2})"></g>
    </svg>
  </div>
  
  <style>
    :global(.chart-container) {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>