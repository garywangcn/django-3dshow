
(function() {

function getGlobal() {
    return (typeof window !== "undefined" && window !== null)
            ? window
            : (typeof self !== "undefined" && self !== null)
                ? self
                : global;
}

/**
 * Create namespace
 * @param {string} s - namespace (e.g. 'Autodesk.Viewing')
 * @return {Object} namespace
 */
function AutodeskNamespace(s) {
    var ns = getGlobal();

    var parts = s.split('.');
    for (var i = 0; i < parts.length; ++i) {
        ns[parts[i]] = ns[parts[i]] || {};
        ns = ns[parts[i]];
    }

    return ns;
};

// Define the most often used ones
AutodeskNamespace("Autodesk.Viewing.Private");

AutodeskNamespace("Autodesk.Viewing.Extensions");

AutodeskNamespace("Autodesk.Viewing.Shaders");

AutodeskNamespace('Autodesk.Viewing.UI');

AutodeskNamespace('Autodesk.LMVTK');

Autodesk.Viewing.getGlobal = getGlobal;
Autodesk.Viewing.AutodeskNamespace = AutodeskNamespace;
getGlobal().AutodeskNamespace = AutodeskNamespace;

})();

function getGlobal() {
    return (typeof window !== "undefined" && window !== null)
            ? window
            : (typeof self !== "undefined" && self !== null)
                ? self
                : global;
}

var av = Autodesk.Viewing,
    avp = av.Private;

av.getGlobal = getGlobal;

var isBrowser = av.isBrowser = (typeof navigator !== "undefined");

var isIE11 = av.isIE11 = isBrowser && !!navigator.userAgent.match(/Edge|Trident\/7\./);

// fix IE events
if(typeof window !== "undefined" && isIE11){
    (function () {
        function CustomEvent ( event, params ) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent( 'CustomEvent' );
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
            return evt;
        }

        CustomEvent.prototype = window.CustomEvent.prototype;

        window.CustomEvent = CustomEvent;
    })();
}

// IE does not implement ArrayBuffer slice. Handy!
if (!ArrayBuffer.prototype.slice) {
    ArrayBuffer.prototype.slice = function(start, end) {
        // Normalize start/end values
        if (!end || end > this.byteLength) {
            end = this.byteLength;
        }
        else if (end < 0) {
            end = this.byteLength + end;
            if (end < 0) end = 0;
        }
        if (start < 0) {
            start = this.byteLength + start;
            if (start < 0) start = 0;
        }

        if (end <= start) {
            return new ArrayBuffer();
        }

        // Bytewise copy- this will not be fast, but what choice do we have?
        var len = end - start;
        var view = new Uint8Array(this, start, len);
        var out = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            out[i] = view[i];
        }
        return out.buffer;
    };
}

// IE doesn't implement Math.log2
(function(){
    Math.log2 = Math.log2 || function(x) {
        return Math.log(x) / Math.LN2;
    };
})();

//The BlobBuilder object
if (typeof window !== "undefined")
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;


// Launch full screen on the given element with the available method
var launchFullscreen = av.launchFullscreen = function(element, options) {
    if (element.requestFullscreen) {
        element.requestFullscreen(options);
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen(options);
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(options);
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen(options);
    }
};

// Exit full screen with the available method
var exitFullscreen = av.exitFullscreen = function() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
};

// Determines if the browser is in full screen
var inFullscreen = av.inFullscreen = function(){

    // Special case for Ms-Edge that has webkitIsFullScreen with correct value
    // and fullscreenEnabled with wrong value (thanks MS)

    if ("webkitIsFullScreen" in document) return !!(document.webkitIsFullScreen);
    if ("fullscreenElement" in document) return !!(document.fullscreenElement);
    if ("mozFullScreenElement" in document) return !!(document.mozFullScreenElement);
    if ("msFullscreenElement" in document) return !!(document.msFullscreenElement);

    return !!(document.querySelector(".viewer-fill-browser")); // Fallback for iPad
};

var fullscreenElement = av.fullscreenElement = function() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
};

var isFullscreenAvailable = av.isFullscreenAvailable = function(element) {
    return element.requestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
};

// Get the version of the android device through user agent.
// Return the version string of android device, e.g. 4.4, 5.0...
var getAndroidVersion = av.getAndroidVersion = function(ua) {
    ua = ua || navigator.userAgent;
    var match = ua.match(/Android\s([0-9\.]*)/);
    return match ? match[1] : false;
};

// Determine if this is a touch or notouch device.
var isTouchDevice = av.isTouchDevice = function() {
    /*
    // Temporarily disable touch support through hammer on Android 5, to debug
    // some specific gesture issue with Chromium WebView when loading viewer3D.js.
    if (parseInt(getAndroidVersion()) == 5) {
        return false;
    }
    */

    return (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
};

av.isIOSDevice = function() {
    if (!isBrowser) return false;
    return /ip(ad|hone|od)/.test(navigator.userAgent.toLowerCase());
};

av.isAndroidDevice = function() {
    if (!isBrowser) return false;
    return (navigator.userAgent.toLowerCase().indexOf('android') !== -1);
};

av.isMobileDevice = function() {
    if (!isBrowser) return false;
    return av.isIOSDevice() || av.isAndroidDevice();
};

av.isSafari = function() {
    if (!isBrowser) return false;
    var _ua = navigator.userAgent.toLowerCase();
    return (_ua.indexOf("safari") !== -1) && (_ua.indexOf("chrome") === -1);
};

av.isFirefox = function() {
    if (!isBrowser) return false;
    var _ua = navigator.userAgent.toLowerCase();
    return (_ua.indexOf("firefox") !== -1);
};

av.isChrome = function() {
    if (!isBrowser) return false;
    var _ua = navigator.userAgent.toLowerCase();
    return (_ua.indexOf("chrome") !== -1);
};

av.isMac = function() {
    if (!isBrowser) return false;
    var _ua = navigator.userAgent.toLowerCase();
    return  (_ua.indexOf("mac os") !== -1);
};

av.isWindows = function() {
    if (!isBrowser) return false;
    var _ua = navigator.userAgent.toLowerCase();
    return  (_ua.indexOf("win32") !== -1 || _ua.indexOf("windows") !== -1);
};

av.ObjectAssign = function(des, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key))
            des[key] = src[key];
    }
    return des;
};


// Hack to work around Safari's use of pinch and pan inside the viewer canvas.
avp.disableTouchSafari = function(event) {
    var xOff = window.hasOwnProperty("pageXOffset") ? window.pageXOffset : document.documentElement.scrollLeft;
    var yOff = window.hasOwnProperty("pageYOffset") ? window.pageYOffset : document.documentElement.scrollTop;
    // If we aren't inside the canvas, then allow default propagation of the event
    var element = document.elementFromPoint(event.pageX - xOff, event.pageY - yOff);
    if (!element || element.nodeName !== 'CANVAS')
        return true;
    // If it's a CANVAS, check that it's owned by us
    if (element.getAttribute('data-viewer-canvas' !== 'true'))
        return true;
    // Inside the canvas, prevent the event from propagating to Safari'safely
    // standard handlers, which will pan and zoom the page.
    event.preventDefault();
    return false;
};

// Hack to work around Safari's use of pinch and pan inside the viewer canvas.
avp.disableDocumentTouchSafari = function() {
    if (av.isMobileDevice() && av.isSafari()) {
        // Safari mobile disable default touch handling inside viewer canvas
        // Use capture to make sure Safari doesn't capture the touches and prevent
        // us from disabling them.
        document.documentElement.addEventListener('touchstart', avp.disableTouchSafari, true);
        document.documentElement.addEventListener('touchmove', avp.disableTouchSafari, true);
        document.documentElement.addEventListener('touchcanceled', avp.disableTouchSafari, true);
        document.documentElement.addEventListener('touchend', avp.disableTouchSafari, true);
    }
};

// Hack to work around Safari's use of pinch and pan inside the viewer canvas.
// This method is not being invoked explicitly.
avp.enableDocumentTouchSafari = function() {
    if (av.isMobileDevice() && av.isSafari()) {
        // Safari mobile disable default touch handling inside viewer canvas
        // Use capture to make sure Safari doesn't capture the touches and prevent
        // us from disabling them.
        document.documentElement.removeEventListener('touchstart', avp.disableTouchSafari, true);
        document.documentElement.removeEventListener('touchmove', avp.disableTouchSafari, true);
        document.documentElement.removeEventListener('touchcanceled', avp.disableTouchSafari, true);
        document.documentElement.removeEventListener('touchend', avp.disableTouchSafari, true);
    }
};

/**
 * Detects if WebGL is enabled.
 *
 * @return { number } -1 for not Supported,
 *                    0 for disabled
 *                    1 for enabled
 */
var detectWebGL = av.detectWebGL = function()
{
    // Check for the webgl rendering context
    if ( !! window.WebGLRenderingContext) {
        var canvas = document.createElement("canvas"),
            names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
            context = false;

        for (var i = 0; i < 4; i++) {
            try {
                context = canvas.getContext(names[i]);
                context = av.rescueFromPolymer(context);
                if (context && typeof context.getParameter === "function") {
                    // WebGL is enabled.
                    //
                    return 1;
                }
            } catch (e) {}
        }

        // WebGL is supported, but disabled.
        //
        return 0;
    }

    // WebGL not supported.
    //
    return -1;
};


// Convert touchstart event to click to remove the delay between the touch and
// the click event which is sent after touchstart with about 300ms deley.
// Should be used in UI elements on touch devices.
var touchStartToClick = av.touchStartToClick = function(e) {
    // Buttons that activate fullscreen are a special case. The HTML5 fullscreen spec
    // requires the original user gesture signal to avoid a security issue.  See LMV-2396 and LMV-2326
    if ((e.target.className.indexOf("fullscreen")>-1) || (e.target.className.indexOf("webvr")>-1))
        return;
    e.preventDefault();  // Stops the firing of delayed click event.
    e.stopPropagation();
    e.target.click();    // Maps to immediate click.
};

//Safari doesn't have the Performance object
//We only need the now() function, so that's easy to emulate.
(function() {
    var global = getGlobal();
    if (!global.performance)
        global.performance = Date;
})();

// Polyfill for IE and Safari
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" &&
        isFinite(value) &&
        Math.floor(value) === value;
};

// Polyfill for IE
String.prototype.repeat = String.prototype.repeat || function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
};

// Polyfill for IE
// It doesn't support negative values for start and end; it complicates the code using this function.
if (!Array.prototype.fill) {
    Object.defineProperty(Array.prototype, "fill", {
        enumerable: false,
        value: function(value, start, end) {
            start = (start === undefined) ? 0 : start;
            end = (end === undefined) ? this.length : end;
            for (var i=start; i<end; ++i) 
                this[i] = value;
        }
    });
}
// Polyfill for IE
Int32Array.prototype.lastIndexOf = Int32Array.prototype.lastIndexOf || function(searchElement, fromIndex) {
    return Array.prototype.lastIndexOf.call(this, searchElement, fromIndex);
};

// Polyfill for IE
// It doesn't support negative values for start and end; it complicates the code using this function.
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, "find", {
        enumerable: false,
        value: function(callback, _this) {
            var len = this.length;
            for (var i=0; i<len; ++i) {
                var item = this[i];
                if (callback.call(_this, item, i, this))
                    return item;
            }
            return undefined;
        }
    });
}



//This file is the first one when creating minified build
//and is used to set certain flags that are needed
//for the concatenated build.

var av = Autodesk.Viewing;
var avp = Autodesk.Viewing.Private;

//avp.IS_CONCAT_BUILD = true; // Debugging source files without concatenation is no longer supported

/** @define {string} */
avp.BUILD_LMV_WORKER_URL = "lmvworker.js";
avp.LMV_WORKER_URL = avp.BUILD_LMV_WORKER_URL;

avp.ENABLE_DEBUG = avp.ENABLE_DEBUG || false;
//avp.DEBUG_SHADERS = avp.DEBUG_SHADERS || false; // will be moved to wgs.js
avp.ENABLE_INLINE_WORKER = true;	// Use `false` for worker code debugging. 

