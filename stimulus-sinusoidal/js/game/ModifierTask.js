/**
 * Created by Tom on 3/27/14.
 *
 * todo - make "alpha" values vary like probSame did
 * todo - record results
 * todo - ask Paul what he thinks about alpha values -
 *      arrowAlpha is the probability that arrows will continue to follow the set pattern
 *      modifierAlpha is the probability that the modifiers map an arrow to itself
 * todo - WHAT ABOUT REWARD? - there are several small experiments here rather than one large one - DO REWARD FIRST
 *
 *
 */

(function (scope) {

    function ModifierTask() {
        this.initialize();
    }

    ModifierTask.prototype = {

        view: null,

        initialize: function () {

            this.directions = {"Right": 0,
                "Up": 1,
                "Left": 2,
                "Down": 3};

            this.numTrials = parseInt(GLOBAL.GameInfo.modifierTrialCount);
            this.currentTrialNumber = 0;

            this.correctResponses = [];
            this.incorrectResponses = [];


            this.options = {
                duration: parseInt(GLOBAL.GameInfo.modifierDuration),
                instructions: "",//Press S or D to start the game.",
                newInstructions: "",//"Press S if the arrow is the same as the previous arrow.\nPress D if it is different.",
                resultsInstructions: "Way to go.\n\nPress SPACEBAR to begin the next round.",
                finalInstructions: "Way to go.\nPress any key to quit."
            };

        },

        initTrial: function () {
            console.log('trying to init trial');
            var i, j, temp;
            this.current_arrow_index = 0;


            //set up markov structure of arrows
            /*
             * directions
             * 0 = right
             * 1 = up
             * 2 = left
             * 3 = down
             */

            //up down left right
            var arrowAlpha = GLOBAL.GameInfo.arrowAlpha; //base transition probability
            this.transitionMatrixDeterministic = [
                [0, 1, 0, 0],
                [0, 0, 0, 1],
                [1, 0, 0, 0],
                [0, 0, 1, 0]
            ];
//            this.transitionMatrix = [
//                [(1 - arrowAlpha) / 3, arrowAlpha, (1 - arrowAlpha) / 3, (1 - arrowAlpha) / 3], // right -> up
//                [(1 - arrowAlpha) / 3, (1 - arrowAlpha) / 3, (1 - arrowAlpha) / 3, arrowAlpha], // up -> down
//                [          arrowAlpha, (1 - arrowAlpha) / 3, (1 - arrowAlpha) / 3, (1 - arrowAlpha) / 3], // left -> right
//                [(1 - arrowAlpha) / 3, (1 - arrowAlpha) / 3, arrowAlpha, (1 - arrowAlpha) / 3] // down -> left
//            ];

            this.translations = [
                {0: 0,
                    1: 3,
                    2: 2,
                    3: 1},//up down
                {0: 2,
                    1: 1,
                    2: 0,
                    3: 3
                },//left right
                {0: 3,
                    1: 0,
                    2: 1,
                    3: 2},//clockwise
                {0: 1,
                    1: 2,
                    2: 3,
                    3: 0}//counter-clockwise
            ];


            //make a list of arrowViews
            this.numArrowViews = 500;
            this.arrowViewArray = new Array(this.numArrowViews);

            //start with ranndom direction
            this.arrowViewArray[0] = new GLOBAL.ArrowView(0, Math.floor(Math.random() * 4));

            //initialize with deterministic markov sequence
            for (i = 1; i < this.numArrowViews; i++) {
                var fromArrow = this.arrowViewArray[i - 1].direction;
                for (j = 0; j < 4; j++) {
                    if (this.transitionMatrixDeterministic[fromArrow][j] === 1) {
                        var toArrow = j;
                        break;
                    }
                }
                this.arrowViewArray[i] = new GLOBAL.ArrowView(i, toArrow);
            }

            //insert deviations from deterministic transition
            for (i = 1; i < this.numArrowViews; i++) {
                //if random number is higher than the same-transition probability, change current arrow
                if (Math.random() > arrowAlpha) { //same as rand() < (1-arrowAlpha)
                    var originalDirection = this.arrowViewArray[i].direction;
                    //make sure the new direction is different than the old
                    do {
                        newDirection = Math.floor(Math.random() * 4);
                    } while (newDirection === originalDirection);

                    this.arrowViewArray[i] = new GLOBAL.ArrowView(i, newDirection);
                }
            }

            //add modifiers
            var modifier1, modifier2, modifier3, currentArrowDirection, newArrowDirection1, newArrowDirection2, newArrowDirection3;
            var modifierAlpha = GLOBAL.GameInfo.modifierAlpha;
            this.modifierViewArray = new Array(this.numArrowViews);
            this.targetResponses = new Array(this.numArrowViews);
            //console.log('alpha',modifierAlpha)
            for (i = 0; i < this.numArrowViews; i++) {

                if (Math.random() > modifierAlpha) { //same as rand() < (1-modifierAlpha)
                    //console.log('different')
                    //make a sequence of modifiers that DOESN'T map the arrow to itself
                    while (true) {
                        modifier1 = Math.floor(Math.random() * 4);
                        modifier2 = Math.floor(Math.random() * 4);
                        modifier3 = Math.floor(Math.random() * 4);
                        currentArrowDirection = this.arrowViewArray[i].direction;

                        newArrowDirection1 = this.translations[modifier1][currentArrowDirection];
                        newArrowDirection2 = this.translations[modifier2][newArrowDirection1];
                        newArrowDirection3 = this.translations[modifier3][newArrowDirection2];
                        //newArrowDirection = Math.floor(Math.random()*4);
                        //console.log('want different', currentArrowDirection, newArrowDirection);
                        if (newArrowDirection3 != currentArrowDirection) {
                            break;
                        }
                    }
                } else {
                    //console.log('same')
                    //make a sequence of modifiers that DOES map the arrow to itself
                    while (1) {
                        modifier1 = Math.floor(Math.random() * 4);
                        modifier2 = Math.floor(Math.random() * 4);
                        modifier3 = Math.floor(Math.random() * 4);

                        currentArrowDirection = this.arrowViewArray[i].direction;
                        newArrowDirection1 = this.translations[modifier1][currentArrowDirection];
                        newArrowDirection2 = this.translations[modifier2][newArrowDirection1];
                        newArrowDirection3 = this.translations[modifier3][newArrowDirection2];
                        //newArrowDirection = currentArrowDirection;//Math.floor(Math.random()*4);
                        //console.log('want same', currentArrowDirection, newArrowDirection);
                        if (newArrowDirection3 === currentArrowDirection) {
                            break;
                        }
                    }
                    var keyMap = {"right": 0,
                        "up": 1,
                        "left": 2,
                        "down": 3,
                        0: "right",
                        1: "up",
                        2: "left",
                        3: "down"
                    };
//                    var modMap = {
//                        0:"up-down",
//                        1:"left-right",
//                        2:"clockwise",
//                        3:"counter-clockwise"
//                    };
//                    console.log("CREATION");
//                    console.log('new',i, 'direction',currentArrowDirection, keyMap[currentArrowDirection]);
//                    console.log('modified1', modMap[modifier1],' -> ',newArrowDirection1, keyMap[newArrowDirection1]);
//                    console.log('modified2', modMap[modifier2],' -> ',newArrowDirection2, keyMap[newArrowDirection2]);
//                    console.log('target', modMap[modifier3],' -> ', newArrowDirection3, keyMap[newArrowDirection3]);


                }
                this.modifierViewArray[i] = [
                    new GLOBAL.ModifierView(i, 0, modifier1) ,
                    new GLOBAL.ModifierView(i, 1, modifier2) ,
                    new GLOBAL.ModifierView(i, 2, modifier3)
                ];

                //record what the target response is according to the modifier
                this.targetResponses[i] = newArrowDirection3;

            }

            //ADD TIMING CONSTRAINTS
            //TODO - now it's a function of response number - should it be a function of time instead?
            this.timeLimits = new Array(this.numArrowViews);
            var phase = Math.random() * 60; //to randomize where along the sine curve the time limits start
            for(i = 0; i<this.numArrowViews; i++){
                this.timeLimits[i] = (GLOBAL.GameInfo.maxTimeAllowed - GLOBAL.GameInfo.minTimeAllowed)/2 * Math.sin((i+phase)*GLOBAL.GameInfo.sinFreqConstant) + (GLOBAL.GameInfo.maxTimeAllowed - GLOBAL.GameInfo.minTimeAllowed)/2 + 1;
            }
            console.log(this.timeLimits);


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

//                //record results
//                var results = "modifier-task\t";
//                results += "trial-";
//                results += (GLOBAL.modifierTask.currentTrialNumber).toString();
//                results += "\t";
//                results += "probsame-";
//                results += (GLOBAL.modifierTask.probSame).toString();
//                results += "\t";
//                for (var i = 1; i < GLOBAL.modifierTask.current_arrow_index; i++) {
//                    results += "response-"
//                    results += i.toString();
//                    results += "\t";
//                    //record correct response
//                    results += (GLOBAL.modifierTask.targetResponses[i]).toString();
//                    results += "\t";
//                    //record response
//                    results += (GLOBAL.modifierTask.responses[i]).toString(); //response
//                    results += "\t";
//                    results += (GLOBAL.modifierTask.responseTimes[i]).toString(); //time taken
//                    results += "\t";
//                }
//                GLOBAL.recordResults(results);
//                //transition states
            GLOBAL.state.CALLmodifierTrialFinished();


        },

        keyPressed: function () {

            this.view.keyPressed();
        },

        makeNewArrow: function () {


        },

        startTimer: function () {
            this.initTrial();
            console.log('starting new trial')
            this.view = new GLOBAL.ModifierTaskView(this.options);
            this.currentTrialNumber += 1;
        },

        makeModifierModifierTask: function () {


        }


    };


    scope.ModifierTask = ModifierTask;

}(window.GLOBAL));