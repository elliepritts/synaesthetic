var GAME = (function() {
    var state = [0, 0],
        levels = ['jump', 'sf', 'vic', 'alicante', 'ns'],
        answers = {
            'jump':     [[64, 65, 67], [64, 65, 67], [64, 65, 67]],
            'sf':       [[64, 65, 67], [64, 65, 67], [64, 65, 67]],
            'vic':      [[64, 65, 67], [64, 65, 67], [64, 65, 67]],
            'alicante': [[64, 65, 67], [64, 65, 67], [64, 65, 67]],
            'ns':       [[64, 65, 67], [64, 65, 67], [64, 65, 67]]
        },
        guesses = [],
        notes = {},
        midi = [64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81],

        SYNTH = T('OscGen', { env: T('perc', { msec: timbre.timevalue('bpm120 l8'), ar: true }) }).play(),

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

        _generatePathInfo = function() {
            $('#level path').each(function() {
                var $path = $(this),
                    index = $path.parent().children().index($path),
                    color = parseInt(($path.attr('fill') || '').slice(1), 16) || false;

                $path.data('synaesthetic', {
                    index: index,
                    color: color
                });

                if ( color ) {
                    notes[color] = 0;
                }
            });

            var index = 0,
                splitAt = Math.floor(Object.keys(notes).length / (midi.length - 1));

            $.each(notes, function(color) {
                notes[color] = midi[Math.floor(index++ / splitAt)];
            });
        },

        _pathEnter = function(e) {
            var info = $(this).data('synaesthetic');
            console.log('ENTERING: ', info);
            console.log('PLAY NOTE: ', notes[info.color]);
            SYNTH.noteOn( notes[info.color], 60 );
        },
        _pathLeave = function(e) {
            var info = $(this).data('synaesthetic');
            console.log('LEAVING: ', info);
            console.log('------------------------------------------------------------');
        },
        _pathClick = function(e) {
            var info = $(this).data('synaesthetic'),
                currentAnswer = answers[levels[state[0] - 1]][state[1] - 1];

            console.log('CLICKING: ', info);

            guesses.push(notes[info['color']]);

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
            guesses = [];
            $('<div class="notice"/>').text(_successMessage).insertBefore('#level');
            if ( state[1]++ < 3 ) {
                return GAME.level();
            }

            $('#level')
                .html($('<img/>').attr('src', '/assets/svg/' + levels[state[0] - 1] + '/final.jpg'))
                .fadeIn().one('click', function() {
                    state[0]++;
                    state[1] = 1;
                    GAME.level();
                });
            return GAME;
        },
        level: function() {
            if ( 'undefined' === typeof levels[state[0] - 1] ) {
                $('#level').fadeOut();
                alert('GAME OVER!');
                return;
            }

            var svg = $.ajax('./assets/svg/' + levels[state[0] - 1] + '/' + state[1] + '.svg');

            $('body').addClass('level-open');

            $.when(svg, $('#level').fadeOut()).done(function(svgDfr, animationDfr) {
                $('#level').html(document.importNode(svgDfr[0].documentElement, true)).fadeIn();

                _generatePathInfo();
                _scaleSVG();
            });
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
