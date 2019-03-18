export function copy(text, options?: any) {
    var debug, range, selection, mark, success = false;
    options = options || {};
    debug = options.debug || false;
    try {
        range = document.createRange();
        selection = document.getSelection();

        mark = document.createElement('span');
        mark.textContent = text;
        // reset user styles for span element
        mark.style.all = 'unset';
        // prevents scrolling to the end of the page
        mark.style.position = 'fixed';
        mark.style.top = 0;
        mark.style.clip = 'rect(0, 0, 0, 0)';
        // used to preserve spaces and line breaks
        mark.style.whiteSpace = 'pre';
        // do not inherit user-select (it may be `none`)
        mark.style.webkitUserSelect = 'text';
        mark.style.MozUserSelect = 'text';
        mark.style.msUserSelect = 'text';
        mark.style.userSelect = 'text';
        document.body.appendChild(mark);

        range.selectNode(mark);
        selection.addRange(range);

        var successful = document.execCommand('copy');
        if (!successful) {
            throw new Error('copy command was unsuccessful');
        }
        success = true;
    } catch (err) {
        debug && console.error('unable to copy using execCommand: ', err);
        debug && console.warn('trying IE specific stuff');
        try {
            (window as any).clipboardData.setData('text', text);
            success = true;
        } catch (err) {
            debug && console.error('unable to copy using clipboardData: ', err);
            debug && console.error('falling back to prompt');
        }
    } finally {
        if (selection) {
            if (typeof selection.removeRange == 'function') {
                selection.removeRange(range);
            } else {
                selection.removeAllRanges();
            }
        }

        if (mark) {
            document.body.removeChild(mark);
        }
    }

    return success;
}
