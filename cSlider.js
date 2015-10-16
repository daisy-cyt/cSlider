/**
 * @file 封装silder插件
 * @author chenyuting02(chenyuting02@baidu.com)
 */
(function () {
    // 插件初始化方法
    function CSlider() {
        return this.init.apply(this, arguments);
    }
    CSlider.prototype = (function () {
        var defaults = {
            /**
             * 轮播窗口
             *
             * @type {Object}
             * @private
             */
            $viewport: null,
            /**
             * 外部导航
             *
             * @type {Object}
             * @private
             */
            $directorsNav: null,
            /**
             * 下一页按钮
             *
             * @type {Object}
             * @private
             */
            $btnNext: null,
            /**
             * 上一页按钮
             *
             * @type {Object}
             * @private
             */
            $btnPrev: null,
            /**
             * 是否自动轮播
             *
             * @type {boolean}
             * @private
             */
            autoStart: true,
            /**
             * 是否显示圆点导航
             *
             * @type {boolean}
             * @private
             */
            dotNav: true,
            /**
             * 高亮当前导航样式名称
             *
             * @type {string}
             * @private
             */
            navActiveClass: '',
            /**
             * 轮播速度
             *
             * @type {number}
             * @private
             */
            interval: 4000
        };
        return {
            /**
             * 初始设置对象
             *
             * @type {Object}
             * @private
             */
            settings: null,
            /**
             * 存储轮播li对象的数组
             *
             * @type {Array}
             * @private
             */
            liArray: [],
            /**
             * 视窗宽度
             *
             * @type {Number}
             * @private
             */
            width: '',
            /**
             * 视窗高度
             *
             * @type {Number}
             * @private
             */
            height: '',
            /**
             * 当前轮播对象索引值
             *
             * @type {Number}
             * @private
             */
            indexNow: 0,

            /**
             * 初始化函数
             *
             * @param {Object} options 初始化值集合
             * @private
             */
            init: function (options) {
                this.settings = $.extend({}, defaults, options);
                this.setDefault();
                this.bindEvent();
                if (this.settings.autoStart) {
                    this.start();
                }
                if (this.settings.dotNav) {
                    this.buildDotNav();
                    this.bindDotEvent();
                }
            },

            /**
             * 初始化设置，在viewport下增加一层相对定位的div
             *
             * @private
             */
            setDefault: function () {
                var that = this;
                var viewport = this.settings.$viewport;
                this.width = viewport.width();
                this.height = viewport.height();
                this.$ul = viewport.children('ul');
                // 循环将li加入数组并设置其宽度
                this.$ul.children('li').each(function () {
                    that.liArray.push($(this));
                    $(this).css({width: that.width, height: that.height});
                });
                this.$ul.css({width: this.width * this.liArray.length, height: this.height});
                this.$port = $('<div class="relativePort" style="position: relative"></div>').append(this.$ul);
                viewport.append(this.$port);
            },

            /**
             * 构造轮播自带导航
             *
             * @private
             */
            buildDotNav: function () {
                var sliderdotLi = '';
                for (var i = 0; i < this.liArray.length; i++) {
                    if (i === 0) {
                        sliderdotLi += '<li><a class="slider-dot-active"></a></li>';
                    }
                    else {
                        sliderdotLi += '<li><a></a></li>';
                    }
                }
                var sliderdot = $('<div class="slider-nav-dot"></div>').html('<ul>' + sliderdotLi + '</ul>');
                this.$port.append(sliderdot);
            },

            /**
             * 为轮播自带导航绑定事件
             *
             * @private
             */
            bindDotEvent: function () {
                var that = this;
                $('.slider-nav-dot').find('a').each(function (index) {
                    $(this).unbind('click').bind('click', function () {
                        if ($('.slider-nav-dot').find('a').index(this) !== that.currentIndex) {
                            that.highlightCurrent($(this), $('.slider-nav-dot').find('a'), 'slider-dot-active');
                            that.slideTo(index);
                            that.currentIndex = index;
                        }
                    });
                });
            },

            /**
             * 外部导航事件绑定以及下一页上一页事件绑定
             *
             * @private
             */
            bindEvent: function () {
                var that = this;
                if (this.settings.$btnNext != null) {
                    this.settings.$btnNext.click(function () {
                        that.slideNext();
                    });
                }
                if (this.settings.$btnPrev != null) {
                    this.settings.$btnPrev.click(function () {
                        that.slidePrev();
                    });
                }
                if (this.settings.$directorsNav != null) {
                    this.settings.$directorsNav.find('a').each(function (index) {
                        $(this).unbind('click').bind('click', function () {
                            if (that.settings.$directorsNav.find('a').index(this) !== that.currentIndex) {
                                that.highlightCurrent($(this), that.settings.$directorsNav.find('a'),
                                    that.settings.navActiveClass);
                                that.slideTo(index);
                                that.currentIndex = index;
                            }
                        });
                    });
                    this.hoverAutoStart(this.settings.$directorsNav);
                }
                this.hoverAutoStart(this.settings.$viewport);
            },

            /**
             * 鼠标hover时暂停自动轮播
             *
             * @param {Object} dom 鼠标hover的dom元素
             * @private
             */
            hoverAutoStart: function (dom) {
                var that = this;
                if (this.settings.autoStart) {
                    dom.hover(function () {
                        that.stop();
                    }, function () {
                        that.start();
                    });
                }
            },

            // 停止自动轮播
            stop: function () {
                clearInterval(this.internaler);
                this.timer = false;
            },

            // 开启自动轮播
            start: function () {
                var that = this;
                this.internaler = setInterval(function () {
                    that.slideNext();
                }, that.settings.interval);
                that.timer = true;
            },

            /**
             * 轮播到指定页
             *
             * @param {number} index 指定页索引
             * @return {Object} 返回deferred对象
             */
            slideTo: function (index) {
                // 通过将欲展现的li每次都移动到当前li后来实现循环轮播
                var dtd = $.Deferred;
                var dtdtmp = dtd();
                var that = this;
                this.indexNow = index;
                // 滚动时同时高亮当前导航
                if (this.settings.$directorsNav != null) {
                    this.highlightCurrent(this.settings.$directorsNav.find('a').eq(index),
                        this.settings.$directorsNav.find('a'), this.settings.navActiveClass);
                }
                if (this.settings.dotNav) {
                    this.highlightCurrent($('.slider-nav-dot ul').find('a').eq(index),
                        $('.slider-nav-dot ul').find('a'), 'slider-dot-active');
                }
                this.$ul.css({'margin-left': '0px'}).children('li').first().after(this.liArray[index]);
                this.$ul.animate({'margin-left': -this.width + 'px'}, 'slow', 'swing', function () {
                    that.liArray[index].after(that.$ul.children('li').first());
                    that.$ul.css({'margin-left': '0px'});
                    dtdtmp.resolve();
                });
                return dtdtmp.promise();
            },

            /**
             * 高亮当前元素
             *
             * @param {Object} addDom 欲添加样式的元素
             * @param {Object} removeDom 欲移除样式的元素
             * @param {string} className 样式名称
             * @private
             */
            highlightCurrent: function (addDom, removeDom, className) {
                removeDom.removeClass(className);
                addDom.addClass(className);
            },

            /**
             * 轮播到下一页
             *
             * @return {Function} 返回slideTo方法从而返回deferred对象
             */
            slideNext: function () {
                var indexNext = this.indexNow + 1;
                if (indexNext > this.liArray.length - 1) {
                    indexNext = 0;
                }
                return this.slideTo(indexNext);
            },

            /**
             * 轮播到上一页
             *
             * @return {Function} 返回slideTo方法从而返回deferred对象
             */
            slidePrev: function () {
                var indexNext = this.indexNow - 1;
                if (indexNext < 0) {
                    indexNext = this.liArray.length - 1;
                }
                return this.slideTo(indexNext);
            }
        };
    })();
    // 封装成jQuery插件
    $.extend({cSlider: function (options) {
        return new CSlider(options);
    }});
})();
