export declare class LaunchApp {
    static defaultConfig: {
        scheme: {
            android: {
                index: {
                    protocol: string;
                    path: string;
                    param: {};
                    paramMap: {};
                };
            };
            ios: {
                index: {
                    protocol: string;
                    path: string;
                    param: {};
                    paramMap: {};
                };
            };
        };
        univerlink: {
            index: {
                url: string;
                param: {};
                paramMap: {};
            };
        };
        yingyongbao: {
            url: string;
            param: {
                pkgname: string;
            };
        };
        pkgs: {
            yingyongbao: {
                default: string;
            };
            androidApk: {
                default: string;
            };
            appstore: {
                default: string;
            };
        };
        downPage: string;
        useUniversalLink: boolean;
        tryDown: boolean;
        searchPrefix: (detector: any) => string;
    };
    static openChannel: {
        scheme: {
            preOpen(opt: any): any;
            open: (url: string) => void;
        };
        yingyongbao: {
            preOpen: (opt: any) => any;
            open: (url: string) => void;
        };
        univerlink: {
            preOpen: (opt: any) => any;
            open: (url: string) => void;
        };
    };
    static openStatus: {
        FAILED: number;
        SUCCESS: number;
        UNKNOW: number;
    };
    private configs;
    private openMethod;
    private callback;
    constructor(opt: any);
    /**
     *  设置默认值
     * @param obj 
     * @param property
     * @param defaultValue
     */
    setDefaultProperty(obj: any, property: string, defaultValue: any): void;
    getOpenMethod(): {
        preOpen(opt: any): any;
        open: (url: string) => void;
    };
    /**
     * 唤起
     * @param {page:'index',url:'http://tieba.baidu.com/p/2013',param:{},paramMap:{}} opt
     * @param {*} callback
     */
    open(opt?: any, callback?: (status: number, detector: any) => boolean): void;
    down(): void;
    /**
     * 参数映射（用于处理android与ios参数名不一至问题）
     * @param {*} param
     * @param {*} paramMap
     */
    paramMapProcess(param: any, paramMap: any): any;
    /**
     * 生成url参数
     * @param {*} obj
     */
    stringtifyParams(obj: any): string;
    /**
     * 生成跳转链接
     * @param {*} conf
     */
    getUrlFromConf(conf: any): string;
    callend(status: number): boolean;
    /**
     * 判断是否打开成功
     */
    setTimeEvent(): void;
}
