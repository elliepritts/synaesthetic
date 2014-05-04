var GAME = (function() {
    var state = [0, 0],
        levels = ['vic'],
        guesses = [],
        answers = {
            'chicago': [[31,23,40]],
            'vic': [[101,99,112]]
        },

        _scaleSVG = function() {
            $('#level svg').each(function() {
                var i = $(this), w = i.attr('width'), h = i.attr('height'), cw = i.parents('#level').width();
                i.css({width: cw, height: Math.floor(h / (w / cw))});
            });
        },

        _successMessage = function() {
            var messages = [
                'nice one!',
                'sweet!',
                'very nice',
                'amazing!',
                'good job!'
            ];
            return messages[ Math.floor(Math.random() * messages.length) ];
        },

        _pathInfo = function(path) {
            var $path = $(path);

            return $path.data('synaesthetic') || $path.data('synaesthetic', {
                index: $path.parent().children().index($path),
                color: parseInt($path.attr('fill').slice(1), 16)
            }).data('synaesthetic');
        },
        _pathEnter = function(e) {
            console.log('ENTERING: ', _pathInfo(this));
        },
        _pathLeave = function(e) {
            console.log('LEAVING: ', _pathInfo(this));
        },
        _pathClick = function(e) {
            var info = _pathInfo(this),
                currentAnswer = answers[levels[state[0] - 1]][state[1] - 1];

            console.log('CLICKING: ', info);

            guesses.push(info['index']);

            console.log('GUESS: ', guesses.toString());
            console.log('ANSWER: ', currentAnswer.toString());

            if ( guesses.toString() !== currentAnswer.slice(0, guesses.length).toString() ) {
                guesses = [];
            } else if ( guesses.length === currentAnswer.length ) {
                GAME.advance();
            }
        };

    return {
        state: function(level, point) {
            state = [level || 0, point || 0];
            return GAME;
        },
        advance: function() {
            state[1]++ > 3 && ((state[1] = 0) || (state[0] = 1));
            $('<div class="notice"/>').text(_successMessage()).insertBefore('#level');
            return GAME.level();
        },
        level: function() {
            var svg = $.ajax('./assets/svg/' + levels[state[0] - 1] + '/' + state[1] + '.svg');

            $('body').addClass('level-open');

            $.when(svg, $('#level svg').fadeOut()).done(function(svgDfr, animationDfr) {
                $('#level').hide().html(document.importNode(svgDfr[0].documentElement, true)).fadeIn();
            });

            svg.done(_scaleSVG);
        },
        setup: function() {
            $(window).resize(_scaleSVG);
            $('#level')
                .on('mouseenter', 'path', _pathEnter)
                .on('mouseleave', 'path', _pathLeave)
                .on('click',      'path', _pathClick);

            $('<div class="notice"/>').text('strike a chord').insertBefore('#level');

            return GAME;
        }
    }
})();

$(function() {
    $('#start button').click(function() {
        GAME.setup().state(1, 1).level();
    });

    // Do some crazy stuff to make about fade in and out
    // @TODO: is there a beter way to do this?
    // The transitionend listener and propagation stopper and
    // the offset width things seem ridiculously hacked together LOL
    $('.js-about-toggle').click(function() {
        if ( $('#about').hasClass('open') ) {
            $('#about').removeClass('open')
                .one('transitionend', function() {
                    $(this).hide().off('transitionend', '*');
                    this.offsetWidth = this.offsetWidth;
                })
                .on('transitionend', '*', function(e) {
                    e.stopPropagation();
                });
        } else {
            $('#about').show();
            $('#about')[0].offsetWidth = $('#about')[0].offsetWidth;
            $('#about').addClass('open');
        }
    });
});
