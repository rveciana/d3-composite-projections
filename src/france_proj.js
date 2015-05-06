(function() {
d3.geo.conicConformalFrance = function() {

  var europe = d3.geo.conicConformal()
    .center([2.0, 45.0]);

  var guyane = d3.geo.mercator()
    .center([-53.2, 3.9]);

  var reunion = d3.geo.mercator()
      .center([55.52, -21.13]);

  var mayotte = d3.geo.mercator()
      .center([45.16, -12.8]);

  var martinique = d3.geo.mercator()
      .center([-61.03, 14.67]);

  var guadeloupe = d3.geo.mercator()
      .center([-61.46, 16.14]);

  var nouvelleCaledonie = d3.geo.mercator()
      .center([165.8, -21.07]);

  var polynesie = d3.geo.mercator()
      .center([-150.55, -17.11]);

  var wallisFutuna = d3.geo.mercator()
      .center([-178.1, -14.30]);

  var stPierreMichelon = d3.geo.mercator()
      .center([-56.23, 46.93]);

  var saintBarthlemy = d3.geo.mercator()
      .center([-62.85, 17.92]);



  var europeBbox = [[-9.9921301043373, 48.119816258446754], [4.393178805228727, 34.02148129982776]];
  var guyaneBbox = [[-54.5, 6.29], [-50.9, 1.48]];
  var reunionBbox = [[55.0088, -20.7228],[56.063449, -21.621723]];
  var mayotteBbox = [[44.9153, -12.594],[45.3602, -13.069]];
  var martiniqueBbox = [[-61.2968, 14.943],[-60.715, 14.321]];
  var guadeloupeBbox = [[-61.9634, 16.6034],[-60.7879, 15.722]];
  var nouvelleCaledonieBbox = [[163.1444, -19.3385],[168.286, -23.278]];
  var polynesieBbox = [[-152.0254, -16.2541],[-148.6856, -18.2893]];
  var wallisFutunaBbox = [[-178.2177, -14.2114],[-177.983, -14.3924]];
  var stPierreMichelonBbox = [[-56.517, 47.1969],[-56.0928, 46.7103]];
  var saintBarthlemyBbox = [[-62.915, 17.9758],[-62.7722, 17.8508]];


  var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      europePoint,
      guyanePoint,
      reunionPoint,
      mayottePoint,
      martiniquePoint,
      guadeloupePoint,
      nouvelleCaledoniePoint,
      polynesiePoint,
      wallisFutunaPoint,
      stPierreMichelonPoint,
      saintBarthlemyPoint;


  function conicConformalFrance(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    point = null;

    (europePoint(x, y), point) || (guyanePoint(x, y), point)
    || (reunionPoint(x, y), point) || (mayottePoint(x, y), point)
    || (martiniquePoint(x, y), point) || (guadeloupePoint(x, y), point)
    || (nouvelleCaledoniePoint(x, y), point) || (polynesiePoint(x, y), point)
    || (wallisFutunaPoint(x, y), point) || (stPierreMichelonPoint(x, y), point)
    || saintBarthlemyPoint(x, y);

    return point;
  }


conicConformalFrance.invert = function(coordinates) {

    var k = europe.scale(),
        t = europe.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;

      /*

      How are the return values calculated:
      var c0 = guyane(guyaneBbox[0]);
      x0 = (c0[0] - t[0]) / k;
      y0 = (c0[1] - t[1]) / k;

      console.info(x0 + ' - ' + y0);


      var c1 = guyane(guyaneBbox[1]);
      x1 = (c1[0] - t[0]) / k;
      y1 = (c1[1] - t[1]) / k;

      console.info(x1 + ' - ' + y1);
      */
    return (y >= 0.06440353 && y < 0.106509 && x >= -0.1247351 && x < -0.045924 ? guyane
        : europe).invert(coordinates);
  };


conicConformalFrance.stream = function(stream) {
    var europeStream = europe.stream(stream);
    var guyaneStream = guyane.stream(stream);
    var reunionStream = reunion.stream(stream);
    var mayotteStream = mayotte.stream(stream);
    var martiniqueStream = martinique.stream(stream);
    var guadeloupeStream = guadeloupe.stream(stream);
    var nouvelleCaledonieStream = nouvelleCaledonie.stream(stream);
    var polynesieStream = polynesie.stream(stream);
    var wallisFutunaStream = wallisFutuna.stream(stream);
    var stPierreMichelonStream = stPierreMichelon.stream(stream);
    var saintBarthlemyStream = saintBarthlemy.stream(stream);


    return {
      point: function(x, y) {
        europeStream.point(x, y);
        guyaneStream.point(x, y);
        reunionStream.point(x, y);
        mayotteStream.point(x, y);
        martiniqueStream.point(x, y);
        guadeloupeStream.point(x, y);
        nouvelleCaledonieStream.point(x, y);
        polynesieStream.point(x, y);
        wallisFutunaStream.point(x, y);
        stPierreMichelonStream.point(x, y);
        saintBarthlemyStream.point(x, y);

      },
      sphere: function() {
        europeStream.sphere();
        guyaneStream.sphere();
        reunionStream.sphere();
        mayotteStream.sphere();
        martiniqueStream.sphere();
        guadeloupeStream.sphere();
        nouvelleCaledonieStream.sphere();
        polynesieStream.sphere();
        wallisFutunaStream.sphere();
        stPierreMichelonStream.sphere();
        saintBarthlemyStream.sphere();
      },
      lineStart: function() {
        europeStream.lineStart();
        guyaneStream.lineStart();
        reunionStream.lineStart();
        mayotteStream.lineStart();
        martiniqueStream.lineStart();
        guadeloupeStream.lineStart();
        nouvelleCaledonieStream.lineStart();
        polynesieStream.lineStart();
        wallisFutunaStream.lineStart();
        stPierreMichelonStream.lineStart();
        saintBarthlemyStream.lineStart();
      },
      lineEnd: function() {
        europeStream.lineEnd();
        guyaneStream.lineEnd();
        reunionStream.lineEnd();
        mayotteStream.lineEnd();
        martiniqueStream.lineEnd();
        guadeloupeStream.lineEnd();
        nouvelleCaledonieStream.lineEnd();
        polynesieStream.lineEnd();
        wallisFutunaStream.lineEnd();
        stPierreMichelonStream.lineEnd();
        saintBarthlemyStream.lineEnd();
     },
      polygonStart: function() {
        europeStream.polygonStart();
        guyaneStream.polygonStart();
        reunionStream.polygonStart();
        mayotteStream.polygonStart();
        martiniqueStream.polygonStart();
        guadeloupeStream.polygonStart();
        nouvelleCaledonieStream.polygonStart();
        polynesieStream.polygonStart();
        wallisFutunaStream.polygonStart();
        stPierreMichelonStream.polygonStart();
        saintBarthlemyStream.polygonStart();
      },
      polygonEnd: function() {
        europeStream.polygonEnd();
        guyaneStream.polygonEnd();
        reunionStream.polygonEnd();
        mayotteStream.polygonEnd();
        martiniqueStream.polygonEnd();
        guadeloupeStream.polygonEnd();
        nouvelleCaledonieStream.polygonEnd();
        polynesieStream.polygonEnd();
        wallisFutunaStream.polygonEnd();
        stPierreMichelonStream.polygonEnd();
        saintBarthlemyStream.polygonEnd();
      }
    };
  };


  conicConformalFrance.precision = function(_) {
    if (!arguments.length) return europe.precision();
    europe.precision(_);
    guyane.precision(_);
    reunion.precision(_);
    mayotte.precision(_);
    martinique.precision(_);
    guadeloupe.precision(_);
    nouvelleCaledonie.precision(_);
    polynesie.precision(_);
    wallisFutuna.precision(_);
    stPierreMichelon.precision(_);
    saintBarthlemy.precision(_);

    return conicConformalFrance;
  };

  conicConformalFrance.scale = function(_) {
    if (!arguments.length) return europe.scale();

    europe.scale(_);
    guyane.scale(_* 0.35) ;
    reunion.scale(_ * 1.2);
    mayotte.scale(_ * 1.5);
    martinique.scale(_ * 1.5);
    guadeloupe.scale(_ * 1.2);
    nouvelleCaledonie.scale(_ * 0.3);
    polynesie.scale(_ * 0.6);
    wallisFutuna.scale(_ * 2.4);
    stPierreMichelon.scale(_ * 1.2);
    saintBarthlemy.scale(_ * 3.0);

    return conicConformalFrance.translate(europe.translate());
  };

  conicConformalFrance.translate = function(_) {
    if (!arguments.length) return europe.translate();

    var k = europe.scale(), x = +_[0], y = +_[1];

    /*
    //The composition is inspired by this map: http://coffeespoons.me/wp-content/uploads/2012/04/figaro-deptMap.png

    var c0 = europe(europeBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = europe(europeBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;


   console.info('Europe: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = guyane.translate([x + 0.015 * k, y + 0.06 * k])(guyaneBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = guyane.translate([x + 0.015 * k, y + 0.06 * k])(guyaneBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Guyane: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   var c0 = reunion.translate([x + 0.050 * k, y + 0.065 * k])(reunionBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = reunion.translate([x + 0.050 * k, y + 0.065 * k])(reunionBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Reunion: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);


   var c0 = mayotte.translate([x + 0.035 * k, y + 0.065 * k])(mayotteBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = mayotte.translate([x + 0.035 * k, y + 0.065 * k])(mayotteBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Mayotte: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);


   var c0 = martinique.translate([x - 0.01 * k, y + 0.065 * k])(martiniqueBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = martinique.translate([x - 0.01 * k, y + 0.065 * k])(martiniqueBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Martinique: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);

   var c0 = guadeloupe.translate([x - 0.03 * k, y + 0.065 * k])(guadeloupeBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = guadeloupe.translate([x - 0.03 * k, y + 0.065 * k])(guadeloupeBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Guadeloupe: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);

   var c0 = saintBarthlemy.translate([x - 0.05 * k, y + 0.065 * k])(saintBarthlemyBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = saintBarthlemy.translate([x - 0.05 * k, y + 0.065 * k])(saintBarthlemyBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('St Barthélemy: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);

   var c0 = nouvelleCaledonie.translate([x - 0.044 * k, y + 0.09 * k])(nouvelleCaledonieBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = nouvelleCaledonie.translate([x - 0.044 * k, y + 0.09 * k])(nouvelleCaledonieBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Nouvelle Calédonie: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);


   var c0 = polynesie.translate([x - 0.01 * k, y + 0.09 * k])(polynesieBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = polynesie.translate([x - 0.01 * k, y + 0.09 * k])(polynesieBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Polynesie: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);

   var c0 = wallisFutuna.translate([x + 0.025 * k, y + 0.095 * k])(wallisFutunaBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = wallisFutuna.translate([x + 0.025 * k, y + 0.095 * k])(wallisFutunaBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Wallis et Futuna: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);


   var c0 = stPierreMichelon.translate([x + 0.045 * k, y + 0.09 * k])(stPierreMichelonBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   var c1 = stPierreMichelon.translate([x + 0.045 * k, y + 0.09 * k])(stPierreMichelonBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('St Pierre et Michelon: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ', ' + y1);
   */

   europePoint = europe
       .translate(_)
       .clipExtent([[x - 0.08 * k, y - 0.13 * k],[x + 0.09 * k, y + 0.09 * k]])
       .stream(pointStream).point;


   reunionPoint = reunion
       .translate([x + 0.05 * k, y + 0.065 * k])
       .clipExtent([[x + 0.03929 * k, y + 0.05587 * k],[x + 0.06138 * k, y + 0.0760594 * k]])
       .stream(pointStream).point;

  mayottePoint = mayotte
       .translate([x + 0.035 * k, y + 0.065 * k])
       .clipExtent([[x + 0.02859 * k, y + 0.05947 * k],[x + 0.04024 * k, y + 0.0722257 * k]])
       .stream(pointStream).point;

   guyanePoint = guyane
       .translate([x + 0.015 * k, y + 0.06 * k])
       .clipExtent([[x + 0.007059 * k, y + 0.045341 * k],[x + 0.02905 * k, y + 0.0748 * k]])
       .stream(pointStream).point;


   martiniquePoint = martinique
      .translate([x - 0.01 * k, y + 0.065 * k])
      .clipExtent([[x - 0.01698 * k, y + 0.0576 * k],[x - 0.0017533 * k, y + 0.074437 * k]])
      .stream(pointStream).point;

  guadeloupePoint = guadeloupe
     .translate([x - 0.03 * k, y + 0.065 * k])
     .clipExtent([[x - 0.04054 * k, y + 0.054884 * k],[x - 0.01592 * k, y + 0.074104 * k]])
     .stream(pointStream).point;

 saintBarthlemyPoint = saintBarthlemy
     .translate([x - 0.05 * k, y + 0.065 * k])
     .clipExtent([[x - 0.053403 * k, y + 0.061929 * k],[x - 0.045926 * k, y + 0.068807 * k]])
     .stream(pointStream).point;

  nouvelleCaledoniePoint = nouvelleCaledonie
      .translate([x - 0.044 * k, y + 0.09 * k])
      .clipExtent([[x - 0.0579 * k, y + 0.080339 * k],[x - 0.0309833 * k, y + 0.102485 * k]])
      .stream(pointStream).point;

  polynesiePoint = polynesie
      .translate([x - 0.01 * k, y + 0.09 * k])
      .clipExtent([[x -0.02545 * k, y + 0.080643 * k],[x + 0.00952 * k, y + 0.1029635 * k]])
      .stream(pointStream).point;

  wallisFutunaPoint = wallisFutuna
      .translate([x + 0.025 * k, y + 0.095 * k])
      .clipExtent([[x + 0.02007 * k, y + 0.09117 * k],[x + 0.0299 * k, y + 0.098995 * k]])
      .stream(pointStream).point;

  stPierreMichelonPoint = stPierreMichelon
      .translate([x + 0.045 * k, y + 0.09 * k])
      .clipExtent([[x + 0.03899 * k, y + 0.08179 * k],[x + 0.04787 * k, y + 0.09672 * k]])
      .stream(pointStream).point;



  return conicConformalFrance;
  };


  conicConformalFrance.getCompositionBorders = function() {

    var ur = europe([7.1, 41.9]);
    var ul = europe([-3.1, 42.6]);
    var lr = europe([7.1, 39.8]);
    var llr = europe([7.1, 38.2]);
    var s1 = europe([-1.8, 39.8]);
    var s2 = europe([0.4, 39.8]);
    var s3 = europe([2.0, 39.8]);
    var s4 = europe([4.3, 39.8]);
    var s5 = europe([5.4, 39.8]);
    var s6 = europe([-0.5, 38.2]);
    var s7 = europe([2.9, 38.2]);
    var s8 = europe([4.7, 38.2]);


    return "M"+ur[0]+" "+ur[1]+"L"+ul[0]+" "+ur[1]
    +"M"+ur[0]+" "+lr[1]+"L"+ul[0]+" "+lr[1]
    +"M"+ur[0]+" "+llr[1]+"L"+ul[0]+" "+llr[1]
    +"M"+s1[0]+" "+lr[1]+"L"+s1[0]+" "+ur[1]
    +"M"+s2[0]+" "+lr[1]+"L"+s2[0]+" "+ur[1]
    +"M"+s3[0]+" "+lr[1]+"L"+s3[0]+" "+ur[1]
    +"M"+s4[0]+" "+lr[1]+"L"+s4[0]+" "+ur[1]
    +"M"+s5[0]+" "+lr[1]+"L"+s5[0]+" "+ur[1]
    +"M"+s6[0]+" "+llr[1]+"L"+s6[0]+" "+lr[1]
    +"M"+s7[0]+" "+llr[1]+"L"+s7[0]+" "+lr[1]
    +"M"+s8[0]+" "+llr[1]+"L"+s8[0]+" "+lr[1];

 };


  return conicConformalFrance.scale(2300);
};

})();
