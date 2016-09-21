var tape = require("tape"),
    d3 = require("../");

require("./inDelta");

tape("geoConicConformalEurope(point) returns the expected result", function(test) {
  var proj = d3.geoConicConformalEurope();

  var locations =[{name:'Paris', coords:[2.3, 48.9]},
        {name:'cayenne', coords:[-52.3, 4.91]},
        {name:'saintDenis', coords:[55.45, -20.88]},
        {name:'mamoudzou', coords:[45.23, -12.78]},
        {name:'fortDeFrance', coords:[-61.0589, 14.607]},
        {name:'Pointe-à-Pitre', coords:[-61.5353, 16.2448]},
        {name:'Las Palmas', coords:[-15.0, 28.0]},
        {name:'Ponta Delgada', coords:[-25.7, 37.7]},
        {name:'Sao Roque do Pico', coords:[-28.314, 38.5]},
        {name:'Lajes das Flores', coords:[-31.18, 39.379]},
        {name:'Funchal', coords:[-16.91, 32.667]},
        {name:'La Valetta', coords:[14.5, 35.897]}
        ];;


  locations.forEach(function (location){
    console.info("testing", location.name);
    var inv = proj.invert(proj(location.coords));
    test.inDelta(location.coords, inv, 0.1);
  });

  var ny = [-73.93, 40.73];
  test.equals(proj(ny), null); //NY out of range

  test.end();
});

tape("geoConicConformalEurope.getCompositionBorders() returns the expected result", function(test) {

  var borders = d3.geoConicConformalEurope().getCompositionBorders();
  test.equal((borders.match(/L/g) || []).length, 33, "Number of border lines must be 33");
  test.equal((borders.match(/M/g) || []).length, 11, "Number of borders must be 11");
  test.end();
});
