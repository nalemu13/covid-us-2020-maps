mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN";

const path = window.location.pathname.toLowerCase();
const isMap1 = path.includes("map1");
const isMap2 = path.includes("map2");

const baseStyle = isMap1
  ? "mapbox://styles/mapbox/light-v10"
  : "mapbox://styles/mapbox/dark-v10";

const map = new mapboxgl.Map({
  container: "map",
  style: baseStyle,
  center: [-98, 39],
  zoom: 3.3,
  projection: "albers"
});

map.addControl(new mapboxgl.NavigationControl(), "top-right");

map.on("load", () => {
  if (isMap1) initRatesMap();
  if (isMap2) initCountsMap();
});

function initRatesMap() {
  map.addSource("rates", {
    type: "geojson",
    data: "assets/us-covid-2020-rates.geojson"
  });

  map.addLayer({
    id: "rates-fill",
    type: "fill",
    source: "rates",
    paint: {
      "fill-opacity": 0.75,
      "fill-outline-color": "#ffffff",
      "fill-color": [
        "step",
        ["get", "rates"],
        "#f7fbff",
        10, "#deebf7",
        25, "#c6dbef",
        50, "#9ecae1",
        100, "#6baed6",
        200, "#3182bd",
        400, "#08519c"
      ]
    }
  });

  map.on("click", "rates-fill", (e) => {
    const p = e.features[0].properties;
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        "County: " + p.county + ", " + p.state +
        "<br>Rate per 1,000: " + Number(p.rates).toFixed(1) +
        "<br>Cases: " + p.cases +
        "<br>Deaths: " + p.deaths
      )
      .addTo(map);
  });

  buildRatesLegend();
}

function buildRatesLegend() {
  const legend = document.getElementById("legend");
  const breaks = [0, 10, 25, 50, 100, 200, 400];
  const colors = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"];

  let html = "<strong>Rate per 1,000</strong>";
  for (let i = 0; i < breaks.length; i++) {
    const from = breaks[i];
    const to = breaks[i + 1];
    const label = to ? from + " to " + to : from + "+";
    html +=
      '<div class="legend-row">' +
      '<div class="swatch" style="background:' + colors[i] + '"></div>' +
      "<div>" + label + "</div>" +
      "</div>";
  }
  legend.innerHTML = html;
}

function initCountsMap() {
  map.addSource("counts", {
    type: "geojson",
    data: "assets/us-covid-2020-counts-points.geojson"
  });

  map.addLayer({
    id: "counts-circles",
    type: "circle",
    source: "counts",
    paint: {
      "circle-opacity": 0.65,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1,
      "circle-color": "#ff9800",
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "cases"],
        0, 2,
        1000, 4,
        5000, 7,
        20000, 12,
        50000, 18,
        200000, 30
      ]
    }
  });

  map.on("click", "counts-circles", (e) => {
    const p = e.features[0].properties;
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        "County: " + p.county + ", " + p.state +
        "<br>Cases: " + p.cases +
        "<br>Deaths: " + p.deaths
      )
      .addTo(map);
  });

  buildCountsLegend();
}

function buildCountsLegend() {
  const legend = document.getElementById("legend");
  const breaks = [0, 1000, 5000, 20000, 50000, 200000];
  const radii = [2, 4, 7, 12, 18, 30];

  let html = "<strong>Total cases</strong>";
  for (let i = 0; i < breaks.length; i++) {
    const size = radii[i] * 2;
    html +=
      '<div class="legend-row">' +
      '<div class="swatch" style="border-radius:50%; width:' + size + 'px; height:' + size + 'px;"></div>' +
      "<div>" + breaks[i] + "+</div>" +
      "</div>";
  }
  legend.innerHTML = html;
}
