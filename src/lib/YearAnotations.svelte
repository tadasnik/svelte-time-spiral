<script>
  import { getContext } from "svelte";
  import { timeYear } from "d3-time";
  import { cartesianFromPolar } from "./utils.js";

  const { width, height, xDomain, xScale, yScale } = getContext("LayerCake");

  const yearLabelAngle = $yScale(16);
  $: console.log("yearAngle", yearLabelAngle);

  $: years = timeYear
    .range(timeYear.floor($xDomain[0]), $xDomain[1])
    .map((year) => {
      const distance = $xScale(new Date(year.getFullYear(), 1, 15).getTime());
      const yearCoords = cartesianFromPolar(distance, yearLabelAngle);
      return {
        name: year.getFullYear(),
        x: yearCoords.x + $width / 2,
        y: yearCoords.y + $height / 2,
      };
    });
</script>

<div class="year-labels">
  {#each years as { name, x, y }}
    <div class="year-label" style="transform: translate({x - 6}px, {y}px)">
      {name}
    </div>
  {/each}
</div>

<style>
  .year-labels {
    position: relative;
  }
  .year-label {
    position: absolute;
    text-align: center;
    font-size: 8px;
    color: #888;
    margin-top: -6px; /* To match the SVG labels, it needs a slight tweak */
    transform: translate(-50%, 50%);
  }
</style>
