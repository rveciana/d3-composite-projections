(function() {
d3.geo.conicConformalSpain = function() {

  var iberianPeninsule = d3.geo.conicConformal()
  .center([-3, 40]);

  var canaryIslands = d3.geo.conicConformal()
  .center([-14.5, 28.5]);

  
  var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      iberianPeninsulePoint,
      canaryIslandsPoint;

  function conicConformalSpain(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    point = null;
    (iberianPeninsulePoint(x, y), point) || (canaryIslandsPoint(x, y), point);
    return point;
  }


conicConformalSpain.invert = function(coordinates) {

    var k = iberianPeninsule.scale(),
        t = iberianPeninsule.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;

        console.info(coordinates + " ---> scale: " + k + " trans: " + t + ": x = " + x + " y = " + y);
        //Trobar bé les coordenades!!!
    return (y >= .120 && y < .234 && x >= -.425 && x < -.214 ? canaryIslands
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


    var iberianPeninsuleBbox = [[-9.9921301043373, 48.119816258446754], [4.393178805228727, 34.02148129982776]];

    var canaryIslandsBbox = [[-12.22643614428382, 34.989324589964816], [-6.681087681832122, 33.712511769541585]];

    iberianPeninsulePoint = iberianPeninsule
        .translate(_)
        //.clipExtent([ [x - .455 * k, y - .238 * k], [x + .455 * k, y + .238 * k]])
        //.clipExtent([[410, 120], [570, 340]])
        //.clipExtent([ [x - .07 * k, y - .13 * k], [x + .09 * k, y + .09 * k]])
        .clipExtent([iberianPeninsule(iberianPeninsuleBbox[0]),iberianPeninsule(iberianPeninsuleBbox[1])])
        .stream(pointStream).point;

    console.info(iberianPeninsule(iberianPeninsuleBbox[0]));
    console.info(iberianPeninsule(iberianPeninsuleBbox[1]));
   /*
  300:
  [-9.9921301043373, 48.119816258446754] europe_proj.js:100
  [4.393178805228727, 34.02148129982776] 

[-12.22643614428382, 34.989324589964816] europe_proj.js:119
[-6.681087681832122, 33.712511769541585]  

  1000:
  [-9.992130104337303, 48.119816258446725] europe_proj.js:108
[4.393178805228724, 34.02148129982776]


[-12.226436144283818, 34.98932458996479] europe_proj.js:115
[-6.681087681832129, 33.712511769541585] 
   


    console.info(iberianPeninsule.invert([x - .07 * k, y - .13 * k]));
    console.info(iberianPeninsule.invert([x + .09 * k, y + .09 * k]));

    console.info('----');
    console.info(iberianPeninsule.invert([x - .116 * k, y + .068 * k]));
    console.info(iberianPeninsule.invert([x - .0488 * k, y + .0932 * k]));*/

    canaryIslandsPoint = canaryIslands
        .translate([x - .067 * k, y + .081 * k])
        //.clipExtent([[x - .455 * k, y - .238 * k], [x + .455 * k, y + .238 * k]])
        //.clipExtent([[190, 420], [358, 483]])
        //.clipExtent([[364, 318], [431, 368]])
        //.clipExtent([[x - .116 * k, y + .068 * k], [x - .0488 * k, y + .0932 * k]])
        .clipExtent([iberianPeninsule(canaryIslandsBbox[0]),iberianPeninsule(canaryIslandsBbox[1])])
        .stream(pointStream).point;

    return conicConformalSpain;
  };

  return conicConformalSpain.scale(300);
};

})();