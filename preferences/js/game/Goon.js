/**
 * Created by Tom on 4/13/14.
 */


(function (scope) {

    function Goon() {
        createjs.Container.call(this);
    }
    inheritPrototype(Goon,createjs.Container);


    ///////////////////////////////////////
    // define new functions as necessary //
    ///////////////////////////////////////
    var p = Goon.prototype;

    p.setup = function (index) {


        var ss = new createjs.SpriteSheet({
            "animations":
            {
                "move_up": [0, 9],
                "move_left": [8, 15],
            },
            "images": [GAME.assets.getResult("goon1")],
            "frames":
            {
                "height": 32,
                "width":32,
                "regX": 0,
                "regY": 0,
                "count": 64
            }
        });





    };

    p.update = function(){


    };

    p.draw = function(){


    };

    scope.Goon = Goon;

}(window.GAME));