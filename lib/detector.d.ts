export declare class Detector {
    _rules: {
        os: any[];
        browser: any[];
    };
    constructor(rules: any);
    _detect(name: string, expression: any, ua: string): {
        name: string;
        version: string;
        codename: string;
    };
    _parseItem(ua: string, patterns: any[], factory: any, detector: any): void;
    /**
     * parse ua
     * @param ua
     */
    parse(ua: string): any;
}
declare const ua: string;
declare const d: any;
export { d as detector, ua };
