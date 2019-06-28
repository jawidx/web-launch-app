import { copy } from './copy';
import { ua, detector } from './detector';
export { copy, ua, detector };
export declare const isIos: boolean;
export declare const isAndroid: boolean;
export declare const enableULink: boolean;
export declare const enableApplink: boolean;
export declare const inWeixin: boolean;
export declare const inWeibo: boolean;
/**
 * 宿主环境是否支持link
 */
export declare function supportLink(): boolean;
/**
 * iframe call
 * @param url
 */
export declare function iframeCall(url: string): void;
/**
 * location call
 * @param url
 */
export declare function locationCall(url: string): void;
export declare class LaunchApp {
    static defaultConfig: any;
    static openChannel: {
        scheme: {
            preOpen(opt: any): any;
            open: (url: string) => void;
        };
        link: {
            preOpen: (opt: any) => any;
            open: (url: string) => void;
        };
        guide: {
            open: () => void;
        };
        store: {
            open: (noTimeout: any) => void;
        };
        unknown: {
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
    private timer;
    private options;
    private timeoutDownload;
    private callback;
    private openUrl;
    private callbackId;
    constructor(opt: any);
    /**
     * select open method according to the environment and config
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
     * param:{},
     * paramMap:{}
     * scheme:'', for scheme
     * url:'', for link
     * launchType:{
     *     ios:link/scheme/store
     *     android:link/scheme/store
     * }
     * autodemotion
     * guideMethod
     * useYingyongbao
     * updateTipMethod
     * clipboardTxt
     * pkgs:{android:'',ios:'',yyb:'',store:{...}}
     * timeout 是否走超时逻辑,<0表示不走
     * landPage
     * callback 端回调方法
     * },
     * @param {*} callback number(1 nothing,2 landpage,3 store,default download)
     */
    open(opt?: any, callback?: (status: number, detector: any, scheme?: string) => number): void;
    /**
     * download package
     * opt: {android:'',ios:''，yyk:'',landPage}
     */
    download(opt?: any): void;
    /**
     * 检验版本
     * @param pageConf {version:''}
     */
    _checkVersion(pageConf: any): boolean;
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
     * @param type 'scheme link yyb'
     */
    _getUrlFromConf(conf: any, type: string): string;
    _callend(status: number): void;
    /**
     * determine whether or not open successfully
     */
    _setTimeEvent(): void;
}
