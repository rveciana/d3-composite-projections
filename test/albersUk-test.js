var tape = require("tape"),
  d3 = require("../");

require("./inDelta");

tape("geoAlbersUk(point) returns the expected result", function(test) {
  var albersUsa = d3.geoAlbersUk();
  test.inDelta(albersUsa([-0.124656, 51.500589]), [609.65, 398.07], 0.1); // London
  test.inDelta(albersUsa([-1.151486, 60.154551]), [587.12, 46.2], 0.1); // Lerwick
  test.end();
});

tape("geoAlbersUk.invert(point) returns the expected result", function(test) {
  var albersUsa = d3.geoAlbersUk();
  test.inDelta(albersUsa.invert([609.65, 398.07]), [-0.124656, 51.500589], 0.1); // London
  test.inDelta(albersUsa.invert([587.12, 46.2]), [-1.151486, 60.154551], 0.1); // Lerwick

  test.end();
});

tape(
  "geoAlbersUk.getCompositionBorders() returns the expected result",
  function(test) {
    var albersUsa = d3.geoAlbersUk();
    var borders = albersUsa.getCompositionBorders();
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
