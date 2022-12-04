import tape from "tape";
import { readFileSync, createWriteStream } from "fs";
import { geoPath, geoGraticule } from "d3-geo";
import pixelmatch from "pixelmatch";
import { createCanvas } from "canvas";
import { PNG } from "pngjs";
import topojson from "topojson-client";

import geoAlbersUsa from "../src/albersUsa.js";
import geoAlbersUsaTerritoires from "../src/albersUsaTerritories.js";
import geoConicConformalSpain from "../src/conicConformalSpain.js";
import geoConicConformalPortugal from "../src/conicConformalPortugal.js";
import geoConicConformalNetherlands from "../src/conicConformalNetherlands.js";
import geoMercatorEcuador from "../src/mercatorEcuador.js";
import geoTransverseMercatorChile from "../src/transverseMercatorChile.js";
import geoConicEquidistantJapan from "../src/conicEquidistantJapan.js";
import geoConicConformalFrance from "../src/conicConformalFrance.js";
import geoConicConformalEurope from "../src/conicConformalEurope.js";
import geoMercatorMalaysia from "../src/mercatorMalaysia.js";
import geoMercatorEquatorialGuinea from "../src/mercatorEquatorialGuinea.js";
import geoAlbersUk from "../src/albersUk.js";

const projections = [
  {
    name: "albersUsa",
    projection: geoAlbersUsa,
    topojson: "./data/us.json",
    field: "states",
  },
  {
    name: "albersUsaTerritories",
    projection: geoAlbersUsaTerritoires,
    topojson: "./data/us_territories.json",
    field: "us",
  },
  {
    name: "conicConformalSpain",
    projection: geoConicConformalSpain,
    topojson: "./data/provincias.json",
    field: "provincias",
  },
  {
    name: "conicConformalPortugal",
    projection: geoConicConformalPortugal,
    topojson: "./data/world-50m.json",
    field: "countries",
  },
  {
    name: "conicConformalNetherlands",
    projection: geoConicConformalNetherlands,
    topojson: "./data/netherlands.json",
    field: "nederland",
  },
  {
    name: "mercatorEcuador",
    projection: geoMercatorEcuador,
    topojson: "./data/world-50m.json",
    field: "countries",
  },
  {
    name: "transverseMercatorChile",
    projection: geoTransverseMercatorChile,
    topojson: "./data/chile.json",
    field: "chile",
  },
  {
    name: "conicEquidistantJapan",
    projection: geoConicEquidistantJapan,
    topojson: "./data/japan.json",
    field: "japan",
  },
  {
    name: "conicConformalFrance",
    projection: geoConicConformalFrance,
    topojson: "./data/france.json",
    field: "regions",
  },
  {
    name: "conicConformalEurope",
    projection: geoConicConformalEurope,
    topojson: "./data/nuts0.json",
    field: "nuts0",
  },
  {
    name: "mercatorMalaysia",
    projection: geoMercatorMalaysia,
    topojson: "./data/malaysia.json",
    field: "land",
  },
  {
    name: "mercatorEquatorialGuinea",
    projection: geoMercatorEquatorialGuinea,
    topojson: "./data/ge.json",
    field: "ge",
  },
  {
    name: "albersUk",
    projection: geoAlbersUk,
    topojson: "./data/uk-counties.json",
    field: "UK",
  },
];

tape("Checks the actual image outputs", async function (test) {
  for (const d of projections) {
    await render(d.projection, d.name, d.topojson, d.field);
    let img1 = PNG.sync.read(readFileSync("test/output/" + d.name + ".png"));
    let img2 = PNG.sync.read(readFileSync("test/samples/" + d.name + ".png"));
    let diff = pixelmatch(img1.data, img2.data, null, img1.width, img1.height, {
      threshold: 0.0,
    });

    test.true(diff == 0, d.name + " matches the sample file");
  }

  test.end();
});

function render(projection, name, topojsonName, layerName) {
  const width = 960,
    height = 500;

  const canvas = createCanvas(width, height),
    context = canvas.getContext("2d");

  const data = JSON.parse(readFileSync(`./test/${topojsonName}`), "utf8"),
    graticule = geoGraticule(),
    outline = { type: "Sphere" };
  const path = geoPath()
    .projection(projection().precision(0.1))
    .context(context);

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
  projection().drawCompositionBorders(context);
  context.stroke();

  return new Promise((resolve) => {
    const out = createWriteStream(`test/output/${name}.png`);
    canvas.createPNGStream().pipe(out);
    out.on("finish", () => resolve());
  });
}
