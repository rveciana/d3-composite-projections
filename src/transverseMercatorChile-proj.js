(function() {


d3.geo.transverseMercatorChile = function() {

  var mainland = d3.geo.transverseMercator()
      .rotate([72, 37]);

  var antarctic = d3.geo.stereographic()
    .rotate([72, 0]);

  var juanFernandez = d3.geo.mercator()
    .center([-80, -33.5]);

  var pascua = d3.geo.mercator()
    .center([-109.4, -27.1]);

  var mainlandBbox = [[-77.0, -15.0], [-63.0, -60.0]];
  var antarcticBbox = [[-91.0, -60.0], [-53.0, -90.0]];
  var juanFernandezBbox = [[-81.0, -33.0], [-78.0, -34.0]];
  var pascuaBbox = [[-111.0, -25.0], [-107.0, -28.0]];

  var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      mainlandPoint,
      antarcticPoint,
      juanFernandezPoint,
      pascuaPoint;

  function transverseMercatorChile(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    point = null;

    (mainlandPoint(x, y), point) || (antarcticPoint(x, y), point) ||
    (juanFernandezPoint(x, y), point) || pascuaPoint(x, y);

    return point;
  }


transverseMercatorChile.invert = function(coordinates) {

    var k = mainland.scale(),
        t = mainland.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;


      /*
      //How are the return values calculated:
      console.info("pascua")
      var c0 = pascua(pascuaBbox[0]);
      x0 = (c0[0] - t[0]) / k;
      y0 = (c0[1] - t[1]) / k;

      console.info(x0 + ' - ' + y0);


      var c1 = pascua(pascuaBbox[1]);
      x1 = (c1[0] - t[0]) / k;
      y1 = (c1[1] - t[1]) / k;

      console.info(x1 + ' - ' + y1);

      console.info("juanFernandez")
      var c0 = juanFernandez(juanFernandezBbox[0]);
      x0 = (c0[0] - t[0]) / k;
      y0 = (c0[1] - t[1]) / k;

      console.info(x0 + ' - ' + y0);


      var c1 = juanFernandez(juanFernandezBbox[1]);
      x1 = (c1[0] - t[0]) / k;
      y1 = (c1[1] - t[1]) / k;

      console.info(x1 + ' - ' + y1);
      

      console.info("antarctic")
      var c0 = antarctic(antarcticBbox[0]);
      x0 = (c0[0] - t[0]) / k;
      y0 = (c0[1] - t[1]) / k;

      console.info(x0 + ' - ' + y0);

      
      var c1 = antarctic(antarcticBbox[1]);
      x1 = (c1[0] - t[0]) / k; --> Needs to be modified, since lat = -90 gives problems
      y1 = (c1[1] - t[1]) / k;

      console.info(x1 + ' - ' + y1);
      */


    return (y >= -0.1512 && y < -0.063424 && x >= -0.13689 && x < -0.032168 ? pascua
        : y >= -0.06565 && y < -0.034257 && x >= -0.12618 && x < -0.04764 ? juanFernandez
        : y >= 0.2582 && y < 0.32 && x >= -0.106579 && x < -0.07 ? antarctic
        : mainland).invert(coordinates);
  };


transverseMercatorChile.stream = function(stream) {
    var mainlandStream = mainland.stream(stream);
    var antarcticStream = antarctic.stream(stream);
    var juanFernandezStream = juanFernandez.stream(stream);
    var pascuaStream = pascua.stream(stream);

    return {
      point: function(x, y) {
        mainlandStream.point(x, y);
        antarcticStream.point(x, y);
        juanFernandezStream.point(x, y);
        pascuaStream.point(x, y);
      },
      sphere: function() {
        mainlandStream.sphere();
        antarcticStream.sphere();
        juanFernandezStream.sphere();
        pascuaStream.sphere();
      },
      lineStart: function() {
        mainlandStream.lineStart();
        antarcticStream.lineStart();
        juanFernandezStream.lineStart();
        pascuaStream.lineStart();
      },
      lineEnd: function() {
        mainlandStream.lineEnd();
        antarcticStream.lineEnd();
        juanFernandezStream.lineEnd();
        pascuaStream.lineEnd();
     },
      polygonStart: function() {
        mainlandStream.polygonStart();
        antarcticStream.polygonStart();
        juanFernandezStream.polygonStart();
        pascuaStream.polygonStart();
      },
      polygonEnd: function() {
        mainlandStream.polygonEnd();
        antarcticStream.polygonEnd();
        juanFernandezStream.polygonEnd();
        pascuaStream.polygonEnd();
      }
    };
  };


  transverseMercatorChile.precision = function(_) {
    if (!arguments.length) return mainland.precision();
    mainland.precision(_);
    antarctic.precision(_);
    juanFernandez.precision(_);
    pascua.precision(_);

    return transverseMercatorChile;
  };

  transverseMercatorChile.scale = function(_) {
    if (!arguments.length) return mainland.scale();

    mainland.scale(_);
    antarctic.scale(_ * 0.15);
    juanFernandez.scale(_ * 1.5);
    pascua.scale(_ * 1.5);

    return transverseMercatorChile.translate(mainland.translate());
  };

  transverseMercatorChile.translate = function(_) {
    if (!arguments.length) return mainland.translate();

    var k = mainland.scale(), x = +_[0], y = +_[1];

   /*
   //How to calculate the fixed parameters
    var c0 = mainland.translate(_)(mainlandBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = mainland.translate(_)(mainlandBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('mainland: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

  var c0 = antarctic.translate([x - 0.09 * k, y + 0.17 * k])(antarcticBbox[0]);
  x0 = (x - c0[0]) / k;
  y0 = (y - c0[1]) / k;

   var c1 = antarctic.translate([x - 0.09 * k, y + 0.17 * k])(antarcticBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('antarctic: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);

   var c0 = juanFernandez.translate([x - 0.1 * k, y - 0.05 * k])(juanFernandezBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

    var c1 = juanFernandez.translate([x - 0.1 * k, y - 0.05 * k])(juanFernandezBbox[1]);
    x1 = (x - c1[0]) / k;
    y1 = (y - c1[1]) / k;

    console.info('juanFernandez: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);

    var c0 = pascua.translate([x - 0.1 * k, y - 0.05 * k])(pascuaBbox[0]);
    x0 = (x - c0[0]) / k;
    y0 = (y - c0[1]) / k;

     var c1 = pascua.translate([x - 0.1 * k, y - 0.05 * k])(pascuaBbox[1]);
     x1 = (x - c1[0]) / k;
     y1 = (y - c1[1]) / k;

     console.info('pascua: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);
     */

   mainlandPoint = mainland
       .translate(_)
       .clipExtent([[x - 0.0844 * k, y - 0.3821 * k],[x + 0.0784 * k, y + 0.4068 * k]])
       .stream(pointStream).point;

   antarcticPoint = antarctic
       .translate([x - 0.09 * k, y + 0.17 * k])
       .clipExtent([[x - 0.1065 * k, y + 0.2582 * k ],[x  - 0.07 * k, y + 0.32 * k]])
       .stream(pointStream).point;

   juanFernandezPoint = juanFernandez
       .translate([x - 0.1 * k, y - 0.05 * k])
       .clipExtent([[x - 0.1261799 * k, y - 0.0656526 * k ],[x  - 0.04764 * k, y - 0.0342567 * k]])
       .stream(pointStream).point;

   pascuaPoint = pascua
       .translate([x - 0.095 * k, y - 0.09 * k])
       .clipExtent([[x - 0.1419 * k, y - 0.1112 * k ],[x  - 0.0371 * k, y - 0.0234 * k]])
       .stream(pointStream).point;
 
   return transverseMercatorChile;
  };


  transverseMercatorChile.getCompositionBorders = function() {

    var ldantarctic = mainland([-82, -50.5]);
    var ulantarctic = mainland([-79, -56]);
    var ldjuanFernandez = mainland([-81, -33.2]);
    var uljuanFernandez = mainland([-76, -35.3]);
    var ldpascua = mainland([-79.5, -30.9]);
    var ulpascua = mainland([-77.3, -32.5]);

    return "M"+ldantarctic[0]+" "+ldantarctic[1]+"L"+ldantarctic[0]+" "+ulantarctic[1]
    +"L"+ulantarctic[0]+" "+ulantarctic[1]+"L"+ulantarctic[0]+" "+ldantarctic[1]
    +"L"+ldantarctic[0]+" "+ldantarctic[1]+"M"+ldjuanFernandez[0]+" "+ldjuanFernandez[1]
    +"L"+ldjuanFernandez[0]+" "+uljuanFernandez[1]
    +"L"+uljuanFernandez[0]+" "+uljuanFernandez[1]+"L"+uljuanFernandez[0]+" "+ldjuanFernandez[1]
    +"L"+ldjuanFernandez[0]+" "+ldjuanFernandez[1]+"M"+ldpascua[0]+" "+ldpascua[1]
    +"L"+ldpascua[0]+" "+ulpascua[1]
    +"L"+ulpascua[0]+" "+ulpascua[1]+"L"+ulpascua[0]+" "+ldpascua[1]
    +"L"+ldpascua[0]+" "+ldpascua[1];

 };

  return transverseMercatorChile.scale(1000);
};



})();
