'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var ky = _interopDefault(require('ky'));
var uuid = require('uuid');

var PAYLOAD_TYPES = {
    HTML: 'html',
    INFO: 'info',
    CUSTOM: 'custom'
};

var AVAILABLE_EVENTS = ['click', 'focus', 'hover', 'blur'];
var AVAILABLE_TARGETS = ['button', 'input', 'textarea'];
var AVAILABLE_PAYLOADS = Object.values(PAYLOAD_TYPES);

var isTargetAvailable = function (templateString) {
    return AVAILABLE_TARGETS.includes(templateString);
};
var isInputElement = function (t) { return t instanceof HTMLInputElement; };
var isButtonElement = function (t) { return t instanceof HTMLButtonElement; };
var getNodes = function (_a) {
    var node = _a.node, targets = _a.targets;
    return targets.flatMap(function (target) { return Array.from(node.querySelectorAll(target)); });
};
var subscribeNodes = function (_a) {
    var nodes = _a.nodes, events = _a.events, listener = _a.listener;
    var subscribed = [];
    nodes.forEach(function (node) {
        events.forEach(function (event) {
            var eventListener = function (e) { return listener(e); };
            node.addEventListener(event, eventListener);
            subscribed.push({
                node: node,
                event: event,
                listener: eventListener
            });
        });
    });
    return subscribed;
};
var unsubscribeNodes = function (subscribed) {
    subscribed.forEach(function (_a) {
        var node = _a.node, event = _a.event, listener = _a.listener;
        return node.removeEventListener(event, listener);
    });
};

var post = function (url, options) { return ky.post(url, options).json(); };

var getLocalStorageUuid = function () {
    var currentUuid = localStorage.getItem('__uuid');
    if (currentUuid) {
        return currentUuid;
    }
    var newUuid = uuid.v4();
    localStorage.setItem('__uuid', newUuid);
    return newUuid;
};
var getSessionStorageUuid = function () {
    var currentUuid = sessionStorage.getItem('__uuid');
    if (currentUuid) {
        return currentUuid;
    }
    var newUuid = uuid.v4();
    sessionStorage.setItem('__uuid', newUuid);
    return newUuid;
};
var getRuntimeUuid = function () { return uuid.v4(); };

var isEventAvailable = function (templateString) {
    return AVAILABLE_EVENTS.includes(templateString);
};
var createUserEvent = function (_a) {
    var _b;
    var eventType = _a.eventType, tag = _a.tag, className = _a.className, name = _a.name, targetType = _a.targetType, dataset = _a.dataset, coordinates = _a.coordinates;
    var targetClassName = className ? "." + className : '';
    var parsedDataset = Object.keys(dataset).reduce(function (acc, current) { return (acc += "[data-" + current + "=\"" + dataset[current] + "\"]"); }, '');
    var result = (_b = {},
        _b[eventType] = "" + tag + targetClassName + "[type=\"" + targetType + "\"][name=\"" + name + "\"]" + parsedDataset,
        _b);
    if (coordinates) {
        Object.assign(result, { coordinates: coordinates });
    }
    return result;
};
var createEventCreator = function (additionalData) { return function (_a) {
    var event = _a.event, eventType = _a.eventType;
    return ({
        runtimeUUID: getRuntimeUuid(),
        sessionStorageUUID: getSessionStorageUuid(),
        localStorageUUID: getLocalStorageUuid(),
        timestamp: Date.now(),
        additionalData: additionalData,
        events: [
            {
                incrementalId: 1,
                timestamp: Date.now(),
                eventType: eventType,
                data: event
            },
        ]
    });
}; };
var sendEvent = function (apiUrl) { return function (payload) {
    if (localStorage.getItem('logging')) {
        console.log(payload);
    }
    if (apiUrl) {
        post(apiUrl, { json: payload });
    }
}; };
var createSenders = function (_a) {
    var additionalData = _a.additionalData, endpoint = _a.endpoint;
    var createEvent = createEventCreator(additionalData);
    var send = sendEvent(endpoint);
    var sendInfo = function (payload) { return send(createEvent({ event: payload, eventType: PAYLOAD_TYPES.INFO })); };
    var sendHtml = function (payload) { return send(createEvent({ event: payload, eventType: PAYLOAD_TYPES.HTML })); };
    var sendCustom = function (payload) {
        return send(createEvent({ event: payload, eventType: PAYLOAD_TYPES.CUSTOM }));
    };
    return { sendInfo: sendInfo, sendHtml: sendHtml, sendCustom: sendCustom };
};