/*! Hammer.JS - v2.0.8 - 2016-04-23
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
    'use strict';

    var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
    var TEST_ELEMENT = document.createElement('div');

    var TYPE_FUNCTION = 'function';

    var round = Math.round;
    var abs = Math.abs;
    var now = Date.now;

    /**
     * set a timeout with a given scope
     * @param {Function} fn
     * @param {Number} timeout
     * @param {Object} context
     * @returns {number}
     */
    function setTimeoutContext(fn, timeout, context) {
        return setTimeout(bindFn(fn, context), timeout);
    }

    /**
     * if the argument is an array, we want to execute the fn on each entry
     * if it aint an array we don't want to do a thing.
     * this is used by all the methods that accept a single and array argument.
     * @param {*|Array} arg
     * @param {String} fn
     * @param {Object} [context]
     * @returns {Boolean}
     */
    function invokeArrayArg(arg, fn, context) {
        if (Array.isArray(arg)) {
            each(arg, context[fn], context);
            return true;
        }
        return false;
    }

    /**
     * walk objects and arrays
     * @param {Object} obj
     * @param {Function} iterator
     * @param {Object} context
     */
    function each(obj, iterator, context) {
        var i;

        if (!obj) {
            return;
        }

        if (obj.forEach) {
            obj.forEach(iterator, context);
        } else if (obj.length !== undefined) {
            i = 0;
            while (i < obj.length) {
                iterator.call(context, obj[i], i, obj);
                i++;
            }
        } else {
            for (i in obj) {
                obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
            }
        }
    }

    /**
     * wrap a method with a deprecation warning and stack trace
     * @param {Function} method
     * @param {String} name
     * @param {String} message
     * @returns {Function} A new function wrapping the supplied method.
     */
    function deprecate(method, name, message) {
        var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
        return function() {
            var e = new Error('get-stack-trace');
            var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
                .replace(/^\s+at\s+/gm, '')
                .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

            var log = window.console && (window.console.warn || window.console.log);
            if (log) {
                log.call(window.console, deprecationMessage, stack);
            }
            return method.apply(this, arguments);
        };
    }

    /**
     * extend object.
     * means that properties in dest will be overwritten by the ones in src.
     * @param {Object} target
     * @param {...Object} objects_to_assign
     * @returns {Object} target
     */
    var assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = Array.isArray(source[nextKey]) ? source[nextKey].slice(0) : source[nextKey];
                    }
                }
            }
        }
        return output;
    };


    /**
     * extend object.
     * means that properties in dest will be overwritten by the ones in src.
     * @param {Object} dest
     * @param {Object} src
     * @param {Boolean} [merge=false]
     * @returns {Object} dest
     */
    var extend = deprecate(function extend(dest, src, merge) {
        var keys = Object.keys(src);
        var i = 0;
        while (i < keys.length) {
            if (!merge || (merge && dest[keys[i]] === undefined)) {
                dest[keys[i]] = src[keys[i]];
            }
            i++;
        }
        return dest;
    }, 'extend', 'Use `assign`.');

    /**
     * merge the values from src in the dest.
     * means that properties that exist in dest will not be overwritten by src
     * @param {Object} dest
     * @param {Object} src
     * @returns {Object} dest
     */
    var merge = deprecate(function merge(dest, src) {
        return extend(dest, src, true);
    }, 'merge', 'Use `assign`.');

    /**
     * simple class inheritance
     * @param {Function} child
     * @param {Function} base
     * @param {Object} [properties]
     */
    function inherit(child, base, properties) {
        var baseP = base.prototype,
            childP;

        childP = child.prototype = Object.create(baseP);
        childP.constructor = child;
        childP._super = baseP;

        if (properties) {
            assign(childP, properties);
        }
    }

    /**
     * simple function bind
     * @param {Function} fn
     * @param {Object} context
     * @returns {Function}
     */
    function bindFn(fn, context) {
        return function boundFn() {
            return fn.apply(context, arguments);
        };
    }

    /**
     * let a boolean value also be a function that must return a boolean
     * this first item in args will be used as the context
     * @param {Boolean|Function} val
     * @param {Array} [args]
     * @returns {Boolean}
     */
    function boolOrFn(val, args) {
        if (typeof val == TYPE_FUNCTION) {
            return val.apply(args ? args[0] || undefined : undefined, args);
        }
        return val;
    }

    /**
     * use the val2 when val1 is undefined
     * @param {*} val1
     * @param {*} val2
     * @returns {*}
     */
    function ifUndefined(val1, val2) {
        return (val1 === undefined) ? val2 : val1;
    }

    /**
     * addEventListener with multiple events at once
     * @param {EventTarget} target
     * @param {String} types
     * @param {Function} handler
     */
    function addEventListeners(target, types, handler) {
        each(splitStr(types), function(type) {
            target.addEventListener(type, handler, false);
        });
    }

    /**
     * removeEventListener with multiple events at once
     * @param {EventTarget} target
     * @param {String} types
     * @param {Function} handler
     */
    function removeEventListeners(target, types, handler) {
        each(splitStr(types), function(type) {
            target.removeEventListener(type, handler, false);
        });
    }

    /**
     * find if a node is in the given parent
     * @method hasParent
     * @param {HTMLElement} node
     * @param {HTMLElement} parent
     * @return {Boolean} found
     */
    function hasParent(node, parent) {
        while (node) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    /**
     * small indexOf wrapper
     * @param {String} str
     * @param {String} find
     * @returns {Boolean} found
     */
    function inStr(str, find) {
        return str.indexOf(find) > -1;
    }

    /**
     * split string on whitespace
     * @param {String} str
     * @returns {Array} words
     */
    function splitStr(str) {
        return str.trim().split(/\s+/g);
    }

    /**
     * find if a array contains the object using indexOf or a simple polyFill
     * @param {Array} src
     * @param {String} find
     * @param {String} [findByKey]
     * @return {Boolean|Number} false when not found, or the index
     */
    function inArray(src, find, findByKey) {
        if (src.indexOf && !findByKey) {
            return src.indexOf(find);
        } else {
            var i = 0;
            while (i < src.length) {
                if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                    return i;
                }
                i++;
            }
            return -1;
        }
    }

    /**
     * convert array-like objects to real arrays
     * @param {Object} obj
     * @returns {Array}
     */
    function toArray(obj) {
        return Array.prototype.slice.call(obj, 0);
    }

    /**
     * unique array with objects based on a key (like 'id') or just by the array's value
     * @param {Array} src [{id:1},{id:2},{id:1}]
     * @param {String} [key]
     * @param {Boolean} [sort=False]
     * @returns {Array} [{id:1},{id:2}]
     */
    function uniqueArray(src, key, sort) {
        var results = [];
        var values = [];
        var i = 0;

        while (i < src.length) {
            var val = key ? src[i][key] : src[i];
            if (inArray(values, val) < 0) {
                results.push(src[i]);
            }
            values[i] = val;
            i++;
        }

        if (sort) {
            if (!key) {
                results = results.sort();
            } else {
                results = results.sort(function sortUniqueArray(a, b) {
                    return a[key] > b[key];
                });
            }
        }

        return results;
    }

    /**
     * get the prefixed property
     * @param {Object} obj
     * @param {String} property
     * @returns {String|Undefined} prefixed
     */
    function prefixed(obj, property) {
        var prefix, prop;
        var camelProp = property[0].toUpperCase() + property.slice(1);

        var i = 0;
        while (i < VENDOR_PREFIXES.length) {
            prefix = VENDOR_PREFIXES[i];
            prop = (prefix) ? prefix + camelProp : property;

            if (prop in obj) {
                return prop;
            }
            i++;
        }
        return undefined;
    }

    /**
     * get a unique id
     * @returns {number} uniqueId
     */
    var _uniqueId = 1;
    function uniqueId() {
        return _uniqueId++;
    }

    /**
     * get the window object of an element
     * @param {HTMLElement} element
     * @returns {DocumentView|Window}
     */
    function getWindowForElement(element) {
        var doc = element.ownerDocument || element;
        return (doc.defaultView || doc.parentWindow || window);
    }

    var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

    var SUPPORT_TOUCH = ('ontouchstart' in window);
    var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
    var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

    var INPUT_TYPE_TOUCH = 'touch';
    var INPUT_TYPE_PEN = 'pen';
    var INPUT_TYPE_MOUSE = 'mouse';
    var INPUT_TYPE_KINECT = 'kinect';

    var COMPUTE_INTERVAL = 25;

    var INPUT_START = 1;
    var INPUT_MOVE = 2;
    var INPUT_END = 4;
    var INPUT_CANCEL = 8;

    var DIRECTION_NONE = 1;
    var DIRECTION_LEFT = 2;
    var DIRECTION_RIGHT = 4;
    var DIRECTION_UP = 8;
    var DIRECTION_DOWN = 16;

    var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
    var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
    var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

    var PROPS_XY = ['x', 'y'];
    var PROPS_CLIENT_XY = ['clientX', 'clientY'];

    /**
     * create new input type manager
     * @param {Manager} manager
     * @param {Function} callback
     * @returns {Input}
     * @constructor
     */
    function Input(manager, callback) {
        var self = this;
        this.manager = manager;
        this.callback = callback;
        this.element = manager.element;
        this.target = manager.options.inputTarget;

        // smaller wrapper around the handler, for the scope and the enabled state of the manager,
        // so when disabled the input events are completely bypassed.
        this.domHandler = function(ev) {
            if (boolOrFn(manager.options.enable, [manager])) {
                self.handler(ev);
            }
        };

        this.init();

    }

    Input.prototype = {
        /**
         * should handle the inputEvent data and trigger the callback
         * @virtual
         */
        handler: function() { },

        /**
         * bind the events
         */
        init: function() {
            this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
            this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
            this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
        },

        /**
         * unbind the events
         */
        destroy: function() {
            this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
            this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
            this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
        }
    };

    /**
     * create new input type manager
     * called by the Manager constructor
     * @param {Hammer} manager
     * @returns {Input}
     */
    function createInputInstance(manager) {
        var Type;
        var inputClass = manager.options.inputClass;

        if (inputClass) {
            Type = inputClass;
        } else if (SUPPORT_POINTER_EVENTS) {
            Type = PointerEventInput;
        } else if (SUPPORT_ONLY_TOUCH) {
            Type = TouchInput;
        } else if (!SUPPORT_TOUCH) {
            Type = MouseInput;
        } else {
            Type = TouchMouseInput;
        }
        return new (Type)(manager, inputHandler);
    }

    /**
     * handle input events
     * @param {Manager} manager
     * @param {String} eventType
     * @param {Object} input
     */
    function inputHandler(manager, eventType, input) {
        var pointersLen = input.pointers.length;
        var changedPointersLen = input.changedPointers.length;
        var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
        var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

        input.isFirst = !!isFirst;
        input.isFinal = !!isFinal;

        if (isFirst) {
            manager.session = {};
        }

        // source event is the normalized value of the domEvents
        // like 'touchstart, mouseup, pointerdown'
        input.eventType = eventType;

        // compute scale, rotation etc
        computeInputData(manager, input);

        // emit secret event
        manager.emit('hammer.input', input);

        manager.recognize(input);
        manager.session.prevInput = input;
    }

    /**
     * extend the data with some usable properties like scale, rotate, velocity etc
     * @param {Object} manager
     * @param {Object} input
     */
    function computeInputData(manager, input) {
        var session = manager.session;
        var pointers = input.pointers;
        var pointersLength = pointers.length;

        // store the first input to calculate the distance and direction
        if (!session.firstInput) {
            session.firstInput = simpleCloneInputData(input);
        }

        // to compute scale and rotation we need to store the multiple touches
        if (pointersLength > 1 && !session.firstMultiple) {
            session.firstMultiple = simpleCloneInputData(input);
        } else if (pointersLength === 1) {
            session.firstMultiple = false;
        }

        var firstInput = session.firstInput;
        var firstMultiple = session.firstMultiple;
        var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

        var center = input.center = getCenter(pointers);
        input.timeStamp = now();
        input.deltaTime = input.timeStamp - firstInput.timeStamp;

        input.angle = getAngle(offsetCenter, center);
        input.distance = getDistance(offsetCenter, center);

        computeDeltaXY(session, input);
        input.offsetDirection = getDirection(input.deltaX, input.deltaY);

        var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
        input.overallVelocityX = overallVelocity.x;
        input.overallVelocityY = overallVelocity.y;
        input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

        input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
        input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

        input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
            session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

        computeIntervalInputData(session, input);

        // find the correct target
        var target = manager.element;
        if (hasParent(input.srcEvent.target, target)) {
            target = input.srcEvent.target;
        }
        input.target = target;
    }

    function computeDeltaXY(session, input) {
        var center = input.center;
        var offset = session.offsetDelta || {};
        var prevDelta = session.prevDelta || {};
        var prevInput = session.prevInput || {};

        if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
            prevDelta = session.prevDelta = {
                x: prevInput.deltaX || 0,
                y: prevInput.deltaY || 0
            };

            offset = session.offsetDelta = {
                x: center.x,
                y: center.y
            };
        }

        input.deltaX = prevDelta.x + (center.x - offset.x);
        input.deltaY = prevDelta.y + (center.y - offset.y);
    }

    /**
     * velocity is calculated every x ms
     * @param {Object} session
     * @param {Object} input
     */
    function computeIntervalInputData(session, input) {
        var last = session.lastInterval || input,
            deltaTime = input.timeStamp - last.timeStamp,
            velocity, velocityX, velocityY, direction;

        if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
            var deltaX = input.deltaX - last.deltaX;
            var deltaY = input.deltaY - last.deltaY;

            var v = getVelocity(deltaTime, deltaX, deltaY);
            velocityX = v.x;
            velocityY = v.y;
            velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
            direction = getDirection(deltaX, deltaY);

            session.lastInterval = input;
        } else {
            // use latest velocity info if it doesn't overtake a minimum period
            velocity = last.velocity;
            velocityX = last.velocityX;
            velocityY = last.velocityY;
            direction = last.direction;
        }

        input.velocity = velocity;
        input.velocityX = velocityX;
        input.velocityY = velocityY;
        input.direction = direction;
    }

    /**
     * create a simple clone from the input used for storage of firstInput and firstMultiple
     * @param {Object} input
     * @returns {Object} clonedInputData
     */
    function simpleCloneInputData(input) {
        // make a simple copy of the pointers because we will get a reference if we don't
        // we only need clientXY for the calculations
        var pointers = [];
        var i = 0;
        while (i < input.pointers.length) {
            pointers[i] = {
                clientX: round(input.pointers[i].clientX),
                clientY: round(input.pointers[i].clientY)
            };
            i++;
        }

        return {
            timeStamp: now(),
            pointers: pointers,
            center: getCenter(pointers),
            deltaX: input.deltaX,
            deltaY: input.deltaY
        };
    }

    /**
     * get the center of all the pointers
     * @param {Array} pointers
     * @return {Object} center contains `x` and `y` properties
     */
    function getCenter(pointers) {
        var pointersLength = pointers.length;

        // no need to loop when only one touch
        if (pointersLength === 1) {
            return {
                x: round(pointers[0].clientX),
                y: round(pointers[0].clientY)
            };
        }

        var x = 0, y = 0, i = 0;
        while (i < pointersLength) {
            x += pointers[i].clientX;
            y += pointers[i].clientY;
            i++;
        }

        return {
            x: round(x / pointersLength),
            y: round(y / pointersLength)
        };
    }

    /**
     * calculate the velocity between two points. unit is in px per ms.
     * @param {Number} deltaTime
     * @param {Number} x
     * @param {Number} y
     * @return {Object} velocity `x` and `y`
     */
    function getVelocity(deltaTime, x, y) {
        return {
            x: x / deltaTime || 0,
            y: y / deltaTime || 0
        };
    }

    /**
     * get the direction between two points
     * @param {Number} x
     * @param {Number} y
     * @return {Number} direction
     */
    function getDirection(x, y) {
        if (x === y) {
            return DIRECTION_NONE;
        }

        if (abs(x) >= abs(y)) {
            return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
        }
        return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
    }

    /**
     * calculate the absolute distance between two points
     * @param {Object} p1 {x, y}
     * @param {Object} p2 {x, y}
     * @param {Array} [props] containing x and y keys
     * @return {Number} distance
     */
    function getDistance(p1, p2, props) {
        if (!props) {
            props = PROPS_XY;
        }
        var x = p2[props[0]] - p1[props[0]],
            y = p2[props[1]] - p1[props[1]];

        return Math.sqrt((x * x) + (y * y));
    }

    /**
     * calculate the angle between two coordinates
     * @param {Object} p1
     * @param {Object} p2
     * @param {Array} [props] containing x and y keys
     * @return {Number} angle
     */
    function getAngle(p1, p2, props) {
        if (!props) {
            props = PROPS_XY;
        }
        var x = p2[props[0]] - p1[props[0]],
            y = p2[props[1]] - p1[props[1]];
        return Math.atan2(y, x) * 180 / Math.PI;
    }

    /**
     * calculate the rotation degrees between two pointersets
     * @param {Array} start array of pointers
     * @param {Array} end array of pointers
     * @return {Number} rotation
     */
    function getRotation(start, end) {
        return getAngle(end[1], end[0], PROPS_CLIENT_XY) - getAngle(start[1], start[0], PROPS_CLIENT_XY);
    }

    /**
     * calculate the scale factor between two pointersets
     * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
     * @param {Array} start array of pointers
     * @param {Array} end array of pointers
     * @return {Number} scale
     */
    function getScale(start, end) {
        return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
    }

    var MOUSE_INPUT_MAP = {
        mousedown: INPUT_START,
        mousemove: INPUT_MOVE,
        mouseup: INPUT_END
    };

    var MOUSE_ELEMENT_EVENTS = 'mousedown';
    var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

    /**
     * Mouse events input
     * @constructor
     * @extends Input
     */
    function MouseInput() {
        this.evEl = MOUSE_ELEMENT_EVENTS;
        this.evWin = MOUSE_WINDOW_EVENTS;

        this.pressed = false; // mousedown state

        Input.apply(this, arguments);
    }

    inherit(MouseInput, Input, {
        /**
         * handle mouse events
         * @param {Object} ev
         */
        handler: function MEhandler(ev) {
            var eventType = MOUSE_INPUT_MAP[ev.type];

            // on start we want to have the left mouse button down
            if (eventType & INPUT_START && ev.button === 0) {
                this.pressed = true;
            }

            if (eventType & INPUT_MOVE && ev.which !== 1) {
                eventType = INPUT_END;
            }

            // mouse must be down
            if (!this.pressed) {
                return;
            }

            if (eventType & INPUT_END) {
                this.pressed = false;
            }

            this.callback(this.manager, eventType, {
                pointers: [ev],
                changedPointers: [ev],
                pointerType: INPUT_TYPE_MOUSE,
                srcEvent: ev
            });
        }
    });

    var POINTER_INPUT_MAP = {
        pointerdown: INPUT_START,
        pointermove: INPUT_MOVE,
        pointerup: INPUT_END,
        pointercancel: INPUT_CANCEL,
        pointerout: INPUT_CANCEL
    };

