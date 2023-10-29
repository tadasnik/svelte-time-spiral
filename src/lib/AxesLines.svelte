<script>
  import { getContext } from "svelte";
  import { timeFormat } from "d3-time-format";
  import { timeDay, timeMonth, timeYear } from "d3-time";
  import { cartesianFromPolar, xFromPolar, yFromPolar } from "$lib/utils.js";
  import { addYear, subtractYear, addMonth } from "$lib/timeUtils.js";

  const { width, height, xScale, yScale, xDomain } = getContext("LayerCake");
  const monthFormat = timeFormat("%b");

  const dayOfYear = (date) => {
    return timeDay.count(timeYear.floor(date), date);
  };

  const startDate = new Date($xDomain[0]);

  const extStartDate = subtractYear($xDomain[0]);
  const monthsPrevYear = timeMonth.range(extStartDate, startDate);

  const lastDate = new Date($xDomain[1]);
  const extEndDate = addYear(lastDate.getTime());
  const monthsNextYear = timeMonth.range(lastDate, extEndDate);

  const findMonthDate = (date) => {
    return monthsPrevYear.filter(
      (item) => item.getMonth() == date.getMonth()
    )[0];
  };

  $: monthProps = monthsNextYear.map((month, i) => {
    const start = $xScale(findMonthDate(month).getTime());
    const end = $xScale(month.getTime());
    const startAngle = $yScale(dayOfYear(month));
    const endAngle =
      i < monthsNextYear.length - 1
        ? $yScale(dayOfYear(monthsNextYear[i + 1]))
        : $yScale(dayOfYear(addMonth(month)));
    return {
      i,
      name: monthFormat(month),
      start,
      startAngle,
      end,
      endAngle,
    };
  });

  $: getArc = (d) => {
    const distance = $xScale($xDomain[1]);
    const startCoords = cartesianFromPolar(d.end, d.startAngle);
    const endCoords = cartesianFromPolar(d.end, d.endAngle);
    return [
      "M",
      startCoords.x,
      startCoords.y,
      "A",
      distance,
      distance,
      0,
      0,
      1,
      endCoords.x,
      endCoords.y,
    ].join(" ");
  };
</script>

<g transform="translate({$width / 2}, {$height / 2})">
  {#each monthProps as month, i}
    <line
      x1={xFromPolar(month.start, month.startAngle)}
      y1={yFromPolar(month.start, month.startAngle)}
      x2={xFromPolar(month.end, month.startAngle)}
      y2={yFromPolar(month.end, month.startAngle)}
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
  {/each}
</g>
