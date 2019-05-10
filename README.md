# web-launch-app

## 简介 
- 通过简单配置，实现唤起App并打开指定页或下载安装包（同时适用app内调用端能力）

## 安装
- npm install --save web-launch-app

## 使用

###
```javascript
import { LaunchApp } from 'web-launch-app';

const lanchApp = new LaunchApp(config);
lanchApp.open({
    page: 'frs',
    param:{
        forumName: 'jawidx'
    }
});

/*
- LaunchApp：唤起类，核心逻辑所在，通过不同方案实现唤起App及下载
- detector：宿主环境对象（包含os及browser信息）
- copy：复制方法（浏览器安全限制，必须由用户行为触发）
- ua：=navigator.userAgent + " " + navigator.appVersion + " " + navigator.vendor
- isAndroid、isIos、inWexin、inWeibo：字面含义，Boolea值
- supportLink：是否支持universal link或applink（ios中uc和qq浏览器不支持ulink，android中chrome、三星、宙斯及基于chrome的等浏览器支持applink），供参考
*/
```

### 方案
- link：iOS9+使用universal link，Android6+使用applink，可指定link无法使用时自动降级为scheme。
- scheme：scheme协议，同时适用于app内打开页面调用native功能。
- store：应用商店，微信中通过同时指定useYingyongbao参数去应用宝（百度春晚活动时引导去应用市场下载分流减压）。
- 其它
    - useGuideMethod指定微信、微博等受限环境中引导用户出App（优先级高于launchType指定的方案）。
    - scheme和store方案默认有超时逻辑，可通过设置tmieout为负值取消或根据callback中的返回值进行超时处理。
    - 方案选择：open方法参数配置>实例配置>默认配置（参见源码中方法：_getOpenMethod、open）。

### 配置
```javascript
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
                index: {
                    protocol: 'protocol', // 可选，如无会读取上一级protocol，一般不需要配置
                    path: 'path',
                    param: {},	// 生成scheme或linkurl时的参数
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
const lanchInstance = new LaunchApp({
    inApp: inApp,
    appVersion: appVersion,
    pkgName: 'com.baidu.tieba',
    deeplink: {
        scheme: {
            android: {
                protocol: 'tbfrs',
                // 页面名称(默认页面请设置为:index)
                index: {
                    protocol: 'tbfrs',
                    path: 'tieba.baidu.com',
                    // 固定参数
                    param: {from:'h5'},
                },
                frs: {
                    protocol: 'tbfrs',
                    path: 'tieba.baidu.com',
                    // 参数映射(解决不同端使用不同参数名的问题)
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


// 唤起
lanchInstance.open({
    page: 'frs',
    param:{
        forumName: 'jawidx'
    }
    // paramMap:{}
});

// 定制唤起（微博提示，微信去应用宝）
lanchInstance.open({
    useGuideMethod: inWeibo,
    useYingyongbao: true,//inWexin && isAndroid,
    launchType: {
        ios: inWexin ? 'store' : 'link',
        android: inWexin ? 'store' : 'scheme',
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
    // s表示唤起结果，0失败，1成功，2未知, d为detector，url为最终的scheme或link值
    console.log('callbackout', s, d, url);
    s != 1 && copy(url);
    // 返回值指定后续处理（默认下载apk包，1不处理，2中间页，3应用市场）
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
贴吧、伙拍小视频、好看视频