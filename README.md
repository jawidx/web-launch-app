# web-launch-app

## Intro
- 唤起App到指定页、通过Scheme调用端能力、下载安装包、到应用商店，同时提供了相关的detector、copy、util等功能

## Install
- npm install web-launch-app --save
- https://unpkg.com/web-launch-app@version/lib/wla.min.js (window.WLA)

## Usage

```javascript
import {
    LaunchApp, detector, ua, copy, supportLink,
    isAndroid, isIos, inWeixin, inQQ, inWeibo, inBaidu
} from 'web-launch-app';

const lanchApp = new LaunchApp(config);
// 简单唤起
lanchApp.open({
    page: 'pagename/action',
    param:{
        k: 'v'
    }
});

// 复杂唤起
lanchApp.open({
    useYingyongbao: inWeixin && isAndroid,
    launchType: {
        ios: inWeixin ? 'store' : 'link',
        android: inWeixin ? 'store' : 'scheme',
    },
    autodemotion: false,
    scheme: 'app://path?k=v',
    url: 'https://link.domain.com/path?k=v',
    param:{
        k2: 'v2'
    },
    timeout: 2000,
    pkgs:{
        android: 'https://cdn.app.com/package/app20190501.apk',
        ios: 'https://itunes.apple.com/cn/app/appid123?mt=8',
        yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.app.www&ckey=CK123'
    }
}, (s, d, url) => {
        console.log('callbackout', s, d, url);
        s != 1 && copy(url);
        return 2;
    });

// 下载
lanchApp.download();
lanchApp.download({
    android: 'https://cdn.app.com/package/app20190501.apk',
    ios: 'https://itunes.apple.com/cn/app/appid123?mt=8',
    yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.app.www&ckey=CK123',
    landPage: 'https://haokan.baidu.com/download'
});
```

## API
#### export
- LaunchApp：唤起类，核心逻辑所在，提供了open()及download()方法通过不同方案实现唤起App及下载
- copy：复制方法（浏览器安全限制，必须由用户行为触发）
- detector：宿主环境对象（含os及browser信息）
- ua：= navigator.userAgent + " " + navigator.appVersion + " " + navigator.vendor
- isAndroid、isIos、inWeixin、inQQ、inWeibo、inBaidu：字面含义，Boolea值
- supportLink：当前环境是否支持universal link或applink

#### open(options, callback)
|Param | |Notes|
|------|--------|-----|
|options|useGuideMethod| 是否使用引导提示，优先级高于launchType指定的方案（适用于微信、微博等受限环境），默认false |
|  |guideMethod| 引导提示方法，默认蒙层文案提示 |
|  |updateTipMethod| 版本升级提示方法，scheme配置指定版本时使用，默认alert提示 |
|  |useYingyongbao| launchType为store方案时（应用宝归为应用商店），控制微信中是否走应用宝，默认false |
|  |launchType| 【1】link：iOS9+使用universal link，Android6+使用applink，可配置指定link无法使用时自动降级为scheme。【2】scheme：scheme协议，通过唤起超时逻辑进行未唤起处理，同时适用于app内打开页面调用native功能。【3】store：系统应用商店（去应用宝需要指定useYingyongbao为true） |
|  |autodemotion| 是否支持link方案不可用时自动降级为scheme方案，（注意参数配置：使用page时要有同page下的link和scheme配置，或同时指定url及scheme参数），默认false |
|  |scheme| 指定scheme |
|  |callback| scheme的回调方法 |
|  |url| 指定link url（iOS的universal link值或Android的applink值） |
|  |page| 在config中配置的页面名称或端能力名称（替代scheme和url参数方便维护）|
|  |param| scheme或link的参数 |
|  |paramMap| 参数映射（适用于iOS与Android同scheme功能但参数名不同的情况，真实世界就是有这么多坑orz）|
|  |clipboardTxt| 复制到剪贴板内容（针对未安装或环境受限等唤起中断情况使用，在打开app或下载app后可以通过剪贴板内容进行交互衔接或统计），浏览器安全限制需要用户动作触发才能生效|
|  |timeout| scheme/store方案中超时时间，默认2000毫秒，<0表示不走超时逻辑 |
|  |landPage| 落地页面（异常或未知情况均会进入此页面） |
|  |pkgs| {android:'',ios:'',yyb:'',store:{...}}，指定子项会覆盖基础配置 |
|callback|| (s, d, url) => { return 0;} ，launchType为scheme或store方案时默认有超时逻辑，可通过设置tmieout为负值取消或根据callback中的返回值进行超时处理。s表示唤起结果（0失败，1成功，2未知）, d为detector，url为最终的scheme或link值。无返回值默认下载apk包或去appstore，1不处理，2落地页，3应用市场（百度春晚活动时引导去应用市场下载分流减压），详见`LaunchApp.callbackResult`。


