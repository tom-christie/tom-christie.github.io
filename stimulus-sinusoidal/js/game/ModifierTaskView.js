
/**
 * Created by Tom on 3/27/14.
 *
 * View object for the 1-back task - takes info from the 1BackTask object and displays it on the screen.
 *
 * Subclass of createjs.Container
 *
 * todo - why is the "trying to init trial" happening twice?
 *
 */


(function (scope) {

    function ModifierTaskView(options) {
        this.initialize(options);
    }


    ModifierTaskView.prototype = new createjs.Container(); //inherits from container
    ModifierTaskView.prototype.Container_initialize = ModifierTaskView.prototype.initialize;

    var p = ModifierTaskView.prototype;


    p.initialize = function (options) {

        this.verticalOffset = 50;
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
        this.scorecardIncorrect = new Button(GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2 + this.verticalOffset, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor(GLOBAL.GameInfo.scorecardIncorrectColor)
            .setRadius(20)
            .setTextSize(GLOBAL.GameInfo.scorecardDigitSize)
            .setText("0")
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('x', -300, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('x', -300, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardIncorrect);
        //console.log(this.scorecardIncorrect);

        this.scorecardIncorrectFlash = new Button(GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2 + this.verticalOffset, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor("#FFF")
            .setText("")
            .setRadius(20)
            .setAlpha(0)
            .tweenIn('x', -300, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('x', -300, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardIncorrectFlash);

        //make correct scorecard
        this.scorecardCorrect = new Button(4 * GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2 + this.verticalOffset, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor(GLOBAL.GameInfo.scorecardCorrectColor)
            .setRadius(20)
            .setTextSize(GLOBAL.GameInfo.scorecardDigitSize)
            .setText("0")
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('x', 300, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('x', 300, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardCorrect);

        this.scorecardCorrectFlash = new Button(4 * GLOBAL.GameInfo.width / 5, GLOBAL.GameInfo.height / 2 + this.verticalOffset, parseInt(GLOBAL.GameInfo.scorecardWidth), parseInt(GLOBAL.GameInfo.scorecardHeight))
            .setColor("#FFF")
            .setText("")
            .setAlpha(0)
            .setRadius(20)
            .tweenIn('x', 300, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('x', 300, 400, createjs.Ease.backIn);
        this.addChild(this.scorecardCorrectFlash);


        //make instructions at the top
        this.instructions = new Button(GLOBAL.GameInfo.width / 2, 0.1 * GLOBAL.GameInfo.height, GLOBAL.GameInfo.width * .9, GLOBAL.GameInfo.height / 4)
            .setTextSize(30)
            .setText(this.options.instructions)
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('y', -200, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('y', -200, 400, createjs.Ease.backIn);
        this.addChild(this.instructions);


        //make round indicator
        this.roundCounter = new Button(60, GLOBAL.GameInfo.height - 30, GLOBAL.GameInfo.width * .6, GLOBAL.GameInfo.height / 4)
            .setTextSize(15)
            .setText("Round {0} of {1}".format(GLOBAL.modifierTask.currentTrialNumber + 1, GLOBAL.modifierTask.numTrials))
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('y', 200, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('x', -200, 400, createjs.Ease.backIn);
        this.addChild(this.roundCounter);

        //make timer
        //at the bottom of the stack, create a timer
        this.timerHolder = new Button(GLOBAL.GameInfo.width / 2, .93 * GLOBAL.GameInfo.height, parseInt(GLOBAL.GameInfo.timerWidth), parseInt(GLOBAL.GameInfo.timerHeight))
            .setColor(GLOBAL.GameInfo.timerUnfilledColor)
            .setText("")
            .setAlpha(.6)
            .tweenIn('y', 1000, 0, slide_time, createjs.Ease.elasticOut)
            .tweenOut('y', 1000, 400, createjs.Ease.backIn);
        this.addChild(this.timerHolder);


        //add modifier to view
        this.currentModifier1 = GLOBAL.modifierTask.modifierViewArray[0][0];
        this.addChild(this.currentModifier1);
        this.currentModifier2 = GLOBAL.modifierTask.modifierViewArray[0][1];
        this.addChild(this.currentModifier2);
        this.currentModifier3 = GLOBAL.modifierTask.modifierViewArray[0][2];
       this.addChild(this.currentModifier3);


        //add first arrow to view
        for (i = 0; i < GLOBAL.modifierTask.arrowViewArray.length; i++) {
            GLOBAL.modifierTask.arrowViewArray[i].y = .5 * GLOBAL.GameInfo.height + this.verticalOffset;
            GLOBAL.modifierTask.arrowViewArray[i].scaleX = .85;
            GLOBAL.modifierTask.arrowViewArray[i].scaleY = .85;
        }
        this.currentArrow = this.addChild(GLOBAL.modifierTask.arrowViewArray[0]);
        this.currentArrow.tweenIn();

        //this event is called when the arrow is done shrinking, in preparation for a new arrow to be displayed on the screen.
        //it's like a callback
        this.doneShrinkingListener = this.on("done_tweening_out", this.loadNewArrowsAndModifiers);


        //start timer
        this.date = new Date();
        this.startTime = this.date.getTime();
        self.timerStarted = false;

    };


    p.addArrow = function () {

    };

    p.onTick = function () {
        this.checkTimesUp();
    };

    p.checkTimesUp = function (){
        if (this.timerStarted){//if the trial has started
            this.currentDate = new Date();
            this.currentResponseDuration = (this.currentDate.getTime() -  this.responseStartTime)/1000;
//            console.log(this.currentResponseDuration, this.responseStartTime , this.responseDate.getTime(), GLOBAL.modifierTask.timeLimits[GLOBAL.modifierTask.current_arrow_index]);
            if(this.currentResponseDuration > GLOBAL.modifierTask.timeLimits[GLOBAL.modifierTask.current_arrow_index]){

                this.currentArrow.tweenOut();
                this.currentModifier1.tweenOut();
                this.currentModifier2.tweenOut();
                this.currentModifier3.tweenOut();

                //record key press
                var d = new Date();
                GLOBAL.modifierTask.responseTimes[GLOBAL.modifierTask.current_arrow_index] = d.getTime() - this.startTime;
                GLOBAL.modifierTask.responses[GLOBAL.modifierTask.current_arrow_index] = "TOOSLOW";

//                console.log('testing');
//                console.log('key pressed',GLOBAL.lastKeyPressed);
//                console.log('key pressed', keyMap[GLOBAL.lastKeyPressed]);
//                console.log('target',GLOBAL.modifierTask.targetResponses[GLOBAL.modifierTask.current_arrow_index]);

                if (GLOBAL.modifierTask.current_arrow_index === -1) {
                    //tween out instructions
                    this.instructions.tweenOutSelf();
                } else {
                    this.updateIncorrectScore();
                }
                GLOBAL.modifierTask.current_arrow_index += 1;

                //reset response clock
                this.responseDate = new Date();
                this.responseStartTime = this.responseDate.getTime();

            }
        }
    };

    p.keyPressed = function () {
        //check for keypress
        //if first tick, proceed and change instructions

//        var validKeys = ["Up", "Down", "Left", "Right", "U+0053", "U+0044"]; //last two are S, D
        var validKeys = ["up", "down", "left", "right"]; //last two are S, D
        var keyMap = {"right": 0,
            "up": 1,
            "left": 2,
            "down": 3,
        0: "right",
        1: "up",
        2: "left",
        3: "down"
        };
        console.log("key pressed", GLOBAL.lastKeyPressed, keyMap[GLOBAL.lastKeyPressed]);

        if (GLOBAL.state.is("MODIFIED_TRAIN")) {

            if ($.inArray(GLOBAL.lastKeyPressed, validKeys) >= 0) { //if last key was an arrow key

                //if timer isn't going, start the timer
                if(!GLOBAL.currentView.view.timerStarted){
                    GLOBAL.currentView.view.startTimer();
                    GLOBAL.currentView.view.timerStarted = true;
                }

                this.currentArrow.tweenOut();
                this.currentModifier1.tweenOut();
                this.currentModifier2.tweenOut();
                this.currentModifier3.tweenOut();

                //record key press
                var d = new Date();
                GLOBAL.modifierTask.responseTimes[GLOBAL.modifierTask.current_arrow_index] = d.getTime() - this.startTime;
                GLOBAL.modifierTask.responses[GLOBAL.modifierTask.current_arrow_index] = keyMap[GLOBAL.lastKeyPressed];

                console.log('testing');
                console.log('key pressed',GLOBAL.lastKeyPressed);
                console.log('key pressed', keyMap[GLOBAL.lastKeyPressed]);
                console.log('target',GLOBAL.modifierTask.targetResponses[GLOBAL.modifierTask.current_arrow_index]);

                if (GLOBAL.modifierTask.current_arrow_index === -1) {
                    //tween out instructions
                    this.instructions.tweenOutSelf();
                } else {

                    if (keyMap[GLOBAL.lastKeyPressed] === GLOBAL.modifierTask.targetResponses[GLOBAL.modifierTask.current_arrow_index]) {
                        this.updateCorrectScore();
                    } else {
                        this.updateIncorrectScore();
                    }
                }
                GLOBAL.modifierTask.current_arrow_index += 1;

            //reset response clock
            this.responseDate = new Date();
            this.responseStartTime = this.responseDate.getTime();


            }
        } else if (GLOBAL.state.is("MODIFIED_TRAIN_RESULTS")) {

            this.resultsInstructions.tweenOutSelf();

        } else if (GLOBAL.state.is("MODIFIED_TRAIN_RESULTS_FINAL")) {

            this.finalInstructions.tweenOutSelf();
        }




    };




    p.loadNewArrowsAndModifiers = function (temp) {

        //this is done when
        this.removeChild(this.currentArrow);
        this.currentArrow = this.addChild(GLOBAL.modifierTask.arrowViewArray[GLOBAL.modifierTask.current_arrow_index]);
        this.currentArrow.tweenIn();

        this.removeChild(this.currentModifier1);
        this.removeChild(this.currentModifier2);
        this.removeChild(this.currentModifier3);
        this.currentModifier1 = this.addChild(GLOBAL.modifierTask.modifierViewArray[GLOBAL.modifierTask.current_arrow_index][0]);
        this.currentModifier2 = this.addChild(GLOBAL.modifierTask.modifierViewArray[GLOBAL.modifierTask.current_arrow_index][1]);
        this.currentModifier3 = this.addChild(GLOBAL.modifierTask.modifierViewArray[GLOBAL.modifierTask.current_arrow_index][2]);
        this.currentModifier1.tweenIn();
        this.currentModifier2.tweenIn();
        this.currentModifier3.tweenIn();

    };

    p.startTimer = function () {

        var slide_time = 600;
        this.instructions = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 8, GLOBAL.GameInfo.width * .6, GLOBAL.GameInfo.height / 4)
            .setTextSize(30)
            .setText(this.options.newInstructions)
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('x', -500, 0, slide_time, createjs.Ease.backOut)
            .tweenOut('x', 800, 400, createjs.Ease.backIn);
        this.addChild(this.instructions);


        //add timer bar
        this.timerIndicator = new Button(GLOBAL.GameInfo.width / 2, .93 * GLOBAL.GameInfo.height, parseInt(GLOBAL.GameInfo.timerWidth), parseInt(GLOBAL.GameInfo.timerHeight))
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
            .to(target, 1000 * parseFloat(GLOBAL.GameInfo.modifierDuration))
            .call(GLOBAL.modifierTask.levelComplete)
            .on("change", this.timerIndicator.redraw, this.timerIndicator);
        createjs.Tween.tick(1);

    };

    p.updateCorrectScore = function () {

        //update score
        GLOBAL.modifierTask.numberCorrect += 1;

        //update text
        this.scorecardCorrect.setText(GLOBAL.modifierTask.numberCorrect);

        //do flash thing
        createjs.Tween.get(this.scorecardCorrectFlash).to({alpha: 1}).to({alpha: 0}, 500, createjs.Ease.cubicOut);
        this.scorecardCorrect.setText(GLOBAL.modifierTask.numberCorrect);
        createjs.Tween.tick(1);
    };

    p.updateIncorrectScore = function () {

        //update score
        GLOBAL.modifierTask.numberIncorrect += 1;

        //update text
        this.scorecardIncorrect.setText(GLOBAL.modifierTask.numberIncorrect);

        createjs.Tween.get(this.scorecardIncorrectFlash).to({alpha: 1}).to({alpha: 0}, 500, createjs.Ease.cubicOut);
        this.scorecardIncorrect.setText(GLOBAL.modifierTask.numberIncorrect);
        createjs.Tween.tick(1);

    };

    p.tweenOut = function () {
        //'s'("i was called now!!!");
        var l = this.getNumChildren();
        // iterate through all the children and tween out:
        for (var i = 0; i < l; i++) {
            var child = this.getChildAt(i);
            if (child.isButton || child.isArrow || child.isModifier) {
                child.tweenOutSelf();
            }
        }
    };

    p.removeChildren = function () {
        var l = this.getNumChildren();
        // iterate through all the children and tween out:
        //gets rid of bg as well...?? it should but it doesn't
        while (child = this.getChildAt(l - 1) && l < 0) {
            this.removeChild(child);
        }

    };

    p.showResults = function () {
        console.log("showing results");
        //get results from GLOBAL.modifierTask
        this.resultsInstructions = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 2 - 30, GLOBAL.GameInfo.width * .6, GLOBAL.GameInfo.height / 4)
            .setTextSize(30)
            .setText(this.options.resultsInstructions)
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('y', -200, 0, 600, createjs.Ease.backOut)
            .tweenOut('y', -1000, 400, createjs.Ease.backIn)
            .changeStateWhenFinishedTweeningOut(GLOBAL.state.CALLmodifiedTrainNewTrial);
        this.addChild(this.resultsInstructions);
    };

    p.showFinalResults = function () {
        //console.log("showing results");
        //get results from GLOBAL.modifierTask
        this.finalInstructions = new Button(GLOBAL.GameInfo.width / 2, GLOBAL.GameInfo.height / 2, GLOBAL.GameInfo.width * .6, GLOBAL.GameInfo.height / 4)
            .setTextSize(30)
            .setText(this.options.finalInstructions)
            .setTextColor(GLOBAL.GameInfo.scorecardDigitColor)
            .tweenIn('y', -200, 0, 600, createjs.Ease.backOut)
            .tweenOut('y', -1000, 400, createjs.Ease.backIn)
            .changeStateWhenFinishedTweeningOut(GLOBAL.state.CALLmodifierToComplete);
        this.addChild(this.finalInstructions);
    };


    scope.ModifierTaskView = ModifierTaskView;

}(window.GLOBAL));