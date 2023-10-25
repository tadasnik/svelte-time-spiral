<script>
  import { getContext } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { extent, range } from "d3-array";
  import { timeFormat } from "d3-time-format";
  import { interpolateHclLong } from "d3-interpolate";
  import { fade } from "svelte/transition";

  const { width, height, xScale, yScale, xDomain } = getContext("LayerCake");
  $: max = $xScale($xDomain[1]);

  $: console.log("max", max);
  // Rotate the spiral so that mid January is on Y axis
  //   const angleScaleRotate = 360 / 4.5;
  //
  //   $: minDim = $width < $height ? $width : $height;
  //
  //   $: metricDomain = [0, 70];
  //   $: timeDomain = extent(data, timeAccessor);
  //
  //   $: colorScale = scaleLinear()
  //     .domain([
  //       0,
  //       metricDomain[1] / 3,
  //       (metricDomain[1] / 3) * 2,
  //       metricDomain[1],
  //     ])
  //     .range(["#f4f4f4", "#89BC97", "#5D2EDD", "#000"])
  //     .interpolate(interpolateHclLong);
  //
  //   $: radiusScale = scaleLinear()
  //     .domain(timeDomain)
  //     .range([(minDim / 2) * 0.4, minDim / 2 - 10]);
  //   $: angleScale = scaleLinear()
  //     .domain([0, 365])
  //     .range([0 + angleScaleRotate, 360 + angleScaleRotate]);
  //
  //   $: distanceBetweenYears = (startUT, endUT) => {
  //     const endDist = radiusScale(timeAccessor(startUT));
  //     const startDist = radiusScale(timeAccessor(endUT));
  //     return Math.abs(endDist - startDist);
  //   };
  //
  //   $: cycleDistance = distanceBetweenYears(data[0], data[365]) * 0.9;
  //   const getPositionFromDistanceAndAngle = (distance, angle) => {
  //     const x = distance * Math.cos((angle * Math.PI) / 180);
  //     const y = distance * Math.sin((angle * Math.PI) / 180);
  //     return { x, y };
  //   };
  //
  //   $: getArc = (d) => {
  //     const distance = radiusScale(d.date);
  //     const startAngle = angleScale(d.doy - 0.5);
  //     const endAngle = angleScale(d.doy + 0.5);
  //     const { x, y } = getPositionFromDistanceAndAngle(distance, startAngle);
  //     const endCords = getPositionFromDistanceAndAngle(distance, endAngle);
  //     return [
  //       "M",
  //       x,
  //       y,
  //       "A",
  //       distance,
  //       distance,
  //       0,
  //       0,
  //       1,
  //       endCords.x,
  //       endCords.y,
  //     ].join(" ");
  //   };
  //   $: console.log("radius scale data 0", radiusScale(timeAccessor(data[0])));
  //   $: console.log(radiusScale(timeAccessor(data[31])));
  //   $: console.log("cycleDist", cycleDistance);
  const getPositionFromDistanceAndAngle = (distance, angle) => {
    const x = distance * Math.cos((angle * Math.PI) / 180);
    const y = distance * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  const monthNames = range(0, 12).map((i) =>
    timeFormat("%b")(new Date(2000, i, 1))
  );
  $: lastDate = new Date($xDomain[1]);
  // var newDate = new Date(date.setMonth(date.getMonth() + 8));
  $: months = monthNames.map((month, i) => {
    const angle = $yScale((360 / 12) * i);
    const start = $xScale($xDomain[0]);
    const end = $xScale($xDomain[1]);
    console.log(angle, start, end);
    const startCoords = getPositionFromDistanceAndAngle(start, angle);
    const endCoords = getPositionFromDistanceAndAngle(end, angle);
    return {
      i,
      name: month,
      angle,
      x1: startCoords.x,
      y1: startCoords.y,
      x2: endCoords.x,
      y2: endCoords.y,
    };
  });
  $: console.log(months);
</script>

<g transform="translate({$width / 2}, {$height / 2})">
  {#each months as month, i}
    <line
      x1={month.x1}
      y1={month.y1}
      x2={month.x2}
      y2={month.y2}
      stroke="#ccc"
      stroke-width="2"
      stroke-dasharray="4 4"
      fill="none"
    />
    <!--   <text -->
    <!--     text-anchor={anchor($config.x.length, i)} -->
    <!--     dy="0.35em" -->
    <!--     font-size="12px" -->
    <!--     transform="translate({labelPlacement * -->
    <!--       Math.cos(thisAngleSlice)}, {labelPlacement * Math.sin(thisAngleSlice)})" -->
    <!--     >{label}</text -->
    <!--   > -->
  {/each}
</g>
