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

    p.setup = function () {



    };

    p.update = function(){


    };

    p.draw = function(){


    };

    scope.Goon = Goon;

}(window.GAME));