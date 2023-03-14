import { GeoConicProjection } from "d3-geo";
export default function (): number | [number, number] | {
    (coordinates: any): GeoConicProjection;
    invert(coordinates: any): [number, number];
    stream(stream: any): any;
    precision(_: any): number | any;
    scale(_: any): number | [number, number] | any;
    translate(_: any): [number, number] | any;
    fitExtent(extent: any, object: any): any;
    fitSize(size: any, object: any): any;
    drawCompositionBorders(context: any): void;
    getCompositionBorders(): any;
};
//# sourceMappingURL=albersUk.d.ts.map