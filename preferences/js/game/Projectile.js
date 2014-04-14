/**
 * Created by Tom on 4/13/14.
 */


(function (scope) {

    function Projectile() {
        createjs.Container.call(this);
    }
    inheritPrototype(Projectile,createjs.Container);


    ///////////////////////////////////////
    // define new functions as necessary //
    ///////////////////////////////////////
    var p = Projectile.prototype;

    p.setup = function () {



    };

    p.update = function(){


    };

    p.draw = function(){


    };

    scope.Projectile = Projectile;

}(window.GAME));