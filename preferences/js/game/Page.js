/**
 * Created by Tom on 4/7/14.
 */


(function (scope) {

    function Page() {
        createjs.Container.call(this);
    }
    inheritPrototype(Page,createjs.Container);


    ///////////////////////////////////////
    // define new functions as necessary //
    ///////////////////////////////////////
    var p = Page.prototype;

    p.setup = function () {



    };

    p.update = function(){


    };

    p.draw = function(){


    };

    scope.Page = Page;

}(window.GAME));