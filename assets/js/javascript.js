
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
        };

    return {
        state: function(level, point) {
            state = [level || 0, point || 0];
            return GAME;
        },
        level: function() {
            $('body').addClass('level-open');

            $.ajax({
                url: './assets/svg/' + levels[state[0] - 1] + '/' + state[1] + '.svg',
                success: function(data) {
                    $('#level').html(document.importNode(data.documentElement, true));
                    _updateLevelSize();
                    if ( 1 === state[0] && state[0] === state[1] ) {
                        $('<div class="instructions"/>').text('strike a chord').prependTo('#level')
                    }
                }
            })
        },
        handleResize: function() {
            _updateLevelSize();
        }
    }
})();

$(function() {
    $('#start button').click(function() {
        GAME.state(1, 1).level();
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

    $(window).resize(GAME.handleResize);
});
