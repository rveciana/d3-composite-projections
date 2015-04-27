(function() {
d3.geo.conicConformalSpain = function() {

  var iberianPeninsule = d3.geo.conicConformal()
  .center([-3, 40]);

  var canaryIslands = d3.geo.conicConformal()
  .center([-14.5, 28.5]);

  var iberianPeninsuleBbox = [[-9.9921301043373, 48.119816258446754], [4.393178805228727, 34.02148129982776]];
  var canaryIslandsBbox = [[-19.0, 29.0], [-12.7, 27.0]];



  var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      iberianPeninsulePoint,
      canaryIslandsPoint;

  function conicConformalSpain(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    point = null;

    (iberianPeninsulePoint(x, y), point) || canaryIslandsPoint(x, y);

    return point;
  }


conicConformalSpain.invert = function(coordinates) {

    var k = iberianPeninsule.scale(),
        t = iberianPeninsule.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;

        //console.info(coordinates + " ---> scale: " + k + " trans: " + t + ": x = " + x + " y = " + y);
        //Trobar bé les coordenades!!!
        /*
    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? canaryIslands
      : iberianPeninsule).invert(coordinates);*/
      console.info('-----ini---');
      console.info(coordinates); //console.info(canaryIslandsBbox);
      //console.info(x + ' - ' + y);
      console.info(canaryIslands(canaryIslandsBbox[0]) + ' - ' + canaryIslands(canaryIslandsBbox[1]));

      var c0 = canaryIslands(canaryIslandsBbox[0]);
      x0 = (c0[0] - t[0]) / k;
      y0 = (c0[1] - t[1]) / k;

      console.info(x0 + ' - ' + y0);


      var c1 = canaryIslands(canaryIslandsBbox[1]);
      x1 = (c1[0] - t[0]) / k;
      y1 = (c1[1] - t[1]) / k;

      console.info(x1 + ' - ' + y1);

      console.info('----fi----');

      if (y >= 0.0644035378075283 && y < 0.10650900059950263 && x >= -0.12473512280697115 && x < -0.045924257587065816)
        console.info("CANA")
    return (y >= 0.06440353 && y < 0.106509 && x >= -0.1247351 && x < -0.045924 ? canaryIslands
        : iberianPeninsule).invert(coordinates);
  };


conicConformalSpain.stream = function(stream) {
    var iberianPeninsuleStream = iberianPeninsule.stream(stream);
    var canaryIslandsStream = canaryIslands.stream(stream);
    return {
      point: function(x, y) {
        iberianPeninsuleStream.point(x, y);
        canaryIslandsStream.point(x, y);
      },
      sphere: function() {
        iberianPeninsuleStream.sphere();
        canaryIslandsStream.sphere();
      },
      lineStart: function() {
        iberianPeninsuleStream.lineStart();
        canaryIslandsStream.lineStart();
      },
      lineEnd: function() {
        iberianPeninsuleStream.lineEnd();
        canaryIslandsStream.lineEnd();
     },
      polygonStart: function() {
        iberianPeninsuleStream.polygonStart();
        canaryIslandsStream.polygonStart();
      },
      polygonEnd: function() {
        iberianPeninsuleStream.polygonEnd();
        canaryIslandsStream.polygonEnd();
      }
    };
  };


  conicConformalSpain.precision = function(_) {
    if (!arguments.length) return iberianPeninsule.precision();
    iberianPeninsule.precision(_);
    canaryIslandsPeninsule.precision(_);

    return conicConformalSpain;
  };

  conicConformalSpain.scale = function(_) {
    if (!arguments.length) return iberianPeninsule.scale();

    iberianPeninsule.scale(_);
    canaryIslands.scale(_);

    return conicConformalSpain.translate(iberianPeninsule.translate());
  };

  conicConformalSpain.translate = function(_) {
    if (!arguments.length) return iberianPeninsule.translate();

    var k = iberianPeninsule.scale(), x = +_[0], y = +_[1];


    iberianPeninsulePoint = iberianPeninsule
        .translate(_)
        .clipExtent([iberianPeninsule(iberianPeninsuleBbox[0]),iberianPeninsule(iberianPeninsuleBbox[1])])
        .stream(pointStream).point;

    canaryIslandsPoint = canaryIslands
        .translate([x - 0.067 * k, y + 0.081 * k])
        .clipExtent([canaryIslands(canaryIslandsBbox[0]),canaryIslands(canaryIslandsBbox[1])])
        .stream(pointStream).point;

    return conicConformalSpain;
  };
  conicConformalSpain.getCompositionBorders = function() {
   var ini = canaryIslands(canaryIslandsBbox[0]);
   var end = canaryIslands(canaryIslandsBbox[1]);
   var path = "M"+ini[0]+" "+ini[1]+"L"+end[0]+" "+ini[1]+"L"+end[0]+" "+(end[1]);
   return path;
 };


  return conicConformalSpain.scale(2500);
};



})();
