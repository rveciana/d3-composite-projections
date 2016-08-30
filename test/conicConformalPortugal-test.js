var tape = require("tape"),
    d3 = require("../");

require("./inDelta");

tape("geoConicConformalPortugal(point) returns the expected result", function(test) {
  var proj = d3.geoConicConformalPortugal();
  var locations = [{name:'lisboa', coords:[-9.15, 38.7]},
        {name:'ponta_delgada', coords:[-25.7, 37.7]},
        {name:'funchal', coords:[-16.91, 32.667]},
        ];
  locations.forEach(function (location){
    console.info("testing", location.name);
    var inv = proj.invert(proj(location.coords));
    test.inDelta(location.coords, inv, 0.1);
  });
/*
  var inv_lisboa = proj.invert(proj(lisboa));
  var inv_ponta_delgada = proj.invert(proj(ponta_delgada));

  test.inDelta(lisboa, inv_lisboa, 0.1);
  test.inDelta(las_palmas, inv_las_palmas, 0.1);
*/
  var paris = [2.3522, 48.8566];
  test.equals(proj(paris), null); //Paris out of range

  test.end();
});
/*
tape("geoConicConformalPortugal.getCompositionBorders() returns the expected result", function(test) {
  var borders = d3.geoConicConformalSpain().getCompositionBorders();
  test.equal((borders.match(/L/g) || []).length, 2, "Number of border lines must be 2");
  test.equal((borders.match(/M/g) || []).length, 1, "Number of borders must be 1");
  test.end();
});*/
