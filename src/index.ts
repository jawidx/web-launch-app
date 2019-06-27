import { copy } from './copy'
import { ua, detector } from './detector';
export { copy, ua, detector }
export const isIos = detector.os.name === 'ios';
export const isAndroid = detector.os.name === 'android';
export const enableULink = isIos && detector.os.version >= 9;
export const enableApplink = isAndroid && detector.os.version >= 6;
export const inWeixin = detector.browser.name === 'micromessenger';
export const inWeibo = detector.browser.name === 'weibo';

/**
 * 宿主环境是否支持link
 */
export function supportLink() {
    let supportLink = false;
    if (enableApplink) {
        switch (detector.browser.name) {
            case 'chrome':
            case 'samsung':
            case 'zhousi':
                supportLink = true;
                break;
            default:
                supportLink = false;
                break;
        }
    }
    if (enableULink) {
        switch (detector.browser.name) {
            case 'uc':
            case 'qq':
                supportLink = false;
                break;
            default:
                supportLink = true;
                break;
        }
    }
    return supportLink;
}

/**
 * iframe call
 * @param url
 */
export function iframeCall(url: string) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('style', 'display:none');
    document.body.appendChild(iframe);
    setTimeout(function () {
        document.body.removeChild(iframe);
    }, 200);
}

/**
 * location call
 * @param url
 */
export function locationCall(url: string) {
    location.href = url;
}

/**
 * merge object
 */
function deepMerge(firstObj, secondObj) {
    for (var key in secondObj) {
        firstObj[key] = firstObj[key] && firstObj[key].toString() === "[object Object]" ?
            deepMerge(firstObj[key], secondObj[key]) : firstObj[key] = secondObj[key];
    }
    return firstObj;
}