// in IE10 the pointer types is defined as an enum
    var IE10_POINTER_TYPE_ENUM = {
        2: INPUT_TYPE_TOUCH,
        3: INPUT_TYPE_PEN,
        4: INPUT_TYPE_MOUSE,
        5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
    };

    var POINTER_ELEMENT_EVENTS = 'pointerdown';
    var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
    if (window.MSPointerEvent && !window.PointerEvent) {
        POINTER_ELEMENT_EVENTS = 'MSPointerDown';
        POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
    }

    /**
     * Pointer events input
     * @constructor
     * @extends Input
     */
    function PointerEventInput() {
        this.evEl = POINTER_ELEMENT_EVENTS;
        this.evWin = POINTER_WINDOW_EVENTS;

        Input.apply(this, arguments);

        this.store = (this.manager.session.pointerEvents = []);
    }

    inherit(PointerEventInput, Input, {
        /**
         * handle mouse events
         * @param {Object} ev
         */
        handler: function PEhandler(ev) {
            var store = this.store;
            var removePointer = false;

            var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
            var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
            var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

            var isTouch = (pointerType === INPUT_TYPE_TOUCH);
            var isMouse = (pointerType === INPUT_TYPE_MOUSE);

            // get index of the event in the store
            var storeIndex = inArray(store, ev.pointerId, 'pointerId');

            // start and mouse must be down
            if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
                if (storeIndex < 0) {
                    store.push(ev);
                    storeIndex = store.length - 1;
                }
            } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
                removePointer = true;
            }

            // it not found, so the pointer hasn't been down (so it's probably a hover)
            if (storeIndex < 0) {
                return;
            }

            // update the event in the store
            store[storeIndex] = ev;

            // Filter out mouse events since we handle them in our own handlers
            if (!isMouse) {
                this.callback(this.manager, eventType, {
                    pointers: store,
                    changedPointers: [ev],
                    pointerType: pointerType,
                    srcEvent: ev
                });
            }

            if (removePointer) {
                // remove from the store
                store.splice(storeIndex, 1);
            }
        }
    });

    var SINGLE_TOUCH_INPUT_MAP = {
        touchstart: INPUT_START,
        touchmove: INPUT_MOVE,
        touchend: INPUT_END,
        touchcancel: INPUT_CANCEL
    };

    var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
    var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

    /**
     * Touch events input
     * @constructor
     * @extends Input
     */
    function SingleTouchInput() {
        this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
        this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
        this.started = false;

        Input.apply(this, arguments);
    }

    inherit(SingleTouchInput, Input, {
        handler: function TEhandler(ev) {
            var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

            // should we handle the touch events?
            if (type === INPUT_START) {
                this.started = true;
            }

            if (!this.started) {
                return;
            }

            var touches = normalizeSingleTouches.call(this, ev, type);

            // when done, reset the started state
            if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
                this.started = false;
            }

            this.callback(this.manager, type, {
                pointers: touches[0],
                changedPointers: touches[1],
                pointerType: INPUT_TYPE_TOUCH,
                srcEvent: ev
            });
        }
    });

    /**
     * @this {TouchInput}
     * @param {Object} ev
     * @param {Number} type flag
     * @returns {undefined|Array} [all, changed]
     */
    function normalizeSingleTouches(ev, type) {
        var all = toArray(ev.touches);
        var changed = toArray(ev.changedTouches);

        if (type & (INPUT_END | INPUT_CANCEL)) {
            all = uniqueArray(all.concat(changed), 'identifier', true);
        }

        return [all, changed];
    }

    var TOUCH_INPUT_MAP = {
        touchstart: INPUT_START,
        touchmove: INPUT_MOVE,
        touchend: INPUT_END,
        touchcancel: INPUT_CANCEL
    };

    var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

    /**
     * Multi-user touch events input
     * @constructor
     * @extends Input
     */
    function TouchInput() {
        this.evTarget = TOUCH_TARGET_EVENTS;
        this.targetIds = {};

        Input.apply(this, arguments);
    }

    inherit(TouchInput, Input, {
        handler: function MTEhandler(ev) {
            var type = TOUCH_INPUT_MAP[ev.type];
            var touches = getTouches.call(this, ev, type);
            if (!touches) {
                return;
            }

            this.callback(this.manager, type, {
                pointers: touches[0],
                changedPointers: touches[1],
                pointerType: INPUT_TYPE_TOUCH,
                srcEvent: ev
            });
        }
    });

    /**
     * @this {TouchInput}
     * @param {Object} ev
     * @param {Number} type flag
     * @returns {undefined|Array} [all, changed]
     */
    function getTouches(ev, type) {
        var allTouches = toArray(ev.touches);
        var targetIds = this.targetIds;

        // when there is only one touch, the process can be simplified
        if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
            targetIds[allTouches[0].identifier] = true;
            return [allTouches, allTouches];
        }

        var i,
            targetTouches,
            changedTouches = toArray(ev.changedTouches),
            changedTargetTouches = [],
            target = this.target;

        // get target touches from touches
        targetTouches = allTouches.filter(function(touch) {
            return hasParent(touch.target, target);
        });

        // collect touches
        if (type === INPUT_START) {
            i = 0;
            while (i < targetTouches.length) {
                targetIds[targetTouches[i].identifier] = true;
                i++;
            }
        }

        // filter changed touches to only contain touches that exist in the collected target ids
        i = 0;
        while (i < changedTouches.length) {
            if (targetIds[changedTouches[i].identifier]) {
                changedTargetTouches.push(changedTouches[i]);
            }

            // cleanup removed touches
            if (type & (INPUT_END | INPUT_CANCEL)) {
                delete targetIds[changedTouches[i].identifier];
            }
            i++;
        }

        if (!changedTargetTouches.length) {
            return;
        }

        return [
            // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
            uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
            changedTargetTouches
        ];
    }

    /**
     * Combined touch and mouse input
     *
     * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
     * This because touch devices also emit mouse events while doing a touch.
     *
     * @constructor
     * @extends Input
     */

    var DEDUP_TIMEOUT = 2500;
    var DEDUP_DISTANCE = 25;

    function TouchMouseInput() {
        Input.apply(this, arguments);

        var handler = bindFn(this.handler, this);
        this.touch = new TouchInput(this.manager, handler);
        this.mouse = new MouseInput(this.manager, handler);

        this.primaryTouch = null;
        this.lastTouches = [];
    }

    inherit(TouchMouseInput, Input, {
        /**
         * handle mouse and touch events
         * @param {Hammer} manager
         * @param {String} inputEvent
         * @param {Object} inputData
         */
        handler: function TMEhandler(manager, inputEvent, inputData) {
            var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
                isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

            if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
                return;
            }

            // when we're in a touch event, record touches to  de-dupe synthetic mouse event
            if (isTouch) {
                recordTouches.call(this, inputEvent, inputData);
            } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
                return;
            }

            this.callback(manager, inputEvent, inputData);
        },

        /**
         * remove the event listeners
         */
        destroy: function destroy() {
            this.touch.destroy();
            this.mouse.destroy();
        }
    });

    function recordTouches(eventType, eventData) {
        if (eventType & INPUT_START) {
            this.primaryTouch = eventData.changedPointers[0].identifier;
            setLastTouch.call(this, eventData);
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            setLastTouch.call(this, eventData);
        }
    }

    function setLastTouch(eventData) {
        var touch = eventData.changedPointers[0];

        if (touch.identifier === this.primaryTouch) {
            var lastTouch = {x: touch.clientX, y: touch.clientY};
            this.lastTouches.push(lastTouch);
            var lts = this.lastTouches;
            var removeLastTouch = function() {
                var i = lts.indexOf(lastTouch);
                if (i > -1) {
                    lts.splice(i, 1);
                }
            };
            setTimeout(removeLastTouch, DEDUP_TIMEOUT);
        }
    }

    function isSyntheticEvent(eventData) {
        var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
        for (var i = 0; i < this.lastTouches.length; i++) {
            var t = this.lastTouches[i];
            var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
            if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
                return true;
            }
        }
        return false;
    }

    var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
    var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
    var TOUCH_ACTION_COMPUTE = 'compute';
    var TOUCH_ACTION_AUTO = 'auto';
    var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
    var TOUCH_ACTION_NONE = 'none';
    var TOUCH_ACTION_PAN_X = 'pan-x';
    var TOUCH_ACTION_PAN_Y = 'pan-y';
    var TOUCH_ACTION_MAP = getTouchActionProps();

    /**
     * Touch Action
     * sets the touchAction property or uses the js alternative
     * @param {Manager} manager
     * @param {String} value
     * @constructor
     */
    function TouchAction(manager, value) {
        this.manager = manager;
        this.set(value);
    }

    TouchAction.prototype = {
        /**
         * set the touchAction value on the element or enable the polyfill
         * @param {String} value
         */
        set: function(value) {
            // find out the touch-action by the event handlers
            if (value == TOUCH_ACTION_COMPUTE) {
                value = this.compute();
            }

            if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
                this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
            }
            this.actions = value.toLowerCase().trim();
        },

        /**
         * just re-set the touchAction value
         */
        update: function() {
            this.set(this.manager.options.touchAction);
        },

        /**
         * compute the value for the touchAction property based on the recognizer's settings
         * @returns {String} value
         */
        compute: function() {
            var actions = [];
            each(this.manager.recognizers, function(recognizer) {
                if (boolOrFn(recognizer.options.enable, [recognizer])) {
                    actions = actions.concat(recognizer.getTouchAction());
                }
            });
            return cleanTouchActions(actions.join(' '));
        },

        /**
         * this method is called on each input cycle and provides the preventing of the browser behavior
         * @param {Object} input
         */
        preventDefaults: function(input) {
            var srcEvent = input.srcEvent;
            var direction = input.offsetDirection;

            // if the touch action did prevented once this session
            if (this.manager.session.prevented) {
                srcEvent.preventDefault();
                return;
            }

            var actions = this.actions;
            var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
            var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
            var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

            if (hasNone) {
                //do not prevent defaults if this is a tap gesture

                var isTapPointer = input.pointers.length === 1;
                var isTapMovement = input.distance < 2;
                var isTapTouchTime = input.deltaTime < 250;

                if (isTapPointer && isTapMovement && isTapTouchTime) {
                    return;
                }
            }

            if (hasPanX && hasPanY) {
                // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
                return;
            }

            if (hasNone ||
                (hasPanY && direction & DIRECTION_HORIZONTAL) ||
                (hasPanX && direction & DIRECTION_VERTICAL)) {
                return this.preventSrc(srcEvent);
            }
        },

        /**
         * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
         * @param {Object} srcEvent
         */
        preventSrc: function(srcEvent) {
            this.manager.session.prevented = true;
            srcEvent.preventDefault();
        }
    };

    /**
     * when the touchActions are collected they are not a valid value, so we need to clean things up. *
     * @param {String} actions
     * @returns {*}
     */
    function cleanTouchActions(actions) {
        // none
        if (inStr(actions, TOUCH_ACTION_NONE)) {
            return TOUCH_ACTION_NONE;
        }

        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

        // if both pan-x and pan-y are set (different recognizers
        // for different directions, e.g. horizontal pan but vertical swipe?)
        // we need none (as otherwise with pan-x pan-y combined none of these
        // recognizers will work, since the browser would handle all panning
        if (hasPanX && hasPanY) {
            return TOUCH_ACTION_NONE;
        }

        // pan-x OR pan-y
        if (hasPanX || hasPanY) {
            return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
        }

        // manipulation
        if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
            return TOUCH_ACTION_MANIPULATION;
        }

        return TOUCH_ACTION_AUTO;
    }

    function getTouchActionProps() {
        if (!NATIVE_TOUCH_ACTION) {
            return false;
        }
        var touchMap = {};
        var cssSupports = window.CSS && window.CSS.supports;
        ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

            // If css.supports is not supported but there is native touch-action assume it supports
            // all values. This is the case for IE 10 and 11.
            touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
        });
        return touchMap;
    }

    /**
     * Recognizer flow explained; *
     * All recognizers have the initial state of POSSIBLE when a input session starts.
     * The definition of a input session is from the first input until the last input, with all it's movement in it. *
     * Example session for mouse-input: mousedown -> mousemove -> mouseup
     *
     * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
     * which determines with state it should be.
     *
     * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
     * POSSIBLE to give it another change on the next cycle.
     *
     *               Possible
     *                  |
     *            +-----+---------------+
     *            |                     |
     *      +-----+-----+               |
     *      |           |               |
     *   Failed      Cancelled          |
     *                          +-------+------+
     *                          |              |
     *                      Recognized       Began
     *                                         |
     *                                      Changed
     *                                         |
     *                                  Ended/Recognized
     */
    var STATE_POSSIBLE = 1;
    var STATE_BEGAN = 2;
    var STATE_CHANGED = 4;
    var STATE_ENDED = 8;
    var STATE_RECOGNIZED = STATE_ENDED;
    var STATE_CANCELLED = 16;
    var STATE_FAILED = 32;

    /**
     * Recognizer
     * Every recognizer needs to extend from this class.
     * @constructor
     * @param {Object} options
     */
    function Recognizer(options) {
        this.options = assign({}, this.defaults, options || {});

        this.id = uniqueId();

        this.manager = null;

        // default is enable true
        this.options.enable = ifUndefined(this.options.enable, true);

        this.state = STATE_POSSIBLE;

        this.simultaneous = {};
        this.requireFail = [];
    }

    Recognizer.prototype = {
        /**
         * @virtual
         * @type {Object}
         */
        defaults: {},

        /**
         * set options
         * @param {Object} options
         * @return {Recognizer}
         */
        set: function(options) {
            assign(this.options, options);

            // also update the touchAction, in case something changed about the directions/enabled state
            this.manager && this.manager.touchAction.update();
            return this;
        },

        /**
         * recognize simultaneous with an other recognizer.
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        recognizeWith: function(otherRecognizer) {
            if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
                return this;
            }

            var simultaneous = this.simultaneous;
            otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
            if (!simultaneous[otherRecognizer.id]) {
                simultaneous[otherRecognizer.id] = otherRecognizer;
                otherRecognizer.recognizeWith(this);
            }
            return this;
        },

        /**
         * drop the simultaneous link. it doesnt remove the link on the other recognizer.
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        dropRecognizeWith: function(otherRecognizer) {
            if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
                return this;
            }

            otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
            delete this.simultaneous[otherRecognizer.id];
            return this;
        },

        /**
         * recognizer can only run when an other is failing
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        requireFailure: function(otherRecognizer) {
            if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
                return this;
            }

            var requireFail = this.requireFail;
            otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
            if (inArray(requireFail, otherRecognizer) === -1) {
                requireFail.push(otherRecognizer);
                otherRecognizer.requireFailure(this);
            }
            return this;
        },

        /**
         * drop the requireFailure link. it does not remove the link on the other recognizer.
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        dropRequireFailure: function(otherRecognizer) {
            if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
                return this;
            }

            otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
            var index = inArray(this.requireFail, otherRecognizer);
            if (index > -1) {
                this.requireFail.splice(index, 1);
            }
            return this;
        },

        /**
         * has require failures boolean
         * @returns {boolean}
         */
        hasRequireFailures: function() {
            return this.requireFail.length > 0;
        },

        /**
         * if the recognizer can recognize simultaneous with an other recognizer
         * @param {Recognizer} otherRecognizer
         * @returns {Boolean}
         */
        canRecognizeWith: function(otherRecognizer) {
            return !!this.simultaneous[otherRecognizer.id];
        },

        /**
         * You should use `tryEmit` instead of `emit` directly to check
         * that all the needed recognizers has failed before emitting.
         * @param {Object} input
         */
        emit: function(input) {
            var self = this;
            var state = this.state;

            function emit(event) {
                self.manager.emit(event, input);
            }

            // 'panstart' and 'panmove'
            if (state < STATE_ENDED) {
                emit(self.options.event + stateStr(state));
            }

            emit(self.options.event); // simple 'eventName' events

            if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
                emit(input.additionalEvent);
            }

            // panend and pancancel
            if (state >= STATE_ENDED) {
                emit(self.options.event + stateStr(state));
            }
        },

        /**
         * Check that all the require failure recognizers has failed,
         * if true, it emits a gesture event,
         * otherwise, setup the state to FAILED.
         * @param {Object} input
         */
        tryEmit: function(input) {
            if (this.canEmit()) {
                return this.emit(input);
            }
            // it's failing anyway
            this.state = STATE_FAILED;
        },

        /**
         * can we emit?
         * @returns {boolean}
         */
        canEmit: function() {
            var i = 0;
            while (i < this.requireFail.length) {
                if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                    return false;
                }
                i++;
            }
            return true;
        },

        /**
         * update the recognizer
         * @param {Object} inputData
         */
        recognize: function(inputData) {
            // make a new copy of the inputData
            // so we can change the inputData without messing up the other recognizers
            var inputDataClone = assign({}, inputData);

            // is is enabled and allow recognizing?
            if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
                this.reset();
                this.state = STATE_FAILED;
                return;
            }

            // reset when we've reached the end
            if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
                this.state = STATE_POSSIBLE;
            }

            this.state = this.process(inputDataClone);

            // the recognizer has recognized a gesture
            // so trigger an event
            if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
                this.tryEmit(inputDataClone);
            }
        },

        /**
         * return the state of the recognizer
         * the actual recognizing happens in this method
         * @virtual
         * @param {Object} inputData
         * @returns {Const} STATE
         */
        process: function(inputData) { }, // jshint ignore:line

        /**
         * return the preferred touch-action
         * @virtual
         * @returns {Array}
         */
        getTouchAction: function() { },

        /**
         * called when the gesture isn't allowed to recognize
         * like when another is being recognized or it is disabled
         * @virtual
         */
        reset: function() { }
    };

    /**
     * get a usable string, used as event postfix
     * @param {Const} state
     * @returns {String} state
     */
    function stateStr(state) {
        if (state & STATE_CANCELLED) {
            return 'cancel';
        } else if (state & STATE_ENDED) {
            return 'end';
        } else if (state & STATE_CHANGED) {
            return 'move';
        } else if (state & STATE_BEGAN) {
            return 'start';
        }
        return '';
    }

    /**
     * direction cons to string
     * @param {Const} direction
     * @returns {String}
     */
    function directionStr(direction) {
        if (direction == DIRECTION_DOWN) {
            return 'down';
        } else if (direction == DIRECTION_UP) {
            return 'up';
        } else if (direction == DIRECTION_LEFT) {
            return 'left';
        } else if (direction == DIRECTION_RIGHT) {
            return 'right';
        }
        return '';
    }

    /**
     * get a recognizer by name if it is bound to a manager
     * @param {Recognizer|String} otherRecognizer
     * @param {Recognizer} recognizer
     * @returns {Recognizer}
     */
    function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
        var manager = recognizer.manager;
        if (manager) {
            return manager.get(otherRecognizer);
        }
        return otherRecognizer;
    }

    /**
     * This recognizer is just used as a base for the simple attribute recognizers.
     * @constructor
     * @extends Recognizer
     */
    function AttrRecognizer() {
        Recognizer.apply(this, arguments);
    }

    inherit(AttrRecognizer, Recognizer, {
        /**
         * @namespace
         * @memberof AttrRecognizer
         */
        defaults: {
            /**
             * @type {Number}
             * @default 1
             */
            pointers: 1
        },

        /**
         * Used to check if it the recognizer receives valid input, like input.distance > 10.
         * @memberof AttrRecognizer
         * @param {Object} input
         * @returns {Boolean} recognized
         */
        attrTest: function(input) {
            var optionPointers = this.options.pointers;
            return optionPointers === 0 || input.pointers.length === optionPointers;
        },

        /**
         * Process the input and return the state for the recognizer
         * @memberof AttrRecognizer
         * @param {Object} input
         * @returns {*} State
         */
        process: function(input) {
            var state = this.state;
            var eventType = input.eventType;

            var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
            var isValid = this.attrTest(input);

            // on cancel input and we've recognized before, return STATE_CANCELLED
            if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
                return state | STATE_CANCELLED;
            } else if (isRecognized || isValid) {
                if (eventType & INPUT_END) {
                    return state | STATE_ENDED;
                } else if (!(state & STATE_BEGAN)) {
                    return STATE_BEGAN;
                }
                return state | STATE_CHANGED;
            }
            return STATE_FAILED;
        }
    });

    /**
     * Pan
     * Recognized when the pointer is down and moved in the allowed direction.
     * @constructor
     * @extends AttrRecognizer
     */
    function PanRecognizer() {
        AttrRecognizer.apply(this, arguments);

        this.pX = null;
        this.pY = null;
    }

    inherit(PanRecognizer, AttrRecognizer, {
        /**
         * @namespace
         * @memberof PanRecognizer
         */
        defaults: {
            event: 'pan',
            threshold: 10,
            pointers: 1,
            direction: DIRECTION_ALL
        },

        getTouchAction: function() {
            var direction = this.options.direction;
            var actions = [];
            if (direction & DIRECTION_HORIZONTAL) {
                actions.push(TOUCH_ACTION_PAN_Y);
            }
            if (direction & DIRECTION_VERTICAL) {
                actions.push(TOUCH_ACTION_PAN_X);
            }
            return actions;
        },

        directionTest: function(input) {
            var options = this.options;
            var hasMoved = true;
            var distance = input.distance;
            var direction = input.direction;
            var x = input.deltaX;
            var y = input.deltaY;

            // lock to axis?
            if (!(direction & options.direction)) {
                if (options.direction & DIRECTION_HORIZONTAL) {
                    direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                    hasMoved = x != this.pX;
                    distance = Math.abs(input.deltaX);
                } else {
                    direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                    hasMoved = y != this.pY;
                    distance = Math.abs(input.deltaY);
                }
            }
            input.direction = direction;
            return hasMoved && distance > options.threshold && direction & options.direction;
        },

        attrTest: function(input) {
            return AttrRecognizer.prototype.attrTest.call(this, input) &&
                (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
        },

        emit: function(input) {

            this.pX = input.deltaX;
            this.pY = input.deltaY;

            var direction = directionStr(input.direction);

            if (direction) {
                input.additionalEvent = this.options.event + direction;
            }
            this._super.emit.call(this, input);
        }
    });

    /**
     * Pinch
     * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
     * @constructor
     * @extends AttrRecognizer
     */
    function PinchRecognizer() {
        AttrRecognizer.apply(this, arguments);
    }

    inherit(PinchRecognizer, AttrRecognizer, {
        /**
         * @namespace
         * @memberof PinchRecognizer
         */
        defaults: {
            event: 'pinch',
            threshold: 0,
            pointers: 2
        },

        getTouchAction: function() {
            return [TOUCH_ACTION_NONE];
        },

        attrTest: function(input) {
            return this._super.attrTest.call(this, input) &&
                (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
        },

        emit: function(input) {
            if (input.scale !== 1) {
                var inOut = input.scale < 1 ? 'in' : 'out';
                input.additionalEvent = this.options.event + inOut;
            }
            this._super.emit.call(this, input);
        }
    });

    /**
     * Press
     * Recognized when the pointer is down for x ms without any movement.
     * @constructor
     * @extends Recognizer
     */
    function PressRecognizer() {
        Recognizer.apply(this, arguments);

        this._timer = null;
        this._input = null;
    }

    inherit(PressRecognizer, Recognizer, {
        /**
         * @namespace
         * @memberof PressRecognizer
         */
        defaults: {
            event: 'press',
            pointers: 1,
            time: 251, // minimal time of the pointer to be pressed
            threshold: 9 // a minimal movement is ok, but keep it low
        },

        getTouchAction: function() {
            return [TOUCH_ACTION_AUTO];
        },

        process: function(input) {
            var options = this.options;
            var validPointers = input.pointers.length === options.pointers;
            var validMovement = input.distance < options.threshold;
            var validTime = input.deltaTime > options.time;

            this._input = input;

            // we only allow little movement
            // and we've reached an end event, so a tap is possible
            if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
                this.reset();
            } else if (input.eventType & INPUT_START) {
                this.reset();
                this._timer = setTimeoutContext(function() {
                    this.state = STATE_RECOGNIZED;
                    this.tryEmit();
                }, options.time, this);
            } else if (input.eventType & INPUT_END) {
                return STATE_RECOGNIZED;
            }
            return STATE_FAILED;
        },

        reset: function() {
            clearTimeout(this._timer);
        },

        emit: function(input) {
            if (this.state !== STATE_RECOGNIZED) {
                return;
            }

            if (input && (input.eventType & INPUT_END)) {
                this.manager.emit(this.options.event + 'up', input);
            } else {
                this._input.timeStamp = now();
                this.manager.emit(this.options.event, this._input);
            }
        }
    });

    /**
     * Rotate
     * Recognized when two or more pointer are moving in a circular motion.
     * @constructor
     * @extends AttrRecognizer
     */
    function RotateRecognizer() {
        AttrRecognizer.apply(this, arguments);
    }

    inherit(RotateRecognizer, AttrRecognizer, {
        /**
         * @namespace
         * @memberof RotateRecognizer
         */
        defaults: {
            event: 'rotate',
            threshold: 0,
            pointers: 2
        },

        getTouchAction: function() {
            return [TOUCH_ACTION_NONE];
        },

        attrTest: function(input) {
            return this._super.attrTest.call(this, input) &&
                (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
        }
    });

    /**
     * Swipe
     * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
     * @constructor
     * @extends AttrRecognizer
     */
    function SwipeRecognizer() {
        AttrRecognizer.apply(this, arguments);
    }

    inherit(SwipeRecognizer, AttrRecognizer, {
        /**
         * @namespace
         * @memberof SwipeRecognizer
         */
        defaults: {
            event: 'swipe',
            threshold: 10,
            velocity: 0.3,
            direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
            pointers: 1
        },

        getTouchAction: function() {
            return PanRecognizer.prototype.getTouchAction.call(this);
        },

        attrTest: function(input) {
            var direction = this.options.direction;
            var velocity;

            if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
                velocity = input.overallVelocity;
            } else if (direction & DIRECTION_HORIZONTAL) {
                velocity = input.overallVelocityX;
            } else if (direction & DIRECTION_VERTICAL) {
                velocity = input.overallVelocityY;
            }

            return this._super.attrTest.call(this, input) &&
                direction & input.offsetDirection &&
                input.distance > this.options.threshold &&
                input.maxPointers == this.options.pointers &&
                abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
        },

        emit: function(input) {
            var direction = directionStr(input.offsetDirection);
            if (direction) {
                this.manager.emit(this.options.event + direction, input);
            }

            this.manager.emit(this.options.event, input);
        }
    });

    /**
     * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
     * between the given interval and position. The delay option can be used to recognize multi-taps without firing
     * a single tap.
     *
     * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
     * multi-taps being recognized.
     * @constructor
     * @extends Recognizer
     */
    function TapRecognizer() {
        Recognizer.apply(this, arguments);

        // previous time and center,
        // used for tap counting
        this.pTime = false;
        this.pCenter = false;

        this._timer = null;
        this._input = null;
        this.count = 0;
    }

    inherit(TapRecognizer, Recognizer, {
        /**
         * @namespace
         * @memberof PinchRecognizer
         */
        defaults: {
            event: 'tap',
            pointers: 1,
            taps: 1,
            interval: 300, // max time between the multi-tap taps
            time: 250, // max time of the pointer to be down (like finger on the screen)
            threshold: 9, // a minimal movement is ok, but keep it low
            posThreshold: 10 // a multi-tap can be a bit off the initial position
        },

        getTouchAction: function() {
            return [TOUCH_ACTION_MANIPULATION];
        },

        process: function(input) {
            var options = this.options;

            var validPointers = input.pointers.length === options.pointers;
            var validMovement = input.distance < options.threshold;
            var validTouchTime = input.deltaTime < options.time;

            this.reset();

            if ((input.eventType & INPUT_START) && (this.count === 0)) {
                return this.failTimeout();
            }

            // we only allow little movement
            // and we've reached an end event, so a tap is possible
            if (validMovement && validTouchTime && validPointers) {
                if (input.eventType != INPUT_END) {
                    return this.failTimeout();
                }

                var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
                var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

                this.pTime = input.timeStamp;
                this.pCenter = input.center;

                if (!validMultiTap || !validInterval) {
                    this.count = 1;
                } else {
                    this.count += 1;
                }

                this._input = input;

                // if tap count matches we have recognized it,
                // else it has began recognizing...
                var tapCount = this.count % options.taps;
                if (tapCount === 0) {
                    // no failing requirements, immediately trigger the tap event
                    // or wait as long as the multitap interval to trigger
                    if (!this.hasRequireFailures()) {
                        return STATE_RECOGNIZED;
                    } else {
                        this._timer = setTimeoutContext(function() {
                            this.state = STATE_RECOGNIZED;
                            this.tryEmit();
                        }, options.interval, this);
                        return STATE_BEGAN;
                    }
                }
            }
            return STATE_FAILED;
        },

        failTimeout: function() {
            this._timer = setTimeoutContext(function() {
                this.state = STATE_FAILED;
            }, this.options.interval, this);
            return STATE_FAILED;
        },

        reset: function() {
            clearTimeout(this._timer);
        },

        emit: function() {
            if (this.state == STATE_RECOGNIZED) {
                this._input.tapCount = this.count;
                this.manager.emit(this.options.event, this._input);
            }
        }
    });

    /**
     * Simple way to create a manager with a default set of recognizers.
     * @param {HTMLElement} element
     * @param {Object} [options]
     * @constructor
     */
    function Hammer(element, options) {
        options = options || {};
        options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
        return new Manager(element, options);
    }

    /**
     * @const {string}
     */
    Hammer.VERSION = '2.0.8';

    /**
     * default settings
     * @namespace
     */
    Hammer.defaults = {
        /**
         * set if DOM events are being triggered.
         * But this is slower and unused by simple implementations, so disabled by default.
         * @type {Boolean}
         * @default false
         */
        domEvents: false,

        /**
         * The value for the touchAction property/fallback.
         * When set to `compute` it will magically set the correct value based on the added recognizers.
         * @type {String}
         * @default compute
         */
        touchAction: TOUCH_ACTION_COMPUTE,

        /**
         * @type {Boolean}
         * @default true
         */
        enable: true,

        /**
         * EXPERIMENTAL FEATURE -- can be removed/changed
         * Change the parent input target element.
         * If Null, then it is being set the to main element.
         * @type {Null|EventTarget}
         * @default null
         */
        inputTarget: null,

        /**
         * force an input class
         * @type {Null|Function}
         * @default null
         */
        inputClass: null,

        /**
         * Default recognizer setup when calling `Hammer()`
         * When creating a new Manager these will be skipped.
         * @type {Array}
         */
        preset: [
            // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
            [RotateRecognizer, {enable: false}],
            [PinchRecognizer, {enable: false}, ['rotate']],
            [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
            [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
            [TapRecognizer],
            [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
            [PressRecognizer]
        ],

        /**
         * Some CSS properties can be used to improve the working of Hammer.
         * Add them to this method and they will be set when creating a new Manager.
         * @namespace
         */
        cssProps: {
            /**
             * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
             * @type {String}
             * @default 'none'
             */
            userSelect: 'none',

            /**
             * Disable the Windows Phone grippers when pressing an element.
             * @type {String}
             * @default 'none'
             */
            touchSelect: 'none',

            /**
             * Disables the default callout shown when you touch and hold a touch target.
             * On iOS, when you touch and hold a touch target such as a link, Safari displays
             * a callout containing information about the link. This property allows you to disable that callout.
             * @type {String}
             * @default 'none'
             */
            touchCallout: 'none',

            /**
             * Specifies whether zooming is enabled. Used by IE10>
             * @type {String}
             * @default 'none'
             */
            contentZooming: 'none',

            /**
             * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
             * @type {String}
             * @default 'none'
             */
            userDrag: 'none',

            /**
             * Overrides the highlight color shown when the user taps a link or a JavaScript
             * clickable element in iOS. This property obeys the alpha value, if specified.
             * @type {String}
             * @default 'rgba(0,0,0,0)'
             */
            tapHighlightColor: 'rgba(0,0,0,0)'
        }
    };

    var STOP = 1;
    var FORCED_STOP = 2;

    /**
     * Manager
     * @param {HTMLElement} element
     * @param {Object} [options]
     * @constructor
     */
    function Manager(element, options) {
        this.options = assign({}, Hammer.defaults, options || {});

        this.options.inputTarget = this.options.inputTarget || element;

        this.handlers = {};
        this.session = {};
        this.recognizers = [];
        this.oldCssProps = {};

        this.element = element;
        this.input = createInputInstance(this);
        this.touchAction = new TouchAction(this, this.options.touchAction);

        toggleCssProps(this, true);

        each(this.options.recognizers, function(item) {
            var recognizer = this.add(new (item[0])(item[1]));
            item[2] && recognizer.recognizeWith(item[2]);
            item[3] && recognizer.requireFailure(item[3]);
        }, this);
    }

    Manager.prototype = {
        /**
         * set options
         * @param {Object} options
         * @returns {Manager}
         */
        set: function(options) {
            assign(this.options, options);

            // Options that need a little more setup
            if (options.touchAction) {
                this.touchAction.update();
            }
            if (options.inputTarget) {
                // Clean up existing event listeners and reinitialize
                this.input.destroy();
                this.input.target = options.inputTarget;
                this.input.init();
            }
            return this;
        },

        /**
         * stop recognizing for this session.
         * This session will be discarded, when a new [input]start event is fired.
         * When forced, the recognizer cycle is stopped immediately.
         * @param {Boolean} [force]
         */
        stop: function(force) {
            this.session.stopped = force ? FORCED_STOP : STOP;
        },

        /**
         * run the recognizers!
         * called by the inputHandler function on every movement of the pointers (touches)
         * it walks through all the recognizers and tries to detect the gesture that is being made
         * @param {Object} inputData
         */
        recognize: function(inputData) {
            var session = this.session;
            if (session.stopped) {
                return;
            }

            // run the touch-action polyfill
            this.touchAction.preventDefaults(inputData);

            var recognizer;
            var recognizers = this.recognizers;

            // this holds the recognizer that is being recognized.
            // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
            // if no recognizer is detecting a thing, it is set to `null`
            var curRecognizer = session.curRecognizer;

            // reset when the last recognizer is recognized
            // or when we're in a new session
            if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
                curRecognizer = session.curRecognizer = null;
            }

            var i = 0;
            while (i < recognizers.length) {
                recognizer = recognizers[i];

                // find out if we are allowed try to recognize the input for this one.
                // 1.   allow if the session is NOT forced stopped (see the .stop() method)
                // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
                //      that is being recognized.
                // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
                //      this can be setup with the `recognizeWith()` method on the recognizer.
                if (session.stopped !== FORCED_STOP && ( // 1
                        !curRecognizer || recognizer == curRecognizer || // 2
                        recognizer.canRecognizeWith(curRecognizer))) { // 3
                    recognizer.recognize(inputData);
                } else {
                    recognizer.reset();
                }

                // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
                // current active recognizer. but only if we don't already have an active recognizer
                if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                    curRecognizer = session.curRecognizer = recognizer;
                }
                i++;
            }
        },

        /**
         * get a recognizer by its event name.
         * @param {Recognizer|String} recognizer
         * @returns {Recognizer|Null}
         */
        get: function(recognizer) {
            if (recognizer instanceof Recognizer) {
                return recognizer;
            }

            var recognizers = this.recognizers;
            for (var i = 0; i < recognizers.length; i++) {
                if (recognizers[i].options.event == recognizer) {
                    return recognizers[i];
                }
            }
            return null;
        },

        /**
         * add a recognizer to the manager
         * existing recognizers with the same event name will be removed
         * @param {Recognizer} recognizer
         * @returns {Recognizer|Manager}
         */
        add: function(recognizer) {
            if (invokeArrayArg(recognizer, 'add', this)) {
                return this;
            }

            // remove existing
            var existing = this.get(recognizer.options.event);
            if (existing) {
                this.remove(existing);
            }

            this.recognizers.push(recognizer);
            recognizer.manager = this;

            this.touchAction.update();
            return recognizer;
        },

        /**
         * remove a recognizer by name or instance
         * @param {Recognizer|String} recognizer
         * @returns {Manager}
         */
        remove: function(recognizer) {
            if (invokeArrayArg(recognizer, 'remove', this)) {
                return this;
            }

            recognizer = this.get(recognizer);

            // let's make sure this recognizer exists
            if (recognizer) {
                var recognizers = this.recognizers;
                var index = inArray(recognizers, recognizer);

                if (index !== -1) {
                    recognizers.splice(index, 1);
                    this.touchAction.update();
                }
            }

            return this;
        },

        /**
         * bind event
         * @param {String} events
         * @param {Function} handler
         * @returns {EventEmitter} this
         */
        on: function(events, handler) {
            if (events === undefined) {
                return;
            }
            if (handler === undefined) {
                return;
            }

            var handlers = this.handlers;
            each(splitStr(events), function(event) {
                handlers[event] = handlers[event] || [];
                handlers[event].push(handler);
            });
            return this;
        },

        /**
         * unbind event, leave emit blank to remove all handlers
         * @param {String} events
         * @param {Function} [handler]
         * @returns {EventEmitter} this
         */
        off: function(events, handler) {
            if (events === undefined) {
                return;
            }

            var handlers = this.handlers;
            each(splitStr(events), function(event) {
                if (!handler) {
                    delete handlers[event];
                } else {
                    handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
                }
            });
            return this;
        },

        /**
         * emit event to the listeners
         * @param {String} event
         * @param {Object} data
         */
        emit: function(event, data) {
            // we also want to trigger dom events
            if (this.options.domEvents) {
                triggerDomEvent(event, data);
            }

            // no handlers, so skip it all
            var handlers = this.handlers[event] && this.handlers[event].slice();
            if (!handlers || !handlers.length) {
                return;
            }

            data.type = event;
            data.preventDefault = function() {
                data.srcEvent.preventDefault();
            };

            data.stopPropagation = function() {
                data.srcEvent.stopPropagation();
            };

            var i = 0;
            while (i < handlers.length) {
                handlers[i](data);
                i++;
            }
        },

        /**
         * destroy the manager and unbinds all events
         * it doesn't unbind dom events, that is the user own responsibility
         */
        destroy: function() {
            this.element && toggleCssProps(this, false);

            this.handlers = {};
            this.session = {};
            this.input.destroy();
            this.element = null;
        }
    };

    /**
     * add/remove the css properties as defined in manager.options.cssProps
     * @param {Manager} manager
     * @param {Boolean} add
     */
    function toggleCssProps(manager, add) {
        var element = manager.element;
        if (!element.style) {
            return;
        }
        var prop;
        each(manager.options.cssProps, function(value, name) {
            prop = prefixed(element.style, name);
            if (add) {
                manager.oldCssProps[prop] = element.style[prop];
                element.style[prop] = value;
            } else {
                element.style[prop] = manager.oldCssProps[prop] || '';
            }
        });
        if (!add) {
            manager.oldCssProps = {};
        }
    }

    /**
     * trigger dom event
     * @param {String} event
     * @param {Object} data
     */
    function triggerDomEvent(event, data) {
        var gestureEvent = document.createEvent('Event');
        gestureEvent.initEvent(event, true, true);
        gestureEvent.gesture = data;
        data.target.dispatchEvent(gestureEvent);
    }

    assign(Hammer, {
        INPUT_START: INPUT_START,
        INPUT_MOVE: INPUT_MOVE,
        INPUT_END: INPUT_END,
        INPUT_CANCEL: INPUT_CANCEL,

        STATE_POSSIBLE: STATE_POSSIBLE,
        STATE_BEGAN: STATE_BEGAN,
        STATE_CHANGED: STATE_CHANGED,
        STATE_ENDED: STATE_ENDED,
        STATE_RECOGNIZED: STATE_RECOGNIZED,
        STATE_CANCELLED: STATE_CANCELLED,
        STATE_FAILED: STATE_FAILED,

        DIRECTION_NONE: DIRECTION_NONE,
        DIRECTION_LEFT: DIRECTION_LEFT,
        DIRECTION_RIGHT: DIRECTION_RIGHT,
        DIRECTION_UP: DIRECTION_UP,
        DIRECTION_DOWN: DIRECTION_DOWN,
        DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
        DIRECTION_VERTICAL: DIRECTION_VERTICAL,
        DIRECTION_ALL: DIRECTION_ALL,

        Manager: Manager,
        Input: Input,
        TouchAction: TouchAction,

        TouchInput: TouchInput,
        MouseInput: MouseInput,
        PointerEventInput: PointerEventInput,
        TouchMouseInput: TouchMouseInput,
        SingleTouchInput: SingleTouchInput,

        Recognizer: Recognizer,
        AttrRecognizer: AttrRecognizer,
        Tap: TapRecognizer,
        Pan: PanRecognizer,
        Swipe: SwipeRecognizer,
        Pinch: PinchRecognizer,
        Rotate: RotateRecognizer,
        Press: PressRecognizer,

        on: addEventListeners,
        off: removeEventListeners,
        each: each,
        merge: merge,
        extend: extend,
        assign: assign,
        inherit: inherit,
        bindFn: bindFn,
        prefixed: prefixed
    });

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
    var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
    freeGlobal.Hammer = Hammer;

    if (typeof define === 'function' && define.amd) {
        define(function() {
            return Hammer;
        });
    } else if (typeof module != 'undefined' && module.exports) {
        module.exports = Hammer;
    } else {
        window[exportName] = Hammer;
    }

})(window, document, 'Hammer');

