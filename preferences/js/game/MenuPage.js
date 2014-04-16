/**
 * Created by Tom on 4/7/14.
 */



(function (scope) {

    function MenuPage() {
        //GAME.Page.call(this);
        createjs.Container.call(this);
        this.setup();
    }


//    inheritPrototype(MenuPage, GAME.Page);
    inheritPrototype(MenuPage,createjs.Container);


    ///////////////////////////////////////
    // define new functions as necessary //
    ///////////////////////////////////////
    var p = MenuPage.prototype;

    p.setup = function () {



        if (GAME.debugmode)
            log('MenuPage.setup');

        //background
        this.background = new createjs.Bitmap(GAME.assets.getResult("MENU_background"));
        this.addChild(this.background);

        createjs.Tween.get(this.background)
            .to({y: GAME.GameCanvas.height / 2, scaleY: .01, x: GAME.GameCanvas.width / 2, scaleX: .001})
            .wait(300)
            .to({x: 0, scaleX: 1}, 70)
            .wait(50)
            .to({y: 0, scaleY: 1}, 100);

//
//        //menu
        this.menu = new createjs.Bitmap(GAME.assets.getResult("MENU_select_screen"));
        this.addChild(this.menu);
        this.menu.x = GAME.GameCanvas.width / 2 - this.menu.image.width / 2;
        this.menu.y = GAME.GameCanvas.height / 2 - this.menu.image.height / 2;
        createjs.Tween.get(this.menu)
            .to({y: GAME.GameCanvas.height / 2, scaleY: .01, x: GAME.GameCanvas.width / 2, scaleX: .001})
            .wait(300) //change this if you want it to zoom in after
            .to({x: this.menu.x, scaleX: 1}, 70)
            .wait(50)
            .to({y: this.menu.y, scaleY: 1}, 100);
        createjs.Tween.tick(1);

        this.menu.on("click", this.handleMenuClick.bind(this));
//
//        // used only for the particle decorations
//        var titleframecount = 0;
//
//        // if the game is running in a web page, we may want the loading screen to be invisible
//        // CSS display:none, and the game will only appear when ready to play: harmless if unhidden/app.
//        GAME.canvas.style.display = 'block';
//
////        game_paused = 3; // special paused setting: MENU MODE
////        soundIntroHasBeenPlayed = false; // so that next game we start, we hear it again
//
//        var keyCombos = [
////            {
////                "keys": "s",
////                "prevent_repeat": true,
////                "on_keydown": function (e) {
////                    GLOBAL.lastKeyPressed = 's';
////                    GLOBAL.currentView.keyPressed();
////                }
////            },
//        ];
//        GAME.keyboardListener.register_many(keyCombos);
//


    };

    p.handleMenuClick = function (evt) {

        var pt = this.menu.globalToLocal(evt.stageX, evt.stageY);
        if (pt.x < this.menu.image.width / 2 && pt.y < this.menu.image.height / 2) {
            //1 selected
            //tween out, and have the TWEEN end call the select_weapons()
            this.tweenOutSelf(GAME.state.CALLselect_weapons);
        } else if (pt.x >= this.menu.image.width / 2 && pt.y < this.menu.image.height / 2) {
            //2 selected
            GAME.state.select_playback();
        } else if (pt.x < this.menu.image.width / 2 && pt.y >= this.menu.image.height / 2) {
            //3 selected
            GAME.state.show_playback();
        } else if (pt.x >= this.menu.image.width / 2 && pt.y >= this.menu.image.height / 2) {
            //4 selected
        }
    };
//
    p.tweenOutSelf = function (fnToCall) {
        createjs.Tween.get(this.background)
            .wait(100)
            .to({y: GAME.GameCanvas.height / 2, scaleY: .01}, 70)
            .wait(50)
            .to({x: GAME.GameCanvas.width / 2, scaleX: .001}, 100);


        //menu
        createjs.Tween.get(this.menu)
            .wait(100)
            .to({y: GAME.GameCanvas.height / 2, scaleY: .01}, 70)
            .wait(50)
            .to({x: GAME.GameCanvas.width / 2, scaleX: .001}, 100)
            .wait(100)
            .call(this.doneTweening, [fnToCall]);
        createjs.Tween.tick(1);

    };
//
    p.doneTweening = function (fnToCall) {
        //helper function to get around scope stuff
        fnToCall();
    };
//
    p.update = function () {
        //nothing changes

    };
//
    p.render = function () {
        //nothing changes

    };

    scope.MenuPage = MenuPage;

}(window.GAME));