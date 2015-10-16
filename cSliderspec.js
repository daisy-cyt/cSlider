/**
 * @file cSlider插件单测文件
 * @author chenyuting02(chenyuting02@baidu.com)
 */
$(function () {
    // 初始化cSlider对象
    var cSlider = $.cSlider({
        $viewport: $('.slider-viewport'),
        $directorsNav: $('.slider-nav'),
        autoStart: true,
        dotNav: true,
        navActiveClass: 'slider-active',
        interval: 4000
    });

    /**
     * 测试的描述。
     *
     * @param {string} partial 测试描述的细节部分。
     * @return {string} 返回整个测试描述。
     */
    function getDescribe(partial) {
        return 'cSlider Test - ' + partial + ': ';
    }

    // 测试cSlider中li的初始化操作
    describe(getDescribe('initial cSlider'), function () {
        // 测试添加li到容器中并设置容器的初始宽度
        it('can set initial value of container', function () {
            var expLength = cSlider.$ul.children('li').length;
            var expWidth = cSlider.$port.width() * expLength;
            expect(expLength).toEqual(cSlider.liArray.length);
            expect(expWidth).toEqual(cSlider.$ul.width());
        });
        // 测试构建dot导航
        it('can build dot nav', function () {
            var exp = cSlider.$port.find('.slider-nav-dot').length;
            expect(exp).toBeGreaterThan(0);
        });
        // 测试为dot导航绑定事件
        it('can bind click event to dot nav', function () {
            var exp = $._data($('.slider-nav-dot').find('a')[0], 'events');
            expect(exp).toBeTruthy();
        });
    });
    // 测试轮播相关事件
    describe(getDescribe('slide'), function () {
        // 测试停止轮播操作
        it('can stop sliding', function () {
            cSlider.stop();
            var exp = cSlider.timer;
            expect(exp).toBeFalsy();
        });
        // 测试开始轮播操作
        it('can start sliding', function () {
            cSlider.start();
            var exp = cSlider.timer;
            expect(exp).toBeTruthy();
        });
        // 测试跳转到指定的slide
        it('can slide to specific slide', function (done) {
            var expSlide = 2;
            $.when(cSlider.slideTo(expSlide)).done(function () {
                expect(expSlide).toEqual(parseInt(cSlider.$ul.children('li').first().attr('data-index'), 10));
                var expNav = cSlider.settings.$directorsNav.find('a')
                .eq(expSlide).hasClass(cSlider.settings.navActiveClass);
                expect(expNav).toBeTruthy();
                done();
            });
        });
        // 测试跳转到下一个slide
        it('can slide to next slide', function (done) {
            var currentSlide = parseInt(cSlider.$ul.children('li').first().attr('data-index'), 10);
            var indexNext = currentSlide + 1;
            if (indexNext > cSlider.liArray.length - 1) {
                indexNext = 0;
            }
            $.when(cSlider.slideNext()).done(function () {
                var nextSlide = parseInt(cSlider.$ul.children('li').first().attr('data-index'), 10);
                expect(indexNext).toEqual(nextSlide);
                done();
            });
        });
        // 测试跳转到上一个slide
        it('can slide to preview slide', function (done) {
            var currentSlide = parseInt(cSlider.$ul.children('li').first().attr('data-index'), 10);
            var indexPrev = currentSlide - 1;
            if (indexPrev < 0) {
                indexPrev = cSlider.liArray.length - 1;
            }
            $.when(cSlider.slidePrev()).done(function () {
                var prevSlide = parseInt(cSlider.$ul.children('li').first().attr('data-index'), 10);
                expect(indexPrev).toEqual(prevSlide);
                done();
            });
        });
    });

});