(function() {

"use strict";

var av = Autodesk.Viewing;

av.EventDispatcher = function() {
};


av.EventDispatcher.prototype = {

    constructor: av.EventDispatcher,


    apply: function(object) {

		object.addEventListener = av.EventDispatcher.prototype.addEventListener;
		object.hasEventListener = av.EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = av.EventDispatcher.prototype.removeEventListener;
		object.fireEvent = av.EventDispatcher.prototype.fireEvent;
		object.dispatchEvent = av.EventDispatcher.prototype.fireEvent;
    },

    /**
     * Adds an event listener.
     * 
     * @param {string} type - Event type identifier.
     * @param {function} listener - Callback function, receives an event parameter.
     * @param {object} [options] - Options object with characteristics about the event listener.
     * @param {bool} [options.once] - When true, the event listener will only get invoked once. Defaults to false. 
     */
    addEventListener : function(type, listener, options)
    {
        if (!type) return;
        if ( this.listeners === undefined ) this.listeners = {};

        if (typeof this.listeners[type] == "undefined"){
            this.listeners[type] = [];
        }

        this.listeners[type].push({
            callbackFn: listener,
            once: options ? !!options.once : false
        });
    },

    /**
     * Returns true if the specified listener already exists, false otherwise.
     * 
     * @param {string} type - Event type identifier.
     * @param {function} listener - Callback function to check if it will be already registered.
     */
    hasEventListener : function (type, listener) {

        if (!type) return false;
        if (this.listeners === undefined) return false;
        
        var typeListeners = this.listeners[type];
        if (!typeListeners || typeListeners.length === 0) 
            return false;

        for (var i=0, len=typeListeners.length; i<len; ++i) {
            if (typeListeners[i].callbackFn === listener)
                return true;
        }

        return false;
    },


    /**
     * Removes an event listener. 
     * If the event listener is not registered then nothing happens.
     * 
     * @param {string} type - Event type identifier.
     * @param {function} listener - Callback function to remove.
     */
    removeEventListener : function(type, listener)
    {
        if (!type) return;
        if ( this.listeners === undefined ) {
            this.listeners = {};
            return;
        }

        var typeListeners = this.listeners[type];
        if (!typeListeners) return;

        for (var i=0, len=typeListeners.length; i<len; ++i){
            if (typeListeners[i].callbackFn === listener){
                typeListeners.splice(i, 1);
                break;
            }
        }
    },


    /**
     * Invokes all listeners registered to the event's type.
     * 
     * @param {(string | object)} event - Either a string type identifier or an object which 
     * will get passed along to each listener. The event object must contain a ``type`` attribute.
     */
    dispatchEvent : function(event)
    {
        if ( this.listeners === undefined ) {
            this.listeners = {};
            return;
        }

        if (typeof event == "string"){
            event = { type: event };
        }

        if (!event.target){
            try {
                event.target = this;
            } catch (e) {}
        }

        if (!event.type){
            throw new Error("event type unknown.");
        }

        if (!Array.isArray(this.listeners[event.type]))
            return;

        var typeListeners = this.listeners[event.type].slice(); // shallow copy
        var oneShots = [];
        for (var i=0, len=typeListeners.length; i<len; ++i){
            typeListeners[i].callbackFn.call(this, event);
            if (typeListeners[i].once) {
                oneShots.push(typeListeners[i].callbackFn);
            }
        }

        for (var j=0; j<oneShots.length; ++j) {
            this.removeEventListener(event.type, oneShots[j]);
        }
    }

};

// Legacy event routine needs to be deprecated.
av.EventDispatcher.prototype.fireEvent = av.EventDispatcher.prototype.dispatchEvent; 

})();

// WebRTC adapter (adapter.js) from Google

