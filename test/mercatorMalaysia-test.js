import tape from "tape";
import geoMercatorMalaysia from "../src/mercatorMalaysia.js";

tape("geoMercatorMalaysia(point) returns the expected result", function (test) {
  var proj = geoMercatorMalaysia();
  var locations = [
    { name: "Kuala Lumpur", coords: [101.696673, 3.113452] },
    { name: "Bintulu", coords: [113.047319, 3.179831] },
  ];
  locations.forEach(function (location) {
    console.info("testing", location.name);
    var inv = proj.invert(proj(location.coords));
    test.inDelta(location.coords, inv, 0.1);
  });

  var paris = [2.3522, 48.8566];
  test.equals(proj(paris), null); //Paris out of range

  test.end();
});

tape(
  "geoMercatorMalaysia.getCompositionBorders() returns the expected result",
  function (test) {
    var borders = geoMercatorMalaysia().getCompositionBorders();
    test.equal(
      (borders.match(/L/g) || []).length,
      3,
      "Number of border lines must be 3"
    );
    test.equal(
      (borders.match(/M/g) || []).length,
      1,
      "Number of borders must be 1"
    );
    test.end();
  }
);
