import { LaunchApp, detector } from '../src/index';
import './index.less';
console.log('detector,', detector);
function addHandler(element, type, handler) {
    if (!element) return;
    if (element.addEventListener) {
        element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + type, handler);
    } else {
        element['on' + type] = handler;
    }
}

const linkTieba = document.getElementsByClassName('j_tieba')[0];
const linkNani = document.getElementsByClassName('j_nani')[0];
const linkHaokan = document.getElementsByClassName('j_haokan')[0];

// Tieba
const tiebaConfig = {
    deeplink: {
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
        link: {
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
        yyb: {
            url: 'http://a.app.qq.com/o/simple.jsp',
            param: {
                pkgname: 'com.baidu.tieba'
            }
        }
    },
    pkgs: {
        android: 'https://downpack.baidu.com/baidutieba_AndroidPhone_v8.8.8.6(8.8.8.6)_1020584c.apk',
        ios: 'https://itunes.apple.com/app/apple-store/id477927812?pt=328057&ct=MobileQQ_LXY&mt=8',
        yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513',
    },
    useYingyongbao: false,
    useUniversalLink: false,
    useAppLink: false,
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
    landPage: 'http://ti' + 'eba.baidu.com/mo/q/activityDiversion/download',
    searchPrefix: (detector) => {
        console.log('kkkkk,', detector)
        if (detector.os.name == 'android') {
            return '//';
        }
        return '?';
    }
};
const tbCallApp = new LaunchApp(tiebaConfig);
addHandler(linkTieba, 'click', function () {
    tbCallApp.open({
        page: 'frs',
        param: { forumName: 'jawidx' },
        //page: 'pb',
        //param: { threadId: 5444301754 },
        // pkgs: {
        //     android: ''
        // }
    }, (status, detector) => {
        console.log('callback,', status, detector);
        return 1;
    });
});


// Nani
const naniConfig = {
    deeplink: {
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
        link: {
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
        yyb: {
            url: 'http://a.app.qq.com/o/simple.jsp',
            param: {
                pkgname: 'com.baidu.nani',
                ckey: ''
            }
        },
    },
    pkgs: {
        android: 'https://downpack.baidu.com/baidutieba_AndroidPhone_v8.8.8.6(8.8.8.6)_1020584c.apk',
        ios: 'https://itunes.apple.com/cn/app/id1322948417?mt=8',
        yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513',
    },
    useUniversalLink: false,
    useAppLink: false,
    landPage: 'http://nani.baidu.com/',
    timeout: 2000,
};
const lanchNani = new LaunchApp(naniConfig);
addHandler(linkNani, 'click', function () {
    lanchNani.open({
        page: 'h5',
        url: 'http://tieba.baidu.com/3',
        pkgs: {
            android: 'https://imgsa.baidu.com/forum/pic/item/632762d0f703918f81780a075d3d269758eec455.jpg'

        }
    }, (s, d) => {
        console.log(s, d)
        return 1;
    });
});


// Haokan
const haokanConfig = {
    inApp: false,
    appVersion: '4.9.5.10',
    pkgName: 'com.baidu.haokan',
    deeplink: {
        scheme: {
            android: {
                protocol: 'baiduhaokan',
                index: {
                    path: 'home/index',
                    // baiduhaokan://home/index/?channel=recommend&auto_play_index=0
                    param: {
                        tab: '',
                        tag: '',
                        source: '',
                        channel: '',
                        // vid:'',
                    },
                },
                video: {
                    path: 'video/details/',
                    param: {
                        vid: ''
                    }
                },
                minivideo: {
                    path: 'minivideo/videodetails/',
                    param: {
                        vid: ''
                    }
                },
                login: {
                    path: 'action/loginSMS/',
                    param: {
                        vid: ''
                    }
                },
                my: {
                    path: 'home/my',
                    paramMap: {
                    }
                },
                live: {
                    path: 'home/live/',
                    paramMap: {
                    }
                },
                webview: {
                    path: 'webview',
                    paramMap: {
                    }
                }
            },
            ios: {
                protocol: 'baiduhaokan',
                index: {
                    path: 'home/index'
                },
                video: {
                    path: 'video/details/'
                },
                minivideo: {
                    path: 'minivideo/videodetails/',
                    param: {
                        vid: ''
                    }
                },
                login: {
                    path: 'action/loginSMS/',
                    param: {
                        vid: ''
                    }
                },
                my: {
                    path: 'home/my',
                    paramMap: {
                    }
                },
                live: {
                    path: 'home/live/',
                    paramMap: {
                    }
                },
                webview: {
                    path: 'webview',
                    paramMap: {
                    }
                }
            }
        },
        link: {
            index: {
                url: 'https://haokan.baidu.com',
                param: {
                },
            },
            video: {
                url: 'http://wapsite.baidu.com/haokan/share/detail?url_key={vid}',
                param: {
                    // target:''
                },
            },
            webview: {
                url: 'https://haokan.baidu.com/',
                param: {
                    uid: ''
                }
            }
        },
        yyb: {
            url: 'http://a.app.qq.com/o/simple.jsp',
            param: {
                pkgname: 'com.baidu.nani',
                ckey: ''
            }
        },
    },
    pkgs: {
        android: 'https://downpack.baidu.com/baidutieba_AndroidPhone_v8.8.8.6(8.8.8.6)_1020584c.apk',
        ios: 'https://itunes.apple.com/cn/app/id1322948417?mt=8',
        yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513',
        store: {
            // other: {
            //     reg: '',
            //     scheme: '',
            //     id: ''
            // },
        }
    },
    useYingyongbao: false,
    // wxGuideMethod: null,
    useUniversalLink: false,
    useAppLink: false,
    landPage: 'http://haokan.baidu.com/download',
    timeout: 2000
};
const lanchHaokan = new LaunchApp(haokanConfig);

addHandler(linkHaokan, 'click', function () {
    lanchHaokan.open({
        page: 'my',
        param: {
            vid: '4215764431860909454'
        },
        pkgName:'3333',
        // launchType: {
        //     ios: 'store',
        //     android: 'store'
        // },
        // clipboardTxt: '#baiduhaokan://webview/?url_key=https%3a%2f%2feopa.baidu.com%2fpage%2fauthorizeIndex-AcHzJLpa%3fproductid%3d1%26gtype%3d1%26idfrom%3dinside-baiduappbanner&pd=yq&tab=guide&tag=guide&source=yq-0-yq#',
        pkgs: {
            android: 'https://sv.bdstatic.com/static/haokanapk/apk/baiduhaokan1021176d.apk',
            ios: 'https://itunes.apple.com/cn/app/id1322948417?mt=8',
            yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513'
        }
    }, (s, d) => {
        console.log('callbackout', s, d);
        return 2;
    });

    // lanchHaokan.open({
    //     page: 'index',
    //     param: { a: 3 },
    //     paramMap: {},
    //     // launchType:{ios:'',android:''},
    //     // launchType:{ios:''}
    //     // launchType:{android:''},
    //     // scheme:'',
    //     // url: 'http://tieba.baidu.com/3',
    //     // wxGuideMethod:()=>{alert('wx open')}
    //     // updateTipMethod
    //     clipboardTxt: 'clipboardTxt333',
    //     pkgs: {
    //         android: 'https://sv.bdstatic.com/static/haokanapk/apk/baiduhaokan1021176d.apk',
    //         ios: 'https://itunes.apple.com/cn/app/id1322948417?mt=8',
    //         yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513'
    //     },
    //     timeout: 3000
    //     // param: {}
    // }, (s, d) => {
    //     console.log('callbackout', s, d)
    //     return 0;
    // });

    // lanchHaokan.open({
    //     page: 'regShare',
    //     param: { share_content: '%7B%22title%22%3A%22%E5%8F%91%E9%92%B1%E4%BA%86%EF%BC%8110%E4%B8%87%E5%85%83%E7%8F%BE%E9%87%91%E7%BA%A2%E5%8C%85%E7%AD%89%E4%BD%A0%E9%A2%86~%22%2C%22content%22%3A%22%E5%92%8C%E8%B4%9D%E8%82%AF%E7%86%8A%E5%90%88%E6%8B%8D%E5%B9%B6%E4%B8%8A%E4%BC%A0%E8%A7%86%E9%A2%91%EF%BC%8C%E7%93%9C%E5%88%86%E7%8F%BE%E9%87%91%E4%BA%BA%E4%BA%BA%E6%9C%89%E4%BB%BD%EF%BC%81%E5%BF%AB%E6%9D%A5%E7%9C%8B%E7%9C%8B%E6%88%91%E7%9A%84%E6%8E%92%E5%90%8D%EF%BD%9E%22%2C%22image_url%22%3A%22http%3A%2F%2Fa.hiphotos.baidu.com%2Fnormandy%2Fpic%2Fitem%2F8ad4b31c8701a18b2f1e78d7932f07082938feb5.jpg%22%2C%22url_key%22%3A%22http%3A%2F%2Fjawidx.rmb.rmb.otp.baidu.com%2Fhaokan%2Fwisehuabinrank%22%2C%22type%22%3A%22shareto%22%2C%22activity_type%22%3A%221%22%2C%22share_type%22%3A%220%22%2C%22tab%22%3A%22shareto%22%2C%22tag%22%3A%22sharepanel%22%2C%22source%22%3A%22sharepanel-0-hkophuabinbd%22%2C%22show_share%22%3Atrue%7D' },
    //     // paramMap:{},
    //     // launchType:{ios:'',android:''},
    //     // launchType:{ios:''}
    //     // launchType:{android:''},
    //     // scheme:'',
    //     // url: 'http://tieba.baidu.com/3',
    //     // wxGuideMethod
    //     // updateTipMethod
    //     clipboardTxt: '#baiduhaokan://action/shareHandler/?share_content=%7B%22title%22%3A%22%E5%8F%91%E9%92%B1%E4%BA%86%EF%BC%8110%E4%B8%87%E5%85%83%E7%8F%BE%E9%87%91%E7%BA%A2%E5%8C%85%E7%AD%89%E4%BD%A0%E9%A2%86~%22%2C%22content%22%3A%22%E5%92%8C%E8%B4%9D%E8%82%AF%E7%86%8A%E5%90%88%E6%8B%8D%E5%B9%B6%E4%B8%8A%E4%BC%A0%E8%A7%86%E9%A2%91%EF%BC%8C%E7%93%9C%E5%88%86%E7%8F%BE%E9%87%91%E4%BA%BA%E4%BA%BA%E6%9C%89%E4%BB%BD%EF%BC%81%E5%BF%AB%E6%9D%A5%E7%9C%8B%E7%9C%8B%E6%88%91%E7%9A%84%E6%8E%92%E5%90%8D%EF%BD%9E%22%2C%22image_url%22%3A%22http%3A%2F%2Fa.hiphotos.baidu.com%2Fnormandy%2Fpic%2Fitem%2F8ad4b31c8701a18b2f1e78d7932f07082938feb5.jpg%22%2C%22url_key%22%3A%22http%3A%2F%2Fjawidx.rmb.rmb.otp.baidu.com%2Fhaokan%2Fwisehuabinrank%22%2C%22type%22%3A%22shareto%22%2C%22activity_type%22%3A%221%22%2C%22share_type%22%3A%220%22%2C%22tab%22%3A%22shareto%22%2C%22tag%22%3A%22sharepanel%22%2C%22source%22%3A%22sharepanel-0-hkophuabinbd%22%2C%22show_share%22%3Atrue%7D#',
    //     pkgs: {
    //         android: 'https://sv.bdstatic.com/static/haokanapk/apk/baiduhaokan1021176d.apk',
    //         ios: 'https://itunes.apple.com/cn/app/id1322948417?mt=8',
    //         yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513'
    //     },
    //     timeout: 3000
    //     // param: {}
    // }, (s, d) => {
    //     console.log('callbackout', s, d)
    //     return 0;
    // });

    // lanchHaokan.open({
    //     page: 'webview',
    //     param: {
    //         // url_key: 'https%3a%2f%2feopa.baidu.com%2fpage%2fauthorizeIndex-AcHzJLpa%3fproductid%3d1%26gtype%3d1%26idfrom%3dinside-baiduappbanner&pd=yq&tab=guide&tag=guide&source=yq-0-yq',
    //         ckey: '123455'
    //     },
    //     scheme: 'baiduhaokan://webview/?url_key=https%3a%2f%2feopa.baidu.com%2fpage%2fauthorizeIndex-AcHzJLpa%3fproductid%3d1%26gtype%3d1%26idfrom%3dinside-baiduappbanner&pd=yq&tab=guide&tag=guide&source=yq-0-yq',
    //     url: 'http://tieba.baidu.com/jawidx',
    //     // paramMap:{},
    //     // launchType: {
    //     //     ios: 'store',
    //     //     android: 'scheme'
    //     // },
    //     // wxGuideMethod:()=>{
    //     //     alert('右上角浏览器里打开！');
    //     // },
    //     // wxGuideMethod: null,
    //     updateTipMethod: () => {
    //         alert('长个级');
    //     },
    //     clipboardTxt: '#baiduhaokan://webview/?url_key=https%3a%2f%2feopa.baidu.com%2fpage%2fauthorizeIndex-AcHzJLpa%3fproductid%3d1%26gtype%3d1%26idfrom%3dinside-baiduappbanner&pd=yq&tab=guide&tag=guide&source=yq-0-yq#',
    //     pkgs: {
    //         android: 'https://sv.bdstatic.com/static/haokanapk/apk/baiduhaokan1021176d.apk',
    //         ios: 'https://itunes.apple.com/cn/app/id1322948417?mt=8',
    //         yyb: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baidu.tieba&ckey=CK1374101624513'
    //     },
    //     timeout: 3000,
    //     landPage: 'http://163.com',
    //     callback: () => {
    //         alert('kkkkk');
    //     }
    // }, (s, d) => {
    //     console.log('callbackout', s, d)
    //     return 0;
    // });
});
