import { GeoProjection } from "d3-geo";

interface GeoCompositeProjection extends GeoProjection {
  getCompositionBorders: () => string;
  drawCompositionBorders: (context: CanvasRenderingContext2D | Path2D) => void;
}

export function geoAlbersUsa(): GeoCompositeProjection;
export function geoAlbersUsaTerritories(): GeoCompositeProjection;
export function geoConicConformalSpain(): GeoCompositeProjection;
export function geoConicConformalPortugal(): GeoCompositeProjection;
export function geoMercatorEcuador(): GeoCompositeProjection;
export function geoTransverseMercatorChile(): GeoCompositeProjection;
export function geoConicEquidistantJapan(): GeoCompositeProjection;
export function geoConicConformalFrance(): GeoCompositeProjection;
export function geoConicConformalEurope(): GeoCompositeProjection;
export function geoConicConformalNetherlands(): GeoCompositeProjection;
export function geoMercatorMalaysia(): GeoCompositeProjection;
export function geoMercatorEquatorialGuinea(): GeoCompositeProjection;
export function geoAlbersUk(): GeoCompositeProjection;
export function geoTransverseMercatorDenmark(): GeoCompositeProjection;
