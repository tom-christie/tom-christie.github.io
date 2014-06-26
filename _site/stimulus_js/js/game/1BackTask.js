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

            var markovSameProbs = [.5,.6,.7,.8,.9];
            this.probSame = markovSameProbs[Math.floor(Math.random() * 5)];
            //STIMULUS
            //make a list of arrowViews
            this.numArrowViews = 500;
            var directions = new Array(this.numArrowViews);
            this.arrowViewArray = new Array(this.numArrowViews);
            this.arrowViewArray[0] = new GLOBAL.ArrowView(0, Math.floor(Math.random() * 4));
            this.arrowViewArray[1] = new GLOBAL.ArrowView(1, Math.floor(Math.random() * 4));

            //this is where the arrows are selected - at this point, the markov structure is on the arrows, not the responses.
            //we want it to be based on the RESPONSES, i.e. probability that the target RESPONSE is the same.
            //so...start with two arrows. That gives you a "same" or "different" target.
            if (this.arrowViewArray[0].direction == this.arrowViewArray[0].direction) {
                var target = "same";
            } else {
                var target = "different";
            }


            for (i = 2; i < this.numArrowViews; i++) {
                if (Math.random() < this.probSame) {
                    //response target doesn't change
                    if (target === "same") {
                        //still need a same here
                        this.arrowViewArray[i] = new GLOBAL.ArrowView(i, this.arrowViewArray[i - 1].direction);
                        directions[i] = this.arrowViewArray[i - 1].direction;
                        target = "same";
                    } else if (target === "different") {
                        //still need a "different" here
                        temp = Math.floor(Math.random() * 4);
                        while (temp === directions[i - 1]) {
                            temp = Math.floor(Math.random() * 4);
                        }
                        this.arrowViewArray[i] = new GLOBAL.ArrowView(i, temp);
                        directions[i] = temp;
                        target = "different";
                    }
                } else {
                    //response target changes

                    if (target === "same") {
                        //need a different here
                        temp = Math.floor(Math.random() * 4);
                        while (temp === directions[i - 1]) {
                            temp = Math.floor(Math.random() * 4);
                        }
                        this.arrowViewArray[i] = new GLOBAL.ArrowView(i, temp);
                        directions[i] = temp;
                        target = "different";
                    } else if (target === "different") {
                        //need a same here
                        this.arrowViewArray[i] = new GLOBAL.ArrowView(i, this.arrowViewArray[i - 1].direction);
                        directions[i] = this.arrowViewArray[i - 1].direction;
                        target = "same";
                    }
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

            console.log(this.probSame,this.targetResponses);
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
            //transition states
            GLOBAL.state.CALLoneBackTrialFinished();


        },

        keyPressed: function () {

            this.view.keyPressed();
        },

        makeNewArrow: function () {


        },

        startTimer: function () {
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