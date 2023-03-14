export default boundsStream;
declare namespace boundsStream {
    export { boundsPoint as point };
    export { noop as lineStart };
    export { noop as lineEnd };
    export { noop as polygonStart };
    export { noop as polygonEnd };
    export function result(): number[][];
}
declare function boundsPoint(x: any, y: any): void;
declare function noop(): void;
//# sourceMappingURL=bounds.d.ts.map