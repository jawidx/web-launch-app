"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function select(element) {
    var selectedText;
    if (element.nodeName === 'SELECT') {
        element.focus();
        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');
        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }
        element.select();
        element.setSelectionRange(0, element.value.length);
        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }
        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
        selectedText = selection.toString();
    }
    return selectedText;
}
function copy(text, options) {
    var debug, fakeElem, success = false;
    options = options || {};
    debug = options.debug || false;
    try {
        var isRTL = document.documentElement.getAttribute('dir') == 'rtl';
        fakeElem = document.createElement('textarea');
        // Prevent zooming on iOS
        fakeElem.style.fontSize = '12pt';
        // Reset box model
        fakeElem.style.border = '0';
        fakeElem.style.padding = '0';
        fakeElem.style.margin = '0';
        // Move element out of screen horizontally
        fakeElem.style.position = 'absolute';
        fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
        // Move element to the same position vertically
        var yPosition = window.pageYOffset || document.documentElement.scrollTop;
        fakeElem.style.top = yPosition + "px";
        fakeElem.setAttribute('readonly', '');
        fakeElem.value = text;
        document.body.appendChild(fakeElem);
        select(fakeElem);
        var successful = document.execCommand('copy');
        if (!successful) {
            throw new Error('copy command was unsuccessful');
        }
        success = true;
    }
    catch (err) {
        debug && console.error('unable to copy using execCommand: ', err);
        debug && console.warn('trying IE specific stuff');
        try {
            window.clipboardData.setData('text', text);
            success = true;
        }
        catch (err) {
            debug && console.error('unable to copy using clipboardData: ', err);
        }
    }
    finally {
        if (fakeElem) {
            document.body.removeChild(fakeElem);
        }
    }
    return success;
}
exports.copy = copy;
