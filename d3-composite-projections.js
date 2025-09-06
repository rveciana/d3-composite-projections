// http://geoexamples.com/d3-composite-projections/ v1.5.0 Copyright 2025 Roger Veciana i Rovira
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-geo'), require('d3-path')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3-geo', 'd3-path'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3 = global.d3 || {}, global.d3, global.d3));
})(this, (function (exports, d3Geo, d3Path) { 'use strict';

var epsilon = 1e-6;

function noop() {}

var x0 = Infinity,
    y0 = x0,
    x1 = -x0,
    y1 = x1;

var boundsStream = {
  point: boundsPoint,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop,
  result: function() {
    var bounds = [[x0, y0], [x1, y1]];
    x1 = y1 = -(y0 = x0 = Infinity);
    return bounds;
  }
};

function boundsPoint(x, y) {
  if (x < x0) x0 = x;
  if (x > x1) x1 = x;
  if (y < y0) y0 = y;
  if (y > y1) y1 = y;
}

function fitExtent(projection, extent, object) {
  var w = extent[1][0] - extent[0][0],
    h = extent[1][1] - extent[0][1],
    clip = projection.clipExtent && projection.clipExtent();

  projection.scale(150).translate([0, 0]);

  if (clip != null) projection.clipExtent(null);

  d3Geo.geoStream(object, projection.stream(boundsStream));

  var b = boundsStream.result(),
    k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
    x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
    y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;

  if (clip != null) projection.clipExtent(clip);

  return projection.scale(k * 150).translate([x, y]);
}

function fitSize(projection, size, object) {
  return fitExtent(projection, [[0, 0], size], object);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$d(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) streams[i].point(x, y);
    },
    sphere: function () {
      var i = -1;
      while (++i < n) streams[i].sphere();
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) streams[i].lineStart();
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) streams[i].lineEnd();
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) streams[i].polygonStart();
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) streams[i].polygonEnd();
    },
  };
}

// A composite projection for the United States, configured by default for
// 960×500. The projection also works quite well at 960×600 if you change the
// scale to 1285 and adjust the translate accordingly. The set of standard
// parallels for each region comes from USGS, which is published here:
// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
function albersUsa () {
  var cache,
    cacheStream,
    lower48 = d3Geo.geoAlbers(),
    lower48Point,
    alaska = d3Geo.geoConicEqualArea()
      .rotate([154, 0])
      .center([-2, 58.5])
      .parallels([55, 65]),
    alaskaPoint, // EPSG:3338
    hawaii = d3Geo.geoConicEqualArea()
      .rotate([157, 0])
      .center([-3, 19.9])
      .parallels([8, 18]),
    hawaiiPoint, // ESRI:102007
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  function albersUsa(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (lower48Point.point(x, y), point) ||
        (alaskaPoint.point(x, y), point) ||
        (hawaiiPoint.point(x, y), point)
    );
  }

  albersUsa.invert = function (coordinates) {
    var k = lower48.scale(),
      t = lower48.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;
    return (
      y >= 0.12 && y < 0.234 && x >= -0.425 && x < -0.214
        ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115
        ? hawaii
        : lower48
    ).invert(coordinates);
  };

  albersUsa.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$d([
          lower48.stream((cacheStream = stream)),
          alaska.stream(stream),
          hawaii.stream(stream),
        ]));
  };

  albersUsa.precision = function (_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_), alaska.precision(_), hawaii.precision(_);
    return reset();
  };

  albersUsa.scale = function (_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function (_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(),
      x = +_[0],
      y = +_[1];

    lower48Point = lower48
      .translate(_)
      .clipExtent([
        [x - 0.455 * k, y - 0.238 * k],
        [x + 0.455 * k, y + 0.238 * k],
      ])
      .stream(pointStream);

    alaskaPoint = alaska
      .translate([x - 0.307 * k, y + 0.201 * k])
      .clipExtent([
        [x - 0.425 * k + epsilon, y + 0.12 * k + epsilon],
        [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon],
      ])
      .stream(pointStream);

    hawaiiPoint = hawaii
      .translate([x - 0.205 * k, y + 0.212 * k])
      .clipExtent([
        [x - 0.214 * k + epsilon, y + 0.166 * k + epsilon],
        [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  albersUsa.fitExtent = function (extent, object) {
    return fitExtent(albersUsa, extent, object);
  };

  albersUsa.fitSize = function (size, object) {
    return fitSize(albersUsa, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return albersUsa;
  }

  albersUsa.drawCompositionBorders = function (context) {
    var hawaii1 = lower48([-102.91, 26.3]);
    var hawaii2 = lower48([-104, 27.5]);
    var hawaii3 = lower48([-108, 29.1]);
    var hawaii4 = lower48([-110, 29.1]);

    var alaska1 = lower48([-110, 26.7]);
    var alaska2 = lower48([-112.8, 27.6]);
    var alaska3 = lower48([-114.3, 30.6]);
    var alaska4 = lower48([-119.3, 30.1]);

    context.moveTo(hawaii1[0], hawaii1[1]);
    context.lineTo(hawaii2[0], hawaii2[1]);
    context.lineTo(hawaii3[0], hawaii3[1]);
    context.lineTo(hawaii4[0], hawaii4[1]);

    context.moveTo(alaska1[0], alaska1[1]);
    context.lineTo(alaska2[0], alaska2[1]);
    context.lineTo(alaska3[0], alaska3[1]);
    context.lineTo(alaska4[0], alaska4[1]);
  };
  albersUsa.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return albersUsa.scale(1070);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$c(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) streams[i].point(x, y);
    },
    sphere: function () {
      var i = -1;
      while (++i < n) streams[i].sphere();
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) streams[i].lineStart();
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) streams[i].lineEnd();
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) streams[i].polygonStart();
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) streams[i].polygonEnd();
    },
  };
}

