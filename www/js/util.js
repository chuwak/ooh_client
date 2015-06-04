


function checkConnection() {
    try {
        if (!isMobile) {
            return true; // is browser
        }
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';
        if (networkState === Connection.NONE) {
            return false;
        }
        return true;
    } catch (error) {
        log(error.message);
        return false;
    }
}


function hasInternet() {
    return checkConnection();
}


function showErrorMessage(msg) {

    var returnedMsg = '';
    if (isArray(msg)) {
        for (var i in msg) {
            returnedMsg += msg[i] + '\n';
        }
        showMessage(returnedMsg, 'error');
        return;
    } else {
        if (typeof msg === 'object') {
            for (var i in msg) {
                returnedMsg += msg[i] + '\n';
            }
            showMessage(returnedMsg, 'error');
            return;
        } else {
            showMessage(msg, 'error');
        }
    }
}


function showMessage(msg, type) {
    //type: 'alert', 'warning', 'success', 'information', 'error'
    if (!type) {
        type = 'alert';
    }
    var n = noty({
        text: msg,
        timeout: 5000,
        type: type,
        layout: 'topCenter',
        killer: true,
        maxVisible: 1,
        force: true,
        dismissQueue: false,
        template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>'
    });
}


function showConfirmDialog(title, success, cancel) {
    noty({
        text: title,
        modal: true,
        type: 'information',
        layout: 'center',
        killer: true,
        maxVisible: 1,
        force: true,
        dismissQueue: false,
        template: '<div class="noty_message dialog-message"><span class="noty_text dialog-text"></span><div class="noty_close"></div></div>',
        buttons: [
            {addClass: 'dialog-btn btn', text: msg.yes, onClick: function ($noty) {
                    // this = button element
                    // $noty = $noty element
                    $noty.close();
                    success();
                }
            },
            {addClass: 'dialog-btn btn', text: msg.cancel, onClick: function ($noty) {
                    $noty.close();
                    cancel();
                }
            }
        ]
    });

}






function isArray(object) {
    return (Object.prototype.toString.call(object) === '[object Array]');
}

/* is get date and strings which can be converted to date */
function isDate(object) {
    // object is date
    if (!object) {
        return false;
    }
    if (Object.prototype.toString.call(object) === '[object Date]') {
        return true;
    } else if (Object.prototype.toString.call(object) === '[object String]') {
        var tDate = new Date(object);
        if (!isNaN(tDate.getTime())) {
            return true;
        }
        return false;

    }
    return false;
}


function dump(arr, level) {
    var dumped_text = "";
    if (!level)
        level = 2;
    var level_padding = "";
    for (var j = 0; j < level + 1; j++)
        level_padding += "   ";
    if (typeof (arr) === 'object') {
        for (var item in arr) {
            var value = arr[item];
            if (typeof (value) === 'object') {
                dumped_text += level_padding + "'" + item + "' : {\n";
                dumped_text += dump(value, level + 1);
                dumped_text += level_padding + "'}\n";
            } else {
                dumped_text += level_padding + "'" + item + "' => \"" + ((typeof (value) === 'function') ? ' function' : value) + "\"\n";
            }
        }
    } else {
        dumped_text = "" + arr + ":" + typeof (arr) + "\n";
    }
    return dumped_text;
}





//==========================  block ui  ========================================

var blockParams = {
    message: '<img style="height: 1em; width:11em" src="img/ajax-loader.gif" /> \n <br/> \n ' +
            '<span id="block-text" class="block-text"></span>',
    css: {
        top: ($(window).height() - 19) / 2 + 'px',
        left: '50%',
        marginLeft: '-5.5em',
        width: '11em',
        height: '1em',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'wait',
        opacity: 1
    },
    overlayCSS: {
        backgroundColor: 'rgba(50, 50, 50, 0.85)',
        opacity: '1',
        cursor: 'wait'
    }
};
function correctiveScale() {
    var width = $(window).width();
    var height = $(window).height();
    var viewport = document.querySelector("meta[name=viewport]");
    var initScale = parseFloat(viewport.content.substring(viewport.content.indexOf('initial-scale') + 14));
    //viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');

    log('Width: ' + width + '; Height: ' + height + '; InitScale:' + initScale);
    var max = Math.max(width, height);
    var scale = max / 950;
    $('body').css('font-size', scale + "em");
}


