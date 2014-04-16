/**
 * Created by Tom on 4/13/14.
 */


(function (scope) {

    function Tower() {
        createjs.Container.call(this);
    }
    inheritPrototype(Tower,createjs.Container);


    ///////////////////////////////////////
    // define new functions as necessary //
    ///////////////////////////////////////
    var p = Tower.prototype;

    p.setup = function () {



    };

    p.update = function(){


    };

    p.draw = function(){


    };

    scope.Tower = Tower;

}(window.GAME));