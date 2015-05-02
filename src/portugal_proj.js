(function() {


d3.geo.conicConformalPortugal = function() {

  var iberianPeninsule = d3.geo.conicConformal()
    .center([-8.0, 39.9]);

  var madeira = d3.geo.conicConformal()
    .center([-16.9, 32.8]);

  var azores = d3.geo.conicConformal()
    .center([-27.8, 38.6]);

  var iberianPeninsuleBbox = [[-12.0, 44.0], [-3.5, 35.5]];
  var madeiraBbox = [[-17.85, 33.6], [-15.65, 32.02]];
  var azoresBbox = [[-31.996, 40.529], [-24.05, 35.834]];




  var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      iberianPeninsulePoint,
      madeiraPoint,
      azoresPoint;

  function conicConformalPortugal(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    point = null;

    (iberianPeninsulePoint(x, y), point) || (madeiraPoint(x, y), point) || azoresPoint;

    return point;
  }


conicConformalPortugal.invert = function(coordinates) {

    var k = iberianPeninsule.scale(),
        t = iberianPeninsule.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;

      /*

      How are the return values calculated:
      var c0 = madeira(madeiraBbox[0]);
      x0 = (c0[0] - t[0]) / k;
      y0 = (c0[1] - t[1]) / k;

      console.info(x0 + ' - ' + y0);


      var c1 = madeira(madeiraBbox[1]);
      x1 = (c1[0] - t[0]) / k;
      y1 = (c1[1] - t[1]) / k;

      console.info(x1 + ' - ' + y1);
      */
    return (y >= 0.06440353 && y < 0.106509 && x >= -0.1247351 && x < -0.045924 ? madeira
        : iberianPeninsule).invert(coordinates);
  };


conicConformalPortugal.stream = function(stream) {
    var iberianPeninsuleStream = iberianPeninsule.stream(stream);
    var madeiraStream = madeira.stream(stream);
    var azoresStream = azores.stream(stream);

    return {
      point: function(x, y) {
        iberianPeninsuleStream.point(x, y);
        madeiraStream.point(x, y);
        azoresStream.point(x, y);
      },
      sphere: function() {
        iberianPeninsuleStream.sphere();
        madeiraStream.sphere();
        azoresStream.sphere();
      },
      lineStart: function() {
        iberianPeninsuleStream.lineStart();
        madeiraStream.lineStart();
        azoresStream.lineStart();
      },
      lineEnd: function() {
        iberianPeninsuleStream.lineEnd();
        madeiraStream.lineEnd();
        azoresStream.lineEnd();
     },
      polygonStart: function() {
        iberianPeninsuleStream.polygonStart();
        madeiraStream.polygonStart();
        azoresStream.polygonStart();
      },
      polygonEnd: function() {
        iberianPeninsuleStream.polygonEnd();
        madeiraStream.polygonEnd();
        azoresStream.polygonEnd();
      }
    };
  };


  conicConformalPortugal.precision = function(_) {
    if (!arguments.length) return iberianPeninsule.precision();
    iberianPeninsule.precision(_);
    madeiraPeninsule.precision(_);
    azoresPeninsule.precision(_);

    return conicConformalPortugal;
  };

  conicConformalPortugal.scale = function(_) {
    if (!arguments.length) return iberianPeninsule.scale();

    iberianPeninsule.scale(_);
    madeira.scale(_);
    azores.scale(_ * 0.6);

    return conicConformalPortugal.translate(iberianPeninsule.translate());
  };

  conicConformalPortugal.translate = function(_) {
    if (!arguments.length) return iberianPeninsule.translate();

    var k = iberianPeninsule.scale(), x = +_[0], y = +_[1];

   /* How to calculate the fixed parameters
    var c0 = iberianPeninsule(iberianPeninsuleBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = iberianPeninsule(iberianPeninsuleBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Iberian Peninsula: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = madeira.translate([x - 0.041 * k, y + 0.05 * k])(madeiraBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = madeira.translate([x - 0.041 * k, y + 0.05 * k])(madeiraBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Madeira: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);



    var c0 = azores.translate([x - 0.06 * k, y + -0.01 * k])(azoresBbox[0]);
    x0 = (x - c0[0]) / k;
    y0 = (y - c0[1]) / k;

    var c1 = azores.translate([x - 0.06 * k, y + -0.01 * k])(azoresBbox[1]);
    x1 = (x - c1[0]) / k;
    y1 = (y - c1[1]) / k;

    console.info('Azores: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
    */

   iberianPeninsulePoint = iberianPeninsule
       .translate(_)
       .clipExtent([[x - 0.039661 * k, y - 0.06681 * k],[x + 0.0504 * k, y + 0.0695 * k]])
       .stream(pointStream).point;

   madeiraPoint = madeira
       .translate([x - 0.041 * k, y + 0.05 * k])
       .clipExtent([[x - 0.0509* k, y + 0.03617 * k ],[x  - 0.027 * k, y + 0.064 * k]])
       .stream(pointStream).point;

   azoresPoint = azores
       .translate([x - 0.06 * k, y + -0.01 * k])
       .clipExtent([[x - 0.08367* k, y - 0.03498 * k ],[x  - 0.0395 * k, y + 0.0208488 * k]])
      //  .clipExtent([azores(azoresBbox[0]),azores(azoresBbox[1])])
       .stream(pointStream).point;

        return conicConformalPortugal;
  };


  conicConformalPortugal.getCompositionBorders = function() {

    var ldAzores = iberianPeninsule([-10.65, 38.8]);
    var ulAzores = iberianPeninsule([-16.0, 41.4]);

    var ldMadeira = iberianPeninsule([-10.34, 35.9]);
    var ulMadeira = iberianPeninsule([-12.0, 36.8]);

    return "M"+ldAzores[0]+" "+ldAzores[1]+"L"+ldAzores[0]+" "+ulAzores[1]+
    "L"+ulAzores[0]+" "+ulAzores[1]+"L"+ulAzores[0]+" "+ldAzores[1]+"L"+ldAzores[0]+" "+ldAzores[1]+
    "M"+ldMadeira[0]+" "+ldMadeira[1]+"L"+ldMadeira[0]+" "+ulMadeira[1]+
    "L"+ulMadeira[0]+" "+ulMadeira[1]+"L"+ulMadeira[0]+" "+ldMadeira[1]+"L"+ldMadeira[0]+" "+ldMadeira[1];

 };

  return conicConformalPortugal.scale(3000);
};



})();
