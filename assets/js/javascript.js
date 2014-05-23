var GAME = (function() {
    var state = [0, 0],
        levels = ['jump', 'sf', 'vic', 'alicante', 'ns'],
        answers = {
            'jump':     [[65, 70, 74], [70, 74, 77], [64, 66, 68]],
            'sf':       [[64, 68, 71], [70, 72, 74], [70, 72, 74]],
            'vic':      [[68, 70, 72], [64, 66, 68], [70, 72, 74]],
            'alicante': [[70, 72, 74], [72, 74, 76], [72, 74, 76]],
            'ns':       [[67, 72, 76], [72, 76, 79], [79, 76, 72]]
        },
        guesses = [],
        notes = {},
        midi = [64, 65, 66, 67, 68, 70, 71, 72, 74, 76, 77, 79, 81],

        SYNTH = (function() {
            var synths = [],
                currentSynth = 0,
                sustainSynth = T('OscGen', { env: T('perc', { ar: true, r: 60 * 60 * 3 }) }).play();

            for ( var i = 0; i < 20; i++ ) {
                synths.push( T('OscGen', { env: T('perc', { ar: true }) }).play() );
            }

            return function(note, sustain) {
                if ( 'undefined' !== typeof sustain ) {
                    if ( sustain ) {
                        return sustainSynth.noteOn( note, 13 );
                    } else {
                        sustainSynth.allSoundOff();
                    }
                }
                currentSynth++ && currentSynth >= synths.length && (currentSynth = 0);
                return synths[currentSynth].noteOn( note, 10 );
            };
        })(),

        helpTimeout,

        _scaleSVG = function() {
            $('svg', '#level, #final').each(function() {
                var i = $(this), w = i.attr('width'), h = i.attr('height'), cw = i.parents('#level, #final').width();
                i.css({width: cw, height: Math.floor(h / (w / cw))});
            });
        },

        _successMessage = function() {
            var messages = [
                'music to my ears!',
                'sweet!',
                'very nice!',
                'amazing!',
                'fantastic!'
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
                splitAt = Math.ceil(Object.keys(notes).length / (midi.length - 1));

            $.each(notes, function(color) {
                notes[color] = midi[Math.floor(index++ / splitAt)];
            });
        },

        _pathEnter = function(e) {
            var info = $(this).data('synaesthetic');
            console.log('ENTERING: ', info);
            console.log('PLAY NOTE: ', notes[info.color]);
            SYNTH( notes[info.color] );
            console.log('IS NEXT NOTE:', (guesses.length ? guesses.toString() + ',' : '') + notes[info.color] === answers[levels[state[0] - 1]][state[1] - 1].slice(0, guesses.length + 1).toString() ? 'YES' : 'no');
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

            guesses.push(notes[info.color]);

            console.log('GUESS: ', guesses.toString());
            console.log('ANSWER: ', currentAnswer.toString());

            if ( guesses.toString() !== currentAnswer.slice(0, guesses.length).toString() ) {
                SYNTH( undefined, false );
                guesses[0] && SYNTH( guesses[0] );
                guesses[1] && SYNTH( guesses[1] );
                guesses[2] && SYNTH( guesses[2] );
                guesses = [];
                $('[data-highlight]').removeAttr('data-highlight');
            } else {
                clearTimeout(helpTimeout);
                $(this).attr('data-highlight', 'true').appendTo( $(this).parent() );
                SYNTH( notes[info.color], true );
            }

            if ( guesses.length === currentAnswer.length ) {
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
            // $('<div class="notice"/>').text(_successMessage).insertBefore('#level');
            if ( state[1]++ < 3 ) {
                return GAME.level();
            }

            $('#level').fadeOut(function() {
                $(this).html($('<img/>').attr('src', 'assets/svg/' + levels[state[0] - 1] + '/final.jpg'))
                    .fadeIn().one('click', function() {
                        state[0]++;
                        state[1] = 1;
                        GAME.level();
                    });
            });
            return GAME;
        },
        level: function() {
            $('body').addClass('level-open');

            if ( 'undefined' === typeof levels[state[0] - 1] ) {
                return GAME.end();
            }

            $('body').addClass('whitenoise-fix');

            var prevState = [state[0], state[1] - 1];
            if ( prevState[1] <= 0 ) {
                prevState[0]--;
                prevState[1] = 1;
            }

            SYNTH( undefined, false );
            if ( prevState[0] ) {
                var lastAnswer = answers[levels[prevState[0] - 1]][prevState[1] - 1];
                SYNTH( lastAnswer[0] );
                SYNTH( lastAnswer[1] );
                SYNTH( lastAnswer[2] );
            }

            var svg = $.ajax('assets/svg/' + levels[state[0] - 1] + '/' + state[1] + '.svg');
            $.wait(prevState[0] ? 1000 : 0).then(function() {
                $.when(svg, $('#level').fadeOut(prevState[0] ? undefined : 0)).done(function(svgDfr, animationDfr) {
                    $('#level').html(document.importNode(svgDfr[0].documentElement, true)).fadeIn(function() {
                        $('body').removeClass('whitenoise-fix');
                    });

                    _generatePathInfo();
                    _scaleSVG();
                });
            });
        },
        setup: function() {
            $(window).resize(_scaleSVG);
            $('#level')
                .on('mouseenter', 'path', _pathEnter)
                .on('mouseleave', 'path', _pathLeave)
                .on('click',      'path', _pathClick);

            return GAME;
        },
        end: function() {
            $('#level').fadeOut(function() { SYNTH( undefined, false ) });
            $('#final').addClass('open');
            $.ajax('assets/svg/endgame.svg').done(function(data) {
                $('#final').prepend(document.importNode(data.documentElement, true));
                _scaleSVG();
            });

            return GAME;
        },
        help: function() {
            helpTimeout = setTimeout(function() {
                $('#help').fadeIn();
                $('#help button').click(function() {
                    $('#help').fadeOut(function() { $(this).remove() });
                });
            }, 1000 * 1);
        }
    }
})();

$(function() {
    $('#start button').click(function() {
        $('#explanation').fadeIn();
        GAME.setup().state(1, 1).level();
    });

    $('#explanation button').click(function() {
        var $button = $(this).text('turn up your volume').prop('disabled', true),
            ellipsis = setInterval(function() { $button.text(function() { return $button.text() + '.' }) }, 500);

        setTimeout(function() {
            clearInterval(ellipsis);
            $('#explanation').fadeOut(function() { $(this).remove() });
            GAME.help();
        }, 1999);
    });

    var whitenoiseTimeout;
    $(window).scroll(function() {
        if ( $('#about.open').length ) return true;
        $('body').addClass('whitenoise-fix');
        clearTimeout(whitenoiseTimeout);
        whitenoiseTimeout = setTimeout(function() {
            $('body').removeClass('whitenoise-fix');
        }, 300)
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

$.wait=function(t){return $.Deferred(function(d){setTimeout(d.resolve,t)}).promise()};
