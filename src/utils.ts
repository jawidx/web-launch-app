import { detector } from './detector'

export const isIos = detector.os.name === 'ios';
export const isAndroid = detector.os.name === 'android';
export const inWeixin = detector.browser.name === 'micromessenger';
export const inQQ = detector.browser.name === 'qq';
export const inWeibo = detector.browser.name === 'weibo';
export const inBaidu = detector.browser.name === 'baidu';

export const enableULink = isIos && detector.os.version >= 9;
export const enableApplink = isAndroid && detector.os.version >= 6;

export const isIOSWithLocationCallSupport = isIos && detector.browser.name == 'safari' && detector.os.version >= 9;
const isChromeWithLocationCallSupport = detector.browser.name == 'chrome' && detector.browser.version > 55;
const isSamsungWithLocationCallSupport = detector.browser.name == 'samsung';
export const isAndroidWithLocationCallSupport = isAndroid && (isChromeWithLocationCallSupport || isSamsungWithLocationCallSupport);

/**
 * detect support link
 */
export const supportLink = () => {
	let supportLink = false;
	if (enableApplink) {
		switch (detector.browser.name) {
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
	if (enableULink) {
		switch (detector.browser.name) {
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
}

/**
 * location call
 * @param url
 */
export const locationCall = (url: string) => {
	(top.location || location).href = url;
}

/**
 * iframe call
 * @param url
 */
export const iframeCall = (url: string) => {
	const iframe = document.createElement('iframe');
	iframe.setAttribute('src', url);
	iframe.setAttribute('style', 'display:none');
	document.body.appendChild(iframe);
	setTimeout(function () {
		document.body.removeChild(iframe);
	}, 200);
}

/**
 * merge object
 */
export const deepMerge = (firstObj, secondObj) => {
	for (var key in secondObj) {
		firstObj[key] = firstObj[key] && firstObj[key].toString() === "[object Object]" ?
			deepMerge(firstObj[key], secondObj[key]) : firstObj[key] = secondObj[key];
	}
	return firstObj;
}
