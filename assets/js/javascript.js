$(function() {
    window.GAME = (function() {
        var state = [0, 0],
            levels = ['jump', 'sf', 'vic', 'alicante', 'ns'],
            answers = {
                'jump':     [[65, 70, 74], [70, 74, 77], [64, 66, 68]],
                'sf':       [[64, 68, 71], [70, 72, 74], [70, 72, 74]],
                'vic':      [[68, 70, 72], [67, 71, 74], [70, 72, 74]],
                'alicante': [[70, 74, 77], [72, 74, 76], [72, 76, 79]],
                'ns':       [[67, 72, 76], [72, 76, 79], [79, 76, 72]]
            },
            guesses = [],
            notes = {},
            midi = [64, 65, 66, 67, 68, 70, 71, 72, 74, 76, 77, 79, 81],

            SYNTH = (function() {
                var synths = [],
                    currentSynth = 0,
                    sustainSynth = T('OscGen', { env: T('perc', { ar: true, r: 60 * 60 * 60 }) }).play();

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
                $('.notice').remove();
                $('<div class="notice"/>').text(messages[ Math.floor(Math.random() * messages.length) ]).insertBefore('#level');
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
                // console.log('ENTERING: ', info);
                console.log('PLAY NOTE: ', notes[info.color]);
                SYNTH( notes[info.color] );
                console.log('IS NEXT NOTE:', (guesses.length ? guesses.toString() + ',' : '') + notes[info.color] === answers[levels[state[0] - 1]][state[1] - 1].slice(0, guesses.length + 1).toString() ? 'YES' : 'no');
            },
            _pathLeave = function(e) {
                var info = $(this).data('synaesthetic');
                // console.log('LEAVING: ', info);
                console.log('------------------------------------------------------------');
            },
            _pathClick = function(e) {
                var info = $(this).data('synaesthetic'),
                    currentAnswer = answers[levels[state[0] - 1]][state[1] - 1];

                // console.log('CLICKING: ', info);

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

                SYNTH( undefined, false );
                if ( $('[data-continue]').length && Math.max(state[0], state[1]) > 1 ) {
                    SYNTH( undefined, false );
                    var answer = answers[levels[state[0] - 1]][state[1] - 1];
                    SYNTH( answer[0] );
                    SYNTH( answer[1] );
                    SYNTH( answer[2] );
                }

                if ( state[1]++ < 3 ) {
                    return GAME.level(_successMessage);
                }

                var image = 'assets/svg/' + levels[state[0] - 1] + '/final.jpg';

                state[0]++;
                state[1] = 1;

                $.cookie('level', state[0]);
                $.cookie('point', state[1]);

                $.wait(500).then(function() {
                    $('#level').fadeOut(function() {
                        $(this).html( $('<img/>').attr('src', image).one('click', function() { GAME.level() }) );
                    }).fadeIn(_successMessage);
                });
                return GAME;
            },
            level: function(callback) {
                $('body').addClass('level-open');

                $('body').toggleClass('played', state[0] > 1 || state[1] > 1);

                if ( 'undefined' === typeof levels[state[0] - 1] ) {
                    return GAME.end();
                }

                $.cookie('level', state[0]);
                $.cookie('point', state[1]);

                $('body').addClass('whitenoise-fix');

                var svg = $.ajax('assets/svg/' + levels[state[0] - 1] + '/' + state[1] + '.svg'),
                    firstRun = $('#level').is(':empty');

                $.wait(firstRun ? 0 : 1000).then(function() {
                    $.when(svg, $('#level').fadeOut(firstRun ? 0 : undefined)).done(function(svgDfr, animationDfr) {
                        $('#level').html(document.importNode(svgDfr[0].documentElement, true)).fadeIn(function() {
                            $('body').removeClass('whitenoise-fix');
                            callback && callback();
                        });

                        _generatePathInfo();
                        _scaleSVG();
                        GAME.help();
                    });
                });
            },
            setup: (function() {
                var setup = false;

                return function() {
                    if ( setup ) {
                        return GAME;
                    }
                    $(window).resize(_scaleSVG);

                    $('#level')
                        .on('mouseenter', 'path', _pathEnter)
                        .on('mouseleave', 'path', _pathLeave)
                        .on('click',      'path', _pathClick);

                    $('#help button').click(function() {
                        $('body').addClass('whitenoise-fix');
                        $('#help').fadeOut(function() {
                            $('#level path').filter(function() {
                                return answers[levels[state[0] - 1]][state[1] - 1][0] === notes[$(this).data('synaesthetic').color];
                            }).attr('data-highlight', 'true').first().click();
                            $('body').removeClass('whitenoise-fix');
                        });
                    });

                    setup = true;

                    return GAME;
                }
            })(),
            end: function(callback) {
                $('#level, #level-footer').fadeOut(function() { $('#level').empty() });
                $('#final').addClass('open');
                $('#final-header').show();
                $.ajax('assets/svg/endgame.svg').done(function(data) {
                    $('#final').prepend(document.importNode(data.documentElement, true));
                    _scaleSVG();
                    callback && callback();
                });

                $.cookie('level', 1);
                $.cookie('point', 1);

                return GAME;
            },
            help: function() {
                clearTimeout(helpTimeout);
                helpTimeout = setTimeout(function() {
                    if ( ! $('#level').is(':visible') ) {
                        return GAME.help();
                    }
                    $('#help').fadeIn();
                }, 1000 * 15);
            },
            pastFirstLevel: $.cookie('level') > 1 || $.cookie('point') > 1
        }
    })();

    $('body').toggleClass('unsupported', !/chrome/i.test(navigator.userAgent));

    $('.js-start').click(function() {
        var _this = this;

        if ( $(this).attr('data-continue') ) {
            $('body').addClass('level-open whitenoise-fix');
            $('#level').removeAttr('style').hide().delay(500).fadeIn(function() {
                $('body').removeClass('whitenoise-fix');
            });
        } else {
            GAME.setup().state($.cookie('level') || 1, $.cookie('point') || 1).level(function() {
                $(_this).attr('data-continue', 'true').text('CONTINUE');
            });
            if ( ! GAME.pastFirstLevel ) {
                $('#explanation').fadeIn();
            }
        }
    });

    $('.js-reset').click(function() {
        GAME.pastFirstLevel = false;
        GAME.setup().state(1, 1).level(function() {
            $('.js-start').attr('data-continue', 'true').text('CONTINUE');
        });
        $('#explanation').fadeIn();
    });

    $('#explanation button').click(function() {
        var $button = $(this).text('turn up your volume').prop('disabled', true),
            ellipsis = setInterval(function() { $button.text(function() { return $button.text() + '.' }) }, 500);

        setTimeout(function() {
            clearInterval(ellipsis);
            $('#explanation').fadeOut(function() { $(this).remove() });
            if ( ! GAME.pastFirstLevel ) {
                GAME.help();
            }
        }, 1999);
    });

    if ( GAME.pastFirstLevel ) {
        $('.js-start').text('CONTINUE');
        $('body').addClass('played');
    }

    $('#level-footer h1').click(function() {
        $(window).scrollTop(0);
        $('#level').hide();
        $('body').removeClass('level-open');
    });

    $('#final-header h1').click(function() {
        $(window).scrollTop(0);
        $('#final').removeClass('open');
        $('#final-header').hide();
        $('body').removeClass('level-open');
    });

    var whitenoiseTimeout;
    $(window).scroll(function() {
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

'syna.es' === document.location.hostname && history.replaceState && history.replaceState({}, document.title, '/thetic');

$.wait=function(t){return $.Deferred(function(d){setTimeout(d.resolve,t)}).promise()};

/*
 * jQuery Cookie
 */
(function(e){if(typeof define==="function"&&define.amd){define(["jquery"],e)}else{e(jQuery)}})(function(e){function n(e){return u.raw?e:encodeURIComponent(e)}function r(e){return u.raw?e:decodeURIComponent(e)}function i(e){return n(u.json?JSON.stringify(e):String(e))}function s(e){if(e.indexOf('"')===0){e=e.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\")}try{e=decodeURIComponent(e.replace(t," "));return u.json?JSON.parse(e):e}catch(n){}}function o(t,n){var r=u.raw?t:s(t);return e.isFunction(n)?n(r):r}var t=/\+/g;var u=e.cookie=function(t,s,a){if(s!==undefined&&!e.isFunction(s)){a=e.extend({},u.defaults,a);if(typeof a.expires==="number"){var f=a.expires,l=a.expires=new Date;l.setTime(+l+f*864e5)}return document.cookie=[n(t),"=",i(s),a.expires?"; expires="+a.expires.toUTCString():"",a.path?"; path="+a.path:"",a.domain?"; domain="+a.domain:"",a.secure?"; secure":""].join("")}var c=t?undefined:{};var h=document.cookie?document.cookie.split("; "):[];for(var p=0,d=h.length;p<d;p++){var v=h[p].split("=");var m=r(v.shift());var g=v.join("=");if(t&&t===m){c=o(g,s);break}if(!t&&(g=o(g))!==undefined){c[m]=g}}return c};u.defaults={};e.removeCookie=function(t,n){if(e.cookie(t)===undefined){return false}e.cookie(t,"",e.extend({},n,{expires:-1}));return!e.cookie(t)}});
