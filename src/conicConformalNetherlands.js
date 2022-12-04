import { epsilon } from "./math.js";
import {
  geoConicConformal as conicConformal,
  geoMercator as mercator,
} from "d3-geo";
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

// A composite projection for the Netherlands, configured by default for 960×500.
export default function () {
  var cache,
    cacheStream,
    netherlandsMainland = conicConformal()
      .rotate([-5.5, -52.2])
      .parallels([0, 60]),
    netherlandsMainlandPoint,
    bonaire = mercator().center([-68.25, 12.2]),
    bonairePoint,
    sabaSintEustatius = mercator().center([-63.1, 17.5]),
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
      y >= -0.0067 && y < 0.0015 && x >= -0.0232 && x < -0.0154
        ? bonaire
        : y >= -0.022 && y < -0.014 && x >= -0.023 && x < -0.014
        ? sabaSintEustatius
        : netherlandsMainland
    ).invert(coordinates);
  };

  conicConformalNetherlands.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex([
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
    var context = path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return conicConformalNetherlands.scale(4200);
}
