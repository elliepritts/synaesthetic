
var GAME = (function() {
    var state = [0, 0],
        levels = ['chicago'],
        answers = {
            'chicago': [1,2,3]
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
                }
            })
        }
    }
})();

$(function() {
    $('#start button').click(function() {
        GAME.state(1, 1).level();
    });

    $('.js-about-toggle').click(function() {
        $('#about').fadeToggle();
    });
});
