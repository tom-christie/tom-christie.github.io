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
            .tweenIn('x', -300, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('x', -300, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardIncorrect);
        //console.log(this.scorecardIncorrect);

        this.scorecardIncorrectFlash = new Button(GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor("#FFF")
            .setText("")
            .setRadius(20)
            .setAlpha(0)
            .tweenIn('x', -300, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('x', -300, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardIncorrectFlash);

        //make correct scorecard
        this.scorecardCorrect = new Button(4 * GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor(GLOBAL.GameInfo.scorecardCorrectColor)
            .setRadius(20)
            .setTextSize(GLOBAL.GameInfo.scorecardDigitSize)
            .setText("0")
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('x', 300, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('x', 300, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardCorrect);

        this.scorecardCorrectFlash = new Button(4 * GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor("#FFF")
            .setText("")
            .setAlpha(0)
            .setRadius(20)
            .tweenIn('x', 300, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('x', 300, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardCorrectFlash);


        //make instructions at the top
        this.instructions = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 8, GLOBAL.GameInfo.width * .6, GLOBAL.GameInfo.height / 4)
            .setTextSize(30)
            .setText(this.options.instructions)
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('y', -200, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('y', -200, 400, createjs.Ease.backIn);
        this.addChild(this.instructions);


        //make round indicator
        this.roundCounter = new Button(60, GLOBAL.GameInfo.height -30, GLOBAL.GameInfo.width * .6, GLOBAL.GameInfo.height / 4)
            .setTextSize(15)
            .setText("Round {0} of {1}".format(GLOBAL.oneBackTask.currentTrialNumber+1, GLOBAL.oneBackTask.numTrials))
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('y', 200, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('x', -200, 400, createjs.Ease.backIn);
        this.addChild(this.roundCounter);

        //make timer
        //at the bottom of the stack, create a timer
        this.timerHolder = new Button(GLOBAL.GameInfo.width / 2, 6 * GLOBAL.GameInfo.height / 7, parseInt(GLOBAL.GameInfo.timerWidth), parseInt(GLOBAL.GameInfo.timerHeight))
            .setColor(GLOBAL.GameInfo.timerUnfilledColor)
            .setText("")
            .setAlpha(.6)
            .tweenIn('y', 1000, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('y', 1000, 400, createjs.Ease.backIn);
        this.addChild(this.timerHolder);


        //add first arrow to view
        this.currentArrow = this.addChild(GLOBAL.oneBackTask.arrowViewArray[0]);
        this.currentArrow.tweenIn();

        this.doneTweeningListener = this.on("done_tweening_out", this.arrowTweenOutFinished); //listen for finished tweening
        this.instructionsDoneTweening = this.on("done_tweening_out", this.instructionsTweenOutFinished);

        //start timer
        this.date = new Date();
        this.startTime = this.date.getTime();

    };


    p.addArrow = function () {

    };

    p.onTick = function () {

    };

    p.keyPressed = function () {
        //check for keypress
        //if first tick, proceed and change instructions

//        var validKeys = ["Up", "Down", "Left", "Right", "U+0053", "U+0044"]; //last two are S, D
        var validKeys = ["s", "d"]; //last two are S, D
        var keyMap = {"s": "S",
            "d":"D"
        };
        //("key pressed",GLOBAL.lastKeyPressed, $.inArray(GLOBAL.lastKeyPressed, validKeys));

        if (GLOBAL.state.is("1BACK_TASK")) {

            if ($.inArray(GLOBAL.lastKeyPressed, validKeys) >= 0) { //if last key was an arrow key


                this.currentArrow.tweenOut();

                //record key press
                var d = new Date();
                GLOBAL.oneBackTask.responseTimes[GLOBAL.oneBackTask.current_arrow_index] = d.getTime() - this.startTime;
                GLOBAL.oneBackTask.responses[GLOBAL.oneBackTask.current_arrow_index] = keyMap[GLOBAL.lastKeyPressed];

                //console.log('testing', keyMap[GLOBAL.lastKeyPressed], GLOBAL.oneBackTask.targetResponses[GLOBAL.oneBackTask.current_arrow_index]);

                if (GLOBAL.oneBackTask.current_arrow_index === 0) {
                    //tween out instructions
                    this.instructions.tweenOutSelf();

                } else {

                    //console.log(GLOBAL.state.current, this.directions[GLOBAL.lastKeyPressed],
                    //    GLOBAL.oneBackTask.arrowViewArray[GLOBAL.oneBackTask.current_arrow_index].direction);
                    //console.log(keyMap[GLOBAL.lastKeyPressed], GLOBAL.oneBackTask.targetResponses[GLOBAL.oneBackTask.current_arrow_index]);
                    if (keyMap[GLOBAL.lastKeyPressed] === GLOBAL.oneBackTask.targetResponses[GLOBAL.oneBackTask.current_arrow_index]) {
                        this.updateCorrectScore();
                    } else {
                        this.updateIncorrectScore();
                    }
                }
                GLOBAL.oneBackTask.current_arrow_index += 1;
            }
        } else if (GLOBAL.state.is("1BACK_RESULTS")) {

            this.resultsInstructions.tweenOutSelf();

        } else if (GLOBAL.state.is("1BACK_RESULTS_FINAL")) {

            this.finalInstructions.tweenOutSelf();
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


        //add timer bar
        this.timerIndicator = new Button(GLOBAL.GameInfo.width / 2, 6 * GLOBAL.GameInfo.height / 7, parseInt(GLOBAL.GameInfo.timerWidth), parseInt(GLOBAL.GameInfo.timerHeight))
            .setColor(GLOBAL.GameInfo.timerFilledColor)
            .setText("")
            //.tweenIn('y', 1000, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('y', 1000, 400, createjs.Ease.backIn);
        this.addChild(this.timerIndicator);

        //draw timer indicator
        start = {width: 0};
        target = {width: parseFloat(GLOBAL.GameInfo.timerWidth)};
        createjs.Tween.get(this.timerIndicator)
            .to(start)
            .to(target, 1000 * parseFloat(GLOBAL.GameInfo.oneBackDuration))
            .call(GLOBAL.oneBackTask.levelComplete)
            .on("change", this.timerIndicator.redraw, this.timerIndicator);
        createjs.Tween.tick(1);

    };

    p.updateCorrectScore = function () {

        //update score
        GLOBAL.oneBackTask.numberCorrect += 1;

        //update text
        this.scorecardCorrect.setText(GLOBAL.oneBackTask.numberCorrect);

        //do flash thing
        createjs.Tween.get(this.scorecardCorrectFlash).to({alpha: 1}).to({alpha: 0}, 500, createjs.Ease.cubicOut);
        this.scorecardCorrect.setText(GLOBAL.oneBackTask.numberCorrect);
        createjs.Tween.tick(1);
    };

    p.updateIncorrectScore = function () {

        //update score
        GLOBAL.oneBackTask.numberIncorrect += 1;

        //update text
        this.scorecardIncorrect.setText(GLOBAL.oneBackTask.numberIncorrect);

        createjs.Tween.get(this.scorecardIncorrectFlash).to({alpha: 1}).to({alpha: 0}, 500, createjs.Ease.cubicOut);
        this.scorecardIncorrect.setText(GLOBAL.oneBackTask.numberIncorrect);
        createjs.Tween.tick(1);

    };

    p.tweenOut = function () {
        //'s'("i was called now!!!");
        var l = this.getNumChildren();
        // iterate through all the children and tween out:
        for (var i = 0; i < l; i++) {
            var child = this.getChildAt(i);
            if (child.isButton || child.isArrow) {
                child.tweenOutSelf();
            }
        }
    };

    p.removeChildren = function () {
        var l = this.getNumChildren();
        // iterate through all the children and tween out:
        //gets rid of bg as well...?? it should but it doesn't
        while (child = this.getChildAt(l-1) && l < 0) {
            this.removeChild(child);
        }
//        for (var i = 0; i < l; i++) {
//            var child = this.getChildAt(i);
//            console.log(child);
//            if (child.isButton || child.isArrow) {
//                this.removeChild(child);
//            }
//        }

    };

    p.showResults = function () {
        //console.log("showing results");
        //get results from GLOBAL.oneBackTask
        this.resultsInstructions = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 2 - 30, GLOBAL.GameInfo.width * .6, GLOBAL.GameInfo.height / 4)
            .setTextSize(30)
            .setText(this.options.resultsInstructions)
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('y', -200, 0, 600, createjs.Ease.backOut)
            .tweenOut('y', -1000, 400, createjs.Ease.backIn)
            .changeStateWhenFinishedTweeningOut(GLOBAL.state.CALLoneBackNewTrial);
        this.addChild(this.resultsInstructions);
    };

    p.showFinalResults = function () {
        //console.log("showing results");
        //get results from GLOBAL.oneBackTask
        this.finalInstructions = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 2, GLOBAL.GameInfo.width * .6, GLOBAL.GameInfo.height / 4)
            .setTextSize(30)
            .setText(this.options.finalInstructions)
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('y', -200, 0, 600, createjs.Ease.backOut)
            .tweenOut('y', -1000, 400, createjs.Ease.backIn)
            .changeStateWhenFinishedTweeningOut(GLOBAL.state.CALLoneBackToComplete);
        this.addChild(this.finalInstructions);
    };


    scope.OneBackTaskView = OneBackTaskView;

}(window.GLOBAL));