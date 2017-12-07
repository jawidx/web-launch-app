"use strict";
var detector = require('detector');
/**
 * iframe调起app
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
 * location方式调起app
 * @param url
 */
function locationCall(openUrl) {
    location.href = openUrl;
}
var LaunchApp = (function () {
    function LaunchApp(opt) {
        this.configs = Object.assign(LaunchApp.defaultConfig, opt);
        for (var key in this.configs) {
            if (typeof this.configs[key] === 'function') {
                this.configs[key] = this.configs[key](detector);
            }
        }
        var defaultProtocol = location.host.split('.').reverse().join('.');
        this.setDefaultProperty(this.configs.scheme.android.index, 'protocol', defaultProtocol);
        this.setDefaultProperty(this.configs.scheme.ios.index, 'protocol', defaultProtocol);
        this.setDefaultProperty(this.configs.univerlink.index, 'url', 'https://' + location.host);
        this.setDefaultProperty(this.configs.yingyongbao.param, 'pkgname', defaultProtocol);
        this.openMethod = this.getOpenMethod();
    }
    /**
     *  设置默认值
     * @param obj 
     * @param property
     * @param defaultValue
     */
    LaunchApp.prototype.setDefaultProperty = function (obj, property, defaultValue) {
        if (obj && !obj[property]) {
            property = defaultValue;
        }
        if (!obj) {
            obj = {
                property: defaultValue
            };
        }
    };
    LaunchApp.prototype.getOpenMethod = function () {
        if ((detector.os.name === 'android' || !this.configs.useUniversalLink)
            && detector.browser.name === 'micromessenger') {
            return LaunchApp.openChannel.yingyongbao;
        }
        else if (this.configs.useUniversalLink && detector.os.name === 'ios' && detector.os.version >= 9) {
            return LaunchApp.openChannel.univerlink;
        }
        return LaunchApp.openChannel.scheme;
    };
    /**
     * 唤起
     * @param {page:'index',url:'http://tieba.baidu.com/p/2013',param:{},paramMap:{}} opt
     * @param {*} callback
     */
    LaunchApp.prototype.open = function (opt, callback) {
        try {
            this.callback = callback;
            // let newOpt = { page: opt.page || 'index', url: opt.url, param: opt.param }
            var openUrl = this.openMethod
                && this.openMethod.preOpen
                && this.openMethod.preOpen.call(this, opt || {});
            this.openMethod
                && this.openMethod.open
                && this.openMethod.open.call(this, openUrl);
        }
        catch (e) {
            console.log('error:', e);
            locationCall(this.configs.downPage);
        }
    };
    LaunchApp.prototype.down = function () {
        var pkgUrl;
        if (detector.browser.name == 'micromessenger' || detector.browser.name == 'qq') {
            pkgUrl = this.configs.pkgs.yingyongbao[detector.browser.name];
            locationCall(pkgUrl || this.configs.pkgs.yingyongbao['default']);
        }
        else if (detector.os.name === 'android') {
            pkgUrl = this.configs.pkgs.androidApk[detector.browser.name];
            locationCall(pkgUrl || this.configs.pkgs.androidApk['default']);
        }
        else if (detector.os.name === 'ios') {
            pkgUrl = this.configs.pkgs.appstore[detector.browser.name];
            locationCall(pkgUrl || this.configs.pkgs.appstore['default']);
        }
    };
    /**
     * 参数映射（用于处理android与ios参数名不一至问题）
     * @param {*} param
     * @param {*} paramMap
     */
    LaunchApp.prototype.paramMapProcess = function (param, paramMap) {
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
     * 生成url参数
     * @param {*} obj
     */
    LaunchApp.prototype.stringtifyParams = function (obj) {
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
        if (!s) {
            return s;
        }
        return s.substr(0, s.length - 1);
    };
    /**
     * 生成跳转链接
     * @param {*} conf
     */
    LaunchApp.prototype.getUrlFromConf = function (conf) {
        var paramStr = this.stringtifyParams(conf.param);
        if (conf.url) {
            // 对url进行参数处理 'tieba.baidu.com/p/{pid}'
            var url_1 = conf.url;
            var placeholders = url_1.match(/\{.*?\}/g);
            placeholders && placeholders.forEach(function (ph, i) {
                var key = ph.substring(1, ph.length - 1);
                url_1 = url_1.replace(ph, conf.param[key]);
                delete conf.param[key];
            });
            paramStr = this.stringtifyParams(conf.param);
            return url_1 + (paramStr ? ((url_1.indexOf('?') > 0 ? '&' : '?') + paramStr) : '');
        }
        return conf.protocol + '://' +
            (conf.host ? conf.host + '/' + conf.path : conf.path) +
            (paramStr ? this.configs.searchPrefix + paramStr : '');
    };
    LaunchApp.prototype.callend = function (status) {
        return this.callback && this.callback(status, detector);
    };
    /**
     * 判断是否打开成功
     */
    LaunchApp.prototype.setTimeEvent = function () {
        var self = this, haveChange = false;
        var change = function () {
            haveChange = true;
            if (document.hidden) {
                self.callend(LaunchApp.openStatus.SUCCESS);
            }
            else {
                var backResult = self.callend(LaunchApp.openStatus.UNKNOW);
                backResult && self.down();
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
                backResult = self.callend(LaunchApp.openStatus.FAILED);
            }
            else {
                backResult = self.callend(LaunchApp.openStatus.UNKNOW);
            }
            haveChange = true;
            // 导致返回本页后又跳转下载页
            backResult && self.down();
        }, 3000);
    };
    return LaunchApp;
}());
LaunchApp.defaultConfig = {
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
    // 配置不同环境的安装包
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
    // 下载页面
    downPage: 'http://ti' + 'eba.baidu.com/mo/q/activityDiversion/download',
    // ios9使用UniversalLink
    useUniversalLink: true,
    // 唤起失败后尝试下载
    tryDown: true,
    // 参数连接符，默认'?'
    searchPrefix: function (detector) { return '?'; },
};
LaunchApp.openChannel = {
    scheme: {
        preOpen: function (opt) {
            var pageMap = {};
            if (detector.os.name === 'android') {
                pageMap = this.configs.scheme.android;
            }
            else if (detector.os.name === 'ios') {
                pageMap = this.configs.scheme.ios;
            }
            var pageConf = pageMap[opt.page] || pageMap['index'];
            pageConf = Object.assign({}, pageConf, opt);
            if (pageConf.paramMap) {
                pageConf.param = this.paramMapProcess(pageConf.param, pageConf.paramMap);
            }
            return this.getUrlFromConf(pageConf);
        },
        open: function (url) {
            this.setTimeEvent();
            iframeCall(url);
        }
    },
    yingyongbao: {
        preOpen: function (opt) {
            return this.getUrlFromConf(this.configs.yingyongbao);
        },
        open: function (url) {
            locationCall(url);
        }
    },
    univerlink: {
        preOpen: function (opt) {
            if (opt.url) {
                return this.getUrlFromConf(opt);
            }
            var pageMap = this.configs.univerlink;
            var pageConf = pageMap[opt.page] || pageMap['index'];
            pageConf = Object.assign({}, pageConf, opt);
            if (pageConf.paramMap) {
                pageConf.param = this.paramMapProcess(pageConf.param, pageConf.paramMap);
            }
            if (!opt.page) {
                pageConf.url = 'https://' + (this.configs.host || location.host);
            }
            return this.getUrlFromConf(pageConf);
        },
        open: function (url) {
            this.setTimeEvent();
            locationCall(url);
        }
    }
};
LaunchApp.openStatus = {
    FAILED: 0,
    SUCCESS: 1,
    UNKNOW: 2
};
exports.LaunchApp = LaunchApp;
