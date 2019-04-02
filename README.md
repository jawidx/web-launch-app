# web-launch-app
## 安装
npm install --save web-launch-app

## 简介 
- 通过简单配置，在业务代码中通过open/download方法唤起App指定页或下载安装包（适用app内调用端功能）
- 唤起方案
    - iOS使用universal link或scheme或appstore方案
    - Android使用app link或scheme或应用商店方案
    - 微信中使用应用宝或引导提示方案或走ios/android的具体方案
    - 其它平台可通过方法参数控制实现
- 唤起方案选择：open方法参数配置>实例配置>默认配置（代码中参见方法：_getOpenMethod、open）

## 使用
```javascript
const lanchApp = new LaunchApp(config);
// 常用唤起
lanchApp.open({
    page: 'frs',
    param:{
        forumName: 'jawidx'
    }
    // paramMap:{}
});

// 指定方案唤起（微信中引导提示，可在实例中配置默认值）
lanchApp.open({
    launchType:{
        ios:'store',
        android:'scheme'
    },
    wxGuideMethod: ()=>{alert('右上角选择浏览器中打开')},  // 引导提示，优先级高于useYingyongbao
    useYingyongbao: true, // 因为指定了wxGuideMethod，此行并不会生效
    scheme:'',
    url:''
    Param:{}
});

// 定制唤起（微信android去应用宝，ios微信去appstore）
lanchApp.open({
    launchType:{
        ios:'link',
        android:'scheme'
    },
    page: 'frs',
    param:{
        forumName: 'jawidx'
    },
    // updateTipMethod: ()=>{},
    useYingyongbao: isAndroid&&inWechat,
    clipboardTxt:'',
    pkgs:{
        android:'',
        ios:''
        yyb:'',
        store:{...}
    },
    timeout:3000,
    landPage:''
}, (status, detector) => {
    // 使用scheme方案时超时回调方法，可选，status(0:failed，1:success，2:unknow)
    // 返回值：1不做处理，2跳转兜底页，3跳转应用商店，默认下载pkg或跳转appstore
    return isIos&&inWechat ? 3 : 0;
});

// 下载
lanchApp.download();

// 下载指定包(不指定平台使用全局配置)
lanchApp.down{
    pkgs:{
        ios:'',
        android:''
        yyb:'',
        landPage:''
    }
};
```

## 配置
```javascript
{
    inApp: false,   // 是否是app内，在app内且指定了version的scheme会进行版本检测时
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
                }
            },
            ios: {
                protocol: 'protocol',
                index: {
                    protocol: 'protocol',
                    path: 'path',
                    param: {},
                    paramMap: {
                    },
                    version: 0
                }
            }
        },
        // 配置univerlink方案具体url及参数
        link: {
            pagename: {
                url: '',
                param: {
                },
                paramMap: {
                },
                version: 0
            }
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
    useAppLink: true,       // 是否为android6+使用applink方案，默认true
    useUniversalLink: true, // 是否为ios9+使用universallink方案，默认true
    useYingyongbao: false,   // 在微信中跳转应用宝，默认为false
    wxGuideMethod: ()=>{},  // 微信中进行提示引导，优先级高于useYingyongbao配置，指定null时走ios/android方案（适用不受微信限制的app）
    updateTipMethod: ()=>{},    // scheme版本检测时升级提示
    clipboardTxt:'',    // 剪贴板内容，常见口令方案
    searchPrefix: '?',  // scheme或univerlink生成请求中参数前缀，默认为"?"
    timeout: 2000   // scheme方案中跳转超时判断，默认2000毫秒
    landPage:'',   // 兜底页
}
```

## Demo
```javascript
// launchapp.ts
import { LaunchApp, ua, detector, copy } from 'web-launch-app';
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
                // 页面名称(默认页面请设置为:index)
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
            index: {
                url: 'https://tieba.baidu.com'
            },
            frs: {
                // 支持占位符
                url: 'https://tieba.baidu.com/p/{forumName}'
            }
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
    useAppLink: false,
    useUniversalLink: true,
    useYingyongbao: false,
    wxGuideMethod: function (detector) {
        const explorerName = (detector.os.name == 'ios' ? 'Safari' : '');
        alert('在'+explorerName?'『Safari』':''+'浏览器中打开');
    },
    searchPrefix: (detector) => {
       return '?';
    },
    timeout: 3000,
    landPage: 'http://tieba.baidu.com/mo/q/activityDiversion/download'
});

/**
 * 外部调起app到具体页面
*/ 
export function lanchApp(options:any, callback?: (status, detector) => boolean) {
    lanchInstance.open(options, callback);
}

/**
 * 下载APP
 */
export function downApp(options:any) {
    lanchInstance.down(options);
}

/**
 * 端内H5页面调用端能力
 */
export function invokeApp(options:any, callback?: (status, detector) => boolean) {
    lanchInstance.open(Object.assign({},{launchType:{
            ios:'scheme'
            android:'scheme'
        }},options), callback);
}
```

```javascript
// 业务代码中使用
import {lanchApp, downApp} from 'launchapp'
lanchApp({
    page: 'frs',
    param: {
        forumName: 'jawidx'
    }
}, (status, detector) => {
    return true;
});
downApp({
    pkgs:{
        ios:'',
        android:''
    }
});
```

## Who use?
贴吧、伙拍小视频、好看视频