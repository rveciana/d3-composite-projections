
var tape = require("tape"),
    d3 = require("../");

require("./inDelta");

tape("geoAlbersUsa(point) returns the expected result", function(test) {
  var albersUsa = d3.geoAlbersUsaTerritories();/*
  test.inDelta(albersUsa([-122.4194, 37.7749]), [107.4, 214.1], 0.1); // San Francisco, CA
  test.inDelta(albersUsa([ -74.0059, 40.7128]), [794.6, 176.5], 0.1); // New York, NY
  test.inDelta(albersUsa([ -95.9928, 36.1540]), [488.8, 298.0], 0.1); // Tulsa, OK
  test.inDelta(albersUsa([-149.9003, 61.2181]), [171.2, 446.9], 0.1); // Anchorage, AK
  test.inDelta(albersUsa([-157.8583, 21.3069]), [298.5, 451.0], 0.1); // Honolulu, HI
  test.equal(albersUsa([2.3522, 48.8566]), null); // Paris, France*/
  test.end();
});

tape("geoAlbersUsa.invert(point) returns the expected result", function(test) {
  var albersUsa = d3.geoAlbersUsaTerritories();
  /*
  test.inDelta(albersUsa.invert([107.4, 214.1]), [-122.4194, 37.7749], 0.1); // San Francisco, CA
  test.inDelta(albersUsa.invert([794.6, 176.5]), [ -74.0059, 40.7128], 0.1); // New York, NY
  test.inDelta(albersUsa.invert([488.8, 298.0]), [ -95.9928, 36.1540], 0.1); // Tulsa, OK
  test.inDelta(albersUsa.invert([171.2, 446.9]), [-149.9003, 61.2181], 0.1); // Anchorage, AK
  test.inDelta(albersUsa.invert([298.5, 451.0]), [-157.8583, 21.3069], 0.1); // Honolulu, HI*/
  test.end();
});

tape("geoAlbersUsaTerritories added zones return the expected results", function(test) {
  var proj = d3.geoAlbersUsaTerritories();

  var locations = [{name:'San Juan', coords:[-66.1, 18.43]},
        {name:'Pago Pago', coords:[-170.7, -14.27]},
          {name:'Guam', coords:[144.77, 13.45]} 
      ];
  locations.forEach(function (location){
    console.info("testing", location.name, proj(location.coords));
    var inv = proj.invert(proj(location.coords));
    test.inDelta(location.coords, inv, 0.1);
  });

  var paris = [2.3522, 48.8566];
  test.equals(proj(paris), null); //Paris out of range

  test.end();
});


tape("geoAlbersUsa.getCompositionBorders() returns the expected result", function(test) {
  var albersUsa = d3.geoAlbersUsa();
  var borders = albersUsa.getCompositionBorders();
  test.equal((borders.match(/L/g) || []).length, 6, "Number of border lines must be 6");
  test.equal((borders.match(/M/g) || []).length, 2, "Number of borders must be 2");
  test.end();
});
