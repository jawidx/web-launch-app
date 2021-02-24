"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMerge = exports.iframeCall = exports.locationCall = exports.supportLink = exports.isAndroidWithLocationCallSupport = exports.isIOSWithLocationCallSupport = exports.enableApplink = exports.enableULink = exports.inBaidu = exports.inWeibo = exports.inQQ = exports.inWeixin = exports.isAndroid = exports.isIos = void 0;
var detector_1 = require("./detector");
exports.isIos = detector_1.detector.os.name === 'ios';
exports.isAndroid = detector_1.detector.os.name === 'android';
exports.inWeixin = detector_1.detector.browser.name === 'micromessenger';
exports.inQQ = detector_1.detector.browser.name === 'qq';
exports.inWeibo = detector_1.detector.browser.name === 'weibo';
exports.inBaidu = detector_1.detector.browser.name === 'baidu';
exports.enableULink = exports.isIos && detector_1.detector.os.version >= 9;
exports.enableApplink = exports.isAndroid && detector_1.detector.os.version >= 6;
exports.isIOSWithLocationCallSupport = exports.isIos && detector_1.detector.browser.name == 'safari' && detector_1.detector.os.version >= 9;
var isChromeWithLocationCallSupport = detector_1.detector.browser.name == 'chrome' && detector_1.detector.browser.version > 55;
var isSamsungWithLocationCallSupport = detector_1.detector.browser.name == 'samsung';
exports.isAndroidWithLocationCallSupport = exports.isAndroid && (isChromeWithLocationCallSupport || isSamsungWithLocationCallSupport);
/**
 * detect support link
 */
exports.supportLink = function () {
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
/**
 * location call
 * @param url
 */
exports.locationCall = function (url) {
    (top.location || location).href = url;
};
/**
 * iframe call
 * @param url
 */
exports.iframeCall = function (url) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('style', 'display:none');
    document.body.appendChild(iframe);
    setTimeout(function () {
        document.body.removeChild(iframe);
    }, 200);
};
/**
 * merge object
 */
exports.deepMerge = function (firstObj, secondObj) {
    for (var key in secondObj) {
        firstObj[key] = firstObj[key] && firstObj[key].toString() === "[object Object]" ?
            exports.deepMerge(firstObj[key], secondObj[key]) : firstObj[key] = secondObj[key];
    }
    return firstObj;
};