function hideKeyboard() {
    document.activeElement.blur();
}



var scrollParams = {
    autoHideScrollbar: false,
    autoDraggerLength: true,
    scrollInertia: 100,
    contentTouchScroll: true,
    advanced: {
        updateOnContentResize: true,
        updateOnBrowserResize: true,
        autoScrollOnFocus: false
    }
};
function addScrolls($scroller) {
    $scroller.niceScroll($scroller.children().first(), {cursorcolor: "#000", touchbehavior: false, hwacceleration: true, boxzoom: false, horizrailenabled: false, enabletranslate3d: false});
//    $(".scroller").mCustomScrollbar(scrollParams);

}





//===========================   render    ============================

function getPattern(jqEl) {
    var cloned = jqEl.clone();
    cloned.removeAttr('id');
    cloned.removeClass('invisible');
    cloned.removeClass('pattern');
    cloned.find('[id$="pattern"]').remove();
    cloned.find('img[data-src]').each(function () {
        var src = $(this).attr('data-src');
        $(this).attr('src', src);
    });
    //cloned.template = cloned.prop('outerHTML');
    return cloned;
}

String.prototype.splice = function (idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};
String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
};
String.prototype.format = function () {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};
String.prototype.formatObj = function (params) {
    var formatted = this;
    for (var i in params) {
        var regexp = new RegExp('\\{|_\$' + i + '\\}|\$_', 'gi');
        formatted = formatted.replace(regexp, params[i]);
    }
    return formatted;
};
String.prototype.render = function (params, deepObjectRender) {
    var formatted = this;
    var removeIdOfPatternRegexp = new RegExp('id?=\"*Pattern\"', 'gi');
    formatted = formatted.replace(removeIdOfPatternRegexp, '');
    if (deepObjectRender && deepObjectRender === true) {
        var regexpAll = new RegExp('\\{\\{' + '.+?' + '\\}\\}', 'gi');
        var arrOfMustaches = formatted.match(regexpAll);
        if (arrOfMustaches === null) {
            arrOfMustaches = [];
        }
        for (var i = 0; i < arrOfMustaches.length; i++) {  // foreach work with bug in ie7,8
            var oneVal = arrOfMustaches[i];
            var valWithoutMustaches = oneVal.slice(2, -2);
            var neededVal = eval('params.' + valWithoutMustaches);
            formatted = formatted.replace(oneVal, neededVal);
        }
    } else {
        for (var i in params) {
            var regexp = new RegExp('\\{\\{' + i + '\\}\\}', 'gi');
            formatted = formatted.replace(regexp, params[i]);
            var regexp2 = new RegExp('_\\$' + i + '\\$_', 'gi');
            formatted = formatted.replace(regexp2, params[i]);
        }
    }

    return formatted;
};


function checkUrl(urlStr) {
    var urlRegexp = /^http[s]?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/;
    var result = urlRegexp.test(urlStr);
    return result;
}


function fakeSubmit() {
    hideKeyboard();
    return false;
}


function validateNumber(evt) {
    var theEvent = evt || window.event;
    var keyCode = theEvent.keyCode || theEvent.which;
    var target = evt.target;
    var curValStr = target.value;
    if (keyCode === 13) {
        evt.target.blur();
    }
    if (keyCode === 13         // enter
//		|| keyCode === 8     // backspace
//		|| keyCode === 37    // arrow left
//		|| keyCode === 39    // arrow right
//		|| keyCode === 38    // arrow up
//		|| keyCode === 40    // arrow down
            ) {
        return;
    }
    var key = String.fromCharCode(keyCode);
    var admissibleSymbols = '0123456789_';
    var enteredWrongKey = (admissibleSymbols.indexOf(key) === -1) ? true : false;
    var newStr = '' + curValStr + key;
    if (enteredWrongKey /*|| isNaN(newStr) || parseFloat(newStr)>24*/) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault)
            theEvent.preventDefault();
        return false;
    }
}







