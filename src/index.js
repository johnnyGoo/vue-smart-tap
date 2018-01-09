/**
 * Created by johnny on 2017/12/25.
 */
const VueSmartTap = {};

const isPc = function () {
    var uaInfo = navigator.userAgent;
    var agents = ["Android", "iPhone", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var i = 0; i < agents.length; i++) {
        if (uaInfo.indexOf(agents[i]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}()

function isTap(self, long) {
    if (self.disabled) {
        return false;
    }


    let tapObj = self.tapObj;

    if (tapObj.long === true) {
        if (tapObj.option.remain <= 0) {
            return false
        } else {
            tapObj.option.remain -= 1
        }
    }

    let maxtime = long === true ? 3600000 : tapObj.option.time


    return self.time <= maxtime && Math.abs(tapObj.distanceX) < 10 && Math.abs(tapObj.distanceY) < 10;
}

function touchstart(e, self) {
    let tapObj = self.tapObj;
    tapObj.e = e;
    if (e.type === 'touchstart') {
        let touches = e.touches[0];
        tapObj.pageX = touches.pageX;
        tapObj.pageY = touches.pageY;
        tapObj.clientX = touches.clientX;
        tapObj.clientY = touches.clientY;

    } else {
        tapObj.pageX = e.pageX;
        tapObj.pageY = e.pageY;
        tapObj.clientX = e.clientX;
        tapObj.clientY = e.clientY;
    }
    tapObj.distanceX = 0
    tapObj.distanceY = 0
    self.time = +new Date();
    if (tapObj.long === true) {
        tapObj.iv = setInterval(longTap, tapObj.option.longTime, e, self);
    }
}


function touchmove(e, self) {
    let tapObj = self.tapObj;
    tapObj.e = e;
    if (!isPc) {
        let touches = e.changedTouches[0];
        tapObj.distanceX = tapObj.pageX - touches.pageX;
        tapObj.distanceY = tapObj.pageY - touches.pageY;
    } else {
        tapObj.distanceX = tapObj.pageX - e.pageX;
        tapObj.distanceY = tapObj.pageY - e.pageY;
    }
}

function longTap(e, self) {

    let tapObj = self.tapObj;
    self.time = +new Date() - self.time;

    if (!isTap(self, tapObj.long)) return;
    self.time = +new Date()
    self.handler(tapObj.e);
}

function touchend(e, self) {
    let tapObj = self.tapObj;
    if (tapObj.long === true) {
        setInterval(tapObj.iv);
        return;
    }


    if (e.type === 'touchend') {
        let touches = e.changedTouches[0];
        tapObj.distanceX = tapObj.pageX - touches.pageX;
        tapObj.distanceY = tapObj.pageY - touches.pageY;
    } else {
        tapObj.distanceX = tapObj.pageX - e.pageX;
        tapObj.distanceY = tapObj.pageY - e.pageY;
    }
    self.time = +new Date() - self.time;
    if (!isTap(self, tapObj.long)) return;
    self.handler(e);
}

function extend(obj) {
    let length = arguments.length;
    obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (let index = 1; index < length; index++) {
        let source = arguments[index]
        for (let key in source) {
            obj[key] = source[key];
        }
    }
    return obj
}

VueSmartTap.install = function (Vue, option) {

    let _option = extend({time: 300, longTime: 1000, count: 1}, option)

    Vue.directive('tap', {
        bind: function (el, binding) {
            el.tapObj = {long: binding.arg === 'long', option: extend({remain: _option.count}, _option)};
            if (el.tapObj.long === true) {
                el.style['user-select'] = 'none'
                el.style['-webkit-user-select'] = 'none'
                el.style['-ms-user-select'] = 'none'
            }


            el.handler = function (e) { //This directive.handler
                var value = binding.value;
                if (!value && el.href && !binding.modifiers.prevent) {
                    return window.location = el.href;
                }
                value.event = e;
                var tagName = value.event.target.tagName.toLocaleLowerCase();
                !isPc ? value.tapObj = el.tapObj : null;
                if (tagName === 'input' || tagName === 'textarea') {
                    return value.event.target.focus();
                }

                binding.value.call(this, e);
            };
            let start, end, move
            if (isPc) {
                start = 'mousedown'
                move = 'mousemove'
                end = 'mouseup'
            } else {
                start = 'touchstart'
                move = 'touchmove'
                end = 'touchend'
            }

            el.addEventListener(start, function (e) {
                touchstart(e, el);
            }, false);
            el.addEventListener(move, function (e) {
                touchmove(e, el);
            }, false);


            el.addEventListener(end, function (e) {

                try {
                    Object.defineProperty(e, 'currentTarget', {// 重写currentTarget对象 与jq相同
                        value: el,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    })
                } catch (e) {
                    e.currentTarget = el
                }
                e.preventDefault();

                return touchend(e, el);
            }, false);


        },
        componentUpdated: function (el, binding) {

            el.tapObj = {};
            el.handler = function (e) { //This directive.handler
                var value = binding.value;
                if (!value && el.href && !binding.modifiers.prevent) {
                    return window.location = el.href;
                }
                value.event = e;
                !isPc ? value.tapObj = el.tapObj : null;
                binding.value.call(this.e);
            };
        },
        unbind: function (el) {
            // 卸载，别说了都是泪
            el.handler = function () {
            };
        }
    });
};

// Why don't you export default?
// https://github.com/webpack/webpack/issues/3560
export default VueSmartTap
export {VueSmartTap}