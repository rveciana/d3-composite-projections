(function() {
  //http://ec.europa.eu/eurostat/statistics-explained/images/a/ae/Urban_rural_typology_for_NUTS3_new.png
d3.geo.conicConformalEurope = function() {

  var continent = d3.geo.conicConformal()
  .center([43, 50]);

  var canaryIslands = d3.geo.conicConformal()
  .center([-9.6, 26.4]);

  var madeira = d3.geo.conicConformal()
    .center([-16.9, 32.8]);

  var azores = d3.geo.conicConformal()
    .center([-27.8, 38.6]);

  var guadeloupe = d3.geo.mercator()
      .center([-61.46, 16.14]);

  var martinique = d3.geo.mercator()
      .center([-61.03, 14.67]);

  var guyane = d3.geo.mercator()
    .center([-53.2, 3.9]);

  var reunion = d3.geo.mercator()
    .center([55.52, -21.13]);

  var continentBbox = [[-30.0, 73.0], [42.0, 26.0]];
  var canaryIslandsBbox = [[-19.0, 29.0], [-12.7, 27.0]];
  var madeiraBbox = [[-17.85, 33.6], [-15.65, 32.02]];
  var azoresBbox = [[-31.996, 40.529], [-24.05, 35.834]];
  var guadeloupeBbox = [[-61.9634, 16.6034],[-60.7879, 15.722]];
  var martiniqueBbox = [[-61.2968, 14.943],[-60.715, 14.321]];
  var guyaneBbox = [[-54.5, 6.29], [-50.9, 1.48]];
  var reunionBbox = [[55.0088, -20.7228],[56.063449, -21.621723]];

  var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      continentPoint,
      canaryIslandsPoint,
      madeiraPoint,
      azoresPoint,
      guadeloupePoint,
      martiniquePoint,
      guyanePoint,
      reunionPoint;

  function conicConformalEurope(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    point = null;

    continentPoint(x, y);
    canaryIslandsPoint(x, y);
    madeiraPoint(x, y);
    azoresPoint(x, y);
    guadeloupePoint(x, y);
    martiniquePoint(x, y);
    guyanePoint(x, y);
    reunionPoint(x, y);

    return point;
  }


conicConformalEurope.invert = function(coordinates) {

    var k = continent.scale(),
        t = continent.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;


      /*
      //How are the return values calculated:
      var c0 = canaryIslands(canaryIslandsBbox[0]);
      x0 = (c0[0] - t[0]) / k;
      y0 = (c0[1] - t[1]) / k;

      console.info(x0 + ' - ' + y0);


      var c1 = canaryIslands(canaryIslandsBbox[1]);
      x1 = (c1[0] - t[0]) / k;
      y1 = (c1[1] - t[1]) / k;

      console.info(x1 + ' - ' + y1);
      */

    /*return (y >= -0.10779 && y < 0.067673 && x >= -0.1866 && x < 0.0255 ? canaryIslands
        : continent).invert(coordinates);*/
        return continent.invert(coordinates);
  };


conicConformalEurope.stream = function(stream) {
    var continentStream = continent.stream(stream);
    var canaryIslandsStream = canaryIslands.stream(stream);
    var madeiraStream = madeira.stream(stream);
    var azoresStream = azores.stream(stream);
    var guadeloupeStream = guadeloupe.stream(stream);
    var martiniqueStream = martinique.stream(stream);
    var guyaneStream = guyane.stream(stream);
    var reunionStream = reunion.stream(stream);


    return {
      point: function(x, y) {
        continentStream.point(x, y);
        canaryIslandsStream.point(x, y);
        madeiraStream.point(x, y);
        azoresStream.point(x, y);
        guadeloupeStream.point(x, y);
        martiniqueStream.point(x, y);
        guyaneStream.point(x, y);
        reunionStream.point(x, y);
      },
      sphere: function() {
        continentStream.sphere();
        canaryIslandsStream.sphere();
        madeiraStream.sphere();
        azoresStream.sphere();
        guadeloupeStream.sphere();
        martiniqueStream.sphere();
        guyaneStream.sphere();
        reunionStream.sphere();
      },
      
      lineStart: function() {
        continentStream.lineStart();
        canaryIslandsStream.lineStart();
        madeiraStream.lineStart();
        azoresStream.lineStart();
        guadeloupeStream.lineStart();
        martiniqueStream.lineStart();
        guyaneStream.lineStart();
        reunionStream.lineStart();
      },
      lineEnd: function() {
        continentStream.lineEnd();
        canaryIslandsStream.lineEnd();
        madeiraStream.lineEnd();
        azoresStream.lineEnd();
        guadeloupeStream.lineEnd();
        martiniqueStream.lineEnd();
        guyaneStream.lineEnd();
        reunionStream.lineEnd();

     },
      polygonStart: function() {
        continentStream.polygonStart();
        canaryIslandsStream.polygonStart();
        madeiraStream.polygonStart();
        azoresStream.polygonStart();
        guadeloupeStream.polygonStart();
        martiniqueStream.polygonStart();
        guyaneStream.polygonStart();
        reunionStream.polygonStart();
      },
      polygonEnd: function() {
        continentStream.polygonEnd();
        canaryIslandsStream.polygonEnd();
        madeiraStream.polygonEnd();
        azoresStream.polygonEnd();
        guadeloupeStream.polygonEnd();
        martiniqueStream.polygonEnd();
        guyaneStream.polygonEnd();
        reunionStream.polygonEnd();
      }
    };
  };


  conicConformalEurope.precision = function(_) {
    if (!arguments.length) return continent.precision();
    continent.precision(_);
    canaryIslands.precision(_);
    madeira.precision(_);
    azores.precision(_);
    guadeloupe.precision(_);
    martinique.precision(_);
    guyane.precision(_);
    reunion.precision(_);

    return conicConformalEurope;
  };

  conicConformalEurope.scale = function(_) {
    if (!arguments.length) return continent.scale();

    continent.scale(_);
    canaryIslands.scale(_*1.3);
    madeira.scale(_*1.8);
    azores.scale(_*0.9);
    guadeloupe.scale(_*1.8);
    martinique.scale(_*1.8);
    guyane.scale(_*0.7);
    reunion.scale(_*1.8);

    return conicConformalEurope.translate(continent.translate());
  };

  conicConformalEurope.translate = function(_) {
    if (!arguments.length) return continent.translate();

    var k = continent.scale(), x = +_[0], y = +_[1];

    /*
    var c0 = continent(continentBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = continent(continentBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Continent: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = canaryIslands.translate([x + 0.05 * k, y + 0.081 * k])(canaryIslandsBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = canaryIslands.translate([x + 0.05 * k, y + 0.081 * k])(canaryIslandsBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Canry Islands: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = madeira.translate([x - 0.04 * k, y - 0.04 * k])(madeiraBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = madeira.translate([x - 0.04 * k, y - 0.04 * k])(madeiraBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('madeira: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = azores.translate([x -0.04 * k, y - 0.11 * k])(azoresBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = azores.translate([x -0.04 * k, y - 0.11 * k])(azoresBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('azores: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = guadeloupe.translate([x + 0.07 * k, y - 0.13 * k])(guadeloupeBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = guadeloupe.translate([x + 0.07 * k, y - 0.13 * k])(guadeloupeBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('guadeloupe: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = martinique.translate([x + 0.07 * k, y - 0.09 * k])(martiniqueBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = martinique.translate([x + 0.07 * k, y - 0.09 * k])(martiniqueBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('martinique: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = guyane.translate([x + 0.07 * k, y - 0.03 * k])(guyaneBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = guyane.translate([x + 0.07 * k, y - 0.03 * k])(guyaneBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('guyane: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = reunion.translate([x + 0.07 * k, y + 0.03 * k])(reunionBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = reunion.translate([x + 0.07 * k, y + 0.03 * k])(reunionBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('reunion: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
  */

   continentPoint = continent
       .translate(_)
       .clipExtent([[x - 0.6196 * k, y - 0.3579 * k],[x + 0.1287 * k, y + 0.3441 * k]])
       .stream(pointStream).point;

   canaryIslandsPoint = canaryIslands
       .translate([x + 0.05 * k, y + 0.081 * k])
       .clipExtent([[x - 0.1174* k, y + 0.0034 * k],[x  - 0.0071* k, y + 0.06234 * k]])
       .stream(pointStream).point;

   madeiraPoint = madeira
       .translate([x - 0.04 * k, y - 0.04 * k])
       .clipExtent([[x - 0.0576* k, y - 0.06489 * k],[x  - 0.01482* k, y - 0.01478 * k]])
       .stream(pointStream).point;

    azoresPoint = azores
       .translate([x -0.04 * k, y - 0.11 * k])
       .clipExtent([[x - 0.0755* k, y - 0.14747 * k],[x  + 0.00931* k, y + 0.06373 * k]])
       .stream(pointStream).point;

    guadeloupePoint = guadeloupe
      .translate([x + 0.07 * k, y - 0.13 * k])
      .clipExtent([[x + 0.05418* k, y - 0.14517 * k],[x  + 0.09111* k, y - 0.11634 * k]])
      .stream(pointStream).point;

    martiniquePoint = martinique
      .translate([x + 0.07 * k, y - 0.09 * k])
      .clipExtent([[x + 0.0616* k, y - 0.0988 * k],[x  + 0.0799* k, y - 0.07867 * k]])
      .stream(pointStream).point;

    guyanePoint = guyane
      .translate([x + 0.07 * k, y - 0.03 * k])
      .clipExtent([[x + 0.0541* k, y - 0.0593 * k],[x  + 0.0981* k, y - 0.0004 * k]])
      .stream(pointStream).point;

    reunionPoint = reunion
      .translate([x + 0.07 * k, y + 0.03 * k])
      .clipExtent([[x + 0.05394* k, y + 0.0163 * k],[x  + 0.087* k, y + 0.046589 * k]])
      .stream(pointStream).point;

    return conicConformalEurope;
  };


  conicConformalEurope.getCompositionBorders = function() {

    var ulCanaryIslands = continent([-13.0, 35.3]);
    var ldCanaryIslands = continent([-6.4, 34.0]);
    
    console.info("M"+ulCanaryIslands[0]+" "+ulCanaryIslands[1]+"L"+ldCanaryIslands[0]+" "+ulCanaryIslands[1]+
      "L"+ldCanaryIslands[0]+" "+ldCanaryIslands[1]);

    return "M0 0L500 500";

 };


  return conicConformalEurope.scale(750);
};

})();
