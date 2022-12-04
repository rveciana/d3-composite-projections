import tape from "tape";
import geoConicConformalNetherlands from "../src/conicConformalNetherlands.js";

tape(
  "geoConicConformalNetherlands(point) returns the expected result",
  function (test) {
    const proj = geoConicConformalNetherlands();

    const locations = [
      { name: "maastricht", coords: [5.68, 50.85] },
      { name: "vlieland", coords: [5.07, 53.3] },
      { name: "kralendijk", coords: [-68.27, 12.144] },
      { name: "oranjestad", coords: [-62.98, 17.48] },
      { name: "thebottom", coords: [-63.249, 17.626] },
    ];

    locations.forEach((location) => {
      console.info("testing", location.name);
      var inv = proj.invert(proj(location.coords));
      test.inDelta(location.coords, inv, 0.05);
    });

    test.end();
  }
);

tape(
  "geoConicConformalNetherlands.getCompositionBorders() returns the expected result",
  function (test) {
    const borders = geoConicConformalNetherlands().getCompositionBorders();

    test.equal(
      (borders.match(/L/g) || []).length,
      8,
      "Number of border lines must be 8"
    );
    test.equal(
      (borders.match(/M/g) || []).length,
      2,
      "Number of borders must be 2"
    );
    test.end();
  }
);
