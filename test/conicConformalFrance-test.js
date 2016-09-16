var tape = require("tape"),
    d3 = require("../");

require("./inDelta");

tape("geoConicConformalFrance(point) returns the expected result", function(test) {
  var proj = d3.geoConicConformalFrance();

   var locations = [{name:'Paris', coords:[2.3, 48.9]},
        {name:'cayenne', coords:[-52.3, 4.91]},
        {name:'saintDenis', coords:[55.45, -20.88]},
        {name:'mamoudzou', coords:[45.23, -12.78]},
        {name:'fortDeFrance', coords:[-61.0589, 14.607]},
        {name:'Pointe-à-Pitre', coords:[-61.5353, 16.2448]},
        {name:'Nouméa', coords:[166.484263, -22.254973]},
        {name:'Papeete', coords:[-149.567121, -17.532704]}, //Some regions may fail, because overlap.
        {name:'Kolotai', coords:[-178.080656, -14.311235]},
        {name:'St Pierre', coords:[-56.173538, 46.780368]},
        {name:'Gustavia', coords:[-62.851940, 17.895830]},
        ];


  locations.forEach(function (location){
    console.info("testing", location.name);
    var inv = proj.invert(proj(location.coords));
    test.inDelta(location.coords, inv, 0.1);
  });

  var ny = [-73.93, 40.73];
  test.equals(proj(ny), null); //NY out of range

  test.end();
});

tape("geoConicConformalFrance.getCompositionBorders() returns the expected result", function(test) {

  var borders = d3.geoConicConformalFrance().getCompositionBorders();
  test.equal((borders.match(/L/g) || []).length, 31, "Number of border lines must be 31");
  test.equal((borders.match(/M/g) || []).length, 11, "Number of borders must be 11");
  test.end();
});
