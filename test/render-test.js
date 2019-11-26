var tape = require("tape");

const fs = require("fs"),
  topojson = require("topojson"),
  { createCanvas } = require("canvas"),
  d3_geo = require("d3-geo"),
  d3_composite = require("../"),
  PNG = require("pngjs").PNG,
  pixelmatch = require("pixelmatch");

const projections = [
  { name: "albersUsa", topojson: "./data/us.json", field: "states" },
  {
    name: "albersUsaTerritories",
    topojson: "./data/us_territories.json",
    field: "us"
  },
  {
    name: "conicConformalSpain",
    topojson: "./data/provincias.json",
    field: "provincias"
  },
  {
    name: "conicConformalPortugal",
    topojson: "./data/world-50m.json",
    field: "countries"
  },
  {
    name: "mercatorEcuador",
    topojson: "./data/world-50m.json",
    field: "countries"
  },
  {
    name: "transverseMercatorChile",
    topojson: "./data/chile.json",
    field: "chile"
  },
  {
    name: "conicEquidistantJapan",
    topojson: "./data/japan.json",
    field: "japan"
  },
  {
    name: "conicConformalFrance",
    topojson: "./data/france.json",
    field: "regions"
  },
  {
    name: "conicConformalEurope",
    topojson: "./data/nuts0.json",
    field: "nuts0"
  },
  { name: "mercatorMalaysia", topojson: "./data/malaysia.json", field: "land" },
  { name: "mercatorEquatorialGuinea", topojson: "./data/ge.json", field: "ge" },
  { name: "albersUk", topojson: "./data/uk-counties.json", field: "UK" }
];

tape("Checks the actual image outputs", async function(test) {
  projections.forEach(async d => {
    await render(d.name, d.topojson, d.field);
    let img1 = PNG.sync.read(fs.readFileSync("test/output/" + d.name + ".png"));
    let img2 = PNG.sync.read(
      fs.readFileSync("test/samples/" + d.name + ".png")
    );
    let diff = pixelmatch(img1.data, img2.data, null, img1.width, img1.height, {
      threshold: 0.0
    });

    test.true(diff == 0, d.name + " matches the sample file");
  });
  test.end();
});

function render(projectionName, topojsonName, layerName) {
  const width = 960,
    height = 500,
    projectionSymbol =
      "geo" + projectionName[0].toUpperCase() + projectionName.slice(1);
  if (!/^[a-z0-9]+$/i.test(projectionName)) {
    throw new Error();
  }
  const canvas = createCanvas(width, height),
    context = canvas.getContext("2d");

  const data = require(topojsonName),
    graticule = d3_geo.geoGraticule(),
    outline = { type: "Sphere" };

  const path = d3_geo
    .geoPath()
    .projection(d3_composite[projectionSymbol]().precision(0.1))
    .context(context);

  //   console.info("-------->");
  //   var proj = d3_composite.geoAlbersUk();
  //   var inv = proj.invert(proj([-1, 63]));
  //   console.info("-----", inv);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.save();

  context.beginPath();
  path(topojson.feature(data, data.objects[layerName]));
  context.fillStyle = "#aca";
  context.strokeStyle = "#000";
  context.fill();
  context.stroke();

  context.beginPath();
  path(graticule());
  context.strokeStyle = "rgba(119,119,119,0.5)";
  context.stroke();

  context.restore();

  context.beginPath();
  path(outline);
  context.strokeStyle = "#00F";
  context.stroke();

  context.beginPath();
  context.strokeStyle = "#F00";
  d3_composite[projectionSymbol]().drawCompositionBorders(context);
  context.stroke();

  return new Promise(resolve => {
    const out = fs.createWriteStream("test/output/" + projectionName + ".png");
    canvas.createPNGStream().pipe(out);
    out.on("finish", () => resolve());
  });
}