if (typeof window !== 'undefined')
{

    var RTCPeerConnection = null;
    var getUserMedia = null;
    var attachMediaStream = null;
    var reattachMediaStream = null;
    var webrtcDetectedBrowser = null;
    var webrtcDetectedVersion = null;

    function trace(text) {
        // This function is used for logging.
        if (text[text.length - 1] == '\n') {
            text = text.substring(0, text.length - 1);
        }
        console.log((performance.now() / 1000).toFixed(3) + ": " + text);
    }

    if (navigator.mozGetUserMedia) {
        //console.log("This appears to be Firefox");

        webrtcDetectedBrowser = "firefox";

        webrtcDetectedVersion =
            parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]);

        // The RTCPeerConnection object.
        RTCPeerConnection = mozRTCPeerConnection;

        // The RTCSessionDescription object.
        RTCSessionDescription = mozRTCSessionDescription;

        // The RTCIceCandidate object.
        RTCIceCandidate = mozRTCIceCandidate;

        // Get UserMedia (only difference is the prefix).
        // Code from Adam Barth.
        getUserMedia = navigator.mozGetUserMedia.bind(navigator);

        // Creates iceServer from the url for FF.
        createIceServer = function (url, username, password) {
            var iceServer = null;
            var url_parts = url.split(':');
            if (url_parts[0].indexOf('stun') === 0) {
                // Create iceServer with stun url.
                iceServer = { 'url': url };
            } else if (url_parts[0].indexOf('turn') === 0 &&
                (url.indexOf('transport=udp') !== -1 ||
                    url.indexOf('?transport') === -1)) {
                // Create iceServer with turn url.
                // Ignore the transport parameter from TURN url.
                var turn_url_parts = url.split("?");
                iceServer = { 'url': turn_url_parts[0],
                    'credential': password,
                    'username': username };
            }
            return iceServer;
        };

        // Attach a media stream to an element.
        attachMediaStream = function (element, stream) {
            console.log("Attaching media stream");
            element.mozSrcObject = stream;
            element.play();
        };

        reattachMediaStream = function (to, from) {
            console.log("Reattaching media stream");
            to.mozSrcObject = from.mozSrcObject;
            to.play();
        };

        // Fake get{Video,Audio}Tracks
        MediaStream.prototype.getVideoTracks = function () {
            return [];
        };

        MediaStream.prototype.getAudioTracks = function () {
            return [];
        };
    } else if (navigator.webkitGetUserMedia) {
        //console.log("This appears to be Chrome");

        var match = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

        webrtcDetectedBrowser = "chrome";

        // need to check because this crashes on Chrome mobile emulation
        // 40 is an arbitrary version which the feature is available
        webrtcDetectedVersion = match ?
            parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) : 40;

        // Creates iceServer from the url for Chrome.
        createIceServer = function (url, username, password) {
            var iceServer = null;
            var url_parts = url.split(':');
            if (url_parts[0].indexOf('stun') === 0) {
                // Create iceServer with stun url.
                iceServer = { 'url': url };
            } else if (url_parts[0].indexOf('turn') === 0) {
                if (webrtcDetectedVersion < 28) {
                    // For pre-M28 chrome versions use old TURN format.
                    var url_turn_parts = url.split("turn:");
                    iceServer = { 'url': 'turn:' + username + '@' + url_turn_parts[1],
                        'credential': password };
                } else {
                    // For Chrome M28 & above use new TURN format.
                    iceServer = { 'url': url,
                        'credential': password,
                        'username': username };
                }
            }
            return iceServer;
        };

        // The RTCPeerConnection object.
        RTCPeerConnection = webkitRTCPeerConnection;

        // Get UserMedia (only difference is the prefix).
        // Code from Adam Barth.
        getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

        // Attach a media stream to an element.
        attachMediaStream = function (element, stream) {
            if (typeof element.srcObject !== 'undefined') {
                element.srcObject = stream;
            } else if (typeof element.mozSrcObject !== 'undefined') {
                element.mozSrcObject = stream;
            } else if (typeof element.src !== 'undefined') {
                element.src = URL.createObjectURL(stream);
            } else {
                console.log('Error attaching stream to element.');
            }
        };

        reattachMediaStream = function (to, from) {
            to.src = from.src;
        };

        // The representation of tracks in a stream is changed in M26.
        // Unify them for earlier Chrome versions in the coexisting period.
        if (!webkitMediaStream.prototype.getVideoTracks) {
            webkitMediaStream.prototype.getVideoTracks = function () {
                return this.videoTracks;
            };
            webkitMediaStream.prototype.getAudioTracks = function () {
                return this.audioTracks;
            };
        }

        // New syntax of getXXXStreams method in M26.
        if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
            webkitRTCPeerConnection.prototype.getLocalStreams = function () {
                return this.localStreams;
            };
            webkitRTCPeerConnection.prototype.getRemoteStreams = function () {
                return this.remoteStreams;
            };
        }
    } else {
        console.log("Browser does not appear to be WebRTC-capable");
    }

}


(function() {

var av = Autodesk.Viewing,
    endp = av.endpoint = av.endpoint || {},
    avp = av.Private;

    endp.ENDPOINT_API_DERIVATIVE_SERVICE_V2 = 'derivativeV2';
    endp.ENDPOINT_API_MODEL_DERIVATIVE_V2 = 'modelDerivativeV2';

    var _apis_data = {
        derivativeV2:  {
            baseURL: '/derivativeservice/v2',
            itemURL: '/derivativeservice/v2/derivatives/:derivativeurn',
            manifestURL: '/derivativeservice/v2/manifest/:urn',
            thumbnailsURL: '/derivativeservice/v2/thumbnails/:urn'
        },
        modelDerivativeV2: {
            baseURL: '/modelderivative/v2/',
            itemURL: '/modelderivative/v2/designdata/:urn/manifest/:derivativeurn',
            manifestURL: '/modelderivative/v2/designdata/:urn/manifest',
            thumbnailsURL: '/modelderivative/v2/designdata/:urn/thumbnail'
        }
    };

    var _endpoint = '';
    var _api = endp.ENDPOINT_API_DERIVATIVE_SERVICE_V2;
    var _useCredentials = false;

    endp.HTTP_REQUEST_HEADERS = {};

    /**
     * Sets the endpoint and api to be used to create REST API request strings.
     * @param {string} endpoint
     * @param {string} [api] - Possible values are derivativeV2, modelDerivativeV2
     */
    endp.setEndpointAndApi = function(endpoint, api) {
        _endpoint = endpoint;
        if (api) {
            _api = api;
        }
    };

    /**
     * Returns the endpoint plus the api used to create REST API request strings.
     * Example: "developer.api.autodesk.com/modelderivative/v2"
     * @returns {string}
     */
    endp.getEndpointAndApi = function() {
        return _endpoint + _apis_data[_api].baseURL;
    };

    /**
     * Returns the endpoint used to create REST API request strings.
     * Examples: "developer.api.autodesk.com"
     * @returns {string}
     */
    endp.getApiEndpoint = function() {
        return _endpoint;
    };

    /**
     * Returns a REST API request strings to be used to get the manifest of the provided urn.
     * Example: "developer.api.autodesk.com/modelderivative/v2/designdata/:urn/manifest"
     * @param {string | null} endpoint - When provided is used instead of the globally set endpoint.
     * @param {string} urn
     * @param {string} api - When provided is used instead of the globally set API flavor
     * @returns {string}
     */
    endp.getManifestApi = function(endpoint, urn, api) {
        var url = (endpoint || _endpoint);
        api = api || _api;
        url += _apis_data[api].manifestURL;
        // If urn is not provided we return same string that before for backward compatibility.
        urn = urn || '';
        url = url.replace(':urn', urn);
        return url;
    };

    /**
     * Returns a REST API request strings to be used to get a derivative urn.
     * Example: "developer.api.autodesk.com/modelderivative/v2/designdata/:urn/manifest/:derivativeUrn"
     * @param {string | null} endpoint - When provided is used instead of the globally set API endpoint.
     * @param {string} derivativeUrn
     * @param {string} api - When provided is used instead of the globally set API flavor
     * @returns {string}
     */
    endp.getItemApi = function(endpoint, derivativeUrn, api) {
        var itemApi = (endpoint || _endpoint) + _apis_data[api || _api].itemURL;

        // If urn is not provided we return same string that before for backward compatibility.
        derivativeUrn = derivativeUrn || '';

        // Extract svf urn from item urn, needed when using model derivative.
        var urn = derivativeUrn;
        urn = urn.split('/');
        urn = urn[0] || '';
        urn = urn.split(':');
        urn = urn[urn.length-1] || '';

        itemApi = itemApi.replace(':urn', urn);
        itemApi = itemApi.replace(':derivativeurn', derivativeUrn);

        return itemApi;
    };

    /**
     * Returns a REST API request strings to be used to get the thumbnail for a specific urn.
     * Example: "developer.api.autodesk.com/modelderivative/v2/designdata/:urn/thumbnail"
     * @param {string | null} endpoint - When provided is used instead of the globally set endpoint.
     * @param {string} urn
     * @param {string} api - When provided is used instead of the globally set API flavor
     * @returns {string}
     */
    endp.getThumbnailApi = function(endpoint, urn, api) {
        var thumbnailApi = (endpoint || _endpoint) + _apis_data[api || _api].thumbnailsURL;
        return thumbnailApi.replace(':urn', urn || '');
    };

    endp.makeOssPath = function(root, bucket, object) {
        return (root || _endpoint) + "/oss/v2/buckets/" + bucket + "/objects/" + encodeURIComponent(decodeURIComponent(object));
    };

    endp.getUseCredentials = function() {
        return _useCredentials;
    };

    endp.pathRequiresCredentials = function(path) {
        return path.indexOf('://') === -1 ||                    // Is it a URN?
               path.indexOf(this.getEndpointAndApi()) === 0;    // Is it Forge/Proxy?
    };

    endp.getDomainParam = function() {
        return (this.getUseCredentials() && !av.isNodeJS) ? ("domain=" + encodeURIComponent(window.location.origin)) : "";
    };

    endp.setUseCredentials = function(useCredentials) {
        _useCredentials = useCredentials;
    };

})();