export class LaunchApp {
    static defaultConfig: any = {
        inApp: false,
        appVersion: '',
        // 应用商店包名
        pkgName: '',
        deeplink: {
            scheme: {
                android: {
                    protocol: 'protocol',
                    index: {
                        path: 'path',
                        param: {},
                        paramMap: {
                        },
                        version: ''
                    }
                },
                ios: {
                    protocol: 'protocol',
                    index: {
                        path: 'path',
                        param: {},
                        paramMap: {
                        },
                        version: ''
                    }
                }
            },
            link: {
                index: {
                    url: '',
                    param: {
                    },
                    paramMap: {
                    },
                    version: 0
                }
            },
            yyb: {
                url: 'http://a.app.qq.com/o/simple.jsp',
                param: {
                    pkgname: '',
                    ckey: ''
                }
            }
        },
        pkgs: {
            yyb: '',
            android: '',
            ios: '',
            store: {
                samsung: {
                    reg: /\(.*Android.*(SAMSUNG|SM-|GT-).*\)/,
                    scheme: 'samsungapps://ProductDetail/{id}'
                },
                android: {
                    reg: /\(.*Android.*\)/,
                    scheme: 'market://details?id={id}&a=3'
                }
            }
        },
        // for ios9+(default:true)
        useUniversalLink: true,
        // for android6+(default:true)
        useAppLink: true,
        // 不支持link方案时自动降级为scheme方案
        autodemotion: false,
        useYingyongbao: false,
        // 受限引导
        useGuideMethod: false,
        guideMethod: () => {
            const div = document.createElement('div');
            div.className = 'wx-guide-div'
            div.innerText = '点击右上角->选择"在浏览器中打开"';
            div.style.position = 'fixed'
            div.style.top = '0';
            div.style.left = '0';
            div.style.zIndex = '1111';
            div.style.width = '100vw';
            div.style.height = '100vh';
            div.style.textAlign = 'center';
            div.style.lineHeight = '200px'
            div.style.color = '#fff';
            div.style.fontSize = '20px'
            div.style.backgroundColor = '#000';
            div.style.opacity = '0.7';
            document.body.appendChild(div);
            div.onclick = function () {
                div.remove();
            }
        },
        // 升级提示
        updateTipMethod: () => {
            alert('升级App后才能使用此功能！');
        },
        // 参数前缀
        searchPrefix: (detector: any) => { return '?' },
        // 超时下载, <0表示不使用超时下载
        timeout: 2000,
        // 兜底页面
        landPage: 'https://github.com/jawidx/web-launch-app'
    };
    static openChannel = {
        scheme: {
            preOpen(opt: any) {
                let pageMap: any = {};
                if (isAndroid) {
                    pageMap = this.configs.deeplink.scheme.android;
                } else if (isIos) {
                    pageMap = this.configs.deeplink.scheme.ios;
                }
                let pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = deepMerge(pageConf, opt);
                // 版本检测
                if (this.configs.inApp && pageConf.version && !this._checkVersion(pageConf)) {
                    return '';
                }
                if (pageConf.paramMap) {
                    pageConf.param = this._paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                return this._getUrlFromConf(pageConf, 'scheme');
            },
            open: function (url: string) {
                if (!url) {
                    return;
                }
                if (this.timeoutDownload) {
                    this._setTimeEvent();
                }
                if (detector.browser.name == 'safari' && detector.os.version >= 9 && isIos) {
                    locationCall(url);
                } else if (isAndroid && detector.browser.name == 'chrome' && detector.browser.version > 55) {
                    locationCall(url);
                } else {
                    iframeCall(url);
                }
            }
        },
        link: {
            preOpen: function (opt: any) {
                const pageMap = this.configs.deeplink.link;
                let pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = deepMerge(pageConf, opt);
                if (pageConf.paramMap) {
                    pageConf.param = this._paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                return this._getUrlFromConf(pageConf, 'link');
            },
            open: function (url: string) {
                locationCall(url);
            }
        },
        guide: {
            open: function () {
                let func = this.options.guideMethod || this.configs.guideMethod;
                func && func(detector);
            }
        },
        store: {
            open: function (noTimeout) {
                // 超时处理
                if (!inWeixin && !noTimeout && this.timeoutDownload) {
                    this._setTimeEvent();
                }
                // let pkgs = deepMerge(this.configs.pkgs,this.options.pkgs);
                if (inWeixin && (this.options.useYingyongbao || (this.options.useYingyongbao == undefined && this.configs.useYingyongbao))) {
                    let pageConf = deepMerge(this.configs.deeplink.yyb, { param: this.options.param });
                    locationCall(this._getUrlFromConf(pageConf, 'yyb'));
                    // locationCall(pkgs.yyb);
                } else if (isIos) {
                    locationCall(this.configs.pkgs.ios);
                } else if (isAndroid) {
                    let store = this.configs.pkgs.store, brand, url;
                    for (let key in store) {
                        brand = store[key];
                        if (brand && brand.reg.test(ua)) {
                            url = this._getUrlFromConf(brand, 'store');
                            iframeCall(url);
                            break;
                        }
                    }
                    if (noTimeout && !url) {
                        locationCall(this.options.landPage || this.configs.landPage);
                    }
                }
                // 未匹配到商店会走超时逻辑走兜底
            }
        },
        unknown: {
            open: function () {
                locationCall(this.options.landPage || this.configs.landPage);
            }
        }
    };
    static openStatus = {
        FAILED: 0,
        SUCCESS: 1,
        UNKNOW: 2
    };
    // config
    private configs: any;
    private openMethod: any;
    private timer: any;
    // param
    private options: any;
    private timeoutDownload: boolean;
    private callback: (status: number, detector: any, scheme: string) => number;
    // other
    private openUrl: string
    private callbackId = 0;
    constructor(opt: any) {
        let tmpConfig = deepMerge({}, LaunchApp.defaultConfig);
        this.configs = deepMerge(tmpConfig, opt);
        this.openMethod = this._getOpenMethod();
    }

    /**
     * select open method according to the environment and config
     */
    _getOpenMethod() {
        let { guide, link, scheme, unknown } = LaunchApp.openChannel;
        let { useGuideMethod, useUniversalLink, useAppLink, autodemotion } = this.configs;

        if (useGuideMethod) {
            return guide;
        }
        if (useUniversalLink || useAppLink) {
            if (autodemotion && ((isIos && !enableULink) || (isAndroid && !enableApplink))) {
                return scheme;
            }
            return link;
        }
        if (isIos || isAndroid) {
            return scheme;
        }
        return unknown;
    }

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
    open(opt?: any, callback?: (status: number, detector: any, scheme?: string) => number) {
        try {
            this.options = opt;
            this.callback = callback;
            this.timeoutDownload = opt.timeout >= 0 || (this.configs.timeout >= 0 && opt.timeout == undefined);
            let { scheme, link, guide, store, unknown } = LaunchApp.openChannel;
            let tmpOpenMethod = null, needPro = true;

            // 指定调起方案
            if (opt.useGuideMethod || (this.options.useGuideMethod == undefined && this.configs.useGuideMethod)) {
                tmpOpenMethod = guide;
                needPro = false;
            } else if (opt.launchType) {
                let type = opt.launchType[detector.os.name];
                switch (type) {
                    case 'link':
                        tmpOpenMethod = link;
                        if (opt.autodemotion && ((isIos && !enableULink) || (isAndroid && !enableApplink))) {
                            tmpOpenMethod = scheme;
                        }
                        break;
                    case 'scheme':
                        tmpOpenMethod = scheme;
                        break;
                    case 'store':
                        tmpOpenMethod = store;
                        needPro = false;
                        break;
                    default:
                        tmpOpenMethod = unknown;
                        needPro = false;
                        break;
                }
            }
            tmpOpenMethod = tmpOpenMethod || this.openMethod;

            if (typeof opt.callback === 'function') {
                opt.param = opt.param || {};
                let funcName = '_wla_func_' + (++this.callbackId);
                window[funcName] = function () {
                    opt.callback.apply(window, ([]).slice.call(arguments, 0));
                };
                opt.param['callback'] = funcName;
            } else {
                if (opt.callback) {
                    opt.param['callback'] = callback;
                }
            }

            opt.clipboardTxt && copy(opt.clipboardTxt);
            if (needPro) {
                this.openUrl = tmpOpenMethod.preOpen && tmpOpenMethod.preOpen.call(this, opt || {});
                tmpOpenMethod.open.call(this, this.openUrl);
            } else {
                tmpOpenMethod.open.call(this);
            }
        } catch (e) {
            console.log('launch error:', e);
            locationCall(this.options.landPage || this.configs.landPage);
        }
    }

    /**
     * download package
     * opt: {android:'',ios:''，yyk:'',landPage}
     */
    download(opt?: any) {
        let pkgs = deepMerge(this.configs.pkgs, opt);

        if (inWeixin) {
            locationCall(pkgs.yyb);
        } else if (isAndroid) {
            locationCall(pkgs.android);
        } else if (isIos) {
            locationCall(pkgs.ios);
        } else {
            locationCall(opt.landPage || this.configs.landPage);
        }
    }

    /**
     * 检验版本
     * @param pageConf {version:''}
     */
    _checkVersion(pageConf) {
        if (pageConf.version > this.configs.appVersion) {
            let func = this.options.updateTipMethod || this.configs.updateTipMethod;
            func && func();
            return false;
        }
        return true;
    }

    /**
     * map param (for different platform)
     * @param {*} param 
     * @param {*} paramMap 
     */
    _paramMapProcess(param: any, paramMap: any) {
        if (!paramMap) {
            return param;
        }

        let newParam: any = {};
        for (let k in param) {
            if (paramMap[k]) {
                newParam[paramMap[k]] = param[k];
            } else {
                newParam[k] = param[k];
            }
        }

        return newParam;
    }

    /**
     * generating URL parameters
     * @param {*} obj 
     */
    _stringtifyParams(obj: any) {
        if (!obj) {
            return '';
        }
        let str = '';
        for (let k in obj) {
            if (!obj.hasOwnProperty(k)) {
                continue;
            }
            if (typeof obj[k] == 'object') {
                str += k + '=' + encodeURIComponent(JSON.stringify(obj[k])) + '&';
            } else {
                str += k + '=' + obj[k] + '&';
            }
        };
        return str ? str.substr(0, str.length - 1) : str;
    }

    /**
     * generating URL
     * @param {*} conf 
     * @param type 'scheme link yyb'
     */
    _getUrlFromConf(conf: any, type: string) {
        let paramStr = conf.param && this._stringtifyParams(conf.param);
        let strUrl = '';
        switch (type) {
            case 'link':
                // 对url进行参数处理 'tieba.baidu.com/p/{pid}'
                let url = conf.url;
                const placeholders = url.match(/\{.*?\}/g);
                placeholders && placeholders.forEach((ph: string, i: number) => {
                    const key = ph.substring(1, ph.length - 1);
                    url = url.replace(ph, conf.param[key]);
                    delete conf.param[key];
                });

                strUrl = url + (paramStr ? ((url.indexOf('?') > 0 ? '&' : '?') + paramStr) : '');
                break;
            case 'scheme':
                if (this.options.scheme) {
                    strUrl = this.options.scheme + (paramStr ? ((this.options.scheme.indexOf('?') > 0 ? '&' : this.configs.searchPrefix(detector)) + paramStr) : '');
                } else {
                    let protocol = conf.protocol || (isIos ? this.configs.deeplink.scheme.ios.protocol : this.configs.deeplink.scheme.android.protocol);
                    strUrl = protocol + '://' + conf.path +
                        (paramStr ? this.configs.searchPrefix(detector) + paramStr : '');
                }
                break;
            case 'yyb':
                strUrl = conf.url + (paramStr ? ((conf.url.indexOf('?') > 0 ? '&' : '?') + paramStr) : '');
                break;
            case 'store':
                strUrl = conf.scheme.replace('{id}', conf.pkgName || this.configs.pkgName);
                break;
        }
        return strUrl;
    }

    _callend(status: number) {
        clearTimeout(this.timer);
        const backResult = this.callback && this.callback(status, detector, this.openUrl);
        // 调起失败处理
        if (status != LaunchApp.openStatus.SUCCESS) {
            switch (backResult) {
                case 1:
                    // do nothing
                    break;
                case 2:
                    locationCall(this.options.landPage || this.configs.landPage);
                    break;
                case 3:
                    // 指定参数后续无超时逻辑
                    LaunchApp.openChannel.store.open.call(this, true);
                    break;
                default:
                    this.download(this.options.pkgs);
                    break;
            }
        }
    }

    /**
     * determine whether or not open successfully
     */
    _setTimeEvent() {
        const self = this;
        let haveChange = false;

        let property = 'hidden', eventName = 'visibilitychange';
        if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
            property = 'hidden';
            eventName = 'visibilitychange';
        } else if (typeof (<any>document).msHidden !== 'undefined') {
            property = 'msHidden';
            eventName = 'msvisibilitychange';
        } else if (typeof (<any>document).webkitHidden !== 'undefined') {
            property = 'webkitHidden';
            eventName = 'webkitvisibilitychange';
        }

        const pageChange = function (e) {
            haveChange = true;
            if (document[property] || e.hidden || document.visibilityState == 'hidden') {
                self._callend(LaunchApp.openStatus.SUCCESS);
            } else {
                self._callend(LaunchApp.openStatus.UNKNOW);
            }
            // document.removeEventListener('pagehide', pageChange);
            document.removeEventListener(eventName, pageChange);
            document.removeEventListener('baiduboxappvisibilitychange', pageChange);
        };
        // window.addEventListener('pagehide', pageChange, false);
        document.addEventListener(eventName, pageChange, false);
        document.addEventListener('baiduboxappvisibilitychange', pageChange, false);


        this.timer = setTimeout(function () {
            if (haveChange) {
                return;
            }
            // document.removeEventListener('pagehide', pageChange);
            document.removeEventListener(eventName, pageChange);
            document.removeEventListener('baiduboxappvisibilitychange', pageChange);

            // document.removeEventListener
            if (!document.hidden && !haveChange) {
                self._callend(LaunchApp.openStatus.FAILED);
            } else {
                self._callend(LaunchApp.openStatus.UNKNOW);
            }
            haveChange = true;
        }, this.options.timeout || this.configs.timeout);
    }
}
