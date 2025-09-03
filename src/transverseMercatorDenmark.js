import { geoTransverseMercator as transverseMercator } from "d3-geo";
import { fitExtent, fitSize } from "./fit.js";
import { path } from "d3-path";

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
export default function () {
  var cache,
    cacheStream,
    mainland = transverseMercator().rotate([-10.5, -56]),
    mainlandPoint,
    bornholm = transverseMercator().rotate([-10.5, -56]),
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
    var context = path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return transverseMercatorDenmark.scale(6500);
}
