import {epsilon} from "./math";
import {geoMercator as mercator} from "d3-geo";
import {path} from "d3-path";


// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex(streams) {
  var n = streams.length;
  return {
    point: function(x, y) { var i = -1; while (++i < n) {streams[i].point(x, y); }},
    sphere: function() { var i = -1; while (++i < n) {streams[i].sphere(); }},
    lineStart: function() { var i = -1; while (++i < n) {streams[i].lineStart(); }},
    lineEnd: function() { var i = -1; while (++i < n) {streams[i].lineEnd(); }},
    polygonStart: function() { var i = -1; while (++i < n) {streams[i].polygonStart(); }},
    polygonEnd: function() { var i = -1; while (++i < n) {streams[i].polygonEnd(); }}
  };
}

// A composite projection for Malaysia, configured by default for 960×500.
export default function() {
  var cache,
      cacheStream,

      borneo = mercator().rotate([111.80, 4.52]), borneoPoint,
      peninsular = mercator().rotate([107.05, 3.32]), peninsularPoint,

      point, pointStream = {point: function(x, y) { point = [x, y]; }};

      /*
      var borneoBbox = [[104.239524761889271, 8.538173766531786], [119.511087004633197, 0.584235098435993]];
      var peninsularBbox = [[99.327383057797917, 7.199538686582339], [104.576982578741138, -0.754399981513454]];
      */

  function mercatorMalaysia(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    return point = null,
        (borneoPoint.point(x, y), point) ||
        (peninsularPoint.point(x, y), point);
  }

  mercatorMalaysia.invert = function(coordinates) {
    var k = borneo.scale(),
        t = borneo.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
        /*
        //How are the return values calculated:
        var c0 = peninsular(peninsularBbox[0]);
        var x0 = (c0[0] - t[0]) / k;
        var y0 = (c0[1] - t[1]) / k;

        console.info("p0 peninsular", x0 + ' - ' + y0);


        var c1 = peninsular(peninsularBbox[1]);
        var x1 = (c1[0] - t[0]) / k;
        var y1 = (c1[1] - t[1]) / k;

        console.info("p1 peninsular", x1 + ' - ' + y1);
        */
        return (y >= -0.0695 && y < 0.0695 && x >= -0.1334  && x < -0.0415 ? peninsular
            : borneo).invert(coordinates);
  };

  mercatorMalaysia.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex([borneo.stream(cacheStream = stream), peninsular.stream(stream)]);
  };

  mercatorMalaysia.precision = function(_) {
    if (!arguments.length) {return borneo.precision();}
    borneo.precision(_);
    peninsular.precision(_);
    return mercatorMalaysia;
  };

  mercatorMalaysia.scale = function(_) {
    if (!arguments.length) {return borneo.scale();}
    borneo.scale(_);
    peninsular.scale(_);
    return mercatorMalaysia.translate(borneo.translate());
  };

  mercatorMalaysia.translate = function(_) {
    if (!arguments.length) {return borneo.translate();}
    var k = borneo.scale(), x = +_[0], y = +_[1];
    /*
    var c0 = borneo(borneoBbox[0]);
   var x0 = (x - c0[0]) / k;
   var y0 = (y - c0[1]) / k;

   var c1 = borneo(borneoBbox[1]);
   var x1 = (x - c1[0]) / k;
   var y1 = (y - c1[1]) / k;

   console.info('borneo: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   console.info('.clipExtent([[x '+
    (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
    ' * k, y '+
    (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
    ' * k],[x '+
    (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
    ' * k, y '+
    (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
    ' * k]])');

   c0 = peninsular.translate([x - 0.06 * k, y - 0.04 * k])(peninsularBbox[0]);
   x0 = (x - c0[0]) / k;
   y0 = (y - c0[1]) / k;

   c1 = peninsular.translate([x - 0.06 * k, y - 0.04 * k])(peninsularBbox[1]);
   x1 = (x - c1[0]) / k;
   y1 = (y - c1[1]) / k;

   console.info('peninsular: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
   console.info('.clipExtent([[x '+
    (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
    ' * k + epsilon, y '+
    (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
    ' * k + epsilon],[x '+
    (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
    ' * k - epsilon, y '+
    (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
    ' * k - epsilon]])');*/

    borneoPoint = borneo
        .translate(_)
        .clipExtent([[x - 0.0415 * k, y - 0.0695 * k],[x + 0.1334 * k, y + 0.0695 * k]])
        .stream(pointStream);

    peninsularPoint = peninsular
        .translate([x - 0.0 * k, y - 0.0 * k])
        .clipExtent([[x - 0.1334 * k + epsilon, y - 0.0695 * k + epsilon],[x - 0.0415 * k - epsilon, y + 0.0695 * k - epsilon]])
        .stream(pointStream);

    return mercatorMalaysia;
  };

  mercatorMalaysia.drawCompositionBorders = function(context) {
    /*
    console.info("CLIP EXTENT: ", peninsular.clipExtent());
    console.info("UL BBOX:", borneo.invert([peninsular.clipExtent()[0][0], peninsular.clipExtent()[0][1]]));
    console.info("UR BBOX:", borneo.invert([peninsular.clipExtent()[1][0], peninsular.clipExtent()[0][1]]));
    console.info("LD BBOX:", borneo.invert([peninsular.clipExtent()[1][0], peninsular.clipExtent()[1][1]]));
    console.info("LL BBOX:", borneo.invert([peninsular.clipExtent()[0][0], peninsular.clipExtent()[1][1]]));
    */

    var ulpeninsular = borneo([110.308255685355, 4.149758991811]);
    var urpeninsular = borneo([109.625125759531, 2.62017930184868]);
    var ldpeninsular = borneo([108.832559269358, 1.95400586832273]);
    var llpeninsular = borneo([107.803743712202, 1.76141802131417]);

    context.moveTo(ulpeninsular[0], ulpeninsular[1]);
    context.lineTo(urpeninsular[0], urpeninsular[1]);
    context.lineTo(ldpeninsular[0], ldpeninsular[1]);
    context.lineTo(llpeninsular[0], llpeninsular[1]);
    context.closePath();

  };
  mercatorMalaysia.getCompositionBorders = function() {
    var context = path();
    this.drawCompositionBorders(context);
    return context.toString();
  };

  return mercatorMalaysia.scale(3600);
}
