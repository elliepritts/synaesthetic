
var GAME = (function() {
    var state = [0, 0],
        levels = ['chicago'],
        answers = {
            'chicago': [1,2,3]
        },

        _updateLevelSize = function() {
            $('#level svg').each(function() {
                var i = $(this), w = i.attr('width'), h = i.attr('height'), cw = i.parents('#level').width();
                i.css({width: cw, height: Math.floor(h / (w / cw))});
            });
        },

        _pathEnter = function(e) {
            console.log('ENTERING: ', this);
        },
        _pathLeave = function(e) {
            console.log('LEAVING: ', this);
        },
        _pathClick = function(e) {
            console.log('CLICKING: ', this);
        };

    return {
        state: function(level, point) {
            state = [level || 0, point || 0];
            return GAME;
        },
        level: function() {
            var svg = $.ajax('./assets/svg/' + levels[state[0] - 1] + '/' + state[1] + '.svg');

            $('body').addClass('level-open');

            svg.done(function(data) {
                $('#level').html(document.importNode(data.documentElement, true));
            });

            svg.done(_updateLevelSize);
        },
        setup: function() {
            $(window).resize(_updateLevelSize);
            $('#level')
                .on('mouseenter', 'path', _pathEnter)
                .on('mouseleave', 'path', _pathLeave)
                .on('click',      'path', _pathClick);

            $('<div class="instructions"/>').text('strike a chord').insertBefore('#level');

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
