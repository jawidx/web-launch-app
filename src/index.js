"use strict";
import detector from 'detector';

/**
 * iframe调起app
 * @param url
 * @param downloadUrl
 */
export const iframeCall = (url) => {
    console.log('[iframeCall]', url)
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('style', 'display:none');
    document.body.appendChild(iframe);
    setTimeout(function () {
        document.body.removeChild(iframe);
    }, 200)
}

/**
 * location方式调起app
 * @param url
 * @param downloadUrl
 */
function locationCall(openUrl) {
    console.log('[locationCall]', openUrl)
    location.href = openUrl;
}

/**
 * 微信调起方式
 * @param url
 * @param downloadUrl
 * @constructor
 */
function wxCall(url, downloadUrl) {
    console.log('[wxCall]' + url)
    window.location = url
}

class LaunchApp {
    static defaultConfig = {
        scheme: {
            android: {
                index: {
                    protocol: '',
                    path: '',
                    param: {},
                    paramMap: {
                    }
                },
            },
            ios: {
                index: {
                    protocol: '',
                    path: '',
                    param: {},
                    paramMap: {
                    }
                }
            }
        },
        univerlink: {
            index: {
                url: '',
                param: {
                },
                paramMap: {
                }
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
                //browser.name: '',
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
        // 唤起失败后尝试下载
        tryDown: true,
        // 参数连接符，默认'?'
        searchPrefix: (detector) => { return '?' },
    };
    static openChannel = {
        scheme: {
            preOpen(opt) {
                var pageMap = {};
                if (detector.os.name === 'android') {
                    pageMap = this.configs.scheme.android;
                } else if (detector.os.name === 'ios') {
                    pageMap = this.configs.scheme.ios;
                }
                console.log('scheme,', pageMap, opt);
                var pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = Object.assign({}, pageConf, opt);
                if (pageConf.paramMap) {
                    pageConf.param = this.paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                return this.getUrlFromConf(pageConf);
            },
            open: function (url) {
                this.setTimeEvent();
                locationCall(url);
                // iframeCall(url);
            }
        },
        yingyongbao: {
            preOpen: function (opt) {
                console.log('yingyongbao,', detector.os.name);
                return this.getUrlFromConf(this.configs.yingyongbao);
            },
            open: function (url) {
                wxCall(url);
            }
        },
        univerlink: {
            preOpen: function (opt) {
                if (opt.url) {
                    return this.getUrlFromConf(opt);
                }

                const pageMap = this.configs.univerlink;
                let pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = Object.assign({}, pageConf, opt);
                console.log('univerlink,', pageConf);
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
    static openStatus = {
        FAILED: 0,
        SUCCESS: 1,
        UNKNOW: 2
    };

    constructor(opt) {
        this.configs = Object.assign(LaunchApp.defaultConfig, opt);
        for (var key in this.configs) {
            if (typeof this.configs[key] === 'function') {
                this.configs[key] = this.configs[key](detector);
            }
        }
        const defaultProtocol = location.host.split('.').reverse().join('.');
        this.setDefaultProperty(this.configs.scheme.android.index, 'protocol', defaultProtocol);
        this.setDefaultProperty(this.configs.scheme.ios.index, 'protocol', defaultProtocol);
        this.setDefaultProperty(this.configs.univerlink.index, 'url', 'https://' + location.host);
        this.setDefaultProperty(this.configs.yingyongbao.param, 'pkgname', defaultProtocol);
        this.openMethod = this.getOpenMethod();
    }

    setDefaultProperty(obj, property, defaultValue) {
        if (obj && !obj[property]) {
            property = defaultValue;
        }
        if (!obj) {
            obj = {
                property: defaultValue
            }
        }
    }

    getOpenMethod() {
        if (detector.os.name === 'android' && detector.browser.name === 'micromessenger') {
            return LaunchApp.openChannel.yingyongbao;
        } else if (detector.os.name === 'ios' && detector.os.version >= 9) {
            return LaunchApp.openChannel.univerlink;
        }
        return LaunchApp.openChannel.scheme;
    }

    /**
     * 
     * @param {page:'index',url:'http://tieba.baidu.com/p/2013',param:{},paramMap:{}} opt 
     * @param {*} callback 
     */
    open(opt, callback) {
        console.log('open,', opt);
        try {
            this.callback = callback;
            // let newOpt = { page: opt.page || 'index', url: opt.url, param: opt.param }
            const openUrl = this.openMethod
                && this.openMethod.preOpen
                && this.openMethod.preOpen.call(this, opt || {});
            this.openMethod
                && this.openMethod.open
                && this.openMethod.open.call(this, openUrl);
        } catch (e) {
            console.log('error:', e);
            locationCall(this.configs.downPage);
        }
    }

    down() {
        let pkgUrl;
        if (detector.browser.name == 'micromessenger' || detector.browser.name == 'qq') {
            pkgUrl = this.configs.pkgs.yingyongbao[detector.browser.name];
            console.log('1111', pkgUrl || this.configs.pkgs.yingyongbao['default']);
            wxCall(pkgUrl || this.configs.pkgs.yingyongbao['default']);
        } else if (detector.os.name === 'android') {
            pkgUrl = this.configs.pkgs.androidApk[detector.browser.name];
            console.log('2222', pkgUrl || this.configs.pkgs.androidApk['default']);
            iframeCall(pkgUrl || this.configs.pkgs.androidApk['default']);
        } else if (detector.os.name === 'ios') {
            pkgUrl = this.configs.pkgs.appstore[detector.browser.name];
            console.log('3333', pkgUrl || this.configs.pkgs.appstore['default']);
            iframeCall(pkgUrl || this.configs.pkgs.appstore['default']);
        }
        // location.href = 'http://ti' + 'eba.baidu.com/mo/q/activityDiversion/download';
        // location.href = this.configs.downPage;
    }

    /**
     * 参数映射（用于处理android与ios参数名不一至问题）
     * @param {*} param 
     * @param {*} paramMap 
     */
    paramMapProcess(param, paramMap) {
        if (!paramMap) {
            return param;
        }

        var newParam = {};
        for (var k in param) {
            if (paramMap[k]) {
                newParam[paramMap[k]] = param[k];
            } else {
                newParam[k] = param[k];
            }
        }

        return newParam;
    }

    /**
     * 生成url参数
     * @param {*} obj 
     */
    stringtifyParams(obj) {
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
        };

        if (!s) {
            return s;
        }
        return s.substr(0, s.length - 1);
    }

    /**
     * 生成跳转链接
     * @param {*} conf 
     */
    getUrlFromConf(conf) {
        console.log('pageConf', conf);
        var paramStr = this.stringtifyParams(conf.param);
        if (conf.url) {
            // 对url进行参数处理 'tieba.baidu.com/p/{pid}'
            let url = conf.url;
            const placeholders = url.match(/\{.*?\}/g);
            placeholders && placeholders.forEach((ph, i) => {
                var key = ph.substring(1, ph.length - 1);
                url = url.replace(ph, conf.param[key]);
                delete conf.param[key];
            })

            paramStr = this.stringtifyParams(conf.param);
            return url + (paramStr ? ((url.indexOf('?') > 0 ? '&' : '?') + paramStr) : '');
            // if (~idx) {
            //     url = url.substring(0, idx);
            // }
            // return url + (paramStr ? '?' + paramStr : '');
        }
        return conf.protocol + '://' +
            (conf.host ? conf.host + '/' + conf.path : conf.path) +
            (paramStr ? this.configs.searchPrefix + paramStr : '');
    }

    callend(status) {
        this.callback && this.callback({ status: status, detector: detector });
    }

    setTimeEvent() {
        let self = this, haveChange = false;
        const change = function () {
            haveChange = true;
            if (document.hidden) {
                self.callend(LaunchApp.openStatus.SUCCESS);
            } else {
                self.callend(LaunchApp.openStatus.UNKNOW);
                self.configs.tryDown && self.down();
            }
            document.removeEventListener('visibilitychange', change);
        };
        document.addEventListener("visibilitychange", change, false);

        let timer = setTimeout(function () {
            if (haveChange) {
                return;
            }
            console.log('setTimeout');
            document.removeEventListener('visibilitychange', change);
            if (!document.hidden && !haveChange) {
                self.callend(LaunchApp.openStatus.FAILED);
                return;
            } else {
                self.callend(LaunchApp.openStatus.UNKNOW);
            }
            haveChange = true;
            // 导致返回本页后又跳转下载页
            self.configs.tryDown && self.down();
        }, 3000);
    }
}

export { LaunchApp };
