import 'core-js/fn/object/assign'
import { detector } from './detector';

/**
 * iframe call
 * @param url
 */
const iframeCall = (url: string) => {
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
function locationCall(url: string) {
    location.href = url;
}

export class LaunchApp {
    static defaultConfig: any = {
        openMethod: '',
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
        // config package for different browser
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
        // use UniversalLink for ios9+(default:true)
        useUniversalLink: true,
        // guide to explorer when open in wechat
        wxGuideMethod: null,
        useYingyongbao: true,
        // the parameter prefix(default is question mark, you can define something else)
        searchPrefix: (detector: any) => { return '?' },
        // download after attempting to adjust timeout
        timeout: 2000,
        // download page url（boot the user to download or download installation packages directly）
        // jump to download page when it cant't find a corresponding configuration or get a error
        downPage: 'http://tieba.baidu.com/mo/q/activityDiversion/download',
    };
    static openChannel = {
        scheme: {
            preOpen(opt: any) {
                let pageMap: any = {};
                if (detector.os.name === 'android') {
                    pageMap = this.configs.scheme.android;
                } else if (detector.os.name === 'ios') {
                    pageMap = this.configs.scheme.ios;
                }
                let pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = (<any>Object).assign({}, pageConf, opt);
                if (pageConf.paramMap) {
                    pageConf.param = this._paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                return this._getUrlFromConf(pageConf);
            },
            open: function (url: string) {
                this._setTimeEvent();
                if (detector.os.name === 'ios' && detector.browser.name == 'safari') {
                    locationCall(url);
                } else {
                    iframeCall(url);
                }
            }
        },
        univerlink: {
            preOpen: function (opt: any) {
                if (opt.url) {
                    return this._getUrlFromConf(opt);
                }

                const pageMap = this.configs.univerlink;
                let pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = (<any>Object).assign({}, pageConf, opt);
                if (pageConf.paramMap) {
                    pageConf.param = this._paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                if (!opt.page) {
                    pageConf.url = 'https://' + (this.configs.host || location.host);
                }
                return this._getUrlFromConf(pageConf);
            },
            open: function (url: string) {
                locationCall(url);
            }
        },
        yingyongbao: {
            preOpen: function (opt: any) {
                return this._getUrlFromConf(this.configs.yingyongbao);
            },
            open: function (url: string) {
                locationCall(url);
            }
        },
        weixin: {
            open: function () {
                this.configs.wxGuideMethod && this.configs.wxGuideMethod(detector);
            }
        },
        appstore: {
            open: function () {
                locationCall(this.configs.pkgs.appstore['default']);
            }
        }
    };
    static openStatus = {
        FAILED: 0,
        SUCCESS: 1,
        UNKNOW: 2
    };
    // config
    private configs: any
    private openMethod: any
    // param
    private options: any
    private callback: (status: number, detector: any) => boolean

    constructor(opt: any) {
        this.configs = (<any>Object).assign(LaunchApp.defaultConfig, opt);
        this.openMethod = this._getOpenMethod();
    }

    /**
     * select open method according to the environment
     */
    _getOpenMethod() {
        if (detector.browser.name === 'micromessenger' && !this.configs.useYingyongbao) {
            return LaunchApp.openChannel.weixin;
        } else if (detector.browser.name === 'micromessenger'
            && (detector.os.name === 'android' || !this.configs.useUniversalLink)) {
            return LaunchApp.openChannel.yingyongbao;
        } else if (this.configs.useUniversalLink && detector.os.name === 'ios' && detector.os.version >= 9) {
            return LaunchApp.openChannel.univerlink;
        }
        return LaunchApp.openChannel.scheme;
    }

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
    open(opt?: any, callback?: (status: number, detector: any) => boolean) {
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
                        if (detector.os.name === 'ios' && detector.os.version >= 9) {
                            tmpOpenMethod = LaunchApp.openChannel.univerlink;
                        }
                        break;
                    case 'appstore':
                        if (detector.os.name === 'ios') {
                            tmpOpenMethod = LaunchApp.openChannel.appstore;
                        }
                        break;
                }
            }
            tmpOpenMethod = tmpOpenMethod || this.openMethod;

            const openUrl = tmpOpenMethod.preOpen
                && tmpOpenMethod.preOpen.call(this, opt || {});
            tmpOpenMethod.open
                && tmpOpenMethod.open.call(this, openUrl);
        } catch (e) {
            console.log('error:', e);
            locationCall(this.configs.downPage);
        }
    }

    /**
     * down package
     * {
     * pkgs:{android:'',ios:''}
     * }
     */
    down(opt?: any) {
        this.options = opt;
        let pkgUrl;
        if (detector.browser.name == 'micromessenger' || detector.browser.name == 'qq') {
            pkgUrl = this.configs.pkgs.yingyongbao[detector.browser.name];
            locationCall(pkgUrl || this.configs.pkgs.yingyongbao['default']);
        } else if (detector.os.name === 'android') {
            if (this.options && this.options.pkgs && this.options.pkgs.android) {
                pkgUrl = this.options.pkgs.android;
            } else {
                pkgUrl = this.configs.pkgs.androidApk[detector.browser.name];
            }
            locationCall(pkgUrl || this.configs.pkgs.androidApk['default']);
        } else if (detector.os.name === 'ios') {
            if (this.options && this.options.pkgs && this.options.pkgs.ios) {
                pkgUrl = this.options.pkgs.ios;
            } else {
                pkgUrl = this.configs.pkgs.appstore[detector.browser.name];
            }
            locationCall(pkgUrl || this.configs.pkgs.appstore['default']);
        }
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

        let s = '';
        let otherObj = {};
        for (let k in obj) {
            if (!obj.hasOwnProperty(k)) {
                continue;
            }
            s += (k + '=' + obj[k] + '&');
        };

        return s ? s.substr(0, s.length - 1) : s;
    }

    /**
     * generating URL
     * @param {*} conf 
     */
    _getUrlFromConf(conf: any) {
        let paramStr = this._stringtifyParams(conf.param);
        if (conf.url && detector.os.name === 'ios' && detector.os.version >= 9) {
            // 对url进行参数处理 'tieba.baidu.com/p/{pid}'
            let url = conf.url;
            const placeholders = url.match(/\{.*?\}/g);
            placeholders && placeholders.forEach((ph: string, i: number) => {
                const key = ph.substring(1, ph.length - 1);
                url = url.replace(ph, conf.param[key]);
                delete conf.param[key];
            })

            paramStr = this._stringtifyParams(conf.param);
            return url + (paramStr ? ((url.indexOf('?') > 0 ? '&' : '?') + paramStr) : '');
        }
        return conf.protocol + '://' +
            (conf.host ? conf.host + '/' + conf.path : conf.path) +
            (paramStr ? this.configs.searchPrefix() + paramStr : '');
    }

    _callend(status: number): boolean {
        return this.callback && this.callback(status, detector);
    }

    /**
     * determine whether or not open successfully
     */
    _setTimeEvent() {
        const self = this;
        let haveChange = false;
        const change = function () {
            haveChange = true;
            if (document.hidden) {
                self._callend(LaunchApp.openStatus.SUCCESS);
            } else {
                const backResult = self._callend(LaunchApp.openStatus.UNKNOW);
                backResult && self.down(self.options);
            }
            document.removeEventListener('visibilitychange', change);
        };
        document.addEventListener("visibilitychange", change, false);

        const timer = setTimeout(function () {
            if (haveChange) {
                return;
            }
            document.removeEventListener('visibilitychange', change);
            let backResult = true;
            if (!document.hidden && !haveChange) {
                backResult = self._callend(LaunchApp.openStatus.FAILED);
            } else {
                backResult = self._callend(LaunchApp.openStatus.UNKNOW);
            }
            haveChange = true;
            backResult && self.down(self.options);
        }, this.configs.timeout);
    }
}
