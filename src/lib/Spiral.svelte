<script>
  import { LayerCake, Svg, Html } from "layercake";
  import { scaleSequential } from "d3-scale";
  import { interpolateYlOrRd } from "d3-scale-chromatic";
  import ArcSvgSpiral from "$lib/ArcSvgSpiral.svelte";
  import AxesLines from "$lib/AxesLines.svelte";
  import Legend from "./Legend.svelte";
  import YearAnotations from "./YearAnotations.svelte";

  export let data = [];
  export let z = "fwi";
  export let region = "Central";

  // TODO Rotate the spiral so that mid-January is align with y axis
  const angleRotate = 360 / 4.8;
</script>

<div class="chart-wrapper">
  <LayerCake
    xRange={({ width, height }) => [
      ((width < height ? width : height) / 2) * 0.35,
      (width < height ? width : height) / 2,
    ]}
    x="date"
    xPadding={[20, 20]}
    y="doy"
    yRange={[0 + angleRotate, 360 + angleRotate]}
    yDomain={[0, 365]}
    {z}
    zScale={scaleSequential(interpolateYlOrRd)}
    {data}
  >
    <Svg>
      <ArcSvgSpiral {data} />
      <AxesLines />
    </Svg>
    <Legend {z}>
      <span slot="legend-title">
        <h2>{z}</h2>
        <br /><span style="opacity: 0.6">In</span> <strong>{region}</strong>
        <br /><span style="opacity: 0.6">(Maximum daily value)</span>
      </span>
    </Legend>
    <Html>
      <YearAnotations />
    </Html>
  </LayerCake>
</div>

<style>
  .chart-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    min-width: 500px;
    min-height: 500px;
    padding: 0%;
    overflow: visible;
  }
</style>
