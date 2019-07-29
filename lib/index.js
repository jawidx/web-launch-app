"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var copy_1 = require("./copy");
exports.copy = copy_1.copy;
var detector_1 = require("./detector");
exports.ua = detector_1.ua;
exports.detector = detector_1.detector;
exports.isIos = detector_1.detector.os.name === 'ios';
exports.isAndroid = detector_1.detector.os.name === 'android';
exports.enableULink = exports.isIos && detector_1.detector.os.version >= 9;
exports.enableApplink = exports.isAndroid && detector_1.detector.os.version >= 6;
exports.inWeixin = detector_1.detector.browser.name === 'micromessenger';
exports.inWeibo = detector_1.detector.browser.name === 'weibo';
/**
 * 宿主环境是否支持link
 */
function supportLink() {
    var supportLink = false;
    if (exports.enableApplink) {
        switch (detector_1.detector.browser.name) {
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
    if (exports.enableULink) {
        switch (detector_1.detector.browser.name) {
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
exports.supportLink = supportLink;
/**
 * iframe call
 * @param url
 */
function iframeCall(url) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('style', 'display:none');
    document.body.appendChild(iframe);
    setTimeout(function () {
        document.body.removeChild(iframe);
    }, 200);
}
exports.iframeCall = iframeCall;
/**
 * location call
 * @param url
 */
function locationCall(url) {
    location.href = url;
}
exports.locationCall = locationCall;
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
var LaunchApp = /** @class */ (function () {
    function LaunchApp(opt) {
        this.callbackId = 0;
        var tmpConfig = deepMerge({}, LaunchApp.defaultConfig);
        this.configs = deepMerge(tmpConfig, opt);
        this.openMethod = this._getOpenMethod();
    }
    /**
     * select open method according to the environment and config
     */
    LaunchApp.prototype._getOpenMethod = function () {
        var _a = LaunchApp.openChannel, guide = _a.guide, link = _a.link, scheme = _a.scheme, unknown = _a.unknown;
        var _b = this.configs, useGuideMethod = _b.useGuideMethod, useUniversalLink = _b.useUniversalLink, useAppLink = _b.useAppLink, autodemotion = _b.autodemotion;
        if (useGuideMethod) {
            return guide;
        }
        if (useUniversalLink || useAppLink) {
            if (autodemotion && ((exports.isIos && !exports.enableULink) || (exports.isAndroid && !exports.enableApplink))) {
                return scheme;
            }
            return link;
        }
        if (exports.isIos || exports.isAndroid) {
            return scheme;
        }
        return unknown;
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
    LaunchApp.prototype.open = function (opt, callback) {
        try {
            this.options = opt;
            this.callback = callback;
            this.timeoutDownload = opt.timeout >= 0 || (this.configs.timeout >= 0 && opt.timeout == undefined);
            var _a = LaunchApp.openChannel, scheme = _a.scheme, link = _a.link, guide = _a.guide, store = _a.store, unknown = _a.unknown;
            var tmpOpenMethod = null, needPro = true;
            // 指定调起方案
            if (opt.useGuideMethod || (this.options.useGuideMethod == undefined && this.configs.useGuideMethod)) {
                tmpOpenMethod = guide;
                needPro = false;
            }
            else if (opt.launchType) {
                var type = opt.launchType[detector_1.detector.os.name];
                switch (type) {
                    case 'link':
                        tmpOpenMethod = link;
                        if (opt.autodemotion && ((exports.isIos && !exports.enableULink) || (exports.isAndroid && !exports.enableApplink))) {
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
                var funcName = '_wla_func_' + (++this.callbackId);
                window[funcName] = function () {
                    opt.callback.apply(window, ([]).slice.call(arguments, 0));
                };
                opt.param['callback'] = funcName;
            }
            else {
                if (opt.callback) {
                    opt.param['callback'] = callback;
                }
            }
            opt.clipboardTxt && copy_1.copy(opt.clipboardTxt);
            if (needPro) {
                this.openUrl = tmpOpenMethod.preOpen && tmpOpenMethod.preOpen.call(this, opt || {});
                tmpOpenMethod.open.call(this, this.openUrl);
            }
            else {
                tmpOpenMethod.open.call(this);
            }
        }
        catch (e) {
            console.log('launch error:', e);
            locationCall(this.options.landPage || this.configs.landPage);
        }
    };
    /**
     * download package
     * opt: {android:'',ios:''，yyk:'',landPage}
     */
    LaunchApp.prototype.download = function (opt) {
        var pkgs = deepMerge(this.configs.pkgs, opt);
        if (exports.inWeixin) {
            locationCall(pkgs.yyb);
        }
        else if (exports.isAndroid) {
            locationCall(pkgs.android);
        }
        else if (exports.isIos) {
            locationCall(pkgs.ios);
        }
        else {
            locationCall(opt.landPage || this.configs.landPage);
        }
    };
    /**
     * 检验版本
     * @param pageConf {version:''}
     */
    LaunchApp.prototype._checkVersion = function (pageConf) {
        if (pageConf.version > this.configs.appVersion) {
            var func = this.options.updateTipMethod || this.configs.updateTipMethod;
            func && func();
            return false;
        }
        return true;
    };
    /**
     * map param (for different platform)
     * @param {*} param
     * @param {*} paramMap
     */
    LaunchApp.prototype._paramMapProcess = function (param, paramMap) {
        if (!paramMap) {
            return param;
        }
        var newParam = {};
        for (var k in param) {
            if (paramMap[k]) {
                newParam[paramMap[k]] = param[k];
            }
            else {
                newParam[k] = param[k];
            }
        }
        return newParam;
    };
    /**
     * generating URL parameters
     * @param {*} obj
     */
    LaunchApp.prototype._stringtifyParams = function (obj) {
        if (!obj) {
            return '';
        }
        var str = '';
        for (var k in obj) {
            if (!obj.hasOwnProperty(k)) {
                continue;
            }
            if (typeof obj[k] == 'object') {
                str += k + '=' + encodeURIComponent(JSON.stringify(obj[k])) + '&';
            }
            else {
                str += k + '=' + encodeURIComponent(obj[k]) + '&';
            }
        }
        ;
        return str ? str.substr(0, str.length - 1) : str;
    };
    /**
     * generating URL
     * @param {*} conf
     * @param type 'scheme link yyb'
     */
    LaunchApp.prototype._getUrlFromConf = function (conf, type) {
        var paramStr = conf.param && this._stringtifyParams(conf.param);
        var strUrl = '';
        switch (type) {
            case 'link':
                // 对url进行参数处理 'tieba.baidu.com/p/{pid}'
                var url_1 = conf.url;
                var placeholders = url_1.match(/\{.*?\}/g);
                placeholders && placeholders.forEach(function (ph, i) {
                    var key = ph.substring(1, ph.length - 1);
                    url_1 = url_1.replace(ph, conf.param[key]);
                    delete conf.param[key];
                });
                strUrl = url_1 + (paramStr ? ((url_1.indexOf('?') > 0 ? '&' : '?') + paramStr) : '');
                break;
            case 'scheme':
                if (this.options.scheme) {
                    strUrl = this.options.scheme + (paramStr ? ((this.options.scheme.indexOf('?') > 0 ? '&' : this.configs.searchPrefix(detector_1.detector)) + paramStr) : '');
                }
                else {
                    var protocol = conf.protocol || (exports.isIos ? this.configs.deeplink.scheme.ios.protocol : this.configs.deeplink.scheme.android.protocol);
                    strUrl = protocol + '://' + conf.path +
                        (paramStr ? this.configs.searchPrefix(detector_1.detector) + paramStr : '');
                }
                break;
            case 'store':
                strUrl = conf.scheme.replace('{id}', conf.pkgName || this.configs.pkgName);
                break;
        }
        return strUrl;
    };
    LaunchApp.prototype._callend = function (status) {
        clearTimeout(this.timer);
        var backResult = this.callback && this.callback(status, detector_1.detector, this.openUrl);
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
    };
    /**
     * determine whether or not open successfully
     */
    LaunchApp.prototype._setTimeEvent = function () {
        var self = this;
        var haveChange = false;
        var property = 'hidden', eventName = 'visibilitychange';
        if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
            property = 'hidden';
            eventName = 'visibilitychange';
        }
        else if (typeof document.msHidden !== 'undefined') {
            property = 'msHidden';
            eventName = 'msvisibilitychange';
        }
        else if (typeof document.webkitHidden !== 'undefined') {
            property = 'webkitHidden';
            eventName = 'webkitvisibilitychange';
        }
        var pageChange = function (e) {
            haveChange = true;
            if (document[property] || e.hidden || document.visibilityState == 'hidden') {
                self._callend(LaunchApp.openStatus.SUCCESS);
            }
            else {
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
            }
            else {
                self._callend(LaunchApp.openStatus.UNKNOW);
            }
            haveChange = true;
        }, this.options.timeout || this.configs.timeout);
    };
    LaunchApp.defaultConfig = {
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
                        paramMap: {},
                        version: ''
                    }
                },
                ios: {
                    protocol: 'protocol',
                    index: {
                        path: 'path',
                        param: {},
                        paramMap: {},
                        version: ''
                    }
                }
            },
            link: {
                index: {
                    url: '',
                    param: {},
                    paramMap: {},
                    version: 0
                }
            }
        },
        pkgs: {
            yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.haokan&ckey=',
            ios: 'https://itunes.apple.com/cn/app/id1092031003?mt=8',
            android: '',
            store: {
                samsung: {
                    reg: /\(.*Android.*(SAMSUNG|SM-|GT-).*\)/,
                    scheme: 'samsungapps://ProductDetail/{id}'
                },
                android: {
                    reg: /\(.*Android.*\)/,
                    scheme: 'market://details?id={id}'
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
        useGuideMethod: exports.isAndroid && (exports.inWeixin || exports.inWeibo),
        guideMethod: function () {
            var div = document.createElement('div');
            div.className = 'wx-guide-div';
            div.innerText = '点击右上角->选择"在浏览器中打开"';
            div.style.position = 'fixed';
            div.style.top = '0';
            div.style.left = '0';
            div.style.zIndex = '1111';
            div.style.width = '100vw';
            div.style.height = '100vh';
            div.style.textAlign = 'center';
            div.style.lineHeight = '200px';
            div.style.color = '#fff';
            div.style.fontSize = '20px';
            div.style.backgroundColor = '#000';
            div.style.opacity = '0.7';
            document.body.appendChild(div);
            div.onclick = function () {
                div.remove();
            };
        },
        // 升级提示
        updateTipMethod: function () {
            alert('升级App后才能使用此功能！');
        },
        // 参数前缀
        searchPrefix: function (detector) { return '?'; },
        // 超时下载, <0表示不使用超时下载
        timeout: 2000,
        // 兜底页面
        landPage: 'https://github.com/jawidx/web-launch-app'
    };
    LaunchApp.openChannel = {
        scheme: {
            preOpen: function (opt) {
                var pageMap = {};
                if (exports.isAndroid) {
                    pageMap = this.configs.deeplink.scheme.android;
                }
                else if (exports.isIos) {
                    pageMap = this.configs.deeplink.scheme.ios;
                }
                var pageConf = pageMap[opt.page] || pageMap['index'];
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
            open: function (url) {
                if (!url) {
                    return;
                }
                if (this.timeoutDownload) {
                    this._setTimeEvent();
                }
                if (detector_1.detector.browser.name == 'safari' && detector_1.detector.os.version >= 9 && exports.isIos) {
                    locationCall(url);
                }
                else if (exports.isAndroid && detector_1.detector.browser.name == 'chrome' && detector_1.detector.browser.version > 55) {
                    locationCall(url);
                }
                else {
                    iframeCall(url);
                }
            }
        },
        link: {
            preOpen: function (opt) {
                var pageMap = this.configs.deeplink.link;
                var pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = deepMerge(pageConf, opt);
                if (pageConf.paramMap) {
                    pageConf.param = this._paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                return this._getUrlFromConf(pageConf, 'link');
            },
            open: function (url) {
                locationCall(url);
            }
        },
        guide: {
            open: function () {
                var func = this.options.guideMethod || this.configs.guideMethod;
                func && func(detector_1.detector);
            }
        },
        store: {
            open: function (noTimeout) {
                // 超时处理
                if (!exports.inWeixin && !noTimeout && this.timeoutDownload) {
                    this._setTimeEvent();
                }
                var pkgs = deepMerge(this.configs.pkgs, this.options.pkgs);
                if (exports.inWeixin && (this.options.useYingyongbao || (this.options.useYingyongbao == undefined && this.configs.useYingyongbao))) {
                    locationCall(pkgs.yyb);
                }
                else if (exports.isIos) {
                    locationCall(pkgs.ios);
                }
                else if (exports.isAndroid) {
                    var store = this.configs.pkgs.store, brand = void 0, url = void 0;
                    for (var key in store) {
                        brand = store[key];
                        if (brand && brand.reg.test(detector_1.ua)) {
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
    LaunchApp.openStatus = {
        FAILED: 0,
        SUCCESS: 1,
        UNKNOW: 2
    };
    return LaunchApp;
}());
exports.LaunchApp = LaunchApp;
