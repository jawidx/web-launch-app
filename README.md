# web-launch-app

## Intro 
- 唤起App并打开指定页、下载安装包（同样适用App内H5页通过Scheme调用端能力）

## Installation
- npm install web-launch-app --save

## Usage

```javascript
import { LaunchApp, detector, copy, ua, isAndroid, isIos, inWexin, inWeibo, supportLink } from 'web-launch-app';
/*
- LaunchApp：唤起类，核心逻辑所在，通过不同方案实现唤起App及下载
- detector：宿主环境对象（含os及browser信息）
- copy：复制方法（浏览器安全限制，必须由用户行为触发）
- ua：=navigator.userAgent + " " + navigator.appVersion + " " + navigator.vendor
- isAndroid、isIos、inWexin、inWeibo：字面含义，Boolea值
- supportLink：是否支持universal link或applink（uc&qq浏览器不支持ulink，chrome、三星、宙斯及基于chrome的浏览器支持applink），供参考
*/

const lanchApp = new LaunchApp();
lanchApp.open({ // 参数参见Api部分
    scheme: 'app://path?k=v',
    url: 'https://link.domain.com/path?k=v',
    param:{
        k2: 'v2'
    }
});

lanchApp.open({
    useYingyongbao: inWexin && isAndroid,
    launchType: {
        ios: inWexin ? 'store' : 'link',
        android: inWexin ? 'store' : 'scheme',
    },
    autodemotion: false,
    scheme: 'app://path?k=v',
    url: 'https://link.domain.com/path?k=v',
    param:{
        k2: 'v2'
    },
    timeout: 2000
}, (s, d, url) => {
        console.log('callbackout', s, d, url);
        s != 1 && copy(url);
        return 2;
    });

const lanchApp2 = new LaunchApp(config); // 配置参见Config部分
lanchApp2.open({
    page: 'pagenameInConfig',
    param:{
        k: 'v'
    }
});
lanchApp2.down();
```

## API
#### open(options, callback)
|Param | |Notes|
|------|--------|-----|
|options|useGuideMethod| 是否使用引导提示，适用于微信、微博等受限环境，优先级高于launchType指定的方案 |
|  |guideMethod| 引导方法，默认蒙层文案提示 |
|  |updateTipMethod| scheme版本检测时升级提示，默认alert提示 |
|  |useYingyongbao| 在微信中store方案时是否走应用宝，默认false |
|  |launchType| 1.link：iOS9+使用universal link，Android6+使用applink，可配置指定link无法使用时自动降级为scheme。2.scheme：scheme协议，通过唤起超时逻辑进行未唤起处理，同时适用于app内打开页面调用native功能。3.store：系统应用商店，配置useYingyongbao指定去应用宝（百度春晚活动时引导去应用市场下载分流减压）。 |
|  |autodemotion| 不支持link方案时自动降级为scheme方案，默认false |
|  |scheme| 指定scheme |
|  |url| 指定link url |
|  |page| 在config中配置的页面名称，用来替代scheme或link参数，方便管理 |
|  |param| scheme或link的参数 |
|  |paramMap| 参数映射 |
|  |clipboardTxt| 复制内容，针对未安装等唤起中断情况使用 |
|  |timeout| scheme/store方案中超时时间，默认2000毫秒，<0表示不走超时逻辑 |
|  |landPage| 落地页面 |
|  |callback| scheme回调方法 |
|  |pkgs| {android:'',ios:'',yyb:''} |
|callback|| (s, d, url) => { return 0;} ，launchType为scheme或store方案时默认有超时逻辑，可通过设置tmieout为负值取消或根据callback中的返回值进行超时处理。s表示唤起结果（0失败，1成功，2未知）, d为detector，url为最终的scheme或link值。无返回值默认下载apk包，1不处理，2落地页，3应用市场|


#### down(options)
|Param | |Notes|
|------|--------|-----|
|options  |||
||yyb| 应用宝地址，在微信中使用 |
||android| android apk包下载地址 |
||ios| appstore地址 |
||landPage| 落地页地址，非iOS/Android平台使用 |


## Config
```javascript
// 针对各种环境及方案参数有点多，需要使用者了解scheme及link本身的区别
{
    inApp: false,   // 是否是app内（在app内使用了指定version的scheme会进行版本检测）
    appVersion: '', // 对具体scheme链接进行版本检测时使用
    pkgName:'', // 应用商店使用
    deeplink:{
        // 配置scheme方案具体页面及参数，生成请求格式为"protocol://path?param&param"
        scheme: {
            android: {
                // 指定android的scheme协议头
                protocol: 'protocol',
                index: {    // 页面名称(默认页面请设置为:index)
                    protocol: 'protocol', // 可选，如无会读取上一级protocol，一般不需要配置
                    path: 'path',
                    param: {},	// 生成scheme或linkurl时的固定参数
                    paramMap: {},// 参数映射，解决不同平台参数名不一至情况
                    version: '4.9.6'  // 版本要求
                },
                ...
            },
            ios: {
                ...
            }
        },
        // 配置univerlink方案具体url及参数
        link: {
            pagename: {
                url: 'https://tieba.baidu.com/p/{forumName}',	// 支持占位符
                param: {
                },
                paramMap: {
                },
                version: 0
            },
            ...
        },
        yyb: {
            url: 'http://a.app.qq.com/o/simple.jsp',
            param: {
                pkgname: '',
                ckey: ''
            }
        },
    },
    // 下载包配置
    pkgs: { 
        yyb: '',
        android: 'http://www.**.com/package.apk',
        ios: '',
        store: {    // 手机商店匹配
            xphone: {
                reg: /\(.*Android.*\)/,
                scheme: 'market://details?id=packagename'
            }
        }
    }, 
    useUniversalLink: true, // 是否为ios9+使用universallink方案，默认true
    useAppLink: true,       // 是否为android6+使用applink方案，默认true
    autodemotion: false,    // 不支持link方案时自动降级为scheme方案，默认false
    useYingyongbao: false,   // 在微信中store方案时是否走应用宝，默认false
    useGuideMethod: false,   // 使用guide方案
    guideMethod: ()=>{},  // 引导方法，默认蒙层文案提示
    updateTipMethod: ()=>{},    // scheme版本检测时升级提示
    searchPrefix: '?',  // scheme或univerlink生成请求中参数前缀，默认为"?"
    timeout: 2000   // scheme/store方案中超时时间，默认2000毫秒，<0表示不走超时逻辑
    landPage:'',   // 兜底页
}
```

