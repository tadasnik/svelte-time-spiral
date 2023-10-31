<script>
  import { getContext } from "svelte";
  import { fade } from "svelte/transition";
  import { xFromPolar, yFromPolar } from "./utils.js";
  import { cartesianFromPolar } from "./utils.js";

  export let data = [];

  const { width, height, zScale, xScale, yScale, y, z, xGet } =
    getContext("LayerCake");

  $: distanceBetweenYears = (startUT, endUT) => {
    const endDist = $xGet(startUT);
    const startDist = $xGet(endUT);
    return Math.abs(endDist - startDist);
  };

  // TODO move this to central logic component or main?
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
</script>

<g transform="translate({$width / 2}, {$height / 2})">
  <!-- <div bind:clientWidth={width}> -->
  <!-- <svg width="100%" viewBox="-50 -50 100 100"> -->
  {#each data || [] as d, i}
    <path
      class="transition"
      in:fade={{ delay: i / 3 }}
      d={getArc(d)}
      stroke={$zScale($z(d))}
      stroke-width={cycleDistance}
    />
  {/each}
</g>
