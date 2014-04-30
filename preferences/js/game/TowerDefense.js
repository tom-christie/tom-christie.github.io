/**
 * Created by Tom on 4/6/14.
 */

(function (scope) {


    //make global variable - have to set this first so it's defined everywhere
    window.GAME = window.GAME || {};

    function TowerDefense() {
        // throw exceptions on sloppy code
        // "use strict";


        ///////////////////////////////////////////////
        // debug only - turn this off when you go live!
        ///////////////////////////////////////////////
        GAME.debugmode = 1; // 1 for debug info and profiler, >1 for DETAILED INFO

        this.init();

    }

    TowerDefense.prototype = {
        constructor: TowerDefense,


        init: function () {

            if (GAME.debugmode)
                log('initTowerGameStarterKit ' + window.innerWidth + 'x' + window.innerHeight);

            // Create a canvas
            GAME.GameCanvas = document.createElement("canvas");
            // liquid layout: stretch to fill
            GAME.GameCanvas.width = window.innerWidth;
            GAME.GameCanvas.height = window.innerHeight;
            // the id the game engine looks for
            GAME.GameCanvas.id = 'gameCanvas';
            // add the canvas element to the html document
            document.body.appendChild(GAME.GameCanvas);
            GAME.stage = new createjs.Stage(GAME.GameCanvas); //stage belongs to the canvas?
            GAME.stage.enableMouseOver();

            //preload resources
            this.preload();

            //set up keyboard listener
            GAME.keyboardListener = new window.keypress.Listener();


        },

        onTick: function () {
            GAME.currentPage.update();
            GAME.currentPage.render();
            GAME.stage.update();

        },

        preload: function () {

            this.preloader = new GAME.Preloader();
            this.preloader.load();


        },

        preloadComplete: function () {
            log('finished preloading');
            var i;
            //make settings easier to get
            GAME.settings = {};

            for (asset in GAME.assets._loadedResults.manifest) {
                log(asset)
                GAME.settings[asset] = GAME.assets._loadedResults.manifest[asset];
            }
            GAME.settings.TILESIZEDIV2 = (GAME.settings.TILESIZE / 2) | 0; //0 just forces integer type?

            //add ticker
            createjs.Ticker.setFPS(30);
            createjs.Ticker.addEventListener('tick', this.onTick.bind(this));//callback function for what to do on each tick

            //precreate all projectiles for speed during the game



            GAME.AI = new GAME.AI();


            //set up state space
            this.initStates();

            /////////testing




//
////
////            // calculate pathfinding costs
//            var level = new GAME.LevelPage();
//            level.setup();

////
////


            ////////////end testing


        },

        initStates: function () {

            //game states and events
            //https://github.com/jakesgordon/javascript-state-machine
            GAME.state = StateMachine.create({
                events: [
                    {name: 'startup', from: 'none', to: 'MENU'},
                    {name: 'select_weapons', from: 'MENU', to: 'SELECT_WEAPONS'},
                    {name: 'select_playback', from: 'MENU', to: 'SELECT_PLAYBACK'}, //show options of which to play back
                    {name: 'show_playback', from: ['SELECT_WEAPONS','MENU'], to: 'SHOW_PLAYBACK'}, //actually show an option
                ],

                callbacks: {
                    //the way the screen changes work is this -
                    //1. function tweens out itself
                    //2. calls "CALLselect_weapons" b/c of scope stupidness
                    //3. onEVENT calls event, which changes state
                    //4. then the onSTATE loads the new page

                    CALLselect_weapons: function (event, from, to, msg) {
                        GAME.state.select_weapons();
                        log('transition to weapon select stage');
                    },

                    onSELECT_WEAPONS: function (event, from, to, msg) {
                        GAME.stage.removeAllChildren();
                        GAME.currentPage = new GAME.WeaponSelectPage();
                        GAME.stage.addChild(GAME.currentPage);
                    },

                    onSHOW_PLAYBACK: function (event, from, to, msg) {

                        GAME.stage.removeAllChildren();
                        GAME.currentPage = new GAME.LevelPage();
                        GAME.stage.addChild(GAME.currentPage);
                    },

                    onMENU: function (event, from, to, msg) {
                        GAME.currentPage = new GAME.MenuPage();
                        GAME.stage.addChild(GAME.currentPage);


                        //FOR DEBUG
                        //GAME.state.show_playback();

                    },


                    onselect_playback: function (event, from, to, msg) {
                        log('transition to playback selection stage');
                    },
                    onshow_playback: function (event, from, to, msg) {
                        log('transition to playback showing stage');
                    }


                }
            });
            GAME.state.startup();


        }

    };


    scope.TowerDefense = TowerDefense;

}(window));

console.log('TowerGameStarterKit.js loaded! Initializing...');