(function() {

"use strict";

var av = Autodesk.Viewing,
    endp = av.endpoint = av.endpoint || {},
    avp = av.Private;

    var global = av.getGlobal();

    endp.PROTEIN_ROOT = null;
    endp.PRISM_ROOT = null;
    global.LOCALIZATION_REL_PATH = "";
    global.LMV_VIEWER_VERSION = "3.3";  // Gets replaced with content from deployment/package.json
    global.LMV_VIEWER_PATCH = "5";// Gets replaced with build number from TeamCity
    global.LMV_BUILD_TYPE = "Production"; // Either Development or Release/RELEASE
    global.LMV_RESOURCE_VERSION = null;
    global.LMV_RESOURCE_ROOT = "";

    if (LMV_VIEWER_VERSION.charAt(0) === 'v'){
        // remove prefixed 'v'
        // Required due to TeamCity build pipeline (LMV-1361)
        LMV_VIEWER_VERSION = LMV_VIEWER_VERSION.substr(1);
    }


    global.stderr = function() {
        console.warn('"stderr" is deprecated; please use "Autodesk.Viewing.Private.logger" instead');
    };

    avp.env = null;
    // GUID of the current active document item.
    avp.docItemId = null;

    avp.token = {
        accessToken : null,
        getAccessToken : null,
        tokenRefreshInterval : null
    };

    // A list of resources that record the URL and necessary auxilary information (such as ACM headers and / or
    // session id) required to get the resource. This bag of collection will be passed from JS to native code so
    // all viewer consumable resources could be downloaded on native side for offline viewing.
    // avp.assets = isAndroidDevice() ? [] : null;
    avp.assets = [];
    // Set viewer in offline mode if set to true. In offline mode, viewer would ignore all URNs in bubble JSON
    // and assume the viewables are laid out in local file system path relative to the bubble.json.
    avp.offline = false;
    // Offline resource prefix specified by viewer consumer (e.g. IOS web view). Used as prefix to concatenate with
    // each resource relative path to form the absolute path of each resource.
    avp.offlineResourcePrefix = null;

    var LmvEndpoints = {
        local: {
            RTC:        ['https://rtc-dev.api.autodesk.com:443', 'https://lmv.autodesk.com:443'] //port # is required here.
        },
        dev: {
            RTC:        ['https://rtc-dev.api.autodesk.com:443', 'https://lmv.autodesk.com:443']
        },
        stg: {
            RTC:        ['https://rtc-stg.api.autodesk.com:443', 'https://lmv.autodesk.com:443']
        },
        prod: {
            RTC:        ['https://rtc.api.autodesk.com:443', 'https://lmv.autodesk.com:443']
        }
    };

    var DevApiUrls = {
        local: "",
        dev: "https://developer-dev.api.autodesk.com",
        stg: "https://developer-stg.api.autodesk.com",
        prod: "https://developer.api.autodesk.com"
    };

    // The apps on https://developer.autodesk.com had to be created under an ADS account... Ask for brozp
    var AdpConfigs = {
        stg: { CLIENT_ID: 'lmv-stag', CLIENT_KEY: 'kjemi1rwAgsqIqyvDUtc9etPD6MsAzbV', ENDPOINT: 'https://ase-stg.autodesk.com' },
        prod: { CLIENT_ID: 'lmv-prod', CLIENT_KEY: 'iaoUM2CRGydfn703yfPq4MAogZi8I5u4', ENDPOINT: 'https://ase.autodesk.com' }
    };

    avp.EnvironmentConfigurations = {
        Local: {
            ROOT:       '',
            LMV:        LmvEndpoints["local"]
        },
        Development: {
            ROOT:       DevApiUrls["dev"],
            LMV:        LmvEndpoints["dev"],
            bubbleManifest: true
        },
        Staging: {
            ROOT:       DevApiUrls["stg"],
            LMV:        LmvEndpoints["stg"],
            bubbleManifest: true
        },
        Production: {
            ROOT:       DevApiUrls["prod"],
            LMV:        LmvEndpoints["prod"],
            bubbleManifest: true
        },
        AutodeskDevelopment: {
            ROOT:       DevApiUrls["dev"],
            LMV:        LmvEndpoints["dev"]
        },
        AutodeskStaging: {
            ROOT:       DevApiUrls["stg"],
            LMV:        LmvEndpoints["stg"]
        },
        AutodeskProduction: {
            ROOT:       DevApiUrls["prod"],
            LMV:        LmvEndpoints["prod"]
        }
    };


    avp.initializeEnvironmentVariable = function (options) {
        var env;

        // Use the enviroment that was explicitly specified.
        //
        if (options && options.env) {
            env = options.env;
        }

        // If not available, check if the environment was specified in the query parameters.
        //
        if (!env) {
            env = avp.getParameterByName("env");
        }

        if (options && options.offlineResourcePrefix) {
            avp.offlineResourcePrefix = options.offlineResourcePrefix;
        }

        if (options && options.offline && options.offline === "true") {
            avp.offline = true;
        }

        // If still not available, try to resolve the environment based on the url.
        //
        if (!env) {
            switch (window.location.hostname) {
                case "developer-dev.api.autodesk.com" :
                    env = 'AutodeskDevelopment';
                    break;
                case "developer-stg.api.autodesk.com" :
                    env = 'AutodeskStaging';
                    break;
                case "developer.api.autodesk.com" :
                    env = 'AutodeskProduction';
                    break;

                case "localhost.autodesk.com" :
                    env = 'Local';
                    break;
                case "" : // IP addresses on Chrome.
                    env = 'Local';
                    break;
                case "127.0.0.1" :
                    env = 'Local';
                    break;
                default:
                    env = 'AutodeskProduction';
            }
        }

        avp.env = env;

        if (typeof window !== "undefined") {
            avp.logger.info("Host name : " + window.location.hostname);
        }
        avp.logger.info("Environment initialized as : " + env);
    };

    avp.initializeServiceEndPoints = function (options) {

        // Get endpoint.
        var endpoint = options.endpoint;
        if (!endpoint) {
            var config = avp.EnvironmentConfigurations[avp.env];
            endpoint = config['ROOT'];
        }

        // Get endpoint api.
        var api = options.api || av.endpoint.ENDPOINT_API_DERIVATIVE_SERVICE_V2;

        av.endpoint.setEndpointAndApi(endpoint, api);

        if (av.isNodeJS)
            return;

        //Derive the root for static viewer resources based on the
        //location of the main viewer script
        var libList = [
            "viewer3D.js",
            "viewer3D.min.js",
            "firefly.js",
            "firefly.min.js"
        ];
        if (options && options.hasOwnProperty('libraryName'))
            libList.push(options.libraryName);

        var root;
        var scriptUrl;

        // TODO_NOP: this doesn't work for Polymer / Web Components
        for (var i=0; i<libList.length; i++) {
            var script = avp.getScript(libList[i]);
            scriptUrl = script ? script.src : "";
            var idx = scriptUrl.indexOf(libList[i]);
            if (idx >= 0) {
                root = scriptUrl.substr(0, idx);
                break;
            }
        }

        //Derive any custom version request
        LMV_RESOURCE_VERSION = "v" + LMV_VIEWER_VERSION;

        var version = avp.getParameterByNameFromPath("v", scriptUrl);
        if (version && version.length && version != LMV_RESOURCE_VERSION) {
            avp.logger.warn("Version string mismatch between requested and actual version: " + version + " vs. " + LMV_RESOURCE_VERSION + ". Using " + version);
            LMV_RESOURCE_VERSION = version;
        } else if (!version || !version.length) {
            LMV_RESOURCE_VERSION = null;
            avp.logger.info("No viewer version specified, will implicitly use " + LMV_VIEWER_VERSION);
        }

        LMV_RESOURCE_ROOT = root || LMV_RESOURCE_ROOT;
    };

    avp.initLoadContext = function(inputObj) {

        inputObj = inputObj || {};

        inputObj.auth = av.endpoint.getUseCredentials();
        inputObj.endpoint = av.endpoint.getApiEndpoint();

        if (!inputObj.headers)
            inputObj.headers = {};

        var endp = av.endpoint;
        for (var p in endp.HTTP_REQUEST_HEADERS) {
            inputObj.headers[p] = endp.HTTP_REQUEST_HEADERS[p];
        }

        //This is done to avoid CORS errors on content served from proxy or browser cache
        //The cache will respond with a previously received response, but the Access-Control-Allow-Origin
        //response header might not match the current Origin header (e.g. localhost vs. developer.api.autodesk.com)
        //which will cause a CORS error on the second request for the same resource.
        var domainParam = av.endpoint.getDomainParam();
        if (domainParam) {
            if (inputObj.queryParams) {
                inputObj.queryParams += "&" + domainParam;
            } else {
                inputObj.queryParams = domainParam;
            }
        }


        return inputObj;
    };
  
    // Refresh the token in request header, in case that the third party cookie is disabled
    avp.refreshRequestHeader = function(token) {

        av.endpoint.HTTP_REQUEST_HEADERS["Authorization"] = "Bearer " + token;

    };

    avp.refreshToken = function(token, onSuccess, onError) {

        // Store the token
        avp.token.accessToken = token;        
        avp.refreshRequestHeader(token);

        if (onSuccess instanceof Function) {
            onSuccess();
        }
    };

    avp.initializeAuth = function (onSuccessCallback, options) {

        var shouldInitializeAuth = options ? options.shouldInitializeAuth : undefined;
        if (shouldInitializeAuth === undefined) {
            var p = avp.getParameterByName("auth");
            shouldInitializeAuth = (p.toLowerCase() !== "false");
        }

        //Skip Auth in case we are serving the viewer locally
        if (avp.env == "Local" || !shouldInitializeAuth) {
            setTimeout(onSuccessCallback, 0);
            av.endpoint.setUseCredentials((typeof options.useCredentials !== "undefined") ? options.useCredentials : false);
            return av.endpoint.getUseCredentials();
        }

        av.endpoint.setUseCredentials((typeof options.useCredentials !== "undefined") ? options.useCredentials : true);

        var accessToken;

        function onGetAccessToken(token /* access token value. */, expire /* expire time, in seconds. */) {
            accessToken = token;
            avp.refreshToken(accessToken, avp.token.tokenRefreshInterval ? null /* If this is a token refresh call,
             don't invoke the onSuccessCallback which will loadDocument and so on. */
                : onSuccessCallback);
            var interval = expire - 60; // Refresh 1 minute before token expire.
            if (interval <= 0) {
                // We can't get a precise upper bound if the token is such a short lived one (expire in a minute),
                // so just use the original one.
                interval = expire;
            }
            avp.token.tokenRefreshInterval = interval * 1000;
            setTimeout(function() {options.getAccessToken(onGetAccessToken)}, avp.token.tokenRefreshInterval);
        }

        if (options && options.getAccessToken) {
            avp.token.getAccessToken = options.getAccessToken;

            accessToken = options.getAccessToken(onGetAccessToken);

            //Backwards compatibility with the old synchronous API
            if (typeof accessToken === "string" && accessToken) {
                avp.refreshToken(accessToken, onSuccessCallback);
            }

        } else if (options && options.accessToken) {
            accessToken = options.accessToken;
            avp.refreshToken(accessToken, onSuccessCallback);
        } else {
            accessToken = avp.getParameterByName("accessToken");
            if (!accessToken) {
                accessToken = "9AMaRKBoPCIBy61JmQ8OLLLyRblS";
                avp.logger.warn("Warning : no access token is provided. Use built in token : " + accessToken);
            }
            avp.refreshToken(accessToken, onSuccessCallback);
        }

        //TODO: this seems like a pointless thing to return
        return av.endpoint.getUseCredentials();
    };

    avp.initializeLogger = function (options) {

        avp.logger.initialize(options);

        // ADP is opt-out
        if (options && options.hasOwnProperty('useADP') && options.useADP == false) {
            return;
        }
        //Also bail on ADP if we are a node module
        if (av.isNodeJS)
            return;

        // Load Autodesk Data Platform client
        // (and if we're in RequireJS environment, use its APIs to avoid problems)
        var url = 'https://ase-cdn.autodesk.com/adp/v1.0.3/js/adp-web-analytics-sdk.min.js';
        var callback = function() {
            if (typeof (Adp) === 'undefined') {
                avp.logger.warn('Autodesk Data Platform SDK not found');
                return;
            }

            var adpConfig;
            switch (LMV_BUILD_TYPE) {
                case 'Production': adpConfig = AdpConfigs['prod']; break;
                default: adpConfig = AdpConfigs['stg']; break;
            }
            var facets = {
                product: {
                    name: 'LMV',
                    line_name: 'LMV',
                    key: adpConfig.CLIENT_ID,
                    id: adpConfig.CLIENT_KEY,
                    id_provider: 'appkey',
                    build_id: LMV_VIEWER_VERSION + '.' + LMV_VIEWER_PATCH,
                    build_tag: LMV_BUILD_TYPE
                }
            };
            var config = {
                server: adpConfig.ENDPOINT,
                enable_geo_data: false,
                enable_browser_data: true,
                enable_session_messages: true
            };
            avp.logger.adp = new Adp(facets, config);
        };

        if (typeof require === 'function') {
            require([url], function(adp) {
                window.Adp = adp;
                callback();
            });
        } else {
            avp.loadDependency('Adp', url, callback);
        }

    };

    avp.initializeProtein = function () {

        //For local work, don't redirect texture requests to the CDN,
        //because local ones will load much faster, presumably.
        if (avp.ENABLE_DEBUG && avp.env == "Local" && !av.endpoint.getUseCredentials() /* when auth is true, the viewer is operating under
        local mode but connect to remote server to get data. */)
            return;

        // In offline mode, viewer will get the texture from the locally cached SVF data sets, instead pinging texture
        // CDN.
        // TODO: this will break when translators stop including Protein into SVF.
        if (avp.offline) {
            return;
        }

        var xhr1 = new XMLHttpRequest();
        xhr1.open("GET", "https://raas-assets.autodesk.com/StaticContent/BaseAddress?family=protein", true);
        xhr1.responseType = "json";

        xhr1.onload = function (e) {
            var res = xhr1.response.url;
            if (res && res.length) {
                res = res.replace("http://", "https://");
                av.endpoint.PROTEIN_ROOT = res + "/";
                avp.logger.info("Protein root is: " + av.endpoint.PROTEIN_ROOT);
            }
        };

        xhr1.send();

        var xhr2 = new XMLHttpRequest();
        xhr2.open("GET", "https://raas-assets.autodesk.com/StaticContent/BaseAddress?family=prism", true);
        xhr2.responseType = "json";

        xhr2.onload = function (e) {
            var res = xhr2.response.url;
            if (res && res.length) {
                res = res.replace("http://", "https://");
                av.endpoint.PRISM_ROOT = res + "/";
                avp.logger.info("Prism root is: " + av.endpoint.PRISM_ROOT);
            }
        };

        //xhr.onerror = ;
        //xhr.ontimeout = ;

        xhr2.send();
    };

// Returns the query parameter value from window url
    avp.getParameterByName = function (name) {
        if (typeof window === "undefined") {
            return "";
        }
        return avp.getParameterByNameFromPath(name, window.location.href);
    };

// return value of parameter from a url
    avp.getParameterByNameFromPath = function (name, url) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        if (results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    };

// Return a default document URN for demo purpose.
    avp.getDemoDocumentURN = function () {
        var documentId;

        switch (avp.env) {
            case "Development" :
                //documentId = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Y29sdW1idXMvTWljaGFlbF9IYW5kLV8tYjE0MDk3ODQxNzcwMDZSQ0Nhci5kd2Y";
                documentId = "urn:dXJuOmFkc2suYTM2MGJldGFkZXY6ZnMuZmlsZTplbnRlcnByaXNlLmxtdnRlc3QuRFM1YTczMFFUYmYwMDIyZDA3NTFhYmE5MjZlZDZkMjJlZDY0P3ZlcnNpb249MQ==";
                break;
            case "Staging" :
                documentId = "urn:dXJuOmFkc2suczM6ZGVyaXZlZC5maWxlOlZpZXdpbmdTZXJ2aWNlVGVzdEFwcC91c2Vycy9NaWNoYWVsX0hhbicvTU0zNTAwQXNzZW1ibHkuZHdm";
                break;
            case "Production" :
                documentId = "FIXME";
                break;
            default:
                //documentId = "urn:dXJuOmFkc2suczM6ZGVyaXZlZC5maWxlOlZpZXdpbmdTZXJ2aWNlVGVzdEFwcC91c2Vycy9NaWNoYWVsX0hhbmAvUkMgQ2FyLmR3Zg"
                documentId = "https://lmv.rocks/viewer/data/gears/output/bubble.json";
        }

        return documentId;
    };

    /**
     * Normalizes memory options passed into the viewer instance or stated in the URL
     * The URL parameter to check is `viewermemory` and has a number value that represents
     * the MegaByte memory limit.
     * @example: 
     *      ?viewermemory=500 ----- set memory limit of 500 MB
     *      ?viewermemory=500f ---- force memory limit of 500 MB, which activates on-demand-loading mechanism (debug). 
     * @private
     */
    avp.processMemoryOptions = function(config3d) {
        
        if (!config3d)
            return;

        var memLimit;
        // Verify memory values are valid/consistant
        if (config3d.memory) {
            memLimit = parseInt(config3d.memory.limit) | 0;
            var forced = (config3d.memory.debug && config3d.memory.debug.force) || false;
            if (forced && memLimit <= 0) {
                config3d.memory.force = false; // disable forced when the limit is not valid.
                avp.logger.warn('config.memory.limit value is invalid: (' + config3d.memory.limit + ')');
            }
        }

        // If URL argument is passed in, override limit specified through code
        var urlValue = avp.getParameterByName('viewermemory');
        memLimit = parseInt(urlValue);
        // If urlValue isn't a number, memLimit will be a NaN and comparison will fail.
        if (memLimit >= 0) {
            // Now, truncate memLimit to an integer.
            memLimit = memLimit | 0;
            // Only allow forced when memLimit > 0, memLimit == 0 disables the limit.
            var isForced = memLimit > 0 && urlValue.charAt(urlValue.length-1).toLowerCase() === 'f'; // Check if there is an F at the end.
            config3d.memory = { 
                limit: memLimit,
                debug: { force: isForced }
             };
            if (isForced) {
                avp.logger.info('Forcing memory limit to URL param: (' + memLimit + ' MegaBytes).');
            } else {
                avp.logger.info('Setting memory limit to URL param: (' + memLimit + ' MegaBytes).');
            }
        } else {
			// don't issue warning if viewermemory parameter (e.g., "&viewermemory=500") is not in URL at all
			if ( urlValue !== "" )
				avp.logger.warn('Invalid viewermemory URL param value: (' + urlValue + ')');
        }
    };

    avp.setLanguage = function (language, callback) {

        var options = {
            lng: language,
            resGetPath: 'res/locales/__lng__/__ns__.json',
            ns: {
                namespaces: ['allstrings'],
                defaultNs: 'allstrings'
            },
            fallbackLng: "en",
            debug: false
        };

        LOCALIZATION_REL_PATH = "res/locales/" + language + "/";
        Autodesk.Viewing.i18n.init(options, function (t) {
            Autodesk.Viewing.i18n.clearDebugLocString(); //Calls localize as well
            if (callback) {
                callback();
            }
        });
    };

    avp.extendLocalization = function (locales) {
        if (locales !== null && typeof locales === "object") {
            Object.keys(locales).forEach(function(language) {
                Autodesk.Viewing.i18n.addResourceBundle(
                    language,
                    "allstrings",
                    locales[language],
                    true,
                    true
                );
            });
            return true;
        }
        return false;
    };

    avp.initializeLocalization = function (options) {
        // Initialize language for localization. The corresponding string files
        // will be downloaded.
        var language = (options && options.language) || navigator.language;

        // use iso scheme (ab/ab-XY)
        var tags = language.split('-');
        language = tags.length > 1 ? tags[0].toLowerCase() + '-' + tags[1].toUpperCase() : tags[0].toLowerCase();

        // check supported language tags and subtags
        var supportedTags = ["cs", "de", "en", "es", "fr", "it", "nl", "ja", "ko", "pl", "pt-BR", "ru", "tr", "zh-HANS", "zh-HANT"];
        if (supportedTags.indexOf(language) === -1) {
            if (language.indexOf("zh-CN") > -1) language = "zh-HANS";
            else if (language.indexOf("zh-TW") > -1) language = "zh-HANT";
            else if (tags.length > 1 && supportedTags.indexOf(tags[0]) > -1) language = tags[0];
            else language = "en";
        }

        // Uncomment below to default to english
        //language = "en";
        avp.setLanguage(language);
    };

    avp.initializeUserInfo = function (options) {
        if (!options || !options.userInfo) return;
        avp.setUserName(options.userInfo.name);
        if (options.comment2Token) {
            avp.comment2Token = options.comment2Token;
        }
    };


// TODO:  This is here for now, until we find a better place for it.
//
    /**
     * Returns the first source url found containing the given script name.
     * @private
     * @param {string} scriptName - Script name.
     * @returns {HTMLScriptElement} The script element whose source location matches the input parameter.
     */
    avp.getScript = function (scriptName) {
        scriptName = scriptName.toLowerCase();
        var scripts = document.getElementsByTagName('SCRIPT');
        if (scripts && scripts.length > 0) {
            for (var i = 0; i < scripts.length; ++i) {
                if (scripts[i].src && scripts[i].src.toLowerCase().indexOf(scriptName) !== -1) {
                    return scripts[i];
                }
            }
        }
        return null;
    };

    /**
     * Returns the full url of a resource with version.
     * The version will be determined from the LMV_VIEWER_VERSION variable.
     * @private
     * @param {string} resourceRelativePath - The path of the resource relative to LMV_RESOURCE_ROOT.
     * @returns {string} The full resource path.
     */
    avp.getResourceUrl = function (resourceRelativePath) {
        var version = LMV_RESOURCE_VERSION;
        return LMV_RESOURCE_ROOT + resourceRelativePath + (version ? ('?v=' + version) : '');
    };

    /**
     * @param {string} libNamespace - window property name expected to be loaded after library is on the document if it contains '://' will be use to resolve the url insted of libName.
     * @param {string} libName - url to load the library from.
     * @param {function} callback - success callback function
     * @param {function} onError - error callback function
     * @param {string} amdName - Should be the name module defined on the define function.
     * @description  Loads a script (e.g. an external library JS) and calls the callback once loaded. Used for delayed loading of required libraries. Accepts both relative and absolute URLs.
     */
    avp.loadDependency = function(libNamespace, libName, callback, onError, amdName) {
        if (typeof window[libNamespace] === "undefined") {
            var s = document.createElement("SCRIPT");
            s.src = libName.indexOf('://') > 0 ? libName : avp.getResourceUrl(libName);
            var clearCallbacks = function() {
                s.onerror = null;
                s.onload = null;
            };
            var errCallback = function() {
                clearCallbacks();
                onError && onError();
            };
            var successCallback = function() {
                clearCallbacks();
                //if there is a dependency which use amd and we are running on amd environment we load it through require
                if(typeof define === 'function' && define.amd && typeof require === 'function' && amdName) {
                    require([amdName], function(moduleDefinition) {
                        window[libNamespace] = moduleDefinition;
                        callback && callback();
                    }, errCallback);
                } else {
                    callback &&  callback();
                }
            };
            s.onload = successCallback;
            s.onerror = errCallback;
            document.head.appendChild(s);
        }
        else if (callback)
            callback();
    };

    /**
     * Inject a css file into the page. 
     * There's a callback if you need to know when it gets downloaded (rare).
     * Accepts both relative and absolute URLs.
     */
    avp.injectCSS = function(cssUrl, callback, onError) {
        var href = cssUrl.indexOf('://') > 0 ? cssUrl : avp.getResourceUrl(cssUrl);

        // Verify that we haven't downloaded it already
        var results = document.getElementsByTagName('link');
        for (var i=0, len=results.length; i<len; i++) {
            if (results[i].href === href) {
                // Already downloaded
                callback && callback();
                return;
            }
        }

        // else, download it
        var s = document.createElement("link");
        s.setAttribute('rel',"stylesheet");
        s.setAttribute('type',"text/css");
        s.setAttribute('href', href);
        if (callback) {
            s.onload = callback;
        }
        if (onError) {
            s.onerror = onError;
        }
        document.head.appendChild(s);
    };

    /**
     * Download an HTML template. 
     * If successful, will invoke callback(null, templateString)
     * If failure, will invoke callback("some error", null)
     */
    avp.getHtmlTemplate = function(templateUrl, callback) {
        var href = templateUrl.indexOf('://') > 0 ? templateUrl : avp.getResourceUrl(templateUrl);
        var request = new XMLHttpRequest();
        request.onload = requestLoad;
        request.onerror = requestError;
        request.ontimeout = requestError;
        request.open('GET', href, true);
        request.send();

        function requestError(err) {
            callback(err, null);
        }
        function requestLoad(event) {
            var content = event.currentTarget.responseText;
            callback(null, content);
        }
        
    };

    /**
     * @typedef {Object} InitOptions
     * @property {string} env 
     *          Can be "AutodeskProduction" (default), "AutodeskStaging", or "AutodeskDevelopment".
     * @property {string} api
     *          Can be undefined (default), "derivativeV2", or "modelDerivativeV2".
     * @property {function} getAccessToken
     *          A function that provides an access token asynchronously.
     *          The function signature is `getAccessToken(onSuccess)`, where onSuccess is a callback that getAccessToken
     *          function should invoke when a token is granted, with the token being the first input parameter for the
     *          onSuccess function, and the token expire time (in seconds) being the second input parameter for the
     *          function. Viewer relies on both getAccessToken and the expire time to automatically renew token, so
     *          it is critical that getAccessToken must be implemented as described here.
     * @property {string} language
     *          Preferred language code as defined in RFC 4646, such as "en", "de", "fr", etc.
     *          If no language is set, viewer will pick it up from the browser. If language is not as defined in RFC,
     *          viewer will fall back to "en" but the behavior is undefined.
     * @property {number} logLevel
     *          Specifies which types of messages will be logged into the console. 
     *          Values are: 5 Debug, 4 Logs, 3 Info, 2 Warnings, 1 Errors, 0 None.
     *          Defaults to (1) for Errors only.
     *          All values can be found in Autodesk.Viewing.Private.LogLevels.
     * @property {string} webGLHelpLink
     *          A link url to a help page on webGL if it's disabled. Supported only
     *          when using the GuiViewer3D instance; not supported in headless mode.
     */


    /**
     * Returns a new object that can be passed to Autodesk.Viewing.Initializer() for
     * initialization. Developers should consider customizing attributes in this object
     * before passing it to Autodesk.Viewing.Initializer().
     * 
     * Available since version 2.13
     * 
     * @returns {InitOptions} Can be passed into Autodesk.Viewing.Initializer()
     * 
     * @example
     *  var options = Autodesk.Viewing.createInitializerOptions();
     *  options.getAccessToken = function(onSuccess) {
     *      var accessToken, expire;
     *      // Code to retrieve and assign token value to
     *      // accessToken and expire time in seconds.
     *      onSuccess(accessToken, expire);
     *  };
     *  Autodesk.Viewing.Initializer(options, function() {
     *      alert("initialization complete");
     *  });
     * 
     * 
     * @category Core
     */
    Autodesk.Viewing.createInitializerOptions = function() {

        // Attributes fully supported
        // See @typedef {Object} InitOptions above for details on each one of these...
        var opts = {  
            env: 'AutodeskProduction',
            // TODO: Use commented api when we deprecate useDerivativeServiceV2 flag and old endpoints.js.
            api: undefined /*av.endpoint.ENDPOINT_API_DERIVATIVE_SERVICE_V2*/,
            getAccessToken: undefined,
            language: undefined,
            logLevel: avp.LogLevels.ERROR,
            webGLHelpLink: null
        };

        // Attributes that exist, but we don't fully support (yet)
        // opts.offline: false,
        // opts.offlineResourcePrefix: 'data'

        return opts;
    };

    /**
     * @typedef {Object} ViewerConfig
     * @property {array} extensions 
     *          Ids of extensions that need to be loaded always.
     * @property {string} sharedPropertyDbPath
     *          Some documents have a global Property Database file, which is shared across all
     *          referenced 2D and 3D models. Use Document.getPropertyDbPath() to populate this field;
     *          automatically populated when using a ViewingApplication instance.
     * @property {Object} canvasConfig
     *          Allows to modify the default user input interactions with the viewer. For example, one
     *          could change the left-mouse click to isolate a node instead of selecting it.
     * @property {boolean} startOnInitialize
     *          True by default, whether viewer.run() gets invoked as soon as initialization is complete,
     *          effectively commencing the viewer's main rendering loop. 
     * @property {array} experimental
     *          An interface to enable experimental features that are yet to be released.
     *          Each feature is identified with a string. To enable a feature, remove the first two double dashes.
     */

    /**
     * Returns a new object that can be passed to a Viewer instance when created.
     * 
     * Available since version 2.13
     * 
     * @returns {ViewerConfig} 
     *          Can be passed into a ViewingApplication's registerViewer() 3rd parameter,
     *          or directly when constructing a Viewer instance.
     * 
     * @example
     * var myConfig = Autodesk.Viewing.createViewerConfig();
     * myConfig.extensions.push('MyAwesomeExtension');
     * //
     * // Direct usage...
     * var myViewer = new Autodesk.Viewing.Viewer3D( myDiv, myConfig );
     * //
     * // ...or through a ViewingApplication
     * viewerApp = new Autodesk.Viewing.ViewingApplication('MyViewerDiv');
     * viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D, myConfig);
     * 
     * 
     * @category Core
     */
    Autodesk.Viewing.createViewerConfig = function() {

        // Global Viewer configuration values
        var config = {

            extensions: [],
            // useConsolidation: false, // 100 MB -- Needs work before exposing (here or elsewhere)
            // consolidationMemoryLimit: 100 * 1024 * 1024, // 100 MB -- Needs work before exposing (here or elsewhere)
            sharedPropertyDbPath: undefined,
            // bubbleNode: undefined, -- Needs work before exposing here.
            canvasConfig: undefined, // TODO: Needs documentation or something.
            startOnInitialize: true,

            // Enables experimental, non-supported features
            experimental: []
        };

        // Ask each extension to register their default options
        Autodesk.Viewing.theExtensionManager.popuplateOptions(config);

        // Also ask the bundled viewers
        av.Viewer3D && av.Viewer3D.populateConfigOptions(config);
        avp.GuiViewer3D && avp.GuiViewer3D.populateConfigOptions(config);

        return config;
    };

    /**
     * Checks whether an experimental flag has been set into the viewer's' `config` 
     * object, which happens to be the same as the extension's `options` object. 
     * @private
     */
    avp.isExperimentalFlagEnabled = function(flagName, config3d) {
        if (!config3d || !Array.isArray(config3d.experimental))
            return false;
        return config3d.experimental.indexOf(flagName) !== -1;
    };


    /**
     * Helper class for initializing the viewer runtime.
     *
     * Includes:
     *  - End points of cloud services the viewer uses, like viewing service and search service.
     *  - Authentication and authorization cookie settings on the client side.
     *  - Misc runtime environment variables and viewer configurations parameters.
     *
     * @constructor
     * @param {object} options - The options object contains configuration parameters used to do initializations. If no
     * access token or authentication callback is provided, the Initializer will fall back
     * on an access token provided in the URL query string, or a previous access token stored in
     * the cookie cache, if available. The static function Autodesk.Viewing.createInitializerOptions() can be used to create
     * an object with all the supported attributes.
     * @param {string} [options.env] - Can be "Development", "Staging" or "Production", for viewers running without PAAS
     * endpoints. Can be "AutodeskDevelopment", "AutodeskStaging", or "AutodeskProduction"
     * for viewers running with PAAS endpoints.
     * @param {function} [options.getAccessToken] - An function that provides an access token asynchronously.
     * The function signature is `getAccessToken(onSuccess)`, where onSuccess is a callback that getAccessToken
     * function should invoke when a token is granted, with the token being the first input parameter for the
     * onSuccess function, and the token expire time (in seconds) being the second input parameter for the
     * function. Viewer relies on both getAccessToken and the expire time to automatically renew token, so
     * it is critical that getAccessToken must be implemented as described here.
     * @param {boolean} [options.useADP] - Whether to report analytics to ADP. True by default.
     * @param {string} [options.accessToken] - An access token.
     * @param {string} [options.webGLHelpLink] - A link to a help page on webGL if it's disabled.
     * @param {string} [options.language] - Preferred language code as defined in RFC 4646, such as "en", "de", "fr", etc.
     * If no language is set, viewer will pick it up from the browser. If language is not as defined in RFC,
     * viewer will fall back to "en" but the behavior is undefined.
     * @param {function} callback - A method the client executes when initialization is finished.
     * @example
     *  var options = {
     *     env: "AutodeskProduction",
     *     language: "en",
     *     webGLHelpLink: "http://my.webgl.help.link",
     *     getAccessToken: function(onSuccess) {
     *         var accessToken, expire;
     *         // Code to retrieve and assign token value to
     *         // accessToken and expire time in seconds.
     *         onSuccess(accessToken, expire);
     *     }
     *  };
     *  var callback = function() {
     *     alert("initialization complete");
     *  };
     *  Autodesk.Viewing.Initializer(options, callback);
     * @category Core
     */
    Autodesk.Viewing.Initializer = function (options, callback) {

        function init() {
            avp.initializeLegacyNamespaces(false);

            //Kick off a request for the web worker script, so it loads in parallel with three.js
            avp.initWorkerScript();

            //Temporarily silence THREE.warn due to new builds of Chrome producing oodles of shader compile warnings.
            THREE.warn = avp.logger.warn.bind(avp.logger);

            avp.initializeAuth(callback, options);
            avp.initializeLocalization(options);
            avp.initializeUserInfo(options);
        }


        if (av.isNodeJS) {

            avp.initializeEnvironmentVariable(options);
            avp.initializeServiceEndPoints(options);
            avp.initializeLogger(options);
            //avp.initializeProtein(); //TODO:NODE

            //init_three_dds_loader(); //TODO:NODE
            //init_three_pvr_loader(); //TODO:NODE
            avp.initializeAuth(callback, options);

        } else {

            avp.WEBGL_HELP_LINK = options ? options.webGLHelpLink : null;
            avp.initializeEnvironmentVariable(options);
            avp.initializeServiceEndPoints(options);
            avp.initializeLogger(options);
            // There were plans to have a common materials endpoint where shared textures are hosted.
            // However, decals (for example) or other user-assigned textures will not be found there.
            // So, we must comment this out, see https://jira.autodesk.com/browse/LMV-2726
            //avp.initializeProtein();
            avp.disableDocumentTouchSafari();

            //Load Promise (IE11), three.js & wgs.js, then continue initialization
            avp.loadDependency('Promise', 'es6-promise.min.js', function() { // Usually a no-op
                avp.loadDependency('THREE', 'three.min.js', function() {
                    avp.loadDependency('WGS', 'wgs.js', init);
                });
            }, null, 'es6-promise-polyfill');
        }
    };

})();