var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len)
                    val = "0" + val;
                return val;
            };
    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;
        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date))
            throw SyntaxError("invalid date");
        mask = String(dF.masks[mask] || mask || dF.masks["default"]);
        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d: d,
                    dd: pad(d),
                    ddd: dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m: m + 1,
                    mm: pad(m + 1),
                    mmm: dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy: String(y).slice(2),
                    yyyy: y,
                    h: H % 12 || 12,
                    hh: pad(H % 12 || 12),
                    H: H,
                    HH: pad(H),
                    M: M,
                    MM: pad(M),
                    s: s,
                    ss: pad(s),
                    l: pad(L, 3),
                    L: pad(L > 99 ? Math.round(L / 10) : L),
                    t: H < 12 ? "a" : "p",
                    tt: H < 12 ? "am" : "pm",
                    T: H < 12 ? "A" : "P",
                    TT: H < 12 ? "AM" : "PM",
                    Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };
        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();
// Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
    commentDate: "dd mmm yy  HH:MM"
};
// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};
// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

Date.prototype.toJSON = function () {
    if (Object.prototype.toString.call(this) === "[object Date]") {
        // it is a date
        if (isNaN(this.getTime())) {  // d.valueOf() could also work
            // date is not valid
            return null;
        }
        else {
            // date is valid
            return this.format('yyyy-mm-dd HH:MM:ss');
        }
    }
    else {
        return null;
        // not a date
    }

};

function replaceObjectNames(sourceStr) {

    var arr = [
        {'"contractor":': '"Contractor":'},
        {'"contractors":': '"Contractors":'},
        {'"site":': '"Site":'},
        {'"sites":': '"Sites":'},
        {'"workOrder":': '"WorkOrder":'},
        {'"workOrders":': '"WorkOrders":'},
        {'"task":': '"Task":'},
        {'"tasks":': '"Tasks":'},
        {'"photo":': '"Photo":'},
        {'"photos":': '"Photos":'},
        {'"question":': '"Question":'},
        {'"questions":': '"Questions":'},
        {'"answer":': '"Answer":'},
        {'"answers":': '"Answers":'},
        {'"comment":': '"Comment":'},
        {'"comments":': '"Comments":'},
        {'"document":': '"Document":'},
        {'"documents":': '"Documents":'},
        {'"image":': '"Image":'},
        {'"images":': '"Images":'},
        {'"modWorkOrder":': '"ModWorkOrder":'},
        {'"modTask":': '"ModTask":'},
    ];
    for (var i in arr) {
        var currArrObj = arr[i];
        for (var key in currArrObj) {
            sourceStr = sourceStr.replace(new RegExp(key, 'g'), currArrObj[key]);
        }

    }
    return sourceStr;
}




var mapObject = {
    voidOptions: {
        panControl: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false
    }
};



function googleMapLoadScript() {
    setTimeout(function () {
        $.getScript('http://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&' +
                'callback=initializeGoogleMap');
    }, 0);
}

function initializeGoogleMap() {
    log('google maps initialized success');
    ooh.mapInitialize = true;
}


function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
}



