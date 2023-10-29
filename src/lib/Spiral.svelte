<script>
  import { LayerCake, Svg } from "layercake";
  import { scaleLinear, scaleSqrt, scaleSequential } from "d3-scale";
  import { extent, range } from "d3-array";
  import { format } from "d3-format";
  import { interpolateHclLong } from "d3-interpolate";
  import { timeDay, timeYear } from "d3-time";
  import { timeFormat } from "d3-time-format";
  import { fade } from "svelte/transition";
  import ArcSvgSpiral from "$lib/ArcSvgSpiral.svelte";
  import AxesLines from "$lib/AxesLines.svelte";

  export let data = [];
  export let xName = "date";
  export let yName = "doy";
  export let z = "fwi";

  // TODO Rotate the spiral so that mid-January is align with y axis
  const angleRotate = 360 / 4.8;

  const progressInYearAccessor = (d) => {
    const date = timeAccessor(d);
    return timeDay.count(timeYear.floor(date), date);
  };

  const formatNumber = format(",.1s");
  const formatDate = timeFormat("%b %-d, %Y");

  let width = 100;
  $: height = width;

  $: metricDomain = [0, 70];
  $: xDomain = extent(data, (d) => d[xName]);
  $: zExtent = extent(data, (d) => d[z]);
  $: zDomain = [0, zExtent[1] / 3, (zExtent[1] / 3) * 2, zExtent[1]];

  $: colorScale = scaleLinear()
    .domain(zDomain)
    .range(["#f4f4f4", "#89BC97", "#5D2EDD", "#000"])
    .interpolate(interpolateHclLong);

  $: console.log("xDomain main", xDomain);
  $: console.log("zDomain main", zDomain);
  $: minDim = width < height ? width : height;
  const maxLength = 5;
  $: scaleScale = scaleSqrt().domain(metricDomain).range([0, maxLength]);
  $: colorScaleTicks = colorScale.ticks(6).map((d) => {
    const scale = scaleScale(d);
    const tickHeight = (height / 100) * scale;

    return {
      tickHeight,
      value: d,
      percent: (d * 100) / metricDomain[1],
      color: colorScale(d),
    };
  });
  $: radiusScale = scaleLinear().domain(xDomain).range([15, 40]);
  $: yearRadiusScale = scaleLinear()
    .domain(xDomain)
    .range([height * 0.21, height * 0.41]);
  $: strokeWidthScale = scaleLinear().domain(xDomain).range([0.3, 0.65]);
  $: angleScale = scaleLinear().domain([0, 365]).range([0, 360]);
  // $: console.log("data", data);

  const getPositionFromDistanceAndAngle = (distance, angle) => {
    const x = distance * Math.cos((angle * Math.PI) / 180);
    const y = distance * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  const getTransformFromDistanceAndAngle = (distance, angle) => {
    const { x, y } = getPositionFromDistanceAndAngle(distance, angle);
    return `translate(${x}, ${y})`;
  };

  const getArc = (d) => {
    const distance = radiusScale(d.date);
    const startAngle = angleScale(d.doy - 0.5);
    const endAngle = angleScale(d.doy + 0.5);
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
  const getPathForValue = (value) => {
    // const height = scaleScale(value);
    const height = 0.2;
    return ["M", 0, -height / 2, "L", 0, height / 2].join(" ");
  };
  const monthNames = range(0, 12).map((i) =>
    timeFormat("%b")(new Date(2000, i, 1))
  );
  $: months = monthNames.map((month, i) => {
    const angle = (360 / 12) * i - 360 / 4;
    const { x, y } = getPositionFromDistanceAndAngle(
      width * (i ? 0.38 + i * 0.009 : 0.49),
      angle
    );
    return {
      i,
      name: month,
      angle,
      x: x + width / 2,
      y: y - height / 2,
    };
  });
  $: years = timeYear
    .range(timeYear.floor(xDomain[0]), xDomain[1])
    .map((year) => {
      const r = yearRadiusScale(year);
      const { x, y } = getPositionFromDistanceAndAngle(r, 360 / 4);
      return {
        name: year.getFullYear(),
        x: x + width / 2,
        y: y - height / 2,
      };
    });
</script>

<div class="chart-wrapper">
  <LayerCake
    xRange={({ width, height }) => [
      ((width < height ? width : height) / 2) * 0.4,
      (width < height ? width : height) / 2,
    ]}
    x="date"
    {xDomain}
    xPadding={[20, 20]}
    y="doy"
    yRange={[0 + angleRotate, 360 + angleRotate]}
    yDomain={[0, 365]}
    {z}
    {zDomain}
    {data}
  >
    <Svg>
      <ArcSvgSpiral {data} {colorScale} />

      <!-- {#each data || [] as d, i} -->
      <!--   <path -->
      <!--     class="transition" -->
      <!--     in:fade={{ delay: i * 3 }} -->
      <!--     d={getArc(d)} -->
      <!--     fill={colorScale(metricAccessor(d))} -->
      <!--     stroke={colorScale(metricAccessor(d))} -->
      <!--     stroke-width="0.9" -->
      <!--   /> -->
      <!-- {/each} -->
      <AxesLines />
    </Svg>
  </LayerCake>
  <!-- these are overlaid in HTML to prevent from warping the text -->
  <!-- {#each months as { name, x, y }} -->
  <!--   <div class="label" style="transform: translate({x}px, {y}px)"> -->
  <!--     {name} -->
  <!--   </div> -->
  <!-- {/each} -->
  <!-- {#each years as { name, x, y }} -->
  <!--   <div -->
  <!--     class="label" -->
  <!--     style="transform: translate({x}px, {y}px)" -->
  <!--   > -->
  <!--     <div style="-webkit-text-stroke: 6px white"> -->
  <!--       {name} -->
  <!--     </div> -->
  <!--     <div style="position: absolute"> -->
  <!--       {name} -->
  <!--     </div> -->
  <!--   </div> -->
  <!-- {/each} -->
  <!-- </div> -->

  <!-- <div class="legend"> -->
  <!--   <div class="legend__title"> -->
  <!--     <slot name="legend-title" /> -->
  <!--   </div> -->
  <!--   <div class="legend__ticks"> -->
  <!--     {#each colorScaleTicks as { value, tickHeight, color } (value)} -->
  <!--       <div class="legend__tick"> -->
  <!--         <div -->
  <!--           class="legend__bar-wrapper" -->
  <!--           style="height: {(height / 100) * maxLength}px" -->
  <!--         > -->
  <!--           <div -->
  <!--             class="legend__bar" -->
  <!--             style="height: {tickHeight}px; background-color: {color}" -->
  <!--           /> -->
  <!--         </div> -->
  <!---->
  <!--         <div class="legend__value"> -->
  <!--           {formatNumber(value)}{value === 500 ? "+" : ""} -->
  <!--         </div> -->
  <!--       </div> -->
  <!--     {/each} -->
  <!--   </div> -->
  <!-- </div> -->
</div>

<style>
  .chart-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    min-width: 500px;
    min-height: 500px;
    padding: 0%;
  }
  .label {
    position: absolute;
    width: 0;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .legend {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .legend__title {
    text-align: center;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    line-height: 1.2em;
    color: #999;
    max-width: 24em;
  }
  .legend__ticks {
    display: flex;
  }
  .legend__tick {
    display: flex;
    flex-direction: column;
    margin: 0 0.2em;
    transition: all 0.6s ease-out;
  }
  .legend__bar-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .legend__bar {
    width: 0.6em;
    border-radius: 1em;
  }
  .legend__value {
    font-size: 0.8em;
    color: #999;
    text-align: center;
  }
  .transition {
    transition: all 0.6s ease-out;
  }
</style>
