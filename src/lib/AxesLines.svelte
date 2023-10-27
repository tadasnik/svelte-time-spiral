<script>
  import { getContext } from "svelte";
  import { timeFormat } from "d3-time-format";
  import { timeDay, timeMonth, timeYear } from "d3-time";
  import { cartesianFromPolar, xFromPolar, yFromPolar } from "$lib/utils.js";
  import { addYear, substractYear } from "$lib/timeUtils.js";

  const { width, height, xScale, yScale, xDomain } = getContext("LayerCake");
  const monthFormat = timeFormat("%b");

  const dayOfYear = (date) => {
    return timeDay.count(timeYear.floor(date), date);
  };

  const startDate = new Date($xDomain[0]);

  const extStartDate = substractYear($xDomain[0]);
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
        : $yScale(
            dayOfYear(
              new Date(
                month.getYear(),
                month.getMonth(),
                month.getDate()
              ).setMonth(month.getMonth() + 1)
            )
          );
    return {
      i,
      name: monthFormat(month),
      x1: xFromPolar(start, startAngle),
      y1: yFromPolar(start, startAngle),
      x2: xFromPolar(end, startAngle),
      y2: yFromPolar(end, startAngle),
      x3: xFromPolar(end, endAngle),
      y3: yFromPolar(end, endAngle),
    };
  });

  $: getArc = (d) => {
    const distance = $xScale($xDomain[1]);
    return ["M", d.x2, d.y2, "A", distance, distance, 0, 0, 1, d.x3, d.y3].join(
      " "
    );
  };
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
  {/each}
</g>
