var tape = require("tape"),
    d3 = require("../");

require("./inDelta");

tape("geoConicConformalSpain(point) returns the expected result", function(test) {
  var proj = d3.geoConicConformalSpain();
  var barcelona = [2.0, 41.0];
  var las_palmas = [-15.0, 28.0];
  var paris = [2.3522, 48.8566];

  var inv_barcelona = proj.invert(proj(barcelona));
  var inv_las_palmas = proj.invert(proj(las_palmas));

  test.inDelta(barcelona, inv_barcelona, 0.1);
  test.inDelta(las_palmas, inv_las_palmas, 0.1);
  test.equals(proj(paris), null); //Paris out of range

  test.end();
});

tape("geoConicConformalSpain.getCompositionBorders() returns the expected result", function(test) {
  var borders = d3.geoConicConformalSpain().getCompositionBorders();
  test.equal((borders.match(/L/g) || []).length, 2, "Number of border lines must be 2");
  test.equal((borders.match(/M/g) || []).length, 1, "Number of borders must be 1");
  test.end();
});
