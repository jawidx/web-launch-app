# web-launch-app
awake app from webpage

## Installation
npm install --save web-launch-app

## Usage
```javascript
import {LaunchApp} from 'web-launch-app';
const lanchApp = new LaunchApp({config...});
lanchApp.open({
    page: 'pagename',
    param: {}
}, (status, detector) => {
    console.log('callback,', status, detector);
    return true;
});
// lanchApp.down();
```

## Example
```javascript
import {LaunchApp} from 'web-launch-app';
const lanchApp = new LaunchApp({
    // protocol://path?param&param
    scheme: {
        android: {
            // page name(default:index)
            index: {
                protocol: 'tbfrs',
                path: 'tieba.baidu.com',
                // fixed parameter for this page
                param: {},
                // param map(to solve the problem of using different parameter names for different platforms)
                paramMap: {
                }
            },
            frs: {
                protocol: 'tbfrs',
                path: 'tieba.baidu.com',
                param: {},
                paramMap: {
                    forumName: 'kw'
                }
            }
        },
        ios: {
            index: {
                protocol: 'com.baidu.tieba',
                path: 'jumptoforum',
                param: {},
                paramMap: {
                }
            },
            frs: {
                protocol: 'com.baidu.tieba',
                path: 'jumptoforum',
                paramMap: {
                    forumName: 'tname'
                }
            }
        }
    },
    univerlink: {
        index: {
            url: 'https://tieba.baidu.com',
            param: {
            },
            paramMap: {
                forumName: 'kw'
            }
        },
        frs: {
            // support placeholder
            url: 'https://tieba.baidu.com/p/{kw}',
            param: {
            },
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
    // use UniversalLink for ios9+(default:true)
    useUniversalLink: true,
    // download page url（boot the user to download or download installation packages directly）,jump to download page when it cant't find a corresponding configuration or get a error
    downPage: 'http://tieba.baidu.com/mo/q/activityDiversion/download',
    // the parameter prefix(default is question mark, you can define something else)
    searchPrefix: (detector) => {
       return '?';
    }
});
lanchApp.open({
    page: 'frs',
    param: {
        forumName: 'jawidx'
    }
}, (status, detector) => {
    // status(0:failed，1:success，2:unknow)
    // detector()
    console.log('callback,', status, detector);
    // true: will down package when open failed or unknow
    return true;
});
```

## Dependency
- [detector](https://github.com/hotoo/detector)
