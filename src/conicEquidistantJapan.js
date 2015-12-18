(function() {
d3.geo.conicEquidistantJapan = function() {

  var mainland = d3.geo.conicEquidistant()
      .rotate([-139, -36])
      .parallels([40,34]);

  var hokkaido = d3.geo.conicEquidistant()
      .rotate([-149, -40])
      .parallels([40,34]);

  var okinawa = d3.geo.conicEquidistant()
      .rotate([-131, -33])
      .parallels([40,34]);

  var mainlandBbox = [[126.0, 41.606], [142.97, 29.97]];
  var hokkaidoBbox = [[138.7, 45.61], [148.8, 41.6]];
  var okinawaBbox = [[122.6, 29.0], [132.3, 23.7]];


  var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      mainlandPoint,
      hokkaidoPoint,
      okinawaPoint;



  function conicEquidistantJapan(coordinates) {
    /*jshint -W030 */
    var x = coordinates[0], y = coordinates[1];
    point = null;


    (mainlandPoint(x, y), point) || (hokkaidoPoint(x, y), point) ||
    okinawaPoint(x, y);

    return point;
  }


  conicEquidistantJapan.invert = function(coordinates) {

    var k = mainland.scale(),
        t = mainland.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;


        /*
      //How are the return values calculated:


      var c0 = hokkaido(hokkaidoBbox[0]);
      x0 = (c0[0] - t[0]) / k;
      y0 = (c0[1] - t[1]) / k;

      console.info('hokkaido ' + x0 + ' - ' + y0);


      var c1 = hokkaido(hokkaidoBbox[1]);
      x1 = (c1[0] - t[0]) / k;
      y1 = (c1[1] - t[1]) / k;

      console.info('hokkaido ' + x1 + ' - ' + y1);

      var c0 = okinawa(okinawaBbox[0]);
      x0 = (c0[0] - t[0]) / k;
      y0 = (c0[1] - t[1]) / k;

      console.info('okinawa ' + x0 + ' - ' + y0);


      var c1 = okinawa(okinawaBbox[1]);
      x1 = (c1[0] - t[0]) / k;
      y1 = (c1[1] - t[1]) / k;

      console.info('okinawa ' + x1 + ' - ' + y1);
      */

    return (y >= -0.11056 && y < -0.02793 && x >= -0.141448 && x < -0.00305 ? hokkaido
        : y >= 0.041035 && y < 0.1134101 && x >= -0.10997 && x < 0.018914 ? okinawa
        : mainland).invert(coordinates);

  };



   conicEquidistantJapan.stream = function(stream) {
    var mainlandStream = mainland.stream(stream);
    var hokkaidoStream = hokkaido.stream(stream);
    var okinawaStream = okinawa.stream(stream);


    return {
      point: function(x, y) {
        mainlandStream.point(x, y);
        hokkaidoStream.point(x, y);
        okinawaStream.point(x, y);
      },
      sphere: function() {
        mainlandStream.sphere();
        hokkaidoStream.sphere();
        okinawaStream.sphere();
      },
      lineStart: function() {
        mainlandStream.lineStart();
        hokkaidoStream.lineStart();
        okinawaStream.lineStart();
      },
      lineEnd: function() {
        mainlandStream.lineEnd();
        hokkaidoStream.lineEnd();
        okinawaStream.lineEnd();
      },
      polygonStart: function() {
        mainlandStream.polygonStart();
        hokkaidoStream.polygonStart();
        okinawaStream.polygonStart();
      },
      polygonEnd: function() {
        mainlandStream.polygonEnd();
        hokkaidoStream.polygonEnd();
        okinawaStream.polygonEnd();
      }
    };
  };


  conicEquidistantJapan.precision = function(_) {
    if (!arguments.length) return mainland.precision();
    mainland.precision(_);
    hokkaido.precision(_);
    okinawa.precision(_);


    return conicEquidistantJapan;
  };

  conicEquidistantJapan.scale = function(_) {
    if (!arguments.length) return mainland.scale();

    mainland.scale(_);
    hokkaido.scale(_);
    okinawa.scale(_ * 0.7);

    return conicEquidistantJapan.translate(mainland.translate());
  };

  conicEquidistantJapan.translate = function(_) {

    if (!arguments.length) return mainland.translate();

    var k = mainland.scale(), x = +_[0], y = +_[1];

    /*

   var c0 = mainland(mainlandBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = mainland(mainlandBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Mainland: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = hokkaido(hokkaidoBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = hokkaido(hokkaidoBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Hokkaido: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = okinawa(okinawaBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = okinawa(okinawaBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Okinawa: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   */


   mainlandPoint = mainland
       .translate(_)
       .clipExtent([[x - 0.19 * k, y - 0.113 * k],[x + 0.0753 * k, y + 0.1026 * k]])
       .stream(pointStream).point;

   hokkaidoPoint = hokkaido
       .translate(_)
       .clipExtent([[x - 0.15 * k, y - 0.1103 * k],[x - 0.0031 * k, y - 0.0279 * k]])
       .stream(pointStream).point;

  okinawaPoint = okinawa
       .translate(_)
       .clipExtent([[x - 0.11 * k, y + 0.041 * k],[x + 0.0189 * k, y + 0.113 * k]])
       .stream(pointStream).point;

  return conicEquidistantJapan;
  };


  conicEquidistantJapan.getCompositionBorders = function() {

    var ul = mainland([130, 36.5]);
    var ur = mainland([135, 36]);
    var ur2 = mainland([138, 39.8]);
    var ll = mainland([132, 29.8]);
    var lm = mainland([134, 32]);
    var lr = mainland([139, 33.7]);
    var llr = mainland([139, 30.5]);




    return "M"+ul[0]+" "+ul[1]+"L"+ur[0]+" "+ul[1]+"L"+ur2[0]+" "+ur2[1]+
    "M"+ll[0]+" "+ll[1]+"L"+lm[0]+" "+lm[1]+"L"+lr[0]+" "+lr[1]+"L"+lr[0]+" "+llr[1];

 };


  return conicEquidistantJapan.scale(2228);
};

})();