#### download(options)
|Param | |Notes|
|------|--------|-----|
|options  ||未指定项使用实例配置中的默认值|
||yyb| 应用宝地址，在微信中使用 |
||android| android apk包下载地址 |
||ios| appstore地址 |
||landPage| 落地页地址，非iOS/Android平台使用 |


## Config
```javascript
// 针对各种环境及方案参数有点多，需要使用者了解scheme及link本身的区别
// 虽然config中很多参数可以在使用api时指定，还是建议在实例时全局配置，减少使用api时传参
{
    inApp: false,   // 是否是app内（在app内使用了指定version的scheme会进行版本检测）
    appVersion: '', // 对具体scheme链接进行版本检测时使用
    pkgName:'', // 应用商店使用
    deeplink:{
        // 配置scheme方案具体页面及参数，生成请求格式为"protocol://path?param&param"
        scheme: {
            android: {
                // 指定android的scheme协议头
                protocol: 'appname',
                index: {    // 页面名或端能力名(默认请设置为:index)
                    protocol: 'appname', // 可选，如无会读取上一级protocol，一般不需要配置
                    path: 'path',
                    param: {},	// 生成scheme或linkurl时的固定参数
                    paramMap: {},// 参数映射，解决不同平台参数名不一至情况
                    version: '4.9.6'  // 版本要求
                },
                share:{...},
                ...
            },
            ios: {
                ...
            }
        },
        // 配置univerlink或applink方案中具体页面url及参数
        link: {
            pagename: {
                url: 'https://link.app.com/p/{forumName}',	// 支持占位符
                param: {
                },
                paramMap: {
                },
                version: 0
            },
            ...
        }
    },
    // 下载包配置
    pkgs: { 
        yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.haokan&ckey=',
        android: 'https://cdn.app.com/package/app-default.apk',
        ios: 'https://itunes.apple.com/cn/app/id1092031003?mt=8',
        store: {    // android手机商店匹配，一般不需要配置
            android: {
                reg: /\(.*Android.*\)/,
                scheme: 'market://details?id=packagename'
            },
            samsung: {
                reg: /\(.*Android.*(SAMSUNG|SM-|GT-).*\)/,
                scheme: 'samsungapps://ProductDetail/{id}'
            },
            ...
        }
    }, 
    useUniversalLink: supportLink(), // 默认根据环境判断
    useAppLink: supportLink(),       // 默认根据环境判断
    autodemotion: false,    // 不支持link方案时自动降级为scheme方案，默认false
    useYingyongbao: false,   // 在微信中store方案时是否走应用宝，默认false
    useGuideMethod: false,   // 使用guide方案
    guideMethod: ()=>{},  // 引导方法，默认蒙层文案提示
    updateTipMethod: ()=>{},    // scheme版本检测时升级提示
    searchPrefix: '?',  // scheme或univerlink生成请求中参数前缀，默认为"?"
    timeout: 2000,   // scheme/store方案中超时时间，默认2000毫秒，<0表示不走超时逻辑
    landPage: '',   // 兜底页
}
```

## Demo
```javascript
// -------------------------------------------------------------------
// launch-app.ts（基础文件，通过默认配置减少业务代码开发量，多模块使用建议提npm包）
// -------------------------------------------------------------------
import { 
    LaunchApp, copy, detector, ua, supportLink,
    isAndroid, isIos, inWeixin, inWeibo
} from 'web-launch-app';
const inApp = /appname(.*)/.test(ua);
const appVersion = inApp ? /appname\/(\d+(\.\d+)*)/.exec(ua)[1] : '';
const lanchIns = new LaunchApp({
    inApp: inApp,
    appVersion: appVersion,
    pkgName: 'com.app.www',
    deeplink: {
        scheme: {
            android: {
                protocol: 'app',
                index: {
                    path: '/',
                },
                frs: {
                    protocol: 'app',
                    path: 'forum/detail',
                    param: {from:'h5'},
                    paramMap: {
                        forumName: 'kw'
                    }
                }
            },
            ios: {
                protocol: 'app',
                index: {
                    path: '/',
                },
                frs: {
                    path: 'forum/detail'
                }
            }
        },
        link: {
            index: {url: 'https://link.app.com'},
            frs: {url: 'https://link.app.com/p/{forumName}'}
        },
    },
    pkgs: {
        android: 'https://cdn.app.com/package/app-defult.apk',
        ios: 'https://itunes.apple.com/app/apple-store/appid123?pt=328057&ct=MobileQQ_LXY&mt=8',
        yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.app.www&ckey=123',
    },
    useUniversalLink: supportLink(),
    useAppLink: supportLink(),
    autodemotion: true,
    useYingyongbao: inWeixin && isAndroid, // 2019.7.16发布iOS微信7.0.5支持ulink
    useGuideMethod: inWeibo && isAndroid, // 受限情况下使用引导方案
    timeout: 2500,
    landPage: 'http://www.app.com/download'
});

/**
 * 唤起app到指定页面
 * @param options 
 * @param callback 
 */
export function launch(options?: any, callback?: (status, detector, scheme) => number) {
    // pkgs处理
    options.pkgs = options.pkgs || {};
    if(options.param && options.param.pkg){
        options.pkgs.android = options.pkgs.android || `https://cdn.app.com/download/app-${pkg}.apk`;
    }
    if(options.param && options.param.ckey){
        options.pkgs.android = options.pkgs.android || `http://a.app.qq.com/o/simple.jsp?pkgname=com.app.www&ckey=${ckey}`;
    }
    
    // 针对scheme方案处理剪贴板口令
    if (options.clipboardTxt === undefined) {
        let paramStr = options.param ? stringtifyParams(options.param) : '';
        if (options.scheme) {
            options.clipboardTxt = '#' + options.scheme + (paramStr ? ((options.scheme.indexOf('?') > 0 ? '&' : '?') + paramStr) : '') + '#';
        } else if (options.page) {
            // schemeConfig为实例化时参数中scheme配置
            options.clipboardTxt = '#' + schemeConfig['protocol'] + '://' + schemeConfig[options.page].path + (paramStr ? '?' + paramStr : '') + '#';
        }
    }
    // TODO 处理唤起&新增统计归因、qq浏览器写入剪贴板延迟等通用性功能...
    lanchIns.open(options, callback);
}

