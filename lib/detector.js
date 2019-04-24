"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function typeOf(type) {
    return function (object) {
        return Object.prototype.toString.call(object) === "[object " + type + "]";
    };
}
function each(object, factory) {
    for (var i = 0, l = object.length; i < l; i++) {
        if (factory.call(object, object[i], i) === false) {
            break;
        }
    }
}
var Detector = /** @class */ (function () {
    function Detector(rules) {
        this._rules = rules;
    }
    Detector.prototype._detect = function (name, expression, ua) {
        var expr = typeOf("Function")(expression) ? expression.call(null, ua) : expression;
        if (!expr) {
            return null;
        }
        var info = {
            name: name,
            version: "0",
            codename: "",
        };
        if (expr === true) {
            return info;
        }
        else if (typeOf("String")(expr)) {
            if (ua.indexOf(expr) !== -1) {
                return info;
            }
        }
        else if (typeOf("Object")(expr)) {
            if (expr.hasOwnProperty("version")) {
                info.version = expr.version;
            }
            return info;
        }
        else if (typeOf("RegExp")(expr)) {
            var m = expr.exec(ua);
            if (m) {
                if (m.length >= 2 && m[1]) {
                    info.version = m[1].replace(/_/g, ".");
                }
                return info;
            }
        }
    };
    Detector.prototype._parseItem = function (ua, patterns, factory, detector) {
        var self = this;
        var detected = {
            name: "na",
            version: "0",
        };
        ;
        each(patterns, function (pattern) {
            var d = self._detect(pattern[0], pattern[1], ua);
            if (d) {
                detected = d;
                return false;
            }
        });
        factory.call(detector, detected.name, detected.version);
    };
    /**
     * parse ua
     * @param ua
     */
    Detector.prototype.parse = function (ua) {
        ua = (ua || "").toLowerCase();
        var d = {};
        this._parseItem(ua, this._rules.os, function (name, version) {
            var v = parseFloat(version);
            d.os = {
                name: name,
                version: v,
                fullVersion: version,
            };
            d.os[name] = v;
        }, d);
        this._parseItem(ua, this._rules.browser, function (name, version) {
            var mode = version;
            var v = parseFloat(version);
            d.browser = {
                name: name,
                version: v,
                fullVersion: version,
                mode: parseFloat(mode),
                fullMode: mode,
            };
            d.browser[name] = v;
        }, d);
        return d;
    };
    return Detector;
}());
exports.Detector = Detector;
var OS = [
    ["ios", function (ua) {
            if (/\bcpu(?: iphone)? os /.test(ua)) {
                return /\bcpu(?: iphone)? os ([0-9._]+)/;
            }
            else if (ua.indexOf("iph os ") !== -1) {
                return /\biph os ([0-9_]+)/;
            }
            else {
                return /\bios\b/;
            }
        }],
    ["android", function (ua) {
            if (ua.indexOf("android") >= 0) {
                return /\bandroid[ \/-]?([0-9.x]+)?/;
            }
            else if (ua.indexOf("adr") >= 0) {
                if (ua.indexOf("mqqbrowser") >= 0) {
                    return /\badr[ ]\(linux; u; ([0-9.]+)?/;
                }
                else {
                    return /\badr(?:[ ]([0-9.]+))?/;
                }
            }
            return "android";
            //return /\b(?:android|\badr)(?:[\/\- ](?:\(linux; u; )?)?([0-9.x]+)?/;
        }],
    ["wp", function (ua) {
            if (ua.indexOf("windows phone ") !== -1) {
                return /\bwindows phone (?:os )?([0-9.]+)/;
            }
            else if (ua.indexOf("xblwp") !== -1) {
                return /\bxblwp([0-9.]+)/;
            }
            else if (ua.indexOf("zunewp") !== -1) {
                return /\bzunewp([0-9.]+)/;
            }
            return "windows phone";
        }],
    ["symbian", /\bsymbian(?:os)?\/([0-9.]+)/],
    ["chromeos", /\bcros i686 ([0-9.]+)/],
    ["linux", "linux"],
    ["windowsce", /\bwindows ce(?: ([0-9.]+))?/]
];
var BROWSER = [
    // tencent
    ["micromessenger", /\bmicromessenger\/([\d.]+)/],
    ["qq", /\bm?qqbrowser\/([0-9.]+)/],
    ["tt", /\btencenttraveler ([0-9.]+)/],
    ["weibo", /weibo__([0-9.]+)/],
    ["uc", function (ua) {
            if (ua.indexOf("ucbrowser/") >= 0) {
                return /\bucbrowser\/([0-9.]+)/;
            }
            else if (ua.indexOf("ubrowser/") >= 0) {
                return /\bubrowser\/([0-9.]+)/;
            }
            else if (/\buc\/[0-9]/.test(ua)) {
                return /\buc\/([0-9.]+)/;
            }
            else if (ua.indexOf("ucweb") >= 0) {
                // `ucweb/2.0` is compony info.
                // `UCWEB8.7.2.214/145/800` is browser info.
                return /\bucweb([0-9.]+)?/;
            }
            else {
                return /\b(?:ucbrowser|uc)\b/;
            }
        }],
    ["360", function (ua) {
            if (ua.indexOf("360 aphone browser") !== -1) {
                return /\b360 aphone browser \(([^\)]+)\)/;
            }
            return /\b360(?:se|ee|chrome|browser)\b/;
        }],
    ["baidu", /\b(?:ba?idubrowser|baiduhd)[ \/]([0-9.x]+)/],
    ["baiduboxapp",
        function (ua) {
            var back = 0;
            var a;
            if (/ baiduboxapp\//i.test(ua)) {
                if (a = /([\d+.]+)_(?:diordna|enohpi)_/.exec(ua)) {
                    a = a[1].split(".");
                    back = a.reverse().join(".");
                }
                else if ((a = /baiduboxapp\/([\d+.]+)/.exec(ua))) {
                    back = a[1];
                }
                return {
                    version: back,
                };
            }
            return false;
        },
    ],
    ["sogou", function (ua) {
            if (ua.indexOf("sogoumobilebrowser") >= 0) {
                return /sogoumobilebrowser\/([0-9.]+)/;
            }
            else if (ua.indexOf("sogoumse") >= 0) {
                return true;
            }
            return / se ([0-9.x]+)/;
        }],
    ["ali-ap", function (ua) {
            if (ua.indexOf("aliapp") > 0) {
                return /\baliapp\(ap\/([0-9.]+)\)/;
            }
            else {
                return /\balipayclient\/([0-9.]+)\b/;
            }
        }],
    ["ali-tb", /\baliapp\(tb\/([0-9.]+)\)/],
    ["ali-tm", /\baliapp\(tm\/([0-9.]+)\)/],
    ["tao", /\btaobrowser\/([0-9.]+)/],
    // 厂商
    ["mi", /\bmiuibrowser\/([0-9.]+)/],
    ["oppo", /\boppobrowser\/([0-9.]+)/],
    ["vivo", /\bvivobrowser\/([0-9.]+)/],
    ["meizu", /\bmzbrowser\/([0-9.]+)/],
    ["nokia", /\bnokiabrowser\/([0-9.]+)/],
    // ["huawei", /\bhuaweibrowser\/([0-9.]+)/],
    ["samsung", /\bsamsungbrowser\/([0-9.]+)/],
    ["maxthon", /\b(?:maxthon|mxbrowser)(?:[ \/]([0-9.]+))?/],
    // Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
    ["opera", function (ua) {
            var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
            var re_opera_new = /\bopr\/([0-9.]+)/;
            return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
        }],
    ["edge", /edge\/([0-9.]+)/],
    ["firefox", /\bfirefox\/([0-9.ab]+)/],
    ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
    // Android 默认浏览器。该规则需要在 safari 之前。
    ["android", function (ua) {
            if (ua.indexOf("android") === -1) {
                return;
            }
            return /\bversion\/([0-9.]+(?: beta)?)/;
        }],
    ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
    // 如果不能被识别为 Safari，则猜测是 WebView。
    ["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/],
];
var detector = new Detector({
    os: OS,
    browser: BROWSER
});
var ua = navigator.userAgent + " " + navigator.appVersion + " " + navigator.vendor;
exports.ua = ua;
var d = detector.parse(ua);
exports.detector = d;
