"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchApp = exports.iframeCall = exports.locationCall = exports.supportLink = exports.enableULink = exports.enableApplink = exports.inBaidu = exports.inQQ = exports.inWeixin = exports.inWeibo = exports.isIos = exports.isAndroid = exports.detector = exports.ua = exports.copy = void 0;
var copy_1 = require("./copy");
Object.defineProperty(exports, "copy", { enumerable: true, get: function () { return copy_1.copy; } });
var detector_1 = require("./detector");
Object.defineProperty(exports, "ua", { enumerable: true, get: function () { return detector_1.ua; } });
Object.defineProperty(exports, "detector", { enumerable: true, get: function () { return detector_1.detector; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "isAndroid", { enumerable: true, get: function () { return utils_1.isAndroid; } });
Object.defineProperty(exports, "isIos", { enumerable: true, get: function () { return utils_1.isIos; } });
Object.defineProperty(exports, "inWeibo", { enumerable: true, get: function () { return utils_1.inWeibo; } });
Object.defineProperty(exports, "inWeixin", { enumerable: true, get: function () { return utils_1.inWeixin; } });
Object.defineProperty(exports, "inQQ", { enumerable: true, get: function () { return utils_1.inQQ; } });
Object.defineProperty(exports, "inBaidu", { enumerable: true, get: function () { return utils_1.inBaidu; } });
Object.defineProperty(exports, "enableApplink", { enumerable: true, get: function () { return utils_1.enableApplink; } });
Object.defineProperty(exports, "enableULink", { enumerable: true, get: function () { return utils_1.enableULink; } });
Object.defineProperty(exports, "supportLink", { enumerable: true, get: function () { return utils_1.supportLink; } });
Object.defineProperty(exports, "locationCall", { enumerable: true, get: function () { return utils_1.locationCall; } });
Object.defineProperty(exports, "iframeCall", { enumerable: true, get: function () { return utils_1.iframeCall; } });
var LaunchApp = /** @class */ (function () {
    function LaunchApp(opt) {
        this.callbackId = 0;
        var tmpConfig = utils_1.deepMerge({}, LaunchApp.defaultConfig);
        this.configs = utils_1.deepMerge(tmpConfig, opt);
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
            if (autodemotion && ((utils_1.isIos && !utils_1.enableULink) || (utils_1.isAndroid && !utils_1.enableApplink))) {
                return scheme;
            }
            return link;
        }
        if (utils_1.isIos || utils_1.isAndroid) {
            return scheme;
        }
        return unknown;
    };
    /**
     * launch app
     * @param {*} opt
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
     * landPage 兜底页
     * callback 端回调方法
     * @param {*} callback: callbackResult
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
                        if (opt.autodemotion && ((utils_1.isIos && !utils_1.enableULink) || (utils_1.isAndroid && !utils_1.enableApplink))) {
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
            utils_1.locationCall(this.options.landPage || this.configs.landPage);
        }
    };
    /**
     * download package
     * opt: {android:'',ios:'',yyk:'',landPage}
     */
    LaunchApp.prototype.download = function (opt) {
        var pkgs = utils_1.deepMerge(this.configs.pkgs, opt);
        if (utils_1.inWeixin) {
            utils_1.locationCall(pkgs.yyb);
        }
        else if (utils_1.isAndroid) {
            utils_1.locationCall(pkgs.android);
        }
        else if (utils_1.isIos) {
            utils_1.locationCall(pkgs.ios);
        }
        else {
            utils_1.locationCall(opt.landPage || this.configs.landPage);
        }
    };
    /**
     * 检验版本
     * @param pageConf {version:''}
     */
    LaunchApp.prototype._checkVersion = function (pageConf) {
        var nums1 = pageConf.version.trim().split('.');
        var nums2 = this.configs.appVersion.trim().split('.');
        var len = Math.max(nums1.length, nums2.length);
        var result = false;
        for (var i = 0; i < len; i++) {
            var n1 = parseInt(nums1[i] || 0);
            var n2 = parseInt(nums2[i] || 0);
            if (n1 > n2) {
                result = false;
                break;
            }
            else if (n1 < n2) {
                result = true;
                break;
            }
            else {
                continue;
            }
        }
        if (!result) {
            var func = this.options.updateTipMethod || this.configs.updateTipMethod;
            func && func();
        }
        return result;
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
                    var protocol = conf.protocol || (utils_1.isIos ? this.configs.deeplink.scheme.ios.protocol : this.configs.deeplink.scheme.android.protocol);
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
    /**
     * callback
     * @param status
     */
    LaunchApp.prototype._callend = function (status) {
        clearTimeout(this.timer);
        var backResult = this.callback && this.callback(status, detector_1.detector, this.openUrl);
        if (status != LaunchApp.openStatus.SUCCESS) {
            switch (backResult) {
                case LaunchApp.callbackResult.DO_NOTING:
                    break;
                case LaunchApp.callbackResult.OPEN_LAND_PAGE:
                    utils_1.locationCall(this.options.landPage || this.configs.landPage);
                    break;
                case LaunchApp.callbackResult.OPEN_APP_STORE:
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
                self._callend(LaunchApp.openStatus.UNKNOWN);
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
                self._callend(LaunchApp.openStatus.UNKNOWN);
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
        useUniversalLink: utils_1.supportLink(),
        useAppLink: utils_1.supportLink(),
        // 不支持link方案时自动降级为scheme方案
        autodemotion: false,
        useYingyongbao: false,
        // 受限引导
        useGuideMethod: utils_1.isAndroid && utils_1.inWeibo,
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
                if (utils_1.isAndroid) {
                    pageMap = this.configs.deeplink.scheme.android;
                }
                else if (utils_1.isIos) {
                    pageMap = this.configs.deeplink.scheme.ios;
                }
                var pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = utils_1.deepMerge(pageConf, opt);
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
                if (utils_1.isIOSWithLocationCallSupport || utils_1.isAndroidWithLocationCallSupport) {
                    utils_1.locationCall(url);
                }
                else {
                    utils_1.iframeCall(url);
                }
            }
        },
        link: {
            preOpen: function (opt) {
                var pageMap = this.configs.deeplink.link;
                var pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = utils_1.deepMerge(pageConf, opt);
                if (pageConf.paramMap) {
                    pageConf.param = this._paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                return this._getUrlFromConf(pageConf, 'link');
            },
            open: function (url) {
                utils_1.locationCall(url);
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
                if (!utils_1.inWeixin && !noTimeout && this.timeoutDownload) {
                    this._setTimeEvent();
                }
                var pkgs = utils_1.deepMerge(this.configs.pkgs, this.options.pkgs);
                if (utils_1.inWeixin && (this.options.useYingyongbao || (this.options.useYingyongbao == undefined && this.configs.useYingyongbao))) {
                    utils_1.locationCall(pkgs.yyb);
                }
                else if (utils_1.isIos) {
                    utils_1.locationCall(pkgs.ios);
                }
                else if (utils_1.isAndroid) {
                    var store = this.configs.pkgs.store, brand = void 0, url = void 0;
                    for (var key in store) {
                        brand = store[key];
                        if (brand && brand.reg.test(detector_1.ua)) {
                            url = this._getUrlFromConf(brand, 'store');
                            utils_1.iframeCall(url);
                            break;
                        }
                    }
                    if (noTimeout && !url) {
                        utils_1.locationCall(this.options.landPage || this.configs.landPage);
                    }
                }
                // 未匹配到商店会走超时逻辑走兜底
            }
        },
        unknown: {
            open: function () {
                utils_1.locationCall(this.options.landPage || this.configs.landPage);
            }
        }
    };
    LaunchApp.openStatus = {
        FAILED: 0,
        SUCCESS: 1,
        UNKNOWN: 2
    };
    LaunchApp.callbackResult = {
        DO_NOTING: 1,
        OPEN_LAND_PAGE: 2,
        OPEN_APP_STORE: 3,
    };
    return LaunchApp;
}());
exports.LaunchApp = LaunchApp;
