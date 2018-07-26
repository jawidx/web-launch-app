import { LaunchApp } from '../lib/index.js';
import './index.less';

function addHandler(element, type, handler) {
    if (!element) return;
    if (element.addEventListener) {
        element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + type, handler);
    } else {
        element["on" + type] = handler;
    }
}
const tipEle = document.getElementsByClassName('tip')[0];
// console.log = function addHandler(key, info) {
//     tipEle.innerHTML = tipEle.innerHTML + '<br/>' + key + ',' + (info ? JSON.stringify(info) : '');
// }

// TIEBA
const tiebaConfig = {
    scheme: {
        android: {
            index: {
                protocol: 'tbmaintab',
                path: 'tieba.bai' + 'du.com',
            },
            frs: {
                protocol: 'tbfrs',
                path: 'tieba.bai' + 'du.com',
                param: {},
                paramMap: {
                    forumName: 'kw'
                }
            },
            pb: {
                protocol: 'tbpb',
                path: 'tieba.bai' + 'du.com',
                paramMap: {
                    threadId: 'tid'
                }
            },
            pbtwzb: {
                protocol: 'tbphotolive',
                path: 'tieba.bai' + 'du.com',
            },
            usercenter: {
                protocol: 'com.baidu.tieba',
                path: 'usercenter',
            },
            videosquare: {
                protocol: 'com.baidu.tieba',
                path: 'videosquare',
            },
            emotioncenter: {
                protocol: 'com.baidu.tieba',
                path: 'emotioncenter',
            },
            membercenter: {
                protocol: 'com.baidu.tieba',
                path: 'membercenter',
            },
            webview: {
                protocol: 'com.baidu.tieba',
                path: 'tbwebview',
                param: {
                    url: 'http://www.baidu.com'
                }
            },
        },
        ios: {
            index: {
                protocol: 'com.baidu.tieba',
                path: 'jumptoforum'
            },
            frs: {
                protocol: 'com.baidu.tieba',
                path: 'jumptoforum',
                paramMap: {
                    forumName: 'tname'
                }
            },
            pb: {
                protocol: 'com.baidu.tieba',
                path: 'jumptoforum',
                paramMap: {
                    threadId: 'kz'
                }
            }
        }
    },
    univerlink: {
        index: {
            url: 'https://tieba.baidu.com',
            param: {
            },
        },
        frs: {
            url: 'https://tieba.baidu.com/f',
            param: {
                // kw: 'jawidx'
            },
            paramMap: {
                forumName: 'kw'
            }
        },
        pb: {
            url: 'https://tieba.baidu.com/p/{pid}',
            param: {
            },
            paramMap: {
                threadId: 'pid'
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
            default: 'https://downpack.baidu.com/baidutieba_AndroidPhone_v8.8.8.6(8.8.8.6)_1020584c.apk',
            qqfriend: '',
        },
        appstore: {
            default: 'https://itunes.apple.com/app/apple-store/id477927812?pt=328057&ct=MobileQQ_LXY&mt=8',
            qqfriend: '',
        },
        yingyongbao: {
            default: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513',
            qqfriend: '',
        }
    },
    useYingyongbao: false,
    useUniversalLink: false,
    wxGuideMethod: function () {
        const div = document.createElement('div');
        div.style.position = 'absolute'
        div.style.top = '0';
        div.style.zIndex = '1111';
        div.style.width = '100%';
        div.style.height = '100%';
        div.innerHTML = '<div style="height:100%;background-color:#000;opacity:0.5;"></div><p style="position:absolute;top:0px;background-color:white;font-size:80px;padding: 20px 40px;margin: 0 40px;">点击右上角->选择在浏览器中打开->即可打开或下载APP</p>';
        document.body.appendChild(div);
        div.onclick = function () {
            div.remove()
        }
    },
    downPage: 'http://ti' + 'eba.baidu.com/mo/q/activityDiversion/download',
    searchPrefix: (detector) => {
        if (detector.os.name == 'android') {
            return '//';
        }
        return '?';
    }
};
const tbCallApp = new LaunchApp(tiebaConfig);
const linkDefault = document.getElementsByClassName('j_default')[0];
const linkIndex = document.getElementsByClassName('j_index')[0];
const linkFrs = document.getElementsByClassName('j_frs')[0];
const linkPb = document.getElementsByClassName('j_pb')[0];
const linkUsercenter = document.getElementsByClassName('j_usercenter')[0];
const linkVideosquare = document.getElementsByClassName('j_videosquare')[0];
const linkTbwebview = document.getElementsByClassName('j_tbwebview')[0];
const linkEmotioncenter = document.getElementsByClassName('j_emotioncenter')[0];

// addHandler(linkDefault, 'click', function () {
//     tbCallApp.open();
// });
addHandler(linkIndex, 'click', function () {
    tbCallApp.open({
        page: 'index',
        param: {},
        pkgs: {
            android: 'https://nani.baidu.com/apple-app-site-association'
        }
    }, (status, detector) => {
        console.log('callback,', status, detector);
        return true;
    });
});
addHandler(linkFrs, 'click', function () {
    tbCallApp.open({
        page: 'frs',
        param: { forumName: 'jawidx' }
    }, (status, detector) => {
        console.log('callback,', status, detector);
        return false;
    });
});
addHandler(linkPb, 'click', function () {
    tbCallApp.open({
        page: 'pb',
        param: { threadId: 5444301754 }
    });
});
addHandler(linkUsercenter, 'click', function () {
    tbCallApp.open({
        page: 'usercenter',
        param: { uid: 85000367 }
    });
});
addHandler(linkVideosquare, 'click', function () {
    tbCallApp.open({
        page: 'videosquare',
    });
});
addHandler(linkTbwebview, 'click', function () {
    tbCallApp.open({
        page: 'webview',
    });
});
addHandler(linkEmotioncenter, 'click', function () {
    tbCallApp.open({
        page: 'emotioncenter',
    });
});

// NANI
const naniConfig = {
    scheme: {
        android: {
            index: {
                protocol: 'com.baidu.nani',
                path: 'index',
            },
            video: {
                protocol: 'com.baidu.nani',
                path: 'video',
                param: {},
                paramMap: {
                }
            },
            usercenter: {
                protocol: 'com.baidu.nani',
                path: 'usercenter',
                paramMap: {
                }
            },
            activity: {
                protocol: 'com.baidu.nani',
                path: 'activity',
                paramMap: {
                }
            },
        },
        ios: {
            index: {
                protocol: 'com.baidu.nani',
                path: 'index',
            },
            video: {
                protocol: 'com.baidu.nani',
                path: 'video',
                param: {},
                paramMap: {
                }
            },
            usercenter: {
                protocol: 'com.baidu.nani',
                path: 'usercenter',
                paramMap: {
                }
            },
            activity: {
                protocol: 'com.baidu.nani',
                path: 'activity',
                paramMap: {
                }
            },
        }
    },
    univerlink: {
        index: {
            url: 'https://nan.baidu.com',
            param: {
            },
        },
        video: {
            url: 'https://nan.baidu.com/n/nani/share/item/{tid}',
            param: {
            },
        },
        h5: {
            url: 'https://nan.baidu.com/',
            param: {
                uid: ''
            }
        },
    },
    yingyongbao: {
        url: 'http://a.app.qq.com/o/simple.jsp',
        param: {
            pkgname: 'com.baidu.nani'
        }
    },
    pkgs: {
        androidApk: {
            default: 'https://downpack.baidu.com/baidutieba_AndroidPhone_v8.8.8.6(8.8.8.6)_1020584c.apk',
            qqfriend: '',
        },
        appstore: {
            default: 'https://itunes.apple.com/cn/app/id1322948417?mt=8',
            qqfriend: '',
        },
        yingyongbao: {
            default: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513',
            qqfriend: '',
        }
    },
    useUniversalLink: false,
    downPage: 'http://nani.baidu.com/',
    timeout: 2000,
};
const lanchInstance = new LaunchApp(naniConfig);
// addHandler(linkDefault, 'click', function () {
//     lanchInstance.open({
//         page: 'index',
//         param: {}
//     }, (s, d) => {
//         alert(s)
//     });
// });
addHandler(linkDefault, 'click', function () {
    lanchInstance.open({
        page: 'h5',
        url: 'http://tieba.baidu.com',
        // param: {}
    }, (s, d) => {
        console.log(s,d)
    });
});
