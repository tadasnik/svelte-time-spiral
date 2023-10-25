<script>
  import { getContext } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { extent, range } from "d3-array";
  import { interpolateHclLong } from "d3-interpolate";
  import { fade } from "svelte/transition";

  export let data = [];
  export let metricAccessor = (d) => d["x"];
  export let timeAccessor = (d) => d["date"];

  const { width, height, xScale, yScale, zDomain } = getContext("LayerCake");

  // Rotate the spiral so that mid January is on Y axis

  $: metricDomain = [0, 70];
  $: timeDomain = extent(data, timeAccessor);

  $: colorScale = scaleLinear()
    .domain([0, $zDomain[1] / 3, ($zDomain[1] / 3) * 2, $zDomain[1]])
    .range(["#f4f4f4", "#89BC97", "#5D2EDD", "#000"])
    .interpolate(interpolateHclLong);

  $: distanceBetweenYears = (startUT, endUT) => {
    const endDist = $xScale(timeAccessor(startUT));
    const startDist = $xScale(timeAccessor(endUT));
    return Math.abs(endDist - startDist);
  };

  $: cycleDistance = distanceBetweenYears(data[0], data[365]) * 0.9;
  const getPositionFromDistanceAndAngle = (distance, angle) => {
    const x = distance * Math.cos((angle * Math.PI) / 180);
    const y = distance * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  $: getArc = (d) => {
    const distance = $xScale(d.date);
    const startAngle = $yScale(d.doy - 0.5);
    const endAngle = $yScale(d.doy + 0.5);
    const { x, y } = getPositionFromDistanceAndAngle(distance, startAngle);
    const endCords = getPositionFromDistanceAndAngle(distance, endAngle);
    return [
      "M",
      x,
      y,
      "A",
      distance,
      distance,
      0,
      0,
      1,
      endCords.x,
      endCords.y,
    ].join(" ");
  };
  $: console.log("zDomain", $zDomain);
</script>

<g transform="translate({$width / 2}, {$height / 2})">
  <!-- <div bind:clientWidth={width}> -->
  <!-- <svg width="100%" viewBox="-50 -50 100 100"> -->
  {#each data || [] as d, i}
    <path
      class="transition"
      in:fade={{ delay: i / 3 }}
      d={getArc(d)}
      fill={colorScale(metricAccessor(d))}
      stroke={colorScale(metricAccessor(d))}
      stroke-width={cycleDistance}
    />
  {/each}
</g>
