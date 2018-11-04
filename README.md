# web-launch-app
## 安装
npm install --save web-launch-app

## 简介 
- 通过配置唤起方案、唤起页面路径及参数、渠道包地址等，在业务代码中通过open()方法唤起App指定页面或通过down()方法下载指定安装包。
- 默认唤起方案
    - iOS使用universal link或scheme或appstore方案
    - Android使用scheme方案
    - 微信中使用应用宝或弹引导提示方案

## 使用
```javascript
const lanchApp = new LaunchApp(config);
// 唤起App
lanchApp.open();
// 唤起App到指定页面
lanchApp.open({
    // 唤起方案（weixin表示弹引导提示方案）
    openMethod:'weixin'|'yingyongbao'|'scheme'|'univerlink'|'appstore' 
    page: '',   // for scheme&univerlink
    param:{},   // for scheme&univerlink
    url:'',  // for universal link
    pkgs:{android:'',ios:''}    // 使用scheme唤起超时后下载使用
}, (status, detector) => {
    // 使用scheme方案时唤起回调，status(0:failed，1:success，2:unknow)
    // 返回true表示打开失败时进行下载
    return true;
});
// 下载配置的默认包
lanchApp.down();
// 下载指定包
lanchApp.down{
    pkgs:{
        ios:'',
        android:''
    }
};
```

## 配置
```javascript
{
    scheme: {}, // 配置scheme方案具体页面及参数，生成请求格式为"protocol://path?param&param"
    univerlink: {}, // 配置univerlink方案具体页面及参数，生成请求格式为"https://domain.com?param=value"
    yingyongbao: {},
    pkgs: {},   // 下载包配置
    useUniversalLink: true, // 是否为ios9+使用universallink方案，默认为true
    useYingyongbao: true,   // 在微信中跳转应用宝，默认为true
    wxGuideMethod: ()=>{},  // 微信中进行提示引导(useYingyongbao为false时)
    downPage:'',   //下载页（当无法找到对应配置或出错时跳转到下载页）
    searchPrefix: '?',  // scheme或univerlink生成请求中参数前辍，默认为"?"
    timeout: 2000   // scheme方案中跳转超时判断，默认2000毫秒
}
```

## Demo
```javascript
// launchapp.ts
import {LaunchApp} from 'web-launch-app';
const lanchInstance = new LaunchApp({
    scheme: {
        android: {
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
                // 参数映射(解决不同端使用不同参数名的问题)
                paramMap: {
                    forumName: 'kw'
                }
            },
            h5: {
                protocol: 'h5',
                path: 'tieba.baidu.com',
            }
        },
        ios: {
            index: {
                protocol: 'com.baidu.tieba',
                path: 'jumptoforum',
            },
            frs: {
                protocol: 'com.baidu.tieba',
                path: 'jumptoforum',
                paramMap: {
                    forumName: 'tname'
                }
            },
            h5: {
                protocol: 'h5',
                path: 'tieba.baidu.com',
            }
        }
    },
    univerlink: {
        index: {
            url: 'https://tieba.baidu.com',
            param: {},
            paramMap: {
                forumName: 'kw'
            }
        },
        frs: {
            // 支持占位符
            url: 'https://tieba.baidu.com/p/{kw}',
            paramMap: {
                forumName: 'kw'
            }
        }
    },
    yingyongbao: {
        url: 'http://a.app.qq.com/o/simple.jsp',
        param: {
            pkgname: 'com.baidu.tieba'
        }
    },
    pkgs: {
        androidApk: {
            // 可以根据浏览器名称设置渠道包 edge|sogou|360|micromessenger|qq|tt|liebao|tao|baidu|ie|mi|opera|oupeng|yandex|ali-ap|uc|chrome|android|blackberry|safari|webview|firefox|nokia
            default: 'https://downpack.baidu.com/default.apk',
            qq: 'https://downpack.baidu.com/tieba_qq.apk'
        },
        appstore: {
            default: 'https://itunes.apple.com/app/apple-store/id477927812?pt=328057&ct=MobileQQ_LXY&mt=8',
        },
        yingyongbao: {
            default: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513',
        }
    },
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
            div.remove()
        }
    },
    downPage: 'http://tieba.baidu.com/mo/q/activityDiversion/download',
    searchPrefix: (detector) => {
       return '?';
    },
    timeout: 3000
});

export function lanchApp(options:any, callback?: (status, detector) => boolean) {
    lanchInstance.open(options, callback);
}

// 下载app
export function downApp(options:any) {
    lanchInstance.down(options);
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
Tieba、伙拍小视频