/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../api/node_modules/axios/index.js":
/*!*********************************************!*\
  !*** ../../api/node_modules/axios/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "../../api/node_modules/axios/lib/axios.js");

/***/ }),

/***/ "../../api/node_modules/axios/lib/adapters/xhr.js":
/*!********************************************************!*\
  !*** ../../api/node_modules/axios/lib/adapters/xhr.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "../../api/node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "../../api/node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "../../api/node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "../../api/node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "../../api/node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "../../api/node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "../../api/node_modules/axios/lib/core/createError.js");
var defaults = __webpack_require__(/*! ../defaults */ "../../api/node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/axios.js":
/*!*************************************************!*\
  !*** ../../api/node_modules/axios/lib/axios.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../../api/node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "../../api/node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "../../api/node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "../../api/node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "../../api/node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "../../api/node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "../../api/node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "../../api/node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "../../api/node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "../../api/node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "../../api/node_modules/axios/lib/cancel/Cancel.js":
/*!*********************************************************!*\
  !*** ../../api/node_modules/axios/lib/cancel/Cancel.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "../../api/node_modules/axios/lib/cancel/CancelToken.js":
/*!**************************************************************!*\
  !*** ../../api/node_modules/axios/lib/cancel/CancelToken.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "../../api/node_modules/axios/lib/cancel/isCancel.js":
/*!***********************************************************!*\
  !*** ../../api/node_modules/axios/lib/cancel/isCancel.js ***!
  \***********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/Axios.js":
/*!******************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/Axios.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "../../api/node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "../../api/node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "../../api/node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "../../api/node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "../../api/node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/InterceptorManager.js":
/*!*******************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/InterceptorManager.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/buildFullPath.js":
/*!**************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/buildFullPath.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "../../api/node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "../../api/node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/createError.js":
/*!************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/createError.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "../../api/node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/dispatchRequest.js":
/*!****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/dispatchRequest.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "../../api/node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "../../api/node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "../../api/node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/enhanceError.js":
/*!*************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/enhanceError.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/mergeConfig.js":
/*!************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/mergeConfig.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../../api/node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/settle.js":
/*!*******************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/settle.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "../../api/node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/transformData.js":
/*!**************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/transformData.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "../../api/node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/defaults.js":
/*!****************************************************!*\
  !*** ../../api/node_modules/axios/lib/defaults.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../../api/node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "../../api/node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "../../api/node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "../../api/node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "../../api/node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "../../api/node_modules/axios/lib/env/data.js":
/*!****************************************************!*\
  !*** ../../api/node_modules/axios/lib/env/data.js ***!
  \****************************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.24.0"
};

/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/bind.js":
/*!********************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/bind.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/buildURL.js":
/*!************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/buildURL.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/combineURLs.js":
/*!***************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/combineURLs.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/cookies.js":
/*!***********************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/cookies.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/isAxiosError.js":
/*!****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/isAxiosError.js ***!
  \****************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!*******************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***********************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../../api/node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/parseHeaders.js":
/*!****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/parseHeaders.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/spread.js":
/*!**********************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/spread.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/validator.js":
/*!*************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/validator.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "../../api/node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/utils.js":
/*!*************************************************!*\
  !*** ../../api/node_modules/axios/lib/utils.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "../../api/node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "../../api/node_modules/bin-serde/lib/index.js":
/*!*****************************************************!*\
  !*** ../../api/node_modules/bin-serde/lib/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Reader = exports.Writer = void 0;
const utf8 = __webpack_require__(/*! utf8-buffer */ "../../api/node_modules/utf8-buffer/index.js");
const utf8_buffer_size_1 = __webpack_require__(/*! utf8-buffer-size */ "../../api/node_modules/utf8-buffer-size/main.js");
const { pack, unpack } = utf8.default ?? utf8;
class Writer {
    pos = 0;
    view;
    bytes;
    constructor() {
        this.view = new DataView(new ArrayBuffer(64));
        this.bytes = new Uint8Array(this.view.buffer);
    }
    writeUInt8(val) {
        this.ensureSize(1);
        this.view.setUint8(this.pos, val);
        this.pos += 1;
        return this;
    }
    writeUInt32(val) {
        this.ensureSize(4);
        this.view.setUint32(this.pos, val);
        this.pos += 4;
        return this;
    }
    writeUInt64(val) {
        this.ensureSize(8);
        this.view.setBigUint64(this.pos, val);
        this.pos += 8;
        return this;
    }
    writeUVarint(val) {
        if (val < 0x80) {
            this.ensureSize(1);
            this.view.setUint8(this.pos, val);
            this.pos += 1;
        }
        else if (val < 0x4000) {
            this.ensureSize(2);
            this.view.setUint16(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 2;
        }
        else if (val < 0x200000) {
            this.ensureSize(3);
            this.view.setUint8(this.pos, (val >> 14) | 0x80);
            this.view.setUint16(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 3;
        }
        else if (val < 0x10000000) {
            this.ensureSize(4);
            this.view.setUint32(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 4;
        }
        else if (val < 0x800000000) {
            this.ensureSize(5);
            this.view.setUint8(this.pos, Math.floor(val / Math.pow(2, 28)) | 0x80);
            this.view.setUint32(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 5;
        }
        else if (val < 0x40000000000) {
            this.ensureSize(6);
            const shiftedVal = Math.floor(val / Math.pow(2, 28));
            this.view.setUint16(this.pos, (shiftedVal & 0x7f) | ((shiftedVal & 0x3f80) << 1) | 0x8080);
            this.view.setUint32(this.pos + 2, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 6;
        }
        else {
            throw new Error("Value out of range");
        }
        return this;
    }
    writeVarint(val) {
        const bigval = BigInt(val);
        this.writeUVarint(Number((bigval >> 63n) ^ (bigval << 1n)));
        return this;
    }
    writeFloat(val) {
        this.ensureSize(4);
        this.view.setFloat32(this.pos, val, true);
        this.pos += 4;
        return this;
    }
    writeBits(bits) {
        for (let i = 0; i < bits.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                if (i + j == bits.length) {
                    break;
                }
                byte |= (bits[i + j] ? 1 : 0) << j;
            }
            this.writeUInt8(byte);
        }
        return this;
    }
    writeString(val) {
        if (val.length > 0) {
            const byteSize = (0, utf8_buffer_size_1.default)(val);
            this.writeUVarint(byteSize);
            this.ensureSize(byteSize);
            pack(val, this.bytes, this.pos);
            this.pos += byteSize;
        }
        else {
            this.writeUInt8(0);
        }
        return this;
    }
    writeBuffer(buf) {
        this.ensureSize(buf.length);
        this.bytes.set(buf, this.pos);
        this.pos += buf.length;
        return this;
    }
    toBuffer() {
        return this.bytes.subarray(0, this.pos);
    }
    ensureSize(size) {
        while (this.view.byteLength < this.pos + size) {
            const newView = new DataView(new ArrayBuffer(this.view.byteLength * 2));
            const newBytes = new Uint8Array(newView.buffer);
            newBytes.set(this.bytes);
            this.view = newView;
            this.bytes = newBytes;
        }
    }
}
exports.Writer = Writer;
class Reader {
    pos = 0;
    view;
    bytes;
    constructor(buf) {
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.bytes = new Uint8Array(this.view.buffer, buf.byteOffset, buf.byteLength);
    }
    readUInt8() {
        const val = this.view.getUint8(this.pos);
        this.pos += 1;
        return val;
    }
    readUInt32() {
        const val = this.view.getUint32(this.pos);
        this.pos += 4;
        return val;
    }
    readUInt64() {
        const val = this.view.getBigUint64(this.pos);
        this.pos += 8;
        return val;
    }
    readUVarint() {
        let val = 0;
        while (true) {
            let byte = this.view.getUint8(this.pos++);
            if (byte < 0x80) {
                return val + byte;
            }
            val = (val + (byte & 0x7f)) * 128;
        }
    }
    readVarint() {
        const val = BigInt(this.readUVarint());
        return Number((val >> 1n) ^ -(val & 1n));
    }
    readFloat() {
        const val = this.view.getFloat32(this.pos, true);
        this.pos += 4;
        return val;
    }
    readBits(numBits) {
        const numBytes = Math.ceil(numBits / 8);
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        const bits = [];
        for (const byte of bytes) {
            for (let i = 0; i < 8 && bits.length < numBits; i++) {
                bits.push(((byte >> i) & 1) === 1);
            }
        }
        this.pos += numBytes;
        return bits;
    }
    readString() {
        const len = this.readUVarint();
        if (len === 0) {
            return "";
        }
        const val = unpack(this.bytes, this.pos, this.pos + len);
        this.pos += len;
        return val;
    }
    readBuffer(numBytes) {
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        this.pos += numBytes;
        return bytes;
    }
    remaining() {
        return this.view.byteLength - this.pos;
    }
}
exports.Reader = Reader;


/***/ }),

/***/ "../../api/node_modules/utf8-buffer-size/main.js":
/*!*******************************************************!*\
  !*** ../../api/node_modules/utf8-buffer-size/main.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ utf8BufferSize)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview The utf8-buffer-size API.
 * @see https://github.com/rochars/utf8-buffer-size
 */

/** @module utf8BufferSize */

/**
 * Returns how many bytes are needed to serialize a UTF-8 string.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @return {number} The number of bytes needed to serialize the string.
 */
function utf8BufferSize(str) {
  /** @type {number} */
  let bytes = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    /** @type {number} */
    let codePoint = str.codePointAt(i);
    if (codePoint < 128) {
      bytes++;
    } else {
      if (codePoint <= 2047) {
        bytes++;
      } else if(codePoint <= 65535) {
        bytes+=2;
      } else if(codePoint <= 1114111) {
        i++;
        bytes+=3;
      }
      bytes++;
    }
  }
  return bytes;
}


/***/ }),

/***/ "../../api/node_modules/utf8-buffer/index.js":
/*!***************************************************!*\
  !*** ../../api/node_modules/utf8-buffer/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pack": () => (/* binding */ pack),
/* harmony export */   "unpack": () => (/* binding */ unpack)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview Functions to serialize and deserialize UTF-8 strings.
 * @see https://github.com/rochars/utf8-buffer
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 */

/** @module utf8-buffer */

/**
 * Read a string of UTF-8 characters from a byte buffer.
 * Invalid characters are replaced with 'REPLACEMENT CHARACTER' (U+FFFD).
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://stackoverflow.com/a/34926911
 * @param {!Uint8Array|!Array<number>} buffer A byte buffer.
 * @param {number=} start The buffer index to start reading.
 * @param {?number=} end The buffer index to stop reading.
 *   Assumes the buffer length if undefined.
 * @return {string}
 */
function unpack(buffer, start=0, end=buffer.length) {
  /** @type {string} */
  let str = '';
  for(let index = start; index < end;) {
    /** @type {number} */
    let lowerBoundary = 0x80;
    /** @type {number} */
    let upperBoundary = 0xBF;
    /** @type {boolean} */
    let replace = false;
    /** @type {number} */
    let charCode = buffer[index++];
    if (charCode >= 0x00 && charCode <= 0x7F) {
      str += String.fromCharCode(charCode);
    } else {
      /** @type {number} */
      let count = 0;
      if (charCode >= 0xC2 && charCode <= 0xDF) {
        count = 1;
      } else if (charCode >= 0xE0 && charCode <= 0xEF ) {
        count = 2;
        if (buffer[index] === 0xE0) {
          lowerBoundary = 0xA0;
        }
        if (buffer[index] === 0xED) {
          upperBoundary = 0x9F;
        }
      } else if (charCode >= 0xF0 && charCode <= 0xF4 ) {
        count = 3;
        if (buffer[index] === 0xF0) {
          lowerBoundary = 0x90;
        }
        if (buffer[index] === 0xF4) {
          upperBoundary = 0x8F;
        }
      } else {
        replace = true;
      }
      charCode = charCode & (1 << (8 - count - 1)) - 1;
      for (let i = 0; i < count; i++) {
        if (buffer[index] < lowerBoundary || buffer[index] > upperBoundary) {
          replace = true;
        }
        charCode = (charCode << 6) | (buffer[index] & 0x3f);
        index++;
      }
      if (replace) {
        str += String.fromCharCode(0xFFFD);
      } 
      else if (charCode <= 0xffff) {
        str += String.fromCharCode(charCode);
      } else {
        charCode -= 0x10000;
        str += String.fromCharCode(
          ((charCode >> 10) & 0x3ff) + 0xd800,
          (charCode & 0x3ff) + 0xdc00);
      }
    }
  }
  return str;
}

/**
 * Write a string of UTF-8 characters to a byte buffer.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @param {!Uint8Array|!Array<number>} buffer The buffer to pack the string to.
 * @param {number=} index The buffer index to start writing.
 * @return {number} The next index to write in the buffer.
 */
function pack(str, buffer, index=0) {
  for (let i = 0, len = str.length; i < len; i++) {
    /** @type {number} */
    let codePoint = str.codePointAt(i);
    if (codePoint < 128) {
      buffer[index] = codePoint;
      index++;
    } else {
      /** @type {number} */
      let count = 0;
      /** @type {number} */
      let offset = 0;
      if (codePoint <= 0x07FF) {
        count = 1;
        offset = 0xC0;
      } else if(codePoint <= 0xFFFF) {
        count = 2;
        offset = 0xE0;
      } else if(codePoint <= 0x10FFFF) {
        count = 3;
        offset = 0xF0;
        i++;
      }
      buffer[index] = (codePoint >> (6 * count)) + offset;
      index++;
      while (count > 0) {
        buffer[index] = 0x80 | (codePoint >> (6 * (count - 1)) & 0x3F);
        index++;
        count--;
      }
    }
  }
  return index;
}


/***/ }),

/***/ "../.hathora/node_modules/axios/index.js":
/*!***********************************************!*\
  !*** ../.hathora/node_modules/axios/index.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "../.hathora/node_modules/axios/lib/axios.js");

/***/ }),

/***/ "../.hathora/node_modules/axios/lib/adapters/xhr.js":
/*!**********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/adapters/xhr.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "../.hathora/node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "../.hathora/node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "../.hathora/node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "../.hathora/node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "../.hathora/node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "../.hathora/node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "../.hathora/node_modules/axios/lib/core/createError.js");
var defaults = __webpack_require__(/*! ../defaults */ "../.hathora/node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "../.hathora/node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/axios.js":
/*!***************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/axios.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../.hathora/node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "../.hathora/node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "../.hathora/node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "../.hathora/node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "../.hathora/node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "../.hathora/node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "../.hathora/node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "../.hathora/node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "../.hathora/node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "../.hathora/node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "../.hathora/node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/cancel/Cancel.js":
/*!***********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/cancel/Cancel.js ***!
  \***********************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/cancel/CancelToken.js":
/*!****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/cancel/CancelToken.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "../.hathora/node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/cancel/isCancel.js":
/*!*************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/cancel/isCancel.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/Axios.js":
/*!********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/Axios.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "../.hathora/node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "../.hathora/node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "../.hathora/node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "../.hathora/node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "../.hathora/node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  if (!config.url) {
    throw new Error('Provided config url is not valid');
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  if (!config.url) {
    throw new Error('Provided config url is not valid');
  }
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/InterceptorManager.js":
/*!*********************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/InterceptorManager.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/buildFullPath.js":
/*!****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/buildFullPath.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "../.hathora/node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "../.hathora/node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/createError.js":
/*!**************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/createError.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "../.hathora/node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/dispatchRequest.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/dispatchRequest.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "../.hathora/node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "../.hathora/node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "../.hathora/node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "../.hathora/node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/enhanceError.js":
/*!***************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/enhanceError.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/mergeConfig.js":
/*!**************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/mergeConfig.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../.hathora/node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/settle.js":
/*!*********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/settle.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "../.hathora/node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/transformData.js":
/*!****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/transformData.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "../.hathora/node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/defaults.js":
/*!******************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/defaults.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../.hathora/node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "../.hathora/node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "../.hathora/node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "../.hathora/node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "../.hathora/node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/env/data.js":
/*!******************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/env/data.js ***!
  \******************************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.25.0"
};

/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/bind.js":
/*!**********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/bind.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/buildURL.js":
/*!**************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/buildURL.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/combineURLs.js":
/*!*****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/combineURLs.js ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/cookies.js":
/*!*************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/cookies.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*******************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/isAxiosError.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/isAxiosError.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!*********************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!*************************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../.hathora/node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/parseHeaders.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/parseHeaders.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/spread.js":
/*!************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/spread.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/validator.js":
/*!***************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/validator.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "../.hathora/node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/utils.js":
/*!***************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/utils.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "../.hathora/node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "../.hathora/node_modules/bin-serde/lib/index.js":
/*!*******************************************************!*\
  !*** ../.hathora/node_modules/bin-serde/lib/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Reader = exports.Writer = void 0;
const utf8 = __webpack_require__(/*! utf8-buffer */ "../.hathora/node_modules/utf8-buffer/index.js");
const utf8_buffer_size_1 = __webpack_require__(/*! utf8-buffer-size */ "../.hathora/node_modules/utf8-buffer-size/main.js");
const { pack, unpack } = utf8.default ?? utf8;
class Writer {
    pos = 0;
    view;
    bytes;
    constructor() {
        this.view = new DataView(new ArrayBuffer(64));
        this.bytes = new Uint8Array(this.view.buffer);
    }
    writeUInt8(val) {
        this.ensureSize(1);
        this.view.setUint8(this.pos, val);
        this.pos += 1;
        return this;
    }
    writeUInt32(val) {
        this.ensureSize(4);
        this.view.setUint32(this.pos, val);
        this.pos += 4;
        return this;
    }
    writeUInt64(val) {
        this.ensureSize(8);
        this.view.setBigUint64(this.pos, val);
        this.pos += 8;
        return this;
    }
    writeUVarint(val) {
        if (val < 0x80) {
            this.ensureSize(1);
            this.view.setUint8(this.pos, val);
            this.pos += 1;
        }
        else if (val < 0x4000) {
            this.ensureSize(2);
            this.view.setUint16(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 2;
        }
        else if (val < 0x200000) {
            this.ensureSize(3);
            this.view.setUint8(this.pos, (val >> 14) | 0x80);
            this.view.setUint16(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 3;
        }
        else if (val < 0x10000000) {
            this.ensureSize(4);
            this.view.setUint32(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 4;
        }
        else if (val < 0x800000000) {
            this.ensureSize(5);
            this.view.setUint8(this.pos, Math.floor(val / Math.pow(2, 28)) | 0x80);
            this.view.setUint32(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 5;
        }
        else if (val < 0x40000000000) {
            this.ensureSize(6);
            const shiftedVal = Math.floor(val / Math.pow(2, 28));
            this.view.setUint16(this.pos, (shiftedVal & 0x7f) | ((shiftedVal & 0x3f80) << 1) | 0x8080);
            this.view.setUint32(this.pos + 2, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 6;
        }
        else {
            throw new Error("Value out of range");
        }
        return this;
    }
    writeVarint(val) {
        const bigval = BigInt(val);
        this.writeUVarint(Number((bigval >> 63n) ^ (bigval << 1n)));
        return this;
    }
    writeFloat(val) {
        this.ensureSize(4);
        this.view.setFloat32(this.pos, val, true);
        this.pos += 4;
        return this;
    }
    writeBits(bits) {
        for (let i = 0; i < bits.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                if (i + j == bits.length) {
                    break;
                }
                byte |= (bits[i + j] ? 1 : 0) << j;
            }
            this.writeUInt8(byte);
        }
        return this;
    }
    writeString(val) {
        if (val.length > 0) {
            const byteSize = (0, utf8_buffer_size_1.default)(val);
            this.writeUVarint(byteSize);
            this.ensureSize(byteSize);
            pack(val, this.bytes, this.pos);
            this.pos += byteSize;
        }
        else {
            this.writeUInt8(0);
        }
        return this;
    }
    writeBuffer(buf) {
        this.ensureSize(buf.length);
        this.bytes.set(buf, this.pos);
        this.pos += buf.length;
        return this;
    }
    toBuffer() {
        return this.bytes.subarray(0, this.pos);
    }
    ensureSize(size) {
        while (this.view.byteLength < this.pos + size) {
            const newView = new DataView(new ArrayBuffer(this.view.byteLength * 2));
            const newBytes = new Uint8Array(newView.buffer);
            newBytes.set(this.bytes);
            this.view = newView;
            this.bytes = newBytes;
        }
    }
}
exports.Writer = Writer;
class Reader {
    pos = 0;
    view;
    bytes;
    constructor(buf) {
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.bytes = new Uint8Array(this.view.buffer, buf.byteOffset, buf.byteLength);
    }
    readUInt8() {
        const val = this.view.getUint8(this.pos);
        this.pos += 1;
        return val;
    }
    readUInt32() {
        const val = this.view.getUint32(this.pos);
        this.pos += 4;
        return val;
    }
    readUInt64() {
        const val = this.view.getBigUint64(this.pos);
        this.pos += 8;
        return val;
    }
    readUVarint() {
        let val = 0;
        while (true) {
            let byte = this.view.getUint8(this.pos++);
            if (byte < 0x80) {
                return val + byte;
            }
            val = (val + (byte & 0x7f)) * 128;
        }
    }
    readVarint() {
        const val = BigInt(this.readUVarint());
        return Number((val >> 1n) ^ -(val & 1n));
    }
    readFloat() {
        const val = this.view.getFloat32(this.pos, true);
        this.pos += 4;
        return val;
    }
    readBits(numBits) {
        const numBytes = Math.ceil(numBits / 8);
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        const bits = [];
        for (const byte of bytes) {
            for (let i = 0; i < 8 && bits.length < numBits; i++) {
                bits.push(((byte >> i) & 1) === 1);
            }
        }
        this.pos += numBytes;
        return bits;
    }
    readString() {
        const len = this.readUVarint();
        if (len === 0) {
            return "";
        }
        const val = unpack(this.bytes, this.pos, this.pos + len);
        this.pos += len;
        return val;
    }
    readBuffer(numBytes) {
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        this.pos += numBytes;
        return bytes;
    }
    remaining() {
        return this.view.byteLength - this.pos;
    }
}
exports.Reader = Reader;


/***/ }),

/***/ "../.hathora/node_modules/get-random-values/index.js":
/*!***********************************************************!*\
  !*** ../.hathora/node_modules/get-random-values/index.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var window = __webpack_require__(/*! global/window */ "../.hathora/node_modules/global/window.js");
var nodeCrypto = __webpack_require__(/*! crypto */ "?5d12");

function getRandomValues(buf) {
  if (window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(buf);
  }
  if (typeof window.msCrypto === 'object' && typeof window.msCrypto.getRandomValues === 'function') {
    return window.msCrypto.getRandomValues(buf);
  }
  if (nodeCrypto.randomBytes) {
    if (!(buf instanceof Uint8Array)) {
      throw new TypeError('expected Uint8Array');
    }
    if (buf.length > 65536) {
      var e = new Error();
      e.code = 22;
      e.message = 'Failed to execute \'getRandomValues\' on \'Crypto\': The ' +
        'ArrayBufferView\'s byte length (' + buf.length + ') exceeds the ' +
        'number of bytes of entropy available via this API (65536).';
      e.name = 'QuotaExceededError';
      throw e;
    }
    var bytes = nodeCrypto.randomBytes(buf.length);
    buf.set(bytes);
    return buf;
  }
  else {
    throw new Error('No secure random number generator available.');
  }
}

module.exports = getRandomValues;


/***/ }),

/***/ "../.hathora/node_modules/global/window.js":
/*!*************************************************!*\
  !*** ../.hathora/node_modules/global/window.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof __webpack_require__.g !== "undefined") {
    win = __webpack_require__.g;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;


/***/ }),

/***/ "../.hathora/node_modules/isomorphic-ws/browser.js":
/*!*********************************************************!*\
  !*** ../.hathora/node_modules/isomorphic-ws/browser.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// https://github.com/maxogden/websocket-stream/blob/48dc3ddf943e5ada668c31ccd94e9186f02fafbd/ws-fallback.js

var ws = null

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket
} else if (typeof __webpack_require__.g !== 'undefined') {
  ws = __webpack_require__.g.WebSocket || __webpack_require__.g.MozWebSocket
} else if (typeof window !== 'undefined') {
  ws = window.WebSocket || window.MozWebSocket
} else if (typeof self !== 'undefined') {
  ws = self.WebSocket || self.MozWebSocket
}

module.exports = ws


/***/ }),

/***/ "../.hathora/node_modules/jwt-decode/build/jwt-decode.esm.js":
/*!*******************************************************************!*\
  !*** ../.hathora/node_modules/jwt-decode/build/jwt-decode.esm.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "InvalidTokenError": () => (/* binding */ n),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function e(e){this.message=e}e.prototype=new Error,e.prototype.name="InvalidCharacterError";var r="undefined"!=typeof window&&window.atob&&window.atob.bind(window)||function(r){var t=String(r).replace(/=+$/,"");if(t.length%4==1)throw new e("'atob' failed: The string to be decoded is not correctly encoded.");for(var n,o,a=0,i=0,c="";o=t.charAt(i++);~o&&(n=a%4?64*n+o:o,a++%4)?c+=String.fromCharCode(255&n>>(-2*a&6)):0)o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(o);return c};function t(e){var t=e.replace(/-/g,"+").replace(/_/g,"/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw"Illegal base64url string!"}try{return function(e){return decodeURIComponent(r(e).replace(/(.)/g,(function(e,r){var t=r.charCodeAt(0).toString(16).toUpperCase();return t.length<2&&(t="0"+t),"%"+t})))}(t)}catch(e){return r(t)}}function n(e){this.message=e}function o(e,r){if("string"!=typeof e)throw new n("Invalid token specified");var o=!0===(r=r||{}).header?0:1;try{return JSON.parse(t(e.split(".")[o]))}catch(e){throw new n("Invalid token specified: "+e.message)}}n.prototype=new Error,n.prototype.name="InvalidTokenError";/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (o);
//# sourceMappingURL=jwt-decode.esm.js.map


/***/ }),

/***/ "../.hathora/node_modules/utf8-buffer-size/main.js":
/*!*********************************************************!*\
  !*** ../.hathora/node_modules/utf8-buffer-size/main.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ utf8BufferSize)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview The utf8-buffer-size API.
 * @see https://github.com/rochars/utf8-buffer-size
 */

/** @module utf8BufferSize */

/**
 * Returns how many bytes are needed to serialize a UTF-8 string.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @return {number} The number of bytes needed to serialize the string.
 */
function utf8BufferSize(str) {
  /** @type {number} */
  let bytes = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    /** @type {number} */
    let codePoint = str.codePointAt(i);
    if (codePoint < 128) {
      bytes++;
    } else {
      if (codePoint <= 2047) {
        bytes++;
      } else if(codePoint <= 65535) {
        bytes+=2;
      } else if(codePoint <= 1114111) {
        i++;
        bytes+=3;
      }
      bytes++;
    }
  }
  return bytes;
}


/***/ }),

/***/ "../.hathora/node_modules/utf8-buffer/index.js":
/*!*****************************************************!*\
  !*** ../.hathora/node_modules/utf8-buffer/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pack": () => (/* binding */ pack),
/* harmony export */   "unpack": () => (/* binding */ unpack)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview Functions to serialize and deserialize UTF-8 strings.
 * @see https://github.com/rochars/utf8-buffer
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 */

/** @module utf8-buffer */

/**
 * Read a string of UTF-8 characters from a byte buffer.
 * Invalid characters are replaced with 'REPLACEMENT CHARACTER' (U+FFFD).
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://stackoverflow.com/a/34926911
 * @param {!Uint8Array|!Array<number>} buffer A byte buffer.
 * @param {number=} start The buffer index to start reading.
 * @param {?number=} end The buffer index to stop reading.
 *   Assumes the buffer length if undefined.
 * @return {string}
 */
function unpack(buffer, start=0, end=buffer.length) {
  /** @type {string} */
  let str = '';
  for(let index = start; index < end;) {
    /** @type {number} */
    let lowerBoundary = 0x80;
    /** @type {number} */
    let upperBoundary = 0xBF;
    /** @type {boolean} */
    let replace = false;
    /** @type {number} */
    let charCode = buffer[index++];
    if (charCode >= 0x00 && charCode <= 0x7F) {
      str += String.fromCharCode(charCode);
    } else {
      /** @type {number} */
      let count = 0;
      if (charCode >= 0xC2 && charCode <= 0xDF) {
        count = 1;
      } else if (charCode >= 0xE0 && charCode <= 0xEF ) {
        count = 2;
        if (buffer[index] === 0xE0) {
          lowerBoundary = 0xA0;
        }
        if (buffer[index] === 0xED) {
          upperBoundary = 0x9F;
        }
      } else if (charCode >= 0xF0 && charCode <= 0xF4 ) {
        count = 3;
        if (buffer[index] === 0xF0) {
          lowerBoundary = 0x90;
        }
        if (buffer[index] === 0xF4) {
          upperBoundary = 0x8F;
        }
      } else {
        replace = true;
      }
      charCode = charCode & (1 << (8 - count - 1)) - 1;
      for (let i = 0; i < count; i++) {
        if (buffer[index] < lowerBoundary || buffer[index] > upperBoundary) {
          replace = true;
        }
        charCode = (charCode << 6) | (buffer[index] & 0x3f);
        index++;
      }
      if (replace) {
        str += String.fromCharCode(0xFFFD);
      } 
      else if (charCode <= 0xffff) {
        str += String.fromCharCode(charCode);
      } else {
        charCode -= 0x10000;
        str += String.fromCharCode(
          ((charCode >> 10) & 0x3ff) + 0xd800,
          (charCode & 0x3ff) + 0xdc00);
      }
    }
  }
  return str;
}

/**
 * Write a string of UTF-8 characters to a byte buffer.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @param {!Uint8Array|!Array<number>} buffer The buffer to pack the string to.
 * @param {number=} index The buffer index to start writing.
 * @return {number} The next index to write in the buffer.
 */
function pack(str, buffer, index=0) {
  for (let i = 0, len = str.length; i < len; i++) {
    /** @type {number} */
    let codePoint = str.codePointAt(i);
    if (codePoint < 128) {
      buffer[index] = codePoint;
      index++;
    } else {
      /** @type {number} */
      let count = 0;
      /** @type {number} */
      let offset = 0;
      if (codePoint <= 0x07FF) {
        count = 1;
        offset = 0xC0;
      } else if(codePoint <= 0xFFFF) {
        count = 2;
        offset = 0xE0;
      } else if(codePoint <= 0x10FFFF) {
        count = 3;
        offset = 0xF0;
        i++;
      }
      buffer[index] = (codePoint >> (6 * count)) + offset;
      index++;
      while (count > 0) {
        buffer[index] = 0x80 | (codePoint >> (6 * (count - 1)) & 0x3F);
        index++;
        count--;
      }
    }
  }
  return index;
}


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/*style.css*/\r\n.Header {\r\n    background-color: rgb(73, 73, 73);\r\n}\r\n\r\n.LoginPageheader {\r\n    color: white;\r\n    font-family: 'Helvetica';\r\n}\r\n\r\n.loginButton {\r\n    width: 100px;\r\n    height: 50px;\r\n    margin-top: 15px;\r\n    color: white;\r\n    background-color: rgb(10, 56, 71);\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA,YAAY;AACZ;IACI,iCAAiC;AACrC;;AAEA;IACI,YAAY;IACZ,wBAAwB;AAC5B;;AAEA;IACI,YAAY;IACZ,YAAY;IACZ,gBAAgB;IAChB,YAAY;IACZ,iCAAiC;AACrC","sourcesContent":["/*style.css*/\r\n.Header {\r\n    background-color: rgb(73, 73, 73);\r\n}\r\n\r\n.LoginPageheader {\r\n    color: white;\r\n    font-family: 'Helvetica';\r\n}\r\n\r\n.loginButton {\r\n    width: 100px;\r\n    height: 50px;\r\n    margin-top: 15px;\r\n    color: white;\r\n    background-color: rgb(10, 56, 71);\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "../../api/base.ts":
/*!*************************!*\
  !*** ../../api/base.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COORDINATOR_HOST": () => (/* binding */ COORDINATOR_HOST),
/* harmony export */   "Message": () => (/* binding */ Message),
/* harmony export */   "Method": () => (/* binding */ Method),
/* harmony export */   "NO_DIFF": () => (/* binding */ NO_DIFF),
/* harmony export */   "Response": () => (/* binding */ Response),
/* harmony export */   "getUserDisplayName": () => (/* binding */ getUserDisplayName),
/* harmony export */   "lookupUser": () => (/* binding */ lookupUser)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "../../api/node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);

var COORDINATOR_HOST = "coordinator.hathora.dev";
var NO_DIFF = Symbol("NODIFF");
var Method;
(function (Method) {
    Method[Method["JOIN_GAME"] = 0] = "JOIN_GAME";
    Method[Method["SELECT_ROLE"] = 1] = "SELECT_ROLE";
    Method[Method["ADD_A_I"] = 2] = "ADD_A_I";
    Method[Method["START_GAME"] = 3] = "START_GAME";
    Method[Method["SELECT_TOWER_DEFENSE"] = 4] = "SELECT_TOWER_DEFENSE";
    Method[Method["SELECT_MONSTER_CARD"] = 5] = "SELECT_MONSTER_CARD";
    Method[Method["SELECT_PLAYER_CARD"] = 6] = "SELECT_PLAYER_CARD";
    Method[Method["DISCARD"] = 7] = "DISCARD";
    Method[Method["DRAW_CARD"] = 8] = "DRAW_CARD";
    Method[Method["END_TURN"] = 9] = "END_TURN";
    Method[Method["START_TURN"] = 10] = "START_TURN";
    Method[Method["USER_CHOICE"] = 11] = "USER_CHOICE";
    Method[Method["APPLY_ATTACK"] = 12] = "APPLY_ATTACK";
    Method[Method["BUY_ABILITY_CARD"] = 13] = "BUY_ABILITY_CARD";
})(Method || (Method = {}));
var Response = {
    ok: function () { return ({ type: "ok" }); },
    error: function (error) { return ({ type: "error", error: error }); },
};
var Message = {
    response: function (msgId, response) { return ({ type: "response", msgId: msgId, response: response }); },
    event: function (event) { return ({ type: "event", event: event }); },
};
function lookupUser(userId) {
    return axios__WEBPACK_IMPORTED_MODULE_0___default().get("https://".concat(COORDINATOR_HOST, "/users/").concat(userId)).then(function (res) { return res.data; });
}
function getUserDisplayName(user) {
    switch (user.type) {
        case "anonymous":
            return user.name;
    }
}


/***/ }),

/***/ "../../api/types.ts":
/*!**************************!*\
  !*** ../../api/types.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbilityCard": () => (/* binding */ AbilityCard),
/* harmony export */   "CardType": () => (/* binding */ CardType),
/* harmony export */   "Cards": () => (/* binding */ Cards),
/* harmony export */   "Cardstatus": () => (/* binding */ Cardstatus),
/* harmony export */   "Conditions": () => (/* binding */ Conditions),
/* harmony export */   "DieFaces": () => (/* binding */ DieFaces),
/* harmony export */   "Effect": () => (/* binding */ Effect),
/* harmony export */   "ErrorMessage": () => (/* binding */ ErrorMessage),
/* harmony export */   "Events": () => (/* binding */ Events),
/* harmony export */   "GameState": () => (/* binding */ GameState),
/* harmony export */   "GameStates": () => (/* binding */ GameStates),
/* harmony export */   "IAddAIRequest": () => (/* binding */ IAddAIRequest),
/* harmony export */   "IApplyAttackRequest": () => (/* binding */ IApplyAttackRequest),
/* harmony export */   "IBuyAbilityCardRequest": () => (/* binding */ IBuyAbilityCardRequest),
/* harmony export */   "IDiscardRequest": () => (/* binding */ IDiscardRequest),
/* harmony export */   "IDrawCardRequest": () => (/* binding */ IDrawCardRequest),
/* harmony export */   "IEndTurnRequest": () => (/* binding */ IEndTurnRequest),
/* harmony export */   "IInitializeRequest": () => (/* binding */ IInitializeRequest),
/* harmony export */   "IJoinGameRequest": () => (/* binding */ IJoinGameRequest),
/* harmony export */   "ISelectMonsterCardRequest": () => (/* binding */ ISelectMonsterCardRequest),
/* harmony export */   "ISelectPlayerCardRequest": () => (/* binding */ ISelectPlayerCardRequest),
/* harmony export */   "ISelectRoleRequest": () => (/* binding */ ISelectRoleRequest),
/* harmony export */   "ISelectTowerDefenseRequest": () => (/* binding */ ISelectTowerDefenseRequest),
/* harmony export */   "IStartGameRequest": () => (/* binding */ IStartGameRequest),
/* harmony export */   "IStartTurnRequest": () => (/* binding */ IStartTurnRequest),
/* harmony export */   "IUserChoiceRequest": () => (/* binding */ IUserChoiceRequest),
/* harmony export */   "LocationCard": () => (/* binding */ LocationCard),
/* harmony export */   "MonsterCard": () => (/* binding */ MonsterCard),
/* harmony export */   "Player": () => (/* binding */ Player),
/* harmony export */   "PlayerDecks": () => (/* binding */ PlayerDecks),
/* harmony export */   "PlayerStatus": () => (/* binding */ PlayerStatus),
/* harmony export */   "Roles": () => (/* binding */ Roles),
/* harmony export */   "RoundState": () => (/* binding */ RoundState),
/* harmony export */   "StatusEffect": () => (/* binding */ StatusEffect),
/* harmony export */   "TowerDefense": () => (/* binding */ TowerDefense),
/* harmony export */   "UIEvents": () => (/* binding */ UIEvents),
/* harmony export */   "UserResponse": () => (/* binding */ UserResponse),
/* harmony export */   "decodeStateSnapshot": () => (/* binding */ decodeStateSnapshot),
/* harmony export */   "decodeStateUpdate": () => (/* binding */ decodeStateUpdate),
/* harmony export */   "effectType": () => (/* binding */ effectType),
/* harmony export */   "encodeStateSnapshot": () => (/* binding */ encodeStateSnapshot),
/* harmony export */   "encodeStateUpdate": () => (/* binding */ encodeStateUpdate),
/* harmony export */   "targetType": () => (/* binding */ targetType)
/* harmony export */ });
/* harmony import */ var bin_serde__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bin-serde */ "../../api/node_modules/bin-serde/lib/index.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base */ "../../api/base.ts");
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};


var CardType;
(function (CardType) {
    CardType[CardType["Spell"] = 0] = "Spell";
    CardType[CardType["Weapon"] = 1] = "Weapon";
    CardType[CardType["Item"] = 2] = "Item";
    CardType[CardType["Friend"] = 3] = "Friend";
})(CardType || (CardType = {}));
var Cardstatus;
(function (Cardstatus) {
    Cardstatus[Cardstatus["FaceUp"] = 0] = "FaceUp";
    Cardstatus[Cardstatus["FaceDown"] = 1] = "FaceDown";
    Cardstatus[Cardstatus["FaceUpDisabled"] = 2] = "FaceUpDisabled";
})(Cardstatus || (Cardstatus = {}));
var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus[PlayerStatus["Undefined"] = 0] = "Undefined";
    PlayerStatus[PlayerStatus["Connected"] = 1] = "Connected";
    PlayerStatus[PlayerStatus["RoleSelection"] = 2] = "RoleSelection";
    PlayerStatus[PlayerStatus["ReadyToPlay"] = 3] = "ReadyToPlay";
})(PlayerStatus || (PlayerStatus = {}));
var Roles;
(function (Roles) {
    Roles[Roles["Barbarian"] = 0] = "Barbarian";
    Roles[Roles["Wizard"] = 1] = "Wizard";
    Roles[Roles["Paladin"] = 2] = "Paladin";
    Roles[Roles["Rogue"] = 3] = "Rogue";
})(Roles || (Roles = {}));
var RoundState;
(function (RoundState) {
    RoundState[RoundState["Idle"] = 0] = "Idle";
    RoundState[RoundState["TowerDefense"] = 1] = "TowerDefense";
    RoundState[RoundState["MonsterCard"] = 2] = "MonsterCard";
    RoundState[RoundState["PlayerTurn"] = 3] = "PlayerTurn";
    RoundState[RoundState["End"] = 4] = "End";
})(RoundState || (RoundState = {}));
var GameStates;
(function (GameStates) {
    GameStates[GameStates["Idle"] = 0] = "Idle";
    GameStates[GameStates["PlayersJoining"] = 1] = "PlayersJoining";
    GameStates[GameStates["Setup"] = 2] = "Setup";
    GameStates[GameStates["ReadyForRound"] = 3] = "ReadyForRound";
    GameStates[GameStates["InProgress"] = 4] = "InProgress";
    GameStates[GameStates["Completed"] = 5] = "Completed";
})(GameStates || (GameStates = {}));
var DieFaces;
(function (DieFaces) {
    DieFaces[DieFaces["GainHealth"] = 0] = "GainHealth";
    DieFaces[DieFaces["LoseHealth"] = 1] = "LoseHealth";
    DieFaces[DieFaces["GainHealthAll"] = 2] = "GainHealthAll";
    DieFaces[DieFaces["GainAttack"] = 3] = "GainAttack";
    DieFaces[DieFaces["LoseAttack"] = 4] = "LoseAttack";
    DieFaces[DieFaces["GainAbility"] = 5] = "GainAbility";
    DieFaces[DieFaces["LoseAbility"] = 6] = "LoseAbility";
    DieFaces[DieFaces["DrawCard"] = 7] = "DrawCard";
    DieFaces[DieFaces["DiscardCard"] = 8] = "DiscardCard";
    DieFaces[DieFaces["AddLocation"] = 9] = "AddLocation";
    DieFaces[DieFaces["RemoveLocation"] = 10] = "RemoveLocation";
})(DieFaces || (DieFaces = {}));
var StatusEffect;
(function (StatusEffect) {
    StatusEffect[StatusEffect["Stunned"] = 0] = "Stunned";
    StatusEffect[StatusEffect["NoHeal"] = 1] = "NoHeal";
    StatusEffect[StatusEffect["NoDraw"] = 2] = "NoDraw";
    StatusEffect[StatusEffect["DamageCap"] = 3] = "DamageCap";
    StatusEffect[StatusEffect["MonsterDefeatPerk"] = 4] = "MonsterDefeatPerk";
    StatusEffect[StatusEffect["LocationCursed"] = 5] = "LocationCursed";
    StatusEffect[StatusEffect["NoLocation"] = 6] = "NoLocation";
    StatusEffect[StatusEffect["PurchaseCurse"] = 7] = "PurchaseCurse";
    StatusEffect[StatusEffect["DiscardCurse"] = 8] = "DiscardCurse";
    StatusEffect[StatusEffect["ImmuneUntilLast"] = 9] = "ImmuneUntilLast";
    StatusEffect[StatusEffect["MonsterRally"] = 10] = "MonsterRally";
})(StatusEffect || (StatusEffect = {}));
var Conditions;
(function (Conditions) {
    Conditions[Conditions["Standard"] = 0] = "Standard";
    Conditions[Conditions["IfTopCardOfDeckAbilityScoreGT4"] = 1] = "IfTopCardOfDeckAbilityScoreGT4";
    Conditions[Conditions["IfTopCardOfDeckAbilityScoreGT1"] = 2] = "IfTopCardOfDeckAbilityScoreGT1";
    Conditions[Conditions["ForEachCardInHandAbilityScoreGT4"] = 3] = "ForEachCardInHandAbilityScoreGT4";
    Conditions[Conditions["ForEachCardInHandAbilityScoreGT1"] = 4] = "ForEachCardInHandAbilityScoreGT1";
    Conditions[Conditions["IfTopCardSpell"] = 5] = "IfTopCardSpell";
    Conditions[Conditions["IfMonsterKilled"] = 6] = "IfMonsterKilled";
    Conditions[Conditions["IfLocationAdded"] = 7] = "IfLocationAdded";
    Conditions[Conditions["Choose2"] = 8] = "Choose2";
    Conditions[Conditions["Choose3"] = 9] = "Choose3";
    Conditions[Conditions["AllChoose"] = 10] = "AllChoose";
    Conditions[Conditions["IfPlayerDiscards"] = 11] = "IfPlayerDiscards";
    Conditions[Conditions["ForEachFriendInHand"] = 12] = "ForEachFriendInHand";
    Conditions[Conditions["ForEachSpell"] = 13] = "ForEachSpell";
    Conditions[Conditions["ForEachWeapon"] = 14] = "ForEachWeapon";
    Conditions[Conditions["IfNewMonsterCardorNewMonsterRallyPlayed"] = 15] = "IfNewMonsterCardorNewMonsterRallyPlayed";
    Conditions[Conditions["BlockCardDraw"] = 16] = "BlockCardDraw";
    Conditions[Conditions["BlockHealing"] = 17] = "BlockHealing";
    Conditions[Conditions["AllDrawOne"] = 18] = "AllDrawOne";
    Conditions[Conditions["CannotAddLocation"] = 19] = "CannotAddLocation";
    Conditions[Conditions["IfPurchasedCardGT4"] = 20] = "IfPurchasedCardGT4";
    Conditions[Conditions["DrawFromDiscard"] = 21] = "DrawFromDiscard";
    Conditions[Conditions["AllDrawFromDiscard"] = 22] = "AllDrawFromDiscard";
    Conditions[Conditions["ImmuneUntilLast"] = 23] = "ImmuneUntilLast";
})(Conditions || (Conditions = {}));
var targetType;
(function (targetType) {
    targetType[targetType["AllHeroes"] = 0] = "AllHeroes";
    targetType[targetType["ActiveHero"] = 1] = "ActiveHero";
    targetType[targetType["OtherHeroes"] = 2] = "OtherHeroes";
    targetType[targetType["AnyHero"] = 3] = "AnyHero";
    targetType[targetType["RandomHero"] = 4] = "RandomHero";
})(targetType || (targetType = {}));
var effectType;
(function (effectType) {
    effectType[effectType["Passive"] = 0] = "Passive";
    effectType[effectType["Active"] = 1] = "Active";
})(effectType || (effectType = {}));
var Cards = {
    default: function () {
        return {
            type: "AbilityCard",
            val: AbilityCard.default(),
        };
    },
    values: function () {
        return ["AbilityCard", "TowerDefense", "MonsterCard", "LocationCard"];
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        if (obj.type === "AbilityCard") {
            writeUInt8(buf, 0);
            var x = obj.val;
            AbilityCard.encode(x, buf);
        }
        else if (obj.type === "TowerDefense") {
            writeUInt8(buf, 1);
            var x = obj.val;
            TowerDefense.encode(x, buf);
        }
        else if (obj.type === "MonsterCard") {
            writeUInt8(buf, 2);
            var x = obj.val;
            MonsterCard.encode(x, buf);
        }
        else if (obj.type === "LocationCard") {
            writeUInt8(buf, 3);
            var x = obj.val;
            LocationCard.encode(x, buf);
        }
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        if (obj.type === "AbilityCard") {
            writeUInt8(buf, 0);
            writeBoolean(buf, obj.val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
            if (obj.val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
                var x = obj.val;
                AbilityCard.encodeDiff(x, buf);
            }
        }
        else if (obj.type === "TowerDefense") {
            writeUInt8(buf, 1);
            writeBoolean(buf, obj.val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
            if (obj.val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
                var x = obj.val;
                TowerDefense.encodeDiff(x, buf);
            }
        }
        else if (obj.type === "MonsterCard") {
            writeUInt8(buf, 2);
            writeBoolean(buf, obj.val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
            if (obj.val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
                var x = obj.val;
                MonsterCard.encodeDiff(x, buf);
            }
        }
        else if (obj.type === "LocationCard") {
            writeUInt8(buf, 3);
            writeBoolean(buf, obj.val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
            if (obj.val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
                var x = obj.val;
                LocationCard.encodeDiff(x, buf);
            }
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var type = parseUInt8(sb);
        if (type === 0) {
            return { type: "AbilityCard", val: AbilityCard.decode(sb) };
        }
        else if (type === 1) {
            return { type: "TowerDefense", val: TowerDefense.decode(sb) };
        }
        else if (type === 2) {
            return { type: "MonsterCard", val: MonsterCard.decode(sb) };
        }
        else if (type === 3) {
            return { type: "LocationCard", val: LocationCard.decode(sb) };
        }
        throw new Error("Invalid union");
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var type = parseUInt8(sb);
        if (type === 0) {
            return { type: "AbilityCard", val: parseBoolean(sb) ? AbilityCard.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF };
        }
        else if (type === 1) {
            return { type: "TowerDefense", val: parseBoolean(sb) ? TowerDefense.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF };
        }
        else if (type === 2) {
            return { type: "MonsterCard", val: parseBoolean(sb) ? MonsterCard.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF };
        }
        else if (type === 3) {
            return { type: "LocationCard", val: parseBoolean(sb) ? LocationCard.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF };
        }
        throw new Error("Invalid union");
    },
};
var ErrorMessage = {
    default: function () {
        return {
            status: 0,
            message: "",
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeInt(buf, obj.status);
        writeString(buf, obj.message);
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.status !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.message !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.status !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.status);
        }
        if (obj.message !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.message);
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            status: parseInt(sb),
            message: parseString(sb),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(2);
        return {
            status: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            message: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var UserResponse = {
    default: function () {
        return {
            userData: false,
            cardPlayed: Cards.default(),
            selectedUsers: [],
            selectedMonsters: [],
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeBoolean(buf, obj.userData);
        Cards.encode(obj.cardPlayed, buf);
        writeArray(buf, obj.selectedUsers, function (x) { return writeString(buf, x); });
        writeArray(buf, obj.selectedMonsters, function (x) { return MonsterCard.encode(x, buf); });
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.userData !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.cardPlayed !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.selectedUsers !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.selectedMonsters !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.userData !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeBoolean(buf, obj.userData);
        }
        if (obj.cardPlayed !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Cards.encodeDiff(obj.cardPlayed, buf);
        }
        if (obj.selectedUsers !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.selectedUsers, function (x) { return writeString(buf, x); });
        }
        if (obj.selectedMonsters !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.selectedMonsters, function (x) { return MonsterCard.encodeDiff(x, buf); });
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            userData: parseBoolean(sb),
            cardPlayed: Cards.decode(sb),
            selectedUsers: parseArray(sb, function () { return parseString(sb); }),
            selectedMonsters: parseArray(sb, function () { return MonsterCard.decode(sb); }),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(4);
        return {
            userData: tracker.shift() ? parseBoolean(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            cardPlayed: tracker.shift() ? Cards.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            selectedUsers: tracker.shift() ? parseArrayDiff(sb, function () { return parseString(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            selectedMonsters: tracker.shift() ? parseArrayDiff(sb, function () { return MonsterCard.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var Effect = {
    default: function () {
        return {
            target: 0,
            cb: "",
            userPrompt: false,
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeUInt8(buf, obj.target);
        writeString(buf, obj.cb);
        writeBoolean(buf, obj.userPrompt);
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.target !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.cb !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.userPrompt !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.target !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.target);
        }
        if (obj.cb !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.cb);
        }
        if (obj.userPrompt !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeBoolean(buf, obj.userPrompt);
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            target: parseUInt8(sb),
            cb: parseString(sb),
            userPrompt: parseBoolean(sb),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(3);
        return {
            target: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            cb: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            userPrompt: tracker.shift() ? parseBoolean(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var MonsterCard = {
    default: function () {
        return {
            Title: "",
            Health: 0,
            Damage: 0,
            Level: 0,
            CardStatus: 0,
            ActiveEffect: undefined,
            PassiveEffect: undefined,
            Rewards: Effect.default(),
            StatusEffects: [],
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.Title);
        writeInt(buf, obj.Health);
        writeInt(buf, obj.Damage);
        writeInt(buf, obj.Level);
        writeUInt8(buf, obj.CardStatus);
        writeOptional(buf, obj.ActiveEffect, function (x) { return Effect.encode(x, buf); });
        writeOptional(buf, obj.PassiveEffect, function (x) { return Effect.encode(x, buf); });
        Effect.encode(obj.Rewards, buf);
        writeArray(buf, obj.StatusEffects, function (x) { return writeUInt8(buf, x); });
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.Title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Damage !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.CardStatus !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Rewards !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.StatusEffects !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.Title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.Title);
        }
        if (obj.Health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.Health);
        }
        if (obj.Damage !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.Damage);
        }
        if (obj.Level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.Level);
        }
        if (obj.CardStatus !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.CardStatus);
        }
        if (obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.ActiveEffect, function (x) { return Effect.encodeDiff(x, buf); });
        }
        if (obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.PassiveEffect, function (x) { return Effect.encodeDiff(x, buf); });
        }
        if (obj.Rewards !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Effect.encodeDiff(obj.Rewards, buf);
        }
        if (obj.StatusEffects !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.StatusEffects, function (x) { return writeUInt8(buf, x); });
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            Title: parseString(sb),
            Health: parseInt(sb),
            Damage: parseInt(sb),
            Level: parseInt(sb),
            CardStatus: parseUInt8(sb),
            ActiveEffect: parseOptional(sb, function () { return Effect.decode(sb); }),
            PassiveEffect: parseOptional(sb, function () { return Effect.decode(sb); }),
            Rewards: Effect.decode(sb),
            StatusEffects: parseArray(sb, function () { return parseUInt8(sb); }),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(9);
        return {
            Title: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Health: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Damage: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Level: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            CardStatus: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            ActiveEffect: tracker.shift() ? parseOptional(sb, function () { return Effect.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            PassiveEffect: tracker.shift() ? parseOptional(sb, function () { return Effect.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Rewards: tracker.shift() ? Effect.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            StatusEffects: tracker.shift() ? parseArrayDiff(sb, function () { return parseUInt8(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var AbilityCard = {
    default: function () {
        return {
            Title: "",
            Catagory: "",
            Level: 0,
            Cost: 0,
            ActiveEffect: undefined,
            PassiveEffect: undefined,
            CardStatus: 0,
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.Title);
        writeString(buf, obj.Catagory);
        writeInt(buf, obj.Level);
        writeInt(buf, obj.Cost);
        writeOptional(buf, obj.ActiveEffect, function (x) { return Effect.encode(x, buf); });
        writeOptional(buf, obj.PassiveEffect, function (x) { return Effect.encode(x, buf); });
        writeUInt8(buf, obj.CardStatus);
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.Title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Catagory !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Cost !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.CardStatus !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.Title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.Title);
        }
        if (obj.Catagory !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.Catagory);
        }
        if (obj.Level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.Level);
        }
        if (obj.Cost !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.Cost);
        }
        if (obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.ActiveEffect, function (x) { return Effect.encodeDiff(x, buf); });
        }
        if (obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.PassiveEffect, function (x) { return Effect.encodeDiff(x, buf); });
        }
        if (obj.CardStatus !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.CardStatus);
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            Title: parseString(sb),
            Catagory: parseString(sb),
            Level: parseInt(sb),
            Cost: parseInt(sb),
            ActiveEffect: parseOptional(sb, function () { return Effect.decode(sb); }),
            PassiveEffect: parseOptional(sb, function () { return Effect.decode(sb); }),
            CardStatus: parseUInt8(sb),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(7);
        return {
            Title: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Catagory: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Level: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Cost: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            ActiveEffect: tracker.shift() ? parseOptional(sb, function () { return Effect.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            PassiveEffect: tracker.shift() ? parseOptional(sb, function () { return Effect.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            CardStatus: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var TowerDefense = {
    default: function () {
        return {
            Title: "",
            Level: 0,
            ActiveEffect: undefined,
            PassiveEffect: undefined,
            CardStatus: 0,
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.Title);
        writeInt(buf, obj.Level);
        writeOptional(buf, obj.ActiveEffect, function (x) { return Effect.encode(x, buf); });
        writeOptional(buf, obj.PassiveEffect, function (x) { return Effect.encode(x, buf); });
        writeUInt8(buf, obj.CardStatus);
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.Title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.CardStatus !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.Title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.Title);
        }
        if (obj.Level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.Level);
        }
        if (obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.ActiveEffect, function (x) { return Effect.encodeDiff(x, buf); });
        }
        if (obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.PassiveEffect, function (x) { return Effect.encodeDiff(x, buf); });
        }
        if (obj.CardStatus !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.CardStatus);
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            Title: parseString(sb),
            Level: parseInt(sb),
            ActiveEffect: parseOptional(sb, function () { return Effect.decode(sb); }),
            PassiveEffect: parseOptional(sb, function () { return Effect.decode(sb); }),
            CardStatus: parseUInt8(sb),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(5);
        return {
            Title: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Level: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            ActiveEffect: tracker.shift() ? parseOptional(sb, function () { return Effect.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            PassiveEffect: tracker.shift() ? parseOptional(sb, function () { return Effect.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            CardStatus: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var LocationCard = {
    default: function () {
        return {
            Title: "",
            Level: 0,
            TD: 0,
            Sequence: 0,
            Health: 0,
            ActiveDamage: 0,
            ActiveEffect: undefined,
            PassiveEffect: undefined,
            CardStatus: 0,
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.Title);
        writeInt(buf, obj.Level);
        writeInt(buf, obj.TD);
        writeInt(buf, obj.Sequence);
        writeInt(buf, obj.Health);
        writeInt(buf, obj.ActiveDamage);
        writeOptional(buf, obj.ActiveEffect, function (x) { return Effect.encode(x, buf); });
        writeOptional(buf, obj.PassiveEffect, function (x) { return Effect.encode(x, buf); });
        writeUInt8(buf, obj.CardStatus);
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.Title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.TD !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Sequence !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.ActiveDamage !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.CardStatus !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.Title !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.Title);
        }
        if (obj.Level !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.Level);
        }
        if (obj.TD !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.TD);
        }
        if (obj.Sequence !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.Sequence);
        }
        if (obj.Health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.Health);
        }
        if (obj.ActiveDamage !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.ActiveDamage);
        }
        if (obj.ActiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.ActiveEffect, function (x) { return Effect.encodeDiff(x, buf); });
        }
        if (obj.PassiveEffect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.PassiveEffect, function (x) { return Effect.encodeDiff(x, buf); });
        }
        if (obj.CardStatus !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.CardStatus);
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            Title: parseString(sb),
            Level: parseInt(sb),
            TD: parseInt(sb),
            Sequence: parseInt(sb),
            Health: parseInt(sb),
            ActiveDamage: parseInt(sb),
            ActiveEffect: parseOptional(sb, function () { return Effect.decode(sb); }),
            PassiveEffect: parseOptional(sb, function () { return Effect.decode(sb); }),
            CardStatus: parseUInt8(sb),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(9);
        return {
            Title: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Level: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            TD: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Sequence: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Health: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            ActiveDamage: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            ActiveEffect: tracker.shift() ? parseOptional(sb, function () { return Effect.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            PassiveEffect: tracker.shift() ? parseOptional(sb, function () { return Effect.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            CardStatus: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var PlayerDecks = {
    default: function () {
        return {
            Deck: [],
            Discard: [],
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeArray(buf, obj.Deck, function (x) { return AbilityCard.encode(x, buf); });
        writeArray(buf, obj.Discard, function (x) { return AbilityCard.encode(x, buf); });
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.Deck !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Discard !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.Deck !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.Deck, function (x) { return AbilityCard.encodeDiff(x, buf); });
        }
        if (obj.Discard !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.Discard, function (x) { return AbilityCard.encodeDiff(x, buf); });
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            Deck: parseArray(sb, function () { return AbilityCard.decode(sb); }),
            Discard: parseArray(sb, function () { return AbilityCard.decode(sb); }),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(2);
        return {
            Deck: tracker.shift() ? parseArrayDiff(sb, function () { return AbilityCard.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Discard: tracker.shift() ? parseArrayDiff(sb, function () { return AbilityCard.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var UIEvents = {
    default: function () {
        return {
            type: "",
            value: 0,
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.type);
        writeInt(buf, obj.value);
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.type !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.value !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.type !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.type);
        }
        if (obj.value !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.value);
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            type: parseString(sb),
            value: parseInt(sb),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(2);
        return {
            type: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            value: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var Events = {
    default: function () {
        return {
            user: "",
            effect: UIEvents.default(),
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.user);
        UIEvents.encode(obj.effect, buf);
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.user !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.effect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.user !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.user);
        }
        if (obj.effect !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            UIEvents.encodeDiff(obj.effect, buf);
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            user: parseString(sb),
            effect: UIEvents.decode(sb),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(2);
        return {
            user: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            effect: tracker.shift() ? UIEvents.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var Player = {
    default: function () {
        return {
            Id: "",
            StatusEffects: [],
            PlayerState: 0,
            Health: 0,
            AttackPoints: 0,
            AbilityPoints: 0,
            Hand: [],
            Role: 0,
            LevelBonus: [],
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.Id);
        writeArray(buf, obj.StatusEffects, function (x) { return writeUInt8(buf, x); });
        writeUInt8(buf, obj.PlayerState);
        writeInt(buf, obj.Health);
        writeInt(buf, obj.AttackPoints);
        writeInt(buf, obj.AbilityPoints);
        writeArray(buf, obj.Hand, function (x) { return AbilityCard.encode(x, buf); });
        writeUInt8(buf, obj.Role);
        writeArray(buf, obj.LevelBonus, function (x) { return Effect.encode(x, buf); });
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.Id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.StatusEffects !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.PlayerState !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.AttackPoints !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.AbilityPoints !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Hand !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Role !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.LevelBonus !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.Id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.Id);
        }
        if (obj.StatusEffects !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.StatusEffects, function (x) { return writeUInt8(buf, x); });
        }
        if (obj.PlayerState !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.PlayerState);
        }
        if (obj.Health !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.Health);
        }
        if (obj.AttackPoints !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.AttackPoints);
        }
        if (obj.AbilityPoints !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.AbilityPoints);
        }
        if (obj.Hand !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.Hand, function (x) { return AbilityCard.encodeDiff(x, buf); });
        }
        if (obj.Role !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.Role);
        }
        if (obj.LevelBonus !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.LevelBonus, function (x) { return Effect.encodeDiff(x, buf); });
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            Id: parseString(sb),
            StatusEffects: parseArray(sb, function () { return parseUInt8(sb); }),
            PlayerState: parseUInt8(sb),
            Health: parseInt(sb),
            AttackPoints: parseInt(sb),
            AbilityPoints: parseInt(sb),
            Hand: parseArray(sb, function () { return AbilityCard.decode(sb); }),
            Role: parseUInt8(sb),
            LevelBonus: parseArray(sb, function () { return Effect.decode(sb); }),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(9);
        return {
            Id: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            StatusEffects: tracker.shift() ? parseArrayDiff(sb, function () { return parseUInt8(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            PlayerState: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Health: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            AttackPoints: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            AbilityPoints: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Hand: tracker.shift() ? parseArrayDiff(sb, function () { return AbilityCard.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Role: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            LevelBonus: tracker.shift() ? parseArrayDiff(sb, function () { return Effect.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var GameState = {
    default: function () {
        return {
            gameLevel: 0,
            gameLog: [],
            roundSequence: 0,
            gameSequence: 0,
            abilityPile: [],
            activeMonsters: [],
            locationPile: undefined,
            towerDefensePile: [],
            turn: undefined,
            players: [],
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeInt(buf, obj.gameLevel);
        writeArray(buf, obj.gameLog, function (x) { return writeString(buf, x); });
        writeUInt8(buf, obj.roundSequence);
        writeUInt8(buf, obj.gameSequence);
        writeArray(buf, obj.abilityPile, function (x) { return AbilityCard.encode(x, buf); });
        writeArray(buf, obj.activeMonsters, function (x) { return MonsterCard.encode(x, buf); });
        writeOptional(buf, obj.locationPile, function (x) { return LocationCard.encode(x, buf); });
        writeArray(buf, obj.towerDefensePile, function (x) { return TowerDefense.encode(x, buf); });
        writeOptional(buf, obj.turn, function (x) { return writeString(buf, x); });
        writeArray(buf, obj.players, function (x) { return Player.encode(x, buf); });
        return buf;
    },
    encodeDiff: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        var tracker = [];
        tracker.push(obj.gameLevel !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.gameLog !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.roundSequence !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.gameSequence !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.abilityPile !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.activeMonsters !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.locationPile !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.towerDefensePile !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.turn !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.players !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.gameLevel !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.gameLevel);
        }
        if (obj.gameLog !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.gameLog, function (x) { return writeString(buf, x); });
        }
        if (obj.roundSequence !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.roundSequence);
        }
        if (obj.gameSequence !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.gameSequence);
        }
        if (obj.abilityPile !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.abilityPile, function (x) { return AbilityCard.encodeDiff(x, buf); });
        }
        if (obj.activeMonsters !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.activeMonsters, function (x) { return MonsterCard.encodeDiff(x, buf); });
        }
        if (obj.locationPile !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.locationPile, function (x) { return LocationCard.encodeDiff(x, buf); });
        }
        if (obj.towerDefensePile !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.towerDefensePile, function (x) { return TowerDefense.encodeDiff(x, buf); });
        }
        if (obj.turn !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeOptional(buf, obj.turn, function (x) { return writeString(buf, x); });
        }
        if (obj.players !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.players, function (x) { return Player.encodeDiff(x, buf); });
        }
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            gameLevel: parseInt(sb),
            gameLog: parseArray(sb, function () { return parseString(sb); }),
            roundSequence: parseUInt8(sb),
            gameSequence: parseUInt8(sb),
            abilityPile: parseArray(sb, function () { return AbilityCard.decode(sb); }),
            activeMonsters: parseArray(sb, function () { return MonsterCard.decode(sb); }),
            locationPile: parseOptional(sb, function () { return LocationCard.decode(sb); }),
            towerDefensePile: parseArray(sb, function () { return TowerDefense.decode(sb); }),
            turn: parseOptional(sb, function () { return parseString(sb); }),
            players: parseArray(sb, function () { return Player.decode(sb); }),
        };
    },
    decodeDiff: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        var tracker = sb.readBits(10);
        return {
            gameLevel: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            gameLog: tracker.shift() ? parseArrayDiff(sb, function () { return parseString(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            roundSequence: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            gameSequence: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            abilityPile: tracker.shift() ? parseArrayDiff(sb, function () { return AbilityCard.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            activeMonsters: tracker.shift() ? parseArrayDiff(sb, function () { return MonsterCard.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            locationPile: tracker.shift() ? parseOptional(sb, function () { return LocationCard.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            towerDefensePile: tracker.shift() ? parseArrayDiff(sb, function () { return TowerDefense.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            turn: tracker.shift() ? parseOptional(sb, function () { return parseString(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            players: tracker.shift() ? parseArrayDiff(sb, function () { return Player.decodeDiff(sb); }) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
var IJoinGameRequest = {
    default: function () {
        return {};
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
var ISelectRoleRequest = {
    default: function () {
        return {
            role: 0,
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeUInt8(buf, obj.role);
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            role: parseUInt8(sb),
        };
    },
};
var IAddAIRequest = {
    default: function () {
        return {};
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
var IStartGameRequest = {
    default: function () {
        return {};
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
var ISelectTowerDefenseRequest = {
    default: function () {
        return {
            cardname: "",
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardname);
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardname: parseString(sb),
        };
    },
};
var ISelectMonsterCardRequest = {
    default: function () {
        return {
            cardname: "",
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardname);
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardname: parseString(sb),
        };
    },
};
var ISelectPlayerCardRequest = {
    default: function () {
        return {
            cardname: "",
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardname);
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardname: parseString(sb),
        };
    },
};
var IDiscardRequest = {
    default: function () {
        return {
            cardname: "",
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardname);
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardname: parseString(sb),
        };
    },
};
var IDrawCardRequest = {
    default: function () {
        return {
            cardname: "",
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardname);
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardname: parseString(sb),
        };
    },
};
var IEndTurnRequest = {
    default: function () {
        return {};
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
var IStartTurnRequest = {
    default: function () {
        return {};
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
var IUserChoiceRequest = {
    default: function () {
        return {
            effect: "",
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.effect);
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            effect: parseString(sb),
        };
    },
};
var IApplyAttackRequest = {
    default: function () {
        return {
            cardname: "",
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardname);
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardname: parseString(sb),
        };
    },
};
var IBuyAbilityCardRequest = {
    default: function () {
        return {
            cardname: "",
        };
    },
    encode: function (obj, writer) {
        var buf = writer !== null && writer !== void 0 ? writer : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.cardname);
        return buf;
    },
    decode: function (buf) {
        var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            cardname: parseString(sb),
        };
    },
};
var IInitializeRequest = {
    default: function () {
        return {};
    },
    encode: function (x, buf) {
        return buf !== null && buf !== void 0 ? buf : new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    },
    decode: function (sb) {
        return {};
    },
};
function encodeStateSnapshot(x) {
    var buf = new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    buf.writeUInt8(0);
    try {
        GameState.encode(x, buf);
    }
    catch (e) {
        console.error("Invalid user state", x);
        throw e;
    }
    return buf.toBuffer();
}
function encodeStateUpdate(x, changedAtDiff, messages) {
    var buf = new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    buf.writeUInt8(1);
    buf.writeUVarint(changedAtDiff);
    var responses = messages.flatMap(function (msg) { return (msg.type === "response" ? msg : []); });
    buf.writeUVarint(responses.length);
    responses.forEach(function (_a) {
        var msgId = _a.msgId, response = _a.response;
        buf.writeUInt32(Number(msgId));
        writeOptional(buf, response.type === "error" ? response.error : undefined, function (x) { return writeString(buf, x); });
    });
    var events = messages.flatMap(function (msg) { return (msg.type === "event" ? msg : []); });
    buf.writeUVarint(events.length);
    events.forEach(function (_a) {
        var event = _a.event;
        return buf.writeString(event);
    });
    if (x !== undefined) {
        GameState.encodeDiff(x, buf);
    }
    return buf.toBuffer();
}
function decodeStateUpdate(buf) {
    var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
    var changedAtDiff = sb.readUVarint();
    var responses = __spreadArray([], Array(sb.readUVarint()), true).map(function () {
        var msgId = sb.readUInt32();
        var maybeError = parseOptional(sb, function () { return parseString(sb); });
        return _base__WEBPACK_IMPORTED_MODULE_1__.Message.response(msgId, maybeError === undefined ? _base__WEBPACK_IMPORTED_MODULE_1__.Response.ok() : _base__WEBPACK_IMPORTED_MODULE_1__.Response.error(maybeError));
    });
    var events = __spreadArray([], Array(sb.readUVarint()), true).map(function () { return _base__WEBPACK_IMPORTED_MODULE_1__.Message.event(sb.readString()); });
    var stateDiff = sb.remaining() ? GameState.decodeDiff(sb) : undefined;
    return { stateDiff: stateDiff, changedAtDiff: changedAtDiff, responses: responses, events: events };
}
function decodeStateSnapshot(buf) {
    var sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
    return GameState.decode(sb);
}
function writeUInt8(buf, x) {
    buf.writeUInt8(x);
}
function writeBoolean(buf, x) {
    buf.writeUInt8(x ? 1 : 0);
}
function writeInt(buf, x) {
    buf.writeVarint(x);
}
function writeFloat(buf, x) {
    buf.writeFloat(x);
}
function writeString(buf, x) {
    buf.writeString(x);
}
function writeOptional(buf, x, innerWrite) {
    writeBoolean(buf, x !== undefined);
    if (x !== undefined) {
        innerWrite(x);
    }
}
function writeArray(buf, x, innerWrite) {
    buf.writeUVarint(x.length);
    for (var _i = 0, x_1 = x; _i < x_1.length; _i++) {
        var val = x_1[_i];
        innerWrite(val);
    }
}
function writeArrayDiff(buf, x, innerWrite) {
    buf.writeUVarint(x.length);
    var tracker = [];
    x.forEach(function (val) {
        tracker.push(val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
    });
    buf.writeBits(tracker);
    x.forEach(function (val) {
        if (val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            innerWrite(val);
        }
    });
}
function parseUInt8(buf) {
    return buf.readUInt8();
}
function parseBoolean(buf) {
    return buf.readUInt8() > 0;
}
function parseInt(buf) {
    return buf.readVarint();
}
function parseFloat(buf) {
    return buf.readFloat();
}
function parseString(buf) {
    return buf.readString();
}
function parseOptional(buf, innerParse) {
    return parseBoolean(buf) ? innerParse(buf) : undefined;
}
function parseArray(buf, innerParse) {
    var len = buf.readUVarint();
    var arr = [];
    for (var i = 0; i < len; i++) {
        arr.push(innerParse());
    }
    return arr;
}
function parseArrayDiff(buf, innerParse) {
    var len = buf.readUVarint();
    var tracker = buf.readBits(len);
    var arr = [];
    for (var i = 0; i < len; i++) {
        if (tracker.shift()) {
            arr.push(innerParse());
        }
        else {
            arr.push(_base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        }
    }
    return arr;
}


/***/ }),

/***/ "../.hathora/client.ts":
/*!*****************************!*\
  !*** ../.hathora/client.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HathoraClient": () => (/* binding */ HathoraClient),
/* harmony export */   "HathoraConnection": () => (/* binding */ HathoraConnection)
/* harmony export */ });
/* harmony import */ var isomorphic_ws__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! isomorphic-ws */ "../.hathora/node_modules/isomorphic-ws/browser.js");
/* harmony import */ var isomorphic_ws__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(isomorphic_ws__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var get_random_values__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! get-random-values */ "../.hathora/node_modules/get-random-values/index.js");
/* harmony import */ var get_random_values__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(get_random_values__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! axios */ "../.hathora/node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var jwt_decode__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jwt-decode */ "../.hathora/node_modules/jwt-decode/build/jwt-decode.esm.js");
/* harmony import */ var bin_serde__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! bin-serde */ "../.hathora/node_modules/bin-serde/lib/index.js");
/* harmony import */ var _api_base__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../api/base */ "../../api/base.ts");
/* harmony import */ var _api_types__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../api/types */ "../../api/types.ts");
/* harmony import */ var _failures__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./failures */ "../.hathora/failures.ts");
/* harmony import */ var _patch__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./patch */ "../.hathora/patch.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};

// @ts-ignore








var MATCHMAKER_HOST = "matchmaker.hathora.dev";
var HathoraClient = /** @class */ (function () {
    function HathoraClient() {
        this.appId = "5ae843ac71ae923392c2a2e939e334d24313f7f2c22c4ed92e1523a6e05b7932";
    }
    HathoraClient.getUserFromToken = function (token) {
        return (0,jwt_decode__WEBPACK_IMPORTED_MODULE_3__["default"])(token);
    };
    HathoraClient.prototype.loginAnonymous = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios__WEBPACK_IMPORTED_MODULE_2___default().post("https://".concat(_api_base__WEBPACK_IMPORTED_MODULE_5__.COORDINATOR_HOST, "/").concat(this.appId, "/login/anonymous"))];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data.token];
                }
            });
        });
    };
    HathoraClient.prototype.create = function (token, request) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios__WEBPACK_IMPORTED_MODULE_2___default().post("https://".concat(_api_base__WEBPACK_IMPORTED_MODULE_5__.COORDINATOR_HOST, "/").concat(this.appId, "/create"), _api_types__WEBPACK_IMPORTED_MODULE_6__.IInitializeRequest.encode(request).toBuffer(), { headers: { Authorization: token, "Content-Type": "application/octet-stream" } })];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data.stateId];
                }
            });
        });
    };
    HathoraClient.prototype.connect = function (token, stateId, onUpdate, onConnectionFailure) {
        var socket = new (isomorphic_ws__WEBPACK_IMPORTED_MODULE_0___default())("wss://".concat(_api_base__WEBPACK_IMPORTED_MODULE_5__.COORDINATOR_HOST, "/").concat(this.appId));
        socket.binaryType = "arraybuffer";
        socket.onclose = function (e) { return onConnectionFailure((0,_failures__WEBPACK_IMPORTED_MODULE_7__.transformCoordinatorFailure)(e)); };
        socket.onopen = function () {
            return socket.send(new bin_serde__WEBPACK_IMPORTED_MODULE_4__.Writer()
                .writeUInt8(0)
                .writeString(token)
                .writeUInt64(__spreadArray([], stateId, true).reduce(function (r, v) { return r * 36n + BigInt(parseInt(v, 36)); }, 0n))
                .toBuffer());
        };
        return new HathoraConnection(stateId, socket, onUpdate);
    };
    HathoraClient.prototype.findMatch = function (token, request, numPlayers, onUpdate) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var socket = new (isomorphic_ws__WEBPACK_IMPORTED_MODULE_0___default())("wss://".concat(MATCHMAKER_HOST, "/").concat(_this.appId));
                        socket.binaryType = "arraybuffer";
                        socket.onclose = reject;
                        socket.onopen = function () {
                            return socket.send(new bin_serde__WEBPACK_IMPORTED_MODULE_4__.Writer()
                                .writeString(token)
                                .writeUVarint(numPlayers)
                                .writeBuffer(_api_types__WEBPACK_IMPORTED_MODULE_6__.IInitializeRequest.encode(request).toBuffer())
                                .toBuffer());
                        };
                        socket.onmessage = function (_a) {
                            var data = _a.data;
                            var reader = new bin_serde__WEBPACK_IMPORTED_MODULE_4__.Reader(new Uint8Array(data));
                            var type = reader.readUInt8();
                            if (type === 0) {
                                onUpdate(reader.readUVarint());
                            }
                            else if (type === 1) {
                                resolve(reader.readString());
                            }
                            else {
                                console.error("Unknown message type", type);
                            }
                        };
                    })];
            });
        });
    };
    return HathoraClient;
}());

var HathoraConnection = /** @class */ (function () {
    function HathoraConnection(stateId, socket, onUpdate) {
        var _this = this;
        this.stateId = stateId;
        this.socket = socket;
        this.callbacks = {};
        this.state = undefined;
        this.changedAt = 0;
        socket.onmessage = function (_a) {
            var data = _a.data;
            var reader = new bin_serde__WEBPACK_IMPORTED_MODULE_4__.Reader(new Uint8Array(data));
            var type = reader.readUInt8();
            if (type === 0) {
                _this.state = (0,_api_types__WEBPACK_IMPORTED_MODULE_6__.decodeStateSnapshot)(reader);
                _this.changedAt = 0;
                onUpdate({ stateId: stateId, state: JSON.parse(JSON.stringify(_this.state)), updatedAt: _this.changedAt, events: [] });
            }
            else if (type === 1) {
                var _b = (0,_api_types__WEBPACK_IMPORTED_MODULE_6__.decodeStateUpdate)(reader), stateDiff = _b.stateDiff, changedAtDiff = _b.changedAtDiff, responses = _b.responses, events = _b.events;
                if (stateDiff !== undefined) {
                    _this.state = (0,_patch__WEBPACK_IMPORTED_MODULE_8__.computePatch)(_this.state, stateDiff);
                }
                _this.changedAt += changedAtDiff;
                onUpdate({
                    stateId: stateId,
                    state: JSON.parse(JSON.stringify(_this.state)),
                    updatedAt: _this.changedAt,
                    events: events.map(function (e) { return e.event; }),
                });
                responses.forEach(function (_a) {
                    var msgId = _a.msgId, response = _a.response;
                    if (msgId in _this.callbacks) {
                        _this.callbacks[msgId](response);
                        delete _this.callbacks[msgId];
                    }
                });
            }
            else {
                console.error("Unknown message type", type);
            }
        };
    }
    HathoraConnection.prototype.joinGame = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.JOIN_GAME, _api_types__WEBPACK_IMPORTED_MODULE_6__.IJoinGameRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.selectRole = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.SELECT_ROLE, _api_types__WEBPACK_IMPORTED_MODULE_6__.ISelectRoleRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.addAI = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.ADD_A_I, _api_types__WEBPACK_IMPORTED_MODULE_6__.IAddAIRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.startGame = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.START_GAME, _api_types__WEBPACK_IMPORTED_MODULE_6__.IStartGameRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.selectTowerDefense = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.SELECT_TOWER_DEFENSE, _api_types__WEBPACK_IMPORTED_MODULE_6__.ISelectTowerDefenseRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.selectMonsterCard = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.SELECT_MONSTER_CARD, _api_types__WEBPACK_IMPORTED_MODULE_6__.ISelectMonsterCardRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.selectPlayerCard = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.SELECT_PLAYER_CARD, _api_types__WEBPACK_IMPORTED_MODULE_6__.ISelectPlayerCardRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.discard = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.DISCARD, _api_types__WEBPACK_IMPORTED_MODULE_6__.IDiscardRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.drawCard = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.DRAW_CARD, _api_types__WEBPACK_IMPORTED_MODULE_6__.IDrawCardRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.endTurn = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.END_TURN, _api_types__WEBPACK_IMPORTED_MODULE_6__.IEndTurnRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.startTurn = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.START_TURN, _api_types__WEBPACK_IMPORTED_MODULE_6__.IStartTurnRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.userChoice = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.USER_CHOICE, _api_types__WEBPACK_IMPORTED_MODULE_6__.IUserChoiceRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.applyAttack = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.APPLY_ATTACK, _api_types__WEBPACK_IMPORTED_MODULE_6__.IApplyAttackRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.buyAbilityCard = function (request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.BUY_ABILITY_CARD, _api_types__WEBPACK_IMPORTED_MODULE_6__.IBuyAbilityCardRequest.encode(request).toBuffer());
    };
    HathoraConnection.prototype.disconnect = function () {
        this.socket.onclose = function () { };
        this.socket.close();
    };
    HathoraConnection.prototype.callMethod = function (method, request) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.socket.readyState === _this.socket.CLOSED) {
                reject("Connection is closed");
            }
            else if (_this.socket.readyState !== _this.socket.OPEN) {
                setTimeout(function () { return _this.callMethod(method, request).then(resolve).catch(reject); }, 0);
            }
            else {
                var msgId = get_random_values__WEBPACK_IMPORTED_MODULE_1___default()(new Uint8Array(4));
                _this.socket.send(new Uint8Array(__spreadArray(__spreadArray(__spreadArray([], new Uint8Array([method]), true), msgId, true), request, true)));
                _this.callbacks[new DataView(msgId.buffer).getUint32(0)] = resolve;
            }
        });
    };
    return HathoraConnection;
}());



/***/ }),

/***/ "../.hathora/failures.ts":
/*!*******************************!*\
  !*** ../.hathora/failures.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConnectionFailureType": () => (/* binding */ ConnectionFailureType),
/* harmony export */   "transformCoordinatorFailure": () => (/* binding */ transformCoordinatorFailure)
/* harmony export */ });
var ConnectionFailureType;
(function (ConnectionFailureType) {
    ConnectionFailureType["STATE_NOT_FOUND"] = "STATE_NOT_FOUND";
    ConnectionFailureType["NO_AVAILABLE_STORES"] = "NO_AVAILABLE_STORES";
    ConnectionFailureType["INVALID_USER_DATA"] = "INVALID_USER_DATA";
    ConnectionFailureType["INVALID_STATE_ID"] = "INVALID_STATE_ID";
    ConnectionFailureType["GENERIC_FAILURE"] = "GENERIC_FAILURE";
})(ConnectionFailureType || (ConnectionFailureType = {}));
var transformCoordinatorFailure = function (e) {
    return {
        message: e.reason,
        type: (function (code) {
            switch (code) {
                case 4000:
                    return ConnectionFailureType.STATE_NOT_FOUND;
                case 4001:
                    return ConnectionFailureType.NO_AVAILABLE_STORES;
                case 4002:
                    return ConnectionFailureType.INVALID_USER_DATA;
                case 4003:
                    return ConnectionFailureType.INVALID_STATE_ID;
                default:
                    return ConnectionFailureType.GENERIC_FAILURE;
            }
        })(e.code)
    };
};


/***/ }),

/***/ "../.hathora/patch.ts":
/*!****************************!*\
  !*** ../.hathora/patch.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "computePatch": () => (/* binding */ computePatch)
/* harmony export */ });
/* harmony import */ var _api_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../api/base */ "../../api/base.ts");

function patchCards(obj, patch) {
    if (obj.type !== patch.type) {
        return patch;
    }
    if (patch.type === "AbilityCard" && obj.type === "AbilityCard" && patch.val !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.val = patchAbilityCard(obj.val, patch.val);
    }
    if (patch.type === "TowerDefense" && obj.type === "TowerDefense" && patch.val !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.val = patchTowerDefense(obj.val, patch.val);
    }
    if (patch.type === "MonsterCard" && obj.type === "MonsterCard" && patch.val !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.val = patchMonsterCard(obj.val, patch.val);
    }
    if (patch.type === "LocationCard" && obj.type === "LocationCard" && patch.val !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.val = patchLocationCard(obj.val, patch.val);
    }
    return obj;
}
function patchErrorMessage(obj, patch) {
    if (patch.status !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.status = patch.status;
    }
    if (patch.message !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.message = patch.message;
    }
    return obj;
}
function patchUserResponse(obj, patch) {
    if (patch.userData !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.userData = patch.userData;
    }
    if (patch.cardPlayed !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.cardPlayed = patchCards(obj.cardPlayed, patch.cardPlayed);
    }
    if (patch.selectedUsers !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.selectedUsers = patchArray(obj.selectedUsers, patch.selectedUsers, function (a, b) { return b; });
    }
    if (patch.selectedMonsters !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.selectedMonsters = patchArray(obj.selectedMonsters, patch.selectedMonsters, function (a, b) { return patchMonsterCard(a, b); });
    }
    return obj;
}
function patchEffect(obj, patch) {
    if (patch.target !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.target = patch.target;
    }
    if (patch.cb !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.cb = patch.cb;
    }
    if (patch.userPrompt !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.userPrompt = patch.userPrompt;
    }
    return obj;
}
function patchMonsterCard(obj, patch) {
    if (patch.Title !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Title = patch.Title;
    }
    if (patch.Health !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Health = patch.Health;
    }
    if (patch.Damage !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Damage = patch.Damage;
    }
    if (patch.Level !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Level = patch.Level;
    }
    if (patch.CardStatus !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.CardStatus = patch.CardStatus;
    }
    if (patch.ActiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.ActiveEffect = patchOptional(obj.ActiveEffect, patch.ActiveEffect, function (a, b) { return patchEffect(a, b); });
    }
    if (patch.PassiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.PassiveEffect = patchOptional(obj.PassiveEffect, patch.PassiveEffect, function (a, b) { return patchEffect(a, b); });
    }
    if (patch.Rewards !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Rewards = patchEffect(obj.Rewards, patch.Rewards);
    }
    if (patch.StatusEffects !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.StatusEffects = patchArray(obj.StatusEffects, patch.StatusEffects, function (a, b) { return b; });
    }
    return obj;
}
function patchAbilityCard(obj, patch) {
    if (patch.Title !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Title = patch.Title;
    }
    if (patch.Catagory !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Catagory = patch.Catagory;
    }
    if (patch.Level !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Level = patch.Level;
    }
    if (patch.Cost !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Cost = patch.Cost;
    }
    if (patch.ActiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.ActiveEffect = patchOptional(obj.ActiveEffect, patch.ActiveEffect, function (a, b) { return patchEffect(a, b); });
    }
    if (patch.PassiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.PassiveEffect = patchOptional(obj.PassiveEffect, patch.PassiveEffect, function (a, b) { return patchEffect(a, b); });
    }
    if (patch.CardStatus !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.CardStatus = patch.CardStatus;
    }
    return obj;
}
function patchTowerDefense(obj, patch) {
    if (patch.Title !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Title = patch.Title;
    }
    if (patch.Level !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Level = patch.Level;
    }
    if (patch.ActiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.ActiveEffect = patchOptional(obj.ActiveEffect, patch.ActiveEffect, function (a, b) { return patchEffect(a, b); });
    }
    if (patch.PassiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.PassiveEffect = patchOptional(obj.PassiveEffect, patch.PassiveEffect, function (a, b) { return patchEffect(a, b); });
    }
    if (patch.CardStatus !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.CardStatus = patch.CardStatus;
    }
    return obj;
}
function patchLocationCard(obj, patch) {
    if (patch.Title !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Title = patch.Title;
    }
    if (patch.Level !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Level = patch.Level;
    }
    if (patch.TD !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.TD = patch.TD;
    }
    if (patch.Sequence !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Sequence = patch.Sequence;
    }
    if (patch.Health !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Health = patch.Health;
    }
    if (patch.ActiveDamage !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.ActiveDamage = patch.ActiveDamage;
    }
    if (patch.ActiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.ActiveEffect = patchOptional(obj.ActiveEffect, patch.ActiveEffect, function (a, b) { return patchEffect(a, b); });
    }
    if (patch.PassiveEffect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.PassiveEffect = patchOptional(obj.PassiveEffect, patch.PassiveEffect, function (a, b) { return patchEffect(a, b); });
    }
    if (patch.CardStatus !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.CardStatus = patch.CardStatus;
    }
    return obj;
}
function patchPlayerDecks(obj, patch) {
    if (patch.Deck !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Deck = patchArray(obj.Deck, patch.Deck, function (a, b) { return patchAbilityCard(a, b); });
    }
    if (patch.Discard !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Discard = patchArray(obj.Discard, patch.Discard, function (a, b) { return patchAbilityCard(a, b); });
    }
    return obj;
}
function patchUIEvents(obj, patch) {
    if (patch.type !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.type = patch.type;
    }
    if (patch.value !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.value = patch.value;
    }
    return obj;
}
function patchEvents(obj, patch) {
    if (patch.user !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.user = patch.user;
    }
    if (patch.effect !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.effect = patchUIEvents(obj.effect, patch.effect);
    }
    return obj;
}
function patchPlayer(obj, patch) {
    if (patch.Id !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Id = patch.Id;
    }
    if (patch.StatusEffects !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.StatusEffects = patchArray(obj.StatusEffects, patch.StatusEffects, function (a, b) { return b; });
    }
    if (patch.PlayerState !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.PlayerState = patch.PlayerState;
    }
    if (patch.Health !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Health = patch.Health;
    }
    if (patch.AttackPoints !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.AttackPoints = patch.AttackPoints;
    }
    if (patch.AbilityPoints !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.AbilityPoints = patch.AbilityPoints;
    }
    if (patch.Hand !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Hand = patchArray(obj.Hand, patch.Hand, function (a, b) { return patchAbilityCard(a, b); });
    }
    if (patch.Role !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Role = patch.Role;
    }
    if (patch.LevelBonus !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.LevelBonus = patchArray(obj.LevelBonus, patch.LevelBonus, function (a, b) { return patchEffect(a, b); });
    }
    return obj;
}
function patchGameState(obj, patch) {
    if (patch.gameLevel !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.gameLevel = patch.gameLevel;
    }
    if (patch.gameLog !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.gameLog = patchArray(obj.gameLog, patch.gameLog, function (a, b) { return b; });
    }
    if (patch.roundSequence !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.roundSequence = patch.roundSequence;
    }
    if (patch.gameSequence !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.gameSequence = patch.gameSequence;
    }
    if (patch.abilityPile !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.abilityPile = patchArray(obj.abilityPile, patch.abilityPile, function (a, b) { return patchAbilityCard(a, b); });
    }
    if (patch.activeMonsters !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.activeMonsters = patchArray(obj.activeMonsters, patch.activeMonsters, function (a, b) { return patchMonsterCard(a, b); });
    }
    if (patch.locationPile !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.locationPile = patchOptional(obj.locationPile, patch.locationPile, function (a, b) { return patchLocationCard(a, b); });
    }
    if (patch.towerDefensePile !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.towerDefensePile = patchArray(obj.towerDefensePile, patch.towerDefensePile, function (a, b) { return patchTowerDefense(a, b); });
    }
    if (patch.turn !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.turn = patchOptional(obj.turn, patch.turn, function (a, b) { return b; });
    }
    if (patch.players !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.players = patchArray(obj.players, patch.players, function (a, b) { return patchPlayer(a, b); });
    }
    return obj;
}
function patchArray(arr, patch, innerPatch) {
    patch.forEach(function (val, i) {
        if (val !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
            if (i >= arr.length) {
                arr.push(val);
            }
            else {
                arr[i] = innerPatch(arr[i], val);
            }
        }
    });
    if (patch.length < arr.length) {
        arr.splice(patch.length);
    }
    return arr;
}
function patchOptional(obj, patch, innerPatch) {
    if (patch === undefined) {
        return undefined;
    }
    else if (obj === undefined) {
        return patch;
    }
    else {
        return innerPatch(obj, patch);
    }
}
function computePatch(state, patch) {
    return patchGameState(state, patch);
}


/***/ }),

/***/ "./src/scenes/Game.ts":
/*!****************************!*\
  !*** ./src/scenes/Game.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Game": () => (/* binding */ Game)
/* harmony export */ });
var Game = /** @class */ (function () {
    function Game() {
    }
    Game.prototype.mount = function (element) { };
    Game.prototype.leaving = function (element) { };
    return Game;
}());



/***/ }),

/***/ "./src/scenes/Lobby.ts":
/*!*****************************!*\
  !*** ./src/scenes/Lobby.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Lobby": () => (/* binding */ Lobby)
/* harmony export */ });
var Lobby = /** @class */ (function () {
    function Lobby() {
    }
    Lobby.prototype.mount = function (element) { };
    Lobby.prototype.leaving = function (element) { };
    return Lobby;
}());



/***/ }),

/***/ "./src/scenes/Login.ts":
/*!*****************************!*\
  !*** ./src/scenes/Login.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Login": () => (/* binding */ Login)
/* harmony export */ });
var Login = /** @class */ (function () {
    function Login() {
    }
    Login.prototype.mount = function (element) {
        var myDiv = this.createElement('div', element, { className: 'Header' });
        this.createElement('h1', myDiv, { InnerText: 'Login Page', className: 'LoginPageheader' });
        this.createElement('button', element, { InnerText: 'Login', className: 'loginButton', event: 'click', eventCB: this.login });
    };
    Login.prototype.createElement = function (type, parent, attributes) {
        var myElement = document.createElement(type);
        myElement.innerHTML = attributes.InnerText ? attributes.InnerText : '';
        if (attributes.className)
            myElement.classList.add(attributes.className);
        if (attributes.event && attributes.eventCB) {
            myElement.addEventListener(attributes.event, attributes.eventCB);
        }
        parent.appendChild(myElement);
        return myElement;
    };
    Login.prototype.login = function () {
        console.log("Here");
    };
    Login.prototype.leaving = function (element) { };
    return Login;
}());



/***/ }),

/***/ "?5d12":
/*!************************!*\
  !*** crypto (ignored) ***!
  \************************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var _scenes_Login__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scenes/Login */ "./src/scenes/Login.ts");
/* harmony import */ var _scenes_Lobby__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scenes/Lobby */ "./src/scenes/Lobby.ts");
/* harmony import */ var _scenes_Game__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./scenes/Game */ "./src/scenes/Game.ts");
/* harmony import */ var _hathora_client__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../.hathora/client */ "../.hathora/client.ts");





var GS;
(function (GS) {
    GS[GS["null"] = 0] = "null";
    GS[GS["login"] = 1] = "login";
    GS[GS["lobby"] = 2] = "lobby";
    GS[GS["game"] = 3] = "game";
})(GS || (GS = {}));
var body = document.getElementById('myApp');
var loginscreen = new _scenes_Login__WEBPACK_IMPORTED_MODULE_1__.Login();
var lobby = new _scenes_Lobby__WEBPACK_IMPORTED_MODULE_2__.Lobby();
var game = new _scenes_Game__WEBPACK_IMPORTED_MODULE_3__.Game();
var myGameState = GS.null;
var client = new _hathora_client__WEBPACK_IMPORTED_MODULE_4__.HathoraClient();
var reRender = function (state, gs) {
    if (state == gs)
        return;
    switch (gs) {
        case GS.lobby:
            if (state == GS.login)
                loginscreen.leaving(body);
            else
                game.leaving(body);
            myGameState = GS.lobby;
            lobby.mount(body);
            break;
        case GS.login:
            if (state == GS.lobby)
                lobby.leaving(body);
            else
                game.leaving(body);
            myGameState = GS.login;
            loginscreen.mount(body);
            break;
        case GS.game:
            if (state == GS.lobby) {
                lobby.leaving(body);
                //can't jump from login to game
                myGameState = GS.game;
                game.mount(body);
            }
            break;
    }
};
//initial
reRender(myGameState, GS.login);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixpQkFBaUI7QUFDekM7QUFDQSw0QkFBNEIsT0FBTztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsZ0NBQWdDO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6TWQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsWUFBWSxRQUFRO0FBQ3BCO0FBQ2U7QUFDZixhQUFhLFFBQVE7QUFDckI7QUFDQSxvQ0FBb0MsU0FBUztBQUM3QyxlQUFlLFFBQVE7QUFDdkI7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsNEJBQTRCO0FBQ3ZDLFdBQVcsU0FBUztBQUNwQixXQUFXLFVBQVU7QUFDckI7QUFDQSxZQUFZO0FBQ1o7QUFDTztBQUNQLGFBQWEsUUFBUTtBQUNyQjtBQUNBLHlCQUF5QixZQUFZO0FBQ3JDLGVBQWUsUUFBUTtBQUN2QjtBQUNBLGVBQWUsUUFBUTtBQUN2QjtBQUNBLGVBQWUsU0FBUztBQUN4QjtBQUNBLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ04saUJBQWlCLFFBQVE7QUFDekI7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixXQUFXO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyw0QkFBNEI7QUFDdkMsV0FBVyxTQUFTO0FBQ3BCLFlBQVksUUFBUTtBQUNwQjtBQUNPO0FBQ1Asb0NBQW9DLFNBQVM7QUFDN0MsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0EsaUJBQWlCLFFBQVE7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDbkpBLHNHQUF1Qzs7Ozs7Ozs7Ozs7QUNBMUI7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLCtEQUFZO0FBQ2hDLGFBQWEsbUJBQU8sQ0FBQywyRUFBa0I7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLG1GQUFzQjtBQUM1QyxlQUFlLG1CQUFPLENBQUMscUZBQXVCO0FBQzlDLG9CQUFvQixtQkFBTyxDQUFDLHVGQUF1QjtBQUNuRCxtQkFBbUIsbUJBQU8sQ0FBQyw2RkFBMkI7QUFDdEQsc0JBQXNCLG1CQUFPLENBQUMsbUdBQThCO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLG1GQUFxQjtBQUMvQyxlQUFlLG1CQUFPLENBQUMsbUVBQWE7QUFDcEMsYUFBYSxtQkFBTyxDQUFDLDZFQUFrQjs7QUFFdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2Q0FBNkM7QUFDN0M7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7Ozs7OztBQ25OYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsNERBQVM7QUFDN0IsV0FBVyxtQkFBTyxDQUFDLDBFQUFnQjtBQUNuQyxZQUFZLG1CQUFPLENBQUMsc0VBQWM7QUFDbEMsa0JBQWtCLG1CQUFPLENBQUMsa0ZBQW9CO0FBQzlDLGVBQWUsbUJBQU8sQ0FBQyxrRUFBWTs7QUFFbkM7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLG1CQUFPLENBQUMsNEVBQWlCO0FBQ3hDLG9CQUFvQixtQkFBTyxDQUFDLHNGQUFzQjtBQUNsRCxpQkFBaUIsbUJBQU8sQ0FBQyxnRkFBbUI7QUFDNUMsZ0JBQWdCLGlHQUE2Qjs7QUFFN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1CQUFPLENBQUMsOEVBQWtCOztBQUV6QztBQUNBLHFCQUFxQixtQkFBTyxDQUFDLDBGQUF3Qjs7QUFFckQ7O0FBRUE7QUFDQSx5QkFBc0I7Ozs7Ozs7Ozs7OztBQ3hEVDs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7Ozs7Ozs7Ozs7OztBQ2xCYTs7QUFFYixhQUFhLG1CQUFPLENBQUMscUVBQVU7O0FBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztBQ3RIYTs7QUFFYjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ0phOztBQUViLFlBQVksbUJBQU8sQ0FBQywrREFBWTtBQUNoQyxlQUFlLG1CQUFPLENBQUMsbUZBQXFCO0FBQzVDLHlCQUF5QixtQkFBTyxDQUFDLDJGQUFzQjtBQUN2RCxzQkFBc0IsbUJBQU8sQ0FBQyxxRkFBbUI7QUFDakQsa0JBQWtCLG1CQUFPLENBQUMsNkVBQWU7QUFDekMsZ0JBQWdCLG1CQUFPLENBQUMscUZBQXNCOztBQUU5QztBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekIsS0FBSztBQUNMO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsQ0FBQzs7QUFFRDs7Ozs7Ozs7Ozs7O0FDMUphOztBQUViLFlBQVksbUJBQU8sQ0FBQywrREFBWTs7QUFFaEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBVTtBQUNyQixXQUFXLFVBQVU7QUFDckI7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBVTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7Ozs7Ozs7Ozs7OztBQ3JEYTs7QUFFYixvQkFBb0IsbUJBQU8sQ0FBQyw2RkFBMEI7QUFDdEQsa0JBQWtCLG1CQUFPLENBQUMseUZBQXdCOztBQUVsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ25CYTs7QUFFYixtQkFBbUIsbUJBQU8sQ0FBQywrRUFBZ0I7O0FBRTNDO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2pCYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsK0RBQVk7QUFDaEMsb0JBQW9CLG1CQUFPLENBQUMsaUZBQWlCO0FBQzdDLGVBQWUsbUJBQU8sQ0FBQyxpRkFBb0I7QUFDM0MsZUFBZSxtQkFBTyxDQUFDLG1FQUFhO0FBQ3BDLGFBQWEsbUJBQU8sQ0FBQyw2RUFBa0I7O0FBRXZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLCtCQUErQjtBQUMvQix1Q0FBdUM7QUFDdkM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7Ozs7Ozs7QUN0RmE7O0FBRWI7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzFDYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsNkRBQVU7O0FBRTlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ04sMkJBQTJCO0FBQzNCLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2xHYTs7QUFFYixrQkFBa0IsbUJBQU8sQ0FBQyw2RUFBZTs7QUFFekM7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCLFdBQVcsVUFBVTtBQUNyQixXQUFXLFFBQVE7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3hCYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsK0RBQVk7QUFDaEMsZUFBZSxtQkFBTyxDQUFDLHFFQUFlOztBQUV0QztBQUNBO0FBQ0E7QUFDQSxXQUFXLGVBQWU7QUFDMUIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsZ0JBQWdCO0FBQzNCLGFBQWEsR0FBRztBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3JCYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsNERBQVM7QUFDN0IsMEJBQTBCLG1CQUFPLENBQUMsd0dBQStCO0FBQ2pFLG1CQUFtQixtQkFBTyxDQUFDLG9GQUFxQjs7QUFFaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLG1CQUFPLENBQUMsMEVBQWdCO0FBQ3RDLElBQUk7QUFDSjtBQUNBLGNBQWMsbUJBQU8sQ0FBQywyRUFBaUI7QUFDdkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3RUFBd0U7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDs7Ozs7Ozs7Ozs7QUNySUE7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ0ZhOztBQUViO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixpQkFBaUI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDVmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLCtEQUFZOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3JFYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2JhOztBQUViLFlBQVksbUJBQU8sQ0FBQywrREFBWTs7QUFFaEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLDJDQUEyQztBQUMzQyxTQUFTOztBQUVUO0FBQ0EsNERBQTRELHdCQUF3QjtBQUNwRjtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQyxnQ0FBZ0MsY0FBYztBQUM5QztBQUNBO0FBQ0EsS0FBSztBQUNMOzs7Ozs7Ozs7Ozs7QUNwRGE7O0FBRWI7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDYmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLCtEQUFZOztBQUVoQztBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUc7QUFDZCxhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ1phOztBQUViLFlBQVksbUJBQU8sQ0FBQywrREFBWTs7QUFFaEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYyxRQUFRO0FBQ3RCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsUUFBUTtBQUN0QixnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7OztBQ25FYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsNkRBQVU7O0FBRTlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7Ozs7Ozs7O0FDWGE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLCtEQUFZOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCOztBQUVsQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOzs7Ozs7Ozs7Ozs7QUNwRGE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzFCYTs7QUFFYixjQUFjLGtHQUE4Qjs7QUFFNUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7O0FBRUE7QUFDQTtBQUNBLFdBQVcsbUJBQW1CO0FBQzlCLFdBQVcsU0FBUztBQUNwQixXQUFXLFNBQVM7QUFDcEIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxVQUFVO0FBQ3JCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNqRmE7O0FBRWIsV0FBVyxtQkFBTyxDQUFDLDBFQUFnQjs7QUFFbkM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixZQUFZLFNBQVM7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsY0FBYztBQUN6QixXQUFXLFVBQVU7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9DQUFvQyxPQUFPO0FBQzNDO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixTQUFTLEdBQUcsU0FBUztBQUM1Qyw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOLDRCQUE0QjtBQUM1QixNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBLHdDQUF3QyxPQUFPO0FBQy9DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDNVZhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGNBQWMsR0FBRyxjQUFjO0FBQy9CLGFBQWEsbUJBQU8sQ0FBQyxrRUFBYTtBQUNsQywyQkFBMkIsbUJBQU8sQ0FBQywyRUFBa0I7QUFDckQsUUFBUSxlQUFlO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixpQkFBaUI7QUFDekM7QUFDQSw0QkFBNEIsT0FBTztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsZ0NBQWdDO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7Ozs7Ozs7Ozs7O0FDek1kLGFBQWEsbUJBQU8sQ0FBQyxnRUFBZTtBQUNwQyxpQkFBaUIsbUJBQU8sQ0FBQyxxQkFBUTs7QUFFakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7O0FDaENBOztBQUVBO0FBQ0E7QUFDQSxFQUFFLGdCQUFnQixxQkFBTTtBQUN4QixVQUFVLHFCQUFNO0FBQ2hCLEVBQUU7QUFDRjtBQUNBLEVBQUU7QUFDRjtBQUNBOztBQUVBOzs7Ozs7Ozs7OztBQ1pBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxFQUFFLGdCQUFnQixxQkFBTTtBQUN4QixPQUFPLHFCQUFNLGNBQWMscUJBQU07QUFDakMsRUFBRTtBQUNGO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaEJBLGNBQWMsZUFBZSwrREFBK0QscUZBQXFGLGtDQUFrQyxrR0FBa0cseUJBQXlCLGdCQUFnQixzSkFBc0osVUFBVSxjQUFjLDRDQUE0QyxtQkFBbUIsYUFBYSxlQUFlLE1BQU0sY0FBYyxNQUFNLHlDQUF5QyxJQUFJLG1CQUFtQiw2REFBNkQsaURBQWlELG1DQUFtQyxJQUFJLElBQUksU0FBUyxhQUFhLGNBQWMsZUFBZSxnQkFBZ0IsNkRBQTZELG1CQUFtQixhQUFhLElBQUksc0NBQXNDLFNBQVMsb0RBQW9ELDJEQUEyRCxpRUFBZSxDQUFDLEVBQWdDO0FBQzVzQzs7Ozs7Ozs7Ozs7Ozs7OztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFlBQVksUUFBUTtBQUNwQjtBQUNlO0FBQ2YsYUFBYSxRQUFRO0FBQ3JCO0FBQ0Esb0NBQW9DLFNBQVM7QUFDN0MsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLDRCQUE0QjtBQUN2QyxXQUFXLFNBQVM7QUFDcEIsV0FBVyxVQUFVO0FBQ3JCO0FBQ0EsWUFBWTtBQUNaO0FBQ087QUFDUCxhQUFhLFFBQVE7QUFDckI7QUFDQSx5QkFBeUIsWUFBWTtBQUNyQyxlQUFlLFFBQVE7QUFDdkI7QUFDQSxlQUFlLFFBQVE7QUFDdkI7QUFDQSxlQUFlLFNBQVM7QUFDeEI7QUFDQSxlQUFlLFFBQVE7QUFDdkI7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsV0FBVztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsNEJBQTRCO0FBQ3ZDLFdBQVcsU0FBUztBQUNwQixZQUFZLFFBQVE7QUFDcEI7QUFDTztBQUNQLG9DQUFvQyxTQUFTO0FBQzdDLGVBQWUsUUFBUTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTixpQkFBaUIsUUFBUTtBQUN6QjtBQUNBLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ25KQTtBQUMwRztBQUNqQjtBQUN6Riw4QkFBOEIsbUZBQTJCLENBQUMsNEZBQXFDO0FBQy9GO0FBQ0Esb0VBQW9FLDBDQUEwQyxLQUFLLDBCQUEwQixxQkFBcUIsaUNBQWlDLEtBQUssc0JBQXNCLHFCQUFxQixxQkFBcUIseUJBQXlCLHFCQUFxQiwwQ0FBMEMsS0FBSyxXQUFXLHFGQUFxRixLQUFLLFlBQVksT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLG9EQUFvRCwwQ0FBMEMsS0FBSywwQkFBMEIscUJBQXFCLGlDQUFpQyxLQUFLLHNCQUFzQixxQkFBcUIscUJBQXFCLHlCQUF5QixxQkFBcUIsMENBQTBDLEtBQUssdUJBQXVCO0FBQ3Y2QjtBQUNBLGlFQUFlLHVCQUF1QixFQUFDOzs7Ozs7Ozs7Ozs7QUNQMUI7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjs7QUFFakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxREFBcUQ7QUFDckQ7O0FBRUE7QUFDQSxnREFBZ0Q7QUFDaEQ7O0FBRUE7QUFDQSxxRkFBcUY7QUFDckY7O0FBRUE7O0FBRUE7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQSxLQUFLO0FBQ0wsS0FBSzs7O0FBR0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxzQkFBc0IsaUJBQWlCO0FBQ3ZDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUJBQXFCLHFCQUFxQjtBQUMxQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLHNGQUFzRixxQkFBcUI7QUFDM0c7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixpREFBaUQscUJBQXFCO0FBQ3RFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Ysc0RBQXNELHFCQUFxQjtBQUMzRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7O0FDckdhOztBQUViO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVEQUF1RCxjQUFjO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcEJBLE1BQStGO0FBQy9GLE1BQXFGO0FBQ3JGLE1BQTRGO0FBQzVGLE1BQStHO0FBQy9HLE1BQXdHO0FBQ3hHLE1BQXdHO0FBQ3hHLE1BQW1HO0FBQ25HO0FBQ0E7O0FBRUE7O0FBRUEsNEJBQTRCLHFHQUFtQjtBQUMvQyx3QkFBd0Isa0hBQWE7O0FBRXJDLHVCQUF1Qix1R0FBYTtBQUNwQztBQUNBLGlCQUFpQiwrRkFBTTtBQUN2Qiw2QkFBNkIsc0dBQWtCOztBQUUvQyxhQUFhLDBHQUFHLENBQUMsc0ZBQU87Ozs7QUFJNkM7QUFDckUsT0FBTyxpRUFBZSxzRkFBTyxJQUFJLDZGQUFjLEdBQUcsNkZBQWMsWUFBWSxFQUFDOzs7Ozs7Ozs7Ozs7QUMxQmhFOztBQUViOztBQUVBO0FBQ0E7O0FBRUEsa0JBQWtCLHdCQUF3QjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGtCQUFrQixpQkFBaUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG9CQUFvQiw0QkFBNEI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEscUJBQXFCLDZCQUE2QjtBQUNsRDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDdkdhOztBQUViO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNEQUFzRDs7QUFFdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7QUN0Q2E7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7O0FDVmE7O0FBRWI7QUFDQTtBQUNBLGNBQWMsS0FBd0MsR0FBRyxzQkFBaUIsR0FBRyxDQUFJOztBQUVqRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7QUNYYTs7QUFFYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrREFBa0Q7QUFDbEQ7O0FBRUE7QUFDQSwwQ0FBMEM7QUFDMUM7O0FBRUE7O0FBRUE7QUFDQSxpRkFBaUY7QUFDakY7O0FBRUE7O0FBRUE7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7O0FBRUE7QUFDQSx5REFBeUQ7QUFDekQsSUFBSTs7QUFFSjs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7OztBQ3JFYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2YwQjtBQUduQixJQUFNLGdCQUFnQixHQUFHLHlCQUF5QixDQUFDO0FBRW5ELElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQVN4QyxJQUFZLE1BZVg7QUFmRCxXQUFZLE1BQU07SUFDaEIsNkNBQVM7SUFDVCxpREFBVztJQUNYLHlDQUFPO0lBQ1AsK0NBQVU7SUFDVixtRUFBb0I7SUFDcEIsaUVBQW1CO0lBQ25CLCtEQUFrQjtJQUNsQix5Q0FBTztJQUNQLDZDQUFTO0lBQ1QsMkNBQVE7SUFDUixnREFBVTtJQUNWLGtEQUFXO0lBQ1gsb0RBQVk7SUFDWiw0REFBZ0I7QUFDbEIsQ0FBQyxFQWZXLE1BQU0sS0FBTixNQUFNLFFBZWpCO0FBS00sSUFBTSxRQUFRLEdBQXNFO0lBQ3pGLEVBQUUsRUFBRSxjQUFNLFFBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBaEIsQ0FBZ0I7SUFDMUIsS0FBSyxFQUFFLFVBQUMsS0FBSyxJQUFLLFFBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssU0FBRSxDQUFDLEVBQTFCLENBQTBCO0NBQzdDLENBQUM7QUFLSyxJQUFNLE9BQU8sR0FHaEI7SUFDRixRQUFRLEVBQUUsVUFBQyxLQUFLLEVBQUUsUUFBUSxJQUFLLFFBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssU0FBRSxRQUFRLFlBQUUsQ0FBQyxFQUF2QyxDQUF1QztJQUN0RSxLQUFLLEVBQUUsVUFBQyxLQUFLLElBQUssUUFBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxTQUFFLENBQUMsRUFBMUIsQ0FBMEI7Q0FDN0MsQ0FBQztBQVNLLFNBQVMsVUFBVSxDQUFDLE1BQWdCO0lBQ3pDLE9BQU8sZ0RBQVMsQ0FBVyxrQkFBVyxnQkFBZ0Isb0JBQVUsTUFBTSxDQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUFHLElBQUssVUFBRyxDQUFDLElBQUksRUFBUixDQUFRLENBQUMsQ0FBQztBQUNwRyxDQUFDO0FBRU0sU0FBUyxrQkFBa0IsQ0FBQyxJQUFjO0lBQy9DLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNqQixLQUFLLFdBQVc7WUFDZCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDcEI7QUFDSCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsRWdFO0FBUWpEO0FBR2hCLElBQVksUUFLWDtBQUxELFdBQVksUUFBUTtJQUNsQix5Q0FBSztJQUNMLDJDQUFNO0lBQ04sdUNBQUk7SUFDSiwyQ0FBTTtBQUNSLENBQUMsRUFMVyxRQUFRLEtBQVIsUUFBUSxRQUtuQjtBQUNELElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNwQiwrQ0FBTTtJQUNOLG1EQUFRO0lBQ1IsK0RBQWM7QUFDaEIsQ0FBQyxFQUpXLFVBQVUsS0FBVixVQUFVLFFBSXJCO0FBQ0QsSUFBWSxZQUtYO0FBTEQsV0FBWSxZQUFZO0lBQ3RCLHlEQUFTO0lBQ1QseURBQVM7SUFDVCxpRUFBYTtJQUNiLDZEQUFXO0FBQ2IsQ0FBQyxFQUxXLFlBQVksS0FBWixZQUFZLFFBS3ZCO0FBQ0QsSUFBWSxLQUtYO0FBTEQsV0FBWSxLQUFLO0lBQ2YsMkNBQVM7SUFDVCxxQ0FBTTtJQUNOLHVDQUFPO0lBQ1AsbUNBQUs7QUFDUCxDQUFDLEVBTFcsS0FBSyxLQUFMLEtBQUssUUFLaEI7QUFDRCxJQUFZLFVBTVg7QUFORCxXQUFZLFVBQVU7SUFDcEIsMkNBQUk7SUFDSiwyREFBWTtJQUNaLHlEQUFXO0lBQ1gsdURBQVU7SUFDVix5Q0FBRztBQUNMLENBQUMsRUFOVyxVQUFVLEtBQVYsVUFBVSxRQU1yQjtBQUNELElBQVksVUFPWDtBQVBELFdBQVksVUFBVTtJQUNwQiwyQ0FBSTtJQUNKLCtEQUFjO0lBQ2QsNkNBQUs7SUFDTCw2REFBYTtJQUNiLHVEQUFVO0lBQ1YscURBQVM7QUFDWCxDQUFDLEVBUFcsVUFBVSxLQUFWLFVBQVUsUUFPckI7QUFDRCxJQUFZLFFBWVg7QUFaRCxXQUFZLFFBQVE7SUFDbEIsbURBQVU7SUFDVixtREFBVTtJQUNWLHlEQUFhO0lBQ2IsbURBQVU7SUFDVixtREFBVTtJQUNWLHFEQUFXO0lBQ1gscURBQVc7SUFDWCwrQ0FBUTtJQUNSLHFEQUFXO0lBQ1gscURBQVc7SUFDWCw0REFBYztBQUNoQixDQUFDLEVBWlcsUUFBUSxLQUFSLFFBQVEsUUFZbkI7QUFDRCxJQUFZLFlBWVg7QUFaRCxXQUFZLFlBQVk7SUFDdEIscURBQU87SUFDUCxtREFBTTtJQUNOLG1EQUFNO0lBQ04seURBQVM7SUFDVCx5RUFBaUI7SUFDakIsbUVBQWM7SUFDZCwyREFBVTtJQUNWLGlFQUFhO0lBQ2IsK0RBQVk7SUFDWixxRUFBZTtJQUNmLGdFQUFZO0FBQ2QsQ0FBQyxFQVpXLFlBQVksS0FBWixZQUFZLFFBWXZCO0FBQ0QsSUFBWSxVQXlCWDtBQXpCRCxXQUFZLFVBQVU7SUFDcEIsbURBQVE7SUFDUiwrRkFBOEI7SUFDOUIsK0ZBQThCO0lBQzlCLG1HQUFnQztJQUNoQyxtR0FBZ0M7SUFDaEMsK0RBQWM7SUFDZCxpRUFBZTtJQUNmLGlFQUFlO0lBQ2YsaURBQU87SUFDUCxpREFBTztJQUNQLHNEQUFTO0lBQ1Qsb0VBQWdCO0lBQ2hCLDBFQUFtQjtJQUNuQiw0REFBWTtJQUNaLDhEQUFhO0lBQ2Isa0hBQXVDO0lBQ3ZDLDhEQUFhO0lBQ2IsNERBQVk7SUFDWix3REFBVTtJQUNWLHNFQUFpQjtJQUNqQix3RUFBa0I7SUFDbEIsa0VBQWU7SUFDZix3RUFBa0I7SUFDbEIsa0VBQWU7QUFDakIsQ0FBQyxFQXpCVyxVQUFVLEtBQVYsVUFBVSxRQXlCckI7QUFXRCxJQUFZLFVBTVg7QUFORCxXQUFZLFVBQVU7SUFDcEIscURBQVM7SUFDVCx1REFBVTtJQUNWLHlEQUFXO0lBQ1gsaURBQU87SUFDUCx1REFBVTtBQUNaLENBQUMsRUFOVyxVQUFVLEtBQVYsVUFBVSxRQU1yQjtBQUNELElBQVksVUFHWDtBQUhELFdBQVksVUFBVTtJQUNwQixpREFBTztJQUNQLCtDQUFNO0FBQ1IsQ0FBQyxFQUhXLFVBQVUsS0FBVixVQUFVLFFBR3JCO0FBd0hNLElBQU0sS0FBSyxHQUFHO0lBQ25CLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxJQUFJLEVBQUUsYUFBYTtZQUNuQixHQUFHLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRTtTQUMzQixDQUFDO0lBQ0osQ0FBQztJQUNELE1BQU07UUFDSixPQUFPLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQVUsRUFBRSxNQUFnQjtRQUNqQyxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssYUFBYSxFQUFFO1lBQzlCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkIsSUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUNsQixXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM1QjthQUNJLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxjQUFjLEVBQUU7WUFDcEMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQixJQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1lBQ2xCLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzdCO2FBQ0ksSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGFBQWEsRUFBRTtZQUNuQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25CLElBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFDbEIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDNUI7YUFDSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssY0FBYyxFQUFFO1lBQ3BDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkIsSUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUNsQixZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM3QjtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELFVBQVUsRUFBVixVQUFXLEdBQXdCLEVBQUUsTUFBZ0I7UUFDbkQsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGFBQWEsRUFBRTtZQUM5QixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25CLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsS0FBSywwQ0FBUSxDQUFDLENBQUM7WUFDeEMsSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLDBDQUFRLEVBQUU7Z0JBQ3hCLElBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7Z0JBQ2xCLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7YUFDSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssY0FBYyxFQUFFO1lBQ3BDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkIsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxLQUFLLDBDQUFRLENBQUMsQ0FBQztZQUN4QyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEtBQUssMENBQVEsRUFBRTtnQkFDeEIsSUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztnQkFDbEIsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDakM7U0FDRjthQUNJLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxhQUFhLEVBQUU7WUFDbkMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQixZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEtBQUssMENBQVEsQ0FBQyxDQUFDO1lBQ3hDLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSywwQ0FBUSxFQUFFO2dCQUN4QixJQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO2dCQUNsQixXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNoQztTQUNGO2FBQ0ksSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGNBQWMsRUFBRTtZQUNwQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25CLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsS0FBSywwQ0FBUSxDQUFDLENBQUM7WUFDeEMsSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLDBDQUFRLEVBQUU7Z0JBQ3hCLElBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7Z0JBQ2xCLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2pDO1NBQ0Y7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUE4QjtRQUNuQyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxJQUFNLElBQUksR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUIsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ2QsT0FBTyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUM3RDthQUNJLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTtZQUNuQixPQUFPLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1NBQy9EO2FBQ0ksSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ25CLE9BQU8sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7U0FDN0Q7YUFDSSxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUMvRDtRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUNELFVBQVUsRUFBVixVQUFXLEdBQThCO1FBQ3ZDLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELElBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QixJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDZCxPQUFPLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUSxFQUFFLENBQUM7U0FDL0Y7YUFDSSxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVEsRUFBRSxDQUFDO1NBQ2pHO2FBQ0ksSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ25CLE9BQU8sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRLEVBQUUsQ0FBQztTQUMvRjthQUNJLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTtZQUNuQixPQUFPLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUSxFQUFFLENBQUM7U0FDakc7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7Q0FDRjtBQUNNLElBQU0sWUFBWSxHQUFHO0lBQzFCLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxNQUFNLEVBQUUsQ0FBQztZQUNULE9BQU8sRUFBRSxFQUFFO1NBQ1osQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUFpQixFQUFFLE1BQWdCO1FBQ3hDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELFVBQVUsRUFBVixVQUFXLEdBQStCLEVBQUUsTUFBZ0I7UUFDMUQsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsSUFBTSxPQUFPLEdBQWMsRUFBRSxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUN2QyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZCLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSywwQ0FBUSxFQUFFO1lBQzNCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxHQUFHLENBQUMsT0FBTyxLQUFLLDBDQUFRLEVBQUU7WUFDNUIsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDL0I7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUE4QjtRQUNuQyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxPQUFPO1lBQ0wsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDcEIsT0FBTyxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUM7U0FDekIsQ0FBQztJQUNKLENBQUM7SUFDRCxVQUFVLEVBQVYsVUFBVyxHQUE4QjtRQUN2QyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE9BQU87WUFDTCxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ2pELE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7U0FDdEQsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDO0FBQ0ssSUFBTSxZQUFZLEdBQUc7SUFDMUIsT0FBTyxFQUFQO1FBQ0UsT0FBTztZQUNMLFFBQVEsRUFBRSxLQUFLO1lBQ2YsVUFBVSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDM0IsYUFBYSxFQUFFLEVBQUU7WUFDakIsZ0JBQWdCLEVBQUUsRUFBRTtTQUNyQixDQUFDO0lBQ0osQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQWlCLEVBQUUsTUFBZ0I7UUFDeEMsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFDLENBQUMsSUFBSyxrQkFBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO1FBQy9ELFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFVBQUMsQ0FBQyxJQUFLLGtCQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELFVBQVUsRUFBVixVQUFXLEdBQStCLEVBQUUsTUFBZ0I7UUFDMUQsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsSUFBTSxPQUFPLEdBQWMsRUFBRSxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUNoRCxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZCLElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSywwQ0FBUSxFQUFFO1lBQzdCLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLDBDQUFRLEVBQUU7WUFDL0IsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsSUFBSSxHQUFHLENBQUMsYUFBYSxLQUFLLDBDQUFRLEVBQUU7WUFDbEMsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGtCQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUM7U0FDcEU7UUFDRCxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsS0FBSywwQ0FBUSxFQUFFO1lBQ3JDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFVBQUMsQ0FBQyxJQUFLLGtCQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQyxDQUFDO1NBQ2xGO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBOEI7UUFDbkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsT0FBTztZQUNMLFFBQVEsRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQzFCLFVBQVUsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUM1QixhQUFhLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRSxjQUFNLGtCQUFXLENBQUMsRUFBRSxDQUFDLEVBQWYsQ0FBZSxDQUFDO1lBQ3BELGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsY0FBTSxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQztTQUMvRCxDQUFDO0lBQ0osQ0FBQztJQUNELFVBQVUsRUFBVixVQUFXLEdBQThCO1FBQ3ZDLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsT0FBTztZQUNMLFFBQVEsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDdkQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDN0QsYUFBYSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxjQUFNLGtCQUFXLENBQUMsRUFBRSxDQUFDLEVBQWYsQ0FBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ3JGLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxjQUFNLGtCQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1NBQ3BHLENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUNLLElBQU0sTUFBTSxHQUFHO0lBQ3BCLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxNQUFNLEVBQUUsQ0FBQztZQUNULEVBQUUsRUFBRSxFQUFFO1lBQ04sVUFBVSxFQUFFLEtBQUs7U0FDbEIsQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUFXLEVBQUUsTUFBZ0I7UUFDbEMsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUIsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEMsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsVUFBVSxFQUFWLFVBQVcsR0FBeUIsRUFBRSxNQUFnQjtRQUNwRCxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxJQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7UUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDMUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssMENBQVEsRUFBRTtZQUMzQixVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3QjtRQUNELElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSywwQ0FBUSxFQUFFO1lBQ3ZCLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLDBDQUFRLEVBQUU7WUFDL0IsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbkM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUE4QjtRQUNuQyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxPQUFPO1lBQ0wsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDdEIsRUFBRSxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDbkIsVUFBVSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUM7U0FDN0IsQ0FBQztJQUNKLENBQUM7SUFDRCxVQUFVLEVBQVYsVUFBVyxHQUE4QjtRQUN2QyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE9BQU87WUFDTCxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ25ELEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDaEQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtTQUMxRCxDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUM7QUFDSyxJQUFNLFdBQVcsR0FBRztJQUN6QixPQUFPLEVBQVA7UUFDRSxPQUFPO1lBQ0wsS0FBSyxFQUFFLEVBQUU7WUFDVCxNQUFNLEVBQUUsQ0FBQztZQUNULE1BQU0sRUFBRSxDQUFDO1lBQ1QsS0FBSyxFQUFFLENBQUM7WUFDUixVQUFVLEVBQUUsQ0FBQztZQUNiLFlBQVksRUFBRSxTQUFTO1lBQ3ZCLGFBQWEsRUFBRSxTQUFTO1lBQ3hCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ3pCLGFBQWEsRUFBRSxFQUFFO1NBQ2xCLENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBZ0IsRUFBRSxNQUFnQjtRQUN2QyxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QixRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQixRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQixRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBQyxDQUFDLElBQUssYUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQztRQUNuRSxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBQyxDQUFDLElBQUssYUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQztRQUNwRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGlCQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7UUFDOUQsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsVUFBVSxFQUFWLFVBQVcsR0FBOEIsRUFBRSxNQUFnQjtRQUN6RCxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxJQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7UUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDN0MsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssMENBQVEsRUFBRTtZQUMxQixXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM3QjtRQUNELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSywwQ0FBUSxFQUFFO1lBQzNCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLDBDQUFRLEVBQUU7WUFDM0IsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDM0I7UUFDRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssMENBQVEsRUFBRTtZQUMxQixRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMxQjtRQUNELElBQUksR0FBRyxDQUFDLFVBQVUsS0FBSywwQ0FBUSxFQUFFO1lBQy9CLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsSUFBSSxHQUFHLENBQUMsWUFBWSxLQUFLLDBDQUFRLEVBQUU7WUFDakMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsWUFBWSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGFBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUF6QixDQUF5QixDQUFDLENBQUM7U0FDeEU7UUFDRCxJQUFJLEdBQUcsQ0FBQyxhQUFhLEtBQUssMENBQVEsRUFBRTtZQUNsQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBQyxDQUFDLElBQUssYUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQXpCLENBQXlCLENBQUMsQ0FBQztTQUN6RTtRQUNELElBQUksR0FBRyxDQUFDLE9BQU8sS0FBSywwQ0FBUSxFQUFFO1lBQzVCLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNyQztRQUNELElBQUksR0FBRyxDQUFDLGFBQWEsS0FBSywwQ0FBUSxFQUFFO1lBQ2xDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFDLENBQUMsSUFBSyxpQkFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1NBQ25FO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBOEI7UUFDbkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsT0FBTztZQUNMLEtBQUssRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQ3RCLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3BCLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ25CLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQzFCLFlBQVksRUFBRSxhQUFhLENBQUMsRUFBRSxFQUFFLGNBQU0sYUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBakIsQ0FBaUIsQ0FBQztZQUN4RCxhQUFhLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxjQUFNLGFBQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQWpCLENBQWlCLENBQUM7WUFDekQsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQzFCLGFBQWEsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLGNBQU0saUJBQVUsQ0FBQyxFQUFFLENBQUMsRUFBZCxDQUFjLENBQUM7U0FDcEQsQ0FBQztJQUNKLENBQUM7SUFDRCxVQUFVLEVBQVYsVUFBVyxHQUE4QjtRQUN2QyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE9BQU87WUFDTCxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ25ELE1BQU0sRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDakQsTUFBTSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUNqRCxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ2hELFVBQVUsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDdkQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxjQUFNLGFBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDekYsYUFBYSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxjQUFNLGFBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDMUYsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDM0QsYUFBYSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxjQUFNLGlCQUFVLENBQUMsRUFBRSxDQUFDLEVBQWQsQ0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1NBQ3JGLENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUNLLElBQU0sV0FBVyxHQUFHO0lBQ3pCLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxLQUFLLEVBQUUsRUFBRTtZQUNULFFBQVEsRUFBRSxFQUFFO1lBQ1osS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLEVBQUUsQ0FBQztZQUNQLFlBQVksRUFBRSxTQUFTO1lBQ3ZCLGFBQWEsRUFBRSxTQUFTO1lBQ3hCLFVBQVUsRUFBRSxDQUFDO1NBQ2QsQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUFnQixFQUFFLE1BQWdCO1FBQ3ZDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFDLENBQUMsSUFBSyxhQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1FBQ25FLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFDLENBQUMsSUFBSyxhQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1FBQ3BFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELFVBQVUsRUFBVixVQUFXLEdBQThCLEVBQUUsTUFBZ0I7UUFDekQsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsSUFBTSxPQUFPLEdBQWMsRUFBRSxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDMUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssMENBQVEsRUFBRTtZQUMxQixXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM3QjtRQUNELElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSywwQ0FBUSxFQUFFO1lBQzdCLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2hDO1FBQ0QsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLDBDQUFRLEVBQUU7WUFDMUIsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDMUI7UUFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssMENBQVEsRUFBRTtZQUN6QixRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksR0FBRyxDQUFDLFlBQVksS0FBSywwQ0FBUSxFQUFFO1lBQ2pDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFDLENBQUMsSUFBSyxhQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsSUFBSSxHQUFHLENBQUMsYUFBYSxLQUFLLDBDQUFRLEVBQUU7WUFDbEMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGFBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUF6QixDQUF5QixDQUFDLENBQUM7U0FDekU7UUFDRCxJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssMENBQVEsRUFBRTtZQUMvQixVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNqQztRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCO1FBQ25DLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELE9BQU87WUFDTCxLQUFLLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUN0QixRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUN6QixLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNuQixJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNsQixZQUFZLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxjQUFNLGFBQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQWpCLENBQWlCLENBQUM7WUFDeEQsYUFBYSxFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsY0FBTSxhQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFqQixDQUFpQixDQUFDO1lBQ3pELFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO1NBQzNCLENBQUM7SUFDSixDQUFDO0lBQ0QsVUFBVSxFQUFWLFVBQVcsR0FBOEI7UUFDdkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixPQUFPO1lBQ0wsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUNuRCxRQUFRLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ3RELEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDaEQsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUMvQyxZQUFZLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLGNBQU0sYUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUN6RixhQUFhLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLGNBQU0sYUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUMxRixVQUFVLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1NBQ3hELENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUNLLElBQU0sWUFBWSxHQUFHO0lBQzFCLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxLQUFLLEVBQUUsRUFBRTtZQUNULEtBQUssRUFBRSxDQUFDO1lBQ1IsWUFBWSxFQUFFLFNBQVM7WUFDdkIsYUFBYSxFQUFFLFNBQVM7WUFDeEIsVUFBVSxFQUFFLENBQUM7U0FDZCxDQUFDO0lBQ0osQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQWlCLEVBQUUsTUFBZ0I7UUFDeEMsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUIsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsWUFBWSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGFBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUM7UUFDbkUsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGFBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUM7UUFDcEUsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEMsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsVUFBVSxFQUFWLFVBQVcsR0FBK0IsRUFBRSxNQUFnQjtRQUMxRCxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxJQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7UUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkIsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLDBDQUFRLEVBQUU7WUFDMUIsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDN0I7UUFDRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssMENBQVEsRUFBRTtZQUMxQixRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMxQjtRQUNELElBQUksR0FBRyxDQUFDLFlBQVksS0FBSywwQ0FBUSxFQUFFO1lBQ2pDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFDLENBQUMsSUFBSyxhQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsSUFBSSxHQUFHLENBQUMsYUFBYSxLQUFLLDBDQUFRLEVBQUU7WUFDbEMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGFBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUF6QixDQUF5QixDQUFDLENBQUM7U0FDekU7UUFDRCxJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssMENBQVEsRUFBRTtZQUMvQixVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNqQztRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCO1FBQ25DLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELE9BQU87WUFDTCxLQUFLLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUN0QixLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNuQixZQUFZLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxjQUFNLGFBQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQWpCLENBQWlCLENBQUM7WUFDeEQsYUFBYSxFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsY0FBTSxhQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFqQixDQUFpQixDQUFDO1lBQ3pELFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO1NBQzNCLENBQUM7SUFDSixDQUFDO0lBQ0QsVUFBVSxFQUFWLFVBQVcsR0FBOEI7UUFDdkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixPQUFPO1lBQ0wsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUNuRCxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ2hELFlBQVksRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsY0FBTSxhQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ3pGLGFBQWEsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsY0FBTSxhQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQzFGLFVBQVUsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7U0FDeEQsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDO0FBQ0ssSUFBTSxZQUFZLEdBQUc7SUFDMUIsT0FBTyxFQUFQO1FBQ0UsT0FBTztZQUNMLEtBQUssRUFBRSxFQUFFO1lBQ1QsS0FBSyxFQUFFLENBQUM7WUFDUixFQUFFLEVBQUUsQ0FBQztZQUNMLFFBQVEsRUFBRSxDQUFDO1lBQ1gsTUFBTSxFQUFFLENBQUM7WUFDVCxZQUFZLEVBQUUsQ0FBQztZQUNmLFlBQVksRUFBRSxTQUFTO1lBQ3ZCLGFBQWEsRUFBRSxTQUFTO1lBQ3hCLFVBQVUsRUFBRSxDQUFDO1NBQ2QsQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUFpQixFQUFFLE1BQWdCO1FBQ3hDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFDLENBQUMsSUFBSyxhQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1FBQ25FLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFDLENBQUMsSUFBSyxhQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1FBQ3BFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELFVBQVUsRUFBVixVQUFXLEdBQStCLEVBQUUsTUFBZ0I7UUFDMUQsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsSUFBTSxPQUFPLEdBQWMsRUFBRSxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkIsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLDBDQUFRLEVBQUU7WUFDMUIsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDN0I7UUFDRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssMENBQVEsRUFBRTtZQUMxQixRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMxQjtRQUNELElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSywwQ0FBUSxFQUFFO1lBQ3ZCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLDBDQUFRLEVBQUU7WUFDN0IsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDN0I7UUFDRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssMENBQVEsRUFBRTtZQUMzQixRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMzQjtRQUNELElBQUksR0FBRyxDQUFDLFlBQVksS0FBSywwQ0FBUSxFQUFFO1lBQ2pDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsSUFBSSxHQUFHLENBQUMsWUFBWSxLQUFLLDBDQUFRLEVBQUU7WUFDakMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsWUFBWSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGFBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUF6QixDQUF5QixDQUFDLENBQUM7U0FDeEU7UUFDRCxJQUFJLEdBQUcsQ0FBQyxhQUFhLEtBQUssMENBQVEsRUFBRTtZQUNsQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBQyxDQUFDLElBQUssYUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQXpCLENBQXlCLENBQUMsQ0FBQztTQUN6RTtRQUNELElBQUksR0FBRyxDQUFDLFVBQVUsS0FBSywwQ0FBUSxFQUFFO1lBQy9CLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBOEI7UUFDbkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsT0FBTztZQUNMLEtBQUssRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQ3RCLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ25CLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ2hCLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3RCLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3BCLFlBQVksRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQzFCLFlBQVksRUFBRSxhQUFhLENBQUMsRUFBRSxFQUFFLGNBQU0sYUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBakIsQ0FBaUIsQ0FBQztZQUN4RCxhQUFhLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxjQUFNLGFBQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQWpCLENBQWlCLENBQUM7WUFDekQsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUM7U0FDM0IsQ0FBQztJQUNKLENBQUM7SUFDRCxVQUFVLEVBQVYsVUFBVyxHQUE4QjtRQUN2QyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE9BQU87WUFDTCxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ25ELEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDaEQsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUM3QyxRQUFRLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ25ELE1BQU0sRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDakQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUN2RCxZQUFZLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLGNBQU0sYUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUN6RixhQUFhLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLGNBQU0sYUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUMxRixVQUFVLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1NBQ3hELENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUNLLElBQU0sV0FBVyxHQUFHO0lBQ3pCLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxJQUFJLEVBQUUsRUFBRTtZQUNSLE9BQU8sRUFBRSxFQUFFO1NBQ1osQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUFnQixFQUFFLE1BQWdCO1FBQ3ZDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFDLENBQUMsSUFBSyxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQztRQUM3RCxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLElBQUssa0JBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7UUFDaEUsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsVUFBVSxFQUFWLFVBQVcsR0FBOEIsRUFBRSxNQUFnQjtRQUN6RCxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxJQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7UUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3ZDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkIsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLDBDQUFRLEVBQUU7WUFDekIsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGtCQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQyxDQUFDO1NBQ3RFO1FBQ0QsSUFBSSxHQUFHLENBQUMsT0FBTyxLQUFLLDBDQUFRLEVBQUU7WUFDNUIsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxJQUFLLGtCQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQyxDQUFDO1NBQ3pFO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBOEI7UUFDbkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsT0FBTztZQUNMLElBQUksRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLGNBQU0sa0JBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQXRCLENBQXNCLENBQUM7WUFDbEQsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsY0FBTSxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQztTQUN0RCxDQUFDO0lBQ0osQ0FBQztJQUNELFVBQVUsRUFBVixVQUFXLEdBQThCO1FBQ3ZDLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsT0FBTztZQUNMLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsY0FBTSxrQkFBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUN2RixPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLGNBQU0sa0JBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7U0FDM0YsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDO0FBQ0ssSUFBTSxRQUFRLEdBQUc7SUFDdEIsT0FBTyxFQUFQO1FBQ0UsT0FBTztZQUNMLElBQUksRUFBRSxFQUFFO1lBQ1IsS0FBSyxFQUFFLENBQUM7U0FDVCxDQUFDO0lBQ0osQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQWEsRUFBRSxNQUFnQjtRQUNwQyxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxVQUFVLEVBQVYsVUFBVyxHQUEyQixFQUFFLE1BQWdCO1FBQ3RELElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLElBQU0sT0FBTyxHQUFjLEVBQUUsQ0FBQztRQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDckMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssMENBQVEsRUFBRTtZQUN6QixXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1QjtRQUNELElBQUksR0FBRyxDQUFDLEtBQUssS0FBSywwQ0FBUSxFQUFFO1lBQzFCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzFCO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBOEI7UUFDbkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsT0FBTztZQUNMLElBQUksRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQ3JCLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO1NBQ3BCLENBQUM7SUFDSixDQUFDO0lBQ0QsVUFBVSxFQUFWLFVBQVcsR0FBOEI7UUFDdkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixPQUFPO1lBQ0wsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUNsRCxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1NBQ2pELENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUNLLElBQU0sTUFBTSxHQUFHO0lBQ3BCLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxJQUFJLEVBQUUsRUFBRTtZQUNSLE1BQU0sRUFBRSxRQUFRLENBQUMsT0FBTyxFQUFFO1NBQzNCLENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBVyxFQUFFLE1BQWdCO1FBQ2xDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqQyxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxVQUFVLEVBQVYsVUFBVyxHQUF5QixFQUFFLE1BQWdCO1FBQ3BELElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLElBQU0sT0FBTyxHQUFjLEVBQUUsQ0FBQztRQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDdEMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssMENBQVEsRUFBRTtZQUN6QixXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1QjtRQUNELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSywwQ0FBUSxFQUFFO1lBQzNCLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN0QztRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCO1FBQ25DLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELE9BQU87WUFDTCxJQUFJLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUNyQixNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7U0FDNUIsQ0FBQztJQUNKLENBQUM7SUFDRCxVQUFVLEVBQVYsVUFBVyxHQUE4QjtRQUN2QyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE9BQU87WUFDTCxJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ2xELE1BQU0sRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1NBQzdELENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUNLLElBQU0sTUFBTSxHQUFHO0lBQ3BCLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxFQUFFLEVBQUUsRUFBRTtZQUNOLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsTUFBTSxFQUFFLENBQUM7WUFDVCxZQUFZLEVBQUUsQ0FBQztZQUNmLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLElBQUksRUFBRSxFQUFFO1lBQ1IsSUFBSSxFQUFFLENBQUM7WUFDUCxVQUFVLEVBQUUsRUFBRTtTQUNmLENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBVyxFQUFFLE1BQWdCO1FBQ2xDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFDLENBQUMsSUFBSyxpQkFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1FBQzlELFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFDLENBQUMsSUFBSyxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQztRQUM3RCxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBQyxDQUFDLElBQUssYUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQztRQUM5RCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxVQUFVLEVBQVYsVUFBVyxHQUF5QixFQUFFLE1BQWdCO1FBQ3BELElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLElBQU0sT0FBTyxHQUFjLEVBQUUsQ0FBQztRQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUMxQyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZCLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSywwQ0FBUSxFQUFFO1lBQ3ZCLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxHQUFHLENBQUMsYUFBYSxLQUFLLDBDQUFRLEVBQUU7WUFDbEMsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGlCQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7U0FDbkU7UUFDRCxJQUFJLEdBQUcsQ0FBQyxXQUFXLEtBQUssMENBQVEsRUFBRTtZQUNoQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSywwQ0FBUSxFQUFFO1lBQzNCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxHQUFHLENBQUMsWUFBWSxLQUFLLDBDQUFRLEVBQUU7WUFDakMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDakM7UUFDRCxJQUFJLEdBQUcsQ0FBQyxhQUFhLEtBQUssMENBQVEsRUFBRTtZQUNsQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUksR0FBRyxDQUFDLElBQUksS0FBSywwQ0FBUSxFQUFFO1lBQ3pCLGNBQWMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFDLENBQUMsSUFBSyxrQkFBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQTlCLENBQThCLENBQUMsQ0FBQztTQUN0RTtRQUNELElBQUksR0FBRyxDQUFDLElBQUksS0FBSywwQ0FBUSxFQUFFO1lBQ3pCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLDBDQUFRLEVBQUU7WUFDL0IsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGFBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUF6QixDQUF5QixDQUFDLENBQUM7U0FDdkU7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUE4QjtRQUNuQyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxPQUFPO1lBQ0wsRUFBRSxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDbkIsYUFBYSxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsY0FBTSxpQkFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFkLENBQWMsQ0FBQztZQUNuRCxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUMzQixNQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNwQixZQUFZLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUMxQixhQUFhLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUMzQixJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRSxjQUFNLGtCQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUF0QixDQUFzQixDQUFDO1lBQ2xELElBQUksRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQ3BCLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLGNBQU0sYUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBakIsQ0FBaUIsQ0FBQztTQUNwRCxDQUFDO0lBQ0osQ0FBQztJQUNELFVBQVUsRUFBVixVQUFXLEdBQThCO1FBQ3ZDLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsT0FBTztZQUNMLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDaEQsYUFBYSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxjQUFNLGlCQUFVLENBQUMsRUFBRSxDQUFDLEVBQWQsQ0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ3BGLFdBQVcsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDeEQsTUFBTSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUNqRCxZQUFZLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ3ZELGFBQWEsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDeEQsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxjQUFNLGtCQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ3ZGLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDakQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxjQUFNLGFBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7U0FDekYsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDO0FBQ0ssSUFBTSxTQUFTLEdBQUc7SUFDdkIsT0FBTyxFQUFQO1FBQ0UsT0FBTztZQUNMLFNBQVMsRUFBRSxDQUFDO1lBQ1osT0FBTyxFQUFFLEVBQUU7WUFDWCxhQUFhLEVBQUUsQ0FBQztZQUNoQixZQUFZLEVBQUUsQ0FBQztZQUNmLFdBQVcsRUFBRSxFQUFFO1lBQ2YsY0FBYyxFQUFFLEVBQUU7WUFDbEIsWUFBWSxFQUFFLFNBQVM7WUFDdkIsZ0JBQWdCLEVBQUUsRUFBRTtZQUNwQixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxFQUFFO1NBQ1osQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUFjLEVBQUUsTUFBZ0I7UUFDckMsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxJQUFLLGtCQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUM7UUFDekQsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbEMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLFVBQUMsQ0FBQyxJQUFLLGtCQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO1FBQ3BFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGNBQWMsRUFBRSxVQUFDLENBQUMsSUFBSyxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQztRQUN2RSxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBQyxDQUFDLElBQUssbUJBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUEzQixDQUEyQixDQUFDLENBQUM7UUFDekUsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsVUFBQyxDQUFDLElBQUssbUJBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUEzQixDQUEyQixDQUFDLENBQUM7UUFDMUUsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGtCQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUM7UUFDekQsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxJQUFLLGFBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUM7UUFDM0QsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsVUFBVSxFQUFWLFVBQVcsR0FBNEIsRUFBRSxNQUFnQjtRQUN2RCxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxJQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7UUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQzNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDOUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsS0FBSywwQ0FBUSxDQUFDLENBQUM7UUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLDBDQUFRLENBQUMsQ0FBQztRQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssMENBQVEsQ0FBQyxDQUFDO1FBQ3ZDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkIsSUFBSSxHQUFHLENBQUMsU0FBUyxLQUFLLDBDQUFRLEVBQUU7WUFDOUIsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDOUI7UUFDRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLEtBQUssMENBQVEsRUFBRTtZQUM1QixjQUFjLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLElBQUssa0JBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQW5CLENBQW1CLENBQUMsQ0FBQztTQUM5RDtRQUNELElBQUksR0FBRyxDQUFDLGFBQWEsS0FBSywwQ0FBUSxFQUFFO1lBQ2xDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsSUFBSSxHQUFHLENBQUMsWUFBWSxLQUFLLDBDQUFRLEVBQUU7WUFDakMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDbkM7UUFDRCxJQUFJLEdBQUcsQ0FBQyxXQUFXLEtBQUssMENBQVEsRUFBRTtZQUNoQyxjQUFjLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUUsVUFBQyxDQUFDLElBQUssa0JBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUE5QixDQUE4QixDQUFDLENBQUM7U0FDN0U7UUFDRCxJQUFJLEdBQUcsQ0FBQyxjQUFjLEtBQUssMENBQVEsRUFBRTtZQUNuQyxjQUFjLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsVUFBQyxDQUFDLElBQUssa0JBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUE5QixDQUE4QixDQUFDLENBQUM7U0FDaEY7UUFDRCxJQUFJLEdBQUcsQ0FBQyxZQUFZLEtBQUssMENBQVEsRUFBRTtZQUNqQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBQyxDQUFDLElBQUssbUJBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUEvQixDQUErQixDQUFDLENBQUM7U0FDOUU7UUFDRCxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsS0FBSywwQ0FBUSxFQUFFO1lBQ3JDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFVBQUMsQ0FBQyxJQUFLLG1CQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDO1NBQ25GO1FBQ0QsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLDBDQUFRLEVBQUU7WUFDekIsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQUMsQ0FBQyxJQUFLLGtCQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUM7U0FDMUQ7UUFDRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLEtBQUssMENBQVEsRUFBRTtZQUM1QixjQUFjLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLElBQUssYUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQXpCLENBQXlCLENBQUMsQ0FBQztTQUNwRTtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCO1FBQ25DLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELE9BQU87WUFDTCxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN2QixPQUFPLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRSxjQUFNLGtCQUFXLENBQUMsRUFBRSxDQUFDLEVBQWYsQ0FBZSxDQUFDO1lBQzlDLGFBQWEsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQzdCLFlBQVksRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQzVCLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLGNBQU0sa0JBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQXRCLENBQXNCLENBQUM7WUFDekQsY0FBYyxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsY0FBTSxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQztZQUM1RCxZQUFZLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxjQUFNLG1CQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUF2QixDQUF1QixDQUFDO1lBQzlELGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsY0FBTSxtQkFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQztZQUMvRCxJQUFJLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxjQUFNLGtCQUFXLENBQUMsRUFBRSxDQUFDLEVBQWYsQ0FBZSxDQUFDO1lBQzlDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLGNBQU0sYUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBakIsQ0FBaUIsQ0FBQztTQUNqRCxDQUFDO0lBQ0osQ0FBQztJQUNELFVBQVUsRUFBVixVQUFXLEdBQThCO1FBQ3ZDLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEMsT0FBTztZQUNMLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDcEQsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxjQUFNLGtCQUFXLENBQUMsRUFBRSxDQUFDLEVBQWYsQ0FBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQy9FLGFBQWEsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDMUQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUN6RCxXQUFXLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLGNBQU0sa0JBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDOUYsY0FBYyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxjQUFNLGtCQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLDBDQUFRO1lBQ2pHLFlBQVksRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsY0FBTSxtQkFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUMvRixnQkFBZ0IsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsY0FBTSxtQkFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQ0FBUTtZQUNwRyxJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLGNBQU0sa0JBQVcsQ0FBQyxFQUFFLENBQUMsRUFBZixDQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7WUFDM0UsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxjQUFNLGFBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQVE7U0FDdEYsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDO0FBQ0ssSUFBTSxnQkFBZ0IsR0FBRztJQUM5QixPQUFPLEVBQVA7UUFDRSxPQUFPLEVBQ04sQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUFxQixFQUFFLE1BQWdCO1FBQzVDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCO1FBQ25DLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELE9BQU8sRUFDTixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUM7QUFDSyxJQUFNLGtCQUFrQixHQUFHO0lBQ2hDLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxJQUFJLEVBQUUsQ0FBQztTQUNSLENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBdUIsRUFBRSxNQUFnQjtRQUM5QyxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUE4QjtRQUNuQyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxPQUFPO1lBQ0wsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUM7U0FDckIsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDO0FBQ0ssSUFBTSxhQUFhLEdBQUc7SUFDM0IsT0FBTyxFQUFQO1FBQ0UsT0FBTyxFQUNOLENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBa0IsRUFBRSxNQUFnQjtRQUN6QyxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUE4QjtRQUNuQyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxPQUFPLEVBQ04sQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDO0FBQ0ssSUFBTSxpQkFBaUIsR0FBRztJQUMvQixPQUFPLEVBQVA7UUFDRSxPQUFPLEVBQ04sQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUFzQixFQUFFLE1BQWdCO1FBQzdDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCO1FBQ25DLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELE9BQU8sRUFDTixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUM7QUFDSyxJQUFNLDBCQUEwQixHQUFHO0lBQ3hDLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxRQUFRLEVBQUUsRUFBRTtTQUNiLENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBK0IsRUFBRSxNQUFnQjtRQUN0RCxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQixPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUE4QjtRQUNuQyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxPQUFPO1lBQ0wsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUM7U0FDMUIsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDO0FBQ0ssSUFBTSx5QkFBeUIsR0FBRztJQUN2QyxPQUFPLEVBQVA7UUFDRSxPQUFPO1lBQ0wsUUFBUSxFQUFFLEVBQUU7U0FDYixDQUFDO0lBQ0osQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCLEVBQUUsTUFBZ0I7UUFDckQsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBOEI7UUFDbkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsT0FBTztZQUNMLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDO1NBQzFCLENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUNLLElBQU0sd0JBQXdCLEdBQUc7SUFDdEMsT0FBTyxFQUFQO1FBQ0UsT0FBTztZQUNMLFFBQVEsRUFBRSxFQUFFO1NBQ2IsQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUE2QixFQUFFLE1BQWdCO1FBQ3BELElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCO1FBQ25DLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELE9BQU87WUFDTCxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQztTQUMxQixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUM7QUFDSyxJQUFNLGVBQWUsR0FBRztJQUM3QixPQUFPLEVBQVA7UUFDRSxPQUFPO1lBQ0wsUUFBUSxFQUFFLEVBQUU7U0FDYixDQUFDO0lBQ0osQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQW9CLEVBQUUsTUFBZ0I7UUFDM0MsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBOEI7UUFDbkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsT0FBTztZQUNMLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDO1NBQzFCLENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUNLLElBQU0sZ0JBQWdCLEdBQUc7SUFDOUIsT0FBTyxFQUFQO1FBQ0UsT0FBTztZQUNMLFFBQVEsRUFBRSxFQUFFO1NBQ2IsQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUFxQixFQUFFLE1BQWdCO1FBQzVDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCO1FBQ25DLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELE9BQU87WUFDTCxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQztTQUMxQixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUM7QUFDSyxJQUFNLGVBQWUsR0FBRztJQUM3QixPQUFPLEVBQVA7UUFDRSxPQUFPLEVBQ04sQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUFvQixFQUFFLE1BQWdCO1FBQzNDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCO1FBQ25DLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELE9BQU8sRUFDTixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUM7QUFDSyxJQUFNLGlCQUFpQixHQUFHO0lBQy9CLE9BQU8sRUFBUDtRQUNFLE9BQU8sRUFDTixDQUFDO0lBQ0osQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQXNCLEVBQUUsTUFBZ0I7UUFDN0MsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBOEI7UUFDbkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsT0FBTyxFQUNOLENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUNLLElBQU0sa0JBQWtCLEdBQUc7SUFDaEMsT0FBTyxFQUFQO1FBQ0UsT0FBTztZQUNMLE1BQU0sRUFBRSxFQUFFO1NBQ1gsQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUF1QixFQUFFLE1BQWdCO1FBQzlDLElBQU0sR0FBRyxHQUFHLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLElBQUksNkNBQU8sRUFBRSxDQUFDO1FBQ3BDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQThCO1FBQ25DLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzVELE9BQU87WUFDTCxNQUFNLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQztTQUN4QixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUM7QUFDSyxJQUFNLG1CQUFtQixHQUFHO0lBQ2pDLE9BQU8sRUFBUDtRQUNFLE9BQU87WUFDTCxRQUFRLEVBQUUsRUFBRTtTQUNiLENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBd0IsRUFBRSxNQUFnQjtRQUMvQyxJQUFNLEdBQUcsR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxJQUFJLDZDQUFPLEVBQUUsQ0FBQztRQUNwQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQixPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxNQUFNLEVBQU4sVUFBTyxHQUE4QjtRQUNuQyxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDZDQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxPQUFPO1lBQ0wsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUM7U0FDMUIsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDO0FBQ0ssSUFBTSxzQkFBc0IsR0FBRztJQUNwQyxPQUFPLEVBQVA7UUFDRSxPQUFPO1lBQ0wsUUFBUSxFQUFFLEVBQUU7U0FDYixDQUFDO0lBQ0osQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEdBQTJCLEVBQUUsTUFBZ0I7UUFDbEQsSUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7UUFDcEMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sR0FBOEI7UUFDbkMsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsT0FBTztZQUNMLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDO1NBQzFCLENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUNLLElBQU0sa0JBQWtCLEdBQUc7SUFDaEMsT0FBTyxFQUFQO1FBQ0UsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBQ0QsTUFBTSxFQUFOLFVBQU8sQ0FBcUIsRUFBRSxHQUFhO1FBQ3pDLE9BQU8sR0FBRyxhQUFILEdBQUcsY0FBSCxHQUFHLEdBQUksSUFBSSw2Q0FBTyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUNELE1BQU0sRUFBTixVQUFPLEVBQTZCO1FBQ2xDLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztDQUNGLENBQUM7QUFFSyxTQUFTLG1CQUFtQixDQUFDLENBQVk7SUFDOUMsSUFBTSxHQUFHLEdBQUcsSUFBSSw2Q0FBTyxFQUFFLENBQUM7SUFDMUIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixJQUFJO1FBQ0YsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDMUI7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkMsTUFBTSxDQUFDLENBQUM7S0FDVDtJQUNELE9BQU8sR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3hCLENBQUM7QUFDTSxTQUFTLGlCQUFpQixDQUMvQixDQUFzQyxFQUN0QyxhQUFxQixFQUNyQixRQUFvQjtJQUVwQixJQUFNLEdBQUcsR0FBRyxJQUFJLDZDQUFPLEVBQUUsQ0FBQztJQUMxQixHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLEdBQUcsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEMsSUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsSUFBSyxRQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFwQyxDQUFvQyxDQUFDLENBQUM7SUFDbEYsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQW1CO1lBQWpCLEtBQUssYUFBRSxRQUFRO1FBQ2xDLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDL0IsYUFBYSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQUMsQ0FBQyxJQUFLLGtCQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUM7SUFDekcsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxJQUFLLFFBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQWpDLENBQWlDLENBQUMsQ0FBQztJQUM1RSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBUztZQUFQLEtBQUs7UUFBTyxVQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztJQUF0QixDQUFzQixDQUFDLENBQUM7SUFDdEQsSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFO1FBQ25CLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsT0FBTyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDeEIsQ0FBQztBQUNNLFNBQVMsaUJBQWlCLENBQUMsR0FBOEI7SUFNOUQsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSw2Q0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDNUQsSUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZDLElBQU0sU0FBUyxHQUFHLGtCQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBRSxHQUFHLENBQUM7UUFDakQsSUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzlCLElBQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxFQUFFLEVBQUUsY0FBTSxrQkFBVyxDQUFDLEVBQUUsQ0FBQyxFQUFmLENBQWUsQ0FBQyxDQUFDO1FBQzVELE9BQU8sbURBQWlCLENBQUMsS0FBSyxFQUFFLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhDQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsaURBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQzNHLENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBTSxNQUFNLEdBQUcsa0JBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFFLEdBQUcsQ0FBQyxjQUFNLHVEQUFjLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQS9CLENBQStCLENBQUMsQ0FBQztJQUN2RixJQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUN4RSxPQUFPLEVBQUUsU0FBUyxhQUFFLGFBQWEsaUJBQUUsU0FBUyxhQUFFLE1BQU0sVUFBRSxDQUFDO0FBQ3pELENBQUM7QUFDTSxTQUFTLG1CQUFtQixDQUFDLEdBQThCO0lBQ2hFLElBQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksNkNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzVELE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsR0FBWSxFQUFFLENBQVM7SUFDekMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBQ0QsU0FBUyxZQUFZLENBQUMsR0FBWSxFQUFFLENBQVU7SUFDNUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUNELFNBQVMsUUFBUSxDQUFDLEdBQVksRUFBRSxDQUFTO0lBQ3ZDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsQ0FBQztBQUNELFNBQVMsVUFBVSxDQUFDLEdBQVksRUFBRSxDQUFTO0lBQ3pDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsQ0FBQztBQUNELFNBQVMsV0FBVyxDQUFDLEdBQVksRUFBRSxDQUFTO0lBQzFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsQ0FBQztBQUNELFNBQVMsYUFBYSxDQUFJLEdBQVksRUFBRSxDQUFnQixFQUFFLFVBQTBCO0lBQ2xGLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ25DLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTtRQUNuQixVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDZjtBQUNILENBQUM7QUFDRCxTQUFTLFVBQVUsQ0FBSSxHQUFZLEVBQUUsQ0FBTSxFQUFFLFVBQTBCO0lBQ3JFLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLEtBQWtCLFVBQUMsRUFBRCxPQUFDLEVBQUQsZUFBQyxFQUFELElBQUMsRUFBRTtRQUFoQixJQUFNLEdBQUc7UUFDWixVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakI7QUFDSCxDQUFDO0FBQ0QsU0FBUyxjQUFjLENBQUksR0FBWSxFQUFFLENBQTBCLEVBQUUsVUFBMEI7SUFDN0YsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0IsSUFBTSxPQUFPLEdBQWMsRUFBRSxDQUFDO0lBQzlCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFHO1FBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssMENBQVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRztRQUNaLElBQUksR0FBRyxLQUFLLDBDQUFRLEVBQUU7WUFDcEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsR0FBWTtJQUM5QixPQUFPLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBQ0QsU0FBUyxZQUFZLENBQUMsR0FBWTtJQUNoQyxPQUFPLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUNELFNBQVMsUUFBUSxDQUFDLEdBQVk7SUFDNUIsT0FBTyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDMUIsQ0FBQztBQUNELFNBQVMsVUFBVSxDQUFDLEdBQVk7SUFDOUIsT0FBTyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDekIsQ0FBQztBQUNELFNBQVMsV0FBVyxDQUFDLEdBQVk7SUFDL0IsT0FBTyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDMUIsQ0FBQztBQUNELFNBQVMsYUFBYSxDQUFJLEdBQVksRUFBRSxVQUErQjtJQUNyRSxPQUFPLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDekQsQ0FBQztBQUNELFNBQVMsVUFBVSxDQUFJLEdBQVksRUFBRSxVQUFtQjtJQUN0RCxJQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDOUIsSUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM1QixHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7S0FDeEI7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFDRCxTQUFTLGNBQWMsQ0FBSSxHQUFZLEVBQUUsVUFBbUI7SUFDMUQsSUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzlCLElBQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEMsSUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM1QixJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNuQixHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7U0FDeEI7YUFBTTtZQUNMLEdBQUcsQ0FBQyxJQUFJLENBQUMsMENBQVEsQ0FBQyxDQUFDO1NBQ3BCO0tBQ0Y7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN2hEcUM7QUFDdEMsYUFBYTtBQUNtQztBQUN0QjtBQUNTO0FBQ1E7QUFDbUM7QUFvQnJEO0FBQ21EO0FBQ3JDO0FBRXZDLElBQU0sZUFBZSxHQUFHLHdCQUF3QixDQUFDO0FBS2pEO0lBQUE7UUFDUyxVQUFLLEdBQUcsa0VBQWtFLENBQUM7SUF1RXBGLENBQUM7SUFyRWUsOEJBQWdCLEdBQTlCLFVBQStCLEtBQWE7UUFDMUMsT0FBTyxzREFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFWSxzQ0FBYyxHQUEzQjs7Ozs7NEJBQ2MscUJBQU0saURBQVUsQ0FBQyxrQkFBVyx1REFBZ0IsY0FBSSxJQUFJLENBQUMsS0FBSyxxQkFBa0IsQ0FBQzs7d0JBQW5GLEdBQUcsR0FBRyxTQUE2RTt3QkFDekYsc0JBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUM7Ozs7S0FDdkI7SUFFWSw4QkFBTSxHQUFuQixVQUFvQixLQUFhLEVBQUUsT0FBMkI7Ozs7OzRCQUNoRCxxQkFBTSxpREFBVSxDQUMxQixrQkFBVyx1REFBZ0IsY0FBSSxJQUFJLENBQUMsS0FBSyxZQUFTLEVBQ2xELGlFQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUM3QyxFQUFFLE9BQU8sRUFBRSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixFQUFFLEVBQUUsQ0FDbEY7O3dCQUpLLEdBQUcsR0FBRyxTQUlYO3dCQUNELHNCQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFDOzs7O0tBQ3pCO0lBRU0sK0JBQU8sR0FBZCxVQUNFLEtBQWEsRUFDYixPQUFnQixFQUNoQixRQUEwQyxFQUMxQyxtQkFBeUQ7UUFFekQsSUFBTSxNQUFNLEdBQUcsSUFBSSxzREFBUyxDQUFDLGdCQUFTLHVEQUFnQixjQUFJLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBQyxDQUFDLElBQUssMEJBQW1CLENBQUMsc0VBQTJCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBbkQsQ0FBbUQsQ0FBQztRQUM1RSxNQUFNLENBQUMsTUFBTSxHQUFHO1lBQ2QsYUFBTSxDQUFDLElBQUksQ0FDVCxJQUFJLDZDQUFNLEVBQUU7aUJBQ1QsVUFBVSxDQUFDLENBQUMsQ0FBQztpQkFDYixXQUFXLENBQUMsS0FBSyxDQUFDO2lCQUNsQixXQUFXLENBQUMsa0JBQUksT0FBTyxRQUFFLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssUUFBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFqQyxDQUFpQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUNqRixRQUFRLEVBQUUsQ0FDZDtRQU5ELENBTUMsQ0FBQztRQUNKLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFWSxpQ0FBUyxHQUF0QixVQUNFLEtBQWEsRUFDYixPQUEyQixFQUMzQixVQUFrQixFQUNsQixRQUF3Qzs7OztnQkFFeEMsc0JBQU8sSUFBSSxPQUFPLENBQVMsVUFBQyxPQUFPLEVBQUUsTUFBTTt3QkFDekMsSUFBTSxNQUFNLEdBQUcsSUFBSSxzREFBUyxDQUFDLGdCQUFTLGVBQWUsY0FBSSxLQUFJLENBQUMsS0FBSyxDQUFFLENBQUMsQ0FBQzt3QkFDdkUsTUFBTSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUM7d0JBQ2xDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO3dCQUN4QixNQUFNLENBQUMsTUFBTSxHQUFHOzRCQUNkLGFBQU0sQ0FBQyxJQUFJLENBQ1QsSUFBSSw2Q0FBTSxFQUFFO2lDQUNULFdBQVcsQ0FBQyxLQUFLLENBQUM7aUNBQ2xCLFlBQVksQ0FBQyxVQUFVLENBQUM7aUNBQ3hCLFdBQVcsQ0FBQyxpRUFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQ0FDMUQsUUFBUSxFQUFFLENBQ2Q7d0JBTkQsQ0FNQyxDQUFDO3dCQUNKLE1BQU0sQ0FBQyxTQUFTLEdBQUcsVUFBQyxFQUFRO2dDQUFOLElBQUk7NEJBQ3hCLElBQU0sTUFBTSxHQUFHLElBQUksNkNBQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFtQixDQUFDLENBQUMsQ0FBQzs0QkFDL0QsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDOzRCQUNoQyxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7Z0NBQ2QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDOzZCQUNoQztpQ0FBTSxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7Z0NBQ3JCLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzs2QkFDOUI7aUNBQU07Z0NBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsQ0FBQzs2QkFDN0M7d0JBQ0gsQ0FBQyxDQUFDO29CQUNKLENBQUMsQ0FBQyxFQUFDOzs7S0FDSjtJQUNILG9CQUFDO0FBQUQsQ0FBQzs7QUFFRDtJQUtFLDJCQUEwQixPQUFnQixFQUFVLE1BQWlCLEVBQUUsUUFBMEM7UUFBakgsaUJBOEJDO1FBOUJ5QixZQUFPLEdBQVAsT0FBTyxDQUFTO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBVztRQUo3RCxjQUFTLEdBQWlELEVBQUUsQ0FBQztRQUM3RCxVQUFLLEdBQWUsU0FBUyxDQUFDO1FBQzlCLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFHcEIsTUFBTSxDQUFDLFNBQVMsR0FBRyxVQUFDLEVBQVE7Z0JBQU4sSUFBSTtZQUN4QixJQUFNLE1BQU0sR0FBRyxJQUFJLDZDQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDL0QsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTtnQkFDZCxLQUFJLENBQUMsS0FBSyxHQUFHLCtEQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN6QyxLQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztnQkFDbkIsUUFBUSxDQUFDLEVBQUUsT0FBTyxXQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDN0c7aUJBQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO2dCQUNmLFNBQWtELDZEQUFpQixDQUFDLE1BQU0sQ0FBQyxFQUF6RSxTQUFTLGlCQUFFLGFBQWEscUJBQUUsU0FBUyxpQkFBRSxNQUFNLFlBQThCLENBQUM7Z0JBQ2xGLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtvQkFDM0IsS0FBSSxDQUFDLEtBQUssR0FBRyxvREFBWSxDQUFDLEtBQUksQ0FBQyxLQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBQ25EO2dCQUNELEtBQUksQ0FBQyxTQUFTLElBQUksYUFBYSxDQUFDO2dCQUNoQyxRQUFRLENBQUM7b0JBQ1AsT0FBTztvQkFDUCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDN0MsU0FBUyxFQUFFLEtBQUksQ0FBQyxTQUFTO29CQUN6QixNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQUMsSUFBSyxRQUFDLENBQUMsS0FBSyxFQUFQLENBQU8sQ0FBQztpQkFDbkMsQ0FBQyxDQUFDO2dCQUNILFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFtQjt3QkFBakIsS0FBSyxhQUFFLFFBQVE7b0JBQ2xDLElBQUksS0FBSyxJQUFJLEtBQUksQ0FBQyxTQUFTLEVBQUU7d0JBQzNCLEtBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ2hDLE9BQU8sS0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDOUI7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDSjtpQkFBTTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzdDO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVNLG9DQUFRLEdBQWYsVUFBZ0IsT0FBeUI7UUFDdkMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHVEQUFnQixFQUFFLCtEQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUVNLHNDQUFVLEdBQWpCLFVBQWtCLE9BQTJCO1FBQzNDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyx5REFBa0IsRUFBRSxpRUFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFTSxpQ0FBSyxHQUFaLFVBQWEsT0FBc0I7UUFDakMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHFEQUFjLEVBQUUsNERBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRU0scUNBQVMsR0FBaEIsVUFBaUIsT0FBMEI7UUFDekMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHdEQUFpQixFQUFFLGdFQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVNLDhDQUFrQixHQUF6QixVQUEwQixPQUFtQztRQUMzRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsa0VBQTJCLEVBQUUseUVBQWlDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM3RyxDQUFDO0lBRU0sNkNBQWlCLEdBQXhCLFVBQXlCLE9BQWtDO1FBQ3pELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxpRUFBMEIsRUFBRSx3RUFBZ0MsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzNHLENBQUM7SUFFTSw0Q0FBZ0IsR0FBdkIsVUFBd0IsT0FBaUM7UUFDdkQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGdFQUF5QixFQUFFLHVFQUErQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDekcsQ0FBQztJQUVNLG1DQUFPLEdBQWQsVUFBZSxPQUF3QjtRQUNyQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMscURBQWMsRUFBRSw4REFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFTSxvQ0FBUSxHQUFmLFVBQWdCLE9BQXlCO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyx1REFBZ0IsRUFBRSwrREFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFTSxtQ0FBTyxHQUFkLFVBQWUsT0FBd0I7UUFDckMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHNEQUFlLEVBQUUsOERBQXNCLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRU0scUNBQVMsR0FBaEIsVUFBaUIsT0FBMEI7UUFDekMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHdEQUFpQixFQUFFLGdFQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVNLHNDQUFVLEdBQWpCLFVBQWtCLE9BQTJCO1FBQzNDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyx5REFBa0IsRUFBRSxpRUFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFTSx1Q0FBVyxHQUFsQixVQUFtQixPQUE0QjtRQUM3QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsMERBQW1CLEVBQUUsa0VBQTBCLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRU0sMENBQWMsR0FBckIsVUFBc0IsT0FBK0I7UUFDbkQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLDhEQUF1QixFQUFFLHFFQUE2QixDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDckcsQ0FBQztJQUVNLHNDQUFVLEdBQWpCO1FBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBTyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRU8sc0NBQVUsR0FBbEIsVUFBbUIsTUFBYyxFQUFFLE9BQW1CO1FBQXRELGlCQVlDO1FBWEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ2pDLElBQUksS0FBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEtBQUssS0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pELE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2FBQ2hDO2lCQUFNLElBQUksS0FBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEtBQUssS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQ3RELFVBQVUsQ0FBQyxjQUFNLFlBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQTVELENBQTRELEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDbkY7aUJBQU07Z0JBQ0wsSUFBTSxLQUFLLEdBQWUsd0RBQWUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxLQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsK0NBQUssSUFBSSxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFLLEtBQUssU0FBSyxPQUFPLFFBQUUsQ0FBQyxDQUFDO2dCQUN0RixLQUFJLENBQUMsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7YUFDbkU7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCx3QkFBQztBQUFELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzVORCxJQUFZLHFCQU1YO0FBTkQsV0FBWSxxQkFBcUI7SUFDL0IsNERBQW1DO0lBQ25DLG9FQUEyQztJQUMzQyxnRUFBdUM7SUFDdkMsOERBQXFDO0lBQ3JDLDREQUFtQztBQUNyQyxDQUFDLEVBTlcscUJBQXFCLEtBQXJCLHFCQUFxQixRQU1oQztBQU9NLElBQU0sMkJBQTJCLEdBQUcsVUFBQyxDQUFpQztJQUMzRSxPQUFPO1FBQ0wsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNO1FBQ2pCLElBQUksRUFBRSxDQUFDLFVBQVMsSUFBSTtZQUNsQixRQUFRLElBQUksRUFBRTtnQkFDWixLQUFLLElBQUk7b0JBQ1AsT0FBTyxxQkFBcUIsQ0FBQyxlQUFlLENBQUM7Z0JBQy9DLEtBQUssSUFBSTtvQkFDUCxPQUFPLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDO2dCQUNuRCxLQUFLLElBQUk7b0JBQ1AsT0FBTyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDakQsS0FBSyxJQUFJO29CQUNQLE9BQU8scUJBQXFCLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ2hEO29CQUNFLE9BQU8scUJBQXFCLENBQUMsZUFBZSxDQUFDO2FBQ2hEO1FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztLQUNYLENBQUM7QUFDSixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQy9CcUQ7QUFHdEQsU0FBUyxVQUFVLENBQUMsR0FBVSxFQUFFLEtBQXlCO0lBQ3ZELElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQzNCLE9BQU8sS0FBYyxDQUFDO0tBQ3ZCO0lBQ0QsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLGFBQWEsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGFBQWEsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLDhDQUFPLEVBQUU7UUFDdkYsR0FBRyxDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNoRDtJQUNELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxjQUFjLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxjQUFjLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyw4Q0FBTyxFQUFFO1FBQ3pGLEdBQUcsQ0FBQyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakQ7SUFDRCxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssYUFBYSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssYUFBYSxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssOENBQU8sRUFBRTtRQUN2RixHQUFHLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2hEO0lBQ0QsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLGNBQWMsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGNBQWMsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLDhDQUFPLEVBQUU7UUFDekYsR0FBRyxDQUFDLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNqRDtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsR0FBbUIsRUFBRSxLQUFrQztJQUNoRixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssOENBQU8sRUFBRTtRQUM1QixHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDM0I7SUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssOENBQU8sRUFBRTtRQUM3QixHQUFHLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7S0FDN0I7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEdBQW1CLEVBQUUsS0FBa0M7SUFDaEYsSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLDhDQUFPLEVBQUU7UUFDOUIsR0FBRyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0tBQy9CO0lBQ0QsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLDhDQUFPLEVBQUU7UUFDaEMsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDL0Q7SUFDRCxJQUFJLEtBQUssQ0FBQyxhQUFhLEtBQUssOENBQU8sRUFBRTtRQUNuQyxHQUFHLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLFFBQUMsRUFBRCxDQUFDLENBQUMsQ0FBQztLQUNyRjtJQUNELElBQUksS0FBSyxDQUFDLGdCQUFnQixLQUFLLDhDQUFPLEVBQUU7UUFDdEMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyx1QkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztLQUNuSDtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLEdBQWEsRUFBRSxLQUE0QjtJQUM5RCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssOENBQU8sRUFBRTtRQUM1QixHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDM0I7SUFDRCxJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQUssOENBQU8sRUFBRTtRQUN4QixHQUFHLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7S0FDbkI7SUFDRCxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssOENBQU8sRUFBRTtRQUNoQyxHQUFHLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7S0FDbkM7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLEdBQWtCLEVBQUUsS0FBaUM7SUFDN0UsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLDhDQUFPLEVBQUU7UUFDM0IsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ3pCO0lBQ0QsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLDhDQUFPLEVBQUU7UUFDNUIsR0FBRyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0tBQzNCO0lBQ0QsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLDhDQUFPLEVBQUU7UUFDNUIsR0FBRyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0tBQzNCO0lBQ0QsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLDhDQUFPLEVBQUU7UUFDM0IsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ3pCO0lBQ0QsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLDhDQUFPLEVBQUU7UUFDaEMsR0FBRyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO0tBQ25DO0lBQ0QsSUFBSSxLQUFLLENBQUMsWUFBWSxLQUFLLDhDQUFPLEVBQUU7UUFDbEMsR0FBRyxDQUFDLFlBQVksR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxrQkFBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO0tBQ3JHO0lBQ0QsSUFBSSxLQUFLLENBQUMsYUFBYSxLQUFLLDhDQUFPLEVBQUU7UUFDbkMsR0FBRyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxrQkFBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO0tBQ3hHO0lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLDhDQUFPLEVBQUU7UUFDN0IsR0FBRyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdkQ7SUFDRCxJQUFJLEtBQUssQ0FBQyxhQUFhLEtBQUssOENBQU8sRUFBRTtRQUNuQyxHQUFHLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLFFBQUMsRUFBRCxDQUFDLENBQUMsQ0FBQztLQUNyRjtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsR0FBa0IsRUFBRSxLQUFpQztJQUM3RSxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssOENBQU8sRUFBRTtRQUMzQixHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDekI7SUFDRCxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssOENBQU8sRUFBRTtRQUM5QixHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7S0FDL0I7SUFDRCxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssOENBQU8sRUFBRTtRQUMzQixHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDekI7SUFDRCxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssOENBQU8sRUFBRTtRQUMxQixHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7S0FDdkI7SUFDRCxJQUFJLEtBQUssQ0FBQyxZQUFZLEtBQUssOENBQU8sRUFBRTtRQUNsQyxHQUFHLENBQUMsWUFBWSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxZQUFZLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLGtCQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFqQixDQUFpQixDQUFDLENBQUM7S0FDckc7SUFDRCxJQUFJLEtBQUssQ0FBQyxhQUFhLEtBQUssOENBQU8sRUFBRTtRQUNuQyxHQUFHLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLGtCQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFqQixDQUFpQixDQUFDLENBQUM7S0FDeEc7SUFDRCxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssOENBQU8sRUFBRTtRQUNoQyxHQUFHLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7S0FDbkM7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEdBQW1CLEVBQUUsS0FBa0M7SUFDaEYsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLDhDQUFPLEVBQUU7UUFDM0IsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ3pCO0lBQ0QsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLDhDQUFPLEVBQUU7UUFDM0IsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ3pCO0lBQ0QsSUFBSSxLQUFLLENBQUMsWUFBWSxLQUFLLDhDQUFPLEVBQUU7UUFDbEMsR0FBRyxDQUFDLFlBQVksR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxrQkFBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO0tBQ3JHO0lBQ0QsSUFBSSxLQUFLLENBQUMsYUFBYSxLQUFLLDhDQUFPLEVBQUU7UUFDbkMsR0FBRyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxrQkFBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO0tBQ3hHO0lBQ0QsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLDhDQUFPLEVBQUU7UUFDaEMsR0FBRyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO0tBQ25DO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxHQUFtQixFQUFFLEtBQWtDO0lBQ2hGLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyw4Q0FBTyxFQUFFO1FBQzNCLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUN6QjtJQUNELElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyw4Q0FBTyxFQUFFO1FBQzNCLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUN6QjtJQUNELElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyw4Q0FBTyxFQUFFO1FBQ3hCLEdBQUcsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQztLQUNuQjtJQUNELElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyw4Q0FBTyxFQUFFO1FBQzlCLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztLQUMvQjtJQUNELElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyw4Q0FBTyxFQUFFO1FBQzVCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztLQUMzQjtJQUNELElBQUksS0FBSyxDQUFDLFlBQVksS0FBSyw4Q0FBTyxFQUFFO1FBQ2xDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztLQUN2QztJQUNELElBQUksS0FBSyxDQUFDLFlBQVksS0FBSyw4Q0FBTyxFQUFFO1FBQ2xDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVksRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssa0JBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQztLQUNyRztJQUNELElBQUksS0FBSyxDQUFDLGFBQWEsS0FBSyw4Q0FBTyxFQUFFO1FBQ25DLEdBQUcsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWEsRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssa0JBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQztLQUN4RztJQUNELElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyw4Q0FBTyxFQUFFO1FBQ2hDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztLQUNuQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsR0FBa0IsRUFBRSxLQUFpQztJQUM3RSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssOENBQU8sRUFBRTtRQUMxQixHQUFHLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLHVCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO0tBQy9FO0lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLDhDQUFPLEVBQUU7UUFDN0IsR0FBRyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyx1QkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztLQUN4RjtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEdBQWUsRUFBRSxLQUE4QjtJQUNwRSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssOENBQU8sRUFBRTtRQUMxQixHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7S0FDdkI7SUFDRCxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssOENBQU8sRUFBRTtRQUMzQixHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDekI7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxHQUFhLEVBQUUsS0FBNEI7SUFDOUQsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLDhDQUFPLEVBQUU7UUFDMUIsR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0tBQ3ZCO0lBQ0QsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLDhDQUFPLEVBQUU7UUFDNUIsR0FBRyxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdEQ7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxHQUFhLEVBQUUsS0FBNEI7SUFDOUQsSUFBSSxLQUFLLENBQUMsRUFBRSxLQUFLLDhDQUFPLEVBQUU7UUFDeEIsR0FBRyxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO0tBQ25CO0lBQ0QsSUFBSSxLQUFLLENBQUMsYUFBYSxLQUFLLDhDQUFPLEVBQUU7UUFDbkMsR0FBRyxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxRQUFDLEVBQUQsQ0FBQyxDQUFDLENBQUM7S0FDckY7SUFDRCxJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssOENBQU8sRUFBRTtRQUNqQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7S0FDckM7SUFDRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssOENBQU8sRUFBRTtRQUM1QixHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDM0I7SUFDRCxJQUFJLEtBQUssQ0FBQyxZQUFZLEtBQUssOENBQU8sRUFBRTtRQUNsQyxHQUFHLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7S0FDdkM7SUFDRCxJQUFJLEtBQUssQ0FBQyxhQUFhLEtBQUssOENBQU8sRUFBRTtRQUNuQyxHQUFHLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7S0FDekM7SUFDRCxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssOENBQU8sRUFBRTtRQUMxQixHQUFHLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLHVCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO0tBQy9FO0lBQ0QsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLDhDQUFPLEVBQUU7UUFDMUIsR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0tBQ3ZCO0lBQ0QsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLDhDQUFPLEVBQUU7UUFDaEMsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxrQkFBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO0tBQzVGO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxLQUErQjtJQUN2RSxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssOENBQU8sRUFBRTtRQUMvQixHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7S0FDakM7SUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssOENBQU8sRUFBRTtRQUM3QixHQUFHLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLFFBQUMsRUFBRCxDQUFDLENBQUMsQ0FBQztLQUNuRTtJQUNELElBQUksS0FBSyxDQUFDLGFBQWEsS0FBSyw4Q0FBTyxFQUFFO1FBQ25DLEdBQUcsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztLQUN6QztJQUNELElBQUksS0FBSyxDQUFDLFlBQVksS0FBSyw4Q0FBTyxFQUFFO1FBQ2xDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztLQUN2QztJQUNELElBQUksS0FBSyxDQUFDLFdBQVcsS0FBSyw4Q0FBTyxFQUFFO1FBQ2pDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssdUJBQWdCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7S0FDcEc7SUFDRCxJQUFJLEtBQUssQ0FBQyxjQUFjLEtBQUssOENBQU8sRUFBRTtRQUNwQyxHQUFHLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxjQUFjLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLHVCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO0tBQzdHO0lBQ0QsSUFBSSxLQUFLLENBQUMsWUFBWSxLQUFLLDhDQUFPLEVBQUU7UUFDbEMsR0FBRyxDQUFDLFlBQVksR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyx3QkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztLQUMzRztJQUNELElBQUksS0FBSyxDQUFDLGdCQUFnQixLQUFLLDhDQUFPLEVBQUU7UUFDdEMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyx3QkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztLQUNwSDtJQUNELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyw4Q0FBTyxFQUFFO1FBQzFCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssUUFBQyxFQUFELENBQUMsQ0FBQyxDQUFDO0tBQzdEO0lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLDhDQUFPLEVBQUU7UUFDN0IsR0FBRyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxrQkFBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO0tBQ25GO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUksR0FBUSxFQUFFLEtBQStCLEVBQUUsVUFBMEM7SUFDMUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksR0FBRyxLQUFLLDhDQUFPLEVBQUU7WUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTtnQkFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFRLENBQUMsQ0FBQzthQUNwQjtpQkFBTTtnQkFDTCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNsQztTQUNGO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRTtRQUM3QixHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQjtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFJLEdBQWtCLEVBQUUsS0FBVSxFQUFFLFVBQTBDO0lBQ2xHLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtRQUN2QixPQUFPLFNBQVMsQ0FBQztLQUNsQjtTQUFNLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtRQUM1QixPQUFPLEtBQVUsQ0FBQztLQUNuQjtTQUFNO1FBQ0wsT0FBTyxVQUFVLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQy9CO0FBQ0gsQ0FBQztBQUVNLFNBQVMsWUFBWSxDQUFDLEtBQWtCLEVBQUUsS0FBK0I7SUFDOUUsT0FBTyxjQUFjLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3RDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsU0Q7SUFDSTtJQUFlLENBQUM7SUFFaEIsb0JBQUssR0FBTCxVQUFNLE9BQW9CLElBQUcsQ0FBQztJQUU5QixzQkFBTyxHQUFQLFVBQVEsT0FBb0IsSUFBRyxDQUFDO0lBQ3BDLFdBQUM7QUFBRCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ05EO0lBQ0k7SUFBZSxDQUFDO0lBRWhCLHFCQUFLLEdBQUwsVUFBTSxPQUFvQixJQUFHLENBQUM7SUFFOUIsdUJBQU8sR0FBUCxVQUFRLE9BQW9CLElBQUcsQ0FBQztJQUNwQyxZQUFDO0FBQUQsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNJRDtJQUNJO0lBQWUsQ0FBQztJQUVoQixxQkFBSyxHQUFMLFVBQU0sT0FBb0I7UUFDdEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNqSSxDQUFDO0lBRUQsNkJBQWEsR0FBYixVQUFjLElBQVksRUFBRSxNQUFtQixFQUFFLFVBQTZCO1FBQzFFLElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkUsSUFBSSxVQUFVLENBQUMsU0FBUztZQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN4RSxJQUFJLFVBQVUsQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRTtZQUN4QyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDcEU7UUFFRCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlCLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxxQkFBSyxHQUFMO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsdUJBQU8sR0FBUCxVQUFRLE9BQW9CLElBQUcsQ0FBQztJQUNwQyxZQUFDO0FBQUQsQ0FBQzs7Ozs7Ozs7Ozs7O0FDcENEOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBcUI7QUFDa0I7QUFDQTtBQUNGO0FBRWdEO0FBRXJGLElBQUssRUFLSjtBQUxELFdBQUssRUFBRTtJQUNILDJCQUFJO0lBQ0osNkJBQUs7SUFDTCw2QkFBSztJQUNMLDJCQUFJO0FBQ1IsQ0FBQyxFQUxJLEVBQUUsS0FBRixFQUFFLFFBS047QUFFRCxJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRTlDLElBQU0sV0FBVyxHQUFHLElBQUksZ0RBQUssRUFBRSxDQUFDO0FBQ2hDLElBQU0sS0FBSyxHQUFHLElBQUksZ0RBQUssRUFBRSxDQUFDO0FBQzFCLElBQU0sSUFBSSxHQUFHLElBQUksOENBQUksRUFBRSxDQUFDO0FBQ3hCLElBQUksV0FBVyxHQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFFOUIsSUFBTSxNQUFNLEdBQUcsSUFBSSwwREFBYSxFQUFFLENBQUM7QUFFbkMsSUFBTSxRQUFRLEdBQUcsVUFBQyxLQUFTLEVBQUUsRUFBTTtJQUMvQixJQUFJLEtBQUssSUFBSSxFQUFFO1FBQUUsT0FBTztJQUN4QixRQUFRLEVBQUUsRUFBRTtRQUNSLEtBQUssRUFBRSxDQUFDLEtBQUs7WUFDVCxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUMsS0FBSztnQkFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOztnQkFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QixXQUFXLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUN2QixLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLE1BQU07UUFDVixLQUFLLEVBQUUsQ0FBQyxLQUFLO1lBQ1QsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDLEtBQUs7Z0JBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Z0JBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDdkIsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV4QixNQUFNO1FBQ1YsS0FBSyxFQUFFLENBQUMsSUFBSTtZQUNSLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7Z0JBQ25CLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BCLCtCQUErQjtnQkFDL0IsV0FBVyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDcEI7WUFDRCxNQUFNO0tBQ2I7QUFDTCxDQUFDLENBQUM7QUFFRixTQUFTO0FBQ1QsUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2Vudi9kYXRhLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3ZhbGlkYXRvci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYmluLXNlcmRlL2xpYi9pbmRleC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy91dGY4LWJ1ZmZlci1zaXplL21haW4uanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvdXRmOC1idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy94aHIuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9idWlsZEZ1bGxQYXRoLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZW52L2RhdGEuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Nvb2tpZXMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3ZhbGlkYXRvci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2Jpbi1zZXJkZS9saWIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9nZXQtcmFuZG9tLXZhbHVlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9pc29tb3JwaGljLXdzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9qd3QtZGVjb2RlL2J1aWxkL2p3dC1kZWNvZGUuZXNtLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvdXRmOC1idWZmZXItc2l6ZS9tYWluLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvdXRmOC1idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2ViLy4vc3JjL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly93ZWIvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL3dlYi8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL3dlYi8uL3NyYy9zdHlsZS5jc3M/NzE2MyIsIndlYnBhY2s6Ly93ZWIvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vd2ViLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly93ZWIvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vd2ViLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL3dlYi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL3dlYi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvYmFzZS50cyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL3R5cGVzLnRzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9jbGllbnQudHMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL2ZhaWx1cmVzLnRzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9wYXRjaC50cyIsIndlYnBhY2s6Ly93ZWIvLi9zcmMvc2NlbmVzL0dhbWUudHMiLCJ3ZWJwYWNrOi8vd2ViLy4vc3JjL3NjZW5lcy9Mb2JieS50cyIsIndlYnBhY2s6Ly93ZWIvLi9zcmMvc2NlbmVzL0xvZ2luLnRzIiwid2VicGFjazovL3dlYi9pZ25vcmVkfEM6XFxwcm9ncmFtbWluZ1xcRGVtb25TaWVnZSAtIEhhdGhvcmFcXGNsaWVudFxcLmhhdGhvcmFcXG5vZGVfbW9kdWxlc1xcZ2V0LXJhbmRvbS12YWx1ZXN8Y3J5cHRvIiwid2VicGFjazovL3dlYi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vd2ViL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL3dlYi8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9DYW5jZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuICAgIHZhciByZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIHZhciBvbkNhbmNlbGVkO1xuICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi51bnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUoZnVuY3Rpb24gX3Jlc29sdmUodmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIGZ1bmN0aW9uIF9yZWplY3QoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dCA/ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcgOiAndGltZW91dCBleGNlZWRlZCc7XG4gICAgICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIHRyYW5zaXRpb25hbC5jbGFyaWZ5VGltZW91dEVycm9yID8gJ0VUSU1FRE9VVCcgOiAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChyZXNwb25zZVR5cGUgJiYgcmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuIHx8IGNvbmZpZy5zaWduYWwpIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgICBvbkNhbmNlbGVkID0gZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZWplY3QoIWNhbmNlbCB8fCAoY2FuY2VsICYmIGNhbmNlbC50eXBlKSA/IG5ldyBDYW5jZWwoJ2NhbmNlbGVkJykgOiBjYW5jZWwpO1xuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfTtcblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuICYmIGNvbmZpZy5jYW5jZWxUb2tlbi5zdWJzY3JpYmUob25DYW5jZWxlZCk7XG4gICAgICBpZiAoY29uZmlnLnNpZ25hbCkge1xuICAgICAgICBjb25maWcuc2lnbmFsLmFib3J0ZWQgPyBvbkNhbmNlbGVkKCkgOiBjb25maWcuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25DYW5jZWxlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuICBpbnN0YW5jZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoZGVmYXVsdENvbmZpZywgaW5zdGFuY2VDb25maWcpKTtcbiAgfTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5heGlvcy5WRVJTSU9OID0gcmVxdWlyZSgnLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcblxuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbihmdW5jdGlvbihjYW5jZWwpIHtcbiAgICBpZiAoIXRva2VuLl9saXN0ZW5lcnMpIHJldHVybjtcblxuICAgIHZhciBpO1xuICAgIHZhciBsID0gdG9rZW4uX2xpc3RlbmVycy5sZW5ndGg7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbi5fbGlzdGVuZXJzW2ldKGNhbmNlbCk7XG4gICAgfVxuICAgIHRva2VuLl9saXN0ZW5lcnMgPSBudWxsO1xuICB9KTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbiA9IGZ1bmN0aW9uKG9uZnVsZmlsbGVkKSB7XG4gICAgdmFyIF9yZXNvbHZlO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICB0b2tlbi5zdWJzY3JpYmUocmVzb2x2ZSk7XG4gICAgICBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgfSkudGhlbihvbmZ1bGZpbGxlZCk7XG5cbiAgICBwcm9taXNlLmNhbmNlbCA9IGZ1bmN0aW9uIHJlamVjdCgpIHtcbiAgICAgIHRva2VuLnVuc3Vic2NyaWJlKF9yZXNvbHZlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH07XG5cbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogU3Vic2NyaWJlIHRvIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICBsaXN0ZW5lcih0aGlzLnJlYXNvbik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRoaXMuX2xpc3RlbmVycykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBbbGlzdGVuZXJdO1xuICB9XG59O1xuXG4vKipcbiAqIFVuc3Vic2NyaWJlIGZyb20gdGhlIGNhbmNlbCBzaWduYWxcbiAqL1xuXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiB1bnN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAoIXRoaXMuX2xpc3RlbmVycykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSB0aGlzLl9saXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG52YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy92YWxpZGF0b3InKTtcblxudmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbilcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cblxuICBpZiAoY29uZmlnLnNpZ25hbCAmJiBjb25maWcuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlLFxuICAgICAgc3RhdHVzOiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc3RhdHVzID8gdGhpcy5yZXNwb25zZS5zdGF0dXMgOiBudWxsXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURpcmVjdEtleXMocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG1lcmdlTWFwID0ge1xuICAgICd1cmwnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdtZXRob2QnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdkYXRhJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnYmFzZVVSTCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zZm9ybVJlcXVlc3QnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXNwb25zZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3BhcmFtc1NlcmlhbGl6ZXInOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0aW1lb3V0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dE1lc3NhZ2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd3aXRoQ3JlZGVudGlhbHMnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdhZGFwdGVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VUeXBlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkNvb2tpZU5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd4c3JmSGVhZGVyTmFtZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ29uVXBsb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvbkRvd25sb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdkZWNvbXByZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnbWF4Q29udGVudExlbmd0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heEJvZHlMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc3BvcnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwQWdlbnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwc0FnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnY2FuY2VsVG9rZW4nOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdzb2NrZXRQYXRoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VFbmNvZGluZyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3ZhbGlkYXRlU3RhdHVzJzogbWVyZ2VEaXJlY3RLZXlzXG4gIH07XG5cbiAgdXRpbHMuZm9yRWFjaChPYmplY3Qua2V5cyhjb25maWcxKS5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpLCBmdW5jdGlvbiBjb21wdXRlQ29uZmlnVmFsdWUocHJvcCkge1xuICAgIHZhciBtZXJnZSA9IG1lcmdlTWFwW3Byb3BdIHx8IG1lcmdlRGVlcFByb3BlcnRpZXM7XG4gICAgdmFyIGNvbmZpZ1ZhbHVlID0gbWVyZ2UocHJvcCk7XG4gICAgKHV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZ1ZhbHVlKSAmJiBtZXJnZSAhPT0gbWVyZ2VEaXJlY3RLZXlzKSB8fCAoY29uZmlnW3Byb3BdID0gY29uZmlnVmFsdWUpO1xuICB9KTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICB2YXIgY29udGV4dCA9IHRoaXMgfHwgZGVmYXVsdHM7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuLmNhbGwoY29udGV4dCwgZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vY29yZS9lbmhhbmNlRXJyb3InKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH0sXG5cbiAgaGVhZGVyczoge1xuICAgIGNvbW1vbjoge1xuICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gICAgfVxuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwidmVyc2lvblwiOiBcIjAuMjQuMFwiXG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBWRVJTSU9OID0gcmVxdWlyZSgnLi4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xuXG4vKipcbiAqIFRyYW5zaXRpb25hbCBvcHRpb24gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW4/fSB2YWxpZGF0b3IgLSBzZXQgdG8gZmFsc2UgaWYgdGhlIHRyYW5zaXRpb25hbCBvcHRpb24gaGFzIGJlZW4gcmVtb3ZlZFxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uIC0gZGVwcmVjYXRlZCB2ZXJzaW9uIC8gcmVtb3ZlZCBzaW5jZSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZz99IG1lc3NhZ2UgLSBzb21lIG1lc3NhZ2Ugd2l0aCBhZGRpdGlvbmFsIGluZm9cbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xudmFsaWRhdG9ycy50cmFuc2l0aW9uYWwgPSBmdW5jdGlvbiB0cmFuc2l0aW9uYWwodmFsaWRhdG9yLCB2ZXJzaW9uLCBtZXNzYWdlKSB7XG4gIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2Uob3B0LCBkZXNjKSB7XG4gICAgcmV0dXJuICdbQXhpb3MgdicgKyBWRVJTSU9OICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkJyArICh2ZXJzaW9uID8gJyBpbiAnICsgdmVyc2lvbiA6ICcnKSkpO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uICYmICFkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSkge1xuICAgICAgZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0gPSB0cnVlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0TWVzc2FnZShcbiAgICAgICAgICBvcHQsXG4gICAgICAgICAgJyBoYXMgYmVlbiBkZXByZWNhdGVkIHNpbmNlIHYnICsgdmVyc2lvbiArICcgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmVhciBmdXR1cmUnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRvciA/IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRzKSA6IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIEFzc2VydCBvYmplY3QncyBwcm9wZXJ0aWVzIHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gc2NoZW1hXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBhbGxvd1Vua25vd25cbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRPcHRpb25zKG9wdGlvbnMsIHNjaGVtYSwgYWxsb3dVbmtub3duKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSA+IDApIHtcbiAgICB2YXIgb3B0ID0ga2V5c1tpXTtcbiAgICB2YXIgdmFsaWRhdG9yID0gc2NoZW1hW29wdF07XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFyIHZhbHVlID0gb3B0aW9uc1tvcHRdO1xuICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gJyArIG9wdCArICcgbXVzdCBiZSAnICsgcmVzdWx0KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dVbmtub3duICE9PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5rbm93biBvcHRpb24gJyArIG9wdCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlJlYWRlciA9IGV4cG9ydHMuV3JpdGVyID0gdm9pZCAwO1xuY29uc3QgdXRmOCA9IHJlcXVpcmUoXCJ1dGY4LWJ1ZmZlclwiKTtcbmNvbnN0IHV0ZjhfYnVmZmVyX3NpemVfMSA9IHJlcXVpcmUoXCJ1dGY4LWJ1ZmZlci1zaXplXCIpO1xuY29uc3QgeyBwYWNrLCB1bnBhY2sgfSA9IHV0ZjguZGVmYXVsdCA/PyB1dGY4O1xuY2xhc3MgV3JpdGVyIHtcbiAgICBwb3MgPSAwO1xuICAgIHZpZXc7XG4gICAgYnl0ZXM7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudmlldyA9IG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoNjQpKTtcbiAgICAgICAgdGhpcy5ieXRlcyA9IG5ldyBVaW50OEFycmF5KHRoaXMudmlldy5idWZmZXIpO1xuICAgIH1cbiAgICB3cml0ZVVJbnQ4KHZhbCkge1xuICAgICAgICB0aGlzLmVuc3VyZVNpemUoMSk7XG4gICAgICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLnBvcywgdmFsKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlVUludDMyKHZhbCkge1xuICAgICAgICB0aGlzLmVuc3VyZVNpemUoNCk7XG4gICAgICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5wb3MsIHZhbCk7XG4gICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVVJbnQ2NCh2YWwpIHtcbiAgICAgICAgdGhpcy5lbnN1cmVTaXplKDgpO1xuICAgICAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMucG9zLCB2YWwpO1xuICAgICAgICB0aGlzLnBvcyArPSA4O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVVVmFyaW50KHZhbCkge1xuICAgICAgICBpZiAodmFsIDwgMHg4MCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDEpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMucG9zLCB2YWwpO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDQwMDApIHtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZSgyKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MTYodGhpcy5wb3MsICh2YWwgJiAweDdmKSB8ICgodmFsICYgMHgzZjgwKSA8PCAxKSB8IDB4ODAwMCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSAyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCA8IDB4MjAwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoMyk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5wb3MsICh2YWwgPj4gMTQpIHwgMHg4MCk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDE2KHRoaXMucG9zICsgMSwgKHZhbCAmIDB4N2YpIHwgKCh2YWwgJiAweDNmODApIDw8IDEpIHwgMHg4MDAwKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIDwgMHgxMDAwMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDQpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLnBvcywgKHZhbCAmIDB4N2YpIHwgKCh2YWwgJiAweDNmODApIDw8IDEpIHwgKCh2YWwgJiAweDFmYzAwMCkgPDwgMikgfCAoKHZhbCAmIDB4ZmUwMDAwMCkgPDwgMykgfCAweDgwODA4MDAwKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIDwgMHg4MDAwMDAwMDApIHtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZSg1KTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLnBvcywgTWF0aC5mbG9vcih2YWwgLyBNYXRoLnBvdygyLCAyOCkpIHwgMHg4MCk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDMyKHRoaXMucG9zICsgMSwgKHZhbCAmIDB4N2YpIHwgKCh2YWwgJiAweDNmODApIDw8IDEpIHwgKCh2YWwgJiAweDFmYzAwMCkgPDwgMikgfCAoKHZhbCAmIDB4ZmUwMDAwMCkgPDwgMykgfCAweDgwODA4MDAwKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIDwgMHg0MDAwMDAwMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDYpO1xuICAgICAgICAgICAgY29uc3Qgc2hpZnRlZFZhbCA9IE1hdGguZmxvb3IodmFsIC8gTWF0aC5wb3coMiwgMjgpKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MTYodGhpcy5wb3MsIChzaGlmdGVkVmFsICYgMHg3ZikgfCAoKHNoaWZ0ZWRWYWwgJiAweDNmODApIDw8IDEpIHwgMHg4MDgwKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5wb3MgKyAyLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAoKHZhbCAmIDB4MWZjMDAwKSA8PCAyKSB8ICgodmFsICYgMHhmZTAwMDAwKSA8PCAzKSB8IDB4ODA4MDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gNjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZhbHVlIG91dCBvZiByYW5nZVwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVWYXJpbnQodmFsKSB7XG4gICAgICAgIGNvbnN0IGJpZ3ZhbCA9IEJpZ0ludCh2YWwpO1xuICAgICAgICB0aGlzLndyaXRlVVZhcmludChOdW1iZXIoKGJpZ3ZhbCA+PiA2M24pIF4gKGJpZ3ZhbCA8PCAxbikpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlRmxvYXQodmFsKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZSg0KTtcbiAgICAgICAgdGhpcy52aWV3LnNldEZsb2F0MzIodGhpcy5wb3MsIHZhbCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZUJpdHMoYml0cykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpdHMubGVuZ3RoOyBpICs9IDgpIHtcbiAgICAgICAgICAgIGxldCBieXRlID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgODsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgKyBqID09IGJpdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBieXRlIHw9IChiaXRzW2kgKyBqXSA/IDEgOiAwKSA8PCBqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy53cml0ZVVJbnQ4KGJ5dGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVN0cmluZyh2YWwpIHtcbiAgICAgICAgaWYgKHZhbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBieXRlU2l6ZSA9ICgwLCB1dGY4X2J1ZmZlcl9zaXplXzEuZGVmYXVsdCkodmFsKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVVVmFyaW50KGJ5dGVTaXplKTtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZShieXRlU2l6ZSk7XG4gICAgICAgICAgICBwYWNrKHZhbCwgdGhpcy5ieXRlcywgdGhpcy5wb3MpO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gYnl0ZVNpemU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndyaXRlVUludDgoMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlQnVmZmVyKGJ1Zikge1xuICAgICAgICB0aGlzLmVuc3VyZVNpemUoYnVmLmxlbmd0aCk7XG4gICAgICAgIHRoaXMuYnl0ZXMuc2V0KGJ1ZiwgdGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyArPSBidWYubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9CdWZmZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ5dGVzLnN1YmFycmF5KDAsIHRoaXMucG9zKTtcbiAgICB9XG4gICAgZW5zdXJlU2l6ZShzaXplKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLnZpZXcuYnl0ZUxlbmd0aCA8IHRoaXMucG9zICsgc2l6ZSkge1xuICAgICAgICAgICAgY29uc3QgbmV3VmlldyA9IG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIodGhpcy52aWV3LmJ5dGVMZW5ndGggKiAyKSk7XG4gICAgICAgICAgICBjb25zdCBuZXdCeXRlcyA9IG5ldyBVaW50OEFycmF5KG5ld1ZpZXcuYnVmZmVyKTtcbiAgICAgICAgICAgIG5ld0J5dGVzLnNldCh0aGlzLmJ5dGVzKTtcbiAgICAgICAgICAgIHRoaXMudmlldyA9IG5ld1ZpZXc7XG4gICAgICAgICAgICB0aGlzLmJ5dGVzID0gbmV3Qnl0ZXM7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLldyaXRlciA9IFdyaXRlcjtcbmNsYXNzIFJlYWRlciB7XG4gICAgcG9zID0gMDtcbiAgICB2aWV3O1xuICAgIGJ5dGVzO1xuICAgIGNvbnN0cnVjdG9yKGJ1Zikge1xuICAgICAgICB0aGlzLnZpZXcgPSBuZXcgRGF0YVZpZXcoYnVmLmJ1ZmZlciwgYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5ieXRlTGVuZ3RoKTtcbiAgICAgICAgdGhpcy5ieXRlcyA9IG5ldyBVaW50OEFycmF5KHRoaXMudmlldy5idWZmZXIsIGJ1Zi5ieXRlT2Zmc2V0LCBidWYuYnl0ZUxlbmd0aCk7XG4gICAgfVxuICAgIHJlYWRVSW50OCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMucG9zKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gMTtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgcmVhZFVJbnQzMigpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy52aWV3LmdldFVpbnQzMih0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJlYWRVSW50NjQoKSB7XG4gICAgICAgIGNvbnN0IHZhbCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyArPSA4O1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkVVZhcmludCgpIHtcbiAgICAgICAgbGV0IHZhbCA9IDA7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQgYnl0ZSA9IHRoaXMudmlldy5nZXRVaW50OCh0aGlzLnBvcysrKTtcbiAgICAgICAgICAgIGlmIChieXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgKyBieXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsID0gKHZhbCArIChieXRlICYgMHg3ZikpICogMTI4O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlYWRWYXJpbnQoKSB7XG4gICAgICAgIGNvbnN0IHZhbCA9IEJpZ0ludCh0aGlzLnJlYWRVVmFyaW50KCkpO1xuICAgICAgICByZXR1cm4gTnVtYmVyKCh2YWwgPj4gMW4pIF4gLSh2YWwgJiAxbikpO1xuICAgIH1cbiAgICByZWFkRmxvYXQoKSB7XG4gICAgICAgIGNvbnN0IHZhbCA9IHRoaXMudmlldy5nZXRGbG9hdDMyKHRoaXMucG9zLCB0cnVlKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgcmVhZEJpdHMobnVtQml0cykge1xuICAgICAgICBjb25zdCBudW1CeXRlcyA9IE1hdGguY2VpbChudW1CaXRzIC8gOCk7XG4gICAgICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5ieXRlcy5zbGljZSh0aGlzLnBvcywgdGhpcy5wb3MgKyBudW1CeXRlcyk7XG4gICAgICAgIGNvbnN0IGJpdHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBieXRlIG9mIGJ5dGVzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDggJiYgYml0cy5sZW5ndGggPCBudW1CaXRzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBiaXRzLnB1c2goKChieXRlID4+IGkpICYgMSkgPT09IDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zICs9IG51bUJ5dGVzO1xuICAgICAgICByZXR1cm4gYml0cztcbiAgICB9XG4gICAgcmVhZFN0cmluZygpIHtcbiAgICAgICAgY29uc3QgbGVuID0gdGhpcy5yZWFkVVZhcmludCgpO1xuICAgICAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWwgPSB1bnBhY2sodGhpcy5ieXRlcywgdGhpcy5wb3MsIHRoaXMucG9zICsgbGVuKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gbGVuO1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkQnVmZmVyKG51bUJ5dGVzKSB7XG4gICAgICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5ieXRlcy5zbGljZSh0aGlzLnBvcywgdGhpcy5wb3MgKyBudW1CeXRlcyk7XG4gICAgICAgIHRoaXMucG9zICs9IG51bUJ5dGVzO1xuICAgICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuICAgIHJlbWFpbmluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlldy5ieXRlTGVuZ3RoIC0gdGhpcy5wb3M7XG4gICAgfVxufVxuZXhwb3J0cy5SZWFkZXIgPSBSZWFkZXI7XG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggUmFmYWVsIGRhIFNpbHZhIFJvY2hhLlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcclxuICogYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXHJcbiAqIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xyXG4gKiB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXHJcbiAqIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xyXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cclxuICogdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxyXG4gKiBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcclxuICogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXHJcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXHJcbiAqIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcclxuICogTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxyXG4gKiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cclxuICogV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIHV0ZjgtYnVmZmVyLXNpemUgQVBJLlxyXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9yb2NoYXJzL3V0ZjgtYnVmZmVyLXNpemVcclxuICovXHJcblxyXG4vKiogQG1vZHVsZSB1dGY4QnVmZmVyU2l6ZSAqL1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgaG93IG1hbnkgYnl0ZXMgYXJlIG5lZWRlZCB0byBzZXJpYWxpemUgYSBVVEYtOCBzdHJpbmcuXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3V0Zi04LWVuY29kZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHRvIHBhY2suXHJcbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBieXRlcyBuZWVkZWQgdG8gc2VyaWFsaXplIHRoZSBzdHJpbmcuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB1dGY4QnVmZmVyU2l6ZShzdHIpIHtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICBsZXQgYnl0ZXMgPSAwO1xyXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgbGV0IGNvZGVQb2ludCA9IHN0ci5jb2RlUG9pbnRBdChpKTtcclxuICAgIGlmIChjb2RlUG9pbnQgPCAxMjgpIHtcclxuICAgICAgYnl0ZXMrKztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChjb2RlUG9pbnQgPD0gMjA0Nykge1xyXG4gICAgICAgIGJ5dGVzKys7XHJcbiAgICAgIH0gZWxzZSBpZihjb2RlUG9pbnQgPD0gNjU1MzUpIHtcclxuICAgICAgICBieXRlcys9MjtcclxuICAgICAgfSBlbHNlIGlmKGNvZGVQb2ludCA8PSAxMTE0MTExKSB7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICAgIGJ5dGVzKz0zO1xyXG4gICAgICB9XHJcbiAgICAgIGJ5dGVzKys7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBieXRlcztcclxufVxyXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggUmFmYWVsIGRhIFNpbHZhIFJvY2hhLlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcclxuICogYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXHJcbiAqIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xyXG4gKiB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXHJcbiAqIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xyXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cclxuICogdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxyXG4gKiBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcclxuICogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXHJcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXHJcbiAqIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcclxuICogTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxyXG4gKiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cclxuICogV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgRnVuY3Rpb25zIHRvIHNlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgVVRGLTggc3RyaW5ncy5cclxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vcm9jaGFycy91dGY4LWJ1ZmZlclxyXG4gKiBAc2VlIGh0dHBzOi8vZW5jb2Rpbmcuc3BlYy53aGF0d2cub3JnLyN0aGUtZW5jb2RpbmdcclxuICogQHNlZSBodHRwczovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jdXRmLTgtZW5jb2RlclxyXG4gKi9cclxuXHJcbi8qKiBAbW9kdWxlIHV0ZjgtYnVmZmVyICovXHJcblxyXG4vKipcclxuICogUmVhZCBhIHN0cmluZyBvZiBVVEYtOCBjaGFyYWN0ZXJzIGZyb20gYSBieXRlIGJ1ZmZlci5cclxuICogSW52YWxpZCBjaGFyYWN0ZXJzIGFyZSByZXBsYWNlZCB3aXRoICdSRVBMQUNFTUVOVCBDSEFSQUNURVInIChVK0ZGRkQpLlxyXG4gKiBAc2VlIGh0dHBzOi8vZW5jb2Rpbmcuc3BlYy53aGF0d2cub3JnLyN0aGUtZW5jb2RpbmdcclxuICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzQ5MjY5MTFcclxuICogQHBhcmFtIHshVWludDhBcnJheXwhQXJyYXk8bnVtYmVyPn0gYnVmZmVyIEEgYnl0ZSBidWZmZXIuXHJcbiAqIEBwYXJhbSB7bnVtYmVyPX0gc3RhcnQgVGhlIGJ1ZmZlciBpbmRleCB0byBzdGFydCByZWFkaW5nLlxyXG4gKiBAcGFyYW0gez9udW1iZXI9fSBlbmQgVGhlIGJ1ZmZlciBpbmRleCB0byBzdG9wIHJlYWRpbmcuXHJcbiAqICAgQXNzdW1lcyB0aGUgYnVmZmVyIGxlbmd0aCBpZiB1bmRlZmluZWQuXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2soYnVmZmVyLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aCkge1xyXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG4gIGxldCBzdHIgPSAnJztcclxuICBmb3IobGV0IGluZGV4ID0gc3RhcnQ7IGluZGV4IDwgZW5kOykge1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBsZXQgbG93ZXJCb3VuZGFyeSA9IDB4ODA7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCB1cHBlckJvdW5kYXJ5ID0gMHhCRjtcclxuICAgIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cclxuICAgIGxldCByZXBsYWNlID0gZmFsc2U7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCBjaGFyQ29kZSA9IGJ1ZmZlcltpbmRleCsrXTtcclxuICAgIGlmIChjaGFyQ29kZSA+PSAweDAwICYmIGNoYXJDb2RlIDw9IDB4N0YpIHtcclxuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgIGlmIChjaGFyQ29kZSA+PSAweEMyICYmIGNoYXJDb2RlIDw9IDB4REYpIHtcclxuICAgICAgICBjb3VudCA9IDE7XHJcbiAgICAgIH0gZWxzZSBpZiAoY2hhckNvZGUgPj0gMHhFMCAmJiBjaGFyQ29kZSA8PSAweEVGICkge1xyXG4gICAgICAgIGNvdW50ID0gMjtcclxuICAgICAgICBpZiAoYnVmZmVyW2luZGV4XSA9PT0gMHhFMCkge1xyXG4gICAgICAgICAgbG93ZXJCb3VuZGFyeSA9IDB4QTA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdID09PSAweEVEKSB7XHJcbiAgICAgICAgICB1cHBlckJvdW5kYXJ5ID0gMHg5RjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAoY2hhckNvZGUgPj0gMHhGMCAmJiBjaGFyQ29kZSA8PSAweEY0ICkge1xyXG4gICAgICAgIGNvdW50ID0gMztcclxuICAgICAgICBpZiAoYnVmZmVyW2luZGV4XSA9PT0gMHhGMCkge1xyXG4gICAgICAgICAgbG93ZXJCb3VuZGFyeSA9IDB4OTA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdID09PSAweEY0KSB7XHJcbiAgICAgICAgICB1cHBlckJvdW5kYXJ5ID0gMHg4RjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgY2hhckNvZGUgPSBjaGFyQ29kZSAmICgxIDw8ICg4IC0gY291bnQgLSAxKSkgLSAxO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcclxuICAgICAgICBpZiAoYnVmZmVyW2luZGV4XSA8IGxvd2VyQm91bmRhcnkgfHwgYnVmZmVyW2luZGV4XSA+IHVwcGVyQm91bmRhcnkpIHtcclxuICAgICAgICAgIHJlcGxhY2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjaGFyQ29kZSA9IChjaGFyQ29kZSA8PCA2KSB8IChidWZmZXJbaW5kZXhdICYgMHgzZik7XHJcbiAgICAgICAgaW5kZXgrKztcclxuICAgICAgfVxyXG4gICAgICBpZiAocmVwbGFjZSkge1xyXG4gICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCk7XHJcbiAgICAgIH0gXHJcbiAgICAgIGVsc2UgaWYgKGNoYXJDb2RlIDw9IDB4ZmZmZikge1xyXG4gICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJDb2RlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjaGFyQ29kZSAtPSAweDEwMDAwO1xyXG4gICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKFxyXG4gICAgICAgICAgKChjaGFyQ29kZSA+PiAxMCkgJiAweDNmZikgKyAweGQ4MDAsXHJcbiAgICAgICAgICAoY2hhckNvZGUgJiAweDNmZikgKyAweGRjMDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBzdHI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBXcml0ZSBhIHN0cmluZyBvZiBVVEYtOCBjaGFyYWN0ZXJzIHRvIGEgYnl0ZSBidWZmZXIuXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3V0Zi04LWVuY29kZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHRvIHBhY2suXHJcbiAqIEBwYXJhbSB7IVVpbnQ4QXJyYXl8IUFycmF5PG51bWJlcj59IGJ1ZmZlciBUaGUgYnVmZmVyIHRvIHBhY2sgdGhlIHN0cmluZyB0by5cclxuICogQHBhcmFtIHtudW1iZXI9fSBpbmRleCBUaGUgYnVmZmVyIGluZGV4IHRvIHN0YXJ0IHdyaXRpbmcuXHJcbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG5leHQgaW5kZXggdG8gd3JpdGUgaW4gdGhlIGJ1ZmZlci5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWNrKHN0ciwgYnVmZmVyLCBpbmRleD0wKSB7XHJcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBsZXQgY29kZVBvaW50ID0gc3RyLmNvZGVQb2ludEF0KGkpO1xyXG4gICAgaWYgKGNvZGVQb2ludCA8IDEyOCkge1xyXG4gICAgICBidWZmZXJbaW5kZXhdID0gY29kZVBvaW50O1xyXG4gICAgICBpbmRleCsrO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgICAgaWYgKGNvZGVQb2ludCA8PSAweDA3RkYpIHtcclxuICAgICAgICBjb3VudCA9IDE7XHJcbiAgICAgICAgb2Zmc2V0ID0gMHhDMDtcclxuICAgICAgfSBlbHNlIGlmKGNvZGVQb2ludCA8PSAweEZGRkYpIHtcclxuICAgICAgICBjb3VudCA9IDI7XHJcbiAgICAgICAgb2Zmc2V0ID0gMHhFMDtcclxuICAgICAgfSBlbHNlIGlmKGNvZGVQb2ludCA8PSAweDEwRkZGRikge1xyXG4gICAgICAgIGNvdW50ID0gMztcclxuICAgICAgICBvZmZzZXQgPSAweEYwO1xyXG4gICAgICAgIGkrKztcclxuICAgICAgfVxyXG4gICAgICBidWZmZXJbaW5kZXhdID0gKGNvZGVQb2ludCA+PiAoNiAqIGNvdW50KSkgKyBvZmZzZXQ7XHJcbiAgICAgIGluZGV4Kys7XHJcbiAgICAgIHdoaWxlIChjb3VudCA+IDApIHtcclxuICAgICAgICBidWZmZXJbaW5kZXhdID0gMHg4MCB8IChjb2RlUG9pbnQgPj4gKDYgKiAoY291bnQgLSAxKSkgJiAweDNGKTtcclxuICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgIGNvdW50LS07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGluZGV4O1xyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL0NhbmNlbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG4gICAgdmFyIHJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgdmFyIG9uQ2FuY2VsZWQ7XG4gICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnVuc3Vic2NyaWJlKG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29uZmlnLnNpZ25hbCkge1xuICAgICAgICBjb25maWcuc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25DYW5jZWxlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICBmdW5jdGlvbiBvbmxvYWRlbmQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhcmVzcG9uc2VUeXBlIHx8IHJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnIHx8ICByZXNwb25zZVR5cGUgPT09ICdqc29uJyA/XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShmdW5jdGlvbiBfcmVzb2x2ZSh2YWx1ZSkge1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSwgZnVuY3Rpb24gX3JlamVjdChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCdvbmxvYWRlbmQnIGluIHJlcXVlc3QpIHtcbiAgICAgIC8vIFVzZSBvbmxvYWRlbmQgaWYgYXZhaWxhYmxlXG4gICAgICByZXF1ZXN0Lm9ubG9hZGVuZCA9IG9ubG9hZGVuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZSB0byBlbXVsYXRlIG9ubG9hZGVuZFxuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlYWR5c3RhdGUgaGFuZGxlciBpcyBjYWxsaW5nIGJlZm9yZSBvbmVycm9yIG9yIG9udGltZW91dCBoYW5kbGVycyxcbiAgICAgICAgLy8gc28gd2Ugc2hvdWxkIGNhbGwgb25sb2FkZW5kIG9uIHRoZSBuZXh0ICd0aWNrJ1xuICAgICAgICBzZXRUaW1lb3V0KG9ubG9hZGVuZCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0ID8gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyA6ICd0aW1lb3V0IGV4Y2VlZGVkJztcbiAgICAgIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgdHJhbnNpdGlvbmFsLmNsYXJpZnlUaW1lb3V0RXJyb3IgPyAnRVRJTUVET1VUJyA6ICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKHJlc3BvbnNlVHlwZSAmJiByZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4gfHwgY29uZmlnLnNpZ25hbCkge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgICAgIG9uQ2FuY2VsZWQgPSBmdW5jdGlvbihjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlamVjdCghY2FuY2VsIHx8IChjYW5jZWwgJiYgY2FuY2VsLnR5cGUpID8gbmV3IENhbmNlbCgnY2FuY2VsZWQnKSA6IGNhbmNlbCk7XG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9O1xuXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4gJiYgY29uZmlnLmNhbmNlbFRva2VuLnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIGlmIChjb25maWcuc2lnbmFsKSB7XG4gICAgICAgIGNvbmZpZy5zaWduYWwuYWJvcnRlZCA/IG9uQ2FuY2VsZWQoKSA6IGNvbmZpZy5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkNhbmNlbGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICAvLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG4gIGluc3RhbmNlLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICAgIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhkZWZhdWx0Q29uZmlnLCBpbnN0YW5jZUNvbmZpZykpO1xuICB9O1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcbmF4aW9zLlZFUlNJT04gPSByZXF1aXJlKCcuL2Vudi9kYXRhJykudmVyc2lvbjtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuXG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHRoaXMucHJvbWlzZS50aGVuKGZ1bmN0aW9uKGNhbmNlbCkge1xuICAgIGlmICghdG9rZW4uX2xpc3RlbmVycykgcmV0dXJuO1xuXG4gICAgdmFyIGk7XG4gICAgdmFyIGwgPSB0b2tlbi5fbGlzdGVuZXJzLmxlbmd0aDtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRva2VuLl9saXN0ZW5lcnNbaV0oY2FuY2VsKTtcbiAgICB9XG4gICAgdG9rZW4uX2xpc3RlbmVycyA9IG51bGw7XG4gIH0pO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHRoaXMucHJvbWlzZS50aGVuID0gZnVuY3Rpb24ob25mdWxmaWxsZWQpIHtcbiAgICB2YXIgX3Jlc29sdmU7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgIHRva2VuLnN1YnNjcmliZShyZXNvbHZlKTtcbiAgICAgIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICB9KS50aGVuKG9uZnVsZmlsbGVkKTtcblxuICAgIHByb21pc2UuY2FuY2VsID0gZnVuY3Rpb24gcmVqZWN0KCkge1xuICAgICAgdG9rZW4udW5zdWJzY3JpYmUoX3Jlc29sdmUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfTtcblxuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBTdWJzY3JpYmUgdG8gdGhlIGNhbmNlbCBzaWduYWxcbiAqL1xuXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIGxpc3RlbmVyKHRoaXMucmVhc29uKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodGhpcy5fbGlzdGVuZXJzKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IFtsaXN0ZW5lcl07XG4gIH1cbn07XG5cbi8qKlxuICogVW5zdWJzY3JpYmUgZnJvbSB0aGUgY2FuY2VsIHNpZ25hbFxuICovXG5cbkNhbmNlbFRva2VuLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uIHVuc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gIGlmICghdGhpcy5fbGlzdGVuZXJzKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbmRleCA9IHRoaXMuX2xpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcbnZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3ZhbGlkYXRvcicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzO1xuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnT3JVcmwsIGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZ09yVXJsID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBjb25maWcudXJsID0gY29uZmlnT3JVcmw7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnT3JVcmwgfHwge307XG4gIH1cblxuICBpZiAoIWNvbmZpZy51cmwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3ZpZGVkIGNvbmZpZyB1cmwgaXMgbm90IHZhbGlkJyk7XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbilcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBpZiAoIWNvbmZpZy51cmwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3ZpZGVkIGNvbmZpZyB1cmwgaXMgbm90IHZhbGlkJyk7XG4gIH1cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkLCBvcHRpb25zKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkLFxuICAgIHN5bmNocm9ub3VzOiBvcHRpb25zID8gb3B0aW9ucy5zeW5jaHJvbm91cyA6IGZhbHNlLFxuICAgIHJ1bldoZW46IG9wdGlvbnMgPyBvcHRpb25zLnJ1bldoZW4gOiBudWxsXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL0NhbmNlbCcpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5zaWduYWwgJiYgY29uZmlnLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IENhbmNlbCgnY2FuY2VsZWQnKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgY29uZmlnLFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICBjb25maWcsXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZSxcbiAgICAgIHN0YXR1czogdGhpcy5yZXNwb25zZSAmJiB0aGlzLnJlc3BvbnNlLnN0YXR1cyA/IHRoaXMucmVzcG9uc2Uuc3RhdHVzIDogbnVsbFxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gbWVyZ2VEaXJlY3RLZXlzKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHZhciBtZXJnZU1hcCA9IHtcbiAgICAndXJsJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnbWV0aG9kJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnZGF0YSc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ2Jhc2VVUkwnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXF1ZXN0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNmb3JtUmVzcG9uc2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdwYXJhbXNTZXJpYWxpemVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RpbWVvdXRNZXNzYWdlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnd2l0aENyZWRlbnRpYWxzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnYWRhcHRlcic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3Jlc3BvbnNlVHlwZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3hzcmZDb29raWVOYW1lJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkhlYWRlck5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvblVwbG9hZFByb2dyZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnb25Eb3dubG9hZFByb2dyZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnZGVjb21wcmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdtYXhCb2R5TGVuZ3RoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNwb3J0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnaHR0cEFnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnaHR0cHNBZ2VudCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2NhbmNlbFRva2VuJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnc29ja2V0UGF0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3Jlc3BvbnNlRW5jb2RpbmcnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd2YWxpZGF0ZVN0YXR1cyc6IG1lcmdlRGlyZWN0S2V5c1xuICB9O1xuXG4gIHV0aWxzLmZvckVhY2goT2JqZWN0LmtleXMoY29uZmlnMSkuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKSwgZnVuY3Rpb24gY29tcHV0ZUNvbmZpZ1ZhbHVlKHByb3ApIHtcbiAgICB2YXIgbWVyZ2UgPSBtZXJnZU1hcFtwcm9wXSB8fCBtZXJnZURlZXBQcm9wZXJ0aWVzO1xuICAgIHZhciBjb25maWdWYWx1ZSA9IG1lcmdlKHByb3ApO1xuICAgICh1dGlscy5pc1VuZGVmaW5lZChjb25maWdWYWx1ZSkgJiYgbWVyZ2UgIT09IG1lcmdlRGlyZWN0S2V5cykgfHwgKGNvbmZpZ1twcm9wXSA9IGNvbmZpZ1ZhbHVlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2NvcmUvZW5oYW5jZUVycm9yJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U2FmZWx5KHJhd1ZhbHVlLCBwYXJzZXIsIGVuY29kZXIpIHtcbiAgaWYgKHV0aWxzLmlzU3RyaW5nKHJhd1ZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICAocGFyc2VyIHx8IEpTT04ucGFyc2UpKHJhd1ZhbHVlKTtcbiAgICAgIHJldHVybiB1dGlscy50cmltKHJhd1ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChlbmNvZGVyIHx8IEpTT04uc3RyaW5naWZ5KShyYXdWYWx1ZSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblxuICB0cmFuc2l0aW9uYWw6IHtcbiAgICBzaWxlbnRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBmb3JjZWRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBjbGFyaWZ5VGltZW91dEVycm9yOiBmYWxzZVxuICB9LFxuXG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkgfHwgKGhlYWRlcnMgJiYgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09ICdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeVNhZmVseShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIHZhciB0cmFuc2l0aW9uYWwgPSB0aGlzLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9LFxuXG4gIGhlYWRlcnM6IHtcbiAgICBjb21tb246IHtcbiAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICAgIH1cbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcInZlcnNpb25cIjogXCIwLjI1LjBcIlxufTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZCtcXC0uXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gdXRpbHMuaXNPYmplY3QocGF5bG9hZCkgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFZFUlNJT04gPSByZXF1aXJlKCcuLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbnZhciB2YWxpZGF0b3JzID0ge307XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5bJ29iamVjdCcsICdib29sZWFuJywgJ251bWJlcicsICdmdW5jdGlvbicsICdzdHJpbmcnLCAnc3ltYm9sJ10uZm9yRWFjaChmdW5jdGlvbih0eXBlLCBpKSB7XG4gIHZhbGlkYXRvcnNbdHlwZV0gPSBmdW5jdGlvbiB2YWxpZGF0b3IodGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSB0eXBlIHx8ICdhJyArIChpIDwgMSA/ICduICcgOiAnICcpICsgdHlwZTtcbiAgfTtcbn0pO1xuXG52YXIgZGVwcmVjYXRlZFdhcm5pbmdzID0ge307XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvciAtIHNldCB0byBmYWxzZSBpZiB0aGUgdHJhbnNpdGlvbmFsIG9wdGlvbiBoYXMgYmVlbiByZW1vdmVkXG4gKiBAcGFyYW0ge3N0cmluZz99IHZlcnNpb24gLSBkZXByZWNhdGVkIHZlcnNpb24gLyByZW1vdmVkIHNpbmNlIHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gbWVzc2FnZSAtIHNvbWUgbWVzc2FnZSB3aXRoIGFkZGl0aW9uYWwgaW5mb1xuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIFZFUlNJT04gKyAnXSBUcmFuc2l0aW9uYWwgb3B0aW9uIFxcJycgKyBvcHQgKyAnXFwnJyArIGRlc2MgKyAobWVzc2FnZSA/ICcuICcgKyBtZXNzYWdlIDogJycpO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHQsIG9wdHMpIHtcbiAgICBpZiAodmFsaWRhdG9yID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdE1lc3NhZ2Uob3B0LCAnIGhhcyBiZWVuIHJlbW92ZWQnICsgKHZlcnNpb24gPyAnIGluICcgKyB2ZXJzaW9uIDogJycpKSk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gJiYgIWRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdKSB7XG4gICAgICBkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSA9IHRydWU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRNZXNzYWdlKFxuICAgICAgICAgIG9wdCxcbiAgICAgICAgICAnIGhhcyBiZWVuIGRlcHJlY2F0ZWQgc2luY2UgdicgKyB2ZXJzaW9uICsgJyBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZWFyIGZ1dHVyZSdcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yID8gdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdHMpIDogdHJ1ZTtcbiAgfTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IG9iamVjdCdzIHByb3BlcnRpZXMgdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY2hlbWFcbiAqIEBwYXJhbSB7Ym9vbGVhbj99IGFsbG93VW5rbm93blxuICovXG5cbmZ1bmN0aW9uIGFzc2VydE9wdGlvbnMob3B0aW9ucywgc2NoZW1hLCBhbGxvd1Vua25vd24pIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgfVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tID4gMCkge1xuICAgIHZhciBvcHQgPSBrZXlzW2ldO1xuICAgIHZhciB2YWxpZGF0b3IgPSBzY2hlbWFbb3B0XTtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvcHRpb25zW29wdF07XG4gICAgICB2YXIgcmVzdWx0ID0gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0aW9ucyk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiAnICsgb3B0ICsgJyBtdXN0IGJlICcgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChhbGxvd1Vua25vd24gIT09IHRydWUpIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmtub3duIG9wdGlvbiAnICsgb3B0KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzc2VydE9wdGlvbnM6IGFzc2VydE9wdGlvbnMsXG4gIHZhbGlkYXRvcnM6IHZhbGlkYXRvcnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGb3JtRGF0YV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmIChpc0FycmF5QnVmZmVyKHZhbC5idWZmZXIpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgVVJMU2VhcmNoUGFyYW1zXSc7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUmVhZGVyID0gZXhwb3J0cy5Xcml0ZXIgPSB2b2lkIDA7XG5jb25zdCB1dGY4ID0gcmVxdWlyZShcInV0ZjgtYnVmZmVyXCIpO1xuY29uc3QgdXRmOF9idWZmZXJfc2l6ZV8xID0gcmVxdWlyZShcInV0ZjgtYnVmZmVyLXNpemVcIik7XG5jb25zdCB7IHBhY2ssIHVucGFjayB9ID0gdXRmOC5kZWZhdWx0ID8/IHV0Zjg7XG5jbGFzcyBXcml0ZXIge1xuICAgIHBvcyA9IDA7XG4gICAgdmlldztcbiAgICBieXRlcztcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcig2NCkpO1xuICAgICAgICB0aGlzLmJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkodGhpcy52aWV3LmJ1ZmZlcik7XG4gICAgfVxuICAgIHdyaXRlVUludDgodmFsKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZSgxKTtcbiAgICAgICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMucG9zLCB2YWwpO1xuICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVVSW50MzIodmFsKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZSg0KTtcbiAgICAgICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLnBvcywgdmFsKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlVUludDY0KHZhbCkge1xuICAgICAgICB0aGlzLmVuc3VyZVNpemUoOCk7XG4gICAgICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5wb3MsIHZhbCk7XG4gICAgICAgIHRoaXMucG9zICs9IDg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVVWYXJpbnQodmFsKSB7XG4gICAgICAgIGlmICh2YWwgPCAweDgwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoMSk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5wb3MsIHZhbCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCA8IDB4NDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDIpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQxNih0aGlzLnBvcywgKHZhbCAmIDB4N2YpIHwgKCh2YWwgJiAweDNmODApIDw8IDEpIHwgMHg4MDAwKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIDwgMHgyMDAwMDApIHtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZSgzKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLnBvcywgKHZhbCA+PiAxNCkgfCAweDgwKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MTYodGhpcy5wb3MgKyAxLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAweDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gMztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDEwMDAwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoNCk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDMyKHRoaXMucG9zLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAoKHZhbCAmIDB4MWZjMDAwKSA8PCAyKSB8ICgodmFsICYgMHhmZTAwMDAwKSA8PCAzKSB8IDB4ODA4MDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDgwMDAwMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDUpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMucG9zLCBNYXRoLmZsb29yKHZhbCAvIE1hdGgucG93KDIsIDI4KSkgfCAweDgwKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5wb3MgKyAxLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAoKHZhbCAmIDB4MWZjMDAwKSA8PCAyKSB8ICgodmFsICYgMHhmZTAwMDAwKSA8PCAzKSB8IDB4ODA4MDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gNTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDQwMDAwMDAwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoNik7XG4gICAgICAgICAgICBjb25zdCBzaGlmdGVkVmFsID0gTWF0aC5mbG9vcih2YWwgLyBNYXRoLnBvdygyLCAyOCkpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQxNih0aGlzLnBvcywgKHNoaWZ0ZWRWYWwgJiAweDdmKSB8ICgoc2hpZnRlZFZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAweDgwODApO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLnBvcyArIDIsICh2YWwgJiAweDdmKSB8ICgodmFsICYgMHgzZjgwKSA8PCAxKSB8ICgodmFsICYgMHgxZmMwMDApIDw8IDIpIHwgKCh2YWwgJiAweGZlMDAwMDApIDw8IDMpIHwgMHg4MDgwODAwMCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSA2O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVmFsdWUgb3V0IG9mIHJhbmdlXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVZhcmludCh2YWwpIHtcbiAgICAgICAgY29uc3QgYmlndmFsID0gQmlnSW50KHZhbCk7XG4gICAgICAgIHRoaXMud3JpdGVVVmFyaW50KE51bWJlcigoYmlndmFsID4+IDYzbikgXiAoYmlndmFsIDw8IDFuKSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVGbG9hdCh2YWwpIHtcbiAgICAgICAgdGhpcy5lbnN1cmVTaXplKDQpO1xuICAgICAgICB0aGlzLnZpZXcuc2V0RmxvYXQzMih0aGlzLnBvcywgdmFsLCB0cnVlKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlQml0cyhiaXRzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYml0cy5sZW5ndGg7IGkgKz0gOCkge1xuICAgICAgICAgICAgbGV0IGJ5dGUgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaSArIGogPT0gYml0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJ5dGUgfD0gKGJpdHNbaSArIGpdID8gMSA6IDApIDw8IGo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLndyaXRlVUludDgoYnl0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlU3RyaW5nKHZhbCkge1xuICAgICAgICBpZiAodmFsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVTaXplID0gKDAsIHV0ZjhfYnVmZmVyX3NpemVfMS5kZWZhdWx0KSh2YWwpO1xuICAgICAgICAgICAgdGhpcy53cml0ZVVWYXJpbnQoYnl0ZVNpemUpO1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKGJ5dGVTaXplKTtcbiAgICAgICAgICAgIHBhY2sodmFsLCB0aGlzLmJ5dGVzLCB0aGlzLnBvcyk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSBieXRlU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud3JpdGVVSW50OCgwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVCdWZmZXIoYnVmKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZShidWYubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5ieXRlcy5zZXQoYnVmLCB0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IGJ1Zi5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB0b0J1ZmZlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnl0ZXMuc3ViYXJyYXkoMCwgdGhpcy5wb3MpO1xuICAgIH1cbiAgICBlbnN1cmVTaXplKHNpemUpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMudmlldy5ieXRlTGVuZ3RoIDwgdGhpcy5wb3MgKyBzaXplKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdWaWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcih0aGlzLnZpZXcuYnl0ZUxlbmd0aCAqIDIpKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0J5dGVzID0gbmV3IFVpbnQ4QXJyYXkobmV3Vmlldy5idWZmZXIpO1xuICAgICAgICAgICAgbmV3Qnl0ZXMuc2V0KHRoaXMuYnl0ZXMpO1xuICAgICAgICAgICAgdGhpcy52aWV3ID0gbmV3VmlldztcbiAgICAgICAgICAgIHRoaXMuYnl0ZXMgPSBuZXdCeXRlcztcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuV3JpdGVyID0gV3JpdGVyO1xuY2xhc3MgUmVhZGVyIHtcbiAgICBwb3MgPSAwO1xuICAgIHZpZXc7XG4gICAgYnl0ZXM7XG4gICAgY29uc3RydWN0b3IoYnVmKSB7XG4gICAgICAgIHRoaXMudmlldyA9IG5ldyBEYXRhVmlldyhidWYuYnVmZmVyLCBidWYuYnl0ZU9mZnNldCwgYnVmLmJ5dGVMZW5ndGgpO1xuICAgICAgICB0aGlzLmJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkodGhpcy52aWV3LmJ1ZmZlciwgYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5ieXRlTGVuZ3RoKTtcbiAgICB9XG4gICAgcmVhZFVJbnQ4KCkge1xuICAgICAgICBjb25zdCB2YWwgPSB0aGlzLnZpZXcuZ2V0VWludDgodGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkVUludDMyKCkge1xuICAgICAgICBjb25zdCB2YWwgPSB0aGlzLnZpZXcuZ2V0VWludDMyKHRoaXMucG9zKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgcmVhZFVJbnQ2NCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IDg7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJlYWRVVmFyaW50KCkge1xuICAgICAgICBsZXQgdmFsID0gMDtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCBieXRlID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMucG9zKyspO1xuICAgICAgICAgICAgaWYgKGJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbCArIGJ5dGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWwgPSAodmFsICsgKGJ5dGUgJiAweDdmKSkgKiAxMjg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVhZFZhcmludCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gQmlnSW50KHRoaXMucmVhZFVWYXJpbnQoKSk7XG4gICAgICAgIHJldHVybiBOdW1iZXIoKHZhbCA+PiAxbikgXiAtKHZhbCAmIDFuKSk7XG4gICAgfVxuICAgIHJlYWRGbG9hdCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy52aWV3LmdldEZsb2F0MzIodGhpcy5wb3MsIHRydWUpO1xuICAgICAgICB0aGlzLnBvcyArPSA0O1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkQml0cyhudW1CaXRzKSB7XG4gICAgICAgIGNvbnN0IG51bUJ5dGVzID0gTWF0aC5jZWlsKG51bUJpdHMgLyA4KTtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSB0aGlzLmJ5dGVzLnNsaWNlKHRoaXMucG9zLCB0aGlzLnBvcyArIG51bUJ5dGVzKTtcbiAgICAgICAgY29uc3QgYml0cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGJ5dGUgb2YgYnl0ZXMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgOCAmJiBiaXRzLmxlbmd0aCA8IG51bUJpdHM7IGkrKykge1xuICAgICAgICAgICAgICAgIGJpdHMucHVzaCgoKGJ5dGUgPj4gaSkgJiAxKSA9PT0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3MgKz0gbnVtQnl0ZXM7XG4gICAgICAgIHJldHVybiBiaXRzO1xuICAgIH1cbiAgICByZWFkU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBsZW4gPSB0aGlzLnJlYWRVVmFyaW50KCk7XG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbCA9IHVucGFjayh0aGlzLmJ5dGVzLCB0aGlzLnBvcywgdGhpcy5wb3MgKyBsZW4pO1xuICAgICAgICB0aGlzLnBvcyArPSBsZW47XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJlYWRCdWZmZXIobnVtQnl0ZXMpIHtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSB0aGlzLmJ5dGVzLnNsaWNlKHRoaXMucG9zLCB0aGlzLnBvcyArIG51bUJ5dGVzKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gbnVtQnl0ZXM7XG4gICAgICAgIHJldHVybiBieXRlcztcbiAgICB9XG4gICAgcmVtYWluaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52aWV3LmJ5dGVMZW5ndGggLSB0aGlzLnBvcztcbiAgICB9XG59XG5leHBvcnRzLlJlYWRlciA9IFJlYWRlcjtcbiIsInZhciB3aW5kb3cgPSByZXF1aXJlKCdnbG9iYWwvd2luZG93Jyk7XG52YXIgbm9kZUNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuXG5mdW5jdGlvbiBnZXRSYW5kb21WYWx1ZXMoYnVmKSB7XG4gIGlmICh3aW5kb3cuY3J5cHRvICYmIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGJ1Zik7XG4gIH1cbiAgaWYgKHR5cGVvZiB3aW5kb3cubXNDcnlwdG8gPT09ICdvYmplY3QnICYmIHR5cGVvZiB3aW5kb3cubXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5tc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMoYnVmKTtcbiAgfVxuICBpZiAobm9kZUNyeXB0by5yYW5kb21CeXRlcykge1xuICAgIGlmICghKGJ1ZiBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleHBlY3RlZCBVaW50OEFycmF5Jyk7XG4gICAgfVxuICAgIGlmIChidWYubGVuZ3RoID4gNjU1MzYpIHtcbiAgICAgIHZhciBlID0gbmV3IEVycm9yKCk7XG4gICAgICBlLmNvZGUgPSAyMjtcbiAgICAgIGUubWVzc2FnZSA9ICdGYWlsZWQgdG8gZXhlY3V0ZSBcXCdnZXRSYW5kb21WYWx1ZXNcXCcgb24gXFwnQ3J5cHRvXFwnOiBUaGUgJyArXG4gICAgICAgICdBcnJheUJ1ZmZlclZpZXdcXCdzIGJ5dGUgbGVuZ3RoICgnICsgYnVmLmxlbmd0aCArICcpIGV4Y2VlZHMgdGhlICcgK1xuICAgICAgICAnbnVtYmVyIG9mIGJ5dGVzIG9mIGVudHJvcHkgYXZhaWxhYmxlIHZpYSB0aGlzIEFQSSAoNjU1MzYpLic7XG4gICAgICBlLm5hbWUgPSAnUXVvdGFFeGNlZWRlZEVycm9yJztcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIHZhciBieXRlcyA9IG5vZGVDcnlwdG8ucmFuZG9tQnl0ZXMoYnVmLmxlbmd0aCk7XG4gICAgYnVmLnNldChieXRlcyk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuICBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHNlY3VyZSByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBhdmFpbGFibGUuJyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSYW5kb21WYWx1ZXM7XG4iLCJ2YXIgd2luO1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIHdpbiA9IHNlbGY7XG59IGVsc2Uge1xuICAgIHdpbiA9IHt9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbjtcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXhvZ2Rlbi93ZWJzb2NrZXQtc3RyZWFtL2Jsb2IvNDhkYzNkZGY5NDNlNWFkYTY2OGMzMWNjZDk0ZTkxODZmMDJmYWZiZC93cy1mYWxsYmFjay5qc1xuXG52YXIgd3MgPSBudWxsXG5cbmlmICh0eXBlb2YgV2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IFdlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2YgTW96V2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IE1veldlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IGdsb2JhbC5XZWJTb2NrZXQgfHwgZ2xvYmFsLk1veldlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IHdpbmRvdy5XZWJTb2NrZXQgfHwgd2luZG93Lk1veldlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgd3MgPSBzZWxmLldlYlNvY2tldCB8fCBzZWxmLk1veldlYlNvY2tldFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdzXG4iLCJmdW5jdGlvbiBlKGUpe3RoaXMubWVzc2FnZT1lfWUucHJvdG90eXBlPW5ldyBFcnJvcixlLnByb3RvdHlwZS5uYW1lPVwiSW52YWxpZENoYXJhY3RlckVycm9yXCI7dmFyIHI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdyYmd2luZG93LmF0b2ImJndpbmRvdy5hdG9iLmJpbmQod2luZG93KXx8ZnVuY3Rpb24ocil7dmFyIHQ9U3RyaW5nKHIpLnJlcGxhY2UoLz0rJC8sXCJcIik7aWYodC5sZW5ndGglND09MSl0aHJvdyBuZXcgZShcIidhdG9iJyBmYWlsZWQ6IFRoZSBzdHJpbmcgdG8gYmUgZGVjb2RlZCBpcyBub3QgY29ycmVjdGx5IGVuY29kZWQuXCIpO2Zvcih2YXIgbixvLGE9MCxpPTAsYz1cIlwiO289dC5jaGFyQXQoaSsrKTt+byYmKG49YSU0PzY0Km4rbzpvLGErKyU0KT9jKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDI1NSZuPj4oLTIqYSY2KSk6MClvPVwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIi5pbmRleE9mKG8pO3JldHVybiBjfTtmdW5jdGlvbiB0KGUpe3ZhciB0PWUucmVwbGFjZSgvLS9nLFwiK1wiKS5yZXBsYWNlKC9fL2csXCIvXCIpO3N3aXRjaCh0Lmxlbmd0aCU0KXtjYXNlIDA6YnJlYWs7Y2FzZSAyOnQrPVwiPT1cIjticmVhaztjYXNlIDM6dCs9XCI9XCI7YnJlYWs7ZGVmYXVsdDp0aHJvd1wiSWxsZWdhbCBiYXNlNjR1cmwgc3RyaW5nIVwifXRyeXtyZXR1cm4gZnVuY3Rpb24oZSl7cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyKGUpLnJlcGxhY2UoLyguKS9nLChmdW5jdGlvbihlLHIpe3ZhciB0PXIuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtyZXR1cm4gdC5sZW5ndGg8MiYmKHQ9XCIwXCIrdCksXCIlXCIrdH0pKSl9KHQpfWNhdGNoKGUpe3JldHVybiByKHQpfX1mdW5jdGlvbiBuKGUpe3RoaXMubWVzc2FnZT1lfWZ1bmN0aW9uIG8oZSxyKXtpZihcInN0cmluZ1wiIT10eXBlb2YgZSl0aHJvdyBuZXcgbihcIkludmFsaWQgdG9rZW4gc3BlY2lmaWVkXCIpO3ZhciBvPSEwPT09KHI9cnx8e30pLmhlYWRlcj8wOjE7dHJ5e3JldHVybiBKU09OLnBhcnNlKHQoZS5zcGxpdChcIi5cIilbb10pKX1jYXRjaChlKXt0aHJvdyBuZXcgbihcIkludmFsaWQgdG9rZW4gc3BlY2lmaWVkOiBcIitlLm1lc3NhZ2UpfX1uLnByb3RvdHlwZT1uZXcgRXJyb3Isbi5wcm90b3R5cGUubmFtZT1cIkludmFsaWRUb2tlbkVycm9yXCI7ZXhwb3J0IGRlZmF1bHQgbztleHBvcnR7biBhcyBJbnZhbGlkVG9rZW5FcnJvcn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1qd3QtZGVjb2RlLmVzbS5qcy5tYXBcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoYykgMjAxOCBSYWZhZWwgZGEgU2lsdmEgUm9jaGEuXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xyXG4gKiBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuICogXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbiAqIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXHJcbiAqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xyXG4gKiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXHJcbiAqIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxyXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcclxuICogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcclxuICogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxyXG4gKiBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXHJcbiAqIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxyXG4gKiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG4vKipcclxuICogQGZpbGVvdmVydmlldyBUaGUgdXRmOC1idWZmZXItc2l6ZSBBUEkuXHJcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3JvY2hhcnMvdXRmOC1idWZmZXItc2l6ZVxyXG4gKi9cclxuXHJcbi8qKiBAbW9kdWxlIHV0ZjhCdWZmZXJTaXplICovXHJcblxyXG4vKipcclxuICogUmV0dXJucyBob3cgbWFueSBieXRlcyBhcmUgbmVlZGVkIHRvIHNlcmlhbGl6ZSBhIFVURi04IHN0cmluZy5cclxuICogQHNlZSBodHRwczovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jdXRmLTgtZW5jb2RlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gcGFjay5cclxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGJ5dGVzIG5lZWRlZCB0byBzZXJpYWxpemUgdGhlIHN0cmluZy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHV0ZjhCdWZmZXJTaXplKHN0cikge1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIGxldCBieXRlcyA9IDA7XHJcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBsZXQgY29kZVBvaW50ID0gc3RyLmNvZGVQb2ludEF0KGkpO1xyXG4gICAgaWYgKGNvZGVQb2ludCA8IDEyOCkge1xyXG4gICAgICBieXRlcysrO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGNvZGVQb2ludCA8PSAyMDQ3KSB7XHJcbiAgICAgICAgYnl0ZXMrKztcclxuICAgICAgfSBlbHNlIGlmKGNvZGVQb2ludCA8PSA2NTUzNSkge1xyXG4gICAgICAgIGJ5dGVzKz0yO1xyXG4gICAgICB9IGVsc2UgaWYoY29kZVBvaW50IDw9IDExMTQxMTEpIHtcclxuICAgICAgICBpKys7XHJcbiAgICAgICAgYnl0ZXMrPTM7XHJcbiAgICAgIH1cclxuICAgICAgYnl0ZXMrKztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGJ5dGVzO1xyXG59XHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoYykgMjAxOCBSYWZhZWwgZGEgU2lsdmEgUm9jaGEuXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xyXG4gKiBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuICogXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbiAqIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXHJcbiAqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xyXG4gKiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXHJcbiAqIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxyXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcclxuICogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcclxuICogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxyXG4gKiBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXHJcbiAqIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxyXG4gKiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG4vKipcclxuICogQGZpbGVvdmVydmlldyBGdW5jdGlvbnMgdG8gc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBVVEYtOCBzdHJpbmdzLlxyXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9yb2NoYXJzL3V0ZjgtYnVmZmVyXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3RoZS1lbmNvZGluZ1xyXG4gKiBAc2VlIGh0dHBzOi8vZW5jb2Rpbmcuc3BlYy53aGF0d2cub3JnLyN1dGYtOC1lbmNvZGVyXHJcbiAqL1xyXG5cclxuLyoqIEBtb2R1bGUgdXRmOC1idWZmZXIgKi9cclxuXHJcbi8qKlxyXG4gKiBSZWFkIGEgc3RyaW5nIG9mIFVURi04IGNoYXJhY3RlcnMgZnJvbSBhIGJ5dGUgYnVmZmVyLlxyXG4gKiBJbnZhbGlkIGNoYXJhY3RlcnMgYXJlIHJlcGxhY2VkIHdpdGggJ1JFUExBQ0VNRU5UIENIQVJBQ1RFUicgKFUrRkZGRCkuXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3RoZS1lbmNvZGluZ1xyXG4gKiBAc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zNDkyNjkxMVxyXG4gKiBAcGFyYW0geyFVaW50OEFycmF5fCFBcnJheTxudW1iZXI+fSBidWZmZXIgQSBieXRlIGJ1ZmZlci5cclxuICogQHBhcmFtIHtudW1iZXI9fSBzdGFydCBUaGUgYnVmZmVyIGluZGV4IHRvIHN0YXJ0IHJlYWRpbmcuXHJcbiAqIEBwYXJhbSB7P251bWJlcj19IGVuZCBUaGUgYnVmZmVyIGluZGV4IHRvIHN0b3AgcmVhZGluZy5cclxuICogICBBc3N1bWVzIHRoZSBidWZmZXIgbGVuZ3RoIGlmIHVuZGVmaW5lZC5cclxuICogQHJldHVybiB7c3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVucGFjayhidWZmZXIsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKSB7XHJcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXHJcbiAgbGV0IHN0ciA9ICcnO1xyXG4gIGZvcihsZXQgaW5kZXggPSBzdGFydDsgaW5kZXggPCBlbmQ7KSB7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCBsb3dlckJvdW5kYXJ5ID0gMHg4MDtcclxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgbGV0IHVwcGVyQm91bmRhcnkgPSAweEJGO1xyXG4gICAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xyXG4gICAgbGV0IHJlcGxhY2UgPSBmYWxzZTtcclxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgbGV0IGNoYXJDb2RlID0gYnVmZmVyW2luZGV4KytdO1xyXG4gICAgaWYgKGNoYXJDb2RlID49IDB4MDAgJiYgY2hhckNvZGUgPD0gMHg3Rikge1xyXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyQ29kZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgaWYgKGNoYXJDb2RlID49IDB4QzIgJiYgY2hhckNvZGUgPD0gMHhERikge1xyXG4gICAgICAgIGNvdW50ID0gMTtcclxuICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZSA+PSAweEUwICYmIGNoYXJDb2RlIDw9IDB4RUYgKSB7XHJcbiAgICAgICAgY291bnQgPSAyO1xyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdID09PSAweEUwKSB7XHJcbiAgICAgICAgICBsb3dlckJvdW5kYXJ5ID0gMHhBMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJ1ZmZlcltpbmRleF0gPT09IDB4RUQpIHtcclxuICAgICAgICAgIHVwcGVyQm91bmRhcnkgPSAweDlGO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZSA+PSAweEYwICYmIGNoYXJDb2RlIDw9IDB4RjQgKSB7XHJcbiAgICAgICAgY291bnQgPSAzO1xyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdID09PSAweEYwKSB7XHJcbiAgICAgICAgICBsb3dlckJvdW5kYXJ5ID0gMHg5MDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJ1ZmZlcltpbmRleF0gPT09IDB4RjQpIHtcclxuICAgICAgICAgIHVwcGVyQm91bmRhcnkgPSAweDhGO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBjaGFyQ29kZSA9IGNoYXJDb2RlICYgKDEgPDwgKDggLSBjb3VudCAtIDEpKSAtIDE7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdIDwgbG93ZXJCb3VuZGFyeSB8fCBidWZmZXJbaW5kZXhdID4gdXBwZXJCb3VuZGFyeSkge1xyXG4gICAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNoYXJDb2RlID0gKGNoYXJDb2RlIDw8IDYpIHwgKGJ1ZmZlcltpbmRleF0gJiAweDNmKTtcclxuICAgICAgICBpbmRleCsrO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChyZXBsYWNlKSB7XHJcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKTtcclxuICAgICAgfSBcclxuICAgICAgZWxzZSBpZiAoY2hhckNvZGUgPD0gMHhmZmZmKSB7XHJcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNoYXJDb2RlIC09IDB4MTAwMDA7XHJcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoXHJcbiAgICAgICAgICAoKGNoYXJDb2RlID4+IDEwKSAmIDB4M2ZmKSArIDB4ZDgwMCxcclxuICAgICAgICAgIChjaGFyQ29kZSAmIDB4M2ZmKSArIDB4ZGMwMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHN0cjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFdyaXRlIGEgc3RyaW5nIG9mIFVURi04IGNoYXJhY3RlcnMgdG8gYSBieXRlIGJ1ZmZlci5cclxuICogQHNlZSBodHRwczovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jdXRmLTgtZW5jb2RlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gcGFjay5cclxuICogQHBhcmFtIHshVWludDhBcnJheXwhQXJyYXk8bnVtYmVyPn0gYnVmZmVyIFRoZSBidWZmZXIgdG8gcGFjayB0aGUgc3RyaW5nIHRvLlxyXG4gKiBAcGFyYW0ge251bWJlcj19IGluZGV4IFRoZSBidWZmZXIgaW5kZXggdG8gc3RhcnQgd3JpdGluZy5cclxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbmV4dCBpbmRleCB0byB3cml0ZSBpbiB0aGUgYnVmZmVyLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhY2soc3RyLCBidWZmZXIsIGluZGV4PTApIHtcclxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCBjb2RlUG9pbnQgPSBzdHIuY29kZVBvaW50QXQoaSk7XHJcbiAgICBpZiAoY29kZVBvaW50IDwgMTI4KSB7XHJcbiAgICAgIGJ1ZmZlcltpbmRleF0gPSBjb2RlUG9pbnQ7XHJcbiAgICAgIGluZGV4Kys7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgICBpZiAoY29kZVBvaW50IDw9IDB4MDdGRikge1xyXG4gICAgICAgIGNvdW50ID0gMTtcclxuICAgICAgICBvZmZzZXQgPSAweEMwO1xyXG4gICAgICB9IGVsc2UgaWYoY29kZVBvaW50IDw9IDB4RkZGRikge1xyXG4gICAgICAgIGNvdW50ID0gMjtcclxuICAgICAgICBvZmZzZXQgPSAweEUwO1xyXG4gICAgICB9IGVsc2UgaWYoY29kZVBvaW50IDw9IDB4MTBGRkZGKSB7XHJcbiAgICAgICAgY291bnQgPSAzO1xyXG4gICAgICAgIG9mZnNldCA9IDB4RjA7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICB9XHJcbiAgICAgIGJ1ZmZlcltpbmRleF0gPSAoY29kZVBvaW50ID4+ICg2ICogY291bnQpKSArIG9mZnNldDtcclxuICAgICAgaW5kZXgrKztcclxuICAgICAgd2hpbGUgKGNvdW50ID4gMCkge1xyXG4gICAgICAgIGJ1ZmZlcltpbmRleF0gPSAweDgwIHwgKGNvZGVQb2ludCA+PiAoNiAqIChjb3VudCAtIDEpKSAmIDB4M0YpO1xyXG4gICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgY291bnQtLTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gaW5kZXg7XHJcbn1cclxuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIvKnN0eWxlLmNzcyovXFxyXFxuLkhlYWRlciB7XFxyXFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig3MywgNzMsIDczKTtcXHJcXG59XFxyXFxuXFxyXFxuLkxvZ2luUGFnZWhlYWRlciB7XFxyXFxuICAgIGNvbG9yOiB3aGl0ZTtcXHJcXG4gICAgZm9udC1mYW1pbHk6ICdIZWx2ZXRpY2EnO1xcclxcbn1cXHJcXG5cXHJcXG4ubG9naW5CdXR0b24ge1xcclxcbiAgICB3aWR0aDogMTAwcHg7XFxyXFxuICAgIGhlaWdodDogNTBweDtcXHJcXG4gICAgbWFyZ2luLXRvcDogMTVweDtcXHJcXG4gICAgY29sb3I6IHdoaXRlO1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTAsIDU2LCA3MSk7XFxyXFxufVxcclxcblwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUEsWUFBWTtBQUNaO0lBQ0ksaUNBQWlDO0FBQ3JDOztBQUVBO0lBQ0ksWUFBWTtJQUNaLHdCQUF3QjtBQUM1Qjs7QUFFQTtJQUNJLFlBQVk7SUFDWixZQUFZO0lBQ1osZ0JBQWdCO0lBQ2hCLFlBQVk7SUFDWixpQ0FBaUM7QUFDckNcIixcInNvdXJjZXNDb250ZW50XCI6W1wiLypzdHlsZS5jc3MqL1xcclxcbi5IZWFkZXIge1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNzMsIDczLCA3Myk7XFxyXFxufVxcclxcblxcclxcbi5Mb2dpblBhZ2VoZWFkZXIge1xcclxcbiAgICBjb2xvcjogd2hpdGU7XFxyXFxuICAgIGZvbnQtZmFtaWx5OiAnSGVsdmV0aWNhJztcXHJcXG59XFxyXFxuXFxyXFxuLmxvZ2luQnV0dG9uIHtcXHJcXG4gICAgd2lkdGg6IDEwMHB4O1xcclxcbiAgICBoZWlnaHQ6IDUwcHg7XFxyXFxuICAgIG1hcmdpbi10b3A6IDE1cHg7XFxyXFxuICAgIGNvbG9yOiB3aGl0ZTtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEwLCA1NiwgNzEpO1xcclxcbn1cXHJcXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgXCJcIikuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcblxuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG5cbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG5cbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG5cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cblxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG5cbiAgY3NzICs9IG9iai5jc3M7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcbmltcG9ydCAqIGFzIFQgZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGNvbnN0IENPT1JESU5BVE9SX0hPU1QgPSBcImNvb3JkaW5hdG9yLmhhdGhvcmEuZGV2XCI7XG5cbmV4cG9ydCBjb25zdCBOT19ESUZGID0gU3ltYm9sKFwiTk9ESUZGXCIpO1xuZXhwb3J0IHR5cGUgRGVlcFBhcnRpYWw8VD4gPSBUIGV4dGVuZHMgc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IHVuZGVmaW5lZFxuICA/IFRcbiAgOiBUIGV4dGVuZHMgQXJyYXk8aW5mZXIgQXJyYXlUeXBlPlxuICA/IEFycmF5PERlZXBQYXJ0aWFsPEFycmF5VHlwZT4gfCB0eXBlb2YgTk9fRElGRj4gfCB0eXBlb2YgTk9fRElGRlxuICA6IFQgZXh0ZW5kcyB7IHR5cGU6IHN0cmluZzsgdmFsOiBhbnkgfVxuICA/IHsgdHlwZTogVFtcInR5cGVcIl07IHZhbDogRGVlcFBhcnRpYWw8VFtcInZhbFwiXSB8IHR5cGVvZiBOT19ESUZGPiB9XG4gIDogeyBbSyBpbiBrZXlvZiBUXTogRGVlcFBhcnRpYWw8VFtLXT4gfCB0eXBlb2YgTk9fRElGRiB9O1xuXG5leHBvcnQgZW51bSBNZXRob2Qge1xuICBKT0lOX0dBTUUsXG4gIFNFTEVDVF9ST0xFLFxuICBBRERfQV9JLFxuICBTVEFSVF9HQU1FLFxuICBTRUxFQ1RfVE9XRVJfREVGRU5TRSxcbiAgU0VMRUNUX01PTlNURVJfQ0FSRCxcbiAgU0VMRUNUX1BMQVlFUl9DQVJELFxuICBESVNDQVJELFxuICBEUkFXX0NBUkQsXG4gIEVORF9UVVJOLFxuICBTVEFSVF9UVVJOLFxuICBVU0VSX0NIT0lDRSxcbiAgQVBQTFlfQVRUQUNLLFxuICBCVVlfQUJJTElUWV9DQVJELFxufVxuXG5leHBvcnQgdHlwZSBPa1Jlc3BvbnNlID0geyB0eXBlOiBcIm9rXCIgfTtcbmV4cG9ydCB0eXBlIEVycm9yUmVzcG9uc2UgPSB7IHR5cGU6IFwiZXJyb3JcIjsgZXJyb3I6IHN0cmluZyB9O1xuZXhwb3J0IHR5cGUgUmVzcG9uc2UgPSBPa1Jlc3BvbnNlIHwgRXJyb3JSZXNwb25zZTtcbmV4cG9ydCBjb25zdCBSZXNwb25zZTogeyBvazogKCkgPT4gT2tSZXNwb25zZTsgZXJyb3I6IChlcnJvcjogc3RyaW5nKSA9PiBFcnJvclJlc3BvbnNlIH0gPSB7XG4gIG9rOiAoKSA9PiAoeyB0eXBlOiBcIm9rXCIgfSksXG4gIGVycm9yOiAoZXJyb3IpID0+ICh7IHR5cGU6IFwiZXJyb3JcIiwgZXJyb3IgfSksXG59O1xuXG5leHBvcnQgdHlwZSBSZXNwb25zZU1lc3NhZ2UgPSB7IHR5cGU6IFwicmVzcG9uc2VcIjsgbXNnSWQ6IG51bWJlcjsgcmVzcG9uc2U6IFJlc3BvbnNlIH07XG5leHBvcnQgdHlwZSBFdmVudE1lc3NhZ2UgPSB7IHR5cGU6IFwiZXZlbnRcIjsgZXZlbnQ6IHN0cmluZyB9O1xuZXhwb3J0IHR5cGUgTWVzc2FnZSA9IFJlc3BvbnNlTWVzc2FnZSB8IEV2ZW50TWVzc2FnZTtcbmV4cG9ydCBjb25zdCBNZXNzYWdlOiB7XG4gIHJlc3BvbnNlOiAobXNnSWQ6IG51bWJlciwgcmVzcG9uc2U6IFJlc3BvbnNlKSA9PiBSZXNwb25zZU1lc3NhZ2U7XG4gIGV2ZW50OiAoZXZlbnQ6IHN0cmluZykgPT4gRXZlbnRNZXNzYWdlO1xufSA9IHtcbiAgcmVzcG9uc2U6IChtc2dJZCwgcmVzcG9uc2UpID0+ICh7IHR5cGU6IFwicmVzcG9uc2VcIiwgbXNnSWQsIHJlc3BvbnNlIH0pLFxuICBldmVudDogKGV2ZW50KSA9PiAoeyB0eXBlOiBcImV2ZW50XCIsIGV2ZW50IH0pLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBBbm9ueW1vdXNVc2VyRGF0YSB7XG4gIHR5cGU6IFwiYW5vbnltb3VzXCI7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbn1cbmV4cG9ydCB0eXBlIFVzZXJEYXRhID0gQW5vbnltb3VzVXNlckRhdGE7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb29rdXBVc2VyKHVzZXJJZDogVC5Vc2VySWQpOiBQcm9taXNlPFVzZXJEYXRhPiB7XG4gIHJldHVybiBheGlvcy5nZXQ8VXNlckRhdGE+KGBodHRwczovLyR7Q09PUkRJTkFUT1JfSE9TVH0vdXNlcnMvJHt1c2VySWR9YCkudGhlbigocmVzKSA9PiByZXMuZGF0YSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyRGlzcGxheU5hbWUodXNlcjogVXNlckRhdGEpIHtcbiAgc3dpdGNoICh1c2VyLnR5cGUpIHtcbiAgICBjYXNlIFwiYW5vbnltb3VzXCI6XG4gICAgICByZXR1cm4gdXNlci5uYW1lO1xuICB9XG59XG4iLCJpbXBvcnQgeyBXcml0ZXIgYXMgX1dyaXRlciwgUmVhZGVyIGFzIF9SZWFkZXIgfSBmcm9tIFwiYmluLXNlcmRlXCI7XG5pbXBvcnQge1xuICBOT19ESUZGIGFzIF9OT19ESUZGLFxuICBEZWVwUGFydGlhbCBhcyBfRGVlcFBhcnRpYWwsXG4gIFJlc3BvbnNlIGFzIF9SZXNwb25zZSxcbiAgTWVzc2FnZSBhcyBfTWVzc2FnZSxcbiAgUmVzcG9uc2VNZXNzYWdlIGFzIF9SZXNwb25zZU1lc3NhZ2UsXG4gIEV2ZW50TWVzc2FnZSBhcyBfRXZlbnRNZXNzYWdlLFxufSBmcm9tIFwiLi9iYXNlXCI7XG5cbmV4cG9ydCB0eXBlIENhcmRzID0geyB0eXBlOiBcIkFiaWxpdHlDYXJkXCI7IHZhbDogQWJpbGl0eUNhcmQgfSB8IHsgdHlwZTogXCJUb3dlckRlZmVuc2VcIjsgdmFsOiBUb3dlckRlZmVuc2UgfSB8IHsgdHlwZTogXCJNb25zdGVyQ2FyZFwiOyB2YWw6IE1vbnN0ZXJDYXJkIH0gfCB7IHR5cGU6IFwiTG9jYXRpb25DYXJkXCI7IHZhbDogTG9jYXRpb25DYXJkIH07XG5leHBvcnQgZW51bSBDYXJkVHlwZSB7XG4gIFNwZWxsLFxuICBXZWFwb24sXG4gIEl0ZW0sXG4gIEZyaWVuZCxcbn1cbmV4cG9ydCBlbnVtIENhcmRzdGF0dXMge1xuICBGYWNlVXAsXG4gIEZhY2VEb3duLFxuICBGYWNlVXBEaXNhYmxlZCxcbn1cbmV4cG9ydCBlbnVtIFBsYXllclN0YXR1cyB7XG4gIFVuZGVmaW5lZCxcbiAgQ29ubmVjdGVkLFxuICBSb2xlU2VsZWN0aW9uLFxuICBSZWFkeVRvUGxheSxcbn1cbmV4cG9ydCBlbnVtIFJvbGVzIHtcbiAgQmFyYmFyaWFuLFxuICBXaXphcmQsXG4gIFBhbGFkaW4sXG4gIFJvZ3VlLFxufVxuZXhwb3J0IGVudW0gUm91bmRTdGF0ZSB7XG4gIElkbGUsXG4gIFRvd2VyRGVmZW5zZSxcbiAgTW9uc3RlckNhcmQsXG4gIFBsYXllclR1cm4sXG4gIEVuZCxcbn1cbmV4cG9ydCBlbnVtIEdhbWVTdGF0ZXMge1xuICBJZGxlLFxuICBQbGF5ZXJzSm9pbmluZyxcbiAgU2V0dXAsXG4gIFJlYWR5Rm9yUm91bmQsXG4gIEluUHJvZ3Jlc3MsXG4gIENvbXBsZXRlZCxcbn1cbmV4cG9ydCBlbnVtIERpZUZhY2VzIHtcbiAgR2FpbkhlYWx0aCxcbiAgTG9zZUhlYWx0aCxcbiAgR2FpbkhlYWx0aEFsbCxcbiAgR2FpbkF0dGFjayxcbiAgTG9zZUF0dGFjayxcbiAgR2FpbkFiaWxpdHksXG4gIExvc2VBYmlsaXR5LFxuICBEcmF3Q2FyZCxcbiAgRGlzY2FyZENhcmQsXG4gIEFkZExvY2F0aW9uLFxuICBSZW1vdmVMb2NhdGlvbixcbn1cbmV4cG9ydCBlbnVtIFN0YXR1c0VmZmVjdCB7XG4gIFN0dW5uZWQsXG4gIE5vSGVhbCxcbiAgTm9EcmF3LFxuICBEYW1hZ2VDYXAsXG4gIE1vbnN0ZXJEZWZlYXRQZXJrLFxuICBMb2NhdGlvbkN1cnNlZCxcbiAgTm9Mb2NhdGlvbixcbiAgUHVyY2hhc2VDdXJzZSxcbiAgRGlzY2FyZEN1cnNlLFxuICBJbW11bmVVbnRpbExhc3QsXG4gIE1vbnN0ZXJSYWxseSxcbn1cbmV4cG9ydCBlbnVtIENvbmRpdGlvbnMge1xuICBTdGFuZGFyZCxcbiAgSWZUb3BDYXJkT2ZEZWNrQWJpbGl0eVNjb3JlR1Q0LFxuICBJZlRvcENhcmRPZkRlY2tBYmlsaXR5U2NvcmVHVDEsXG4gIEZvckVhY2hDYXJkSW5IYW5kQWJpbGl0eVNjb3JlR1Q0LFxuICBGb3JFYWNoQ2FyZEluSGFuZEFiaWxpdHlTY29yZUdUMSxcbiAgSWZUb3BDYXJkU3BlbGwsXG4gIElmTW9uc3RlcktpbGxlZCxcbiAgSWZMb2NhdGlvbkFkZGVkLFxuICBDaG9vc2UyLFxuICBDaG9vc2UzLFxuICBBbGxDaG9vc2UsXG4gIElmUGxheWVyRGlzY2FyZHMsXG4gIEZvckVhY2hGcmllbmRJbkhhbmQsXG4gIEZvckVhY2hTcGVsbCxcbiAgRm9yRWFjaFdlYXBvbixcbiAgSWZOZXdNb25zdGVyQ2FyZG9yTmV3TW9uc3RlclJhbGx5UGxheWVkLFxuICBCbG9ja0NhcmREcmF3LFxuICBCbG9ja0hlYWxpbmcsXG4gIEFsbERyYXdPbmUsXG4gIENhbm5vdEFkZExvY2F0aW9uLFxuICBJZlB1cmNoYXNlZENhcmRHVDQsXG4gIERyYXdGcm9tRGlzY2FyZCxcbiAgQWxsRHJhd0Zyb21EaXNjYXJkLFxuICBJbW11bmVVbnRpbExhc3QsXG59XG5leHBvcnQgdHlwZSBFcnJvck1lc3NhZ2UgPSB7XG4gIHN0YXR1czogbnVtYmVyO1xuICBtZXNzYWdlOiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgVXNlclJlc3BvbnNlID0ge1xuICB1c2VyRGF0YTogYm9vbGVhbjtcbiAgY2FyZFBsYXllZDogQ2FyZHM7XG4gIHNlbGVjdGVkVXNlcnM6IFVzZXJJZFtdO1xuICBzZWxlY3RlZE1vbnN0ZXJzOiBNb25zdGVyQ2FyZFtdO1xufTtcbmV4cG9ydCBlbnVtIHRhcmdldFR5cGUge1xuICBBbGxIZXJvZXMsXG4gIEFjdGl2ZUhlcm8sXG4gIE90aGVySGVyb2VzLFxuICBBbnlIZXJvLFxuICBSYW5kb21IZXJvLFxufVxuZXhwb3J0IGVudW0gZWZmZWN0VHlwZSB7XG4gIFBhc3NpdmUsXG4gIEFjdGl2ZSxcbn1cbmV4cG9ydCB0eXBlIEVmZmVjdCA9IHtcbiAgdGFyZ2V0OiB0YXJnZXRUeXBlO1xuICBjYjogc3RyaW5nO1xuICB1c2VyUHJvbXB0OiBib29sZWFuO1xufTtcbmV4cG9ydCB0eXBlIE1vbnN0ZXJDYXJkID0ge1xuICBUaXRsZTogc3RyaW5nO1xuICBIZWFsdGg6IG51bWJlcjtcbiAgRGFtYWdlOiBudW1iZXI7XG4gIExldmVsOiBudW1iZXI7XG4gIENhcmRTdGF0dXM6IENhcmRzdGF0dXM7XG4gIEFjdGl2ZUVmZmVjdD86IEVmZmVjdDtcbiAgUGFzc2l2ZUVmZmVjdD86IEVmZmVjdDtcbiAgUmV3YXJkczogRWZmZWN0O1xuICBTdGF0dXNFZmZlY3RzOiBTdGF0dXNFZmZlY3RbXTtcbn07XG5leHBvcnQgdHlwZSBBYmlsaXR5Q2FyZCA9IHtcbiAgVGl0bGU6IHN0cmluZztcbiAgQ2F0YWdvcnk6IHN0cmluZztcbiAgTGV2ZWw6IG51bWJlcjtcbiAgQ29zdDogbnVtYmVyO1xuICBBY3RpdmVFZmZlY3Q/OiBFZmZlY3Q7XG4gIFBhc3NpdmVFZmZlY3Q/OiBFZmZlY3Q7XG4gIENhcmRTdGF0dXM6IENhcmRzdGF0dXM7XG59O1xuZXhwb3J0IHR5cGUgVG93ZXJEZWZlbnNlID0ge1xuICBUaXRsZTogc3RyaW5nO1xuICBMZXZlbDogbnVtYmVyO1xuICBBY3RpdmVFZmZlY3Q/OiBFZmZlY3Q7XG4gIFBhc3NpdmVFZmZlY3Q/OiBFZmZlY3Q7XG4gIENhcmRTdGF0dXM6IENhcmRzdGF0dXM7XG59O1xuZXhwb3J0IHR5cGUgTG9jYXRpb25DYXJkID0ge1xuICBUaXRsZTogc3RyaW5nO1xuICBMZXZlbDogbnVtYmVyO1xuICBURDogbnVtYmVyO1xuICBTZXF1ZW5jZTogbnVtYmVyO1xuICBIZWFsdGg6IG51bWJlcjtcbiAgQWN0aXZlRGFtYWdlOiBudW1iZXI7XG4gIEFjdGl2ZUVmZmVjdD86IEVmZmVjdDtcbiAgUGFzc2l2ZUVmZmVjdD86IEVmZmVjdDtcbiAgQ2FyZFN0YXR1czogQ2FyZHN0YXR1cztcbn07XG5leHBvcnQgdHlwZSBQbGF5ZXJEZWNrcyA9IHtcbiAgRGVjazogQWJpbGl0eUNhcmRbXTtcbiAgRGlzY2FyZDogQWJpbGl0eUNhcmRbXTtcbn07XG5leHBvcnQgdHlwZSBVSUV2ZW50cyA9IHtcbiAgdHlwZTogc3RyaW5nO1xuICB2YWx1ZTogbnVtYmVyO1xufTtcbmV4cG9ydCB0eXBlIEV2ZW50cyA9IHtcbiAgdXNlcjogVXNlcklkO1xuICBlZmZlY3Q6IFVJRXZlbnRzO1xufTtcbmV4cG9ydCB0eXBlIFBsYXllciA9IHtcbiAgSWQ6IFVzZXJJZDtcbiAgU3RhdHVzRWZmZWN0czogU3RhdHVzRWZmZWN0W107XG4gIFBsYXllclN0YXRlOiBQbGF5ZXJTdGF0dXM7XG4gIEhlYWx0aDogbnVtYmVyO1xuICBBdHRhY2tQb2ludHM6IG51bWJlcjtcbiAgQWJpbGl0eVBvaW50czogbnVtYmVyO1xuICBIYW5kOiBBYmlsaXR5Q2FyZFtdO1xuICBSb2xlOiBSb2xlcztcbiAgTGV2ZWxCb251czogRWZmZWN0W107XG59O1xuZXhwb3J0IHR5cGUgR2FtZVN0YXRlID0ge1xuICBnYW1lTGV2ZWw6IG51bWJlcjtcbiAgZ2FtZUxvZzogc3RyaW5nW107XG4gIHJvdW5kU2VxdWVuY2U6IFJvdW5kU3RhdGU7XG4gIGdhbWVTZXF1ZW5jZTogR2FtZVN0YXRlcztcbiAgYWJpbGl0eVBpbGU6IEFiaWxpdHlDYXJkW107XG4gIGFjdGl2ZU1vbnN0ZXJzOiBNb25zdGVyQ2FyZFtdO1xuICBsb2NhdGlvblBpbGU/OiBMb2NhdGlvbkNhcmQ7XG4gIHRvd2VyRGVmZW5zZVBpbGU6IFRvd2VyRGVmZW5zZVtdO1xuICB0dXJuPzogVXNlcklkO1xuICBwbGF5ZXJzOiBQbGF5ZXJbXTtcbn07XG5leHBvcnQgdHlwZSBVc2VySWQgPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBJSm9pbkdhbWVSZXF1ZXN0ID0ge1xufTtcbmV4cG9ydCB0eXBlIElTZWxlY3RSb2xlUmVxdWVzdCA9IHtcbiAgcm9sZTogUm9sZXM7XG59O1xuZXhwb3J0IHR5cGUgSUFkZEFJUmVxdWVzdCA9IHtcbn07XG5leHBvcnQgdHlwZSBJU3RhcnRHYW1lUmVxdWVzdCA9IHtcbn07XG5leHBvcnQgdHlwZSBJU2VsZWN0VG93ZXJEZWZlbnNlUmVxdWVzdCA9IHtcbiAgY2FyZG5hbWU6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBJU2VsZWN0TW9uc3RlckNhcmRSZXF1ZXN0ID0ge1xuICBjYXJkbmFtZTogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIElTZWxlY3RQbGF5ZXJDYXJkUmVxdWVzdCA9IHtcbiAgY2FyZG5hbWU6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBJRGlzY2FyZFJlcXVlc3QgPSB7XG4gIGNhcmRuYW1lOiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgSURyYXdDYXJkUmVxdWVzdCA9IHtcbiAgY2FyZG5hbWU6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBJRW5kVHVyblJlcXVlc3QgPSB7XG59O1xuZXhwb3J0IHR5cGUgSVN0YXJ0VHVyblJlcXVlc3QgPSB7XG59O1xuZXhwb3J0IHR5cGUgSVVzZXJDaG9pY2VSZXF1ZXN0ID0ge1xuICBlZmZlY3Q6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBJQXBwbHlBdHRhY2tSZXF1ZXN0ID0ge1xuICBjYXJkbmFtZTogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIElCdXlBYmlsaXR5Q2FyZFJlcXVlc3QgPSB7XG4gIGNhcmRuYW1lOiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgSUluaXRpYWxpemVSZXF1ZXN0ID0ge1xufTtcblxuZXhwb3J0IGNvbnN0IENhcmRzID0ge1xuICBkZWZhdWx0KCk6IENhcmRzIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJBYmlsaXR5Q2FyZFwiLFxuICAgICAgdmFsOiBBYmlsaXR5Q2FyZC5kZWZhdWx0KCksXG4gICAgfTtcbiAgfSxcbiAgdmFsdWVzKCkge1xuICAgIHJldHVybiBbXCJBYmlsaXR5Q2FyZFwiLCBcIlRvd2VyRGVmZW5zZVwiLCBcIk1vbnN0ZXJDYXJkXCIsIFwiTG9jYXRpb25DYXJkXCJdO1xuICB9LFxuICBlbmNvZGUob2JqOiBDYXJkcywgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIGlmIChvYmoudHlwZSA9PT0gXCJBYmlsaXR5Q2FyZFwiKSB7XG4gICAgICB3cml0ZVVJbnQ4KGJ1ZiwgMCk7XG4gICAgICBjb25zdCB4ID0gb2JqLnZhbDtcbiAgICAgIEFiaWxpdHlDYXJkLmVuY29kZSh4LCBidWYpO1xuICAgIH1cbiAgICBlbHNlIGlmIChvYmoudHlwZSA9PT0gXCJUb3dlckRlZmVuc2VcIikge1xuICAgICAgd3JpdGVVSW50OChidWYsIDEpO1xuICAgICAgY29uc3QgeCA9IG9iai52YWw7XG4gICAgICBUb3dlckRlZmVuc2UuZW5jb2RlKHgsIGJ1Zik7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9iai50eXBlID09PSBcIk1vbnN0ZXJDYXJkXCIpIHtcbiAgICAgIHdyaXRlVUludDgoYnVmLCAyKTtcbiAgICAgIGNvbnN0IHggPSBvYmoudmFsO1xuICAgICAgTW9uc3RlckNhcmQuZW5jb2RlKHgsIGJ1Zik7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9iai50eXBlID09PSBcIkxvY2F0aW9uQ2FyZFwiKSB7XG4gICAgICB3cml0ZVVJbnQ4KGJ1ZiwgMyk7XG4gICAgICBjb25zdCB4ID0gb2JqLnZhbDtcbiAgICAgIExvY2F0aW9uQ2FyZC5lbmNvZGUoeCwgYnVmKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZW5jb2RlRGlmZihvYmo6IF9EZWVwUGFydGlhbDxDYXJkcz4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBpZiAob2JqLnR5cGUgPT09IFwiQWJpbGl0eUNhcmRcIikge1xuICAgICAgd3JpdGVVSW50OChidWYsIDApO1xuICAgICAgd3JpdGVCb29sZWFuKGJ1Ziwgb2JqLnZhbCAhPT0gX05PX0RJRkYpO1xuICAgICAgaWYgKG9iai52YWwgIT09IF9OT19ESUZGKSB7XG4gICAgICAgIGNvbnN0IHggPSBvYmoudmFsO1xuICAgICAgICBBYmlsaXR5Q2FyZC5lbmNvZGVEaWZmKHgsIGJ1Zik7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG9iai50eXBlID09PSBcIlRvd2VyRGVmZW5zZVwiKSB7XG4gICAgICB3cml0ZVVJbnQ4KGJ1ZiwgMSk7XG4gICAgICB3cml0ZUJvb2xlYW4oYnVmLCBvYmoudmFsICE9PSBfTk9fRElGRik7XG4gICAgICBpZiAob2JqLnZhbCAhPT0gX05PX0RJRkYpIHtcbiAgICAgICAgY29uc3QgeCA9IG9iai52YWw7XG4gICAgICAgIFRvd2VyRGVmZW5zZS5lbmNvZGVEaWZmKHgsIGJ1Zik7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG9iai50eXBlID09PSBcIk1vbnN0ZXJDYXJkXCIpIHtcbiAgICAgIHdyaXRlVUludDgoYnVmLCAyKTtcbiAgICAgIHdyaXRlQm9vbGVhbihidWYsIG9iai52YWwgIT09IF9OT19ESUZGKTtcbiAgICAgIGlmIChvYmoudmFsICE9PSBfTk9fRElGRikge1xuICAgICAgICBjb25zdCB4ID0gb2JqLnZhbDtcbiAgICAgICAgTW9uc3RlckNhcmQuZW5jb2RlRGlmZih4LCBidWYpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChvYmoudHlwZSA9PT0gXCJMb2NhdGlvbkNhcmRcIikge1xuICAgICAgd3JpdGVVSW50OChidWYsIDMpO1xuICAgICAgd3JpdGVCb29sZWFuKGJ1Ziwgb2JqLnZhbCAhPT0gX05PX0RJRkYpO1xuICAgICAgaWYgKG9iai52YWwgIT09IF9OT19ESUZGKSB7XG4gICAgICAgIGNvbnN0IHggPSBvYmoudmFsO1xuICAgICAgICBMb2NhdGlvbkNhcmQuZW5jb2RlRGlmZih4LCBidWYpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogQ2FyZHMge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIGNvbnN0IHR5cGUgPSBwYXJzZVVJbnQ4KHNiKTtcbiAgICBpZiAodHlwZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJBYmlsaXR5Q2FyZFwiLCB2YWw6IEFiaWxpdHlDYXJkLmRlY29kZShzYikgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJUb3dlckRlZmVuc2VcIiwgdmFsOiBUb3dlckRlZmVuc2UuZGVjb2RlKHNiKSB9O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIk1vbnN0ZXJDYXJkXCIsIHZhbDogTW9uc3RlckNhcmQuZGVjb2RlKHNiKSB9O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAzKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIkxvY2F0aW9uQ2FyZFwiLCB2YWw6IExvY2F0aW9uQ2FyZC5kZWNvZGUoc2IpIH07XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdW5pb25cIik7XG4gIH0sXG4gIGRlY29kZURpZmYoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogX0RlZXBQYXJ0aWFsPENhcmRzPiB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgY29uc3QgdHlwZSA9IHBhcnNlVUludDgoc2IpO1xuICAgIGlmICh0eXBlID09PSAwKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIkFiaWxpdHlDYXJkXCIsIHZhbDogcGFyc2VCb29sZWFuKHNiKSA/IEFiaWxpdHlDYXJkLmRlY29kZURpZmYoc2IpIDogX05PX0RJRkYgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJUb3dlckRlZmVuc2VcIiwgdmFsOiBwYXJzZUJvb2xlYW4oc2IpID8gVG93ZXJEZWZlbnNlLmRlY29kZURpZmYoc2IpIDogX05PX0RJRkYgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gMikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJNb25zdGVyQ2FyZFwiLCB2YWw6IHBhcnNlQm9vbGVhbihzYikgPyBNb25zdGVyQ2FyZC5kZWNvZGVEaWZmKHNiKSA6IF9OT19ESUZGIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09IDMpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiTG9jYXRpb25DYXJkXCIsIHZhbDogcGFyc2VCb29sZWFuKHNiKSA/IExvY2F0aW9uQ2FyZC5kZWNvZGVEaWZmKHNiKSA6IF9OT19ESUZGIH07XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdW5pb25cIik7XG4gIH0sXG59XG5leHBvcnQgY29uc3QgRXJyb3JNZXNzYWdlID0ge1xuICBkZWZhdWx0KCk6IEVycm9yTWVzc2FnZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1czogMCxcbiAgICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgfTtcbiAgfSxcbiAgZW5jb2RlKG9iajogRXJyb3JNZXNzYWdlLCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgd3JpdGVJbnQoYnVmLCBvYmouc3RhdHVzKTtcbiAgICB3cml0ZVN0cmluZyhidWYsIG9iai5tZXNzYWdlKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBlbmNvZGVEaWZmKG9iajogX0RlZXBQYXJ0aWFsPEVycm9yTWVzc2FnZT4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBjb25zdCB0cmFja2VyOiBib29sZWFuW10gPSBbXTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnN0YXR1cyAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmoubWVzc2FnZSAhPT0gX05PX0RJRkYpO1xuICAgIGJ1Zi53cml0ZUJpdHModHJhY2tlcik7XG4gICAgaWYgKG9iai5zdGF0dXMgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUludChidWYsIG9iai5zdGF0dXMpO1xuICAgIH1cbiAgICBpZiAob2JqLm1lc3NhZ2UgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZVN0cmluZyhidWYsIG9iai5tZXNzYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IEVycm9yTWVzc2FnZSB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1czogcGFyc2VJbnQoc2IpLFxuICAgICAgbWVzc2FnZTogcGFyc2VTdHJpbmcoc2IpLFxuICAgIH07XG4gIH0sXG4gIGRlY29kZURpZmYoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogX0RlZXBQYXJ0aWFsPEVycm9yTWVzc2FnZT4ge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIGNvbnN0IHRyYWNrZXIgPSBzYi5yZWFkQml0cygyKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUludChzYikgOiBfTk9fRElGRixcbiAgICAgIG1lc3NhZ2U6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlU3RyaW5nKHNiKSA6IF9OT19ESUZGLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IFVzZXJSZXNwb25zZSA9IHtcbiAgZGVmYXVsdCgpOiBVc2VyUmVzcG9uc2Uge1xuICAgIHJldHVybiB7XG4gICAgICB1c2VyRGF0YTogZmFsc2UsXG4gICAgICBjYXJkUGxheWVkOiBDYXJkcy5kZWZhdWx0KCksXG4gICAgICBzZWxlY3RlZFVzZXJzOiBbXSxcbiAgICAgIHNlbGVjdGVkTW9uc3RlcnM6IFtdLFxuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IFVzZXJSZXNwb25zZSwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlQm9vbGVhbihidWYsIG9iai51c2VyRGF0YSk7XG4gICAgQ2FyZHMuZW5jb2RlKG9iai5jYXJkUGxheWVkLCBidWYpO1xuICAgIHdyaXRlQXJyYXkoYnVmLCBvYmouc2VsZWN0ZWRVc2VycywgKHgpID0+IHdyaXRlU3RyaW5nKGJ1ZiwgeCkpO1xuICAgIHdyaXRlQXJyYXkoYnVmLCBvYmouc2VsZWN0ZWRNb25zdGVycywgKHgpID0+IE1vbnN0ZXJDYXJkLmVuY29kZSh4LCBidWYpKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBlbmNvZGVEaWZmKG9iajogX0RlZXBQYXJ0aWFsPFVzZXJSZXNwb25zZT4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBjb25zdCB0cmFja2VyOiBib29sZWFuW10gPSBbXTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnVzZXJEYXRhICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5jYXJkUGxheWVkICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5zZWxlY3RlZFVzZXJzICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5zZWxlY3RlZE1vbnN0ZXJzICE9PSBfTk9fRElGRik7XG4gICAgYnVmLndyaXRlQml0cyh0cmFja2VyKTtcbiAgICBpZiAob2JqLnVzZXJEYXRhICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVCb29sZWFuKGJ1Ziwgb2JqLnVzZXJEYXRhKTtcbiAgICB9XG4gICAgaWYgKG9iai5jYXJkUGxheWVkICE9PSBfTk9fRElGRikge1xuICAgICAgQ2FyZHMuZW5jb2RlRGlmZihvYmouY2FyZFBsYXllZCwgYnVmKTtcbiAgICB9XG4gICAgaWYgKG9iai5zZWxlY3RlZFVzZXJzICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVBcnJheURpZmYoYnVmLCBvYmouc2VsZWN0ZWRVc2VycywgKHgpID0+IHdyaXRlU3RyaW5nKGJ1ZiwgeCkpO1xuICAgIH1cbiAgICBpZiAob2JqLnNlbGVjdGVkTW9uc3RlcnMgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUFycmF5RGlmZihidWYsIG9iai5zZWxlY3RlZE1vbnN0ZXJzLCAoeCkgPT4gTW9uc3RlckNhcmQuZW5jb2RlRGlmZih4LCBidWYpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IFVzZXJSZXNwb25zZSB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVzZXJEYXRhOiBwYXJzZUJvb2xlYW4oc2IpLFxuICAgICAgY2FyZFBsYXllZDogQ2FyZHMuZGVjb2RlKHNiKSxcbiAgICAgIHNlbGVjdGVkVXNlcnM6IHBhcnNlQXJyYXkoc2IsICgpID0+IHBhcnNlU3RyaW5nKHNiKSksXG4gICAgICBzZWxlY3RlZE1vbnN0ZXJzOiBwYXJzZUFycmF5KHNiLCAoKSA9PiBNb25zdGVyQ2FyZC5kZWNvZGUoc2IpKSxcbiAgICB9O1xuICB9LFxuICBkZWNvZGVEaWZmKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IF9EZWVwUGFydGlhbDxVc2VyUmVzcG9uc2U+IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICBjb25zdCB0cmFja2VyID0gc2IucmVhZEJpdHMoNCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVzZXJEYXRhOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUJvb2xlYW4oc2IpIDogX05PX0RJRkYsXG4gICAgICBjYXJkUGxheWVkOiB0cmFja2VyLnNoaWZ0KCkgPyBDYXJkcy5kZWNvZGVEaWZmKHNiKSA6IF9OT19ESUZGLFxuICAgICAgc2VsZWN0ZWRVc2VyczogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VBcnJheURpZmYoc2IsICgpID0+IHBhcnNlU3RyaW5nKHNiKSkgOiBfTk9fRElGRixcbiAgICAgIHNlbGVjdGVkTW9uc3RlcnM6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlQXJyYXlEaWZmKHNiLCAoKSA9PiBNb25zdGVyQ2FyZC5kZWNvZGVEaWZmKHNiKSkgOiBfTk9fRElGRixcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBFZmZlY3QgPSB7XG4gIGRlZmF1bHQoKTogRWZmZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFyZ2V0OiAwLFxuICAgICAgY2I6IFwiXCIsXG4gICAgICB1c2VyUHJvbXB0OiBmYWxzZSxcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBFZmZlY3QsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICB3cml0ZVVJbnQ4KGJ1Ziwgb2JqLnRhcmdldCk7XG4gICAgd3JpdGVTdHJpbmcoYnVmLCBvYmouY2IpO1xuICAgIHdyaXRlQm9vbGVhbihidWYsIG9iai51c2VyUHJvbXB0KTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBlbmNvZGVEaWZmKG9iajogX0RlZXBQYXJ0aWFsPEVmZmVjdD4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBjb25zdCB0cmFja2VyOiBib29sZWFuW10gPSBbXTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnRhcmdldCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouY2IgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnVzZXJQcm9tcHQgIT09IF9OT19ESUZGKTtcbiAgICBidWYud3JpdGVCaXRzKHRyYWNrZXIpO1xuICAgIGlmIChvYmoudGFyZ2V0ICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVVSW50OChidWYsIG9iai50YXJnZXQpO1xuICAgIH1cbiAgICBpZiAob2JqLmNiICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVTdHJpbmcoYnVmLCBvYmouY2IpO1xuICAgIH1cbiAgICBpZiAob2JqLnVzZXJQcm9tcHQgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUJvb2xlYW4oYnVmLCBvYmoudXNlclByb21wdCk7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBFZmZlY3Qge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICB0YXJnZXQ6IHBhcnNlVUludDgoc2IpLFxuICAgICAgY2I6IHBhcnNlU3RyaW5nKHNiKSxcbiAgICAgIHVzZXJQcm9tcHQ6IHBhcnNlQm9vbGVhbihzYiksXG4gICAgfTtcbiAgfSxcbiAgZGVjb2RlRGlmZihidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBfRGVlcFBhcnRpYWw8RWZmZWN0PiB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgY29uc3QgdHJhY2tlciA9IHNiLnJlYWRCaXRzKDMpO1xuICAgIHJldHVybiB7XG4gICAgICB0YXJnZXQ6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlVUludDgoc2IpIDogX05PX0RJRkYsXG4gICAgICBjYjogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VTdHJpbmcoc2IpIDogX05PX0RJRkYsXG4gICAgICB1c2VyUHJvbXB0OiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUJvb2xlYW4oc2IpIDogX05PX0RJRkYsXG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgTW9uc3RlckNhcmQgPSB7XG4gIGRlZmF1bHQoKTogTW9uc3RlckNhcmQge1xuICAgIHJldHVybiB7XG4gICAgICBUaXRsZTogXCJcIixcbiAgICAgIEhlYWx0aDogMCxcbiAgICAgIERhbWFnZTogMCxcbiAgICAgIExldmVsOiAwLFxuICAgICAgQ2FyZFN0YXR1czogMCxcbiAgICAgIEFjdGl2ZUVmZmVjdDogdW5kZWZpbmVkLFxuICAgICAgUGFzc2l2ZUVmZmVjdDogdW5kZWZpbmVkLFxuICAgICAgUmV3YXJkczogRWZmZWN0LmRlZmF1bHQoKSxcbiAgICAgIFN0YXR1c0VmZmVjdHM6IFtdLFxuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IE1vbnN0ZXJDYXJkLCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgd3JpdGVTdHJpbmcoYnVmLCBvYmouVGl0bGUpO1xuICAgIHdyaXRlSW50KGJ1Ziwgb2JqLkhlYWx0aCk7XG4gICAgd3JpdGVJbnQoYnVmLCBvYmouRGFtYWdlKTtcbiAgICB3cml0ZUludChidWYsIG9iai5MZXZlbCk7XG4gICAgd3JpdGVVSW50OChidWYsIG9iai5DYXJkU3RhdHVzKTtcbiAgICB3cml0ZU9wdGlvbmFsKGJ1Ziwgb2JqLkFjdGl2ZUVmZmVjdCwgKHgpID0+IEVmZmVjdC5lbmNvZGUoeCwgYnVmKSk7XG4gICAgd3JpdGVPcHRpb25hbChidWYsIG9iai5QYXNzaXZlRWZmZWN0LCAoeCkgPT4gRWZmZWN0LmVuY29kZSh4LCBidWYpKTtcbiAgICBFZmZlY3QuZW5jb2RlKG9iai5SZXdhcmRzLCBidWYpO1xuICAgIHdyaXRlQXJyYXkoYnVmLCBvYmouU3RhdHVzRWZmZWN0cywgKHgpID0+IHdyaXRlVUludDgoYnVmLCB4KSk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZW5jb2RlRGlmZihvYmo6IF9EZWVwUGFydGlhbDxNb25zdGVyQ2FyZD4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBjb25zdCB0cmFja2VyOiBib29sZWFuW10gPSBbXTtcbiAgICB0cmFja2VyLnB1c2gob2JqLlRpdGxlICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5IZWFsdGggIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLkRhbWFnZSAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouTGV2ZWwgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLkNhcmRTdGF0dXMgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLkFjdGl2ZUVmZmVjdCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouUGFzc2l2ZUVmZmVjdCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouUmV3YXJkcyAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouU3RhdHVzRWZmZWN0cyAhPT0gX05PX0RJRkYpO1xuICAgIGJ1Zi53cml0ZUJpdHModHJhY2tlcik7XG4gICAgaWYgKG9iai5UaXRsZSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLlRpdGxlKTtcbiAgICB9XG4gICAgaWYgKG9iai5IZWFsdGggIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUludChidWYsIG9iai5IZWFsdGgpO1xuICAgIH1cbiAgICBpZiAob2JqLkRhbWFnZSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLkRhbWFnZSk7XG4gICAgfVxuICAgIGlmIChvYmouTGV2ZWwgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUludChidWYsIG9iai5MZXZlbCk7XG4gICAgfVxuICAgIGlmIChvYmouQ2FyZFN0YXR1cyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlVUludDgoYnVmLCBvYmouQ2FyZFN0YXR1cyk7XG4gICAgfVxuICAgIGlmIChvYmouQWN0aXZlRWZmZWN0ICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVPcHRpb25hbChidWYsIG9iai5BY3RpdmVFZmZlY3QsICh4KSA9PiBFZmZlY3QuZW5jb2RlRGlmZih4LCBidWYpKTtcbiAgICB9XG4gICAgaWYgKG9iai5QYXNzaXZlRWZmZWN0ICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVPcHRpb25hbChidWYsIG9iai5QYXNzaXZlRWZmZWN0LCAoeCkgPT4gRWZmZWN0LmVuY29kZURpZmYoeCwgYnVmKSk7XG4gICAgfVxuICAgIGlmIChvYmouUmV3YXJkcyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIEVmZmVjdC5lbmNvZGVEaWZmKG9iai5SZXdhcmRzLCBidWYpO1xuICAgIH1cbiAgICBpZiAob2JqLlN0YXR1c0VmZmVjdHMgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUFycmF5RGlmZihidWYsIG9iai5TdGF0dXNFZmZlY3RzLCAoeCkgPT4gd3JpdGVVSW50OChidWYsIHgpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IE1vbnN0ZXJDYXJkIHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgVGl0bGU6IHBhcnNlU3RyaW5nKHNiKSxcbiAgICAgIEhlYWx0aDogcGFyc2VJbnQoc2IpLFxuICAgICAgRGFtYWdlOiBwYXJzZUludChzYiksXG4gICAgICBMZXZlbDogcGFyc2VJbnQoc2IpLFxuICAgICAgQ2FyZFN0YXR1czogcGFyc2VVSW50OChzYiksXG4gICAgICBBY3RpdmVFZmZlY3Q6IHBhcnNlT3B0aW9uYWwoc2IsICgpID0+IEVmZmVjdC5kZWNvZGUoc2IpKSxcbiAgICAgIFBhc3NpdmVFZmZlY3Q6IHBhcnNlT3B0aW9uYWwoc2IsICgpID0+IEVmZmVjdC5kZWNvZGUoc2IpKSxcbiAgICAgIFJld2FyZHM6IEVmZmVjdC5kZWNvZGUoc2IpLFxuICAgICAgU3RhdHVzRWZmZWN0czogcGFyc2VBcnJheShzYiwgKCkgPT4gcGFyc2VVSW50OChzYikpLFxuICAgIH07XG4gIH0sXG4gIGRlY29kZURpZmYoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogX0RlZXBQYXJ0aWFsPE1vbnN0ZXJDYXJkPiB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgY29uc3QgdHJhY2tlciA9IHNiLnJlYWRCaXRzKDkpO1xuICAgIHJldHVybiB7XG4gICAgICBUaXRsZTogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VTdHJpbmcoc2IpIDogX05PX0RJRkYsXG4gICAgICBIZWFsdGg6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlSW50KHNiKSA6IF9OT19ESUZGLFxuICAgICAgRGFtYWdlOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUludChzYikgOiBfTk9fRElGRixcbiAgICAgIExldmVsOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUludChzYikgOiBfTk9fRElGRixcbiAgICAgIENhcmRTdGF0dXM6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlVUludDgoc2IpIDogX05PX0RJRkYsXG4gICAgICBBY3RpdmVFZmZlY3Q6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlT3B0aW9uYWwoc2IsICgpID0+IEVmZmVjdC5kZWNvZGVEaWZmKHNiKSkgOiBfTk9fRElGRixcbiAgICAgIFBhc3NpdmVFZmZlY3Q6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlT3B0aW9uYWwoc2IsICgpID0+IEVmZmVjdC5kZWNvZGVEaWZmKHNiKSkgOiBfTk9fRElGRixcbiAgICAgIFJld2FyZHM6IHRyYWNrZXIuc2hpZnQoKSA/IEVmZmVjdC5kZWNvZGVEaWZmKHNiKSA6IF9OT19ESUZGLFxuICAgICAgU3RhdHVzRWZmZWN0czogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VBcnJheURpZmYoc2IsICgpID0+IHBhcnNlVUludDgoc2IpKSA6IF9OT19ESUZGLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IEFiaWxpdHlDYXJkID0ge1xuICBkZWZhdWx0KCk6IEFiaWxpdHlDYXJkIHtcbiAgICByZXR1cm4ge1xuICAgICAgVGl0bGU6IFwiXCIsXG4gICAgICBDYXRhZ29yeTogXCJcIixcbiAgICAgIExldmVsOiAwLFxuICAgICAgQ29zdDogMCxcbiAgICAgIEFjdGl2ZUVmZmVjdDogdW5kZWZpbmVkLFxuICAgICAgUGFzc2l2ZUVmZmVjdDogdW5kZWZpbmVkLFxuICAgICAgQ2FyZFN0YXR1czogMCxcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBBYmlsaXR5Q2FyZCwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLlRpdGxlKTtcbiAgICB3cml0ZVN0cmluZyhidWYsIG9iai5DYXRhZ29yeSk7XG4gICAgd3JpdGVJbnQoYnVmLCBvYmouTGV2ZWwpO1xuICAgIHdyaXRlSW50KGJ1Ziwgb2JqLkNvc3QpO1xuICAgIHdyaXRlT3B0aW9uYWwoYnVmLCBvYmouQWN0aXZlRWZmZWN0LCAoeCkgPT4gRWZmZWN0LmVuY29kZSh4LCBidWYpKTtcbiAgICB3cml0ZU9wdGlvbmFsKGJ1Ziwgb2JqLlBhc3NpdmVFZmZlY3QsICh4KSA9PiBFZmZlY3QuZW5jb2RlKHgsIGJ1ZikpO1xuICAgIHdyaXRlVUludDgoYnVmLCBvYmouQ2FyZFN0YXR1cyk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZW5jb2RlRGlmZihvYmo6IF9EZWVwUGFydGlhbDxBYmlsaXR5Q2FyZD4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBjb25zdCB0cmFja2VyOiBib29sZWFuW10gPSBbXTtcbiAgICB0cmFja2VyLnB1c2gob2JqLlRpdGxlICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5DYXRhZ29yeSAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouTGV2ZWwgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLkNvc3QgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLkFjdGl2ZUVmZmVjdCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouUGFzc2l2ZUVmZmVjdCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouQ2FyZFN0YXR1cyAhPT0gX05PX0RJRkYpO1xuICAgIGJ1Zi53cml0ZUJpdHModHJhY2tlcik7XG4gICAgaWYgKG9iai5UaXRsZSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLlRpdGxlKTtcbiAgICB9XG4gICAgaWYgKG9iai5DYXRhZ29yeSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLkNhdGFnb3J5KTtcbiAgICB9XG4gICAgaWYgKG9iai5MZXZlbCAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLkxldmVsKTtcbiAgICB9XG4gICAgaWYgKG9iai5Db3N0ICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVJbnQoYnVmLCBvYmouQ29zdCk7XG4gICAgfVxuICAgIGlmIChvYmouQWN0aXZlRWZmZWN0ICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVPcHRpb25hbChidWYsIG9iai5BY3RpdmVFZmZlY3QsICh4KSA9PiBFZmZlY3QuZW5jb2RlRGlmZih4LCBidWYpKTtcbiAgICB9XG4gICAgaWYgKG9iai5QYXNzaXZlRWZmZWN0ICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVPcHRpb25hbChidWYsIG9iai5QYXNzaXZlRWZmZWN0LCAoeCkgPT4gRWZmZWN0LmVuY29kZURpZmYoeCwgYnVmKSk7XG4gICAgfVxuICAgIGlmIChvYmouQ2FyZFN0YXR1cyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlVUludDgoYnVmLCBvYmouQ2FyZFN0YXR1cyk7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBBYmlsaXR5Q2FyZCB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIFRpdGxlOiBwYXJzZVN0cmluZyhzYiksXG4gICAgICBDYXRhZ29yeTogcGFyc2VTdHJpbmcoc2IpLFxuICAgICAgTGV2ZWw6IHBhcnNlSW50KHNiKSxcbiAgICAgIENvc3Q6IHBhcnNlSW50KHNiKSxcbiAgICAgIEFjdGl2ZUVmZmVjdDogcGFyc2VPcHRpb25hbChzYiwgKCkgPT4gRWZmZWN0LmRlY29kZShzYikpLFxuICAgICAgUGFzc2l2ZUVmZmVjdDogcGFyc2VPcHRpb25hbChzYiwgKCkgPT4gRWZmZWN0LmRlY29kZShzYikpLFxuICAgICAgQ2FyZFN0YXR1czogcGFyc2VVSW50OChzYiksXG4gICAgfTtcbiAgfSxcbiAgZGVjb2RlRGlmZihidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBfRGVlcFBhcnRpYWw8QWJpbGl0eUNhcmQ+IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICBjb25zdCB0cmFja2VyID0gc2IucmVhZEJpdHMoNyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIFRpdGxlOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZVN0cmluZyhzYikgOiBfTk9fRElGRixcbiAgICAgIENhdGFnb3J5OiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZVN0cmluZyhzYikgOiBfTk9fRElGRixcbiAgICAgIExldmVsOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUludChzYikgOiBfTk9fRElGRixcbiAgICAgIENvc3Q6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlSW50KHNiKSA6IF9OT19ESUZGLFxuICAgICAgQWN0aXZlRWZmZWN0OiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZU9wdGlvbmFsKHNiLCAoKSA9PiBFZmZlY3QuZGVjb2RlRGlmZihzYikpIDogX05PX0RJRkYsXG4gICAgICBQYXNzaXZlRWZmZWN0OiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZU9wdGlvbmFsKHNiLCAoKSA9PiBFZmZlY3QuZGVjb2RlRGlmZihzYikpIDogX05PX0RJRkYsXG4gICAgICBDYXJkU3RhdHVzOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZVVJbnQ4KHNiKSA6IF9OT19ESUZGLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IFRvd2VyRGVmZW5zZSA9IHtcbiAgZGVmYXVsdCgpOiBUb3dlckRlZmVuc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBUaXRsZTogXCJcIixcbiAgICAgIExldmVsOiAwLFxuICAgICAgQWN0aXZlRWZmZWN0OiB1bmRlZmluZWQsXG4gICAgICBQYXNzaXZlRWZmZWN0OiB1bmRlZmluZWQsXG4gICAgICBDYXJkU3RhdHVzOiAwLFxuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IFRvd2VyRGVmZW5zZSwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLlRpdGxlKTtcbiAgICB3cml0ZUludChidWYsIG9iai5MZXZlbCk7XG4gICAgd3JpdGVPcHRpb25hbChidWYsIG9iai5BY3RpdmVFZmZlY3QsICh4KSA9PiBFZmZlY3QuZW5jb2RlKHgsIGJ1ZikpO1xuICAgIHdyaXRlT3B0aW9uYWwoYnVmLCBvYmouUGFzc2l2ZUVmZmVjdCwgKHgpID0+IEVmZmVjdC5lbmNvZGUoeCwgYnVmKSk7XG4gICAgd3JpdGVVSW50OChidWYsIG9iai5DYXJkU3RhdHVzKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBlbmNvZGVEaWZmKG9iajogX0RlZXBQYXJ0aWFsPFRvd2VyRGVmZW5zZT4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBjb25zdCB0cmFja2VyOiBib29sZWFuW10gPSBbXTtcbiAgICB0cmFja2VyLnB1c2gob2JqLlRpdGxlICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5MZXZlbCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouQWN0aXZlRWZmZWN0ICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5QYXNzaXZlRWZmZWN0ICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5DYXJkU3RhdHVzICE9PSBfTk9fRElGRik7XG4gICAgYnVmLndyaXRlQml0cyh0cmFja2VyKTtcbiAgICBpZiAob2JqLlRpdGxlICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVTdHJpbmcoYnVmLCBvYmouVGl0bGUpO1xuICAgIH1cbiAgICBpZiAob2JqLkxldmVsICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVJbnQoYnVmLCBvYmouTGV2ZWwpO1xuICAgIH1cbiAgICBpZiAob2JqLkFjdGl2ZUVmZmVjdCAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlT3B0aW9uYWwoYnVmLCBvYmouQWN0aXZlRWZmZWN0LCAoeCkgPT4gRWZmZWN0LmVuY29kZURpZmYoeCwgYnVmKSk7XG4gICAgfVxuICAgIGlmIChvYmouUGFzc2l2ZUVmZmVjdCAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlT3B0aW9uYWwoYnVmLCBvYmouUGFzc2l2ZUVmZmVjdCwgKHgpID0+IEVmZmVjdC5lbmNvZGVEaWZmKHgsIGJ1ZikpO1xuICAgIH1cbiAgICBpZiAob2JqLkNhcmRTdGF0dXMgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZVVJbnQ4KGJ1Ziwgb2JqLkNhcmRTdGF0dXMpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogVG93ZXJEZWZlbnNlIHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgVGl0bGU6IHBhcnNlU3RyaW5nKHNiKSxcbiAgICAgIExldmVsOiBwYXJzZUludChzYiksXG4gICAgICBBY3RpdmVFZmZlY3Q6IHBhcnNlT3B0aW9uYWwoc2IsICgpID0+IEVmZmVjdC5kZWNvZGUoc2IpKSxcbiAgICAgIFBhc3NpdmVFZmZlY3Q6IHBhcnNlT3B0aW9uYWwoc2IsICgpID0+IEVmZmVjdC5kZWNvZGUoc2IpKSxcbiAgICAgIENhcmRTdGF0dXM6IHBhcnNlVUludDgoc2IpLFxuICAgIH07XG4gIH0sXG4gIGRlY29kZURpZmYoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogX0RlZXBQYXJ0aWFsPFRvd2VyRGVmZW5zZT4ge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIGNvbnN0IHRyYWNrZXIgPSBzYi5yZWFkQml0cyg1KTtcbiAgICByZXR1cm4ge1xuICAgICAgVGl0bGU6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlU3RyaW5nKHNiKSA6IF9OT19ESUZGLFxuICAgICAgTGV2ZWw6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlSW50KHNiKSA6IF9OT19ESUZGLFxuICAgICAgQWN0aXZlRWZmZWN0OiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZU9wdGlvbmFsKHNiLCAoKSA9PiBFZmZlY3QuZGVjb2RlRGlmZihzYikpIDogX05PX0RJRkYsXG4gICAgICBQYXNzaXZlRWZmZWN0OiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZU9wdGlvbmFsKHNiLCAoKSA9PiBFZmZlY3QuZGVjb2RlRGlmZihzYikpIDogX05PX0RJRkYsXG4gICAgICBDYXJkU3RhdHVzOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZVVJbnQ4KHNiKSA6IF9OT19ESUZGLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IExvY2F0aW9uQ2FyZCA9IHtcbiAgZGVmYXVsdCgpOiBMb2NhdGlvbkNhcmQge1xuICAgIHJldHVybiB7XG4gICAgICBUaXRsZTogXCJcIixcbiAgICAgIExldmVsOiAwLFxuICAgICAgVEQ6IDAsXG4gICAgICBTZXF1ZW5jZTogMCxcbiAgICAgIEhlYWx0aDogMCxcbiAgICAgIEFjdGl2ZURhbWFnZTogMCxcbiAgICAgIEFjdGl2ZUVmZmVjdDogdW5kZWZpbmVkLFxuICAgICAgUGFzc2l2ZUVmZmVjdDogdW5kZWZpbmVkLFxuICAgICAgQ2FyZFN0YXR1czogMCxcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBMb2NhdGlvbkNhcmQsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICB3cml0ZVN0cmluZyhidWYsIG9iai5UaXRsZSk7XG4gICAgd3JpdGVJbnQoYnVmLCBvYmouTGV2ZWwpO1xuICAgIHdyaXRlSW50KGJ1Ziwgb2JqLlREKTtcbiAgICB3cml0ZUludChidWYsIG9iai5TZXF1ZW5jZSk7XG4gICAgd3JpdGVJbnQoYnVmLCBvYmouSGVhbHRoKTtcbiAgICB3cml0ZUludChidWYsIG9iai5BY3RpdmVEYW1hZ2UpO1xuICAgIHdyaXRlT3B0aW9uYWwoYnVmLCBvYmouQWN0aXZlRWZmZWN0LCAoeCkgPT4gRWZmZWN0LmVuY29kZSh4LCBidWYpKTtcbiAgICB3cml0ZU9wdGlvbmFsKGJ1Ziwgb2JqLlBhc3NpdmVFZmZlY3QsICh4KSA9PiBFZmZlY3QuZW5jb2RlKHgsIGJ1ZikpO1xuICAgIHdyaXRlVUludDgoYnVmLCBvYmouQ2FyZFN0YXR1cyk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZW5jb2RlRGlmZihvYmo6IF9EZWVwUGFydGlhbDxMb2NhdGlvbkNhcmQ+LCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgY29uc3QgdHJhY2tlcjogYm9vbGVhbltdID0gW107XG4gICAgdHJhY2tlci5wdXNoKG9iai5UaXRsZSAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouTGV2ZWwgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLlREICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5TZXF1ZW5jZSAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouSGVhbHRoICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5BY3RpdmVEYW1hZ2UgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLkFjdGl2ZUVmZmVjdCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouUGFzc2l2ZUVmZmVjdCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouQ2FyZFN0YXR1cyAhPT0gX05PX0RJRkYpO1xuICAgIGJ1Zi53cml0ZUJpdHModHJhY2tlcik7XG4gICAgaWYgKG9iai5UaXRsZSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLlRpdGxlKTtcbiAgICB9XG4gICAgaWYgKG9iai5MZXZlbCAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLkxldmVsKTtcbiAgICB9XG4gICAgaWYgKG9iai5URCAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLlREKTtcbiAgICB9XG4gICAgaWYgKG9iai5TZXF1ZW5jZSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLlNlcXVlbmNlKTtcbiAgICB9XG4gICAgaWYgKG9iai5IZWFsdGggIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUludChidWYsIG9iai5IZWFsdGgpO1xuICAgIH1cbiAgICBpZiAob2JqLkFjdGl2ZURhbWFnZSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLkFjdGl2ZURhbWFnZSk7XG4gICAgfVxuICAgIGlmIChvYmouQWN0aXZlRWZmZWN0ICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVPcHRpb25hbChidWYsIG9iai5BY3RpdmVFZmZlY3QsICh4KSA9PiBFZmZlY3QuZW5jb2RlRGlmZih4LCBidWYpKTtcbiAgICB9XG4gICAgaWYgKG9iai5QYXNzaXZlRWZmZWN0ICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVPcHRpb25hbChidWYsIG9iai5QYXNzaXZlRWZmZWN0LCAoeCkgPT4gRWZmZWN0LmVuY29kZURpZmYoeCwgYnVmKSk7XG4gICAgfVxuICAgIGlmIChvYmouQ2FyZFN0YXR1cyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlVUludDgoYnVmLCBvYmouQ2FyZFN0YXR1cyk7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBMb2NhdGlvbkNhcmQge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICBUaXRsZTogcGFyc2VTdHJpbmcoc2IpLFxuICAgICAgTGV2ZWw6IHBhcnNlSW50KHNiKSxcbiAgICAgIFREOiBwYXJzZUludChzYiksXG4gICAgICBTZXF1ZW5jZTogcGFyc2VJbnQoc2IpLFxuICAgICAgSGVhbHRoOiBwYXJzZUludChzYiksXG4gICAgICBBY3RpdmVEYW1hZ2U6IHBhcnNlSW50KHNiKSxcbiAgICAgIEFjdGl2ZUVmZmVjdDogcGFyc2VPcHRpb25hbChzYiwgKCkgPT4gRWZmZWN0LmRlY29kZShzYikpLFxuICAgICAgUGFzc2l2ZUVmZmVjdDogcGFyc2VPcHRpb25hbChzYiwgKCkgPT4gRWZmZWN0LmRlY29kZShzYikpLFxuICAgICAgQ2FyZFN0YXR1czogcGFyc2VVSW50OChzYiksXG4gICAgfTtcbiAgfSxcbiAgZGVjb2RlRGlmZihidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBfRGVlcFBhcnRpYWw8TG9jYXRpb25DYXJkPiB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgY29uc3QgdHJhY2tlciA9IHNiLnJlYWRCaXRzKDkpO1xuICAgIHJldHVybiB7XG4gICAgICBUaXRsZTogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VTdHJpbmcoc2IpIDogX05PX0RJRkYsXG4gICAgICBMZXZlbDogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VJbnQoc2IpIDogX05PX0RJRkYsXG4gICAgICBURDogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VJbnQoc2IpIDogX05PX0RJRkYsXG4gICAgICBTZXF1ZW5jZTogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VJbnQoc2IpIDogX05PX0RJRkYsXG4gICAgICBIZWFsdGg6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlSW50KHNiKSA6IF9OT19ESUZGLFxuICAgICAgQWN0aXZlRGFtYWdlOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUludChzYikgOiBfTk9fRElGRixcbiAgICAgIEFjdGl2ZUVmZmVjdDogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VPcHRpb25hbChzYiwgKCkgPT4gRWZmZWN0LmRlY29kZURpZmYoc2IpKSA6IF9OT19ESUZGLFxuICAgICAgUGFzc2l2ZUVmZmVjdDogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VPcHRpb25hbChzYiwgKCkgPT4gRWZmZWN0LmRlY29kZURpZmYoc2IpKSA6IF9OT19ESUZGLFxuICAgICAgQ2FyZFN0YXR1czogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VVSW50OChzYikgOiBfTk9fRElGRixcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBQbGF5ZXJEZWNrcyA9IHtcbiAgZGVmYXVsdCgpOiBQbGF5ZXJEZWNrcyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIERlY2s6IFtdLFxuICAgICAgRGlzY2FyZDogW10sXG4gICAgfTtcbiAgfSxcbiAgZW5jb2RlKG9iajogUGxheWVyRGVja3MsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICB3cml0ZUFycmF5KGJ1Ziwgb2JqLkRlY2ssICh4KSA9PiBBYmlsaXR5Q2FyZC5lbmNvZGUoeCwgYnVmKSk7XG4gICAgd3JpdGVBcnJheShidWYsIG9iai5EaXNjYXJkLCAoeCkgPT4gQWJpbGl0eUNhcmQuZW5jb2RlKHgsIGJ1ZikpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGVuY29kZURpZmYob2JqOiBfRGVlcFBhcnRpYWw8UGxheWVyRGVja3M+LCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgY29uc3QgdHJhY2tlcjogYm9vbGVhbltdID0gW107XG4gICAgdHJhY2tlci5wdXNoKG9iai5EZWNrICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5EaXNjYXJkICE9PSBfTk9fRElGRik7XG4gICAgYnVmLndyaXRlQml0cyh0cmFja2VyKTtcbiAgICBpZiAob2JqLkRlY2sgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUFycmF5RGlmZihidWYsIG9iai5EZWNrLCAoeCkgPT4gQWJpbGl0eUNhcmQuZW5jb2RlRGlmZih4LCBidWYpKTtcbiAgICB9XG4gICAgaWYgKG9iai5EaXNjYXJkICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVBcnJheURpZmYoYnVmLCBvYmouRGlzY2FyZCwgKHgpID0+IEFiaWxpdHlDYXJkLmVuY29kZURpZmYoeCwgYnVmKSk7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBQbGF5ZXJEZWNrcyB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIERlY2s6IHBhcnNlQXJyYXkoc2IsICgpID0+IEFiaWxpdHlDYXJkLmRlY29kZShzYikpLFxuICAgICAgRGlzY2FyZDogcGFyc2VBcnJheShzYiwgKCkgPT4gQWJpbGl0eUNhcmQuZGVjb2RlKHNiKSksXG4gICAgfTtcbiAgfSxcbiAgZGVjb2RlRGlmZihidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBfRGVlcFBhcnRpYWw8UGxheWVyRGVja3M+IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICBjb25zdCB0cmFja2VyID0gc2IucmVhZEJpdHMoMik7XG4gICAgcmV0dXJuIHtcbiAgICAgIERlY2s6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlQXJyYXlEaWZmKHNiLCAoKSA9PiBBYmlsaXR5Q2FyZC5kZWNvZGVEaWZmKHNiKSkgOiBfTk9fRElGRixcbiAgICAgIERpc2NhcmQ6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlQXJyYXlEaWZmKHNiLCAoKSA9PiBBYmlsaXR5Q2FyZC5kZWNvZGVEaWZmKHNiKSkgOiBfTk9fRElGRixcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBVSUV2ZW50cyA9IHtcbiAgZGVmYXVsdCgpOiBVSUV2ZW50cyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwiXCIsXG4gICAgICB2YWx1ZTogMCxcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBVSUV2ZW50cywgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLnR5cGUpO1xuICAgIHdyaXRlSW50KGJ1Ziwgb2JqLnZhbHVlKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBlbmNvZGVEaWZmKG9iajogX0RlZXBQYXJ0aWFsPFVJRXZlbnRzPiwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIGNvbnN0IHRyYWNrZXI6IGJvb2xlYW5bXSA9IFtdO1xuICAgIHRyYWNrZXIucHVzaChvYmoudHlwZSAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmoudmFsdWUgIT09IF9OT19ESUZGKTtcbiAgICBidWYud3JpdGVCaXRzKHRyYWNrZXIpO1xuICAgIGlmIChvYmoudHlwZSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLnR5cGUpO1xuICAgIH1cbiAgICBpZiAob2JqLnZhbHVlICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVJbnQoYnVmLCBvYmoudmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogVUlFdmVudHMge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBwYXJzZVN0cmluZyhzYiksXG4gICAgICB2YWx1ZTogcGFyc2VJbnQoc2IpLFxuICAgIH07XG4gIH0sXG4gIGRlY29kZURpZmYoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogX0RlZXBQYXJ0aWFsPFVJRXZlbnRzPiB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgY29uc3QgdHJhY2tlciA9IHNiLnJlYWRCaXRzKDIpO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZVN0cmluZyhzYikgOiBfTk9fRElGRixcbiAgICAgIHZhbHVlOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUludChzYikgOiBfTk9fRElGRixcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBFdmVudHMgPSB7XG4gIGRlZmF1bHQoKTogRXZlbnRzIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcjogXCJcIixcbiAgICAgIGVmZmVjdDogVUlFdmVudHMuZGVmYXVsdCgpLFxuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IEV2ZW50cywgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLnVzZXIpO1xuICAgIFVJRXZlbnRzLmVuY29kZShvYmouZWZmZWN0LCBidWYpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGVuY29kZURpZmYob2JqOiBfRGVlcFBhcnRpYWw8RXZlbnRzPiwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIGNvbnN0IHRyYWNrZXI6IGJvb2xlYW5bXSA9IFtdO1xuICAgIHRyYWNrZXIucHVzaChvYmoudXNlciAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouZWZmZWN0ICE9PSBfTk9fRElGRik7XG4gICAgYnVmLndyaXRlQml0cyh0cmFja2VyKTtcbiAgICBpZiAob2JqLnVzZXIgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZVN0cmluZyhidWYsIG9iai51c2VyKTtcbiAgICB9XG4gICAgaWYgKG9iai5lZmZlY3QgIT09IF9OT19ESUZGKSB7XG4gICAgICBVSUV2ZW50cy5lbmNvZGVEaWZmKG9iai5lZmZlY3QsIGJ1Zik7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBFdmVudHMge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICB1c2VyOiBwYXJzZVN0cmluZyhzYiksXG4gICAgICBlZmZlY3Q6IFVJRXZlbnRzLmRlY29kZShzYiksXG4gICAgfTtcbiAgfSxcbiAgZGVjb2RlRGlmZihidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBfRGVlcFBhcnRpYWw8RXZlbnRzPiB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgY29uc3QgdHJhY2tlciA9IHNiLnJlYWRCaXRzKDIpO1xuICAgIHJldHVybiB7XG4gICAgICB1c2VyOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZVN0cmluZyhzYikgOiBfTk9fRElGRixcbiAgICAgIGVmZmVjdDogdHJhY2tlci5zaGlmdCgpID8gVUlFdmVudHMuZGVjb2RlRGlmZihzYikgOiBfTk9fRElGRixcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBQbGF5ZXIgPSB7XG4gIGRlZmF1bHQoKTogUGxheWVyIHtcbiAgICByZXR1cm4ge1xuICAgICAgSWQ6IFwiXCIsXG4gICAgICBTdGF0dXNFZmZlY3RzOiBbXSxcbiAgICAgIFBsYXllclN0YXRlOiAwLFxuICAgICAgSGVhbHRoOiAwLFxuICAgICAgQXR0YWNrUG9pbnRzOiAwLFxuICAgICAgQWJpbGl0eVBvaW50czogMCxcbiAgICAgIEhhbmQ6IFtdLFxuICAgICAgUm9sZTogMCxcbiAgICAgIExldmVsQm9udXM6IFtdLFxuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IFBsYXllciwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLklkKTtcbiAgICB3cml0ZUFycmF5KGJ1Ziwgb2JqLlN0YXR1c0VmZmVjdHMsICh4KSA9PiB3cml0ZVVJbnQ4KGJ1ZiwgeCkpO1xuICAgIHdyaXRlVUludDgoYnVmLCBvYmouUGxheWVyU3RhdGUpO1xuICAgIHdyaXRlSW50KGJ1Ziwgb2JqLkhlYWx0aCk7XG4gICAgd3JpdGVJbnQoYnVmLCBvYmouQXR0YWNrUG9pbnRzKTtcbiAgICB3cml0ZUludChidWYsIG9iai5BYmlsaXR5UG9pbnRzKTtcbiAgICB3cml0ZUFycmF5KGJ1Ziwgb2JqLkhhbmQsICh4KSA9PiBBYmlsaXR5Q2FyZC5lbmNvZGUoeCwgYnVmKSk7XG4gICAgd3JpdGVVSW50OChidWYsIG9iai5Sb2xlKTtcbiAgICB3cml0ZUFycmF5KGJ1Ziwgb2JqLkxldmVsQm9udXMsICh4KSA9PiBFZmZlY3QuZW5jb2RlKHgsIGJ1ZikpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGVuY29kZURpZmYob2JqOiBfRGVlcFBhcnRpYWw8UGxheWVyPiwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIGNvbnN0IHRyYWNrZXI6IGJvb2xlYW5bXSA9IFtdO1xuICAgIHRyYWNrZXIucHVzaChvYmouSWQgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLlN0YXR1c0VmZmVjdHMgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLlBsYXllclN0YXRlICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5IZWFsdGggIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLkF0dGFja1BvaW50cyAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouQWJpbGl0eVBvaW50cyAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouSGFuZCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouUm9sZSAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouTGV2ZWxCb251cyAhPT0gX05PX0RJRkYpO1xuICAgIGJ1Zi53cml0ZUJpdHModHJhY2tlcik7XG4gICAgaWYgKG9iai5JZCAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLklkKTtcbiAgICB9XG4gICAgaWYgKG9iai5TdGF0dXNFZmZlY3RzICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVBcnJheURpZmYoYnVmLCBvYmouU3RhdHVzRWZmZWN0cywgKHgpID0+IHdyaXRlVUludDgoYnVmLCB4KSk7XG4gICAgfVxuICAgIGlmIChvYmouUGxheWVyU3RhdGUgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZVVJbnQ4KGJ1Ziwgb2JqLlBsYXllclN0YXRlKTtcbiAgICB9XG4gICAgaWYgKG9iai5IZWFsdGggIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUludChidWYsIG9iai5IZWFsdGgpO1xuICAgIH1cbiAgICBpZiAob2JqLkF0dGFja1BvaW50cyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLkF0dGFja1BvaW50cyk7XG4gICAgfVxuICAgIGlmIChvYmouQWJpbGl0eVBvaW50cyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLkFiaWxpdHlQb2ludHMpO1xuICAgIH1cbiAgICBpZiAob2JqLkhhbmQgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUFycmF5RGlmZihidWYsIG9iai5IYW5kLCAoeCkgPT4gQWJpbGl0eUNhcmQuZW5jb2RlRGlmZih4LCBidWYpKTtcbiAgICB9XG4gICAgaWYgKG9iai5Sb2xlICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVVSW50OChidWYsIG9iai5Sb2xlKTtcbiAgICB9XG4gICAgaWYgKG9iai5MZXZlbEJvbnVzICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVBcnJheURpZmYoYnVmLCBvYmouTGV2ZWxCb251cywgKHgpID0+IEVmZmVjdC5lbmNvZGVEaWZmKHgsIGJ1ZikpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogUGxheWVyIHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgSWQ6IHBhcnNlU3RyaW5nKHNiKSxcbiAgICAgIFN0YXR1c0VmZmVjdHM6IHBhcnNlQXJyYXkoc2IsICgpID0+IHBhcnNlVUludDgoc2IpKSxcbiAgICAgIFBsYXllclN0YXRlOiBwYXJzZVVJbnQ4KHNiKSxcbiAgICAgIEhlYWx0aDogcGFyc2VJbnQoc2IpLFxuICAgICAgQXR0YWNrUG9pbnRzOiBwYXJzZUludChzYiksXG4gICAgICBBYmlsaXR5UG9pbnRzOiBwYXJzZUludChzYiksXG4gICAgICBIYW5kOiBwYXJzZUFycmF5KHNiLCAoKSA9PiBBYmlsaXR5Q2FyZC5kZWNvZGUoc2IpKSxcbiAgICAgIFJvbGU6IHBhcnNlVUludDgoc2IpLFxuICAgICAgTGV2ZWxCb251czogcGFyc2VBcnJheShzYiwgKCkgPT4gRWZmZWN0LmRlY29kZShzYikpLFxuICAgIH07XG4gIH0sXG4gIGRlY29kZURpZmYoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogX0RlZXBQYXJ0aWFsPFBsYXllcj4ge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIGNvbnN0IHRyYWNrZXIgPSBzYi5yZWFkQml0cyg5KTtcbiAgICByZXR1cm4ge1xuICAgICAgSWQ6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlU3RyaW5nKHNiKSA6IF9OT19ESUZGLFxuICAgICAgU3RhdHVzRWZmZWN0czogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VBcnJheURpZmYoc2IsICgpID0+IHBhcnNlVUludDgoc2IpKSA6IF9OT19ESUZGLFxuICAgICAgUGxheWVyU3RhdGU6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlVUludDgoc2IpIDogX05PX0RJRkYsXG4gICAgICBIZWFsdGg6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlSW50KHNiKSA6IF9OT19ESUZGLFxuICAgICAgQXR0YWNrUG9pbnRzOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUludChzYikgOiBfTk9fRElGRixcbiAgICAgIEFiaWxpdHlQb2ludHM6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlSW50KHNiKSA6IF9OT19ESUZGLFxuICAgICAgSGFuZDogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VBcnJheURpZmYoc2IsICgpID0+IEFiaWxpdHlDYXJkLmRlY29kZURpZmYoc2IpKSA6IF9OT19ESUZGLFxuICAgICAgUm9sZTogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VVSW50OChzYikgOiBfTk9fRElGRixcbiAgICAgIExldmVsQm9udXM6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlQXJyYXlEaWZmKHNiLCAoKSA9PiBFZmZlY3QuZGVjb2RlRGlmZihzYikpIDogX05PX0RJRkYsXG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgR2FtZVN0YXRlID0ge1xuICBkZWZhdWx0KCk6IEdhbWVTdGF0ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdhbWVMZXZlbDogMCxcbiAgICAgIGdhbWVMb2c6IFtdLFxuICAgICAgcm91bmRTZXF1ZW5jZTogMCxcbiAgICAgIGdhbWVTZXF1ZW5jZTogMCxcbiAgICAgIGFiaWxpdHlQaWxlOiBbXSxcbiAgICAgIGFjdGl2ZU1vbnN0ZXJzOiBbXSxcbiAgICAgIGxvY2F0aW9uUGlsZTogdW5kZWZpbmVkLFxuICAgICAgdG93ZXJEZWZlbnNlUGlsZTogW10sXG4gICAgICB0dXJuOiB1bmRlZmluZWQsXG4gICAgICBwbGF5ZXJzOiBbXSxcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBHYW1lU3RhdGUsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICB3cml0ZUludChidWYsIG9iai5nYW1lTGV2ZWwpO1xuICAgIHdyaXRlQXJyYXkoYnVmLCBvYmouZ2FtZUxvZywgKHgpID0+IHdyaXRlU3RyaW5nKGJ1ZiwgeCkpO1xuICAgIHdyaXRlVUludDgoYnVmLCBvYmoucm91bmRTZXF1ZW5jZSk7XG4gICAgd3JpdGVVSW50OChidWYsIG9iai5nYW1lU2VxdWVuY2UpO1xuICAgIHdyaXRlQXJyYXkoYnVmLCBvYmouYWJpbGl0eVBpbGUsICh4KSA9PiBBYmlsaXR5Q2FyZC5lbmNvZGUoeCwgYnVmKSk7XG4gICAgd3JpdGVBcnJheShidWYsIG9iai5hY3RpdmVNb25zdGVycywgKHgpID0+IE1vbnN0ZXJDYXJkLmVuY29kZSh4LCBidWYpKTtcbiAgICB3cml0ZU9wdGlvbmFsKGJ1Ziwgb2JqLmxvY2F0aW9uUGlsZSwgKHgpID0+IExvY2F0aW9uQ2FyZC5lbmNvZGUoeCwgYnVmKSk7XG4gICAgd3JpdGVBcnJheShidWYsIG9iai50b3dlckRlZmVuc2VQaWxlLCAoeCkgPT4gVG93ZXJEZWZlbnNlLmVuY29kZSh4LCBidWYpKTtcbiAgICB3cml0ZU9wdGlvbmFsKGJ1Ziwgb2JqLnR1cm4sICh4KSA9PiB3cml0ZVN0cmluZyhidWYsIHgpKTtcbiAgICB3cml0ZUFycmF5KGJ1Ziwgb2JqLnBsYXllcnMsICh4KSA9PiBQbGF5ZXIuZW5jb2RlKHgsIGJ1ZikpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGVuY29kZURpZmYob2JqOiBfRGVlcFBhcnRpYWw8R2FtZVN0YXRlPiwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIGNvbnN0IHRyYWNrZXI6IGJvb2xlYW5bXSA9IFtdO1xuICAgIHRyYWNrZXIucHVzaChvYmouZ2FtZUxldmVsICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5nYW1lTG9nICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5yb3VuZFNlcXVlbmNlICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5nYW1lU2VxdWVuY2UgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLmFiaWxpdHlQaWxlICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5hY3RpdmVNb25zdGVycyAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmoubG9jYXRpb25QaWxlICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai50b3dlckRlZmVuc2VQaWxlICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai50dXJuICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5wbGF5ZXJzICE9PSBfTk9fRElGRik7XG4gICAgYnVmLndyaXRlQml0cyh0cmFja2VyKTtcbiAgICBpZiAob2JqLmdhbWVMZXZlbCAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLmdhbWVMZXZlbCk7XG4gICAgfVxuICAgIGlmIChvYmouZ2FtZUxvZyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlQXJyYXlEaWZmKGJ1Ziwgb2JqLmdhbWVMb2csICh4KSA9PiB3cml0ZVN0cmluZyhidWYsIHgpKTtcbiAgICB9XG4gICAgaWYgKG9iai5yb3VuZFNlcXVlbmNlICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVVSW50OChidWYsIG9iai5yb3VuZFNlcXVlbmNlKTtcbiAgICB9XG4gICAgaWYgKG9iai5nYW1lU2VxdWVuY2UgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZVVJbnQ4KGJ1Ziwgb2JqLmdhbWVTZXF1ZW5jZSk7XG4gICAgfVxuICAgIGlmIChvYmouYWJpbGl0eVBpbGUgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUFycmF5RGlmZihidWYsIG9iai5hYmlsaXR5UGlsZSwgKHgpID0+IEFiaWxpdHlDYXJkLmVuY29kZURpZmYoeCwgYnVmKSk7XG4gICAgfVxuICAgIGlmIChvYmouYWN0aXZlTW9uc3RlcnMgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUFycmF5RGlmZihidWYsIG9iai5hY3RpdmVNb25zdGVycywgKHgpID0+IE1vbnN0ZXJDYXJkLmVuY29kZURpZmYoeCwgYnVmKSk7XG4gICAgfVxuICAgIGlmIChvYmoubG9jYXRpb25QaWxlICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVPcHRpb25hbChidWYsIG9iai5sb2NhdGlvblBpbGUsICh4KSA9PiBMb2NhdGlvbkNhcmQuZW5jb2RlRGlmZih4LCBidWYpKTtcbiAgICB9XG4gICAgaWYgKG9iai50b3dlckRlZmVuc2VQaWxlICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVBcnJheURpZmYoYnVmLCBvYmoudG93ZXJEZWZlbnNlUGlsZSwgKHgpID0+IFRvd2VyRGVmZW5zZS5lbmNvZGVEaWZmKHgsIGJ1ZikpO1xuICAgIH1cbiAgICBpZiAob2JqLnR1cm4gIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZU9wdGlvbmFsKGJ1Ziwgb2JqLnR1cm4sICh4KSA9PiB3cml0ZVN0cmluZyhidWYsIHgpKTtcbiAgICB9XG4gICAgaWYgKG9iai5wbGF5ZXJzICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVBcnJheURpZmYoYnVmLCBvYmoucGxheWVycywgKHgpID0+IFBsYXllci5lbmNvZGVEaWZmKHgsIGJ1ZikpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogR2FtZVN0YXRlIHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgZ2FtZUxldmVsOiBwYXJzZUludChzYiksXG4gICAgICBnYW1lTG9nOiBwYXJzZUFycmF5KHNiLCAoKSA9PiBwYXJzZVN0cmluZyhzYikpLFxuICAgICAgcm91bmRTZXF1ZW5jZTogcGFyc2VVSW50OChzYiksXG4gICAgICBnYW1lU2VxdWVuY2U6IHBhcnNlVUludDgoc2IpLFxuICAgICAgYWJpbGl0eVBpbGU6IHBhcnNlQXJyYXkoc2IsICgpID0+IEFiaWxpdHlDYXJkLmRlY29kZShzYikpLFxuICAgICAgYWN0aXZlTW9uc3RlcnM6IHBhcnNlQXJyYXkoc2IsICgpID0+IE1vbnN0ZXJDYXJkLmRlY29kZShzYikpLFxuICAgICAgbG9jYXRpb25QaWxlOiBwYXJzZU9wdGlvbmFsKHNiLCAoKSA9PiBMb2NhdGlvbkNhcmQuZGVjb2RlKHNiKSksXG4gICAgICB0b3dlckRlZmVuc2VQaWxlOiBwYXJzZUFycmF5KHNiLCAoKSA9PiBUb3dlckRlZmVuc2UuZGVjb2RlKHNiKSksXG4gICAgICB0dXJuOiBwYXJzZU9wdGlvbmFsKHNiLCAoKSA9PiBwYXJzZVN0cmluZyhzYikpLFxuICAgICAgcGxheWVyczogcGFyc2VBcnJheShzYiwgKCkgPT4gUGxheWVyLmRlY29kZShzYikpLFxuICAgIH07XG4gIH0sXG4gIGRlY29kZURpZmYoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogX0RlZXBQYXJ0aWFsPEdhbWVTdGF0ZT4ge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIGNvbnN0IHRyYWNrZXIgPSBzYi5yZWFkQml0cygxMCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdhbWVMZXZlbDogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VJbnQoc2IpIDogX05PX0RJRkYsXG4gICAgICBnYW1lTG9nOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUFycmF5RGlmZihzYiwgKCkgPT4gcGFyc2VTdHJpbmcoc2IpKSA6IF9OT19ESUZGLFxuICAgICAgcm91bmRTZXF1ZW5jZTogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VVSW50OChzYikgOiBfTk9fRElGRixcbiAgICAgIGdhbWVTZXF1ZW5jZTogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VVSW50OChzYikgOiBfTk9fRElGRixcbiAgICAgIGFiaWxpdHlQaWxlOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUFycmF5RGlmZihzYiwgKCkgPT4gQWJpbGl0eUNhcmQuZGVjb2RlRGlmZihzYikpIDogX05PX0RJRkYsXG4gICAgICBhY3RpdmVNb25zdGVyczogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VBcnJheURpZmYoc2IsICgpID0+IE1vbnN0ZXJDYXJkLmRlY29kZURpZmYoc2IpKSA6IF9OT19ESUZGLFxuICAgICAgbG9jYXRpb25QaWxlOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZU9wdGlvbmFsKHNiLCAoKSA9PiBMb2NhdGlvbkNhcmQuZGVjb2RlRGlmZihzYikpIDogX05PX0RJRkYsXG4gICAgICB0b3dlckRlZmVuc2VQaWxlOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUFycmF5RGlmZihzYiwgKCkgPT4gVG93ZXJEZWZlbnNlLmRlY29kZURpZmYoc2IpKSA6IF9OT19ESUZGLFxuICAgICAgdHVybjogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VPcHRpb25hbChzYiwgKCkgPT4gcGFyc2VTdHJpbmcoc2IpKSA6IF9OT19ESUZGLFxuICAgICAgcGxheWVyczogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VBcnJheURpZmYoc2IsICgpID0+IFBsYXllci5kZWNvZGVEaWZmKHNiKSkgOiBfTk9fRElGRixcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBJSm9pbkdhbWVSZXF1ZXN0ID0ge1xuICBkZWZhdWx0KCk6IElKb2luR2FtZVJlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcbiAgZW5jb2RlKG9iajogSUpvaW5HYW1lUmVxdWVzdCwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBJSm9pbkdhbWVSZXF1ZXN0IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IElTZWxlY3RSb2xlUmVxdWVzdCA9IHtcbiAgZGVmYXVsdCgpOiBJU2VsZWN0Um9sZVJlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgICByb2xlOiAwLFxuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IElTZWxlY3RSb2xlUmVxdWVzdCwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlVUludDgoYnVmLCBvYmoucm9sZSk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IElTZWxlY3RSb2xlUmVxdWVzdCB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJvbGU6IHBhcnNlVUludDgoc2IpLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IElBZGRBSVJlcXVlc3QgPSB7XG4gIGRlZmF1bHQoKTogSUFkZEFJUmVxdWVzdCB7XG4gICAgcmV0dXJuIHtcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBJQWRkQUlSZXF1ZXN0LCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IElBZGRBSVJlcXVlc3Qge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgSVN0YXJ0R2FtZVJlcXVlc3QgPSB7XG4gIGRlZmF1bHQoKTogSVN0YXJ0R2FtZVJlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcbiAgZW5jb2RlKG9iajogSVN0YXJ0R2FtZVJlcXVlc3QsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogSVN0YXJ0R2FtZVJlcXVlc3Qge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgSVNlbGVjdFRvd2VyRGVmZW5zZVJlcXVlc3QgPSB7XG4gIGRlZmF1bHQoKTogSVNlbGVjdFRvd2VyRGVmZW5zZVJlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgICBjYXJkbmFtZTogXCJcIixcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBJU2VsZWN0VG93ZXJEZWZlbnNlUmVxdWVzdCwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLmNhcmRuYW1lKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogSVNlbGVjdFRvd2VyRGVmZW5zZVJlcXVlc3Qge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICBjYXJkbmFtZTogcGFyc2VTdHJpbmcoc2IpLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IElTZWxlY3RNb25zdGVyQ2FyZFJlcXVlc3QgPSB7XG4gIGRlZmF1bHQoKTogSVNlbGVjdE1vbnN0ZXJDYXJkUmVxdWVzdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNhcmRuYW1lOiBcIlwiLFxuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IElTZWxlY3RNb25zdGVyQ2FyZFJlcXVlc3QsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICB3cml0ZVN0cmluZyhidWYsIG9iai5jYXJkbmFtZSk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IElTZWxlY3RNb25zdGVyQ2FyZFJlcXVlc3Qge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICBjYXJkbmFtZTogcGFyc2VTdHJpbmcoc2IpLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IElTZWxlY3RQbGF5ZXJDYXJkUmVxdWVzdCA9IHtcbiAgZGVmYXVsdCgpOiBJU2VsZWN0UGxheWVyQ2FyZFJlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgICBjYXJkbmFtZTogXCJcIixcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBJU2VsZWN0UGxheWVyQ2FyZFJlcXVlc3QsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICB3cml0ZVN0cmluZyhidWYsIG9iai5jYXJkbmFtZSk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IElTZWxlY3RQbGF5ZXJDYXJkUmVxdWVzdCB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNhcmRuYW1lOiBwYXJzZVN0cmluZyhzYiksXG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgSURpc2NhcmRSZXF1ZXN0ID0ge1xuICBkZWZhdWx0KCk6IElEaXNjYXJkUmVxdWVzdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNhcmRuYW1lOiBcIlwiLFxuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IElEaXNjYXJkUmVxdWVzdCwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLmNhcmRuYW1lKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogSURpc2NhcmRSZXF1ZXN0IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgY2FyZG5hbWU6IHBhcnNlU3RyaW5nKHNiKSxcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBJRHJhd0NhcmRSZXF1ZXN0ID0ge1xuICBkZWZhdWx0KCk6IElEcmF3Q2FyZFJlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgICBjYXJkbmFtZTogXCJcIixcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBJRHJhd0NhcmRSZXF1ZXN0LCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgd3JpdGVTdHJpbmcoYnVmLCBvYmouY2FyZG5hbWUpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBJRHJhd0NhcmRSZXF1ZXN0IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgY2FyZG5hbWU6IHBhcnNlU3RyaW5nKHNiKSxcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBJRW5kVHVyblJlcXVlc3QgPSB7XG4gIGRlZmF1bHQoKTogSUVuZFR1cm5SZXF1ZXN0IHtcbiAgICByZXR1cm4ge1xuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IElFbmRUdXJuUmVxdWVzdCwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBJRW5kVHVyblJlcXVlc3Qge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgSVN0YXJ0VHVyblJlcXVlc3QgPSB7XG4gIGRlZmF1bHQoKTogSVN0YXJ0VHVyblJlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcbiAgZW5jb2RlKG9iajogSVN0YXJ0VHVyblJlcXVlc3QsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogSVN0YXJ0VHVyblJlcXVlc3Qge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgSVVzZXJDaG9pY2VSZXF1ZXN0ID0ge1xuICBkZWZhdWx0KCk6IElVc2VyQ2hvaWNlUmVxdWVzdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVmZmVjdDogXCJcIixcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBJVXNlckNob2ljZVJlcXVlc3QsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICB3cml0ZVN0cmluZyhidWYsIG9iai5lZmZlY3QpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBJVXNlckNob2ljZVJlcXVlc3Qge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICBlZmZlY3Q6IHBhcnNlU3RyaW5nKHNiKSxcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBJQXBwbHlBdHRhY2tSZXF1ZXN0ID0ge1xuICBkZWZhdWx0KCk6IElBcHBseUF0dGFja1JlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgICBjYXJkbmFtZTogXCJcIixcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBJQXBwbHlBdHRhY2tSZXF1ZXN0LCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgd3JpdGVTdHJpbmcoYnVmLCBvYmouY2FyZG5hbWUpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBJQXBwbHlBdHRhY2tSZXF1ZXN0IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgY2FyZG5hbWU6IHBhcnNlU3RyaW5nKHNiKSxcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBJQnV5QWJpbGl0eUNhcmRSZXF1ZXN0ID0ge1xuICBkZWZhdWx0KCk6IElCdXlBYmlsaXR5Q2FyZFJlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgICBjYXJkbmFtZTogXCJcIixcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBJQnV5QWJpbGl0eUNhcmRSZXF1ZXN0LCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgd3JpdGVTdHJpbmcoYnVmLCBvYmouY2FyZG5hbWUpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBJQnV5QWJpbGl0eUNhcmRSZXF1ZXN0IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgY2FyZG5hbWU6IHBhcnNlU3RyaW5nKHNiKSxcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBJSW5pdGlhbGl6ZVJlcXVlc3QgPSB7XG4gIGRlZmF1bHQoKTogSUluaXRpYWxpemVSZXF1ZXN0IHtcbiAgICByZXR1cm4ge307XG4gIH0sXG4gIGVuY29kZSh4OiBJSW5pdGlhbGl6ZVJlcXVlc3QsIGJ1Zj86IF9Xcml0ZXIpIHtcbiAgICByZXR1cm4gYnVmID8/IG5ldyBfV3JpdGVyKCk7XG4gIH0sXG4gIGRlY29kZShzYjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IElJbml0aWFsaXplUmVxdWVzdCB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZVN0YXRlU25hcHNob3QoeDogR2FtZVN0YXRlKSB7XG4gIGNvbnN0IGJ1ZiA9IG5ldyBfV3JpdGVyKCk7XG4gIGJ1Zi53cml0ZVVJbnQ4KDApO1xuICB0cnkge1xuICAgIEdhbWVTdGF0ZS5lbmNvZGUoeCwgYnVmKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIHVzZXIgc3RhdGVcIiwgeCk7XG4gICAgdGhyb3cgZTtcbiAgfVxuICByZXR1cm4gYnVmLnRvQnVmZmVyKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlU3RhdGVVcGRhdGUoXG4gIHg6IF9EZWVwUGFydGlhbDxHYW1lU3RhdGU+IHwgdW5kZWZpbmVkLFxuICBjaGFuZ2VkQXREaWZmOiBudW1iZXIsXG4gIG1lc3NhZ2VzOiBfTWVzc2FnZVtdXG4pIHtcbiAgY29uc3QgYnVmID0gbmV3IF9Xcml0ZXIoKTtcbiAgYnVmLndyaXRlVUludDgoMSk7XG4gIGJ1Zi53cml0ZVVWYXJpbnQoY2hhbmdlZEF0RGlmZik7XG4gIGNvbnN0IHJlc3BvbnNlcyA9IG1lc3NhZ2VzLmZsYXRNYXAoKG1zZykgPT4gKG1zZy50eXBlID09PSBcInJlc3BvbnNlXCIgPyBtc2cgOiBbXSkpO1xuICBidWYud3JpdGVVVmFyaW50KHJlc3BvbnNlcy5sZW5ndGgpO1xuICByZXNwb25zZXMuZm9yRWFjaCgoeyBtc2dJZCwgcmVzcG9uc2UgfSkgPT4ge1xuICAgIGJ1Zi53cml0ZVVJbnQzMihOdW1iZXIobXNnSWQpKTtcbiAgICB3cml0ZU9wdGlvbmFsKGJ1ZiwgcmVzcG9uc2UudHlwZSA9PT0gXCJlcnJvclwiID8gcmVzcG9uc2UuZXJyb3IgOiB1bmRlZmluZWQsICh4KSA9PiB3cml0ZVN0cmluZyhidWYsIHgpKTtcbiAgfSk7XG4gIGNvbnN0IGV2ZW50cyA9IG1lc3NhZ2VzLmZsYXRNYXAoKG1zZykgPT4gKG1zZy50eXBlID09PSBcImV2ZW50XCIgPyBtc2cgOiBbXSkpO1xuICBidWYud3JpdGVVVmFyaW50KGV2ZW50cy5sZW5ndGgpO1xuICBldmVudHMuZm9yRWFjaCgoeyBldmVudCB9KSA9PiBidWYud3JpdGVTdHJpbmcoZXZlbnQpKTtcbiAgaWYgKHggIT09IHVuZGVmaW5lZCkge1xuICAgIEdhbWVTdGF0ZS5lbmNvZGVEaWZmKHgsIGJ1Zik7XG4gIH1cbiAgcmV0dXJuIGJ1Zi50b0J1ZmZlcigpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZVN0YXRlVXBkYXRlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IHtcbiAgc3RhdGVEaWZmPzogX0RlZXBQYXJ0aWFsPEdhbWVTdGF0ZT47XG4gIGNoYW5nZWRBdERpZmY6IG51bWJlcjtcbiAgcmVzcG9uc2VzOiBfUmVzcG9uc2VNZXNzYWdlW107XG4gIGV2ZW50czogX0V2ZW50TWVzc2FnZVtdO1xufSB7XG4gIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICBjb25zdCBjaGFuZ2VkQXREaWZmID0gc2IucmVhZFVWYXJpbnQoKTtcbiAgY29uc3QgcmVzcG9uc2VzID0gWy4uLkFycmF5KHNiLnJlYWRVVmFyaW50KCkpXS5tYXAoKCkgPT4ge1xuICAgIGNvbnN0IG1zZ0lkID0gc2IucmVhZFVJbnQzMigpO1xuICAgIGNvbnN0IG1heWJlRXJyb3IgPSBwYXJzZU9wdGlvbmFsKHNiLCAoKSA9PiBwYXJzZVN0cmluZyhzYikpO1xuICAgIHJldHVybiBfTWVzc2FnZS5yZXNwb25zZShtc2dJZCwgbWF5YmVFcnJvciA9PT0gdW5kZWZpbmVkID8gX1Jlc3BvbnNlLm9rKCkgOiBfUmVzcG9uc2UuZXJyb3IobWF5YmVFcnJvcikpO1xuICB9KTtcbiAgY29uc3QgZXZlbnRzID0gWy4uLkFycmF5KHNiLnJlYWRVVmFyaW50KCkpXS5tYXAoKCkgPT4gX01lc3NhZ2UuZXZlbnQoc2IucmVhZFN0cmluZygpKSk7XG4gIGNvbnN0IHN0YXRlRGlmZiA9IHNiLnJlbWFpbmluZygpID8gR2FtZVN0YXRlLmRlY29kZURpZmYoc2IpIDogdW5kZWZpbmVkO1xuICByZXR1cm4geyBzdGF0ZURpZmYsIGNoYW5nZWRBdERpZmYsIHJlc3BvbnNlcywgZXZlbnRzIH07XG59XG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU3RhdGVTbmFwc2hvdChidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpIHtcbiAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gIHJldHVybiBHYW1lU3RhdGUuZGVjb2RlKHNiKTtcbn1cblxuZnVuY3Rpb24gd3JpdGVVSW50OChidWY6IF9Xcml0ZXIsIHg6IG51bWJlcikge1xuICBidWYud3JpdGVVSW50OCh4KTtcbn1cbmZ1bmN0aW9uIHdyaXRlQm9vbGVhbihidWY6IF9Xcml0ZXIsIHg6IGJvb2xlYW4pIHtcbiAgYnVmLndyaXRlVUludDgoeCA/IDEgOiAwKTtcbn1cbmZ1bmN0aW9uIHdyaXRlSW50KGJ1ZjogX1dyaXRlciwgeDogbnVtYmVyKSB7XG4gIGJ1Zi53cml0ZVZhcmludCh4KTtcbn1cbmZ1bmN0aW9uIHdyaXRlRmxvYXQoYnVmOiBfV3JpdGVyLCB4OiBudW1iZXIpIHtcbiAgYnVmLndyaXRlRmxvYXQoeCk7XG59XG5mdW5jdGlvbiB3cml0ZVN0cmluZyhidWY6IF9Xcml0ZXIsIHg6IHN0cmluZykge1xuICBidWYud3JpdGVTdHJpbmcoeCk7XG59XG5mdW5jdGlvbiB3cml0ZU9wdGlvbmFsPFQ+KGJ1ZjogX1dyaXRlciwgeDogVCB8IHVuZGVmaW5lZCwgaW5uZXJXcml0ZTogKHg6IFQpID0+IHZvaWQpIHtcbiAgd3JpdGVCb29sZWFuKGJ1ZiwgeCAhPT0gdW5kZWZpbmVkKTtcbiAgaWYgKHggIT09IHVuZGVmaW5lZCkge1xuICAgIGlubmVyV3JpdGUoeCk7XG4gIH1cbn1cbmZ1bmN0aW9uIHdyaXRlQXJyYXk8VD4oYnVmOiBfV3JpdGVyLCB4OiBUW10sIGlubmVyV3JpdGU6ICh4OiBUKSA9PiB2b2lkKSB7XG4gIGJ1Zi53cml0ZVVWYXJpbnQoeC5sZW5ndGgpO1xuICBmb3IgKGNvbnN0IHZhbCBvZiB4KSB7XG4gICAgaW5uZXJXcml0ZSh2YWwpO1xuICB9XG59XG5mdW5jdGlvbiB3cml0ZUFycmF5RGlmZjxUPihidWY6IF9Xcml0ZXIsIHg6IChUIHwgdHlwZW9mIF9OT19ESUZGKVtdLCBpbm5lcldyaXRlOiAoeDogVCkgPT4gdm9pZCkge1xuICBidWYud3JpdGVVVmFyaW50KHgubGVuZ3RoKTtcbiAgY29uc3QgdHJhY2tlcjogYm9vbGVhbltdID0gW107XG4gIHguZm9yRWFjaCgodmFsKSA9PiB7XG4gICAgdHJhY2tlci5wdXNoKHZhbCAhPT0gX05PX0RJRkYpO1xuICB9KTtcbiAgYnVmLndyaXRlQml0cyh0cmFja2VyKTtcbiAgeC5mb3JFYWNoKCh2YWwpID0+IHtcbiAgICBpZiAodmFsICE9PSBfTk9fRElGRikge1xuICAgICAgaW5uZXJXcml0ZSh2YWwpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVUludDgoYnVmOiBfUmVhZGVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIGJ1Zi5yZWFkVUludDgoKTtcbn1cbmZ1bmN0aW9uIHBhcnNlQm9vbGVhbihidWY6IF9SZWFkZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGJ1Zi5yZWFkVUludDgoKSA+IDA7XG59XG5mdW5jdGlvbiBwYXJzZUludChidWY6IF9SZWFkZXIpOiBudW1iZXIge1xuICByZXR1cm4gYnVmLnJlYWRWYXJpbnQoKTtcbn1cbmZ1bmN0aW9uIHBhcnNlRmxvYXQoYnVmOiBfUmVhZGVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIGJ1Zi5yZWFkRmxvYXQoKTtcbn1cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKGJ1ZjogX1JlYWRlcik6IHN0cmluZyB7XG4gIHJldHVybiBidWYucmVhZFN0cmluZygpO1xufVxuZnVuY3Rpb24gcGFyc2VPcHRpb25hbDxUPihidWY6IF9SZWFkZXIsIGlubmVyUGFyc2U6IChidWY6IF9SZWFkZXIpID0+IFQpOiBUIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHBhcnNlQm9vbGVhbihidWYpID8gaW5uZXJQYXJzZShidWYpIDogdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gcGFyc2VBcnJheTxUPihidWY6IF9SZWFkZXIsIGlubmVyUGFyc2U6ICgpID0+IFQpOiBUW10ge1xuICBjb25zdCBsZW4gPSBidWYucmVhZFVWYXJpbnQoKTtcbiAgY29uc3QgYXJyID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBhcnIucHVzaChpbm5lclBhcnNlKCkpO1xuICB9XG4gIHJldHVybiBhcnI7XG59XG5mdW5jdGlvbiBwYXJzZUFycmF5RGlmZjxUPihidWY6IF9SZWFkZXIsIGlubmVyUGFyc2U6ICgpID0+IFQpOiAoVCB8IHR5cGVvZiBfTk9fRElGRilbXSB7XG4gIGNvbnN0IGxlbiA9IGJ1Zi5yZWFkVVZhcmludCgpO1xuICBjb25zdCB0cmFja2VyID0gYnVmLnJlYWRCaXRzKGxlbik7XG4gIGNvbnN0IGFyciA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKHRyYWNrZXIuc2hpZnQoKSkge1xuICAgICAgYXJyLnB1c2goaW5uZXJQYXJzZSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJyLnB1c2goX05PX0RJRkYpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyO1xufVxuIiwiaW1wb3J0IFdlYlNvY2tldCBmcm9tIFwiaXNvbW9ycGhpYy13c1wiO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IGdldFJhbmRvbVZhbHVlcyBmcm9tIFwiZ2V0LXJhbmRvbS12YWx1ZXNcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcbmltcG9ydCBqd3REZWNvZGUgZnJvbSBcImp3dC1kZWNvZGVcIjtcbmltcG9ydCB7IFJlYWRlciwgV3JpdGVyIH0gZnJvbSBcImJpbi1zZXJkZVwiO1xuaW1wb3J0IHsgVXNlckRhdGEsIFJlc3BvbnNlLCBNZXRob2QsIENPT1JESU5BVE9SX0hPU1QgfSBmcm9tIFwiLi4vLi4vYXBpL2Jhc2VcIjtcbmltcG9ydCB7XG4gIGRlY29kZVN0YXRlU25hcHNob3QsXG4gIGRlY29kZVN0YXRlVXBkYXRlLFxuICBHYW1lU3RhdGUgYXMgVXNlclN0YXRlLFxuICBJSW5pdGlhbGl6ZVJlcXVlc3QsXG4gIElKb2luR2FtZVJlcXVlc3QsXG4gIElTZWxlY3RSb2xlUmVxdWVzdCxcbiAgSUFkZEFJUmVxdWVzdCxcbiAgSVN0YXJ0R2FtZVJlcXVlc3QsXG4gIElTZWxlY3RUb3dlckRlZmVuc2VSZXF1ZXN0LFxuICBJU2VsZWN0TW9uc3RlckNhcmRSZXF1ZXN0LFxuICBJU2VsZWN0UGxheWVyQ2FyZFJlcXVlc3QsXG4gIElEaXNjYXJkUmVxdWVzdCxcbiAgSURyYXdDYXJkUmVxdWVzdCxcbiAgSUVuZFR1cm5SZXF1ZXN0LFxuICBJU3RhcnRUdXJuUmVxdWVzdCxcbiAgSVVzZXJDaG9pY2VSZXF1ZXN0LFxuICBJQXBwbHlBdHRhY2tSZXF1ZXN0LFxuICBJQnV5QWJpbGl0eUNhcmRSZXF1ZXN0LFxufSBmcm9tIFwiLi4vLi4vYXBpL3R5cGVzXCI7XG5pbXBvcnQgeyBDb25uZWN0aW9uRmFpbHVyZSwgdHJhbnNmb3JtQ29vcmRpbmF0b3JGYWlsdXJlIH0gZnJvbSBcIi4vZmFpbHVyZXNcIjtcbmltcG9ydCB7IGNvbXB1dGVQYXRjaCB9IGZyb20gXCIuL3BhdGNoXCI7XG5cbmNvbnN0IE1BVENITUFLRVJfSE9TVCA9IFwibWF0Y2htYWtlci5oYXRob3JhLmRldlwiO1xuXG5leHBvcnQgdHlwZSBTdGF0ZUlkID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgVXBkYXRlQXJncyA9IHsgc3RhdGVJZDogU3RhdGVJZDsgc3RhdGU6IFVzZXJTdGF0ZTsgdXBkYXRlZEF0OiBudW1iZXI7IGV2ZW50czogc3RyaW5nW10gfTtcblxuZXhwb3J0IGNsYXNzIEhhdGhvcmFDbGllbnQge1xuICBwdWJsaWMgYXBwSWQgPSBcIjVhZTg0M2FjNzFhZTkyMzM5MmMyYTJlOTM5ZTMzNGQyNDMxM2Y3ZjJjMjJjNGVkOTJlMTUyM2E2ZTA1Yjc5MzJcIjtcblxuICBwdWJsaWMgc3RhdGljIGdldFVzZXJGcm9tVG9rZW4odG9rZW46IHN0cmluZyk6IFVzZXJEYXRhIHtcbiAgICByZXR1cm4gand0RGVjb2RlKHRva2VuKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBsb2dpbkFub255bW91cygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zLnBvc3QoYGh0dHBzOi8vJHtDT09SRElOQVRPUl9IT1NUfS8ke3RoaXMuYXBwSWR9L2xvZ2luL2Fub255bW91c2ApO1xuICAgIHJldHVybiByZXMuZGF0YS50b2tlbjtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjcmVhdGUodG9rZW46IHN0cmluZywgcmVxdWVzdDogSUluaXRpYWxpemVSZXF1ZXN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvcy5wb3N0KFxuICAgICAgYGh0dHBzOi8vJHtDT09SRElOQVRPUl9IT1NUfS8ke3RoaXMuYXBwSWR9L2NyZWF0ZWAsXG4gICAgICBJSW5pdGlhbGl6ZVJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCksXG4gICAgICB7IGhlYWRlcnM6IHsgQXV0aG9yaXphdGlvbjogdG9rZW4sIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIgfSB9XG4gICAgKTtcbiAgICByZXR1cm4gcmVzLmRhdGEuc3RhdGVJZDtcbiAgfVxuXG4gIHB1YmxpYyBjb25uZWN0KFxuICAgIHRva2VuOiBzdHJpbmcsXG4gICAgc3RhdGVJZDogU3RhdGVJZCxcbiAgICBvblVwZGF0ZTogKHVwZGF0ZUFyZ3M6IFVwZGF0ZUFyZ3MpID0+IHZvaWQsXG4gICAgb25Db25uZWN0aW9uRmFpbHVyZTogKGZhaWx1cmU6IENvbm5lY3Rpb25GYWlsdXJlKSA9PiB2b2lkXG4gICk6IEhhdGhvcmFDb25uZWN0aW9uIHtcbiAgICBjb25zdCBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KGB3c3M6Ly8ke0NPT1JESU5BVE9SX0hPU1R9LyR7dGhpcy5hcHBJZH1gKTtcbiAgICBzb2NrZXQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICBzb2NrZXQub25jbG9zZSA9IChlKSA9PiBvbkNvbm5lY3Rpb25GYWlsdXJlKHRyYW5zZm9ybUNvb3JkaW5hdG9yRmFpbHVyZShlKSk7XG4gICAgc29ja2V0Lm9ub3BlbiA9ICgpID0+XG4gICAgICBzb2NrZXQuc2VuZChcbiAgICAgICAgbmV3IFdyaXRlcigpXG4gICAgICAgICAgLndyaXRlVUludDgoMClcbiAgICAgICAgICAud3JpdGVTdHJpbmcodG9rZW4pXG4gICAgICAgICAgLndyaXRlVUludDY0KFsuLi5zdGF0ZUlkXS5yZWR1Y2UoKHIsIHYpID0+IHIgKiAzNm4gKyBCaWdJbnQocGFyc2VJbnQodiwgMzYpKSwgMG4pKVxuICAgICAgICAgIC50b0J1ZmZlcigpXG4gICAgICApO1xuICAgIHJldHVybiBuZXcgSGF0aG9yYUNvbm5lY3Rpb24oc3RhdGVJZCwgc29ja2V0LCBvblVwZGF0ZSk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZmluZE1hdGNoKFxuICAgIHRva2VuOiBzdHJpbmcsXG4gICAgcmVxdWVzdDogSUluaXRpYWxpemVSZXF1ZXN0LFxuICAgIG51bVBsYXllcnM6IG51bWJlcixcbiAgICBvblVwZGF0ZTogKHBsYXllcnNGb3VuZDogbnVtYmVyKSA9PiB2b2lkXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc29ja2V0ID0gbmV3IFdlYlNvY2tldChgd3NzOi8vJHtNQVRDSE1BS0VSX0hPU1R9LyR7dGhpcy5hcHBJZH1gKTtcbiAgICAgIHNvY2tldC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xuICAgICAgc29ja2V0Lm9uY2xvc2UgPSByZWplY3Q7XG4gICAgICBzb2NrZXQub25vcGVuID0gKCkgPT5cbiAgICAgICAgc29ja2V0LnNlbmQoXG4gICAgICAgICAgbmV3IFdyaXRlcigpXG4gICAgICAgICAgICAud3JpdGVTdHJpbmcodG9rZW4pXG4gICAgICAgICAgICAud3JpdGVVVmFyaW50KG51bVBsYXllcnMpXG4gICAgICAgICAgICAud3JpdGVCdWZmZXIoSUluaXRpYWxpemVSZXF1ZXN0LmVuY29kZShyZXF1ZXN0KS50b0J1ZmZlcigpKVxuICAgICAgICAgICAgLnRvQnVmZmVyKClcbiAgICAgICAgKTtcbiAgICAgIHNvY2tldC5vbm1lc3NhZ2UgPSAoeyBkYXRhIH0pID0+IHtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IFJlYWRlcihuZXcgVWludDhBcnJheShkYXRhIGFzIEFycmF5QnVmZmVyKSk7XG4gICAgICAgIGNvbnN0IHR5cGUgPSByZWFkZXIucmVhZFVJbnQ4KCk7XG4gICAgICAgIGlmICh0eXBlID09PSAwKSB7XG4gICAgICAgICAgb25VcGRhdGUocmVhZGVyLnJlYWRVVmFyaW50KCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IDEpIHtcbiAgICAgICAgICByZXNvbHZlKHJlYWRlci5yZWFkU3RyaW5nKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmtub3duIG1lc3NhZ2UgdHlwZVwiLCB0eXBlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSGF0aG9yYUNvbm5lY3Rpb24ge1xuICBwcml2YXRlIGNhbGxiYWNrczogUmVjb3JkPHN0cmluZywgKHJlc3BvbnNlOiBSZXNwb25zZSkgPT4gdm9pZD4gPSB7fTtcbiAgcHJpdmF0ZSBzdGF0ZT86IFVzZXJTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBjaGFuZ2VkQXQgPSAwO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihwdWJsaWMgc3RhdGVJZDogU3RhdGVJZCwgcHJpdmF0ZSBzb2NrZXQ6IFdlYlNvY2tldCwgb25VcGRhdGU6ICh1cGRhdGVBcmdzOiBVcGRhdGVBcmdzKSA9PiB2b2lkKSB7XG4gICAgc29ja2V0Lm9ubWVzc2FnZSA9ICh7IGRhdGEgfSkgPT4ge1xuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IFJlYWRlcihuZXcgVWludDhBcnJheShkYXRhIGFzIEFycmF5QnVmZmVyKSk7XG4gICAgICBjb25zdCB0eXBlID0gcmVhZGVyLnJlYWRVSW50OCgpO1xuICAgICAgaWYgKHR5cGUgPT09IDApIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IGRlY29kZVN0YXRlU25hcHNob3QocmVhZGVyKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkQXQgPSAwO1xuICAgICAgICBvblVwZGF0ZSh7IHN0YXRlSWQsIHN0YXRlOiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUpKSwgdXBkYXRlZEF0OiB0aGlzLmNoYW5nZWRBdCwgZXZlbnRzOiBbXSB9KTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gMSkge1xuICAgICAgICBjb25zdCB7IHN0YXRlRGlmZiwgY2hhbmdlZEF0RGlmZiwgcmVzcG9uc2VzLCBldmVudHMgfSA9IGRlY29kZVN0YXRlVXBkYXRlKHJlYWRlcik7XG4gICAgICAgIGlmIChzdGF0ZURpZmYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSBjb21wdXRlUGF0Y2godGhpcy5zdGF0ZSEsIHN0YXRlRGlmZik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGFuZ2VkQXQgKz0gY2hhbmdlZEF0RGlmZjtcbiAgICAgICAgb25VcGRhdGUoe1xuICAgICAgICAgIHN0YXRlSWQsXG4gICAgICAgICAgc3RhdGU6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZSkpLFxuICAgICAgICAgIHVwZGF0ZWRBdDogdGhpcy5jaGFuZ2VkQXQsXG4gICAgICAgICAgZXZlbnRzOiBldmVudHMubWFwKChlKSA9PiBlLmV2ZW50KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJlc3BvbnNlcy5mb3JFYWNoKCh7IG1zZ0lkLCByZXNwb25zZSB9KSA9PiB7XG4gICAgICAgICAgaWYgKG1zZ0lkIGluIHRoaXMuY2FsbGJhY2tzKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrc1ttc2dJZF0ocmVzcG9uc2UpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuY2FsbGJhY2tzW21zZ0lkXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlVua25vd24gbWVzc2FnZSB0eXBlXCIsIHR5cGUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgam9pbkdhbWUocmVxdWVzdDogSUpvaW5HYW1lUmVxdWVzdCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKE1ldGhvZC5KT0lOX0dBTUUsIElKb2luR2FtZVJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIHNlbGVjdFJvbGUocmVxdWVzdDogSVNlbGVjdFJvbGVSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoTWV0aG9kLlNFTEVDVF9ST0xFLCBJU2VsZWN0Um9sZVJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIGFkZEFJKHJlcXVlc3Q6IElBZGRBSVJlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZChNZXRob2QuQUREX0FfSSwgSUFkZEFJUmVxdWVzdC5lbmNvZGUocmVxdWVzdCkudG9CdWZmZXIoKSk7XG4gIH1cblxuICBwdWJsaWMgc3RhcnRHYW1lKHJlcXVlc3Q6IElTdGFydEdhbWVSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoTWV0aG9kLlNUQVJUX0dBTUUsIElTdGFydEdhbWVSZXF1ZXN0LmVuY29kZShyZXF1ZXN0KS50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIHB1YmxpYyBzZWxlY3RUb3dlckRlZmVuc2UocmVxdWVzdDogSVNlbGVjdFRvd2VyRGVmZW5zZVJlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZChNZXRob2QuU0VMRUNUX1RPV0VSX0RFRkVOU0UsIElTZWxlY3RUb3dlckRlZmVuc2VSZXF1ZXN0LmVuY29kZShyZXF1ZXN0KS50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIHB1YmxpYyBzZWxlY3RNb25zdGVyQ2FyZChyZXF1ZXN0OiBJU2VsZWN0TW9uc3RlckNhcmRSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoTWV0aG9kLlNFTEVDVF9NT05TVEVSX0NBUkQsIElTZWxlY3RNb25zdGVyQ2FyZFJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIHNlbGVjdFBsYXllckNhcmQocmVxdWVzdDogSVNlbGVjdFBsYXllckNhcmRSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoTWV0aG9kLlNFTEVDVF9QTEFZRVJfQ0FSRCwgSVNlbGVjdFBsYXllckNhcmRSZXF1ZXN0LmVuY29kZShyZXF1ZXN0KS50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNjYXJkKHJlcXVlc3Q6IElEaXNjYXJkUmVxdWVzdCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKE1ldGhvZC5ESVNDQVJELCBJRGlzY2FyZFJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIGRyYXdDYXJkKHJlcXVlc3Q6IElEcmF3Q2FyZFJlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZChNZXRob2QuRFJBV19DQVJELCBJRHJhd0NhcmRSZXF1ZXN0LmVuY29kZShyZXF1ZXN0KS50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIHB1YmxpYyBlbmRUdXJuKHJlcXVlc3Q6IElFbmRUdXJuUmVxdWVzdCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKE1ldGhvZC5FTkRfVFVSTiwgSUVuZFR1cm5SZXF1ZXN0LmVuY29kZShyZXF1ZXN0KS50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGFydFR1cm4ocmVxdWVzdDogSVN0YXJ0VHVyblJlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZChNZXRob2QuU1RBUlRfVFVSTiwgSVN0YXJ0VHVyblJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIHVzZXJDaG9pY2UocmVxdWVzdDogSVVzZXJDaG9pY2VSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoTWV0aG9kLlVTRVJfQ0hPSUNFLCBJVXNlckNob2ljZVJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIGFwcGx5QXR0YWNrKHJlcXVlc3Q6IElBcHBseUF0dGFja1JlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZChNZXRob2QuQVBQTFlfQVRUQUNLLCBJQXBwbHlBdHRhY2tSZXF1ZXN0LmVuY29kZShyZXF1ZXN0KS50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIHB1YmxpYyBidXlBYmlsaXR5Q2FyZChyZXF1ZXN0OiBJQnV5QWJpbGl0eUNhcmRSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoTWV0aG9kLkJVWV9BQklMSVRZX0NBUkQsIElCdXlBYmlsaXR5Q2FyZFJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIGRpc2Nvbm5lY3QoKTogdm9pZCB7XG4gICAgdGhpcy5zb2NrZXQub25jbG9zZSA9ICgpID0+IHt9O1xuICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIGNhbGxNZXRob2QobWV0aG9kOiBNZXRob2QsIHJlcXVlc3Q6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICh0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSB0aGlzLnNvY2tldC5DTE9TRUQpIHtcbiAgICAgICAgcmVqZWN0KFwiQ29ubmVjdGlvbiBpcyBjbG9zZWRcIik7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgIT09IHRoaXMuc29ja2V0Lk9QRU4pIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmNhbGxNZXRob2QobWV0aG9kLCByZXF1ZXN0KS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdCksIDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbXNnSWQ6IFVpbnQ4QXJyYXkgPSBnZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoNCkpO1xuICAgICAgICB0aGlzLnNvY2tldC5zZW5kKG5ldyBVaW50OEFycmF5KFsuLi5uZXcgVWludDhBcnJheShbbWV0aG9kXSksIC4uLm1zZ0lkLCAuLi5yZXF1ZXN0XSkpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrc1tuZXcgRGF0YVZpZXcobXNnSWQuYnVmZmVyKS5nZXRVaW50MzIoMCldID0gcmVzb2x2ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIiwiZXhwb3J0IGVudW0gQ29ubmVjdGlvbkZhaWx1cmVUeXBlIHtcbiAgU1RBVEVfTk9UX0ZPVU5EID0gXCJTVEFURV9OT1RfRk9VTkRcIixcbiAgTk9fQVZBSUxBQkxFX1NUT1JFUyA9IFwiTk9fQVZBSUxBQkxFX1NUT1JFU1wiLFxuICBJTlZBTElEX1VTRVJfREFUQSA9IFwiSU5WQUxJRF9VU0VSX0RBVEFcIixcbiAgSU5WQUxJRF9TVEFURV9JRCA9IFwiSU5WQUxJRF9TVEFURV9JRFwiLFxuICBHRU5FUklDX0ZBSUxVUkUgPSBcIkdFTkVSSUNfRkFJTFVSRVwiLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbm5lY3Rpb25GYWlsdXJlIHtcbiAgdHlwZTogQ29ubmVjdGlvbkZhaWx1cmVUeXBlLFxuICBtZXNzYWdlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCB0cmFuc2Zvcm1Db29yZGluYXRvckZhaWx1cmUgPSAoZToge2NvZGU6IG51bWJlciwgcmVhc29uOiBzdHJpbmd9KTogQ29ubmVjdGlvbkZhaWx1cmUgID0+IHtcbiAgcmV0dXJuIHtcbiAgICBtZXNzYWdlOiBlLnJlYXNvbixcbiAgICB0eXBlOiAoZnVuY3Rpb24oY29kZSkge1xuICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgIGNhc2UgNDAwMDpcbiAgICAgICAgICByZXR1cm4gQ29ubmVjdGlvbkZhaWx1cmVUeXBlLlNUQVRFX05PVF9GT1VORDtcbiAgICAgICAgY2FzZSA0MDAxOlxuICAgICAgICAgIHJldHVybiBDb25uZWN0aW9uRmFpbHVyZVR5cGUuTk9fQVZBSUxBQkxFX1NUT1JFUztcbiAgICAgICAgY2FzZSA0MDAyOlxuICAgICAgICAgIHJldHVybiBDb25uZWN0aW9uRmFpbHVyZVR5cGUuSU5WQUxJRF9VU0VSX0RBVEE7XG4gICAgICAgIGNhc2UgNDAwMzpcbiAgICAgICAgICByZXR1cm4gQ29ubmVjdGlvbkZhaWx1cmVUeXBlLklOVkFMSURfU1RBVEVfSUQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIENvbm5lY3Rpb25GYWlsdXJlVHlwZS5HRU5FUklDX0ZBSUxVUkU7XG4gICAgICB9XG4gICAgfSkoZS5jb2RlKVxuICB9O1xufVxuIiwiaW1wb3J0IHsgRGVlcFBhcnRpYWwsIE5PX0RJRkYgfSBmcm9tIFwiLi4vLi4vYXBpL2Jhc2VcIjtcbmltcG9ydCAqIGFzIFQgZnJvbSBcIi4uLy4uL2FwaS90eXBlc1wiO1xuXG5mdW5jdGlvbiBwYXRjaENhcmRzKG9iajogQ2FyZHMsIHBhdGNoOiBEZWVwUGFydGlhbDxDYXJkcz4pIHtcbiAgaWYgKG9iai50eXBlICE9PSBwYXRjaC50eXBlKSB7XG4gICAgcmV0dXJuIHBhdGNoIGFzIENhcmRzO1xuICB9XG4gIGlmIChwYXRjaC50eXBlID09PSBcIkFiaWxpdHlDYXJkXCIgJiYgb2JqLnR5cGUgPT09IFwiQWJpbGl0eUNhcmRcIiAmJiBwYXRjaC52YWwgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoudmFsID0gcGF0Y2hBYmlsaXR5Q2FyZChvYmoudmFsLCBwYXRjaC52YWwpO1xuICB9XG4gIGlmIChwYXRjaC50eXBlID09PSBcIlRvd2VyRGVmZW5zZVwiICYmIG9iai50eXBlID09PSBcIlRvd2VyRGVmZW5zZVwiICYmIHBhdGNoLnZhbCAhPT0gTk9fRElGRikge1xuICAgIG9iai52YWwgPSBwYXRjaFRvd2VyRGVmZW5zZShvYmoudmFsLCBwYXRjaC52YWwpO1xuICB9XG4gIGlmIChwYXRjaC50eXBlID09PSBcIk1vbnN0ZXJDYXJkXCIgJiYgb2JqLnR5cGUgPT09IFwiTW9uc3RlckNhcmRcIiAmJiBwYXRjaC52YWwgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoudmFsID0gcGF0Y2hNb25zdGVyQ2FyZChvYmoudmFsLCBwYXRjaC52YWwpO1xuICB9XG4gIGlmIChwYXRjaC50eXBlID09PSBcIkxvY2F0aW9uQ2FyZFwiICYmIG9iai50eXBlID09PSBcIkxvY2F0aW9uQ2FyZFwiICYmIHBhdGNoLnZhbCAhPT0gTk9fRElGRikge1xuICAgIG9iai52YWwgPSBwYXRjaExvY2F0aW9uQ2FyZChvYmoudmFsLCBwYXRjaC52YWwpO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHBhdGNoRXJyb3JNZXNzYWdlKG9iajogVC5FcnJvck1lc3NhZ2UsIHBhdGNoOiBEZWVwUGFydGlhbDxULkVycm9yTWVzc2FnZT4pIHtcbiAgaWYgKHBhdGNoLnN0YXR1cyAhPT0gTk9fRElGRikge1xuICAgIG9iai5zdGF0dXMgPSBwYXRjaC5zdGF0dXM7XG4gIH1cbiAgaWYgKHBhdGNoLm1lc3NhZ2UgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoubWVzc2FnZSA9IHBhdGNoLm1lc3NhZ2U7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcGF0Y2hVc2VyUmVzcG9uc2Uob2JqOiBULlVzZXJSZXNwb25zZSwgcGF0Y2g6IERlZXBQYXJ0aWFsPFQuVXNlclJlc3BvbnNlPikge1xuICBpZiAocGF0Y2gudXNlckRhdGEgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoudXNlckRhdGEgPSBwYXRjaC51c2VyRGF0YTtcbiAgfVxuICBpZiAocGF0Y2guY2FyZFBsYXllZCAhPT0gTk9fRElGRikge1xuICAgIG9iai5jYXJkUGxheWVkID0gcGF0Y2hDYXJkcyhvYmouY2FyZFBsYXllZCwgcGF0Y2guY2FyZFBsYXllZCk7XG4gIH1cbiAgaWYgKHBhdGNoLnNlbGVjdGVkVXNlcnMgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouc2VsZWN0ZWRVc2VycyA9IHBhdGNoQXJyYXkob2JqLnNlbGVjdGVkVXNlcnMsIHBhdGNoLnNlbGVjdGVkVXNlcnMsIChhLCBiKSA9PiBiKTtcbiAgfVxuICBpZiAocGF0Y2guc2VsZWN0ZWRNb25zdGVycyAhPT0gTk9fRElGRikge1xuICAgIG9iai5zZWxlY3RlZE1vbnN0ZXJzID0gcGF0Y2hBcnJheShvYmouc2VsZWN0ZWRNb25zdGVycywgcGF0Y2guc2VsZWN0ZWRNb25zdGVycywgKGEsIGIpID0+IHBhdGNoTW9uc3RlckNhcmQoYSwgYikpO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHBhdGNoRWZmZWN0KG9iajogVC5FZmZlY3QsIHBhdGNoOiBEZWVwUGFydGlhbDxULkVmZmVjdD4pIHtcbiAgaWYgKHBhdGNoLnRhcmdldCAhPT0gTk9fRElGRikge1xuICAgIG9iai50YXJnZXQgPSBwYXRjaC50YXJnZXQ7XG4gIH1cbiAgaWYgKHBhdGNoLmNiICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLmNiID0gcGF0Y2guY2I7XG4gIH1cbiAgaWYgKHBhdGNoLnVzZXJQcm9tcHQgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoudXNlclByb21wdCA9IHBhdGNoLnVzZXJQcm9tcHQ7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcGF0Y2hNb25zdGVyQ2FyZChvYmo6IFQuTW9uc3RlckNhcmQsIHBhdGNoOiBEZWVwUGFydGlhbDxULk1vbnN0ZXJDYXJkPikge1xuICBpZiAocGF0Y2guVGl0bGUgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouVGl0bGUgPSBwYXRjaC5UaXRsZTtcbiAgfVxuICBpZiAocGF0Y2guSGVhbHRoICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLkhlYWx0aCA9IHBhdGNoLkhlYWx0aDtcbiAgfVxuICBpZiAocGF0Y2guRGFtYWdlICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLkRhbWFnZSA9IHBhdGNoLkRhbWFnZTtcbiAgfVxuICBpZiAocGF0Y2guTGV2ZWwgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouTGV2ZWwgPSBwYXRjaC5MZXZlbDtcbiAgfVxuICBpZiAocGF0Y2guQ2FyZFN0YXR1cyAhPT0gTk9fRElGRikge1xuICAgIG9iai5DYXJkU3RhdHVzID0gcGF0Y2guQ2FyZFN0YXR1cztcbiAgfVxuICBpZiAocGF0Y2guQWN0aXZlRWZmZWN0ICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLkFjdGl2ZUVmZmVjdCA9IHBhdGNoT3B0aW9uYWwob2JqLkFjdGl2ZUVmZmVjdCwgcGF0Y2guQWN0aXZlRWZmZWN0LCAoYSwgYikgPT4gcGF0Y2hFZmZlY3QoYSwgYikpO1xuICB9XG4gIGlmIChwYXRjaC5QYXNzaXZlRWZmZWN0ICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLlBhc3NpdmVFZmZlY3QgPSBwYXRjaE9wdGlvbmFsKG9iai5QYXNzaXZlRWZmZWN0LCBwYXRjaC5QYXNzaXZlRWZmZWN0LCAoYSwgYikgPT4gcGF0Y2hFZmZlY3QoYSwgYikpO1xuICB9XG4gIGlmIChwYXRjaC5SZXdhcmRzICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLlJld2FyZHMgPSBwYXRjaEVmZmVjdChvYmouUmV3YXJkcywgcGF0Y2guUmV3YXJkcyk7XG4gIH1cbiAgaWYgKHBhdGNoLlN0YXR1c0VmZmVjdHMgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouU3RhdHVzRWZmZWN0cyA9IHBhdGNoQXJyYXkob2JqLlN0YXR1c0VmZmVjdHMsIHBhdGNoLlN0YXR1c0VmZmVjdHMsIChhLCBiKSA9PiBiKTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBwYXRjaEFiaWxpdHlDYXJkKG9iajogVC5BYmlsaXR5Q2FyZCwgcGF0Y2g6IERlZXBQYXJ0aWFsPFQuQWJpbGl0eUNhcmQ+KSB7XG4gIGlmIChwYXRjaC5UaXRsZSAhPT0gTk9fRElGRikge1xuICAgIG9iai5UaXRsZSA9IHBhdGNoLlRpdGxlO1xuICB9XG4gIGlmIChwYXRjaC5DYXRhZ29yeSAhPT0gTk9fRElGRikge1xuICAgIG9iai5DYXRhZ29yeSA9IHBhdGNoLkNhdGFnb3J5O1xuICB9XG4gIGlmIChwYXRjaC5MZXZlbCAhPT0gTk9fRElGRikge1xuICAgIG9iai5MZXZlbCA9IHBhdGNoLkxldmVsO1xuICB9XG4gIGlmIChwYXRjaC5Db3N0ICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLkNvc3QgPSBwYXRjaC5Db3N0O1xuICB9XG4gIGlmIChwYXRjaC5BY3RpdmVFZmZlY3QgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouQWN0aXZlRWZmZWN0ID0gcGF0Y2hPcHRpb25hbChvYmouQWN0aXZlRWZmZWN0LCBwYXRjaC5BY3RpdmVFZmZlY3QsIChhLCBiKSA9PiBwYXRjaEVmZmVjdChhLCBiKSk7XG4gIH1cbiAgaWYgKHBhdGNoLlBhc3NpdmVFZmZlY3QgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouUGFzc2l2ZUVmZmVjdCA9IHBhdGNoT3B0aW9uYWwob2JqLlBhc3NpdmVFZmZlY3QsIHBhdGNoLlBhc3NpdmVFZmZlY3QsIChhLCBiKSA9PiBwYXRjaEVmZmVjdChhLCBiKSk7XG4gIH1cbiAgaWYgKHBhdGNoLkNhcmRTdGF0dXMgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouQ2FyZFN0YXR1cyA9IHBhdGNoLkNhcmRTdGF0dXM7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcGF0Y2hUb3dlckRlZmVuc2Uob2JqOiBULlRvd2VyRGVmZW5zZSwgcGF0Y2g6IERlZXBQYXJ0aWFsPFQuVG93ZXJEZWZlbnNlPikge1xuICBpZiAocGF0Y2guVGl0bGUgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouVGl0bGUgPSBwYXRjaC5UaXRsZTtcbiAgfVxuICBpZiAocGF0Y2guTGV2ZWwgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouTGV2ZWwgPSBwYXRjaC5MZXZlbDtcbiAgfVxuICBpZiAocGF0Y2guQWN0aXZlRWZmZWN0ICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLkFjdGl2ZUVmZmVjdCA9IHBhdGNoT3B0aW9uYWwob2JqLkFjdGl2ZUVmZmVjdCwgcGF0Y2guQWN0aXZlRWZmZWN0LCAoYSwgYikgPT4gcGF0Y2hFZmZlY3QoYSwgYikpO1xuICB9XG4gIGlmIChwYXRjaC5QYXNzaXZlRWZmZWN0ICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLlBhc3NpdmVFZmZlY3QgPSBwYXRjaE9wdGlvbmFsKG9iai5QYXNzaXZlRWZmZWN0LCBwYXRjaC5QYXNzaXZlRWZmZWN0LCAoYSwgYikgPT4gcGF0Y2hFZmZlY3QoYSwgYikpO1xuICB9XG4gIGlmIChwYXRjaC5DYXJkU3RhdHVzICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLkNhcmRTdGF0dXMgPSBwYXRjaC5DYXJkU3RhdHVzO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHBhdGNoTG9jYXRpb25DYXJkKG9iajogVC5Mb2NhdGlvbkNhcmQsIHBhdGNoOiBEZWVwUGFydGlhbDxULkxvY2F0aW9uQ2FyZD4pIHtcbiAgaWYgKHBhdGNoLlRpdGxlICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLlRpdGxlID0gcGF0Y2guVGl0bGU7XG4gIH1cbiAgaWYgKHBhdGNoLkxldmVsICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLkxldmVsID0gcGF0Y2guTGV2ZWw7XG4gIH1cbiAgaWYgKHBhdGNoLlREICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLlREID0gcGF0Y2guVEQ7XG4gIH1cbiAgaWYgKHBhdGNoLlNlcXVlbmNlICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLlNlcXVlbmNlID0gcGF0Y2guU2VxdWVuY2U7XG4gIH1cbiAgaWYgKHBhdGNoLkhlYWx0aCAhPT0gTk9fRElGRikge1xuICAgIG9iai5IZWFsdGggPSBwYXRjaC5IZWFsdGg7XG4gIH1cbiAgaWYgKHBhdGNoLkFjdGl2ZURhbWFnZSAhPT0gTk9fRElGRikge1xuICAgIG9iai5BY3RpdmVEYW1hZ2UgPSBwYXRjaC5BY3RpdmVEYW1hZ2U7XG4gIH1cbiAgaWYgKHBhdGNoLkFjdGl2ZUVmZmVjdCAhPT0gTk9fRElGRikge1xuICAgIG9iai5BY3RpdmVFZmZlY3QgPSBwYXRjaE9wdGlvbmFsKG9iai5BY3RpdmVFZmZlY3QsIHBhdGNoLkFjdGl2ZUVmZmVjdCwgKGEsIGIpID0+IHBhdGNoRWZmZWN0KGEsIGIpKTtcbiAgfVxuICBpZiAocGF0Y2guUGFzc2l2ZUVmZmVjdCAhPT0gTk9fRElGRikge1xuICAgIG9iai5QYXNzaXZlRWZmZWN0ID0gcGF0Y2hPcHRpb25hbChvYmouUGFzc2l2ZUVmZmVjdCwgcGF0Y2guUGFzc2l2ZUVmZmVjdCwgKGEsIGIpID0+IHBhdGNoRWZmZWN0KGEsIGIpKTtcbiAgfVxuICBpZiAocGF0Y2guQ2FyZFN0YXR1cyAhPT0gTk9fRElGRikge1xuICAgIG9iai5DYXJkU3RhdHVzID0gcGF0Y2guQ2FyZFN0YXR1cztcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBwYXRjaFBsYXllckRlY2tzKG9iajogVC5QbGF5ZXJEZWNrcywgcGF0Y2g6IERlZXBQYXJ0aWFsPFQuUGxheWVyRGVja3M+KSB7XG4gIGlmIChwYXRjaC5EZWNrICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLkRlY2sgPSBwYXRjaEFycmF5KG9iai5EZWNrLCBwYXRjaC5EZWNrLCAoYSwgYikgPT4gcGF0Y2hBYmlsaXR5Q2FyZChhLCBiKSk7XG4gIH1cbiAgaWYgKHBhdGNoLkRpc2NhcmQgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouRGlzY2FyZCA9IHBhdGNoQXJyYXkob2JqLkRpc2NhcmQsIHBhdGNoLkRpc2NhcmQsIChhLCBiKSA9PiBwYXRjaEFiaWxpdHlDYXJkKGEsIGIpKTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBwYXRjaFVJRXZlbnRzKG9iajogVC5VSUV2ZW50cywgcGF0Y2g6IERlZXBQYXJ0aWFsPFQuVUlFdmVudHM+KSB7XG4gIGlmIChwYXRjaC50eXBlICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLnR5cGUgPSBwYXRjaC50eXBlO1xuICB9XG4gIGlmIChwYXRjaC52YWx1ZSAhPT0gTk9fRElGRikge1xuICAgIG9iai52YWx1ZSA9IHBhdGNoLnZhbHVlO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHBhdGNoRXZlbnRzKG9iajogVC5FdmVudHMsIHBhdGNoOiBEZWVwUGFydGlhbDxULkV2ZW50cz4pIHtcbiAgaWYgKHBhdGNoLnVzZXIgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoudXNlciA9IHBhdGNoLnVzZXI7XG4gIH1cbiAgaWYgKHBhdGNoLmVmZmVjdCAhPT0gTk9fRElGRikge1xuICAgIG9iai5lZmZlY3QgPSBwYXRjaFVJRXZlbnRzKG9iai5lZmZlY3QsIHBhdGNoLmVmZmVjdCk7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcGF0Y2hQbGF5ZXIob2JqOiBULlBsYXllciwgcGF0Y2g6IERlZXBQYXJ0aWFsPFQuUGxheWVyPikge1xuICBpZiAocGF0Y2guSWQgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouSWQgPSBwYXRjaC5JZDtcbiAgfVxuICBpZiAocGF0Y2guU3RhdHVzRWZmZWN0cyAhPT0gTk9fRElGRikge1xuICAgIG9iai5TdGF0dXNFZmZlY3RzID0gcGF0Y2hBcnJheShvYmouU3RhdHVzRWZmZWN0cywgcGF0Y2guU3RhdHVzRWZmZWN0cywgKGEsIGIpID0+IGIpO1xuICB9XG4gIGlmIChwYXRjaC5QbGF5ZXJTdGF0ZSAhPT0gTk9fRElGRikge1xuICAgIG9iai5QbGF5ZXJTdGF0ZSA9IHBhdGNoLlBsYXllclN0YXRlO1xuICB9XG4gIGlmIChwYXRjaC5IZWFsdGggIT09IE5PX0RJRkYpIHtcbiAgICBvYmouSGVhbHRoID0gcGF0Y2guSGVhbHRoO1xuICB9XG4gIGlmIChwYXRjaC5BdHRhY2tQb2ludHMgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouQXR0YWNrUG9pbnRzID0gcGF0Y2guQXR0YWNrUG9pbnRzO1xuICB9XG4gIGlmIChwYXRjaC5BYmlsaXR5UG9pbnRzICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLkFiaWxpdHlQb2ludHMgPSBwYXRjaC5BYmlsaXR5UG9pbnRzO1xuICB9XG4gIGlmIChwYXRjaC5IYW5kICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLkhhbmQgPSBwYXRjaEFycmF5KG9iai5IYW5kLCBwYXRjaC5IYW5kLCAoYSwgYikgPT4gcGF0Y2hBYmlsaXR5Q2FyZChhLCBiKSk7XG4gIH1cbiAgaWYgKHBhdGNoLlJvbGUgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouUm9sZSA9IHBhdGNoLlJvbGU7XG4gIH1cbiAgaWYgKHBhdGNoLkxldmVsQm9udXMgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouTGV2ZWxCb251cyA9IHBhdGNoQXJyYXkob2JqLkxldmVsQm9udXMsIHBhdGNoLkxldmVsQm9udXMsIChhLCBiKSA9PiBwYXRjaEVmZmVjdChhLCBiKSk7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcGF0Y2hHYW1lU3RhdGUob2JqOiBULkdhbWVTdGF0ZSwgcGF0Y2g6IERlZXBQYXJ0aWFsPFQuR2FtZVN0YXRlPikge1xuICBpZiAocGF0Y2guZ2FtZUxldmVsICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLmdhbWVMZXZlbCA9IHBhdGNoLmdhbWVMZXZlbDtcbiAgfVxuICBpZiAocGF0Y2guZ2FtZUxvZyAhPT0gTk9fRElGRikge1xuICAgIG9iai5nYW1lTG9nID0gcGF0Y2hBcnJheShvYmouZ2FtZUxvZywgcGF0Y2guZ2FtZUxvZywgKGEsIGIpID0+IGIpO1xuICB9XG4gIGlmIChwYXRjaC5yb3VuZFNlcXVlbmNlICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLnJvdW5kU2VxdWVuY2UgPSBwYXRjaC5yb3VuZFNlcXVlbmNlO1xuICB9XG4gIGlmIChwYXRjaC5nYW1lU2VxdWVuY2UgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouZ2FtZVNlcXVlbmNlID0gcGF0Y2guZ2FtZVNlcXVlbmNlO1xuICB9XG4gIGlmIChwYXRjaC5hYmlsaXR5UGlsZSAhPT0gTk9fRElGRikge1xuICAgIG9iai5hYmlsaXR5UGlsZSA9IHBhdGNoQXJyYXkob2JqLmFiaWxpdHlQaWxlLCBwYXRjaC5hYmlsaXR5UGlsZSwgKGEsIGIpID0+IHBhdGNoQWJpbGl0eUNhcmQoYSwgYikpO1xuICB9XG4gIGlmIChwYXRjaC5hY3RpdmVNb25zdGVycyAhPT0gTk9fRElGRikge1xuICAgIG9iai5hY3RpdmVNb25zdGVycyA9IHBhdGNoQXJyYXkob2JqLmFjdGl2ZU1vbnN0ZXJzLCBwYXRjaC5hY3RpdmVNb25zdGVycywgKGEsIGIpID0+IHBhdGNoTW9uc3RlckNhcmQoYSwgYikpO1xuICB9XG4gIGlmIChwYXRjaC5sb2NhdGlvblBpbGUgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoubG9jYXRpb25QaWxlID0gcGF0Y2hPcHRpb25hbChvYmoubG9jYXRpb25QaWxlLCBwYXRjaC5sb2NhdGlvblBpbGUsIChhLCBiKSA9PiBwYXRjaExvY2F0aW9uQ2FyZChhLCBiKSk7XG4gIH1cbiAgaWYgKHBhdGNoLnRvd2VyRGVmZW5zZVBpbGUgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoudG93ZXJEZWZlbnNlUGlsZSA9IHBhdGNoQXJyYXkob2JqLnRvd2VyRGVmZW5zZVBpbGUsIHBhdGNoLnRvd2VyRGVmZW5zZVBpbGUsIChhLCBiKSA9PiBwYXRjaFRvd2VyRGVmZW5zZShhLCBiKSk7XG4gIH1cbiAgaWYgKHBhdGNoLnR1cm4gIT09IE5PX0RJRkYpIHtcbiAgICBvYmoudHVybiA9IHBhdGNoT3B0aW9uYWwob2JqLnR1cm4sIHBhdGNoLnR1cm4sIChhLCBiKSA9PiBiKTtcbiAgfVxuICBpZiAocGF0Y2gucGxheWVycyAhPT0gTk9fRElGRikge1xuICAgIG9iai5wbGF5ZXJzID0gcGF0Y2hBcnJheShvYmoucGxheWVycywgcGF0Y2gucGxheWVycywgKGEsIGIpID0+IHBhdGNoUGxheWVyKGEsIGIpKTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBwYXRjaEFycmF5PFQ+KGFycjogVFtdLCBwYXRjaDogKHR5cGVvZiBOT19ESUZGIHwgYW55KVtdLCBpbm5lclBhdGNoOiAoYTogVCwgYjogRGVlcFBhcnRpYWw8VD4pID0+IFQpIHtcbiAgcGF0Y2guZm9yRWFjaCgodmFsLCBpKSA9PiB7XG4gICAgaWYgKHZhbCAhPT0gTk9fRElGRikge1xuICAgICAgaWYgKGkgPj0gYXJyLmxlbmd0aCkge1xuICAgICAgICBhcnIucHVzaCh2YWwgYXMgVCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcnJbaV0gPSBpbm5lclBhdGNoKGFycltpXSwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpZiAocGF0Y2gubGVuZ3RoIDwgYXJyLmxlbmd0aCkge1xuICAgIGFyci5zcGxpY2UocGF0Y2gubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufVxuXG5mdW5jdGlvbiBwYXRjaE9wdGlvbmFsPFQ+KG9iajogVCB8IHVuZGVmaW5lZCwgcGF0Y2g6IGFueSwgaW5uZXJQYXRjaDogKGE6IFQsIGI6IERlZXBQYXJ0aWFsPFQ+KSA9PiBUKSB7XG4gIGlmIChwYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIGlmIChvYmogPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBwYXRjaCBhcyBUO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBpbm5lclBhdGNoKG9iaiwgcGF0Y2gpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlUGF0Y2goc3RhdGU6IFQuR2FtZVN0YXRlLCBwYXRjaDogRGVlcFBhcnRpYWw8VC5HYW1lU3RhdGU+KSB7XG4gIHJldHVybiBwYXRjaEdhbWVTdGF0ZShzdGF0ZSwgcGF0Y2gpO1xufVxuIiwiZXhwb3J0IGNsYXNzIEdhbWUge1xyXG4gICAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAgIG1vdW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7fVxyXG5cclxuICAgIGxlYXZpbmcoZWxlbWVudDogSFRNTEVsZW1lbnQpIHt9XHJcbn1cclxuIiwiZXhwb3J0IGNsYXNzIExvYmJ5IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICBtb3VudChlbGVtZW50OiBIVE1MRWxlbWVudCkge31cclxuXHJcbiAgICBsZWF2aW5nKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7fVxyXG59XHJcbiIsImltcG9ydCB7IEdhbWVTdGF0ZSB9IGZyb20gJy4uLy4uLy4uLy4uL2FwaS90eXBlcyc7XHJcbmltcG9ydCB7IEhhdGhvcmFDbGllbnQsIEhhdGhvcmFDb25uZWN0aW9uLCBVcGRhdGVBcmdzIH0gZnJvbSAnLi4vLi4vLi4vLmhhdGhvcmEvY2xpZW50JztcclxuXHJcbnR5cGUgRWxlbWVudEF0dHJpYnV0ZXMgPSB7XHJcbiAgICBJbm5lclRleHQ/OiBzdHJpbmc7XHJcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XHJcbiAgICBldmVudD86IHN0cmluZztcclxuICAgIGV2ZW50Q0I/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0O1xyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIExvZ2luIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICBtb3VudChlbGVtZW50OiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGNvbnN0IG15RGl2ID0gdGhpcy5jcmVhdGVFbGVtZW50KCdkaXYnLCBlbGVtZW50LCB7IGNsYXNzTmFtZTogJ0hlYWRlcicgfSk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVFbGVtZW50KCdoMScsIG15RGl2LCB7IElubmVyVGV4dDogJ0xvZ2luIFBhZ2UnLCBjbGFzc05hbWU6ICdMb2dpblBhZ2VoZWFkZXInIH0pO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlRWxlbWVudCgnYnV0dG9uJywgZWxlbWVudCwgeyBJbm5lclRleHQ6ICdMb2dpbicsIGNsYXNzTmFtZTogJ2xvZ2luQnV0dG9uJywgZXZlbnQ6ICdjbGljaycsIGV2ZW50Q0I6IHRoaXMubG9naW4gfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlRWxlbWVudCh0eXBlOiBzdHJpbmcsIHBhcmVudDogSFRNTEVsZW1lbnQsIGF0dHJpYnV0ZXM6IEVsZW1lbnRBdHRyaWJ1dGVzKTogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGNvbnN0IG15RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XHJcbiAgICAgICAgbXlFbGVtZW50LmlubmVySFRNTCA9IGF0dHJpYnV0ZXMuSW5uZXJUZXh0ID8gYXR0cmlidXRlcy5Jbm5lclRleHQgOiAnJztcclxuICAgICAgICBpZiAoYXR0cmlidXRlcy5jbGFzc05hbWUpIG15RWxlbWVudC5jbGFzc0xpc3QuYWRkKGF0dHJpYnV0ZXMuY2xhc3NOYW1lKTtcclxuICAgICAgICBpZiAoYXR0cmlidXRlcy5ldmVudCAmJiBhdHRyaWJ1dGVzLmV2ZW50Q0IpIHtcclxuICAgICAgICAgICAgbXlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYXR0cmlidXRlcy5ldmVudCwgYXR0cmlidXRlcy5ldmVudENCKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChteUVsZW1lbnQpO1xyXG4gICAgICAgIHJldHVybiBteUVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgbG9naW4oKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYEhlcmVgKTtcclxuICAgIH1cclxuXHJcbiAgICBsZWF2aW5nKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7fVxyXG59XHJcbiIsIi8qIChpZ25vcmVkKSAqLyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiaW1wb3J0ICcuL3N0eWxlLmNzcyc7XHJcbmltcG9ydCB7IExvZ2luIH0gZnJvbSAnLi9zY2VuZXMvTG9naW4nO1xyXG5pbXBvcnQgeyBMb2JieSB9IGZyb20gJy4vc2NlbmVzL0xvYmJ5JztcclxuaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vc2NlbmVzL0dhbWUnO1xyXG5pbXBvcnQgeyBHYW1lU3RhdGUgfSBmcm9tICcuLi8uLi8uLi9hcGkvdHlwZXMnO1xyXG5pbXBvcnQgeyBIYXRob3JhQ2xpZW50LCBIYXRob3JhQ29ubmVjdGlvbiwgVXBkYXRlQXJncyB9IGZyb20gJy4uLy4uLy5oYXRob3JhL2NsaWVudCc7XHJcblxyXG5lbnVtIEdTIHtcclxuICAgIG51bGwsXHJcbiAgICBsb2dpbixcclxuICAgIGxvYmJ5LFxyXG4gICAgZ2FtZSxcclxufVxyXG5cclxuY29uc3QgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdteUFwcCcpO1xyXG5cclxuY29uc3QgbG9naW5zY3JlZW4gPSBuZXcgTG9naW4oKTtcclxuY29uc3QgbG9iYnkgPSBuZXcgTG9iYnkoKTtcclxuY29uc3QgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbmxldCBteUdhbWVTdGF0ZTogR1MgPSBHUy5udWxsO1xyXG5cclxuY29uc3QgY2xpZW50ID0gbmV3IEhhdGhvcmFDbGllbnQoKTtcclxuXHJcbmNvbnN0IHJlUmVuZGVyID0gKHN0YXRlOiBHUywgZ3M6IEdTKSA9PiB7XHJcbiAgICBpZiAoc3RhdGUgPT0gZ3MpIHJldHVybjtcclxuICAgIHN3aXRjaCAoZ3MpIHtcclxuICAgICAgICBjYXNlIEdTLmxvYmJ5OlxyXG4gICAgICAgICAgICBpZiAoc3RhdGUgPT0gR1MubG9naW4pIGxvZ2luc2NyZWVuLmxlYXZpbmcoYm9keSk7XHJcbiAgICAgICAgICAgIGVsc2UgZ2FtZS5sZWF2aW5nKGJvZHkpO1xyXG4gICAgICAgICAgICBteUdhbWVTdGF0ZSA9IEdTLmxvYmJ5O1xyXG4gICAgICAgICAgICBsb2JieS5tb3VudChib2R5KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBHUy5sb2dpbjpcclxuICAgICAgICAgICAgaWYgKHN0YXRlID09IEdTLmxvYmJ5KSBsb2JieS5sZWF2aW5nKGJvZHkpO1xyXG4gICAgICAgICAgICBlbHNlIGdhbWUubGVhdmluZyhib2R5KTtcclxuICAgICAgICAgICAgbXlHYW1lU3RhdGUgPSBHUy5sb2dpbjtcclxuICAgICAgICAgICAgbG9naW5zY3JlZW4ubW91bnQoYm9keSk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEdTLmdhbWU6XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PSBHUy5sb2JieSkge1xyXG4gICAgICAgICAgICAgICAgbG9iYnkubGVhdmluZyhib2R5KTtcclxuICAgICAgICAgICAgICAgIC8vY2FuJ3QganVtcCBmcm9tIGxvZ2luIHRvIGdhbWVcclxuICAgICAgICAgICAgICAgIG15R2FtZVN0YXRlID0gR1MuZ2FtZTtcclxuICAgICAgICAgICAgICAgIGdhbWUubW91bnQoYm9keSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vL2luaXRpYWxcclxucmVSZW5kZXIobXlHYW1lU3RhdGUsIEdTLmxvZ2luKTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9