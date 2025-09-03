import tape from "tape";
import geoTransverseMercatorDenmark from "../src/transverseMercatorDenmark.js";

tape(
  "geoTransverseMercatorDenmark(point) returns the expected result",
  function (test) {
    var proj = geoTransverseMercatorDenmark();
    var copenhaguen = [12.585888, 55.680229];
    var ronne = [14.704847, 55.098664];
    var paris = [2.3522, 48.8566];

    var inv_copenhaguen = proj.invert(proj(copenhaguen));
    var inv_ronne = proj.invert(proj(ronne));

    test.inDelta(copenhaguen, inv_copenhaguen, 0.1);
    test.inDelta(ronne, inv_ronne, 0.1);
    test.equals(proj(paris), null); //Paris out of range

    test.end();
  }
);

tape(
  "geoTransverseMercatorDenmark.getCompositionBorders() returns the expected result",
  function (test) {
    var borders = geoTransverseMercatorDenmark().getCompositionBorders();
    test.equal(
      (borders.match(/L/g) || []).length,
      2,
      "Number of border lines must be 2"
    );
    test.equal(
      (borders.match(/M/g) || []).length,
      1,
      "Number of borders must be 1"
    );
    test.end();
  }
);
