import tape from "tape";
import geoMercatorEcuador from "../src/mercatorEcuador.js";

tape("geoMercatorEcuador(point) returns the expected result", function (test) {
  var proj = geoMercatorEcuador();

  var locations = [
    { name: "Quito", coords: [-78.473, -0.1846] },
    { name: "Puerto Baquerizo", coords: [-89.606278, -0.916553] },
    { name: "Puerto Villamil", coords: [-90.969, -0.9553] },
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
  "geoMercatorEcuador.getCompositionBorders() returns the expected result",
  function (test) {
    var borders = geoMercatorEcuador().getCompositionBorders();
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