function objectToString(obj) {
    var jsonStr = JSON.stringify(obj);
    var str = jsonStr.replace(/\"/g, '\'');
    return str;
}

function stringToObject(str) {
    var jsonStr = str.replace(/\'/g, '"');
    var obj = JSON.parse(jsonStr);
    return obj;

}



// Get the original CSS values instead of values of the element.
// @param {String} ruleSelector
// @param {String} cssprop
// @returns {String} property of the style
function getDefaultCssStyle(ruleSelector, cssprop) {
    for (var c = 0, lenC = document.styleSheets.length; c < lenC; c++) {
        var rules = document.styleSheets[c].cssRules;
        if (rules) {
            for (var r = 0, lenR = rules.length; r < lenR; r++) {
                var rule = rules[r];
                if (rule.selectorText == ruleSelector && rule.style) {
                    return rule.style[cssprop]; // rule.cssText;
                }
            }
        }
    }
    return null;
}


function isTouchDevice() {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}



function touchScroll(elt) {
    if (isTouchDevice()) {
        //var elt=document.getElementById(id); 

        var scrollStartPos = 0;

        elt.addEventListener("touchstart", function (event) {
            scrollStartPos = this.scrollTop + event.touches[0].pageY;
            event.preventDefault();
        }, false);

        elt.addEventListener("touchmove", function (event) {
            this.scrollTop = scrollStartPos - event.touches[0].pageY;
            event.preventDefault();
        }, false);
    }
}





// fullscreen

var fsParams = {
    isOpened: false,
    src: '',
    rotateInProgress: false
};

var _orientationHandler = function (e) {
    if (fsParams.rotateInProgress === false) {
        fsParams.rotateInProgress = true;
        var rotationTimeout = setTimeout(function () {
            fsParams.rotateInProgress = false;
        }, 200);

        hideKeyboard();
        var htmlDom = $('html');
        htmlDom.css({width: '100%', height: '100%'});

        //log(' before  width: '+htmlDom.width()+'  height: '+htmlDom.height());
        var widthHeightTimeout = setTimeout(function () {
            htmlDom.css({width: htmlDom.width() + 'px', height: htmlDom.height() + 'px'});
            log('after   width: ' + htmlDom.width() + '  height: ' + htmlDom.height());
        }, 5500);

        if (fsParams.isOpened) {
            closeFullScreenView();
            var fullscreenViewTimeout = setTimeout(function () {
                openInFullScreenView(fsParams.src);
            }
            , 200);
        }
    }

};
$(window).bind('orientationchange', _orientationHandler);



function openInFullScreenView(imgSrc) {
    fsParams.isOpened = true;
    fsParams.src = imgSrc;

    var $photoWrapper = $('#fs-photo-wrapper');
    $.blockUI(blockParams);
    var imgPatternStr = ' <img id="photo" alt="photo" src="{0}" onload="fullscreenImageSuccess(this)" onerror="fullscreenImageError(this)" /> ';
    var imgStr = imgPatternStr.format(imgSrc);
    $photoWrapper.html(imgStr);

}


function fullscreenImageSuccess(img) {
    var $photoContainer = $('#fs-photo-container');
    $photoContainer.show();
    var $photo = $('#photo');
    //photoJqEl.attr('src', imgSrc);
    $photo.touchPanView({
        width: $photoContainer.width() - 0,
        height: $photoContainer.height() - 0,
        startZoomedOut: true,
        zoomIn: '.photo-container .zoom-in',
        zoomOut: '.photo-container .zoom-out',
        zoomFit: '.photo-container .zoom-full',
        zoomFull: '.photo-container .zoom-fit'
    });
    $.unblockUI();
}


function fullscreenImageError(img) {
    $.unblockUI();
    showErrorMessage(eMsg.cannotLoadImage);
}


function closeFullScreenView() {
    var $photoContainer = $('#fs-photo-container');
    var $photoWrapper = $('#fs-photo-wrapper');
    $photoWrapper.html('');
    $photoContainer.hide();
    fsParams.isOpened = false;
}




function onImageLoadSuccess(img) {

}

function onErrorLoadingImage(img) {
    if (img.src.indexOf('%7B%7B') !== -1 || img.src.indexOf('{{') !== -1 || img.src.indexOf('imageSrc') !== -1) {

    } else {
        img.src = 'img/not-found.png';
    }
}

function processImageOnLoad(img) {
    if (img.naturalWidth > img.naturalHeight) {
        img.style.width = '100%';
    } else {
        img.style.height = '100%';
    }
}

function processImageOnError(img) {
//
//    if (img.naturalWidth > img.naturalHeight) {
//        img.style.width = '100%';
//    } else {
//        img.style.height = '100%';
//    }
}