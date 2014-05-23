/**
 * Created by Tom on 3/20/14.
 * Handles the CreateJS part of the menu
 */


(function (scope) {

    function MenuView(options) {
        this.initialize(options);
    }


    MenuView.prototype = new createjs.Container(); //inherits from container
    MenuView.prototype.Container_initialize = MenuView.prototype.initialize;

    var p = MenuView.prototype;
    var options = null;
    var button_1back_container, button_modifier_container;


    p.initialize = function (options) {
        this.Container_initialize(); //initialize the SUPER class
//        this.options = options;
        var bg, text_1back, text_modifier, button_1back_shape,
            button_modifier_shape;
        var slide_time = 800;//for tweening in

        //put up a background
        //var bg = window.GameLibs.GameUI.changeBackground(this.assets.getResult("background_menu"),gameData.width,gameData.height, "stretch");
        //bg = new createjs.Bitmap(this.assets.getResult("background_menu"));
        bg = new createjs.Shape();
        bg.graphics.clear().beginFill(GLOBAL.GameInfo.backgroundColor).drawRect(0, 0, GLOBAL.GameInfo.width, GLOBAL.GameInfo.height);
        this.addChild(bg);


        this.offset = 0; //y-offset for buttons from title, so you can shift everything together

        //create title
        this.button_title = new Button(GLOBAL.GameInfo.width / 2, 110 + this.offset, 700, 100)
            .setText("Choose a task")
            .setTextColor("#FFF")
            .setTextSize(80)
            .tweenIn('x', -1000, 0, slide_time,  createjs.Ease.elasticOut)
            .tweenOut('y',-400, 400, createjs.Ease.backIn);
        this.addChild(this.button_title);

        //BUTTON OBJECT VERSION
        this.button_1back = new Button(GLOBAL.GameInfo.width / 2, 230 + this.offset, 400, 100)
            .setColor(GLOBAL.GameInfo.menuButtonColor)
            .setText('1-Back Task')
            .setMouseoverColor(GLOBAL.GameInfo.menuButtonColorMouseover)
            .call(GLOBAL.state.CALLselect1Back)
            .tweenIn('x',-1000,0, slide_time, createjs.Ease.backOut) //bouncing in
            .tweenOut('x',800, 400, createjs.Ease.backIn);
        this.addChild(this.button_1back);
        //this.button_1back.on("click",this.tweenOut.bind(this));

//        this.button_modifier = new Button(GLOBAL.GameInfo.width / 2, 360 + this.offset, 400, 100)
//            .setColor(GLOBAL.GameInfo.menuButtonColor)
//            .setText('Modifiers Task')
//            .setMouseoverColor(GLOBAL.GameInfo.menuButtonColorMouseover)
//            .call(GLOBAL.state.CALLselectModifiedArrows)
//            .tweenIn('x',1000,0,slide_time,createjs.Ease.backOut)
//            .tweenOut('x',-800, 400, createjs.Ease.backIn);
//        this.addChild(this.button_modifier);
//        //console.log('menu',GLOBAL.stage);
    };

    p.onTick = function () {

    };


    p.handleMouseClick = function (evt, data) {
        //can't access GLOBAL.state here
        //can't do anything globally, only locally

        p.tweenOut(data);


    };

    p.callTweenOut = function(){
        //exists solely to transfer scope
        this.tweenOut();
    };

    p.tweenOut = function () {

        var l = this.getNumChildren();
        // iterate through all the children and tween out:
        for(var i = 0; i < l; i++) {
            //console.log("trying to tween out!!!", i, l);
            var child = this.getChildAt(i);
            //console.log(i, child, typeof child);
            if(child.isButton) child.tweenOutSelf();
        };

    };

//
//    p.leaveState = function (data) {
//
//        console.log('newdata', data);
//        //can't access this.options or options here! why?
//        if (data[0] === data[1][0][1]) {
//            GLOBAL.state.onselect1BACK_INTRO();
//        } else if (data[0] === data[1][1][1]) {
//            GLOBAL.state.onselectMODIFIED_ARROWS_INTRO();
//        }
//
//
//    };

    scope.MenuView = MenuView;

}(window.GLOBAL));