(function() {

    "use strict";

    var av = Autodesk.Viewing,
        avp = av.Private;

    avp.config = {
      userName : ""
    };

    avp.setUserName = function(name) {
      avp.config.userName = name;
    };

    var myio; //delay initialized pointer to socket.io library

    /** @constructor
     *
     *  MessageClient
     *  Constructs a message client object, used for server-mediate publish/subscribe
     *  message passing between connected users.
     *
     */
    function MessageClient(serverUrls, serverPath) {

        //Maps web socket commands to event types
        var MESSAGE_MAP = {
            "camera" :      "cameraChange",
            "pointer":      "pointerMove",
            "joystick" :    "joystick",
            "state" :       "viewerState",
            "txt":          "chatReceived",
            "joinok" :      "userListChange",
            "sessionId" :   "connectSucceeded",
            "joined" :      "userListChange",
            "left" :        "userListChange",
            "private" :     "privateMessage",
            "join_error":   "socketError"
        };


        var _socket;
        var _myID = null;

        var _serverURL = Array.isArray(serverUrls) ? serverUrls : [serverUrls];
        var _currentServer = 0;
        
        var _pendingJoins = {};

        var _channels = {
        };

        var _this = this;

        function getUserName() {
            if (avp.config.userName && avp.config.userName.length)
                return avp.config.userName;

            if (_myID)
                return _myID.slice(0,5);

            return "Unknown";
        }



        function onRecv(msg) {

            //See if the message requires internal processing
            switch(msg.type) {

				case "txt":     onChat(msg);
								break;

				case "joinok":  onJoinOK(msg);
								break;
								
				case "join_error": break;

				case "sessionId":
                                avp.logger.info("Connect successful, your id is: " + msg.id);
								_myID = msg.id;
								break;

				case "joined":  msg.userStatus = "joined";
                                onJoined(msg);
                                break;
                case "left":    msg.userStatus = "left";
                                onLeft(msg);
                                break;
                case "camera":
                case "pointer": break;
                default: avp.logger.log(msg);
                        break;
            }

            //Determine what channel we are receiving the event on.
            //For example, a user list change can occur on either the collaboration channel (users in current session)
            //or on the presence channel (all users logged in), and the various GUI event handlers have to make decisions based
            //on that.
            var channelId = msg.roomId;

            //And send it to all listeners
            var evt = { type: MESSAGE_MAP[msg.type], data:msg, channelId:channelId };
            _this.dispatchEvent(evt);
        }

        function onJoined(evt) {
            if (!evt.user.name || !evt.user.name.length)
                evt.user.name = evt.user.id.slice(0,5);

            if (evt.roomId) {
                var channel = _channels[evt.roomId];
                if (channel) {
                    channel.users.push(evt.user);
                    avp.logger.info(evt.user + " joined room " + evt.roomId);
                } else {
                    avp.logger.warn("Channel " + evt.roomId + " does not exist for socket " + _myID);
                }
            }
        }

        function onLeft(evt) {
            avp.logger.info(evt.user + " left room " + evt.room);
            for (var channelId in _channels) {
                var users = _channels[channelId].users;

                var idx = -1;
                for (var i=0; i<users.length; i++) {
                    if (users[i].id == evt.user) {
                        idx = i;
                        break;
                    }
                }

                if (idx != -1)
                    users.splice(idx, 1);

                delete _channels[channelId].userSet[evt.user];
            }
        }

        function onJoinOK(evt) {

            var channel = _channels[evt.roomId];

            avp.logger.info("joined channel " + evt.roomId);

            if (evt.users && evt.users.length) {
                channel.users = evt.users;
            } else {
                channel.users = [];
            }

            for (var i=0; i<channel.users.length; i++) {

                //Make up a user name if one is not known
                if (!channel.users[i].name || !channel.users[i].name.length) {
                    channel.users[i].name = channel.users[i].id.slice(0,5);
                }
            }

            var name = getUserName();
            var you = Autodesk.Viewing.i18n.translate("you");
            var me = { id:_myID, name: name + " (" + you + ")", isSelf : true, status:0 };
            if (!channel.userSet[_myID]) {
                channel.users.push(me);
                channel.userSet[_myID] = me;
            }

            //In case user name is already known, update the server.
            if (me.id.indexOf(name) != 0) {
                _this.sendChatMessage("/nick " + name, evt.roomId);
            }
        }


        function onChat(evt) {
            if (evt.msg.indexOf("/nick ") == 0) {
                var user = _this.getUserById(evt.from, evt.roomId);
                var newname = evt.msg.slice(6);

                if (newname.length) {
                    user.name = newname;
                    if (user.id == _myID) {
                        var you = Autodesk.Viewing.i18n.translate("you");
                        user.name += " (" + you + ")";
                    }
                }

                _this.dispatchEvent({ type: "userListChange", data: evt, channelId: evt.roomId });
            }
        }
        
        function onConnectError(evt) {

            //Attempt to connect to another server in case
            //the primary fails. If they all fail, then we give up.
            if (_currentServer < _serverURL.length) {
                
                avp.logger.info("Connect failed, trying another server...");
                
                _socket.disconnect();
                _socket = null;
                _currentServer++;
                _this.connect(_this.sessionID);
            
            } else {

                _this.dispatchEvent({ type: "socketError", data: evt });

            }
        }
        
        function onError(evt) {

            _this.dispatchEvent({ type: "socketError", data: evt });

        }
        
        function onConnect(evt) {
            _currentServer = 0;
            
            //Join any channels that were delayed while the
            //connection is established.
            for (var p in _pendingJoins) {
                _this.join(p);
            }
        }

        /**
         * Establish initial connection to the server specified when constructing the message client.
         */
        this.connect = function (sessionID) {

            //TODO: Maintain multiple sockets to the same server, identifier by sessionID.

            if (_socket)
                return; //already connected to socket server.

            if (typeof window.WebSocket !== "undefined") {

                if (!myio)
                    myio = (typeof lmv_io !== "undefined") ? lmv_io : io;

                this.sessionID = sessionID;

                _socket = myio.connect(_serverURL[_currentServer] + "?sessionID=" + sessionID, {path: serverPath, forceNew:true});
                _socket.on("connect", onConnect);
                _socket.on("message", onRecv);
                _socket.on("connect_error", onConnectError);
                _socket.on("error", onError);

                return true;
            }
            else {
                return false;
            }
        };

        /**
         * Subscribe to a messaging channel. Requires connection to be active (i.e. connect() called before join()).
         */
		this.join = function(channelId) {

            if (!_socket || !_socket.connected) {
                _pendingJoins[channelId] = 1;
                return;
            }
            
            delete _pendingJoins[channelId];

            _channels[channelId] = {
                    id : channelId,
                    users: [],
                    userSet: {}
                };

            _socket.emit('join', { roomId : channelId, name : getUserName() });
		};

        /**
         * Disconnect from message server.
         */
        this.disconnect = function () {
            if (_socket) {
                _socket.disconnect();
                //_socket.close();
                _socket = null;
                _channels = {};
                _myID = null;
            }
        };


        /**
         * Send a message of a specific type, containing given data object to a channel.
         * Subscription (listening) to that channel is not required.
         */
        this.sendMessage = function(type, data, channelId) {

            var evt = { type:type, from:_myID, msg: data, roomId: channelId };

            _socket.emit("message", evt);
        };

        /**
         * Send a message object to an individual user.
         */
        this.sendPrivateMessage = function(targetId, msg) {

            var evt = { type: "private", target: targetId, from:_myID, msg: msg };

            _socket.emit("message", evt);
        };

        /**
         * A convenience wrapper of sendMessage to send a simple text chat message to a channel.
         */
        this.sendChatMessage = function(msg, channelId) {

            var evt = { type:"txt", from: _myID, msg: msg, roomId: channelId };

            _socket.emit("message", evt);

            //This is done to handle /nick commands
            onRecv(evt);
        };

        /**
         * Returns the user info object for a given user on a specific channel.
         * User lists are maintained per channel.
         */
        this.getUserById = function(id, channelId) {
            var users = _channels[channelId].users;
            for (var i=0; i<users.length; i++) {
                if (users[i].id == id)
                    return users[i];
            }
            return null;
        };

        /**
         * Returns the local user's (randomly assigned) connection ID. Can be used to
         * maintain hashmaps of users, since it's unique per server.
         */
        this.getLocalId = function() { return _myID; };

        /**
         * Returns a channel's info object.
         */
        this.getChannelInfo = function(channelId) { return _channels[channelId]; };

        this.isConnected = function() { return _socket; };
    };

    MessageClient.prototype.constructor = MessageClient;
    av.EventDispatcher.prototype.apply( MessageClient.prototype );

    var _activeClients = {};

    MessageClient.GetInstance = function(serverUrls, path) {

        if (!serverUrls)
            serverUrls = avp.EnvironmentConfigurations[avp.env].LMV.RTC;

        if (!Array.isArray(serverUrls))
            serverUrls = [serverUrls];
        
        var mc = _activeClients[serverUrls[0]];
        if (mc)
            return mc;

        mc = new avp.MessageClient(serverUrls, path);
        _activeClients[serverUrls[0]] = mc;
        return mc;
    };


    Autodesk.Viewing.Private.MessageClient = MessageClient;

})();

AutodeskNamespace('Autodesk.Viewing.Private');