## Demo
```javascript
import { LaunchApp, detector, ua, isAndroid, isIos, supportLink, inWexin, inWeibo, copy } from 'web-launch-app';
let inApp = /haokan(.*)/.test(ua);
let appVersion = inApp ? /haokan\/(\d+(\.\d+)*)/.exec(ua)[1] : '';
// 初始化实例，指定全局默认配置（具体业务代码中使用默认配置）
const lanchInstance = new LaunchApp({
    inApp: inApp,
    appVersion: appVersion,
    pkgName: 'com.baidu.tieba',
    deeplink: {
        scheme: {
            android: {
                protocol: 'tbfrs',
                index: {
                    protocol: 'tbfrs',
                    path: 'tieba.baidu.com',
                    param: {from:'h5'},
                },
                frs: {
                    protocol: 'tbfrs',
                    path: 'tieba.baidu.com',
                    paramMap: {
                        forumName: 'kw'
                    }
                }
            },
            ios: {
                protocol: 'com.baidu.tieba',
                index: {
                    path: 'jumptoforum',
                },
                frs: {
                    path: 'jumptoforum',
                    paramMap: {
                        forumName: 'tname'
                    }
                }
            }
        },
        link: {
            index: {url: 'https://tieba.baidu.com'},
            frs: {url: 'https://tieba.baidu.com/p/{forumName}'}
        },
        yyb: {
            url: 'http://a.app.qq.com/o/simple.jsp',
            param: {
                pkgname: 'com.baidu.tieba'
            }
        },
    },
    pkgs: {
        android: 'https://downpack.baidu.com/default.apk',
        ios: 'https://itunes.apple.com/app/apple-store/id477927812?pt=328057&ct=MobileQQ_LXY&mt=8',
        yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513',
    },
    useUniversalLink: supportLink,
    useAppLink: supportLink,
    autodemotion: true,
    useYingyongbao: inWexin,
    useGuideMethod: inWeibo,
    landPage: 'http://tieba.baidu.com/mo/q/activityDiversion/download'
});


// 唤起（使用配置中的scheme、linkurl）
lanchInstance.open({
    page: 'frs',
    param:{
        forumName: 'jawidx'
    }
    // paramMap:{}
});

// 唤起（指定scheme和linkurl）
lanchInstance.open({
    param:{
        forumName: 'jawidx'
    },
    scheme: 'tbfrs://setting',
    url: 'https://www.demo.com/a/setting'
});


// 唤起（微博出引导提示，ios微信去appstore，android微信去应用宝，同时指定超时处理及下载包）
lanchInstance.open({
    useGuideMethod: inWeibo,
    useYingyongbao: true,   //inWexin && isAndroid,
    launchType: {
        ios: inWexin ? 'store' : 'link',
        android: inWexin ? 'store' : 'scheme'
    },
    page: 'author',
    param: {
        url_key: '4215764431860909454',
        target: 'https%3A%2F%2Fbaijiahao.baidu.com%2Fu%3Fapp_id%3D1611116910625404%26fr%3Dbjhvideo',
    },
    // scheme:'',
    // url:'http://hku.baidu.com/h5/share/detailauthor?url_key=1611116910625404&target=https%3A%2F%2Fbaijiahao.baidu.com%2Fu%3Fapp_id%3D1611116910625404%26fr%3Dbjhvideo',
    // guideMethod: () => {
    //     alert('出去玩~');
    // },
    timeout: 2000,
    // clipboardTxt: '#key#',
    pkgs: {
        android: 'https://sv.bdstatic.com/static/haokanapk/apk/baiduhaokan1021176d.apk',
        ios: 'https://itunes.apple.com/cn/app/id1322948417?mt=8',
        yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513'
    }
}, (s, d, url) => {
    console.log('callbackout', s, d, url);
    s != 1 && copy(url);
    return 0;
});

/**
 * 端内H5页面调用端能力
 */
lanchInstance.open(
    launchType:{
        ios:'scheme',
        android:'scheme'
    },
    scheme:'baiduhaokan://copy',
    param:{
        context:'copycontent'
    },
    timeout: -1
);

// 下载
lanchInstance.down();

// 下载指定包(不指定平台使用全局配置)
lanchInstance.down{
    pkgs:{
        ios:'',
        android:''
        yyb:'',
        landPage:''
    }
};
```

## Who use?
百度贴吧、伙拍小视频、好看视频