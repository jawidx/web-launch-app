"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMerge = exports.iframeCall = exports.supportLink = exports.locationCall = exports.isAndroidWithLocationCallSupport = exports.isIOSWithLocationCallSupport = exports.inBaidu = exports.inWeibo = exports.inQQ = exports.inWeixin = exports.enableApplink = exports.enableULink = exports.isAndroid = exports.isIos = void 0;
var detector_1 = require("./detector");
exports.isIos = detector_1.detector.os.name === 'ios';
exports.isAndroid = detector_1.detector.os.name === 'android';
exports.enableULink = exports.isIos && detector_1.detector.os.version >= 9;
exports.enableApplink = exports.isAndroid && detector_1.detector.os.version >= 6;
exports.inWeixin = detector_1.detector.browser.name === 'micromessenger';
exports.inQQ = detector_1.detector.browser.name === 'qq';
exports.inWeibo = detector_1.detector.browser.name === 'weibo';
exports.inBaidu = detector_1.detector.browser.name === 'baidu';
exports.isIOSWithLocationCallSupport = exports.isIos && detector_1.detector.browser.name == 'safari' && detector_1.detector.os.version >= 9;
var isChromeWithLocationCallSupport = detector_1.detector.browser.name == 'chrome' && detector_1.detector.browser.version > 55;
var isSamsungWithLocationCallSupport = detector_1.detector.browser.name == 'samsung';
exports.isAndroidWithLocationCallSupport = exports.isAndroid && (isChromeWithLocationCallSupport || isSamsungWithLocationCallSupport);
/**
 * location call
 * @param url
 */
var locationCall = function (url) {
    (top.location || location).href = url;
};
exports.locationCall = locationCall;
/**
 * 宿主环境是否支持link
 */
var supportLink = function () {
    var supportLink = false;
    if (exports.enableApplink) {
        switch (detector_1.detector.browser.name) {
            case 'chrome':
            case 'samsung':
            case 'zhousi':
                supportLink = true;
                break;
            default:
                supportLink = false;
                break;
        }
    }
    if (exports.enableULink) {
        switch (detector_1.detector.browser.name) {
            case 'uc':
            case 'qq':
                supportLink = false;
                break;
            default:
                supportLink = true;
                break;
        }
    }
    return supportLink;
};
exports.supportLink = supportLink;
/**
 * iframe call
 * @param url
 */
var iframeCall = function (url) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('style', 'display:none');
    document.body.appendChild(iframe);
    setTimeout(function () {
        document.body.removeChild(iframe);
    }, 200);
};
exports.iframeCall = iframeCall;
/**
 * merge object
 */
var deepMerge = function (firstObj, secondObj) {
    for (var key in secondObj) {
        firstObj[key] = firstObj[key] && firstObj[key].toString() === "[object Object]" ?
            exports.deepMerge(firstObj[key], secondObj[key]) : firstObj[key] = secondObj[key];
    }
    return firstObj;
};
exports.deepMerge = deepMerge;
