import { detector } from './detector'

export const isIos = detector.os.name === 'ios';
export const isAndroid = detector.os.name === 'android';
export const enableUniversalLink = isIos && detector.os.version >= 9;
export const enableApplink = isAndroid && detector.os.version >= 6;
export const inWeixin = detector.browser.name === 'micromessenger';
export const inQQ = detector.browser.name === 'qq';
export const inWeibo = detector.browser.name === 'weibo';
export const inBaidu = detector.browser.name === 'baidu';

export const isIOSWithLocationCallSupport = isIos && detector.browser.name == 'safari' && detector.os.version >= 9

const isChromeWithLocationCallSupport = detector.browser.name == 'chrome' && detector.browser.version > 55
const isSamsungWithLocationCallSupport = detector.browser.name == 'samsung'
export const isAndroidWithLocationCallSupport = isAndroid && (isChromeWithLocationCallSupport || isSamsungWithLocationCallSupport)
