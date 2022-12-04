import tape from "tape";
import geoMercatorEquatorialGuinea from "../src/mercatorEquatorialGuinea.js";

tape(
  "mercatorEquatorialGuinea(point) returns the expected result",
  function (test) {
    var proj = geoMercatorEquatorialGuinea();
    var locations = [
      { name: "Bata", coords: [9.765998, 1.858424] },
      { name: "Malabo", coords: [8.785163, 3.56] },
      { name: "San Antonio de Palé", coords: [5.630809, -1.406678] },
    ];
    locations.forEach(function (location) {
      console.info("testing", location.name);
      var inv = proj.invert(proj(location.coords));
      test.inDelta(inv, location.coords, 0.1);
    });

    var paris = [2.3522, 48.8566];
    test.equals(proj(paris), null); //Paris out of range

    test.end();
  }
);

tape(
  "mercatorEquatorialGuinea.getCompositionBorders() returns the expected result",
  function (test) {
    var borders = geoMercatorEquatorialGuinea().getCompositionBorders();
    test.equal(
      (borders.match(/L/g) || []).length,
      9,
      "Number of border lines must be 9"
    );
    test.equal(
      (borders.match(/M/g) || []).length,
      3,
      "Number of borders must be 3"
    );
    test.end();
  }
);
