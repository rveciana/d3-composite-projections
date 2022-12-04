import tape from "tape";
import geoConicConformalPortugal from "../src/conicConformalPortugal.js";

tape(
  "geoConicConformalPortugal(point) returns the expected result",
  function (test) {
    var proj = geoConicConformalPortugal();
    var locations = [
      { name: "lisboa", coords: [-9.15, 38.7] },
      { name: "ponta_delgada", coords: [-25.7, 37.7] },
      { name: "funchal", coords: [-16.91, 32.667] },
    ];
    locations.forEach(function (location) {
      console.info("testing", location.name);
      var inv = proj.invert(proj(location.coords));
      test.inDelta(location.coords, inv, 0.1);
    });

    var paris = [2.3522, 48.8566];
    test.equals(proj(paris), null); //Paris out of range

    test.end();
  }
);

tape(
  "geoConicConformalPortugal.getCompositionBorders() returns the expected result",
  function (test) {
    var borders = geoConicConformalPortugal().getCompositionBorders();
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
