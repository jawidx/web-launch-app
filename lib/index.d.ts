import 'core-js/fn/object/assign';
export declare class LaunchApp {
    static defaultConfig: any;
    static openChannel: {
        scheme: {
            preOpen(opt: any): any;
            open: (url: string) => void;
        };
        univerlink: {
            preOpen: (opt: any) => any;
            open: (url: string) => void;
        };
        yingyongbao: {
            preOpen: (opt: any) => any;
            open: (url: string) => void;
        };
        weixin: {
            open: () => void;
        };
        appstore: {
            open: () => void;
        };
    };
    static openStatus: {
        FAILED: number;
        SUCCESS: number;
        UNKNOW: number;
    };
    private configs;
    private openMethod;
    private options;
    private callback;
    constructor(opt: any);
    /**
     * select open method according to the environment
     */
    _getOpenMethod(): {
        preOpen(opt: any): any;
        open: (url: string) => void;
    } | {
        open: () => void;
    };
    /**
     * launch app
     * @param {*} opt
     * {
     * page:'index',
     * url:'http://tieba.baidu.com/', for universallink
     * param:{},
     * openMethod:'weixin'|'yingyongbao'|'scheme'|'univerlink'|'appstore'
     * pkgs:{android:'',ios:''}
     * },
     * paramMap:{}
     * @param {*} callback return true for timeout download
     */
    open(opt?: any, callback?: (status: number, detector: any) => boolean): void;
    /**
     * down package
     * {
     * pkgs:{android:'',ios:''}
     * }
     */
    down(opt?: any): void;
    /**
     * map param (for different platform)
     * @param {*} param
     * @param {*} paramMap
     */
    _paramMapProcess(param: any, paramMap: any): any;
    /**
     * generating URL parameters
     * @param {*} obj
     */
    _stringtifyParams(obj: any): string;
    /**
     * generating URL
     * @param {*} conf
     */
    _getUrlFromConf(conf: any): string;
    _callend(status: number): boolean;
    /**
     * determine whether or not open successfully
     */
    _setTimeEvent(): void;
}
