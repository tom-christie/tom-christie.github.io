/**
 * Created by Tom on 3/27/14.
 *
 * Data related to the 1-back task
 *
 */


(function (scope) {

    function OneBackTask() {
        this.initialize();
        this.initTrial();
    }

    OneBackTask.prototype = {

        view: null,

        initialize: function () {

            this.directions = {"Right": 0,
                "Up": 1,
                "Left": 2,
                "Down": 3};

            this.numTrials = parseInt(GLOBAL.GameInfo.oneBackTrialCount);
            this.currentTrialNumber = 0;

            this.correctResponses = [];
            this.incorrectResponses = [];


            this.options = {
                duration: parseInt(GLOBAL.GameInfo.oneBackDuration),
                instructions: "Press S or D to start the game.",
                newInstructions: "Press S if the arrow is the same as the previous arrow.\nPress D if it is different.",
                resultsInstructions: "Way to go.\n\nPress SPACEBAR to begin the next round.",
                finalInstructions: "Way to go.\nPress any key to quit."
            };

        },

        initTrial: function () {

            var i, temp;
            this.current_arrow_index = 0;

            var markovSameProbs = [.9, .75, .25, .1];

            this.probSame = markovSameProbs[Math.floor(Math.random() * 4)];
            //console.log(this.probSame,'prob same');
            //STIMULUS
            //make a list of arrowViews
            this.numArrowViews = 500;
            var directions = new Array(this.numArrowViews);
            this.arrowViewArray = new Array(this.numArrowViews);
            this.arrowViewArray[0] = new GLOBAL.ArrowView(0, Math.floor(Math.random() * 4));
            for (i = 1; i < this.numArrowViews; i++) {
                if (Math.random() < this.probSame) {
                    //same
                    this.arrowViewArray[i] = new GLOBAL.ArrowView(i, this.arrowViewArray[i - 1].direction);
                    directions[i] = this.arrowViewArray[i - 1].direction;
                } else {
                    //different
                    temp = Math.floor(Math.random() * 4);
                    while (temp === directions[i - 1]) {
                        temp = Math.floor(Math.random() * 4);
                    }
                    this.arrowViewArray[i] = new GLOBAL.ArrowView(i, temp);
                    directions[i] = temp;
                }
            }

            this.targetResponses = new Array(this.numArrowViews);
            this.targetResponses[0] = 'X'; //first one doesn't matter
            for (i = 1; i < this.numArrowViews; i++) {
                if (this.arrowViewArray[i].direction === this.arrowViewArray[i - 1].direction) {
                    this.targetResponses[i] = 'S';
                }
                else {
                    this.targetResponses[i] = 'D';
                }
            }

            //RESPONSES
            this.numberCorrect = 0;
            this.numberIncorrect = 0;
            this.responses = new Array(this.numArrowViews);
            this.responseTimes = new Array(this.numArrowViews);
        },


        onTick: function () {
            this.view.onTick();
        },

        levelComplete: function () {

            //record results
            var results = "1-back-task\t";
            results += "trial-";
            results += (GLOBAL.oneBackTask.currentTrialNumber).toString();
            results += "\t";
            results += "probsame-";
            results += (GLOBAL.oneBackTask.probSame).toString();
            results += "\t";
            for (var i = 1; i < GLOBAL.oneBackTask.current_arrow_index; i++) {
                results += "response-"
                results += i.toString();
                results += "\t";
                //record correct response
                results += (GLOBAL.oneBackTask.targetResponses[i]).toString();
                results += "\t";
                //record actual response
                results += (GLOBAL.oneBackTask.responses[i]).toString(); //response
                results += "\t";
                results += (GLOBAL.oneBackTask.responseTimes[i]).toString(); //time taken
                results += "\t";
            }
            GLOBAL.recordResults(results);
            //console.log(results);
            //transition states
            GLOBAL.state.CALLoneBackTrialFinished();


        },

        keyPressed: function () {

            this.view.keyPressed();
        },

        makeNewArrow: function () {


        },

        startNewTrial: function () {
            this.view = null;
            this.initTrial();
            this.view = new GLOBAL.OneBackTaskView(this.options);
            this.currentTrialNumber += 1;
        },

        makeModifierOneBackTask: function () {


        }



    };


    scope.OneBackTask = OneBackTask;

}(window.GLOBAL));