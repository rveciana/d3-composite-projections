(function() {


d3.geo.mercatorEcuador = function() {

  var mainland = d3.geo.mercator()
    .center([-76.7, 0]);

  var galapagos = d3.geo.mercator()
    .center([-88.5, -1.5]);

  var mainlandBbox = [[-81.5, 2.7], [-75.0, -6.0]];
  var galapagosBbox = [[-92.2, 0.58], [-88.8, -1.8]];

  var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      mainlandPoint,
      galapagosPoint;

  function mercatorEcuador(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    point = null;

    (mainlandPoint(x, y), point) || galapagosPoint(x, y);

    return point;
  }


mercatorEcuador.invert = function(coordinates) {
    var k = mainland.scale(),
        t = mainland.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;


      /*
      //How are the return values calculated:
      var c0 = galapagos(galapagosBbox[0]);
      x0 = (c0[0] - t[0]) / k;
      y0 = (c0[1] - t[1]) / k;

      console.info(x0 + ' - ' + y0);


      var c1 = galapagos(galapagosBbox[1]);
      x1 = (c1[0] - t[0]) / k;
      y1 = (c1[1] - t[1]) / k;

      console.info(x1 + ' - ' + y1);
      */


    return (y >= -0.031306 && y < 0.010238 && x >= -0.139577 && x < -0.080236 ? galapagos
        : mainland).invert(coordinates);
  };


mercatorEcuador.stream = function(stream) {
    var mainlandStream = mainland.stream(stream);
    var galapagosStream = galapagos.stream(stream);

    return {
      point: function(x, y) {
        mainlandStream.point(x, y);
        galapagosStream.point(x, y);
      },
      sphere: function() {
        mainlandStream.sphere();
        galapagosStream.sphere();
      },
      lineStart: function() {
        mainlandStream.lineStart();
        galapagosStream.lineStart();
      },
      lineEnd: function() {
        mainlandStream.lineEnd();
        galapagosStream.lineEnd();
     },
      polygonStart: function() {
        mainlandStream.polygonStart();
        galapagosStream.polygonStart();
      },
      polygonEnd: function() {
        mainlandStream.polygonEnd();
        galapagosStream.polygonEnd();
      }
    };
  };


  mercatorEcuador.precision = function(_) {
    if (!arguments.length) return mainland.precision();
    mainland.precision(_);
    galapagosPeninsule.precision(_);

    return mercatorEcuador;
  };

  mercatorEcuador.scale = function(_) {
    if (!arguments.length) return mainland.scale();

    mainland.scale(_);
    galapagos.scale(_);

    return mercatorEcuador.translate(mainland.translate());
  };

  mercatorEcuador.translate = function(_) {
    if (!arguments.length) return mainland.translate();

    var k = mainland.scale(), x = +_[0], y = +_[1];

   /*
   //How to calculate the fixed parameters
    var c0 = mainland.translate([x, y - 0.025 * k])(mainlandBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = mainland.translate([x, y - 0.025 * k])(mainlandBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('mainland: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = galapagos.translate([x - 0.075 * k, y - 0.02 * k])(galapagosBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = galapagos.translate([x - 0.075 * k, y - 0.02 * k])(galapagosBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('galapagos: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);
  */  
 
   mainlandPoint = mainland
       .translate([x, y - 0.025 * k])
       .clipExtent([[x - 0.0838 * k, y - 0.0721 * k],[x + 0.0297 * k, y + 0.0799 * k]])
       .stream(pointStream).point;

   galapagosPoint = galapagos
       .translate([x - 0.075 * k, y - 0.02 * k])
       .clipExtent([[x - 0.1396 * k, y - 0.0563 * k ],[x  - 0.0837 * k, y - 0.0147 * k]])
       .stream(pointStream).point;
   return mercatorEcuador;
  };


  mercatorEcuador.getCompositionBorders = function() {

    var ldgalapagos = mainland([-81.5, 1.8]);
    var ulgalapagos = mainland([-89, -0.6]);

    return "M"+ldgalapagos[0]+" "+ldgalapagos[1]+"L"+ldgalapagos[0]+" "+ulgalapagos[1]
    +"L"+ulgalapagos[0]+" "+ulgalapagos[1];

 };

  return mercatorEcuador.scale(3500);
};



})();
