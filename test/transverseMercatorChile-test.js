var tape = require("tape"),
    d3 = require("../");

require("./inDelta");

tape("geoTransverseMercatorChile(point) returns the expected result", function(test) {

  var proj = d3.geoTransverseMercatorChile();
  var locations = [{name:'Santiago', coords:[-70.6, -33.5]},
        {name:'Hanga Roa', coords:[-109.4, -27.15]},
        {name:'San Juan Bautista', coords:[-78.83, -33.636]},
        {name:'Villa Las Estrellas', coords:[-70.6, -33.5]}
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

  var borders = d3.geoTransverseMercatorChile().getCompositionBorders();
  test.equal((borders.match(/L/g) || []).length, 12, "Number of border lines must be 12");
  test.equal((borders.match(/M/g) || []).length, 3, "Number of borders must be 3");
  test.end();
});
