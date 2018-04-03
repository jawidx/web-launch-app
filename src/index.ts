declare var require: any
const detector = require('detector');
import 'core-js/fn/object/assign'

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
    }, 200)
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
        // guide to explorer when open in weixin
        wxGuideMethod: null,
        // download page url（boot the user to download or download installation packages directly）
        // jump to download page when it cant't find a corresponding configuration or get a error
        downPage: 'http://tieba.baidu.com/mo/q/activityDiversion/download',
        // use UniversalLink for ios9+(default:true)
        useYingyongbao: true,
        useUniversalLink: true,
        // the parameter prefix(default is question mark, you can define something else)
        searchPrefix: (detector: any) => { return '?' },
        // download after attempting to adjust timeout
        timeout: 2000
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
                    pageConf.param = this.paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                return this.getUrlFromConf(pageConf);
            },
            open: function (url: string) {
                this.setTimeEvent();
                if (detector.os.name === 'ios' && detector.browser.name == 'safari') {
                    locationCall(url);
                } else {
                    iframeCall(url);
                }
            }
        },
        yingyongbao: {
            preOpen: function (opt: any) {
                return this.getUrlFromConf(this.configs.yingyongbao);
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
        univerlink: {
            preOpen: function (opt: any) {
                if (opt.url) {
                    return this.getUrlFromConf(opt);
                }

                const pageMap = this.configs.univerlink;
                let pageConf = pageMap[opt.page] || pageMap['index'];
                pageConf = (<any>Object).assign({}, pageConf, opt);
                if (pageConf.paramMap) {
                    pageConf.param = this.paramMapProcess(pageConf.param, pageConf.paramMap);
                }
                if (!opt.page) {
                    pageConf.url = 'https://' + (this.configs.host || location.host);
                }
                return this.getUrlFromConf(pageConf);
            },
            open: function (url: string) {
                locationCall(url);
            }
        }
    };
    static openStatus = {
        FAILED: 0,
        SUCCESS: 1,
        UNKNOW: 2
    };
    private configs: any
    private openMethod: any
    private options: any
    private callback: (status: number, detector: any) => boolean

    constructor(opt: any) {
        this.configs = (<any>Object).assign(LaunchApp.defaultConfig, opt);
        // for (let key in this.configs) {
        //     if (typeof this.configs[key] === 'function') {
        //         this.configs[key] = this.configs[key](detector);
        //     }
        // }
        const defaultProtocol = location.host.split('.').reverse().join('.');
        this.setDefaultProperty(this.configs.scheme.android.index, 'protocol', defaultProtocol);
        this.setDefaultProperty(this.configs.scheme.ios.index, 'protocol', defaultProtocol);
        this.setDefaultProperty(this.configs.univerlink.index, 'url', 'https://' + location.host);
        this.setDefaultProperty(this.configs.yingyongbao.param, 'pkgname', defaultProtocol);
        this.openMethod = this.getOpenMethod();
    }

    /**
     * set default config
     * @param obj 
     * @param property 
     * @param defaultValue 
     */
    setDefaultProperty(obj: any, property: string, defaultValue: any) {
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
     * @param {page:'index',url:'http://tieba.baidu.com/p/2013',param:{},paramMap:{},pkgs:{ios:'',android:''}} opt 
     * @param {*} callback 
     */
    open(opt?: any, callback?: (status: number, detector: any) => boolean) {
        try {
            this.options = opt;
            this.callback = callback;
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

    /**
     * down package
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
     * map param（for different platform use different names）
     * @param {*} param 
     * @param {*} paramMap 
     */
    paramMapProcess(param: any, paramMap: any) {
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
    stringtifyParams(obj: any) {
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

        if (!s) {
            return s;
        }
        return s.substr(0, s.length - 1);
    }

    /**
     * generating URL
     * @param {*} conf 
     */
    getUrlFromConf(conf: any) {
        let paramStr = this.stringtifyParams(conf.param);
        if (conf.url) {
            // 对url进行参数处理 'tieba.baidu.com/p/{pid}'
            let url = conf.url;
            const placeholders = url.match(/\{.*?\}/g);
            placeholders && placeholders.forEach((ph: string, i: number) => {
                const key = ph.substring(1, ph.length - 1);
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
            (paramStr ? this.configs.searchPrefix() + paramStr : '');
    }

    callend(status: number): boolean {
        return this.callback && this.callback(status, detector);
    }

    /**
     * determine whether or not open successfully
     */
    setTimeEvent() {
        const self = this;
        let haveChange = false;
        const change = function () {
            haveChange = true;
            if (document.hidden) {
                self.callend(LaunchApp.openStatus.SUCCESS);
            } else {
                const backResult = self.callend(LaunchApp.openStatus.UNKNOW);
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
                backResult = self.callend(LaunchApp.openStatus.FAILED);
            } else {
                backResult = self.callend(LaunchApp.openStatus.UNKNOW);
            }
            haveChange = true;
            backResult && self.down(self.options);
        }, this.configs.timeout);
    }
}
