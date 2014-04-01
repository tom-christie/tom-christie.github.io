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

            //add these to global so all classes can access it
            GLOBAL.stage = stage;
            GLOBAL.GameInfo = queue.getResult("manifest");
            GLOBAL.assets = queue;


//            //message broadcasting...necessary?
//            //https://github.com/ajacksified/Mediator.js
//            this.mediator = new Mediator();

            this.createStateMachine();


            //set the ticker to 30fps
            createjs.Ticker.setFPS(30);
            createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

            //FLICKER IF THIS ISN'T CALLED
            createjs.Ticker.addEventListener('tick', this.onTick.bind(this));//callback function for what to do on each tick
            //console.log('ticker1',createjs.Ticker.toString());

            GLOBAL.stage.enableMouseOver(24); // 24 updates per second


            this.createMenu();
//            this.createLevel();
//            GLOBAL.state.onselect1BACK_INTRO();

        },

        createMenu: function () {


            GLOBAL.oneBackTask = new GLOBAL.OneBackTask();

            GLOBAL.oneBackTask.view = new GLOBAL.OneBackTaskView(GLOBAL.oneBackTask.options);
            GLOBAL.currentView = GLOBAL.oneBackTask;
            GLOBAL.stage.addChild(GLOBAL.currentView.view);

//
//            GLOBAL.currentView = new GLOBAL.Menu();
//            GLOBAL.stage.addChild(GLOBAL.currentView.view);

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
                    { name: '1BackTrialFinished', from: '1BACK_TASK', to: '1BACK_RESULTS' },
                    { name: '1BackToComplete', from: '1BACK_TASK', to: 'COMPLETE'},

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


                //add 1-back task to stage
                GLOBAL.currentView = new GLOBAL.OneBackTask();
                GLOBAL.oneBackTask = GLOBAL.currentView; //just for reference - this is a pointer, right?
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
            GLOBAL.lastKeyPressed = event.keyIdentifier;
            GLOBAL.currentView.keyPressed();
            GLOBAL.stage.update();
        },
//
//        HSVtoRGB: function (h, s, v) {
//            var r, g, b, i, f, p, q, t;
//            if (h && s === undefined && v === undefined) {
//                s = h.s, v = h.v, h = h.h;
//            }
//            i = Math.floor(h * 6);
//            f = h * 6 - i;
//            p = v * (1 - s);
//            q = v * (1 - f * s);
//            t = v * (1 - (1 - f) * s);
//            switch (i % 6) {
//                case 0:
//                    r = v, g = t, b = p;
//                    break;
//                case 1:
//                    r = q, g = v, b = p;
//                    break;
//                case 2:
//                    r = p, g = v, b = t;
//                    break;
//                case 3:
//                    r = p, g = q, b = v;
//                    break;
//                case 4:
//                    r = t, g = p, b = v;
//                    break;
//                case 5:
//                    r = v, g = p, b = q;
//                    break;
//            }
//            return {
//                r: Math.floor(r * 255),
//                g: Math.floor(g * 255),
//                b: Math.floor(b * 255)
//            }
//        }

    };


    scope.ArrowTask = ArrowTask;

}
    (window)
    )
;