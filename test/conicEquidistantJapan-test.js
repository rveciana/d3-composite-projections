var tape = require("tape"),
    d3 = require("../");

require("./inDelta");

tape("geoConicEquidistantJapan(point) returns the expected result", function(test) {
  var proj = d3.geoConicEquidistantJapan();
  var locations = [{name:'Fuji Mount', coords:[138.73, 35.36]},
        {name:'Kitami', coords:[143.896, 43.8039]},
        {name:'Naha', coords:[127.68, 26.2]},
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
/*
  var borders = d3.geoConicConformalPortugal().getCompositionBorders();
  test.equal((borders.match(/L/g) || []).length, 8, "Number of border lines must be 8");
  test.equal((borders.match(/M/g) || []).length, 2, "Number of borders must be 2");*/
  test.end();
});
