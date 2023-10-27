<script>
  import { getContext } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { extent, range } from "d3-array";
  import { timeFormat } from "d3-time-format";
  import { timeDay, timeMonth, timeYear } from "d3-time";
  import { interpolateHclLong } from "d3-interpolate";
  import { fade } from "svelte/transition";

  const { width, height, xScale, yScale, xDomain } = getContext("LayerCake");
  const monthFormat = timeFormat("%b");

  const dayOfYear = (date) => {
    return timeDay.count(timeYear.floor(date), date);
  };

  function monthNames(dates) {
    dates.map((date) => {
      return { monthName: monthFormat(date) };
    });
  }

  const getPositionFromDistanceAndAngle = (distance, angle) => {
    const x = distance * Math.cos((angle * Math.PI) / 180);
    const y = distance * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  const startDate = new Date($xDomain[0]);
  const lastDate = new Date($xDomain[1]);
  const extStartDate = new Date(
    startDate.setFullYear(startDate.getFullYear() - 1)
  );

  let extEndDate = new Date(lastDate.getTime());
  extEndDate.setFullYear(extEndDate.getFullYear() + 1);
  const monthsNextYear = timeMonth.range(lastDate, extEndDate);

  $: console.log("before", monthsNextYear);
  $: console.log(
    new Date(
      lastDate.getYear(),
      lastDate.getMonth(),
      lastDate.getDate()
    ).setMonth(lastDate.getMonth() + 1)
  );

  $: monthProps = monthsNextYear.map((month, i) => {
    const start = $xScale($xDomain[0]);
    const end = $xScale(month.getTime());
    const startAngle = $yScale(dayOfYear(month));
    const startCoords = getPositionFromDistanceAndAngle(start, startAngle);
    const endCoords = getPositionFromDistanceAndAngle(end, startAngle);
    const endAngle =
      i < monthsNextYear.length - 1
        ? $yScale(dayOfYear(monthsNextYear[i + 1]))
        : $yScale(
            dayOfYear(
              new Date(
                month.getYear(),
                month.getMonth(),
                month.getDate()
              ).setMonth(month.getMonth() + 1)
            )
          );
    const arcEndCoords = getPositionFromDistanceAndAngle(end, endAngle);
    return {
      i,
      name: monthFormat(month),
      x1: startCoords.x,
      y1: startCoords.y,
      x2: endCoords.x,
      y2: endCoords.y,
      x3: arcEndCoords.x,
      y3: arcEndCoords.y,
    };
  });

  $: console.log(monthsNextYear, monthProps);
  $: getArc = (d) => {
    const distance = $xScale($xDomain[1]);
    // const startAngle = $yScale(d.y2);
    // const endAngle = $yScale(d.y3);
    // const { x, y } = getPositionFromDistanceAndAngle(distance, startAngle);
    // const endCords = getPositionFromDistanceAndAngle(distance, endAngle);
    return ["M", d.x2, d.y2, "A", distance, distance, 0, 0, 1, d.x3, d.y3].join(
      " "
    );
  };

  $: console.log(monthFormat(lastDate));
</script>

<g transform="translate({$width / 2}, {$height / 2})">
  {#each monthProps as month, i}
    <line
      x1={month.x1}
      y1={month.y1}
      x2={month.x2}
      y2={month.y2}
      stroke="#ccc"
      stroke-width="2"
      fill="none"
    />
    <path id={month.i} fill="none" d={getArc(month)} />
    <text>
      <textPath href="#{month.i}" startOffset="50%" text-anchor="middle"
        >{month.name}</textPath
      >
    </text>
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