/**
 * 唤起app到指定页面(尝试唤起场景，使用link方案，适用于不阻断用户继续去h5页体验场景)
 * @param options 
 * @param callback 
 */
export function tryLaunch(options?: any={}, callback?: (status, detector, scheme) => number) {
    options.launchType = {
        ios: 'link',
        android: 'link'
    };
    options.autodemotion = false;
    launch(options);
}

/**
 * 唤起app到指定页面(强制唤起场景，使用scheme方案)
 */
export function forceLaunch(options?: any={}, callback?: (status, detector, scheme) => number) {
    options.launchType = {
        ios: 'scheme',
        android: 'scheme'
    };
    launch(options);
}

/**
 * 唤起app到指定页面(常见场景方案，ios走link,android优先走link不支持走scheme,android微信中走应用宝)
 * @param options 
 * @param callback 
 */
export function hotLaunch(options?: any, callback?: (status, detector, scheme) => number) {
    options.useGuideMethod = isAndroid && inWeibo;
    options.launchType = {
        ios: 'link',
        android: inWeixin ? 'store' : (supportLink ? 'link' : 'scheme')
    };
    options.useYingyongbao = isAndroid && inWeixin;
    options.autodemotion = true;

    launch(options, callback);
}

/**
 * 端内H5页面调用端能力
 */
export function invoke(options: any) {
    options.launchType = {
        ios: 'scheme',
        android: 'scheme'
    };
    options.timeout = -1;
    lanchIns.open(options);
}

/**
 * 下载安装包
 * @param opt 
 */
export function download(opt) {
    // TODO 参数处理...
    lanchIns.download(opt);
}

// -------------------------------------------------------------------
// demopage.ts（业务代码部分）
// -------------------------------------------------------------------
import {launch, tryLaunch, forceLaunch, hotLaunch, invoke, download} from 'launch-app'
// 唤起（微博出引导提示，ios微信去appstore，android微信去应用宝，同时指定超时处理及下载包）
launch({
    useGuideMethod: inWeibo,
    useYingyongbao: inWeixin && isAndroid,
    launchType: {
        ios: inWeixin ? 'store' : 'link',
        android: inWeixin ? 'store' : 'scheme'
    },
    page: 'frs',
    param: {
        k: 'v',
        ckey: '123',
        pkg: '20190502',
        target: 'https://www.app.com/download',
    },
    // scheme:'',
    // url:'https://link.app.com/path',
    // guideMethod: () => {
    //     alert('请点击右上角，选择浏览器打开~');
    // },
    timeout: 2000,
    // clipboardTxt: '#key#', // launch-app中自动生成
    // pkgs: {
        // yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.app.www&ckey=123', // 通过ckey参数处理，不传使用默认值
        // android: 'https://cdn.app.com/package/app-20190502.apk',  // 通过pkg参数处理
        // ios: 'https://itunes.apple.com/cn/app/appid123?mt=8'    // 不传使用默认值
    // }
}, (status, detector, url) => {
    console.log('callback', status, detector, url);
    // s != 1 && copy(url);
    return 0;
});

// 尽量使用封装的tryLaunch、forceLaunch、hotLaunch、invoke方法，减少直接使用launch方法，便于扩展
tryLaunch({
    url: 'https://link.domain.com/path?k=v',
    param:{
        k2: 'v2'
    }
})
invoke({
    page:'share',
    // scheme:'app://share',
    param:{
        k:'v'
    }
});

// 下载
download();
download({
    pkgs:{
        ios: '',
        android: '',
        yyb: '',
        landPage:''
    }
});
```

## Who use?
好看视频、百度贴吧、伙拍小视频...
- [好看视频的免费增长技术体系建设](https://juejin.im/post/5e778f8b518825494f7e1eac)
