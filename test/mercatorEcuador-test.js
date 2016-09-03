var tape = require("tape"),
    d3 = require("../");

require("./inDelta");

tape("geoMercatorEcuador(point) returns the expected result", function(test) {

  var proj = d3.geoMercatorEcuador();

  var locations = [{name:'Quito', coords:[-78.473, -0.1846]},
        {name:'Puerto Baquerizo', coords:[-89.606278, -0.916553]},
        {name:'Puerto Villamil', coords:[-90.969, -0.9553]},
        ];
  locations.forEach(function (location){
    console.info("testing", location.name);
    var inv = proj.invert(proj(location.coords));
    test.inDelta(location.coords, inv, 0.1);
  });

  var paris = [2.3522, 48.8566];
  test.equals(proj(paris), null); //Paris out of range

  test.end();
});

tape("geoConicConformalPortugal.getCompositionBorders() returns the expected result", function(test) {

  var borders = d3.geoConicConformalPortugal().getCompositionBorders();
  test.equal((borders.match(/L/g) || []).length, 8, "Number of border lines must be 8");
  test.equal((borders.match(/M/g) || []).length, 2, "Number of borders must be 2");
  test.end();
});