var loadPageListener = function (_a) {
    var send = _a.send;
    send({ page_opened: window.location.href });
    send({ window_current_resolution: document.body.scrollWidth + "x" + document.body.scrollHeight });
    send({ screen_available_resolution: window.screen.availWidth + "x" + window.screen.availHeight });
    send({ platform: "" + window.navigator.platform });
    send({ user_agent: "" + window.navigator.userAgent });
};
var unloadPageListener = function (_a) {
    var send = _a.send;
    return send({ page_closed: window.location.href });
};
var createListener = function (_a) {
    var send = _a.send;
    return function (event) {
        if (event.target && (isInputElement(event.target) || isButtonElement(event.target))) {
            var data = {
                eventType: event.type,
                tag: event.target.tagName.toLowerCase(),
                name: event.target.name,
                targetType: event.target.type,
                className: event.target.className,
                dataset: event.target.dataset
            };
            if (event instanceof MouseEvent) {
                Object.assign(data, {
                    coordinates: {
                        x: event.clientX,
                        y: event.clientY
                    }
                });
            }
            send(createUserEvent(data));
        }
    };
};
var createListeners = function (_a) {
    var sendInfo = _a.sendInfo, sendHtml = _a.sendHtml;
    var loadPage = function () { return loadPageListener({ send: sendInfo }); };
    var unloadPage = function () { return unloadPageListener({ send: sendInfo }); };
    var listener = createListener({ send: sendHtml });
    window.addEventListener('load', loadPage);
    window.addEventListener('onbeforeunload', unloadPage);
    return { loadPage: loadPage, unloadPage: unloadPage, listener: listener };
};

var createObserver = function (_a) {
    var targets = _a.targets, events = _a.events, listener = _a.listener;
    var subscribed = [];
    var observer = new MutationObserver(function (mutationsList) {
        mutationsList
            .filter(function (mutation) { return mutation.type === 'childList'; })
            .flatMap(function (mutation) { return Array.from(mutation.addedNodes); })
            .filter(function (node) { return node instanceof Element; })
            .forEach(function (node) {
            var nodes = getNodes({ node: node, targets: targets });
            var subscribedNodes = subscribeNodes({ nodes: nodes, events: events, listener: listener });
            subscribed.push.apply(subscribed, subscribedNodes);
        });
    });
    observer.observe(document, { childList: true, subtree: true });
    return { observer: observer, subscribed: subscribed };
};
var unsubscribeObserver = function (_a) {
    var observer = _a.observer, subscribed = _a.subscribed, loadPage = _a.loadPage, unloadPage = _a.unloadPage;
    window.removeEventListener('load', loadPage);
    window.removeEventListener('onbeforeunload', unloadPage);
    unsubscribeNodes(subscribed);
    observer.disconnect();
};

var tracker = function (_a) {
    var _b = _a.targets, targets = _b === void 0 ? ['button'] : _b, _c = _a.events, events = _c === void 0 ? ['click'] : _c, _d = _a.additionalData, additionalData = _d === void 0 ? undefined : _d, _e = _a.endpoint, endpoint = _e === void 0 ? undefined : _e;
    var configTargets = targets.filter(isTargetAvailable);
    var configEvents = events.filter(isEventAvailable);
    var _f = createSenders({ additionalData: additionalData, endpoint: endpoint }), sendInfo = _f.sendInfo, sendHtml = _f.sendHtml, sendCustom = _f.sendCustom;
    var _g = createListeners({ sendInfo: sendInfo, sendHtml: sendHtml }), loadPage = _g.loadPage, unloadPage = _g.unloadPage, listener = _g.listener;
    var _h = createObserver({ targets: configTargets, events: configEvents, listener: listener }), observer = _h.observer, subscribed = _h.subscribed;
    var unsubscribe = function () { return unsubscribeObserver({ observer: observer, subscribed: subscribed, loadPage: loadPage, unloadPage: unloadPage, listener: listener }); };
    return { send: sendCustom, unsubscribe: unsubscribe };
};

exports.tracker = tracker;
