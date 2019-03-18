# web-launch-app
## 安装
npm install --save web-launch-app

## 简介 
- 通过简单配置，在业务代码中通过open/download方法唤起App指定页或下载安装包（适用app内调用端功能）
- 默认唤起方案
    - iOS使用universal link或scheme或appstore方案
    - Android使用app link或scheme或应用商店方案
    - 微信中使用应用宝或引导提示方案或走ios/android的具体方案
    - 其它平台可通过方法参数控制实现

## 使用
```javascript
const lanchApp = new LaunchApp(config);
lanchApp.open({
    // launchType:{
    //     ios:'link'|'scheme'|'store'
    //     android:'link'|'scheme'|'store'
    // }
    page: 'frs',    // for scheme&link
    param:{         // for scheme&link，对object类型会进行encodeURIComponent
        forumName: 'jawidx'
    },
    //paramMap:{}
    // scheme:'',  // 指定完整的scheme值
    // url:'',  // 指定完成的link值
    // wxGuideMethod: ()=>{},
    // updateTipMethod: ()=>{},
    // clipboardTxt:'',
    // pkgs:{
    //     android:'',
    //     ios:''
    //     yyb:'',
    //     store:{...}
    // },
    // timeout:3000,
    // landpage:''
}, (status, detector) => {
    // 使用scheme方案时唤起回调，status(0:failed，1:success，2:unknow)
    // 返回值：1下载安装包，2跳转兜底页，3跳转应用商店
    return 2;
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
    inApp: false,   //是否是app内，在app内且指定了version的scheme会进行版本检测时
    appVersion: '', //对具体scheme链接进行版本检测时使用
    pkgName:'', //应用商店使用
    deeplink:{
        // 配置scheme方案具体页面及参数，生成请求格式为"protocol://path?param&param"
        scheme: {
            android: {
                // 指定android的scheme协议头
                protocol: 'protocol',
                index: {
                    path: 'path',
                    param: {},
                    paramMap: {},// 参数映射，解决不同平台参数名不一至情况
                    version: '4.9.6'  // 版本要求
                }
            },
            ios: {
                protocol: 'protocol',
                index: {
                    path: 'path',
                    param: {},
                    paramMap: {
                    },
                    version: 0
                }
            }
        },
        link: {
            pagename: {
                url: '',
                param: {
                },
                paramMap: {
                },
                version: 0
            }
        }, // 配置univerlink方案具体页面及参数，生成请求格式为"https://domain.com?param=value"
        yyb: {
            url: 'http://a.app.qq.com/o/simple.jsp',
            param: {
                pkgname: '',
                ckey: ''
            }
        },
    },
    pkgs: { // 下载包配置
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
    useYingyongbao: true,   // 在微信中跳转应用宝，默认为true
    wxGuideMethod: ()=>{},  // 微信中进行提示引导(useYingyongbao为false时)，指定null时走ios/android方案（适用不受微信限制）
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
        const div = document.createElement('div');
        div.style.position = 'absolute'
        div.style.top = '0';
        div.style.zIndex = '1111';
        div.style.width = '100%';
        div.style.height = '100%';
        div.innerHTML = '<div style="height:100%;background-color:#000;opacity:0.5;"></div>'
            +'<div style="position:absolute;top:0;background: url('
            + require('../static/img/finger.png') + ') no-repeat right top;background-size:' + px('204px') + ' ' + px('212px') + ';width:100%;padding-top:' + px('208px') + ';color:white;font-size:' + px('32px') + ';text-align:center;">'
            + (explorerName ? '<img src="' + require("../static/img/safari.png") + '" style="width:' + px('120px') + ';height:' + px('120px') + ';"/>' : '')
            + '<p style="font-size:' + px('36px') + ';font-weight:bold;margin-bottom:6px;">点右上角选择“在' + explorerName + '浏览器中打开”</p>'
            + '<p> 就能马上打开伙拍了哦~</p></div>';
        document.body.appendChild(div);
        div.onclick = function () {
            div.remove();
        }
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
lanchApp();
lanchApp({
    page: 'frs',
    param: {
        forumName: 'jawidx'
    }
}, (status, detector) => {
    return true;
});
lanchApp({
    openMethod:'yingyongbao'
});
lanchApp({
    page: 'h5',
    param: {
        url: 'https://tieba.baidu.com/huodong'
    },
    url:'https://tieba.baidu.com/huodong'
});
downApp();
downApp({
    pkgs:{
        ios:'',
        android:''
    }
});
```

## Who use?
Tieba、伙拍小视频、好看视频