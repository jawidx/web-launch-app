"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("core-js/fn/object/assign");
var detector_1 = require("./detector");
/**
 * iframe call
 * @param url
 */
var iframeCall = function (url) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('style', 'display:none');
    document.body.appendChild(iframe);
    setTimeout(function () {
        document.body.removeChild(iframe);
    }, 200);
};
/**
 * location call
 * @param url
 */
function locationCall(url) {
    location.href = url;
}
var LaunchApp = /** @class */ (function () {
    function LaunchApp(opt) {
        this.configs = Object.assign(LaunchApp.defaultConfig, opt);
        this.openMethod = this._getOpenMethod();
    }
    /**
     * select open method according to the environment
     */
    LaunchApp.prototype._getOpenMethod = function () {
        if (detector_1.detector.browser.name === 'micromessenger' && !this.configs.useYingyongbao) {
            return LaunchApp.openChannel.weixin;
        }
        else if (detector_1.detector.browser.name === 'micromessenger'
            && (detector_1.detector.os.name === 'android' || !this.configs.useUniversalLink)) {
            return LaunchApp.openChannel.yingyongbao;
        }
        else if (this.configs.useUniversalLink && detector_1.detector.os.name === 'ios' && detector_1.detector.os.version >= 9) {
            return LaunchApp.openChannel.univerlink;
        }
        return LaunchApp.openChannel.scheme;
    };
    /**
     * launch app
     * @param {page:'index',url:'http://tieba.baidu.com/',param:{},paramMap:{}} opt
     * @param {*} callback
     */
    LaunchApp.prototype.open = function (opt, callback) {
        try {
            this.options = opt;
            this.callback = callback;
            var tmpOpenMethod = null;
            if (this.options.openMethod) {
                switch (this.options.openMethod) {
                    case 'weixin':
                        tmpOpenMethod = LaunchApp.openChannel.weixin;
                        break;
                    case 'yingyongbao':
                        tmpOpenMethod = LaunchApp.openChannel.yingyongbao;
                        break;
                    case 'scheme':
                        tmpOpenMethod = LaunchApp.openChannel.scheme;
                        break;
                    case 'univerlink':
                        tmpOpenMethod = LaunchApp.openChannel.univerlink;
                        break;
                }
            }
            else {
                tmpOpenMethod = this.openMethod;
            }
            var openUrl = tmpOpenMethod.preOpen
                && tmpOpenMethod.preOpen.call(this, opt || {});
            tmpOpenMethod.open
                && tmpOpenMethod.open.call(this, openUrl);
        }
        catch (e) {
            console.log('error:', e);
            locationCall(this.configs.downPage);
        }
    };
    /**
     * down package
     */
    LaunchApp.prototype.down = function (opt) {
        this.options = opt;
        var pkgUrl;
        if (detector_1.detector.browser.name == 'micromessenger' || detector_1.detector.browser.name == 'qq') {
            pkgUrl = this.configs.pkgs.yingyongbao[detector_1.detector.browser.name];
            locationCall(pkgUrl || this.configs.pkgs.yingyongbao['default']);
        }
        else if (detector_1.detector.os.name === 'android') {
            if (this.options && this.options.pkgs && this.options.pkgs.android) {
                pkgUrl = this.options.pkgs.android;
            }
            else {
                pkgUrl = this.configs.pkgs.androidApk[detector_1.detector.browser.name];
            }
            locationCall(pkgUrl || this.configs.pkgs.androidApk['default']);
        }
        else if (detector_1.detector.os.name === 'ios') {
            if (this.options && this.options.pkgs && this.options.pkgs.ios) {
                pkgUrl = this.options.pkgs.ios;
            }
            else {
                pkgUrl = this.configs.pkgs.appstore[detector_1.detector.browser.name];
            }
            locationCall(pkgUrl || this.configs.pkgs.appstore['default']);
        }
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
        var s = '';
        var otherObj = {};
        for (var k in obj) {
            if (!obj.hasOwnProperty(k)) {
                continue;
            }
            s += (k + '=' + obj[k] + '&');
        }
        ;
        return s ? s.substr(0, s.length - 1) : s;
    };
    /**
     * generating URL
     * @param {*} conf
     */
    LaunchApp.prototype._getUrlFromConf = function (conf) {
        var paramStr = this._stringtifyParams(conf.param);
        if (conf.url) {
            // 对url进行参数处理 'tieba.baidu.com/p/{pid}'
            var url_1 = conf.url;
            var placeholders = url_1.match(/\{.*?\}/g);
            placeholders && placeholders.forEach(function (ph, i) {
                var key = ph.substring(1, ph.length - 1);
                url_1 = url_1.replace(ph, conf.param[key]);
                delete conf.param[key];
            });
            paramStr = this._stringtifyParams(conf.param);
            return url_1 + (paramStr ? ((url_1.indexOf('?') > 0 ? '&' : '?') + paramStr) : '');
        }
        return conf.protocol + '://' +
            (conf.host ? conf.host + '/' + conf.path : conf.path) +
            (paramStr ? this.configs.searchPrefix() + paramStr : '');
    };
    LaunchApp.prototype._callend = function (status) {
        return this.callback && this.callback(status, detector_1.detector);
    };
    /**
     * determine whether or not open successfully
     */
    LaunchApp.prototype._setTimeEvent = function () {
        var self = this;
        var haveChange = false;
        var change = function () {
            haveChange = true;
            if (document.hidden) {
                self._callend(LaunchApp.openStatus.SUCCESS);
            }
            else {
                var backResult = self._callend(LaunchApp.openStatus.UNKNOW);
                backResult && self.down(self.options);
            }
            document.removeEventListener('visibilitychange', change);
        };
        document.addEventListener("visibilitychange", change, false);
        var timer = setTimeout(function () {
            if (haveChange) {
                return;
            }
            document.removeEventListener('visibilitychange', change);
            var backResult = true;
            if (!document.hidden && !haveChange) {
                backResult = self._callend(LaunchApp.openStatus.FAILED);
            }
            else {
                backResult = self._callend(LaunchApp.openStatus.UNKNOW);
            }
            haveChange = true;
            backResult && self.down(self.options);
        }, this.configs.timeout);
    };
    LaunchApp.defaultConfig = {
        openMethod: '',
        scheme: {
            android: {
                index: {
                    protocol: '',
                    path: '',
                    param: {},
                    paramMap: {}
                },
            },
            ios: {
                index: {
                    protocol: '',
                    path: '',
                    param: {},
                    paramMap: {}
                }
            }
        },
        univerlink: {
            index: {
                url: '',
                param: {},
                paramMap: {}
            }
        },
        yingyongbao: {
            url: 'http://a.app.qq.com/o/simple.jsp',
            param: {
                pkgname: ''
            }
        },
        // config package for different browser
        pkgs: {
            yingyongbao: {
                default: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513',
            },
            androidApk: {
                default: 'https://downpack.baidu.com/baidutieba_AndroidPhone_v8.8.8.6(8.8.8.6)_1020584c.apk',
            },
            appstore: {
                default: 'https://itunes.apple.com/app/apple-store/id477927812?pt=328057&ct=MobileQQ_LXY&mt=8',
            }
        },
        // use UniversalLink for ios9+(default:true)
        useUniversalLink: true,
        // guide to explorer when open in wechat
        wxGuideMethod: null,
        useYingyongbao: true,
        // the parameter prefix(default is question mark, you can define something else)
        searchPrefix: function (detector) { return '?'; },
        // download after attempting to adjust timeout
        timeout: 2000,
        // download page url（boot the user to download or download installation packages directly）
        // jump to download page when it cant't find a corresponding configuration or get a error
        downPage: 'http://tieba.baidu.com/mo/q/activityDiversion/download',
    };
    LaunchApp.openChannel = {
        scheme: {
            preOpen: function (opt) {
                var pageMap = {};
                if (detector_1.detector.os.name === 'android') {
                    pageMap = this.configs.scheme.android;
                }
                else if (detector_1.detector.os.name === 'ios') {
                    pageMap = this.configs.scheme.ios;
                }
                var pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = Object.assign({}, pageConf, opt);
                if (pageConf.paramMap) {
                    pageConf.param = this._paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                return this._getUrlFromConf(pageConf);
            },
            open: function (url) {
                this._setTimeEvent();
                if (detector_1.detector.os.name === 'ios' && detector_1.detector.browser.name == 'safari') {
                    locationCall(url);
                }
                else {
                    iframeCall(url);
                }
            }
        },
        univerlink: {
            preOpen: function (opt) {
                if (opt.url) {
                    return this._getUrlFromConf(opt);
                }
                var pageMap = this.configs.univerlink;
                var pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = Object.assign({}, pageConf, opt);
                if (pageConf.paramMap) {
                    pageConf.param = this._paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                if (!opt.page) {
                    pageConf.url = 'https://' + (this.configs.host || location.host);
                }
                return this._getUrlFromConf(pageConf);
            },
            open: function (url) {
                locationCall(url);
            }
        },
        yingyongbao: {
            preOpen: function (opt) {
                return this._getUrlFromConf(this.configs.yingyongbao);
            },
            open: function (url) {
                locationCall(url);
            }
        },
        weixin: {
            open: function () {
                this.configs.wxGuideMethod && this.configs.wxGuideMethod(detector_1.detector);
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
