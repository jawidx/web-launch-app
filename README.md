# web-launch-app
awake app from webpage

## Installation
npm install --save web-launch-app

## Intro
- ios: iOS9&iOS9+ use universal link, iOS9- use scheme
- android: scheme
- wechat:yingyongbao

## Usage
```javascript
const lanchApp = new LaunchApp(config);
lanchApp.open();
lanchApp.open({
    // weixin:opentip in wechat，univerlink&appstore only work on iOS
    openMethod:'weixin'|'yingyongbao'|'scheme'|'univerlink'|'appstore'     
    page: '',   // for scheme&univerlink
    param:{},   // for scheme&univerlink
    url:'',  // for universal link
    pkgs:{android:'',ios:''}    // for timeout download when use scheme
}, (status, detector) => {
    // status(0:failed，1:success，2:unknow)
    // true: will down package when open failed or unknow
    return true;
});
lanchApp.down();
lanchApp.down{
    pkgs:{
        ios:'',
        android:''
    }
};
```

## Config
```javascript
{
    scheme: {}, // protocol://path?param&param
    univerlink: {}, // https://nan.baidu.com
    yingyongbao: {},
    pkgs: {},   // packages for download
    useUniversalLink: true, // use UniversalLink for ios9+(default:true)
    useYingyongbao: true,   // to yingyongbao in wechat(default:true)
    wxGuideMethod: ()=>{},  // open tip in wechat(when useYingyongbao is false)
    downPage:'',   //download page,jump to download page when it cant't find a corresponding configuration or get a error
    searchPrefix: '?',  // the parameter prefix(default is question mark)
    timeout: 2000   // for scheme(default:2000)
}
```

## Demo
```javascript
import {LaunchApp} from 'web-launch-app';
const lanchApp = new LaunchApp({
    scheme: {
        android: {
            // page name(default:index)
            index: {
                protocol: 'tbfrs',
                path: 'tieba.baidu.com',
                // fixed parameter for this page
                param: {},
                // param map(to solve the problem of using different parameter names for different platforms)
                paramMap: {}
            },
            frs: {
                protocol: 'tbfrs',
                path: 'tieba.baidu.com',
                param: {},
                paramMap: {
                    forumName: 'kw'
                }
            },
            h5: {
                protocol: 'h5',
                path: 'tieba.baidu.com',
                param: {url:''},
                paramMap: {}
            }
        },
        ios: {
            index: {
                protocol: 'com.baidu.tieba',
                path: 'jumptoforum',
                param: {},
                paramMap: {}
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
                param: {url:''},
                paramMap: {}
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
            // support placeholder
            url: 'https://tieba.baidu.com/p/{kw}',
            param: {},
            paramMap: {
                forumName: 'kw'
            }
        },
        h5: {
            url: 'https://tieba.baidu.com/',
            param: {},
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
            // detector.browser.name
            default: 'https://downpack.baidu.com/baidutieba_AndroidPhone_v8.8.8.6(8.8.8.6)_1020584c.apk',
            qq: 'https://downpack.baidu.com/baidutieba_AndroidPhone_v8.8.8.6(8.8.8.6)_1020584c.apk',
            micromessenger:'https://downpack.baidu.com/baidutieba_AndroidPhone_v8.8.8.6(8.8.8.6)_1020584c.apk'
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
            + '<p> 就能马上打开Nani了哦~</p></div>';
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
lanchApp.open();
lanchApp.open({
    page: 'frs',
    param: {
        forumName: 'jawidx'
    }
}, (status, detector) => {
    return true;
});
lanchApp.open({
    openMethod:'yingyongbao'
});
lanchApp.open({
    page: 'h5',
    param: {
        url: 'https://tieba.baidu.com/huodong'
    },
    url:'https://tieba.baidu.com/huodong'
});
lanchApp.down();
lanchApp.down({
    pkgs:{
        ios:'',
        android:''
    }
});
```

## Who use?
Tieba、伙拍小视频