// A composite projection for the United States, configured by default for
// 960×500. Also works quite well at 960×600 with scale 1285. The set of
// standard parallels for each region comes from USGS, which is published here:
// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
function albersUsaTerritories () {
  var cache,
    cacheStream,
    lower48 = d3Geo.geoAlbers(),
    lower48Point,
    alaska = d3Geo.geoConicEqualArea()
      .rotate([154, 0])
      .center([-2, 58.5])
      .parallels([55, 65]),
    alaskaPoint, // EPSG:3338
    hawaii = d3Geo.geoConicEqualArea()
      .rotate([157, 0])
      .center([-3, 19.9])
      .parallels([8, 18]),
    hawaiiPoint, // ESRI:102007
    puertoRico = d3Geo.geoConicEqualArea()
      .rotate([66, 0])
      .center([0, 18])
      .parallels([8, 18]),
    puertoRicoPoint, //Taken from https://bl.ocks.org/mbostock/5629120
    samoa = d3Geo.geoEquirectangular().rotate([173, 14]),
    samoaPoint, // EPSG:4169
    guam = d3Geo.geoEquirectangular().rotate([-145, -16.8]),
    guamPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  /*
      var puertoRicoBbox = [[-68.3, 19], [-63.9, 17]];
      var samoaBbox = [[-171, -14], [-168, -14.8]];
      var guamBbox = [[144, 20.8], [146.5, 12.7]];
      */

  function albersUsa(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];

    return (
      (point = null),
      (lower48Point.point(x, y), point) ||
        (alaskaPoint.point(x, y), point) ||
        (hawaiiPoint.point(x, y), point) ||
        (puertoRicoPoint.point(x, y), point) ||
        (samoaPoint.point(x, y), point) ||
        (guamPoint.point(x, y), point)
    );
  }

  albersUsa.invert = function (coordinates) {
    var k = lower48.scale(),
      t = lower48.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;
    /*
        //How are the return values calculated:
        console.info("******");
        var c0 = puertoRico(puertoRicoBbox[0]);
        var x0 = (c0[0] - t[0]) / k;
        var y0 = (c0[1] - t[1]) / k;

        console.info("p0 puertoRico", x0 + ' - ' + y0);

        var c1 = puertoRico(puertoRicoBbox[1]);
        var x1 = (c1[0] - t[0]) / k;
        var y1 = (c1[1] - t[1]) / k;

        console.info("p1 puertoRico", x1 + ' - ' + y1);

        c0 = samoa(samoaBbox[0]);
        x0 = (c0[0] - t[0]) / k;
        y0 = (c0[1] - t[1]) / k;

        console.info("p0 samoa", x0 + ' - ' + y0);

        c1 = samoa(samoaBbox[1]);
        x1 = (c1[0] - t[0]) / k;
        y1 = (c1[1] - t[1]) / k;

        console.info("p1 samoa", x1 + ' - ' + y1);

        c0 = guam(guamBbox[0]);
        x0 = (c0[0] - t[0]) / k;
        y0 = (c0[1] - t[1]) / k;

        console.info("p0 guam", x0 + ' - ' + y0);

        c1 = guam(guamBbox[1]);
        x1 = (c1[0] - t[0]) / k;
        y1 = (c1[1] - t[1]) / k;

        console.info("p1 guam", x1 + ' - ' + y1);
        */

    return (
      y >= 0.12 && y < 0.234 && x >= -0.425 && x < -0.214
        ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115
        ? hawaii
        : y >= 0.2064 && y < 0.2413 && x >= 0.312 && x < 0.385
        ? puertoRico
        : y >= 0.09 && y < 0.1197 && x >= -0.4243 && x < -0.3232
        ? samoa
        : y >= -0.0518 && y < 0.0895 && x >= -0.4243 && x < -0.3824
        ? guam
        : lower48
    ).invert(coordinates);
  };

  albersUsa.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$c([
          lower48.stream((cacheStream = stream)),
          alaska.stream(stream),
          hawaii.stream(stream),
          puertoRico.stream(stream),
          samoa.stream(stream),
          guam.stream(stream),
        ]));
  };

  albersUsa.precision = function (_) {
    if (!arguments.length) {
      return lower48.precision();
    }
    lower48.precision(_);
    alaska.precision(_);
    hawaii.precision(_);
    puertoRico.precision(_);
    samoa.precision(_);
    guam.precision(_);
    return reset();
  };

  albersUsa.scale = function (_) {
    if (!arguments.length) {
      return lower48.scale();
    }
    lower48.scale(_);
    alaska.scale(_ * 0.35);
    hawaii.scale(_);
    puertoRico.scale(_);
    samoa.scale(_ * 2);
    guam.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function (_) {
    if (!arguments.length) {
      return lower48.translate();
    }
    var k = lower48.scale(),
      x = +_[0],
      y = +_[1];

    /*
    var c0 = puertoRico.translate([x + 0.350 * k, y + 0.224 * k])(puertoRicoBbox[0]);
    var x0 = (x - c0[0]) / k;
    var y0 = (y - c0[1]) / k;

    var c1 = puertoRico.translate([x + 0.350 * k, y + 0.224 * k])(puertoRicoBbox[1]);
    var x1 = (x - c1[0]) / k;
    var y1 = (y - c1[1]) / k;

    console.info('puertoRico: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
    console.info('.clipExtent([[x '+
     (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
     ' * k + epsilon, y '+
     (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
     ' * k + epsilon],[x '+
     (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
     ' * k - epsilon, y '+
     (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
     ' * k - epsilon]])');

      c0 = samoa.translate([x - 0.492 * k, y + 0.09 * k])(samoaBbox[0]);
      x0 = (x - c0[0]) / k;
      y0 = (y - c0[1]) / k;

      c1 = samoa.translate([x - 0.492 * k, y + 0.09 * k])(samoaBbox[1]);
      x1 = (x - c1[0]) / k;
      y1 = (y - c1[1]) / k;

     console.info('samoa: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k + epsilon, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k + epsilon],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k - epsilon, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k - epsilon]])');

      c0 = guam.translate([x - 0.408 * k, y + 0.018 * k])(guamBbox[0]);
      x0 = (x - c0[0]) / k;
      y0 = (y - c0[1]) / k;

      c1 = guam.translate([x - 0.408 * k, y + 0.018 * k])(guamBbox[1]);
      x1 = (x - c1[0]) / k;
      y1 = (y - c1[1]) / k;

     console.info('guam: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k + epsilon, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k + epsilon],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k - epsilon, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k - epsilon]])');
      */

    lower48Point = lower48
      .translate(_)
      .clipExtent([
        [x - 0.455 * k, y - 0.238 * k],
        [x + 0.455 * k, y + 0.238 * k],
      ])
      .stream(pointStream);

    alaskaPoint = alaska
      .translate([x - 0.307 * k, y + 0.201 * k])
      .clipExtent([
        [x - 0.425 * k + epsilon, y + 0.12 * k + epsilon],
        [x - 0.214 * k - epsilon, y + 0.233 * k - epsilon],
      ])
      .stream(pointStream);

    hawaiiPoint = hawaii
      .translate([x - 0.205 * k, y + 0.212 * k])
      .clipExtent([
        [x - 0.214 * k + epsilon, y + 0.166 * k + epsilon],
        [x - 0.115 * k - epsilon, y + 0.233 * k - epsilon],
      ])
      .stream(pointStream);

    puertoRicoPoint = puertoRico
      .translate([x + 0.35 * k, y + 0.224 * k])
      .clipExtent([
        [x + 0.312 * k + epsilon, y + 0.2064 * k + epsilon],
        [x + 0.385 * k - epsilon, y + 0.233 * k - epsilon],
      ])
      .stream(pointStream);

    samoaPoint = samoa
      .translate([x - 0.492 * k, y + 0.09 * k])
      .clipExtent([
        [x - 0.4243 * k + epsilon, y + 0.0903 * k + epsilon],
        [x - 0.3233 * k - epsilon, y + 0.1197 * k - epsilon],
      ])
      .stream(pointStream);

    guamPoint = guam
      .translate([x - 0.408 * k, y + 0.018 * k])
      .clipExtent([
        [x - 0.4244 * k + epsilon, y - 0.0519 * k + epsilon],
        [x - 0.3824 * k - epsilon, y + 0.0895 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  albersUsa.fitExtent = function (extent, object) {
    return fitExtent(albersUsa, extent, object);
  };

  albersUsa.fitSize = function (size, object) {
    return fitSize(albersUsa, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return albersUsa;
  }

  albersUsa.drawCompositionBorders = function (context) {
    /*
    console.info("CLIP EXTENT hawaii: ", hawaii.clipExtent());
    console.info("UL BBOX:", lower48.invert([hawaii.clipExtent()[0][0], hawaii.clipExtent()[0][1]]));
    console.info("UR BBOX:", lower48.invert([hawaii.clipExtent()[1][0], hawaii.clipExtent()[0][1]]));
    console.info("LD BBOX:", lower48.invert([hawaii.clipExtent()[1][0], hawaii.clipExtent()[1][1]]));
    console.info("LL BBOX:", lower48.invert([hawaii.clipExtent()[0][0], hawaii.clipExtent()[1][1]]));

    console.info("CLIP EXTENT alaska: ", alaska.clipExtent());
    console.info("UL BBOX:", lower48.invert([alaska.clipExtent()[0][0], alaska.clipExtent()[0][1]]));
    console.info("UR BBOX:", lower48.invert([alaska.clipExtent()[1][0], alaska.clipExtent()[0][1]]));
    console.info("LD BBOX:", lower48.invert([alaska.clipExtent()[1][0], alaska.clipExtent()[1][1]]));
    console.info("LL BBOX:", lower48.invert([alaska.clipExtent()[0][0], alaska.clipExtent()[1][1]]));

    console.info("CLIP EXTENT puertoRico: ", puertoRico.clipExtent());
    console.info("UL BBOX:", lower48.invert([puertoRico.clipExtent()[0][0], puertoRico.clipExtent()[0][1]]));
    console.info("UR BBOX:", lower48.invert([puertoRico.clipExtent()[1][0], puertoRico.clipExtent()[0][1]]));
    console.info("LD BBOX:", lower48.invert([puertoRico.clipExtent()[1][0], puertoRico.clipExtent()[1][1]]));
    console.info("LL BBOX:", lower48.invert([puertoRico.clipExtent()[0][0], puertoRico.clipExtent()[1][1]]));

    console.info("CLIP EXTENT samoa: ", samoa.clipExtent());
    console.info("UL BBOX:", lower48.invert([samoa.clipExtent()[0][0], samoa.clipExtent()[0][1]]));
    console.info("UR BBOX:", lower48.invert([samoa.clipExtent()[1][0], samoa.clipExtent()[0][1]]));
    console.info("LD BBOX:", lower48.invert([samoa.clipExtent()[1][0], samoa.clipExtent()[1][1]]));
    console.info("LL BBOX:", lower48.invert([samoa.clipExtent()[0][0], samoa.clipExtent()[1][1]]));


    console.info("CLIP EXTENT guam: ", guam.clipExtent());
    console.info("UL BBOX:", lower48.invert([guam.clipExtent()[0][0], guam.clipExtent()[0][1]]));
    console.info("UR BBOX:", lower48.invert([guam.clipExtent()[1][0], guam.clipExtent()[0][1]]));
    console.info("LD BBOX:", lower48.invert([guam.clipExtent()[1][0], guam.clipExtent()[1][1]]));
    console.info("LL BBOX:", lower48.invert([guam.clipExtent()[0][0], guam.clipExtent()[1][1]]));
    */

    var ulhawaii = lower48([-110.4641, 28.2805]);
    var urhawaii = lower48([-104.0597, 28.9528]);
    var ldhawaii = lower48([-103.7049, 25.1031]);
    var llhawaii = lower48([-109.8337, 24.4531]);

    var ulalaska = lower48([-124.4745, 28.1407]);
    var uralaska = lower48([-110.931, 30.8844]);
    var ldalaska = lower48([-109.8337, 24.4531]);
    var llalaska = lower48([-122.4628, 21.8562]);

    var ulpuertoRico = lower48([-76.8579, 25.1544]);
    var urpuertoRico = lower48([-72.429, 24.2097]);
    var ldpuertoRico = lower48([-72.8265, 22.7056]);
    var llpuertoRico = lower48([-77.1852, 23.6392]);

    var ulsamoa = lower48([-125.0093, 29.7791]);
    var ursamoa = lower48([-118.5193, 31.3262]);
    var ldsamoa = lower48([-118.064, 29.6912]);
    var llsamoa = lower48([-124.4369, 28.169]);

    var ulguam = lower48([-128.1314, 37.4582]);
    var urguam = lower48([-125.2132, 38.214]);
    var ldguam = lower48([-122.3616, 30.5115]);
    var llguam = lower48([-125.0315, 29.8211]);

    context.moveTo(ulhawaii[0], ulhawaii[1]);
    context.lineTo(urhawaii[0], urhawaii[1]);
    context.lineTo(ldhawaii[0], ldhawaii[1]);
    context.lineTo(ldhawaii[0], ldhawaii[1]);
    context.lineTo(llhawaii[0], llhawaii[1]);
    context.closePath();

    context.moveTo(ulalaska[0], ulalaska[1]);
    context.lineTo(uralaska[0], uralaska[1]);
    context.lineTo(ldalaska[0], ldalaska[1]);
    context.lineTo(ldalaska[0], ldalaska[1]);
    context.lineTo(llalaska[0], llalaska[1]);
    context.closePath();

    context.moveTo(ulpuertoRico[0], ulpuertoRico[1]);
    context.lineTo(urpuertoRico[0], urpuertoRico[1]);
    context.lineTo(ldpuertoRico[0], ldpuertoRico[1]);
    context.lineTo(ldpuertoRico[0], ldpuertoRico[1]);
    context.lineTo(llpuertoRico[0], llpuertoRico[1]);
    context.closePath();

    context.moveTo(ulsamoa[0], ulsamoa[1]);
    context.lineTo(ursamoa[0], ursamoa[1]);
    context.lineTo(ldsamoa[0], ldsamoa[1]);
    context.lineTo(ldsamoa[0], ldsamoa[1]);
    context.lineTo(llsamoa[0], llsamoa[1]);
    context.closePath();

    context.moveTo(ulguam[0], ulguam[1]);
    context.lineTo(urguam[0], urguam[1]);
    context.lineTo(ldguam[0], ldguam[1]);
    context.lineTo(ldguam[0], ldguam[1]);
    context.lineTo(llguam[0], llguam[1]);
    context.closePath();
  };
  albersUsa.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return albersUsa.scale(1070);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$b(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for Spain, configured by default for 960×500.
function conicConformalSpain () {
  var cache,
    cacheStream,
    iberianPeninsule = d3Geo.geoConicConformal().rotate([5, -38.6]).parallels([0, 60]),
    iberianPeninsulePoint,
    canaryIslands = d3Geo.geoConicConformal().rotate([5, -38.6]).parallels([0, 60]),
    canaryIslandsPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  /*
      var iberianPeninsuleBbox = [[-11, 46], [4, 35]];
      var canaryIslandsBbox = [[-19.0, 28.85], [-12.7, 28.1]];
      */

  function conicConformalSpain(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (iberianPeninsulePoint.point(x, y), point) ||
        (canaryIslandsPoint.point(x, y), point)
    );
  }

  conicConformalSpain.invert = function (coordinates) {
    var k = iberianPeninsule.scale(),
      t = iberianPeninsule.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;

    return (
      y >= 0.05346 && y < 0.0897 && x >= -0.13388 && x < -0.0322
        ? canaryIslands
        : iberianPeninsule
    ).invert(coordinates);
  };

  conicConformalSpain.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$b([
          iberianPeninsule.stream((cacheStream = stream)),
          canaryIslands.stream(stream),
        ]));
  };

  conicConformalSpain.precision = function (_) {
    if (!arguments.length) {
      return iberianPeninsule.precision();
    }
    iberianPeninsule.precision(_);
    canaryIslands.precision(_);
    return reset();
  };

  conicConformalSpain.scale = function (_) {
    if (!arguments.length) {
      return iberianPeninsule.scale();
    }
    iberianPeninsule.scale(_);
    canaryIslands.scale(_);
    return conicConformalSpain.translate(iberianPeninsule.translate());
  };

  conicConformalSpain.translate = function (_) {
    if (!arguments.length) {
      return iberianPeninsule.translate();
    }
    var k = iberianPeninsule.scale(),
      x = +_[0],
      y = +_[1];
    /*
    var c0 = iberianPeninsule(iberianPeninsuleBbox[0]);
   var x0 = (x - c0[0]) / k;
   var y0 = (y - c0[1]) / k;

   var c1 = iberianPeninsule(iberianPeninsuleBbox[1]);
   var x1 = (x - c1[0]) / k;
   var y1 = (y - c1[1]) / k;

   console.info('Iberian Peninsula: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

   c0 = canaryIslands.translate([x + 0.1 * k, y - 0.094 * k])(canaryIslandsBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   c1 = canaryIslands.translate([x + 0.1 * k, y - 0.094 * k])(canaryIslandsBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Canry Islands: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   */
    iberianPeninsulePoint = iberianPeninsule
      .translate(_)
      .clipExtent([
        [x - 0.06857 * k, y - 0.1288 * k],
        [x + 0.13249 * k, y + 0.06 * k],
      ])
      .stream(pointStream);

    canaryIslandsPoint = canaryIslands
      .translate([x + 0.1 * k, y - 0.094 * k])
      .clipExtent([
        [x - 0.1331 * k + epsilon, y + 0.053457 * k + epsilon],
        [x - 0.0354 * k - epsilon, y + 0.08969 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  conicConformalSpain.fitExtent = function (extent, object) {
    return fitExtent(conicConformalSpain, extent, object);
  };

  conicConformalSpain.fitSize = function (size, object) {
    return fitSize(conicConformalSpain, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return conicConformalSpain;
  }

  conicConformalSpain.drawCompositionBorders = function (context) {
    /*
    console.info("CLIP EXTENT: ", canaryIslands.clipExtent());
    console.info("UL BBOX:", iberianPeninsule.invert([canaryIslands.clipExtent()[0][0], canaryIslands.clipExtent()[0][1]]));
    console.info("UR BBOX:", iberianPeninsule.invert([canaryIslands.clipExtent()[1][0], canaryIslands.clipExtent()[0][1]]));
    console.info("LD BBOX:", iberianPeninsule.invert([canaryIslands.clipExtent()[1][0], canaryIslands.clipExtent()[1][1]]));
    */

    var ulCanaryIslands = iberianPeninsule([-14.034675, 34.965007]);
    var urCanaryIslands = iberianPeninsule([-7.4208899, 35.536988]);
    var ldCanaryIslands = iberianPeninsule([-7.3148275, 33.54359]);

    context.moveTo(ulCanaryIslands[0], ulCanaryIslands[1]);
    context.lineTo(urCanaryIslands[0], urCanaryIslands[1]);
    context.lineTo(ldCanaryIslands[0], ldCanaryIslands[1]);
  };
  conicConformalSpain.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return conicConformalSpain.scale(2700);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$a(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for Portugal, configured by default for 960×500.
function conicConformalPortugal () {
  var cache,
    cacheStream,
    iberianPeninsule = d3Geo.geoConicConformal().rotate([10, -39.3]).parallels([0, 60]),
    iberianPeninsulePoint,
    madeira = d3Geo.geoConicConformal().rotate([17, -32.7]).parallels([0, 60]),
    madeiraPoint,
    azores = d3Geo.geoConicConformal().rotate([27.8, -38.6]).parallels([0, 60]),
    azoresPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  /*
      var iberianPeninsuleBbox = [[-11, 46], [4, 34]];
      var madeiraBbox = [[-17.85, 33.6], [-16, 32.02]];
      var azoresBbox = [[-32, 40.529], [-23.98, 35.75]];
      */

  function conicConformalPortugal(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (iberianPeninsulePoint.point(x, y), point) ||
        (madeiraPoint.point(x, y), point) ||
        (azoresPoint.point(x, y), point)
    );
  }

  conicConformalPortugal.invert = function (coordinates) {
    var k = iberianPeninsule.scale(),
      t = iberianPeninsule.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;

    /*
        //How are the return values calculated:
        console.info("******");
        var c0 = madeira(madeiraBbox[0]);
        var x0 = (c0[0] - t[0]) / k;
        var y0 = (c0[1] - t[1]) / k;

        console.info("p0 madeira", x0 + ' - ' + y0);

        var c1 = madeira(madeiraBbox[1]);
        var x1 = (c1[0] - t[0]) / k;
        var y1 = (c1[1] - t[1]) / k;

        console.info("p1 madeira", x1 + ' - ' + y1);

        c0 = azores(azoresBbox[0]);
        x0 = (c0[0] - t[0]) / k;
        y0 = (c0[1] - t[1]) / k;

        console.info("p0 azores", x0 + ' - ' + y0);

        c1 = azores(azoresBbox[1]);
        x1 = (c1[0] - t[0]) / k;
        y1 = (c1[1] - t[1]) / k;

        console.info("p1 azores", x1 + ' - ' + y1);
        */

    return (
      y >= 0.0093 && y < 0.03678 && x >= -0.03875 && x < -0.0116
        ? madeira
        : y >= -0.0412 && y < 0.0091 && x >= -0.07782 && x < -0.01166
        ? azores
        : iberianPeninsule
    ).invert(coordinates);
  };

  conicConformalPortugal.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$a([
          iberianPeninsule.stream((cacheStream = stream)),
          madeira.stream(stream),
          azores.stream(stream),
        ]));
  };

  conicConformalPortugal.precision = function (_) {
    if (!arguments.length) {
      return iberianPeninsule.precision();
    }
    iberianPeninsule.precision(_);
    madeira.precision(_);
    azores.precision(_);
    return reset();
  };

  conicConformalPortugal.scale = function (_) {
    if (!arguments.length) {
      return iberianPeninsule.scale();
    }
    iberianPeninsule.scale(_);
    madeira.scale(_);
    azores.scale(_ * 0.6);
    return conicConformalPortugal.translate(iberianPeninsule.translate());
  };

  conicConformalPortugal.translate = function (_) {
    if (!arguments.length) {
      return iberianPeninsule.translate();
    }
    var k = iberianPeninsule.scale(),
      x = +_[0],
      y = +_[1];
    /*
    var c0 = iberianPeninsule(iberianPeninsuleBbox[0]);
   var x0 = (x - c0[0]) / k;
   var y0 = (y - c0[1]) / k;

   var c1 = iberianPeninsule(iberianPeninsuleBbox[1]);
   var x1 = (x - c1[0]) / k;
   var y1 = (y - c1[1]) / k;

   console.info('Iberian Peninsula: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   console.info('.clipExtent([[x '+
    (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
    ' * k, y '+
    (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
    ' * k],[x '+
    (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
    ' * k, y '+
    (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
    ' * k]])');

   c0 = madeira.translate([x - 0.0265 * k, y + 0.025 * k])(madeiraBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   c1 = madeira.translate([x - 0.0265 * k, y + 0.025 * k])(madeiraBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('Madeira: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   console.info('.clipExtent([[x '+
    (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
    ' * k + epsilon, y '+
    (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
    ' * k + epsilon],[x '+
    (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
    ' * k - epsilon, y '+
    (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
    ' * k - epsilon]])');

    c0 = azores.translate([x - 0.045 * k, y + -0.02 * k])(azoresBbox[0]);
    x0 = (x - c0[0]) / k;
    y0 = (y - c0[1]) / k;

    c1 = azores.translate([x - 0.045 * k, y + -0.02 * k])(azoresBbox[1]);
    x1 = (x - c1[0]) / k;
    y1 = (y - c1[1]) / k;

    console.info('Azores: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
    console.info('.clipExtent([[x '+
     (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
     ' * k + epsilon, y '+
     (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
     ' * k + epsilon],[x '+
     (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
     ' * k - epsilon, y '+
     (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
     ' * k - epsilon]])');
     */
    iberianPeninsulePoint = iberianPeninsule
      .translate(_)
      .clipExtent([
        [x - 0.0115 * k, y - 0.1138 * k],
        [x + 0.2105 * k, y + 0.0673 * k],
      ])
      .stream(pointStream);

    madeiraPoint = madeira
      .translate([x - 0.0265 * k, y + 0.025 * k])
      .clipExtent([
        [x - 0.0388 * k + epsilon, y + 0.0093 * k + epsilon],
        [x - 0.0116 * k - epsilon, y + 0.0368 * k - epsilon],
      ])
      .stream(pointStream);

    azoresPoint = azores
      .translate([x - 0.045 * k, y + -0.02 * k])
      .clipExtent([
        [x - 0.0778 * k + epsilon, y - 0.0413 * k + epsilon],
        [x - 0.0117 * k - epsilon, y + 0.0091 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  conicConformalPortugal.fitExtent = function (extent, object) {
    return fitExtent(conicConformalPortugal, extent, object);
  };

  conicConformalPortugal.fitSize = function (size, object) {
    return fitSize(conicConformalPortugal, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return conicConformalPortugal;
  }

  conicConformalPortugal.drawCompositionBorders = function (context) {
    /*
    console.info("CLIP EXTENT MADEIRA: ", madeira.clipExtent());
    console.info("UL BBOX:", iberianPeninsule.invert([madeira.clipExtent()[0][0], madeira.clipExtent()[0][1]]));
    console.info("UR BBOX:", iberianPeninsule.invert([madeira.clipExtent()[1][0], madeira.clipExtent()[0][1]]));
    console.info("LD BBOX:", iberianPeninsule.invert([madeira.clipExtent()[1][0], madeira.clipExtent()[1][1]]));
    console.info("LL BBOX:", iberianPeninsule.invert([madeira.clipExtent()[0][0], madeira.clipExtent()[1][1]]));

    console.info("CLIP EXTENT AZORES: ", azores.clipExtent());
    console.info("UL BBOX:", iberianPeninsule.invert([azores.clipExtent()[0][0], azores.clipExtent()[0][1]]));
    console.info("UR BBOX:", iberianPeninsule.invert([azores.clipExtent()[1][0], azores.clipExtent()[0][1]]));
    console.info("LD BBOX:", iberianPeninsule.invert([azores.clipExtent()[1][0], azores.clipExtent()[1][1]]));
    console.info("LL BBOX:", iberianPeninsule.invert([azores.clipExtent()[0][0], azores.clipExtent()[1][1]]));
    */

    var ulmadeira = iberianPeninsule([-12.8351, 38.7113]);
    var urmadeira = iberianPeninsule([-10.8482, 38.7633]);
    var ldmadeira = iberianPeninsule([-10.8181, 37.2072]);
    var llmadeira = iberianPeninsule([-12.7345, 37.1573]);

    var ulazores = iberianPeninsule([-16.0753, 41.4436]);
    var urazores = iberianPeninsule([-10.9168, 41.6861]);
    var ldazores = iberianPeninsule([-10.8557, 38.7747]);
    var llazores = iberianPeninsule([-15.6728, 38.5505]);

    context.moveTo(ulmadeira[0], ulmadeira[1]);
    context.lineTo(urmadeira[0], urmadeira[1]);
    context.lineTo(ldmadeira[0], ldmadeira[1]);
    context.lineTo(ldmadeira[0], ldmadeira[1]);
    context.lineTo(llmadeira[0], llmadeira[1]);
    context.closePath();

    context.moveTo(ulazores[0], ulazores[1]);
    context.lineTo(urazores[0], urazores[1]);
    context.lineTo(ldazores[0], ldazores[1]);
    context.lineTo(ldazores[0], ldazores[1]);
    context.lineTo(llazores[0], llazores[1]);
    context.closePath();
  };
  conicConformalPortugal.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return conicConformalPortugal.scale(4200);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$9(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for Ecuador, configured by default for 960×500.
function mercatorEcuador () {
  var cache,
    cacheStream,
    mainland = d3Geo.geoMercator().rotate([80, 1.5]),
    mainlandPoint,
    galapagos = d3Geo.geoMercator().rotate([90.73, 1]),
    galapagosPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  /*
      var mainlandBbox = [[-81.5, 2.7], [-70.0, -6.0]];
      var galapagosBbox = [[-92.2, 0.58], [-88.8, -1.8]];
      */

  function mercatorEcuador(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (mainlandPoint.point(x, y), point) || (galapagosPoint.point(x, y), point)
    );
  }

  mercatorEcuador.invert = function (coordinates) {
    var k = mainland.scale(),
      t = mainland.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;
    /*
        //How are the return values calculated:
        var c0 = galapagos(galapagosBbox[0]);
        var x0 = (c0[0] - t[0]) / k;
        var y0 = (c0[1] - t[1]) / k;

        console.info("p0 galapagos", x0 + ' - ' + y0);


        var c1 = galapagos(galapagosBbox[1]);
        var x1 = (c1[0] - t[0]) / k;
        var y1 = (c1[1] - t[1]) / k;

        console.info("p1 galapagos", x1 + ' - ' + y1);
        */
    return (
      y >= -0.0676 && y < -0.026 && x >= -0.0857 && x < -0.0263
        ? galapagos
        : mainland
    ).invert(coordinates);
  };

  mercatorEcuador.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$9([
          mainland.stream((cacheStream = stream)),
          galapagos.stream(stream),
        ]));
  };

  mercatorEcuador.precision = function (_) {
    if (!arguments.length) {
      return mainland.precision();
    }
    mainland.precision(_);
    galapagos.precision(_);
    return reset();
  };

  mercatorEcuador.scale = function (_) {
    if (!arguments.length) {
      return mainland.scale();
    }
    mainland.scale(_);
    galapagos.scale(_);
    return mercatorEcuador.translate(mainland.translate());
  };

  mercatorEcuador.translate = function (_) {
    if (!arguments.length) {
      return mainland.translate();
    }
    var k = mainland.scale(),
      x = +_[0],
      y = +_[1];
    /*
    var c0 = mainland(mainlandBbox[0]);
   var x0 = (x - c0[0]) / k;
   var y0 = (y - c0[1]) / k;

   var c1 = mainland(mainlandBbox[1]);
   var x1 = (x - c1[0]) / k;
   var y1 = (y - c1[1]) / k;

   console.info('mainland: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   console.info('.clipExtent([[x '+
    (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
    ' * k, y '+
    (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
    ' * k],[x '+
    (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
    ' * k, y '+
    (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
    ' * k]])');

   c0 = galapagos.translate([x - 0.06 * k, y - 0.04 * k])(galapagosBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   c1 = galapagos.translate([x - 0.06 * k, y - 0.04 * k])(galapagosBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('galapagos: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   console.info('.clipExtent([[x '+
    (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
    ' * k + epsilon, y '+
    (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
    ' * k + epsilon],[x '+
    (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
    ' * k - epsilon, y '+
    (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
    ' * k - epsilon]])');*/

    mainlandPoint = mainland
      .translate(_)
      .clipExtent([
        [x - 0.0262 * k, y - 0.0734 * k],
        [x + 0.1741 * k, y + 0.079 * k],
      ])
      .stream(pointStream);

    galapagosPoint = galapagos
      .translate([x - 0.06 * k, y - 0.04 * k])
      .clipExtent([
        [x - 0.0857 * k + epsilon, y - 0.0676 * k + epsilon],
        [x - 0.0263 * k - epsilon, y - 0.026 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  mercatorEcuador.fitExtent = function (extent, object) {
    return fitExtent(mercatorEcuador, extent, object);
  };

  mercatorEcuador.fitSize = function (size, object) {
    return fitSize(mercatorEcuador, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return mercatorEcuador;
  }

  mercatorEcuador.drawCompositionBorders = function (context) {
    /*
    console.info("CLIP EXTENT: ", galapagos.clipExtent());
    console.info("UL BBOX:", mainland.invert([galapagos.clipExtent()[0][0], galapagos.clipExtent()[0][1]]));
    console.info("UR BBOX:", mainland.invert([galapagos.clipExtent()[1][0], galapagos.clipExtent()[0][1]]));
    console.info("LD BBOX:", mainland.invert([galapagos.clipExtent()[1][0], galapagos.clipExtent()[1][1]]));
    console.info("LL BBOX:", mainland.invert([galapagos.clipExtent()[0][0], galapagos.clipExtent()[1][1]]));
    */

    var ulgalapagos = mainland([-84.9032, 2.3757]);
    var urgalapagos = mainland([-81.5047, 2.3708]);
    var ldgalapagos = mainland([-81.5063, -0.01]);
    var llgalapagos = mainland([-84.9086, -5e-3]);

    context.moveTo(ulgalapagos[0], ulgalapagos[1]);
    context.lineTo(urgalapagos[0], urgalapagos[1]);
    context.lineTo(ldgalapagos[0], ldgalapagos[1]);
    context.lineTo(llgalapagos[0], llgalapagos[1]);
    context.closePath();
  };
  mercatorEcuador.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return mercatorEcuador.scale(3500);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$8(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for Chile, configured by default for 960×500.
function transverseMercatorChile () {
  var cache,
    cacheStream,
    mainland = d3Geo.geoTransverseMercator().rotate([72, 37]),
    mainlandPoint,
    antarctic = d3Geo.geoStereographic().rotate([72, 0]),
    antarcticPoint,
    juanFernandez = d3Geo.geoMercator().rotate([80, 33.5]),
    juanFernandezPoint,
    pascua = d3Geo.geoMercator().rotate([110, 25]),
    pascuaPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  /*
    var mainlandBbox = [[-75.5, -15.0], [-32, -49.0]];
    var antarcticBbox = [[-91.0, -60.0], [-43.0, -90.0]];
    var juanFernandezBbox = [[-81.0, -33.0], [-78.5, -34.0]];
    var pascuaBbox = [[-110, -26.6], [-108.7, -27.5]];
    */

  function transverseMercatorChile(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (mainlandPoint.point(x, y), point) ||
        (antarcticPoint.point(x, y), point) ||
        (juanFernandezPoint.point(x, y), point) ||
        (pascuaPoint.point(x, y), point)
    );
  }

  transverseMercatorChile.invert = function (coordinates) {
    var k = mainland.scale(),
      t = mainland.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;

    /*
        //How are the return values calculated:
        console.info("******");
        var c0 = antarctic(antarcticBbox[0]);
        var x0 = (c0[0] - t[0]) / k;
        var y0 = (c0[1] - t[1]) / k;

        console.info("p0 antarctic", x0 + ' - ' + y0);

        var c1 = antarctic(antarcticBbox[1]);
        var x1 = (c1[0] - t[0]) / k;
        var y1 = (c1[1] - t[1]) / k;

        console.info("p1 antarctic", x1 + ' - ' + y1);

        c0 = juanFernandez(juanFernandezBbox[0]);
        x0 = (c0[0] - t[0]) / k;
        y0 = (c0[1] - t[1]) / k;

        console.info("p0 juanFernandez", x0 + ' - ' + y0);

        c1 = juanFernandez(juanFernandezBbox[1]);
        x1 = (c1[0] - t[0]) / k;
        y1 = (c1[1] - t[1]) / k;

        console.info("p1 juanFernandez", x1 + ' - ' + y1);

        c0 = pascua(pascuaBbox[0]);
        x0 = (c0[0] - t[0]) / k;
        y0 = (c0[1] - t[1]) / k;

        console.info("p0 pascua", x0 + ' - ' + y0);

        c1 = pascua(pascuaBbox[1]);
        x1 = (c1[0] - t[0]) / k;
        y1 = (c1[1] - t[1]) / k;

        console.info("p1 pascua", x1 + ' - ' + y1);
        */

    return (
      y >= 0.2582 && y < 0.32 && x >= -0.1036 && x < -0.087
        ? antarctic
        : y >= -0.01298 && y < 0.0133 && x >= -0.11396 && x < -0.05944
        ? juanFernandez
        : y >= 0.01539 && y < 0.03911 && x >= -0.089 && x < -0.0588
        ? pascua
        : mainland
    ).invert(coordinates);
  };

  transverseMercatorChile.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$8([
          mainland.stream((cacheStream = stream)),
          antarctic.stream(stream),
          juanFernandez.stream(stream),
          pascua.stream(stream),
        ]));
  };

  transverseMercatorChile.precision = function (_) {
    if (!arguments.length) {
      return mainland.precision();
    }
    mainland.precision(_);
    antarctic.precision(_);
    juanFernandez.precision(_);
    pascua.precision(_);
    return reset();
  };

  transverseMercatorChile.scale = function (_) {
    if (!arguments.length) {
      return mainland.scale();
    }
    mainland.scale(_);
    antarctic.scale(_ * 0.15);
    juanFernandez.scale(_ * 1.5);
    pascua.scale(_ * 1.5);
    return transverseMercatorChile.translate(mainland.translate());
  };

  transverseMercatorChile.translate = function (_) {
    if (!arguments.length) {
      return mainland.translate();
    }
    var k = mainland.scale(),
      x = +_[0],
      y = +_[1];

    /*
    var c0 = mainland(mainlandBbox[0]);
   var x0 = (x - c0[0]) / k;
   var y0 = (y - c0[1]) / k;

   var c1 = mainland(mainlandBbox[1]);
   var x1 = (x - c1[0]) / k;
   var y1 = (y - c1[1]) / k;

   console.info('Mainland: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   console.info('.clipExtent([[x '+
    (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
    ' * k, y '+
    (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
    ' * k],[x '+
    (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
    ' * k, y '+
    (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
    ' * k]])');

   c0 = antarctic.translate([x - 0.1 * k, y + 0.17 * k])(antarcticBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   c1 = antarctic.translate([x - 0.1 * k, y + 0.17 * k])(antarcticBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('antarctic: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   console.info('Doesn t work due to -90 latitude!' + '.clipExtent([[x '+
    (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
    ' * k + epsilon, y '+
    (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
    ' * k + epsilon],[x '+
    (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
    ' * k - epsilon, y '+
    (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
    ' * k - epsilon]])');

    c0 = juanFernandez.translate([x - 0.092 * k, y -0 * k])(juanFernandezBbox[0]);
    x0 = (x - c0[0]) / k;
    y0 = (y - c0[1]) / k;

    c1 = juanFernandez.translate([x - 0.092 * k, y -0 * k])(juanFernandezBbox[1]);
    x1 = (x - c1[0]) / k;
    y1 = (y - c1[1]) / k;

    console.info('juanFernandez: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
    console.info('.clipExtent([[x '+
     (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
     ' * k + epsilon, y '+
     (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
     ' * k + epsilon],[x '+
     (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
     ' * k - epsilon, y '+
     (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
     ' * k - epsilon]])');

     c0 = pascua.translate([x - 0.089 * k, y -0.0265 * k])(pascuaBbox[0]);
     x0 = (x - c0[0]) / k;
     y0 = (y - c0[1]) / k;

     c1 = pascua.translate([x - 0.089 * k, y -0.0265 * k])(pascuaBbox[1]);
     x1 = (x - c1[0]) / k;
     y1 = (y - c1[1]) / k;

     console.info('pascua: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k + epsilon, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k + epsilon],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k - epsilon, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k - epsilon]])');
      */
    mainlandPoint = mainland
      .translate(_)
      .clipExtent([
        [x - 0.059 * k, y - 0.3835 * k],
        [x + 0.4498 * k, y + 0.3375 * k],
      ])
      .stream(pointStream);

    antarcticPoint = antarctic
      .translate([x - 0.087 * k, y + 0.17 * k])
      .clipExtent([
        [x - 0.1166 * k + epsilon, y + 0.2582 * k + epsilon],
        [x - 0.06 * k - epsilon, y + 0.32 * k - epsilon],
      ])
      .stream(pointStream);

    juanFernandezPoint = juanFernandez
      .translate([x - 0.092 * k, y - 0 * k])
      .clipExtent([
        [x - 0.114 * k + epsilon, y - 0.013 * k + epsilon],
        [x - 0.0594 * k - epsilon, y + 0.0133 * k - epsilon],
      ])
      .stream(pointStream);

    pascuaPoint = pascua
      .translate([x - 0.089 * k, y - 0.0265 * k])
      .clipExtent([
        [x - 0.089 * k + epsilon, y + 0.0154 * k + epsilon],
        [x - 0.0588 * k - epsilon, y + 0.0391 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  transverseMercatorChile.fitExtent = function (extent, object) {
    return fitExtent(transverseMercatorChile, extent, object);
  };

  transverseMercatorChile.fitSize = function (size, object) {
    return fitSize(transverseMercatorChile, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return transverseMercatorChile;
  }

  transverseMercatorChile.drawCompositionBorders = function (context) {
    /*
    console.info("CLIP EXTENT antarctic: ", antarctic.clipExtent());
    console.info("UL BBOX:", mainland.invert([antarctic.clipExtent()[0][0], antarctic.clipExtent()[0][1]]));
    console.info("UR BBOX:", mainland.invert([antarctic.clipExtent()[1][0], antarctic.clipExtent()[0][1]]));
    console.info("LD BBOX:", mainland.invert([antarctic.clipExtent()[1][0], antarctic.clipExtent()[1][1]]));
    console.info("LL BBOX:", mainland.invert([antarctic.clipExtent()[0][0], antarctic.clipExtent()[1][1]]));

    console.info("CLIP EXTENT juanFernandez: ", juanFernandez.clipExtent());
    console.info("UL BBOX:", mainland.invert([juanFernandez.clipExtent()[0][0], juanFernandez.clipExtent()[0][1]]));
    console.info("UR BBOX:", mainland.invert([juanFernandez.clipExtent()[1][0], juanFernandez.clipExtent()[0][1]]));
    console.info("LD BBOX:", mainland.invert([juanFernandez.clipExtent()[1][0], juanFernandez.clipExtent()[1][1]]));
    console.info("LL BBOX:", mainland.invert([juanFernandez.clipExtent()[0][0], juanFernandez.clipExtent()[1][1]]));

    console.info("CLIP EXTENT pascua: ", pascua.clipExtent());
    console.info("UL BBOX:", mainland.invert([pascua.clipExtent()[0][0], pascua.clipExtent()[0][1]]));
    console.info("UR BBOX:", mainland.invert([pascua.clipExtent()[1][0], pascua.clipExtent()[0][1]]));
    console.info("LD BBOX:", mainland.invert([pascua.clipExtent()[1][0], pascua.clipExtent()[1][1]]));
    console.info("LL BBOX:", mainland.invert([pascua.clipExtent()[0][0], pascua.clipExtent()[1][1]]));
    */

    var ulantarctic = mainland([-82.6999, -51.3043]);
    var urantarctic = mainland([-77.5442, -51.6631]);
    var ldantarctic = mainland([-78.0254, -55.186]);
    var llantarctic = mainland([-83.6106, -54.7785]);

    var uljuanFernandez = mainland([-80.0638, -35.984]);
    var urjuanFernandez = mainland([-76.2153, -36.1811]);
    var ldjuanFernandez = mainland([-76.2994, -37.6839]);
    var lljuanFernandez = mainland([-80.2231, -37.4757]);

    var ulpascua = mainland([-78.442, -37.706]);
    var urpascua = mainland([-76.263, -37.8054]);
    var ldpascua = mainland([-76.344, -39.1595]);
    var llpascua = mainland([-78.5638, -39.0559]);

    context.moveTo(ulantarctic[0], ulantarctic[1]);
    context.lineTo(urantarctic[0], urantarctic[1]);
    context.lineTo(ldantarctic[0], ldantarctic[1]);
    context.lineTo(ldantarctic[0], ldantarctic[1]);
    context.lineTo(llantarctic[0], llantarctic[1]);
    context.closePath();

    context.moveTo(uljuanFernandez[0], uljuanFernandez[1]);
    context.lineTo(urjuanFernandez[0], urjuanFernandez[1]);
    context.lineTo(ldjuanFernandez[0], ldjuanFernandez[1]);
    context.lineTo(ldjuanFernandez[0], ldjuanFernandez[1]);
    context.lineTo(lljuanFernandez[0], lljuanFernandez[1]);
    context.closePath();

    context.moveTo(ulpascua[0], ulpascua[1]);
    context.lineTo(urpascua[0], urpascua[1]);
    context.lineTo(ldpascua[0], ldpascua[1]);
    context.lineTo(ldpascua[0], ldpascua[1]);
    context.lineTo(llpascua[0], llpascua[1]);
    context.closePath();
  };
  transverseMercatorChile.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return transverseMercatorChile.scale(700);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$7(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for Portugal, configured by default for 960×500.
function conicEquidistantJapan () {
  var cache,
    cacheStream,
    mainland = d3Geo.geoConicEquidistant().rotate([-136, -22]).parallels([40, 34]),
    mainlandPoint, //gis.stackexchange.com/a/73135
    hokkaido = d3Geo.geoConicEquidistant().rotate([-146, -26]).parallels([40, 34]),
    hokkaidoPoint,
    okinawa = d3Geo.geoConicEquidistant().rotate([-126, -19]).parallels([40, 34]),
    okinawaPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  /*
      var mainlandBbox = [[126.0, 41.606], [142.97, 29.97]];
      var hokkaidoBbox = [[138.7, 45.61], [146.2, 41.2]];
      var okinawaBbox = [[122.6, 29.0], [130, 23.7]];
      */

  function conicEquidistantJapan(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (mainlandPoint.point(x, y), point) ||
        (hokkaidoPoint.point(x, y), point) ||
        (okinawaPoint.point(x, y), point)
    );
  }

  conicEquidistantJapan.invert = function (coordinates) {
    var k = mainland.scale(),
      t = mainland.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;

    /*
        //How are the return values calculated:
        console.info("******");
        var c0 = hokkaido(hokkaidoBbox[0]);
        var x0 = (c0[0] - t[0]) / k;
        var y0 = (c0[1] - t[1]) / k;

        console.info("p0 hokkaido", x0 + ' - ' + y0);

        var c1 = hokkaido(hokkaidoBbox[1]);
        var x1 = (c1[0] - t[0]) / k;
        var y1 = (c1[1] - t[1]) / k;

        console.info("p1 hokkaido", x1 + ' - ' + y1);

        c0 = okinawa(okinawaBbox[0]);
        x0 = (c0[0] - t[0]) / k;
        y0 = (c0[1] - t[1]) / k;

        console.info("p0 okinawa", x0 + ' - ' + y0);

        c1 = okinawa(okinawaBbox[1]);
        x1 = (c1[0] - t[0]) / k;
        y1 = (c1[1] - t[1]) / k;

        console.info("p1 okinawa", x1 + ' - ' + y1);
        */

    return (
      y >= -0.10925 && y < -0.02701 && x >= -0.135 && x < -0.0397
        ? hokkaido
        : y >= 0.04713 && y < 0.11138 && x >= -0.03986 && x < 0.051
        ? okinawa
        : mainland
    ).invert(coordinates);
  };

  conicEquidistantJapan.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$7([
          mainland.stream((cacheStream = stream)),
          hokkaido.stream(stream),
          okinawa.stream(stream),
        ]));
  };

  conicEquidistantJapan.precision = function (_) {
    if (!arguments.length) {
      return mainland.precision();
    }
    mainland.precision(_);
    hokkaido.precision(_);
    okinawa.precision(_);
    return reset();
  };

  conicEquidistantJapan.scale = function (_) {
    if (!arguments.length) {
      return mainland.scale();
    }
    mainland.scale(_);
    hokkaido.scale(_);
    okinawa.scale(_ * 0.7);
    return conicEquidistantJapan.translate(mainland.translate());
  };

  conicEquidistantJapan.translate = function (_) {
    if (!arguments.length) {
      return mainland.translate();
    }
    var k = mainland.scale(),
      x = +_[0],
      y = +_[1];

    /*
    var c0 = mainland(mainlandBbox[0]);
   var x0 = (x - c0[0]) / k;
   var y0 = (y - c0[1]) / k;

   var c1 = mainland(mainlandBbox[1]);
   var x1 = (x - c1[0]) / k;
   var y1 = (y - c1[1]) / k;

   console.info('Main: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   console.info('.clipExtent([[x '+
    (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
    ' * k, y '+
    (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
    ' * k],[x '+
    (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
    ' * k, y '+
    (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
    ' * k]])');

   c0 = hokkaido.translate([x - 0.0425 * k, y - 0.005 * k])(hokkaidoBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   c1 = hokkaido.translate([x - 0.0425 * k, y - 0.005 * k])(hokkaidoBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('hokkaido: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   console.info('.clipExtent([[x '+
    (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
    ' * k + epsilon, y '+
    (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
    ' * k + epsilon],[x '+
    (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
    ' * k - epsilon, y '+
    (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
    ' * k - epsilon]])');

    c0 = okinawa.translate([x - 0 * k, y + 0 * k])(okinawaBbox[0]);
    x0 = (x - c0[0]) / k;
    y0 = (y - c0[1]) / k;

    c1 = okinawa.translate([x - 0 * k, y + 0 * k])(okinawaBbox[1]);
    x1 = (x - c1[0]) / k;
    y1 = (y - c1[1]) / k;

    console.info('okinawa: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
    console.info('.clipExtent([[x '+
     (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
     ' * k + epsilon, y '+
     (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
     ' * k + epsilon],[x '+
     (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
     ' * k - epsilon, y '+
     (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
     ' * k - epsilon]])');
     */

    mainlandPoint = mainland
      .translate(_)
      .clipExtent([
        [x - 0.1352 * k, y - 0.1091 * k],
        [x + 0.117 * k, y + 0.098 * k],
      ])
      .stream(pointStream);

    hokkaidoPoint = hokkaido
      .translate([x - 0.0425 * k, y - 0.005 * k])
      .clipExtent([
        [x - 0.135 * k + epsilon, y - 0.1093 * k + epsilon],
        [x - 0.0397 * k - epsilon, y - 0.027 * k - epsilon],
      ])
      .stream(pointStream);

    okinawaPoint = okinawa
      .translate(_)
      .clipExtent([
        [x - 0.0399 * k + epsilon, y + 0.0471 * k + epsilon],
        [x + 0.051 * k - epsilon, y + 0.1114 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  conicEquidistantJapan.fitExtent = function (extent, object) {
    return fitExtent(conicEquidistantJapan, extent, object);
  };

  conicEquidistantJapan.fitSize = function (size, object) {
    return fitSize(conicEquidistantJapan, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return conicEquidistantJapan;
  }

  conicEquidistantJapan.drawCompositionBorders = function (context) {
    /*
    console.info("CLIP EXTENT hokkaido: ", hokkaido.clipExtent());
    console.info("UL BBOX:", mainland.invert([hokkaido.clipExtent()[0][0], hokkaido.clipExtent()[0][1]]));
    console.info("UR BBOX:", mainland.invert([hokkaido.clipExtent()[1][0], hokkaido.clipExtent()[0][1]]));
    console.info("LD BBOX:", mainland.invert([hokkaido.clipExtent()[1][0], hokkaido.clipExtent()[1][1]]));
    console.info("LL BBOX:", mainland.invert([hokkaido.clipExtent()[0][0], hokkaido.clipExtent()[1][1]]));
    */

    var ulhokkaido = mainland([126.01320483689143, 41.621090310215585]);
    var urhokkaido = mainland([133.04304387025903, 42.15087523707186]);
    var ldhokkaido = mainland([133.3021766080688, 37.43975444725098]);
    var llhokkaido = mainland([126.87889168628224, 36.95488945159779]);

    var llokinawa = mainland([132.9, 29.8]);
    var lmokinawa = mainland([134, 33]);
    var lrokinawa = mainland([139.3, 33.2]);
    var llrokinawa = mainland([139.16, 30.5]);

    context.moveTo(ulhokkaido[0], ulhokkaido[1]);
    context.lineTo(urhokkaido[0], urhokkaido[1]);
    context.lineTo(ldhokkaido[0], ldhokkaido[1]);
    context.lineTo(llhokkaido[0], llhokkaido[1]);
    context.closePath();

    context.moveTo(llokinawa[0], llokinawa[1]);
    context.lineTo(lmokinawa[0], lmokinawa[1]);
    context.lineTo(lrokinawa[0], lrokinawa[1]);
    context.lineTo(llrokinawa[0], llrokinawa[1]);
  };
  conicEquidistantJapan.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return conicEquidistantJapan.scale(2200);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$6(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for France, configured by default for 960×500.
function conicConformalFrance () {
  var cache,
    cacheStream,
    europe = d3Geo.geoConicConformal().rotate([-3, -46.2]).parallels([0, 60]),
    europePoint,
    guyane = d3Geo.geoMercator().center([-53.2, 3.9]),
    guyanePoint,
    martinique = d3Geo.geoMercator().center([-61.03, 14.67]),
    martiniquePoint,
    guadeloupe = d3Geo.geoMercator().center([-61.46, 16.14]),
    guadeloupePoint,
    saintBarthelemy = d3Geo.geoMercator().center([-62.85, 17.92]),
    saintBarthelemyPoint,
    stPierreMiquelon = d3Geo.geoMercator().center([-56.23, 46.93]),
    stPierreMiquelonPoint,
    mayotte = d3Geo.geoMercator().center([45.16, -12.8]),
    mayottePoint,
    reunion = d3Geo.geoMercator().center([55.52, -21.13]),
    reunionPoint,
    nouvelleCaledonie = d3Geo.geoMercator().center([165.8, -21.07]),
    nouvelleCaledoniePoint,
    wallisFutuna = d3Geo.geoMercator().center([-178.1, -14.3]),
    wallisFutunaPoint,
    polynesie = d3Geo.geoMercator().center([-150.55, -17.11]),
    polynesiePoint,
    polynesie2 = d3Geo.geoMercator().center([-150.55, -17.11]),
    polynesie2Point,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  /*
      var europeBbox = [[-6.5, 51], [10, 41]];
      var guyaneBbox = [[-54.5, 6.29], [-50.9, 1.48]];
      */

  function conicConformalFrance(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (europePoint.point(x, y), point) ||
        (guyanePoint.point(x, y), point) ||
        (martiniquePoint.point(x, y), point) ||
        (guadeloupePoint.point(x, y), point) ||
        (saintBarthelemyPoint.point(x, y), point) ||
        (stPierreMiquelonPoint.point(x, y), point) ||
        (mayottePoint.point(x, y), point) ||
        (reunionPoint.point(x, y), point) ||
        (nouvelleCaledoniePoint.point(x, y), point) ||
        (wallisFutunaPoint.point(x, y), point) ||
        (polynesiePoint.point(x, y), point) ||
        (polynesie2Point.point(x, y), point)
    );
  }

  conicConformalFrance.invert = function (coordinates) {
    var k = europe.scale(),
      t = europe.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;

    return (
      y >= 0.029 && y < 0.0864 && x >= -0.14 && x < -0.0996
        ? guyane
        : y >= 0 && y < 0.029 && x >= -0.14 && x < -0.0996
        ? martinique
        : y >= -0.032 && y < 0 && x >= -0.14 && x < -0.0996
        ? guadeloupe
        : y >= -0.052 && y < -0.032 && x >= -0.14 && x < -0.0996
        ? saintBarthelemy
        : y >= -0.076 && y < 0.052 && x >= -0.14 && x < -0.0996
        ? stPierreMiquelon
        : y >= -0.076 && y < -0.052 && x >= 0.0967 && x < 0.1371
        ? mayotte
        : y >= -0.052 && y < -0.02 && x >= 0.0967 && x < 0.1371
        ? reunion
        : y >= -0.02 && y < 0.012 && x >= 0.0967 && x < 0.1371
        ? nouvelleCaledonie
        : y >= 0.012 && y < 0.033 && x >= 0.0967 && x < 0.1371
        ? wallisFutuna
        : y >= 0.033 && y < 0.0864 && x >= 0.0967 && x < 0.1371
        ? polynesie
        : europe
    ).invert(coordinates);
  };

  conicConformalFrance.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$6([
          europe.stream((cacheStream = stream)),
          guyane.stream(stream),
          martinique.stream(stream),
          guadeloupe.stream(stream),
          saintBarthelemy.stream(stream),
          stPierreMiquelon.stream(stream),
          mayotte.stream(stream),
          reunion.stream(stream),
          nouvelleCaledonie.stream(stream),
          wallisFutuna.stream(stream),
          polynesie.stream(stream),
          polynesie2.stream(stream),
        ]));
  };

  conicConformalFrance.precision = function (_) {
    if (!arguments.length) {
      return europe.precision();
    }
    europe.precision(_);
    guyane.precision(_);
    martinique.precision(_);
    guadeloupe.precision(_);
    saintBarthelemy.precision(_);
    stPierreMiquelon.precision(_);
    mayotte.precision(_);
    reunion.precision(_);
    nouvelleCaledonie.precision(_);
    wallisFutuna.precision(_);
    polynesie.precision(_);
    polynesie2.precision(_);

    return reset();
  };

  conicConformalFrance.scale = function (_) {
    if (!arguments.length) {
      return europe.scale();
    }
    europe.scale(_);
    guyane.scale(_ * 0.6);
    martinique.scale(_ * 1.6);
    guadeloupe.scale(_ * 1.4);
    saintBarthelemy.scale(_ * 5);
    stPierreMiquelon.scale(_ * 1.3);
    mayotte.scale(_ * 1.6);
    reunion.scale(_ * 1.2);
    nouvelleCaledonie.scale(_ * 0.3);
    wallisFutuna.scale(_ * 2.7);
    polynesie.scale(_ * 0.5);
    polynesie2.scale(_ * 0.06);
    return conicConformalFrance.translate(europe.translate());
  };

  conicConformalFrance.translate = function (_) {
    if (!arguments.length) {
      return europe.translate();
    }
    var k = europe.scale(),
      x = +_[0],
      y = +_[1];

    europePoint = europe
      .translate(_)
      .clipExtent([
        [x - 0.0996 * k, y - 0.0908 * k],
        [x + 0.0967 * k, y + 0.0864 * k],
      ])
      .stream(pointStream);

    guyanePoint = guyane
      .translate([x - 0.12 * k, y + 0.0575 * k])
      .clipExtent([
        [x - 0.14 * k + epsilon, y + 0.029 * k + epsilon],
        [x - 0.0996 * k - epsilon, y + 0.0864 * k - epsilon],
      ])
      .stream(pointStream);

    martiniquePoint = martinique
      .translate([x - 0.12 * k, y + 0.013 * k])
      .clipExtent([
        [x - 0.14 * k + epsilon, y + 0 * k + epsilon],
        [x - 0.0996 * k - epsilon, y + 0.029 * k - epsilon],
      ])
      .stream(pointStream);

    guadeloupePoint = guadeloupe
      .translate([x - 0.12 * k, y - 0.014 * k])
      .clipExtent([
        [x - 0.14 * k + epsilon, y - 0.032 * k + epsilon],
        [x - 0.0996 * k - epsilon, y + 0 * k - epsilon],
      ])
      .stream(pointStream);

    saintBarthelemyPoint = saintBarthelemy
      .translate([x - 0.12 * k, y - 0.044 * k])
      .clipExtent([
        [x - 0.14 * k + epsilon, y - 0.052 * k + epsilon],
        [x - 0.0996 * k - epsilon, y - 0.032 * k - epsilon],
      ])
      .stream(pointStream);

    stPierreMiquelonPoint = stPierreMiquelon
      .translate([x - 0.12 * k, y - 0.065 * k])
      .clipExtent([
        [x - 0.14 * k + epsilon, y - 0.076 * k + epsilon],
        [x - 0.0996 * k - epsilon, y - 0.052 * k - epsilon],
      ])
      .stream(pointStream);

    mayottePoint = mayotte
      .translate([x + 0.117 * k, y - 0.064 * k])
      .clipExtent([
        [x + 0.0967 * k + epsilon, y - 0.076 * k + epsilon],
        [x + 0.1371 * k - epsilon, y - 0.052 * k - epsilon],
      ])
      .stream(pointStream);

    reunionPoint = reunion
      .translate([x + 0.116 * k, y - 0.0355 * k])
      .clipExtent([
        [x + 0.0967 * k + epsilon, y - 0.052 * k + epsilon],
        [x + 0.1371 * k - epsilon, y - 0.02 * k - epsilon],
      ])
      .stream(pointStream);

    nouvelleCaledoniePoint = nouvelleCaledonie
      .translate([x + 0.116 * k, y - 0.0048 * k])
      .clipExtent([
        [x + 0.0967 * k + epsilon, y - 0.02 * k + epsilon],
        [x + 0.1371 * k - epsilon, y + 0.012 * k - epsilon],
      ])
      .stream(pointStream);

    wallisFutunaPoint = wallisFutuna
      .translate([x + 0.116 * k, y + 0.022 * k])
      .clipExtent([
        [x + 0.0967 * k + epsilon, y + 0.012 * k + epsilon],
        [x + 0.1371 * k - epsilon, y + 0.033 * k - epsilon],
      ])
      .stream(pointStream);

    polynesie2Point = polynesie2
      .translate([x + 0.11 * k, y + 0.045 * k])
      .clipExtent([
        [x + 0.0967 * k + epsilon, y + 0.033 * k + epsilon],
        [x + 0.1371 * k - epsilon, y + 0.06 * k - epsilon],
      ])
      .stream(pointStream);

    polynesiePoint = polynesie
      .translate([x + 0.115 * k, y + 0.075 * k])
      .clipExtent([
        [x + 0.0967 * k + epsilon, y + 0.06 * k + epsilon],
        [x + 0.1371 * k - epsilon, y + 0.0864 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  conicConformalFrance.fitExtent = function (extent, object) {
    return fitExtent(conicConformalFrance, extent, object);
  };

  conicConformalFrance.fitSize = function (size, object) {
    return fitSize(conicConformalFrance, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return conicConformalFrance;
  }

  conicConformalFrance.drawCompositionBorders = function (context) {
    /*
    console.log("var ul, ur, ld, ll;");
    var projs = [guyane, martinique, guadeloupe, saintBarthelemy, stPierreMiquelon, mayotte, reunion, nouvelleCaledonie, wallisFutuna, polynesie, polynesie2];
    for (var i in projs){
      var ul = europe.invert([projs[i].clipExtent()[0][0], projs[i].clipExtent()[0][1]]);
      var ur = europe.invert([projs[i].clipExtent()[1][0], projs[i].clipExtent()[0][1]]);
      var ld = europe.invert([projs[i].clipExtent()[1][0], projs[i].clipExtent()[1][1]]);
      var ll = europe.invert([projs[i].clipExtent()[0][0], projs[i].clipExtent()[1][1]]);

      console.log("ul = europe(["+ul+"]);");
      console.log("ur = europe(["+ur+"]);");
      console.log("ld = europe(["+ld+"]);");
      console.log("ll = europe(["+ll+"]);");

      console.log("context.moveTo(ul[0], ul[1]);");
      console.log("context.lineTo(ur[0], ur[1]);");
      console.log("context.lineTo(ld[0], ld[1]);");
      console.log("context.lineTo(ll[0], ll[1]);");
      console.log("context.closePath();");

    }*/

    var ul, ur, ld, ll;
    ul = europe([-7.938886725111036, 43.7219460918835]);
    ur = europe([-4.832080896458295, 44.12930268549372]);
    ld = europe([-4.205299743793263, 40.98096346967365]);
    ll = europe([-7.071796453126152, 40.610037319181444]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([-8.42751373617692, 45.32889452553031]);
    ur = europe([-5.18599305777107, 45.7566442062976]);
    ld = europe([-4.832080905154431, 44.129302726751426]);
    ll = europe([-7.938886737126192, 43.72194613263854]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([-9.012656899657046, 47.127733821030176]);
    ur = europe([-5.6105244772793155, 47.579777861410626]);
    ld = europe([-5.185993067168585, 45.756644248170346]);
    ll = europe([-8.427513749141811, 45.32889456686326]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([-9.405747558985553, 48.26506375557457]);
    ur = europe([-5.896175018439575, 48.733352850851624]);
    ld = europe([-5.610524487556043, 47.57977790393761]);
    ll = europe([-9.012656913808351, 47.127733862971255]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([-9.908436061346974, 49.642448789505856]);
    ur = europe([-6.262026716233124, 50.131426841787174]);
    ld = europe([-5.896175029331232, 48.73335289377258]);
    ll = europe([-9.40574757396393, 48.26506379787767]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([11.996907706504462, 50.16039028163579]);
    ur = europe([15.649907879773343, 49.68279246765253]);
    ld = europe([15.156712840526632, 48.30371557625831]);
    ll = europe([11.64122661754411, 48.761078240546816]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([11.641226606955788, 48.7610781975889]);
    ur = europe([15.156712825832164, 48.30371553390465]);
    ld = europe([14.549932166241172, 46.4866532486199]);
    ll = europe([11.204443787952183, 46.91899233914248]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([11.204443778297161, 46.918992296823646]);
    ur = europe([14.549932152815039, 46.486653206856396]);
    ld = europe([13.994409796764009, 44.695833444323256]);
    ll = europe([10.805306599253848, 45.105133870684924]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([10.805306590412085, 45.10513382903308]);
    ur = europe([13.99440978444733, 44.695833403183606]);
    ld = europe([13.654633799024392, 43.53552468558152]);
    ll = europe([10.561516803980956, 43.930671459798624]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();

    ul = europe([10.561516795617383, 43.93067141859757]);
    ur = europe([13.654633787361952, 43.5355246448671]);
    ld = europe([12.867691604239901, 40.640701985019405]);
    ll = europe([9.997809515987688, 41.00288343254471]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();

    ul = europe([10.8, 42.4]);
    ur = europe([12.8, 42.13]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
  };
  conicConformalFrance.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return conicConformalFrance.scale(2700);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$5(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for Portugal, configured by default for 960×500.
function conicConformalEurope () {
  var cache,
    cacheStream,
    europe = d3Geo.geoConicConformal().rotate([-10, -53]).parallels([0, 60]),
    europePoint,
    guadeloupe = d3Geo.geoMercator().center([-61.46, 16.14]),
    guadeloupePoint,
    guyane = d3Geo.geoMercator().center([-53.2, 3.9]),
    guyanePoint,
    azores = d3Geo.geoConicConformal().rotate([27.8, -38.9]).parallels([0, 60]),
    azoresPoint,
    azores2 = d3Geo.geoConicConformal().rotate([25.43, -37.398]).parallels([0, 60]),
    azores2Point,
    azores3 = d3Geo.geoConicConformal().rotate([31.17, -39.539]).parallels([0, 60]),
    azores3Point,
    madeira = d3Geo.geoConicConformal().rotate([17, -32.7]).parallels([0, 60]),
    madeiraPoint,
    canaryIslands = d3Geo.geoConicConformal().rotate([16, -28.5]).parallels([0, 60]),
    canaryIslandsPoint,
    martinique = d3Geo.geoMercator().center([-61.03, 14.67]),
    martiniquePoint,
    mayotte = d3Geo.geoMercator().center([45.16, -12.8]),
    mayottePoint,
    reunion = d3Geo.geoMercator().center([55.52, -21.13]),
    reunionPoint,
    malta = d3Geo.geoConicConformal().rotate([-14.4, -35.95]).parallels([0, 60]),
    maltaPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  /*
      var europeBbox = [[-6.5, 51], [10, 41]];
      var guyaneBbox = [[-54.5, 6.29], [-50.9, 1.48]];
      */

  function conicConformalEurope(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (europePoint.point(x, y), point) ||
        (guyanePoint.point(x, y), point) ||
        (martiniquePoint.point(x, y), point) ||
        (guadeloupePoint.point(x, y), point) ||
        (canaryIslandsPoint.point(x, y), point) ||
        (madeiraPoint.point(x, y), point) ||
        (mayottePoint.point(x, y), point) ||
        (reunionPoint.point(x, y), point) ||
        (maltaPoint.point(x, y), point) ||
        (azoresPoint.point(x, y), point) ||
        (azores2Point.point(x, y), point) ||
        (azores3Point.point(x, y), point)
    );
  }

  conicConformalEurope.invert = function (coordinates) {
    var k = europe.scale(),
      t = europe.translate(),
      x = (coordinates[0] - (t[0] + 0.08 * k)) / k,
      y = (coordinates[1] - t[1]) / k;

    return (
      y >= -0.31 && y < -0.24 && x >= 0.14 && x < 0.24
        ? guadeloupe
        : y >= -0.24 && y < -0.17 && x >= 0.14 && x < 0.24
        ? guyane
        : y >= -0.17 && y < -0.12 && x >= 0.21 && x < 0.24
        ? azores2
        : y >= -0.17 && y < -0.14 && x >= 0.14 && x < 0.165
        ? azores3
        : y >= -0.17 && y < -0.1 && x >= 0.14 && x < 0.24
        ? azores
        : y >= -0.1 && y < -0.03 && x >= 0.14 && x < 0.24
        ? madeira
        : y >= -0.03 && y < 0.04 && x >= 0.14 && x < 0.24
        ? canaryIslands
        : y >= -0.31 && y < -0.24 && x >= 0.24 && x < 0.34
        ? martinique
        : y >= -0.24 && y < -0.17 && x >= 0.24 && x < 0.34
        ? mayotte
        : y >= -0.17 && y < -0.1 && x >= 0.24 && x < 0.34
        ? reunion
        : y >= -0.1 && y < -0.03 && x >= 0.24 && x < 0.34
        ? malta
        : europe
    ).invert(coordinates);
  };

  conicConformalEurope.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$5([
          europe.stream((cacheStream = stream)),
          guyane.stream(stream),
          martinique.stream(stream),
          guadeloupe.stream(stream),
          canaryIslands.stream(stream),
          madeira.stream(stream),
          mayotte.stream(stream),
          reunion.stream(stream),
          malta.stream(stream),
          azores.stream(stream),
          azores2.stream(stream),
          azores3.stream(stream),
        ]));
  };

  conicConformalEurope.precision = function (_) {
    if (!arguments.length) {
      return europe.precision();
    }
    europe.precision(_);
    guyane.precision(_);
    martinique.precision(_);
    guadeloupe.precision(_);
    canaryIslands.precision(_);
    madeira.precision(_);
    mayotte.precision(_);
    reunion.precision(_);
    malta.precision(_);

    azores.precision(_);
    azores2.precision(_);
    azores3.precision(_);

    return reset();
  };

  conicConformalEurope.scale = function (_) {
    if (!arguments.length) {
      return europe.scale();
    }
    europe.scale(_);
    guadeloupe.scale(_ * 3);
    guyane.scale(_ * 0.8);
    martinique.scale(_ * 3.5);
    reunion.scale(_ * 2.7);
    azores.scale(_ * 2);
    azores2.scale(_ * 2);
    azores3.scale(_ * 2);
    madeira.scale(_ * 3);
    canaryIslands.scale(_);

    mayotte.scale(_ * 5.5);
    malta.scale(_ * 6);

    return conicConformalEurope.translate(europe.translate());
  };

  conicConformalEurope.translate = function (_) {
    if (!arguments.length) {
      return europe.translate();
    }
    var k = europe.scale(),
      x = +_[0],
      y = +_[1];

    europePoint = europe
      .translate([x - 0.08 * k, y])
      .clipExtent([
        [x - 0.51 * k, y - 0.33 * k],
        [x + 0.5 * k, y + 0.33 * k],
      ])
      .stream(pointStream);

    guadeloupePoint = guadeloupe
      .translate([x + 0.19 * k, y - 0.275 * k])
      .clipExtent([
        [x + 0.14 * k + epsilon, y - 0.31 * k + epsilon],
        [x + 0.24 * k - epsilon, y - 0.24 * k - epsilon],
      ])
      .stream(pointStream);

    guyanePoint = guyane
      .translate([x + 0.19 * k, y - 0.205 * k])
      .clipExtent([
        [x + 0.14 * k + epsilon, y - 0.24 * k + epsilon],
        [x + 0.24 * k - epsilon, y - 0.17 * k - epsilon],
      ])
      .stream(pointStream);

    azoresPoint = azores
      .translate([x + 0.19 * k, y - 0.135 * k])
      .clipExtent([
        [x + 0.14 * k + epsilon, y - 0.17 * k + epsilon],
        [x + 0.24 * k - epsilon, y - 0.1 * k - epsilon],
      ])
      .stream(pointStream);

    azores2Point = azores2
      .translate([x + 0.225 * k, y - 0.147 * k])
      .clipExtent([
        [x + 0.21 * k + epsilon, y - 0.17 * k + epsilon],
        [x + 0.24 * k - epsilon, y - 0.12 * k - epsilon],
      ])
      .stream(pointStream);

    azores3Point = azores3
      .translate([x + 0.153 * k, y - 0.15 * k])
      .clipExtent([
        [x + 0.14 * k + epsilon, y - 0.17 * k + epsilon],
        [x + 0.165 * k - epsilon, y - 0.14 * k - epsilon],
      ])
      .stream(pointStream);

    madeiraPoint = madeira
      .translate([x + 0.19 * k, y - 0.065 * k])
      .clipExtent([
        [x + 0.14 * k + epsilon, y - 0.1 * k + epsilon],
        [x + 0.24 * k - epsilon, y - 0.03 * k - epsilon],
      ])
      .stream(pointStream);

    canaryIslandsPoint = canaryIslands
      .translate([x + 0.19 * k, y + 0.005 * k])
      .clipExtent([
        [x + 0.14 * k + epsilon, y - 0.03 * k + epsilon],
        [x + 0.24 * k - epsilon, y + 0.04 * k - epsilon],
      ])
      .stream(pointStream);

    martiniquePoint = martinique
      .translate([x + 0.29 * k, y - 0.275 * k])
      .clipExtent([
        [x + 0.24 * k + epsilon, y - 0.31 * k + epsilon],
        [x + 0.34 * k - epsilon, y - 0.24 * k - epsilon],
      ])
      .stream(pointStream);

    mayottePoint = mayotte
      .translate([x + 0.29 * k, y - 0.205 * k])
      .clipExtent([
        [x + 0.24 * k + epsilon, y - 0.24 * k + epsilon],
        [x + 0.34 * k - epsilon, y - 0.17 * k - epsilon],
      ])
      .stream(pointStream);

    reunionPoint = reunion
      .translate([x + 0.29 * k, y - 0.135 * k])
      .clipExtent([
        [x + 0.24 * k + epsilon, y - 0.17 * k + epsilon],
        [x + 0.34 * k - epsilon, y - 0.1 * k - epsilon],
      ])
      .stream(pointStream);

    maltaPoint = malta
      .translate([x + 0.29 * k, y - 0.065 * k])
      .clipExtent([
        [x + 0.24 * k + epsilon, y - 0.1 * k + epsilon],
        [x + 0.34 * k - epsilon, y - 0.03 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  conicConformalEurope.fitExtent = function (extent, object) {
    return fitExtent(conicConformalEurope, extent, object);
  };

  conicConformalEurope.fitSize = function (size, object) {
    return fitSize(conicConformalEurope, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return conicConformalEurope;
  }

  conicConformalEurope.drawCompositionBorders = function (context) {
    /*
    console.log("var ul, ur, ld, ll;");
    var projs = [guyane, martinique, guadeloupe, canaryIslands, madeira, mayotte, reunion, malta, azores, azores2, azores3];
    for (var i in projs){
      var ul = europe.invert([projs[i].clipExtent()[0][0], projs[i].clipExtent()[0][1]]);
      var ur = europe.invert([projs[i].clipExtent()[1][0], projs[i].clipExtent()[0][1]]);
      var ld = europe.invert([projs[i].clipExtent()[1][0], projs[i].clipExtent()[1][1]]);
      var ll = europe.invert([projs[i].clipExtent()[0][0], projs[i].clipExtent()[1][1]]);

      console.log("ul = europe(["+ul+"]);");
      console.log("ur = europe(["+ur+"]);");
      console.log("ld = europe(["+ld+"]);");
      console.log("ll = europe(["+ll+"]);");

      console.log("context.moveTo(ul[0], ul[1]);");
      console.log("context.lineTo(ur[0], ur[1]);");
      console.log("context.lineTo(ld[0], ld[1]);");
      console.log("context.lineTo(ll[0], ll[1]);");
      console.log("context.closePath();");

    }*/

    var ul, ur, ld, ll;
    ul = europe([42.45755610828648, 63.343658547914934]);
    ur = europe([52.65837266667029, 59.35045080290929]);
    ld = europe([47.19754502247785, 56.12653496548117]);
    ll = europe([37.673034273363044, 59.61638268506111]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([59.41110754003403, 62.35069727399336]);
    ur = europe([66.75050228640794, 57.11797303636038]);
    ld = europe([60.236065725110436, 54.63331433818992]);
    ll = europe([52.65837313153311, 59.350450804599355]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([48.81091130080243, 66.93353402634641]);
    ur = europe([59.41110730654679, 62.35069740653086]);
    ld = europe([52.6583728974441, 59.3504509222445]);
    ll = europe([42.45755631675751, 63.34365868805821]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([31.054198418446475, 52.1080673766184]);
    ur = europe([39.09869284884117, 49.400700047190554]);
    ld = europe([36.0580811499175, 46.02944174908498]);
    ll = europe([28.690508588835726, 48.433126979386415]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([33.977877745912025, 55.849945501331]);
    ur = europe([42.75328432167726, 52.78455122462353]);
    ld = europe([39.09869297540224, 49.400700176148625]);
    ll = europe([31.05419851807008, 52.10806751810923]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([52.658372900759296, 59.35045068526415]);
    ur = europe([60.23606549583304, 54.63331423800264]);
    ld = europe([54.6756370953122, 51.892298789399455]);
    ll = europe([47.19754524788189, 56.126534861222794]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([47.19754506082455, 56.126534735591456]);
    ur = europe([54.675636900123514, 51.892298681337095]);
    ld = europe([49.94448648951486, 48.98775484983285]);
    ll = europe([42.75328468716108, 52.78455126060818]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([42.75328453416769, 52.78455113209101]);
    ur = europe([49.94448632339758, 48.98775473706457]);
    ld = europe([45.912339990394315, 45.99361784987003]);
    ll = europe([39.09869317356607, 49.40070009378711]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([37.673034114296634, 59.61638254183119]);
    ur = europe([47.197544835420544, 56.126534839849846]);
    ld = europe([42.75328447467064, 52.78455135314068]);
    ll = europe([33.977877870363905, 55.849945644671145]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([44.56748486446032, 57.26489367845818]);
    ld = europe([43.9335791193588, 53.746540942601726]);
    ll = europe([43, 56]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = europe([37.673034114296634, 59.61638254183119]);
    ur = europe([40.25902691953466, 58.83002044222639]);
    ld = europe([38.458270492742024, 57.26232178028002]);
    ll = europe([35.97754948030156, 58.00266637992386]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
  };
  conicConformalEurope.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return conicConformalEurope.scale(750);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$4(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for the Netherlands, configured by default for 960×500.
function conicConformalNetherlands () {
  var cache,
    cacheStream,
    netherlandsMainland = d3Geo.geoConicConformal()
      .rotate([-5.5, -52.2])
      .parallels([0, 60]),
    netherlandsMainlandPoint,
    bonaire = d3Geo.geoMercator().center([-68.25, 12.2]),
    bonairePoint,
    sabaSintEustatius = d3Geo.geoMercator().center([-63.1, 17.5]),
    sabaSintEustatiusPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  function conicConformalNetherlands(coordinates) {
    const [x, y] = coordinates;

    return (
      (point = null),
      (netherlandsMainlandPoint.point(x, y), point) ||
        (bonairePoint.point(x, y), point) ||
        (sabaSintEustatiusPoint.point(x, y), point)
    );
  }

  conicConformalNetherlands.invert = function (coordinates) {
    var k = netherlandsMainland.scale(),
      t = netherlandsMainland.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;

    return (
      y >= -67e-4 && y < 0.0015 && x >= -0.0232 && x < -0.0154
        ? bonaire
        : y >= -0.022 && y < -0.014 && x >= -0.023 && x < -0.014
        ? sabaSintEustatius
        : netherlandsMainland
    ).invert(coordinates);
  };

  conicConformalNetherlands.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$4([
          netherlandsMainland.stream((cacheStream = stream)),
          bonaire.stream(stream),
          sabaSintEustatius.stream(stream),
        ]));
  };

  conicConformalNetherlands.precision = function (_) {
    if (!arguments.length) return netherlandsMainland.precision();

    netherlandsMainland.precision(_);
    bonaire.precision(_);
    sabaSintEustatius.precision(_);
    return reset();
  };

  conicConformalNetherlands.scale = function (_) {
    if (!arguments.length) return netherlandsMainland.scale();

    netherlandsMainland.scale(_);
    bonaire.scale(_);
    sabaSintEustatius.scale(_);
    return conicConformalNetherlands.translate(netherlandsMainland.translate());
  };

  conicConformalNetherlands.translate = function (_) {
    if (!arguments.length) return netherlandsMainland.translate();

    const k = netherlandsMainland.scale(),
      x = +_[0],
      y = +_[1];

    netherlandsMainlandPoint = netherlandsMainland
      .translate(_)
      .clipExtent([
        [x - 0.0245 * k, y - 0.026 * k],
        [x + 0.023 * k, y + 0.026 * k],
      ])
      .stream(pointStream);

    bonairePoint = bonaire
      .translate([x - 0.0186 * k, y - 0.00325 * k])
      .clipExtent([
        [x - 0.0232 * k + epsilon, y - 0.0067 * k + epsilon],
        [x - 0.0154 * k - epsilon, y + 0.0015 * k - epsilon],
      ])
      .stream(pointStream);

    sabaSintEustatiusPoint = sabaSintEustatius
      .translate([x - 0.0185 * k, y - 0.017 * k])
      .clipExtent([
        [x - 0.023 * k + epsilon, y - 0.022 * k + epsilon],
        [x - 0.014 * k - epsilon, y - 0.014 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  conicConformalNetherlands.fitExtent = function (extent, object) {
    return fitExtent(conicConformalNetherlands, extent, object);
  };

  conicConformalNetherlands.fitSize = function (size, object) {
    return fitSize(conicConformalNetherlands, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return conicConformalNetherlands;
  }

  conicConformalNetherlands.drawCompositionBorders = function (context) {
    /* 
    console.table({
      "Clip extent": ["Bonaire", bonaire.clipExtent()],
      "UL BBOX:": netherlandsMainland.invert([bonaire.clipExtent()[0][0], bonaire.clipExtent()[0][1]]),
      "UR BBOX:": netherlandsMainland.invert([bonaire.clipExtent()[1][0], bonaire.clipExtent()[0][1]]),
      "LD BBOX:": netherlandsMainland.invert([bonaire.clipExtent()[1][0], bonaire.clipExtent()[1][1]]),
      "LL BBOX:": netherlandsMainland.invert([bonaire.clipExtent()[0][0], bonaire.clipExtent()[1][1]])
    });
    
    console.table({
      "Clip extent": ["Saba & Sint Eustatius", sabaSintEustatius.clipExtent()],
      "UL BBOX:": netherlandsMainland.invert([sabaSintEustatius.clipExtent()[0][0], sabaSintEustatius.clipExtent()[0][1]]),
      "UR BBOX:": netherlandsMainland.invert([sabaSintEustatius.clipExtent()[1][0], sabaSintEustatius.clipExtent()[0][1]]),
      "LD BBOX:": netherlandsMainland.invert([sabaSintEustatius.clipExtent()[1][0], sabaSintEustatius.clipExtent()[1][1]]),
      "LL BBOX:": netherlandsMainland.invert([sabaSintEustatius.clipExtent()[0][0], sabaSintEustatius.clipExtent()[1][1]])
    }); 
    */

    var ulbonaire = netherlandsMainland([3.30573, 52.5562]);
    var urbonaire = netherlandsMainland([4.043, 52.572]);
    var ldbonaire = netherlandsMainland([4.0646, 52.1017]);
    var llbonaire = netherlandsMainland([3.3382, 52.0861]);

    var ulsabaSintEustatius = netherlandsMainland([3.262, 53.439]);
    var ursabaSintEustatius = netherlandsMainland([4.1373, 53.4571]);
    var ldsabaSintEustatius = netherlandsMainland([4.1574, 52.9946]);
    var llsabaSintEustatius = netherlandsMainland([3.2951, 52.9768]);

    context.moveTo(ulbonaire[0], ulbonaire[1]);
    context.lineTo(urbonaire[0], urbonaire[1]);
    context.lineTo(ldbonaire[0], ldbonaire[1]);
    context.lineTo(ldbonaire[0], ldbonaire[1]);
    context.lineTo(llbonaire[0], llbonaire[1]);
    context.closePath();

    context.moveTo(ulsabaSintEustatius[0], ulsabaSintEustatius[1]);
    context.lineTo(ursabaSintEustatius[0], ursabaSintEustatius[1]);
    context.lineTo(ldsabaSintEustatius[0], ldsabaSintEustatius[1]);
    context.lineTo(ldsabaSintEustatius[0], ldsabaSintEustatius[1]);
    context.lineTo(llsabaSintEustatius[0], llsabaSintEustatius[1]);
    context.closePath();
  };
  conicConformalNetherlands.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return conicConformalNetherlands.scale(4200);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$3(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for Malaysia, configured by default for 960×500.
function mercatorMalaysia () {
  var cache,
    cacheStream,
    peninsular = d3Geo.geoMercator().center([105.25, 4.0]),
    peninsularPoint,
    borneo = d3Geo.geoMercator().center([118.65, 2.86]),
    borneoPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  function mercatorMalaysia(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (peninsularPoint.point(x, y), point) || (borneoPoint.point(x, y), point)
    );
  }

  mercatorMalaysia.invert = function (coordinates) {
    var k = peninsular.scale(),
      t = peninsular.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;

    return (
      y >= -0.0521 && y < 0.0229 && x >= -0.0111 && x < 0.1
        ? borneo
        : peninsular
    ).invert(coordinates);
  };

  mercatorMalaysia.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$3([
          peninsular.stream((cacheStream = stream)),
          borneo.stream(stream),
        ]));
  };

  mercatorMalaysia.precision = function (_) {
    if (!arguments.length) {
      return peninsular.precision();
    }
    peninsular.precision(_);
    borneo.precision(_);
    return reset();
  };

  mercatorMalaysia.scale = function (_) {
    if (!arguments.length) {
      return peninsular.scale();
    }
    peninsular.scale(_);
    borneo.scale(_ * 0.615);
    return mercatorMalaysia.translate(peninsular.translate());
  };

  mercatorMalaysia.translate = function (_) {
    if (!arguments.length) {
      return peninsular.translate();
    }
    var k = peninsular.scale(),
      x = +_[0],
      y = +_[1];

    peninsularPoint = peninsular
      .translate(_)
      .clipExtent([
        [x - 0.11 * k, y - 0.0521 * k],
        [x - 0.0111 * k, y + 0.0521 * k],
      ])
      .stream(pointStream);

    borneoPoint = borneo
      .translate([x + 0.09 * k, y - 0.0 * k])
      .clipExtent([
        [x - 0.0111 * k + epsilon, y - 0.0521 * k + epsilon],
        [x + 0.1 * k - epsilon, y + 0.024 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  mercatorMalaysia.fitExtent = function (extent, object) {
    return fitExtent(mercatorMalaysia, extent, object);
  };

  mercatorMalaysia.fitSize = function (size, object) {
    return fitSize(mercatorMalaysia, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return mercatorMalaysia;
  }

  mercatorMalaysia.drawCompositionBorders = function (context) {
    var llbor = peninsular([106.3214, 2.0228]);
    var lmbor = peninsular([105.1843, 2.3761]);
    var lrbor = peninsular([104.2151, 3.3618]);
    var llrbor = peninsular([104.215, 4.5651]);

    context.moveTo(llbor[0], llbor[1]);
    context.lineTo(lmbor[0], lmbor[1]);
    context.lineTo(lrbor[0], lrbor[1]);
    context.lineTo(llrbor[0], llrbor[1]);
  };
  mercatorMalaysia.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return mercatorMalaysia.scale(4800);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex$2(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for Equatorial Guinea, configured by default for 960×500.
function mercatorEquatorialGuinea () {
  var cache,
    cacheStream,
    continent = d3Geo.geoMercator().rotate([-9.5, -1.5]),
    continentPoint,
    bioko = d3Geo.geoMercator().rotate([-8.6, -3.5]),
    biokoPoint,
    annobon = d3Geo.geoMercator().rotate([-5.6, 1.45]),
    annobonPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  function mercatorEquatorialGuinea(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (continentPoint.point(x, y), point) ||
        (biokoPoint.point(x, y), point) ||
        (annobonPoint.point(x, y), point)
    );
  }

  mercatorEquatorialGuinea.invert = function (coordinates) {
    var k = continent.scale(),
      t = continent.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;
    return (
      y >= -0.02 && y < 0 && x >= -0.038 && x < -5e-3
        ? bioko
        : y >= 0 && y < 0.02 && x >= -0.038 && x < -5e-3
        ? annobon
        : continent
    ).invert(coordinates);
  };

  mercatorEquatorialGuinea.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$2([
          continent.stream((cacheStream = stream)),
          bioko.stream(stream),
          annobon.stream(stream),
        ]));
  };

  mercatorEquatorialGuinea.precision = function (_) {
    if (!arguments.length) {
      return continent.precision();
    }
    continent.precision(_);
    bioko.precision(_);
    annobon.precision(_);
    return reset();
  };

  mercatorEquatorialGuinea.scale = function (_) {
    if (!arguments.length) {
      return continent.scale();
    }
    continent.scale(_);
    bioko.scale(_ * 1.5);
    annobon.scale(_ * 4);
    return mercatorEquatorialGuinea.translate(continent.translate());
  };

  mercatorEquatorialGuinea.translate = function (_) {
    if (!arguments.length) {
      return continent.translate();
    }
    var k = continent.scale(),
      x = +_[0],
      y = +_[1];
    continentPoint = continent
      .translate(_)
      .clipExtent([
        [x - 0.005 * k, y - 0.02 * k],
        [x + 0.038 * k, y + 0.02 * k],
      ])
      .stream(pointStream);

    biokoPoint = bioko
      .translate([x - 0.025 * k, y - 0.01 * k])
      .clipExtent([
        [x - 0.038 * k + epsilon, y - 0.02 * k + epsilon],
        [x - 0.005 * k - epsilon, y + 0 * k - epsilon],
      ])
      .stream(pointStream);

    annobonPoint = annobon
      .translate([x - 0.025 * k, y + 0.01 * k])
      .clipExtent([
        [x - 0.038 * k + epsilon, y - 0 * k + epsilon],
        [x - 0.005 * k - epsilon, y + 0.02 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  mercatorEquatorialGuinea.fitExtent = function (extent, object) {
    return fitExtent(mercatorEquatorialGuinea, extent, object);
  };

  mercatorEquatorialGuinea.fitSize = function (size, object) {
    return fitSize(mercatorEquatorialGuinea, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return mercatorEquatorialGuinea;
  }

  mercatorEquatorialGuinea.drawCompositionBorders = function (context) {
    /*
    console.log("var ul, ur, ld, ll;");
    var projs = [continent, bioko, annobon];
    for (var i in projs){
      var ul = continent.invert([projs[i].clipExtent()[0][0], projs[i].clipExtent()[0][1]]);
      var ur = continent.invert([projs[i].clipExtent()[1][0], projs[i].clipExtent()[0][1]]);
      var ld = continent.invert([projs[i].clipExtent()[1][0], projs[i].clipExtent()[1][1]]);
      var ll = continent.invert([projs[i].clipExtent()[0][0], projs[i].clipExtent()[1][1]]);

      console.log("ul = continent(["+ul+"]);");
      console.log("ur = continent(["+ur+"]);");
      console.log("ld = continent(["+ld+"]);");
      console.log("ll = continent(["+ll+"]);");

      console.log("context.moveTo(ul[0], ul[1]);");
      console.log("context.lineTo(ur[0], ur[1]);");
      console.log("context.lineTo(ld[0], ld[1]);");
      console.log("context.lineTo(ll[0], ll[1]);");
      console.log("context.closePath();");

    }*/

    var ul, ur, ld, ll;
    ul = continent([9.21327272751682, 2.645820439454123]);
    ur = continent([11.679126293239872, 2.644755519268689]);
    ld = continent([11.676845389029227, 0.35307824637606433]);
    ll = continent([9.213572917774014, 0.35414205204417754]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = continent([7.320873711543669, 2.64475551449975]);
    ur = continent([9.213272722738658, 2.645820434679803]);
    ld = continent([9.213422896480349, 1.4999812505283054]);
    ll = continent([7.322014760520787, 1.4989168878985566]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
    ul = continent([7.3220147605302905, 1.4989168783492766]);
    ur = continent([9.213422896481598, 1.499981240979021]);
    ld = continent([9.213572912999604, 0.354142056817247]);
    ll = continent([7.323154615739809, 0.353078251154504]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
  };
  mercatorEquatorialGuinea.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return mercatorEquatorialGuinea.scale(12000);
}

function multiplex$1(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) streams[i].point(x, y);
    },
    sphere: function () {
      var i = -1;
      while (++i < n) streams[i].sphere();
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) streams[i].lineStart();
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) streams[i].lineEnd();
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) streams[i].polygonStart();
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) streams[i].polygonEnd();
    },
  };
}

function albersUk () {
  var cache,
    cacheStream,
    main = d3Geo.geoAlbers().rotate([4.4, 0.8]).center([0, 55.4]).parallels([50, 60]),
    mainPoint,
    shetland = d3Geo.geoAlbers()
      .rotate([4.4, 0.8])
      .center([0, 55.4])
      .parallels([50, 60]),
    shetlandPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };
  function albersUk(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (mainPoint.point(x, y), point) || (shetlandPoint.point(x, y), point)
    );
  }

  albersUk.invert = function (coordinates) {
    var k = main.scale(),
      t = main.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;

    return (
      y >= -0.089 && y < 0.06 && x >= 0.029 && x < 0.046 ? shetland : main
    ).invert(coordinates);
  };

  albersUk.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex$1([
          main.stream((cacheStream = stream)),
          shetland.stream(stream),
        ]));
  };

  albersUk.precision = function (_) {
    if (!arguments.length) return main.precision();
    main.precision(_), shetland.precision(_);
    return reset();
  };

  albersUk.scale = function (_) {
    if (!arguments.length) return main.scale();
    main.scale(_), shetland.scale(_);
    return albersUk.translate(main.translate());
  };

  albersUk.translate = function (_) {
    if (!arguments.length) return main.translate();
    var k = main.scale(),
      x = +_[0],
      y = +_[1];

    mainPoint = main
      .translate(_)
      .clipExtent([
        [x - 0.065 * k, y - 0.089 * k],
        [x + 0.075 * k, y + 0.089 * k],
      ])
      .stream(pointStream);

    shetlandPoint = shetland
      .translate([x + 0.01 * k, y + 0.025 * k])
      .clipExtent([
        [x + 0.029 * k + epsilon, y - 0.089 * k + epsilon],
        [x + 0.046 * k - epsilon, y - 0.06 * k - epsilon],
      ])
      .stream(pointStream);

    return reset();
  };

  albersUk.fitExtent = function (extent, object) {
    return fitExtent(albersUk, extent, object);
  };

  albersUk.fitSize = function (size, object) {
    return fitSize(albersUk, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return albersUk;
  }

  albersUk.drawCompositionBorders = function (context) {
    /*var ul = main.invert([
      shetland.clipExtent()[0][0],
      shetland.clipExtent()[0][1]
    ]);
    var ur = main.invert([
      shetland.clipExtent()[1][0],
      shetland.clipExtent()[0][1]
    ]);
    var ld = main.invert([
      shetland.clipExtent()[1][0],
      shetland.clipExtent()[1][1]
    ]);
    var ll = main.invert([
      shetland.clipExtent()[0][0],
      shetland.clipExtent()[1][1]
    ]);

    console.log("ul = main([" + ul + "]);");
    console.log("ur = main([" + ur + "]);");
    console.log("ld = main([" + ld + "]);");
    console.log("ll = main([" + ll + "]);");

    console.log("context.moveTo(ul[0], ul[1]);");
    console.log("context.lineTo(ur[0], ur[1]);");
    console.log("context.lineTo(ld[0], ld[1]);");
    console.log("context.lineTo(ll[0], ll[1]);");
    console.log("context.closePath();");*/

    var ul, ur, ld, ll;
    ul = main([-1.113205870242365, 59.64920050773357]);
    ur = main([0.807899092399606, 59.59085836472269]);
    ld = main([0.5778611961420386, 57.93467822832577]);
    ll = main([-1.25867782078448, 57.99029450085142]);
    context.moveTo(ul[0], ul[1]);
    context.lineTo(ur[0], ur[1]);
    context.lineTo(ld[0], ld[1]);
    context.lineTo(ll[0], ll[1]);
    context.closePath();
  };
  albersUk.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return albersUk.scale(2800);
}

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex(streams) {
  var n = streams.length;
  return {
    point: function (x, y) {
      var i = -1;
      while (++i < n) {
        streams[i].point(x, y);
      }
    },
    sphere: function () {
      var i = -1;
      while (++i < n) {
        streams[i].sphere();
      }
    },
    lineStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineStart();
      }
    },
    lineEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].lineEnd();
      }
    },
    polygonStart: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonStart();
      }
    },
    polygonEnd: function () {
      var i = -1;
      while (++i < n) {
        streams[i].polygonEnd();
      }
    },
  };
}

// A composite projection for Denmark, configured by default for 960×500.
function transverseMercatorDenmark () {
  var cache,
    cacheStream,
    mainland = d3Geo.geoTransverseMercator().rotate([-10.5, -56]),
    mainlandPoint,
    bornholm = d3Geo.geoTransverseMercator().rotate([-10.5, -56]),
    bornholmPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };


  function transverseMercatorDenmark(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (mainlandPoint.point(x, y), point) ||
        (bornholmPoint.point(x, y), point)    
    );
  }

  transverseMercatorDenmark.invert = function (coordinates) {
    var k = mainland.scale(),
      t = mainland.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;

    
        //How are the return values calculated:

      //  var bornholmBbox= [[14.61, 55.37], [15.29, 54.95]];
      //   console.info("******");
      //   var c0 = bornholm(bornholmBbox[0]);
      //   var x0 = (c0[0] - t[0]) / k;
      //   var y0 = (c0[1] - t[1]) / k;

      //   console.info("p0 bornholm", x0 + ' - ' + y0);

      //   var c1 = bornholm(bornholmBbox[1]);
      //   var x1 = (c1[0] - t[0]) / k;
      //   var y1 = (c1[1] - t[1]) / k;

      //   console.info("p1 bornholm", x1 + ' - ' + y1);

        

    return (
      y >= -0.0302 && y < -0.02331 && x >= 0.015751 && x < 0.022992
        ? bornholm
        : mainland
    ).invert(coordinates);
  };

  transverseMercatorDenmark.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex([
          mainland.stream((cacheStream = stream)),
          bornholm.stream(stream),
        ]));
  };

  transverseMercatorDenmark.precision = function (_) {
    if (!arguments.length) {
      return mainland.precision();
    }
    mainland.precision(_);
    bornholm.precision(_);
    return reset();
  };

  transverseMercatorDenmark.scale = function (_) {
    if (!arguments.length) {
      return mainland.scale();
    }
    mainland.scale(_);
    bornholm.scale(_);
    return transverseMercatorDenmark.translate(mainland.translate());
  };

  transverseMercatorDenmark.translate = function (_) {
    if (!arguments.length) {
      return mainland.translate();
    }
    var k = mainland.scale(),
      x = +_[0],
      y = +_[1];


  //     var mainlandBbox = [[14.61, 55.37], [15.29, 54.95]];
  //        var c0 = mainland(mainlandBbox[0]);
  //  var x0 = (x - c0[0]) / k;
  //  var y0 = (y - c0[1]) / k;

  //  var c1 = mainland(mainlandBbox[1]);
  //  var x1 = (x - c1[0]) / k;
  //  var y1 = (y - c1[1]) / k;

  //  console.info('Mainland: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

    mainlandPoint = mainland
      .translate(_)
      .clipExtent([
        [x - 0.02596 * k, y - 0.03369 * k],
        [x + 0.0248 * k, y + 0.02662 * k],
      ])
      .stream(pointStream);
    bornholmPoint = bornholm
      .translate([x - 0.025 * k, y - 0.04 * k])
      .clipExtent([
        [x + 0.012 * k, y - 0.03369 * k],
        [x + 0.0248 * k, y - 0.02 * k]
      ])
      .stream(pointStream);

    return reset();
  };

  transverseMercatorDenmark.fitExtent = function (extent, object) {
    return fitExtent(transverseMercatorDenmark, extent, object);
  };

  transverseMercatorDenmark.fitSize = function (size, object) {
    return fitSize(transverseMercatorDenmark, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return transverseMercatorDenmark;
  }

  transverseMercatorDenmark.drawCompositionBorders = function (context) {
    
    // console.info("CLIP EXTENT bornholm: ", bornholm.clipExtent());
    // console.info("UL BBOX:", mainland.invert([bornholm.clipExtent()[0][0], bornholm.clipExtent()[0][1]]));
    // console.info("UR BBOX:", mainland.invert([bornholm.clipExtent()[1][0], bornholm.clipExtent()[0][1]]));
    // console.info("LD BBOX:", mainland.invert([bornholm.clipExtent()[1][0], bornholm.clipExtent()[1][1]]));
    // console.info("LL BBOX:", mainland.invert([bornholm.clipExtent()[0][0], bornholm.clipExtent()[1][1]]));

    

    var ulbornholm = mainland([ 11.794751004041888, 57.923711794032755 ]);
    var llbornholm = mainland([ 11.76719252004074, 57.13952856887276 ]);
    var ldbornholm = mainland([ 13.117674446198988, 57.11864895658347 ]);

    context.moveTo(ulbornholm[0], ulbornholm[1]);
    context.lineTo(llbornholm[0], llbornholm[1]);
    context.lineTo(ldbornholm[0], ldbornholm[1]);

    
  };
  transverseMercatorDenmark.getCompositionBorders = function () {
    var context = d3Path.path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return transverseMercatorDenmark.scale(6500);
}

exports.geoAlbersUk = albersUk;
exports.geoAlbersUsa = albersUsa;
exports.geoAlbersUsaTerritories = albersUsaTerritories;
exports.geoConicConformalEurope = conicConformalEurope;
exports.geoConicConformalFrance = conicConformalFrance;
exports.geoConicConformalNetherlands = conicConformalNetherlands;
exports.geoConicConformalPortugal = conicConformalPortugal;
exports.geoConicConformalSpain = conicConformalSpain;
exports.geoConicEquidistantJapan = conicEquidistantJapan;
exports.geoMercatorEcuador = mercatorEcuador;
exports.geoMercatorEquatorialGuinea = mercatorEquatorialGuinea;
exports.geoMercatorMalaysia = mercatorMalaysia;
exports.geoTransverseMercatorChile = transverseMercatorChile;
exports.geoTransverseMercatorDenmark = transverseMercatorDenmark;

}));
