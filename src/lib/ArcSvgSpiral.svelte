<script>
  import { getContext } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { extent, range } from "d3-array";
  import { interpolateHclLong } from "d3-interpolate";
  import { fade } from "svelte/transition";
  import { xFromPolar, yFromPolar } from "./utils.js";

  export let data = [];
  export let colorScale;

  const { width, height, zDomain, yScale, zScale, y, z, xGet, zGet } =
    getContext("LayerCake");

  $: distanceBetweenYears = (startUT, endUT) => {
    const endDist = $xGet(startUT);
    const startDist = $xGet(endUT);
    return Math.abs(endDist - startDist);
  };

  $: cycleDistance = distanceBetweenYears(data[0], data[365]) * 0.9;

  $: getArc = (d) => {
    const distance = $xGet(d);
    const startAngle = $yScale($y(d) - 0.5);
    const endAngle = $yScale(d.doy + 0.5);
    return [
      "M",
      xFromPolar(distance, startAngle),
      yFromPolar(distance, startAngle),
      "A",
      distance,
      distance,
      0,
      0,
      1,
      xFromPolar(distance, endAngle),
      yFromPolar(distance, endAngle),
    ].join(" ");
  };
  $: console.log("zScale", $zGet(data[0]));
  $: console.log("colorScale", colorScale($z(data[0])));
  // $: console.log("zDomain", $zDomain);
</script>

<g transform="translate({$width / 2}, {$height / 2})">
  <!-- <div bind:clientWidth={width}> -->
  <!-- <svg width="100%" viewBox="-50 -50 100 100"> -->
  {#each data || [] as d, i}
    <path
      class="transition"
      in:fade={{ delay: i / 3 }}
      d={getArc(d)}
      stroke={colorScale($z(d))}
      stroke-width={cycleDistance}
    />
  {/each}
</g>
