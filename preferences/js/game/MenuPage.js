/**
 * Created by Tom on 4/7/14.
 */



(function (scope) {


    var MenuPage = function () {
        this.setup();
    };

    MenuPage.prototype = new createjs.Container();
    var p = MenuPage.prototype;
    MenuPage.prototype.Container_initialize = p.initialize;


    p.setup = function () {
        p.Container_initialize();


        if (GAME.debugmode)
            log('MenuPage.setup');

        //background
        this.background = new createjs.Bitmap(GAME.assets.getResult("MENU_background"));
        this.background.x = GAME.GameCanvas.width / 2 - this.background.image.width / 2;
        this.background.y = GAME.GameCanvas.height / 2 - this.background.image.height / 2;
        this.addChild(this.background);

        createjs.Tween.get(this.background)
            .to({y: GAME.GameCanvas.height / 2, scaleY: .01, x: GAME.GameCanvas.width / 2, scaleX: .001})
            .wait(300)
            .to({x: this.background.x, scaleX: 1}, 70)
            .wait(50)
            .to({y: this.background.y, scaleY: 1}, 100);


        //playbutton
        this.playbutton = new createjs.Bitmap(GAME.assets.getResult("play_button"));
        this.playbutton.x = GAME.GameCanvas.width / 2 - this.playbutton.image.width / 2;
        this.playbutton.y = GAME.GameCanvas.height / 2 - this.playbutton.image.height / 2;
        createjs.Tween.get(this.playbutton)
            .to({y: GAME.GameCanvas.height / 2, scaleY: .01, x: GAME.GameCanvas.width / 2, scaleX: .001})
            .wait(300) //change this if you want it to zoom in after
            .to({x: this.playbutton.x, scaleX: 1}, 70)
            .wait(50)
            .to({y: this.playbutton.y, scaleY: 1}, 100);
        createjs.Tween.tick(1);


        //hitarea has to be added last so it's on top
        var hitArea = new createjs.Shape();
        hitArea.graphics.beginFill("#FFF")
            .drawRoundRect(GAME.GameCanvas.width / 2 - this.playbutton.image.width / 2,
                GAME.GameCanvas.height / 2 - this.playbutton.image.height / 2,
                this.playbutton.image.width,
                this.playbutton.image.height, 5);// this.playbutton.image.width, this.playbutton.image.height, this.radius); //with respect to the shape bounds
        hitArea.alpha = 0.01;
        this.addChild(hitArea);
        this.addChild(this.playbutton);


        //handle click
        hitArea.on("click", this.handleMenuClick.bind(this));


        //try out font
//        this.fontTest = new createjs.BitmapText('@!"$,.%0123456789:\nABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz',
//            GAME.settings.fontSpriteSheetRed);
//        this.fontTest.scaleX = 1.5;
//        this.fontTest.scaleY = 1.5;
//        this.addChild(this.fontTest);


    };

    p.handleMenuClick = function (evt) {
        //console.log(evt);

//        var pt = this.playbutton.globalToLocal(evt.stageX, evt.stageY);
        this.tweenOutSelf(GAME.flowController.MENU_to_LIVE);
//        if (pt.x < this.playbutton.image.width / 2 && pt.y < this.playbutton.image.height / 2) {
//            //1 selected
//            //tween out, and have the TWEEN end call the select_weapons()
//            //this one is just for testing at this point - we won't go from playbutton to weapons
//            GAME.flowController.nextPage = "weapons";
//            this.tweenOutSelf(GAME.flowController.MENU_to_WEAPONS);
//        } else if (pt.x >= this.playbutton.image.width / 2 && pt.y < this.playbutton.image.height / 2) {
//            //2 selected
//
//        } else if (pt.x < this.playbutton.image.width / 2 && pt.y >= this.playbutton.image.height / 2) {
//            //3 selected
//            this.tweenOutSelf(GAME.flowController.MENU_to_LIVE);
//        } else if (pt.x >= this.playbutton.image.width / 2 && pt.y >= this.playbutton.image.height / 2) {
//            //4 selected
//        }

    };

    p.tweenOutSelf = function (fnToCall) {
        createjs.Tween.get(this.background)
            .wait(100)
            .to({y: GAME.GameCanvas.height / 2, scaleY: .01}, 70)
            .wait(50)
            .to({x: GAME.GameCanvas.width / 2, scaleX: .001}, 100);


        //playbutton
        createjs.Tween.get(this.playbutton)
            .wait(100)
            .to({y: GAME.GameCanvas.height / 2, scaleY: .01}, 70)
            .wait(50)
            .to({x: GAME.GameCanvas.width / 2, scaleX: .001}, 100)
            .wait(100)
            .call(this.doneTweening, [fnToCall]);
        createjs.Tween.tick(1);

    };

    p.doneTweening = function (fnToCall) {
        //helper function to get around scope stuff
        fnToCall();
    };

    p.update = function () {
        //nothing changes

    };

    p.render = function () {
        //nothing changes

    };

    scope.MenuPage = MenuPage;

}(window.GAME));