(function() {

    var av = Autodesk.Viewing,
        avp = av.Private;

    //==================================================================================

    avp.P2PClient = function(signalClient) {

        var _this = this;

        var _signalClient = signalClient;
        var _pc;
        var _isStarted = false;
        var _targetId;
        var _localStream;
        var _remoteStream;

        var _dataChannel;

        var _iceCandidates = [];

        var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

        var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

        // Set up audio and video regardless of what devices are present.

        var sdpConstraintsAll = {'mandatory': {
          'OfferToReceiveAudio':true,
          'OfferToReceiveVideo':true }
        };

        var sdpConstraintsNone = {'mandatory': {
          'OfferToReceiveAudio':false,
          'OfferToReceiveVideo':false }
        };


        _signalClient.addEventListener("privateMessage", onMessage);



        function createPeerConnection(wantDataChannel) {
          try {

            _pc = new RTCPeerConnection(pc_config);

            _pc.onicecandidate = function(event) {
                  if (event.candidate) {
                    _signalClient.sendPrivateMessage(_targetId, {
                      type: 'candidate',
                      label: event.candidate.sdpMLineIndex,
                      id: event.candidate.sdpMid,
                      candidate: event.candidate.candidate});
                  } else {
                    avp.logger.log('End of candidates.');
                  }
            };

            _pc.ondatachannel = function(event) {
                avp.logger.log('Data channel added.');
                _dataChannel = event.channel;
                _dataChannel.onmessage = onDataMessage;
                _this.dispatchEvent({type:"dataChannelAdded", data:event.channel});
            };

            _pc.onaddstream = function(event) {
                avp.logger.log('Remote stream added.');
                _remoteStream = event.stream;
                _this.dispatchEvent({type:"remoteStreamAdded", data:event.stream});
            };

            _pc.onremovestream = function(event) {
                avp.logger.log('Remote stream removed. Event: ', event);
                _remoteStream = null;
                _this.dispatchEvent({type:"remoteStreamRemoved", data:event.stream});
            };

            if (wantDataChannel) {
                _dataChannel = _pc.createDataChannel("sendDataChannel", {reliable: false, ordered:false});
                _dataChannel.onmessage = onDataMessage;
            }
          } catch (e) {
            avp.logger.error('Failed to create PeerConnection, exception: ' + e.message, av.errorCodeString(av.ErrorCodes.NETWORK_FAILURE));
            alert('Cannot create RTCPeerConnection object.');
              return;
          }
        }


        function handleCreateOfferError(event){
            avp.logger.error('createOffer() error: ', e, av.errorCodeString(av.ErrorCodes.UNKNOWN_FAILURE));
        }

        function setLocalAndSendMessage(sessionDescription) {
            // Set Opus as the preferred codec in SDP if Opus is present.
            //sessionDescription.sdp = preferOpus(sessionDescription.sdp);
            _pc.setLocalDescription(sessionDescription);
            //avp.logger.log('setLocalAndSendMessage sending message' , sessionDescription);
            _signalClient.sendPrivateMessage(_targetId, sessionDescription);

            if (_iceCandidates.length) {
                for  (var i=0; i<_iceCandidates.length; i++)
                    _pc.addIceCandidate(_iceCandidates[i]);
                _iceCandidates = [];
            }
        }
/*
        function requestTurn(turn_url) {
          var turnExists = false;
          for (var i in pc_config.iceServers) {
            if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
              turnExists = true;
              turnReady = true;
              break;
            }
          }
          if (!turnExists) {
            avp.logger.log('Getting TURN server from ', turn_url);
            // No TURN server. Get one from computeengineondemand.appspot.com:
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
              if (xhr.readyState === 4 && xhr.status === 200) {
                var turnServer = JSON.parse(xhr.responseText);
                avp.logger.log('Got TURN server: ', turnServer);
                pc_config.iceServers.push({
                  'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
                  'credential': turnServer.password
                });
                turnReady = true;
              }
            };
            xhr.open('GET', turn_url, true);
            xhr.send();
          }
        }
*/

        this.hangup = function() {
          avp.logger.log('Hanging up.');
          if (_isStarted) {
              _signalClient.sendPrivateMessage(_targetId, 'bye');
              stop();
          }
        };


        this.initUserMedia = function(createConnectionCB) {
            function handleUserMedia(stream) {
                avp.logger.log('Adding local stream.');
                if (createConnectionCB)
                    createConnectionCB(stream);
                _this.dispatchEvent({type:"localStreamAdded", data:stream});
            }

            function handleUserMediaError(error){
                avp.logger.error('getUserMedia error: ', error, av.errorCodeString(av.ErrorCodes.NETWORK_SERVER_ERROR));
            }

            var constraints = {video: true, audio:true};
            window.getUserMedia(constraints, handleUserMedia, handleUserMediaError);

            avp.logger.log('Getting user media with constraints', constraints);
        };

        this.callUser = function(userId, dataOnly) {
            if (_targetId) {
                avp.logger.warn("Already in a call. Ignoring call request.");
                return;
            }

            _targetId = userId;

            avp.logger.info("Calling user " + _targetId);

            if (dataOnly) {
                createPeerConnection(true);

                _isStarted = true;
                avp.logger.log('Sending data channel offer to peer');
                _pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
            }
            else {
                this.initUserMedia(function(stream) {
                    _localStream = stream;
                    if (!_isStarted && typeof _localStream != 'undefined') {
                        createPeerConnection(false);

                        _pc.addStream(_localStream);
                        _isStarted = true;
                        avp.logger.log('Sending audio/video offer to peer');
                        _pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
                    }
                });
            }
        };

        function isSDPDataOnly(sdp) {
            var lines = sdp.split("\n");
            var haveData = false;
            var haveAudio = false;
            var haveVideo = false;
            for (var i=0; i<lines.length; i++) {
                if (lines[i].indexOf("a=mid:data") == 0) {
                    haveData = true;
                }
                if (lines[i].indexOf("a=mid:video") == 0) {
                    haveVideo = true;
                }
                if (lines[i].indexOf("a=mid:audio") == 0) {
                    haveAudio = true;
                }
            }

            return haveData && !haveVideo && !haveAudio;
        }

        this.receiveCall = function(msg) {
            _targetId = msg.from;
            if (!_targetId)
                _targetId = msg.senderId;

            //Check if the caller wants audio/videio
            var sdp = msg.msg.sdp;
            if (isSDPDataOnly(sdp)) {
                createPeerConnection(true);
                _isStarted = true;

                _pc.setRemoteDescription(new RTCSessionDescription(msg.msg));
                avp.logger.log('Sending data-only answer to peer.');
                _pc.createAnswer(setLocalAndSendMessage, null , sdpConstraintsNone);

            } else {
                this.initUserMedia(function(stream) {
                    _localStream = stream;

                    if (!_isStarted && typeof _localStream != 'undefined') {
                        createPeerConnection(false);
                        _pc.addStream(_localStream);
                        _isStarted = true;
                    }

                    _pc.setRemoteDescription(new RTCSessionDescription(msg.msg));
                    avp.logger.log('Sending audio+video answer to peer.');
                    _pc.createAnswer(setLocalAndSendMessage, null , sdpConstraintsAll);
                });
            }
        };

        function onDataMessage(evt) {
            var data = JSON.parse(evt.data);

            switch(data.type) {
                case "camera":                  _this.dispatchEvent({ type: "cameraChange",   data: data}); break;
                case "joystick":                _this.dispatchEvent({ type: "joystick",       data: data}); break;
                case "state":                   _this.dispatchEvent({ type: "viewerState",    data: data}); break;
                default: break;
            }
        }


        function onMessage(evt) {
            var message = evt.data.msg;
            avp.logger.debug('Client received message:' + JSON.stringify(message));
            if (message.type == 'offer' && !_isStarted) {

                avp.logger.log("Received offer. Accepting.");
                _this.receiveCall(evt.data);

            } else if (message.type === 'answer' && _isStarted) {

                _pc.setRemoteDescription(new RTCSessionDescription(message));

            } else if (message.type === 'candidate') {

                var candidate = new RTCIceCandidate({
                sdpMLineIndex: message.label,
                candidate: message.candidate
                });

                //If we receive ICE candidates before the local
                //session is started, we have to hold them in a temp list until
                //we create the answer
                if (_isStarted)
                    _pc.addIceCandidate(candidate);
                else
                    _iceCandidates.push(candidate);

            } else if (message === 'bye' && _isStarted) {

               _this.dispatchEvent({type:"remoteHangup", data:null});
                avp.logger.info('Session terminated.');
               stop();
              // isInitiator = false;

            }
        }

        function stop() {
          _isStarted = false;
          // isAudioMuted = false;
          // isVideoMuted = false;
          _pc.close();
          _pc = null;
          _localStream = null;
          _remoteStream = null;
          _targetId = null;
        }

        this.getCurrentCallTarget = function() { return _targetId; }

        this.dataChannel = function() { return _dataChannel; }
    };

    avp.P2PClient.prototype.constructor = avp.P2PClient;
    Autodesk.Viewing.EventDispatcher.prototype.apply( avp.P2PClient.prototype );

})();

AutodeskNamespace('Autodesk.Viewing.Private.Collaboration');

(function() {

    var av = Autodesk.Viewing,
        ave = av.Extensions,
        avp = av.Private,
        avpc = avp.Collaboration;


    avpc.JoyStick = function(controller, canvas, label) {

        var _this = this;
        var _hammer;
        var _position = this.position = [0,0];

        var _outerRing, _innerRing;
        var _outerRingSize = 0.7; //actual value will be calculated from the style later
        var _innerRingSize = 0.2; //actual value will be calculated from the style later

        this.dragStart = function(e) {

        };

        function clamp(v, min, max) {
            if (v > max)
                return max;
            if (v < min)
                return min;
            return v;
        }

        this.dragMove = function(e) {
            var vpx = (e.center.x - canvas.offsetLeft) / (canvas.offsetWidth);
            var vpy = (e.center.y - canvas.offsetTop) / (canvas.offsetHeight);

            vpx = clamp(vpx, 0, 1);
            vpy = clamp(vpy, 0, 1);

            //Get input in the range -1,1
            vpx = 2*vpx - 1;
            vpy = -(2*vpy - 1);//minus to convert to y-up

            //Map _outerRingSize to max displacement (1.0)
            var radius = Math.sqrt(vpx*vpx + vpy*vpy);

            //normalize the vector
            vpx /= radius;
            vpy /= radius;

            //restrict to the joystick circle range
            var magnitude = radius / _outerRingSize;
            magnitude = clamp(magnitude, 0, 1);

            _position[0] = vpx * magnitude;
            _position[1] = vpy * magnitude;

            //console.log(_position[0] + " " + _position[1]) ;

            //console.log("magnitude " + magnitude + " pos " + _position[0] + " " + _position[1]) ;

            controller.sendState();

            var guiPositionX = 0.5 * (_position[0] * _outerRingSize) + 0.5;
            var guiPositionY = 0.5 * (-_position[1] * _outerRingSize) + 0.5;

            _innerRing.style.left = (guiPositionX * 100 - _innerRingSize * 50) + "%";
            _innerRing.style.top =  (guiPositionY * 100 - _innerRingSize * 50) + "%";
        };

        this.dragEnd = function(e) {
            _position[0] = 0;
            _position[1] = 0;

            controller.sendState();

            _innerRing.style.left ="40%";
            _innerRing.style.top = "40%";
        };

        this.onSingleTap = function(e) {
            //console.log("on tap");
        };

        this.onDoubleTap = function(e) {
            //console.log("double tap");
        };


        function createGUI() {

            _outerRing = document.createElement("div");
            _outerRing.classList.add("joystickOuterRing");

            canvas.appendChild(_outerRing);
            //_outerRingSize = parseInt(_outerRing.style.width) / 100;

            _innerRing = document.createElement("div");
            _innerRing.classList.add("joystickInnerRing");

            if (label) {
                var btnText = document.createElement("span");
                btnText.classList.add("buttonText");
                btnText.textContent = label;
                _innerRing.appendChild(btnText);
            }

            canvas.appendChild(_innerRing);
            //_innerRingSize = parseInt(_innerRing.style.width) / 100;
        }

        function initEvents() {
            _hammer = new Hammer.Manager(canvas, {
                recognizers: [
                    av.GestureRecognizers.singletap,
                    av.GestureRecognizers.doubletap,
                    av.GestureRecognizers.drag
                ]
            });

            _hammer.on("dragstart", _this.dragStart);
            _hammer.on("dragmove", _this.dragMove);
            _hammer.on("dragend", _this.dragEnd);

            _hammer.on("singletap", _this.onSingleTap);
            _hammer.on("doubletap", _this.onDoubleTap);
        }

        createGUI();
        initEvents();

    };


    avpc.Slider = function(controller, canvas, label) {

        var _this = this;
        var _body;
        var _thumb;
        var _hammer;

        var _position = _this.position = 0.0;


        this.dragStart = function(e) {

        };

        function clamp(v, min, max) {
            if (v > max)
                return max;
            if (v < min)
                return min;
            return v;
        }

        this.dragMove = function(e) {
            var vpy = (e.center.y - canvas.offsetTop) / (canvas.offsetHeight);

            vpy = clamp(vpy, 0, 1);

            //Get input in the range -1,1
            vpy = -(2*vpy - 1);//minus to convert to y-up

            _this.position = _position = vpy;

            console.log(_position) ;

            controller.sendState();

            var guiPositionY = 0.5 * (-_position) + 0.5;

            _thumb.style.top =  (guiPositionY * 100 - 0.1 * 50) + "%";
        };

        this.dragEnd = function(e) {
            _thumb.style.top = "45%";

            _this.position = _position = 0;

            controller.sendState();
        };



        function createGUI() {
            _body = document.createElement("div");
            _body.classList.add("sliderBody");
            canvas.appendChild(_body);

            _thumb = document.createElement("div");
            _thumb.classList.add("sliderThumb");

            var lbl = document.createElement("span");
            lbl.classList.add("buttonText");
            lbl.style.fontSize = "xx-small";
            lbl.textContent = label;

            _thumb.appendChild(lbl);

            canvas.appendChild(_thumb);
        }

        function initEvents() {
            if( 'ontouchstart' in window )
            {
                _hammer = new Hammer.Manager(canvas, {
                    recognizers: [
                        av.GestureRecognizers.singletap,
                        av.GestureRecognizers.drag
                    ]
                });

                _hammer.on("dragstart", _this.dragStart);
                _hammer.on("dragmove", _this.dragMove);
                _hammer.on("dragend", _this.dragEnd);

                //_hammer.on("singletap", _this.onSingleTap);
                //_hammer.on("doubletap", _this.onDoubleTap);

            }
        }

        this.updateLayout = function(w) {

            canvas.style.bottom = w * 0.125 + "px";
            canvas.style.left = w * 0.46 + "px";
            canvas.style.width = w * 0.08 + "px";
            canvas.style.height = w * 0.25 + "px";

            _body.style.borderRadius = w * 0.02 + "px";
            _thumb.style.borderRadius = w * 0.02 + "px";
        };

        createGUI();
        initEvents();

    };

    //==================================================================================

    avpc.RemoteControl = function(domElement) {

        var _canvas1, _canvas2, _canvasExp;
        var _stick1, _stick2;
        var _btnHome;
        var _btnSelect;
        var _btnHide;
        var _btnFly;
        var _btnSavepoint, _btnNextSavepoint;
        var _errBox;
        var _explodeSlider;
        var _this = this;

        var _client, _p2p;

        this.connect = function(connectionId) {

            this.showNotification(true, "CONTACTING MOTHERSHIP", "cyan");

            _client = avp.MessageClient.GetInstance();
            _client.connect();
            _client.join(connectionId);
            _p2p = new avp.P2PClient(_client);
            _p2p.addEventListener("dataChannelAdded", hideNotifications);

            var p2pCaller = function(e) {
                //_client.removeEventListener("userListChange", nameChanger);
                //_client.sendChatMessage("/nick Remote Control");

                var users = _client.getChannelInfo(e.channelId).users;

                if (users && users.length == 2 && !_p2p.getCurrentCallTarget() ) {

                    _this.showNotification(true, "INITIATING DIRECT LINK", "green");

                    //OK both sides are in the call, establish data channel
                    var otherUser = users[0];
                    if (otherUser.id == _client.getLocalId())
                        otherUser = users[1];

                    _p2p.callUser(otherUser.id, true);
                } else if (_p2p.getCurrentCallTarget()) {
                    console.log("Unexpected user event.");
                    console.log(e.data);
                }

                //_client.removeEventListener("userListChange", p2pCaller);
            };

            //Wait for successfull connection to change user name
            _client.addEventListener("userListChange", p2pCaller);
        };


        this.sendState = function(command) {
            var msg = { x1: _stick1.position[0],
                        y1: _stick1.position[1],
                        x2: _stick2.position[0],
                        y2: _stick2.position[1],
                        explode : _explodeSlider.position
            };

            if (command) {
                console.log(command);
                msg.command = command;
            }

            var dcc = _p2p ? _p2p.dataChannel() : null;
            if (dcc) {
                if (dcc.readyState == "open") {
                    if (_errBox) {
                        hideNotifications();
                    }
                    dcc.send(JSON.stringify({type:"joystick", msg:msg}));
                } else if (!_errBox) {
                    this.showNotification(true);
                }
            }
            else if (!_errBox) {
                this.showNotification(true);

                //Do not fall back to web socket. It's laggy and lame.
                //_client.sendMessage("joystick", msg);
            }
        };


        this.showNotification = function(state, msg, color) {
            if (state) {

            //console.log("show");
                if (_errBox) {
                    domElement.removeChild(_errBox);
                }

                _errBox = document.createElement("div");
                _errBox.classList.add("errorBox");

                var errText = document.createElement("span");
                errText.classList.add("errorText");
                errText.classList.add("blink");
                var defaultMsg1 = Autodesk.Viewing.i18n.translate("DISCONNECTED");
                var defaultMsg2 = Autodesk.Viewing.i18n.translate("Reload main viewer and pair again");

                errText.innerHTML = msg ? Autodesk.Viewing.i18n.translate(msg) : "<p>" + defaultMsg1 + "</p> " + defaultMsg2;

                if (color)
                    errText.style.color = color;

                _errBox.appendChild(errText);
                domElement.appendChild(_errBox);
            }
            else if (_errBox) {
            //console.log("hide");
                domElement.removeChild(_errBox);
                _errBox = null;
            }
        };

        function hideNotifications() {
            _this.showNotification(false);
        }


        function fixOrientation() {

            //var w = window.innerWidth;
            //var h = window.innerHeight;
            var r = domElement.getBoundingClientRect();
            var w = r.right - r.left;
            var h = w * 0.5; //we will lay things out in 2:1 aspect ratio.
            //var topOffset = (r.bottom - r.top) - h;
            //domElement.style.height = h + "px";


            function updateSize(btn, isLeft, isTop) {
                var bsz = w * 0.1;

                btn.style.width = bsz + "px";
                btn.style.height = bsz + "px";
                btn.style.borderRadius = bsz*0.5 + "px";

                if (isLeft) {
                    btn.style.left = (w * btn.anchorX - bsz) + "px";

                    btn.tipText.style.right = (w - btn.offsetLeft) + "px";
                } else {
                    btn.style.left = w * btn.anchorX + "px";

                    btn.tipText.style.left = (btn.offsetLeft + bsz) + "px";
                }

                if (isTop) {
                    btn.style.bottom = (h * 0.95 - bsz) + "px";
                    btn.tipText.style.bottom = (h * 0.95 - btn.tipText.offsetHeight) + "px";
                } else {
                    btn.style.bottom = (h * 0.05) + "px";
                    btn.tipText.style.bottom = (h * 0.05) + "px";
                }
            }

            //if (window.orientation == 90 || window.orientation == -90) {


            _canvas1.style.width = w * 0.5 + "px";
            _canvas1.style.height = w * 0.5 + "px";

            _canvas2.style.width = w * 0.5 + "px";
            _canvas2.style.height = w * 0.5 + "px";

            _explodeSlider.updateLayout(w);

            updateSize(_btnHome, true, true);
            updateSize(_btnSelect, false, true);
            updateSize(_btnHide, false, false);
            updateSize(_btnFly, true, false);
            updateSize(_btnSavepoint, false, true);
            updateSize(_btnNextSavepoint, true, true);

        }


        function initUI() {

            //left joystick
            _canvas1 = document.createElement("div");
            _canvas1.style.position = "absolute";
            _canvas1.style.left = "0%";
            _canvas1.style.bottom = "0%";
            //_canvas1.style.backgroundColor = "blue";
            domElement.appendChild(_canvas1);

            //right joystick
            _canvas2 = document.createElement("div");
            _canvas2.style.position = "absolute";
            _canvas2.style.right = "0%";
            _canvas2.style.bottom = "0%";
            //_canvas2.style.backgroundColor = "orange";
            domElement.appendChild(_canvas2);



            function makeButton(parent, text, color, command, helpText) {
                var b = document.createElement("div");
                b.classList.add("joystickButton");
                b.style.backgroundColor = color;

                var btnText = document.createElement("span");
                btnText.classList.add("buttonText");
                btnText.innerHTML = text;
                b.appendChild(btnText);

                b.onclick = function(e) {
                    _this.sendState(command);
                    b.classList.add("clicked");
                };

                var tip = document.createElement("div");
                tip.classList.add("tipText");
                tip.textContent = helpText;
                b.tipText = tip;

                parent.appendChild(b);
                parent.appendChild(tip);

                return b;
            }

            //home button
            _btnHome = makeButton(domElement, "R", "blue", "gohome", "RESET VIEW");
            _btnHome.anchorX = 0.475;
            //_btnHome.style.background = "radial-gradient(circle at 50% 120%, #81e8f6, #76deef 10%, #055194 80%, #062745 100%)";

            //select button
            _btnSelect = makeButton(domElement, "S", "red", "select", "SELECT");
            _btnSelect.anchorX = 0.525;

            //hide button
            _btnHide = makeButton(domElement, "H", "yellow", "hide", "HIDE");
            _btnHide.anchorX = 0.525;

            //auto-fly button
            _btnFly = makeButton(domElement, "A", "green", "fly", "AUTO MOVE");
            _btnFly.anchorX = 0.475;

            _btnSavepoint = makeButton(domElement, "&#9733", "#ff7700", "savepoint", "SAVE");
            _btnSavepoint.anchorX = 0.025;

            _btnNextSavepoint = makeButton(domElement, "&#9654", "#ff7700", "nextsavepoint", "NEXT");
            _btnNextSavepoint.anchorX = 0.975;


            if ( 'ondeviceorientation' in window ) {
                //window.addEventListener("deviceorientation", this.onDeviceOrientation, true);
            }

            window.addEventListener("orientationchange", fixOrientation);
            window.addEventListener("resize", fixOrientation);

            _stick1 = new avpc.JoyStick(_this, _canvas1, "W");
            _stick2 = new avpc.JoyStick(_this, _canvas2, "L");


            _canvasExp = document.createElement("div");
            _canvasExp.style.position = "absolute";
            _canvasExp.style.left = "45%";
            _canvasExp.style.width = "10%";
            _canvasExp.style.height = "50%";
            domElement.appendChild(_canvasExp);
            _explodeSlider = new avpc.Slider(_this, _canvasExp, "EXPLODE");
        }

        initUI();
        fixOrientation();

    };

})();