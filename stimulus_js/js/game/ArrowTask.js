/*
 * Atari Arcade SDK
 * Developed by gskinner.com in partnership with Atari
 * Visit http://atari.com/arcade/developers for documentation, updates and examples.
 *
 * Copyright (c) Atari Interactive, Inc. All Rights Reserved. Atari and the Atari logo are trademarks owned by Atari Interactive, Inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */

/**
 * The Game classes are meant to be used as a reference when creating new Games.
 * @module Game
 */

(function (scope) {

    /**
     * Create a new Game instance
     * @class ArrowTask
     * @constructor
     */

        //make global variable
    window.GLOBAL = window.GLOBAL || {};

    GLOBAL.recordResults = function (results) {
        //the error you get here is just from the RESPONSE - the data seems to be posting fine.
        try {
            $.ajax({

                url: "https://docs.google.com/forms/d/1I0H613EHyQ0r1-y9cOY7T11OaEiUdkhnuVmboLQXL3g/formResponse",
                type: "POST",
                dataType: "xml",
                data: { "entry.1759997082": GLOBAL.userID,
                    "entry.69841564": results}, //this is the question id

                statusCode: {
                    0: function () {
                        //Success message
                    },
                    200: function () {
                        //Success Message
                    }
                }

            });
        } catch (e) {
            console.log('throwing an error', e)

        }

    };


    // First, checks if it isn't implemented yet.
    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }


    function ArrowTask(stage, queue) {
        this.initialize(stage, queue);
    }

    ArrowTask.prototype = {
        //this defines what the basic object looks like, including properties and methods

        // props - these are static
        assets: null,
        stage: null,
        GameInfo: null,
        state: null,

        /**
         * Initialize the ArrowTask. The initialization method is called externally by the
         * Game framework to pass in the assets & stage. <b>This method is required.</b>
         * @method initialize
         * @param {Object} assets An object containing the loaded images, JSON, audio, etc.
         * @param {Stage} stage A reference to the EaselJS Stage
         * @param {Object} GameInfo The information packet containing all the Game info data.         */

        initialize: function (stage, queue) {

            //make keyboard listener
            GLOBAL.keyboardListener = new window.keypress.Listener();
            var keyCombos = [
                {
                    "keys": "s",
                    "prevent_repeat": true,
                    "on_keydown": function (e) {
                        GLOBAL.lastKeyPressed = 's';
                        GLOBAL.currentView.keyPressed();
                    }
                },
                {
                    "keys": "d",
                    "prevent_repeat": true,
                    "on_keydown": function (e) {
                        GLOBAL.lastKeyPressed = 'd';
                        GLOBAL.currentView.keyPressed();
                    }
                },
                {
                    "keys": "space",
                    "prevent_repeat": true,
                    "on_keydown": function (e) {
                        GLOBAL.lastKeyPressed = 'space';
                        GLOBAL.currentView.keyPressed();
                    }
                }
            ];
            GLOBAL.keyboardListener.register_many(keyCombos);

            //get user ID
            while (!GLOBAL.userID) {
                GLOBAL.userID = prompt("Please enter your name or ID number. This will be used to record your results.", "");
            }

            //add these to global so all classes can access it
            GLOBAL.stage = stage;
            GLOBAL.GameInfo = queue.getResult("manifest");
            GLOBAL.assets = queue;

            this.createStateMachine();

            //set the ticker to 30fps
            createjs.Ticker.setFPS(30);
            createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

            //FLICKER IF THIS ISN'T CALLED
            createjs.Ticker.addEventListener('tick', this.onTick.bind(this));//callback function for what to do on each tick

            GLOBAL.stage.enableMouseOver(24); // 24 updates per second


            this.createMenu();

            GLOBAL.doneTweeningListener = GLOBAL.stage.addEventListener("done_tweening_out", GLOBAL.state.handleDoneTweeningOut); //listen for finished tweening


        },

        createMenu: function () {

            //start from non-normal place
//            GLOBAL.oneBackTask = new GLOBAL.OneBackTask();
//            GLOBAL.oneBackTask.startNewTrial();
//            GLOBAL.state.current = "1BACK_TASK";
//            GLOBAL.currentView = GLOBAL.oneBackTask;
//            GLOBAL.stage.addChild(GLOBAL.currentView.view);

//
            GLOBAL.currentView = new GLOBAL.Menu();
            GLOBAL.stage.addChild(GLOBAL.currentView.view);

        },

        createLevel: function () {
            GLOBAL.state.select1Back();
            GLOBAL.currentView = new GLOBAL.Intro();
            GLOBAL.stage.addChild(GLOBAL.currentView.view);

        },

        createStateMachine: function () {
            //game states and events
            //https://github.com/jakesgordon/javascript-state-machine
//            STATES:
//            menu - opening menu, select 1back or modifiedArrows
//            1backIntro - intermediate page for 1-back task (with score!)
//            1backTask - actual task
//            modifiedArrowsIntro - intermediate page for modifier task (with score!)
//            modifiedArrowsTask - actual task
//            complete - results page with $$ rewarded

            GLOBAL.state = StateMachine.create({
                initial: 'MENU',
                events: [

                    //1-back loop
                    { name: 'select1Back', from: 'MENU', to: '1BACK_INTRO' },
                    { name: 'select1BackOK', from: '1BACK_INTRO', to: '1BACK_TASK' },
                    { name: 'oneBackTrialFinished', from: '1BACK_TASK', to: '1BACK_RESULTS' },
                    { name: 'oneBackNewTrial', from: '1BACK_RESULTS', to: '1BACK_TASK'},
                    { name: 'oneBackAllTrialsFinished', from: '1BACK_RESULTS', to: '1BACK_RESULTS_FINAL'},
                    { name: 'oneBackToComplete', from: '1BACK_RESULTS_FINAL', to: 'MENU'},

                    //modified arrows
                    { name: 'selectModifiedArrows', from: 'MENU', to: 'MODIFIED_ARROWS_INTRO' },
                    //training loop - train -> count display -> task -> count display -> task -> etc
                    { name: 'selectModifiedTrain', from: 'MODIFIED_ARROWS_INTRO', to: 'MODIFIED_INTRO_TRAIN'},
                    { name: 'selectModifiedTrainOK', from: 'MODIFIED_INTRO_TRAIN', to: 'MODIFIED_ARROWS_TASK_TRAIN'},
                    { name: 'finishedModifiedArrowsTrain', from: 'MODIFIED_ARROWS_TASK_TRAIN', to: 'MODIFIED_INTRO_TRAIN'},


                    { name: 'selectModifiedTest', from: 'MODIFIED_ARROWS_INTRO', to: 'MODIFIED_INTRO_TEST'},
                    { name: 'selectModifiedTestOK', from: 'MODIFIED_INTRO_TEST', to: 'MODIFIED_ARROWS_TASK_TEST'},
                    { name: 'finishedModifiedArrowsTest', from: 'MODIFIED_ARROWS_TASK_TEST', to: 'MODIFIED_INTRO_TEST'},


                    { name: 'modifiedArrowsToComplete', from: ['MODIFIED_ARROWS_TASK_TRAIN', 'MODIFIED_ARROWS_TASK_TEST'], to: 'COMPLETE'  }
                ],

//                callbacks: {
//                    onselect1Back:  function(event, from, to, msg) { alert('panic! ' + msg);               },
//                    onselectModifiedArrows:  function(event, from, to, msg) { alert('alert! ' + msg);               },
//                    onselectModifiedTrain:  function(event, from, to, msg) { alert('what to do! ' + msg);               },
//                    onselectModifiedTest:  function(event, from, to, msg) { alert('what to do! ' + msg);               }
//                }


            });


            //manually configured callbacks - have to do this because the library isn't playing well with scope (how to fix this?)
            GLOBAL.state.CALLselect1Back = function () {
                GLOBAL.state.select1Back(); //why can't you just call this instead???
                GLOBAL.stage.removeAllChildren();

                //add intro to stage
                GLOBAL.currentView = new GLOBAL.Intro();
                GLOBAL.stage.addChild(GLOBAL.currentView.view);

            };

            GLOBAL.state.CALLselectModifiedArrows = function () {
                GLOBAL.state.selectModifiedArrows();//
                GLOBAL.stage.removeAllChildren();

                //add intro to stage
                GLOBAL.currentView = new GLOBAL.Intro();
                GLOBAL.stage.addChild(GLOBAL.currentView.view);

            };


            GLOBAL.state.CALLselect1BackOK = function () {
                GLOBAL.state.select1BackOK();
                GLOBAL.stage.removeAllChildren();

                GLOBAL.oneBackTask = new GLOBAL.OneBackTask();
                GLOBAL.oneBackTask.startNewTrial();
                //GLOBAL.state.current = "1BACK_TASK";
                GLOBAL.currentView = GLOBAL.oneBackTask;
                GLOBAL.stage.addChild(GLOBAL.currentView.view);

//
//
//                //add 1-back task to stage
//                GLOBAL.currentView = new GLOBAL.OneBackTask();
//                GLOBAL.oneBackTask = GLOBAL.currentView; //just for reference - this is a pointer, right?
//                GLOBAL.stage.addChild(GLOBAL.currentView.view);


            };

            GLOBAL.state.CALLoneBackTrialFinished = function () {

                //close out current trial
                GLOBAL.state.oneBackTrialFinished();
                GLOBAL.currentView.view.tweenOut();


            };

            GLOBAL.state.handleDoneTweeningOut = function () {
                //do stuff depending on what state you're now in


                if (GLOBAL.state.is("1BACK_RESULTS")) {
                    //display results
                    //console.log("here!",GLOBAL.state.current);
                    GLOBAL.oneBackTask.view.removeChildren();
                    GLOBAL.oneBackTask.view.showResults();

                } else if (GLOBAL.state.is("1BACK_TASK")) {


                }

            };


            GLOBAL.state.CALLoneBackNewTrial = function () {

                //if not at last trial
                if (GLOBAL.oneBackTask.currentTrialNumber < GLOBAL.oneBackTask.numTrials) {
                    //console.log("trying to make a new trial");
                    GLOBAL.state.oneBackNewTrial();
                    GLOBAL.stage.removeChild(GLOBAL.oneBackTask.view);
                    GLOBAL.oneBackTask.startNewTrial();
                    GLOBAL.stage.addChild(GLOBAL.currentView.view);
                } else {
                    //finished last trial, do something different
                    GLOBAL.state.oneBackAllTrialsFinished();
                    GLOBAL.oneBackTask.view.removeChildren();
                    GLOBAL.oneBackTask.view.showFinalResults();
                }
            };


            GLOBAL.state.CALLoneBackToComplete = function () {
                GLOBAL.state.oneBackToComplete();
//                GLOBAL.stage.removeChild(GLOBAL.oneBackTask.view);
                //console.log("CALLED");
                GLOBAL.currentView = new GLOBAL.Menu();
                GLOBAL.stage.addChild(GLOBAL.currentView.view);


            };


            GLOBAL.state.CALLselectModifiedTrain = function () {
                GLOBAL.state.selectModifiedTrain();
            };

            GLOBAL.state.CALLselectModifiedTest = function () {
                GLOBAL.state.selectModifiedTest();
            };

            GLOBAL.state.CALLselectModifiedTrainOK = function () {
                GLOBAL.state.selectModifiedTrainOK();

                //add Modifier training task to stage
//                GLOBAL.currentView = new GLOBAL.Intro();
//                GLOBAL.stage.addChild(GLOBAL.currentView.view);

            };

            GLOBAL.state.CALLselectModifiedTestOK = function () {
                GLOBAL.state.selectModifiedTrainOK();


                //add modifier testing task to stage
//                GLOBAL.currentView = new GLOBAL.Intro();
//                GLOBAL.stage.addChild(GLOBAL.currentView.view);

            };

        },


        startGame: function () {

        },


        onTick: function () {
            //console.log('current view2',GLOBAL.currentView);
            GLOBAL.currentView.onTick();
            GLOBAL.stage.update(); //when this doesn't happen, we get the flicker thing on the opening buttons
            //console.log(GLOBAL.state.current);

            window.document.onkeydown = this.keyPressed;

        },


        keyPressed: function (event) {

//
//            console.log('hi',GLOBAL.keyboardListener);
//            GLOBAL.keyboardListener.simple_combo("space", function() {
//                GLOBAL.lastKeyPressed = 'space';
//                GLOBAL.currentView.keyPressed();
//                GLOBAL.stage.update();
//            });
////
////
//            GLOBAL.keyboardListener.simple_combo("s", function() {
//                GLOBAL.lastKeyPressed = 's';
//                GLOBAL.currentView.keyPressed();
//                GLOBAL.stage.update();
//            });


        },


    };


    scope.ArrowTask = ArrowTask;

}
    (window)
    )
;