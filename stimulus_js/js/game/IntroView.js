/**
 * Created by Tom on 3/20/14.
 * Handles the CreateJS part of the menu
 */


(function (scope) {

    function IntroView(options) {
        this.initialize(options);
    }


    IntroView.prototype = new createjs.Container(); //inherits from container
    IntroView.prototype.Container_initialize = IntroView.prototype.initialize;

    var p = IntroView.prototype;


    p.initialize = function (options) {
        this.options = options;
        this.Container_initialize();

        var bg;
        bg = new createjs.Shape();
        bg.graphics.clear().beginFill(GLOBAL.GameInfo.backgroundColor).drawRect(0, 0, GLOBAL.GameInfo.width, GLOBAL.GameInfo.height);
        this.addChild(bg);

        if (GLOBAL.state.is("1BACK_INTRO")) {
            this.create1BackIntro();
        } else if (GLOBAL.state.is("MODIFIED_ARROWS_INTRO")) {
            this.createModifierIntro();
        }
        console.log("INTRO VIEW",this);

    };

//    p.bind = function(scope) {
//        var _function = this;
//        return function() {
//            return _function.apply(scope, arguments);
//        }
//    };

    p.create1BackIntro = function () {

        var slide_time = 600;


        //at the bottom of the stack, create
        this.instructions_1back = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 2, 600, 380)
            .setColor(GLOBAL.GameInfo.introRegionColor)
            .setTextSize(30)
            .setTextMargin(50)
            .setText(this.options.oneback.instructions)
            .setTextColor("#FFF")
            .tweenIn('y', -1000, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.instructions_1back);

        this.button_1back = new Button(GLOBAL.GameInfo.width / 2, 360, 300, 100)
            .setColor(GLOBAL.GameInfo.introButtonColor)
            .setText('Go1!')
            .setTextSize(60)
            .setMouseoverColor(GLOBAL.GameInfo.introButtonColorMouseover)
            .call(GLOBAL.state.CALLselect1BackOK)
            .tweenIn('y', -1000, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.button_1back);

        //console.log(this);
        //this.tweenOut();
    };






    p.createModifierIntro = function () {

        //console.log("GOT HEREEEE", this);
        var slide_time = 600;

        this.instructions_modifier = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 2, 600, 380)
            .setColor(GLOBAL.GameInfo.introRegionColor)
            .setTextSize(30)
            .setTextMargin(50)
            .setText(this.options.modifier.instructions)
            .setTextColor("#FFF")
            .tweenIn('x', -1000, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('y', -800, 400, createjs.Ease.backIn);
        this.addChild(this.instructions_modifier);

        //train
        this.button_modifier_1 = new Button(GLOBAL.GameInfo.width / 4 + 50, 360, 200, 100)
            .setColor(GLOBAL.GameInfo.introButtonColor)
            .setText('Train')
            .setMouseoverColor(GLOBAL.GameInfo.introButtonColorMouseover)
            .call(GLOBAL.state.CALLselectModifiedTrain)
            .tweenIn('x', 1000, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('y', 800, 400, createjs.Ease.backIn);
        this.addChild(this.button_modifier_1);

        //console.log("button",this.button_modifier_1, this.button_modifier_1.parent.createModifierTrain);

        //test
        this.button_modifier_2 = new Button(3 * GLOBAL.GameInfo.width / 4 - 50, 360, 200, 100)
            .setColor(GLOBAL.GameInfo.introButtonColor)
            .setText('Test')
            .setMouseoverColor(GLOBAL.GameInfo.introButtonColorMouseover)
            .call(GLOBAL.state.CALLselectModifiedTest)
            .tweenIn('y', -1000, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.button_modifier_2);
        //todo check to see whether test is available

        this.doneTweeningListener = this.on("done_tweening", this.handleTestTrainSelection); //listen for finished tweening
                //this always goes to train now - how to differentiate btw train and test? Make a new state?

    };

    p.handleTestTrainSelection = function(){
        if(GLOBAL.state.is("MODIFIED_INTRO_TRAIN")){
            this.createModifierTrainIntro();
        }else if(GLOBAL.state.is("MODIFIED_INTRO_TEST")){
            this.createModifierTestIntro();
        }
    };

    p.createModifierTrainIntro = function () {

        this.off("done_tweening",this.doneTweeningListener);//remove listener
        var slide_time = 600;

        this.instructions_modifier_train = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 2, 600, 380)
            .setColor(GLOBAL.GameInfo.introRegionColor)
            .setTextSize(30)
            .setTextMargin(50)
            .setText(this.options.modifier.instructions_train)
            .setTextColor("#FFF")
            .tweenIn('x', -1000, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('y', -1000, 400, createjs.Ease.backIn);
        this.addChild(this.instructions_modifier_train);

        this.button_modifier_train = new Button(GLOBAL.GameInfo.width / 2, 360, 200, 100)
            .setColor(GLOBAL.GameInfo.introButtonColor)
            .setText('Go!')
            .setTextSize(48)
            //.setMouseoverColor(GLOBAL.GameInfo.introButtonColorMouseover)
            .call(this.CALLselectModifiedTrainOK)
            .tweenIn('x', 1000, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('y', 800, 400, createjs.Ease.backIn);
        this.addChild(this.button_modifier_train);

        //console.log("button",this.button_modifier_1, this.button_modifier_1.parent.createModifierTrain);


    };

    p.createModifierTestIntro = function () {

        this.off("done_tweening",this.doneTweeningListener);//remove listener
        var slide_time = 600;

        this.instructions_modifier_test = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 2, 600, 380)
            .setColor(GLOBAL.GameInfo.introRegionColor)
            .setTextSize(30)
            .setTextMargin(50)
            .setText(this.options.modifier.instructions_test)
            .setTextColor("#FFF")
            .tweenIn('x', -1000, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('y', -1000, 400, createjs.Ease.backIn);
        this.addChild(this.instructions_modifier_test);

        this.button_modifier_test_1 = new Button(GLOBAL.GameInfo.width / 4 + 50, 360, 200, 100)
            .setColor(GLOBAL.GameInfo.introButtonColor)
            .setText('1')
            .setTextSize(48)
            //.setMouseoverColor(GLOBAL.GameInfo.introButtonColorMouseover)
            .call(this.CALLselectModifiedTestOK)
            .tweenIn('x', 1000, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('y', 800, 400, createjs.Ease.backIn);
        this.addChild(this.button_modifier_test_1);


        this.button_modifier_test_2 = new Button(3 * GLOBAL.GameInfo.width / 4 - 50, 360, 200, 100)
            .setColor(GLOBAL.GameInfo.introButtonColor)
            .setText('3')
            .setTextSize(48)
            //.setMouseoverColor(GLOBAL.GameInfo.introButtonColorMouseover)
            .call(this.CALLselectModifiedTestOK)
            .tweenIn('x', 1000, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('y', 800, 400, createjs.Ease.backIn);
        this.addChild(this.button_modifier_test_2);


    };





    p.callTweenOut = function(){
        //exists solely to transfer scope
        this.tweenOut();
    };


    p.tweenOut = function () {
        console.log("i was called now!!!")
        var l = this.getNumChildren();
        // iterate through all the children and tween out:
        for (var i = 0; i < l; i++) {
            console.log("trying to tween out!!!", i, l);
            var child = this.getChildAt(i);
            console.log(i, child, typeof child);
            if (child.isButton) {

                child.tweenOutSelf();

            }
        }

    };

    p.onTick = function () {

    };

    p.handleMouseOver = function (evt) {

    }

    p.handleMouseOff = function (evt) {

    };

    p.handleMouseClick = function (evt, data) {
    };

    p.changeState = function (data) {

    };

    scope.IntroView = IntroView;

}(window.GLOBAL));