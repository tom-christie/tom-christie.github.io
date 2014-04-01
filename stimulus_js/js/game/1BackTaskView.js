/**
 * Created by Tom on 3/27/14.
 *
 * View object for the 1-back task - takes info from the 1BackTask object and displays it on the screen.
 *
 * Subclass of createjs.Container
 *
 */


(function (scope) {

    function OneBackTaskView(options) {
        this.initialize(options);
    }


    OneBackTaskView.prototype = new createjs.Container(); //inherits from container
    OneBackTaskView.prototype.Container_initialize = OneBackTaskView.prototype.initialize;

    var p = OneBackTaskView.prototype;


    p.initialize = function (options) {

        this.options = options;
        this.Container_initialize();

        var bg;
        bg = new createjs.Shape();
        bg.graphics.clear().beginFill(GLOBAL.GameInfo.backgroundColor).drawRect(0, 0, GLOBAL.GameInfo.width, GLOBAL.GameInfo.height);
        this.addChild(bg);

        this.createLevel();

        this.directions = {"Right": 0,
            "Up": 1,
            "Left": 2,
            "Down": 3};
    };


    p.createLevel = function () {

        var slide_time = 600;

        //make incorrect scorecard
        this.scorecardIncorrect = new Button(GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor(GLOBAL.GameInfo.scorecardIncorrectColor)
            .setRadius(20)
            .setTextSize(GLOBAL.GameInfo.scorecardDigitSize)
            .setText("0")
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('x', -300, 0, slide_time, createjs.Ease.elasticOut);
        //.tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardIncorrect);
        //console.log(this.scorecardIncorrect);

        this.scorecardIncorrectFlash = new Button(GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor("#FFF")
            .setText("")
            .setRadius(20)
            .setAlpha(0)
            .tweenIn('x', -300, 0, slide_time, createjs.Ease.elasticOut);
        //.tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardIncorrectFlash);

        //make correct scorecard
        this.scorecardCorrect = new Button(4 * GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor(GLOBAL.GameInfo.scorecardCorrectColor)
            .setRadius(20)
            .setTextSize(GLOBAL.GameInfo.scorecardDigitSize)
            .setText("0")
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('x', 300, 0, slide_time, createjs.Ease.elasticOut);
        //.tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardCorrect);

        this.scorecardCorrectFlash = new Button(4 * GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor("#FFF")
            .setText("")
            .setAlpha(0)
            .setRadius(20)
            .tweenIn('x', 300, 0, slide_time, createjs.Ease.elasticOut);
        //.tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardCorrectFlash);


        //make instructions at the top
        this.instructions = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 8, GLOBAL.GameInfo.width * .6, GLOBAL.GameInfo.height / 4)
            .setTextSize(30)
            .setText(this.options.instructions)
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('y', -200, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('x', 1000, 400, createjs.Ease.backIn);
        this.addChild(this.instructions);


        //make timer
        //at the bottom of the stack, create a timer
        this.timerHolder = new Button(GLOBAL.GameInfo.width / 2, 6 * GLOBAL.GameInfo.height / 7, parseInt(GLOBAL.GameInfo.timerWidth), parseInt(GLOBAL.GameInfo.timerHeight))
            .setColor(GLOBAL.GameInfo.timerUnfilledColor)
            .setText("")
            .tweenIn('x', 300, 0, slide_time, createjs.Ease.elasticOut);
        //.tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.timerHolder);

        this.timerIndicator = new Button(GLOBAL.GameInfo.width / 2, 6 * GLOBAL.GameInfo.height / 7, parseInt(GLOBAL.GameInfo.timerWidth) / 5, parseInt(GLOBAL.GameInfo.timerHeight))
            .setColor(GLOBAL.GameInfo.timerCorrectColor)
            .setText("")
            .tweenIn('x', 300, 0, slide_time, createjs.Ease.elasticOut);
        //.tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.timerIndicator);

        this.timerFilled = 0;

        //add first arrow to view
        console.log(GLOBAL.oneBackTask.arrowViewArray[0]);
        this.currentArrow = this.addChild(GLOBAL.oneBackTask.arrowViewArray[0]);
        this.currentArrow.tweenIn();


        this.doneTweeningListener = this.on("done_tweening_out", this.arrowTweenOutFinished); //listen for finished tweening

        this.instructionsDoneTweening = this.on("done_tweening_out", this.instructionsTweenOutFinished);
    };

    p.addArrow = function () {

    };

    p.onTick = function () {

    };

    p.keyPressed = function () {
        //check for keypress
        //if first tick, proceed and change instructions

        var validKeys = ["Up", "Down", "Left", "Right"];

        if ($.inArray(GLOBAL.lastKeyPressed, validKeys) >= 0) { //if last key was an arrow key
            GLOBAL.oneBackTask.responses[GLOBAL.oneBackTask.current_arrow_index] = GLOBAL.lastKeyPressed;
            this.currentArrow.tweenOut();

            if (GLOBAL.oneBackTask.current_arrow_index === 0) {
                //tween out instructions
                this.instructions.tweenOutSelf();

            } else {
                console.log(this.directions[GLOBAL.lastKeyPressed],
                    GLOBAL.oneBackTask.arrowViewArray[GLOBAL.oneBackTask.current_arrow_index].direction);

                //see if key press is correct todo: same vs different!!!
                if (this.directions[GLOBAL.lastKeyPressed] === GLOBAL.oneBackTask.arrowViewArray[GLOBAL.oneBackTask.current_arrow_index - 1].direction) {
                    this.updateCorrectScore();
                } else {
                    this.updateIncorrectScore();
                }
            }

            GLOBAL.oneBackTask.current_arrow_index += 1;
        }
    };

    p.arrowTweenOutFinished = function () {

        this.removeChild(this.currentArrow);
        this.currentArrow = this.addChild(GLOBAL.oneBackTask.arrowViewArray[GLOBAL.oneBackTask.current_arrow_index]);
        this.currentArrow.tweenIn();
        //console.log(this.currentArrow.direction);
    };

    p.instructionsTweenOutFinished = function () {

        var slide_time = 600;

        this.off("done_tweening_out", this.instructionsDoneTweening);
        //this.removeChild(this.instructions);
        this.instructions = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 8, GLOBAL.GameInfo.width * .6, GLOBAL.GameInfo.height / 4)
            .setTextSize(30)
            .setText(this.options.newInstructions)
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('x', -500, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.instructions);
    };

    p.updateCorrectScore = function () {

        //update score
        GLOBAL.oneBackTask.numberCorrect += 1;

        //update text
        this.scorecardCorrect.setText(GLOBAL.oneBackTask.numberCorrect);

        //do flash thing
        createjs.Tween.get(this.scorecardCorrectFlash).to({alpha:1}).to({alpha:0},500,createjs.Ease.cubicOut);
        this.scorecardCorrect.setText(GLOBAL.oneBackTask.numberCorrect);
        createjs.Tween.tick(1);
    };

    p.updateIncorrectScore = function () {

        //update score
        GLOBAL.oneBackTask.numberIncorrect += 1;

        //update text
        this.scorecardIncorrect.setText(GLOBAL.oneBackTask.numberIncorrect);

        createjs.Tween.get(this.scorecardIncorrectFlash).to({alpha:1}).to({alpha:0},500,createjs.Ease.cubicOut);
        this.scorecardIncorrect.setText(GLOBAL.oneBackTask.numberIncorrect);
        createjs.Tween.tick(1);

    };


    scope.OneBackTaskView = OneBackTaskView;

}(window.GLOBAL));