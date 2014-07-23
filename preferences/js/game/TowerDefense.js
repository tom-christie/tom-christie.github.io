/**
 * Created by Tom on 4/6/14.
 */

//TODO: make the "select power source" be translucent over the page


(function (scope) {

    'use strict';
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


            // Create a canvas
            GAME.GameCanvas = document.createElement("canvas");
            // liquid layout: stretch to fill
            GAME.GameCanvas.width = 1040;//Math.max(window.innerWidth, 1200); //so the canvas doesn't get too small, and so you can resize without it being retarded
            GAME.GameCanvas.height = 640;//Math.max(window.innerHeight, 700);
            GAME.GameCanvas.marginTop = 100;
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

            for (var asset in GAME.assets._loadedResults.manifest) {
                GAME.settings[asset] = GAME.assets._loadedResults.manifest[asset];
            }
            GAME.settings.TILESIZEDIV2 = (GAME.settings.TILESIZE / 2) | 0; //0 just forces integer type?

            //add ticker
            createjs.Ticker.setFPS(30);
            createjs.Ticker.addEventListener('tick', this.onTick.bind(this));//callback function for what to do on each tick

            var keyMap = {
                "=":61,"?":63,"@":64,
                "!":33,'"':34,"#":35,"$":36,"%":37,"&":38,"'":39,"(":40,")":41,"*":42,"+":43,",":44,"-":45,".":46,"/":47,
                "0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,":":58,
                "A": 65,"B": 66,"C": 67,"D": 68,"E":69,"F":70,"G":71,"H":72,"I":73,"J":74,"K":75,"L":76,
                "M":77,"N":78,"O":79,"P":80,"Q":81,"R":82,"S":83,"T":84,"U":85,"V":86,"W":87,"X":88,"Y":89,"Z":90,
                "a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,
                "m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,
                "w":119,"x":120,"y":121,"z":122}


            //create fonts - @!"$,.%0123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
            GAME.settings.fontSpriteSheetWhite = new createjs.SpriteSheet({
                "animations": keyMap,
                "images": [GAME.assets.getResult("font_white")],
                "frames": {
                    "height": 16,
                    "width": 16,
                    "regX": 0,
                    "regY": 0,
                    "count": 256
                }
            });

            GAME.settings.fontSpriteSheetBlack = new createjs.SpriteSheet({
                "animations": keyMap,
                "images": [GAME.assets.getResult("font_black")],
                "frames": {
                    "height": 16,
                    "width": 16,
                    "regX": 0,
                    "regY": 0,
                    "count": 256
                }
            });

            GAME.settings.fontSpriteSheetRed = new createjs.SpriteSheet({
                "animations": keyMap,
                "images": [GAME.assets.getResult("font_red")],
                "frames": {
                    "height": 16,
                    "width": 16,
                    "regX": 0,
                    "regY": 0,
                    "count": 256
                }
            });


            //add ticker  createjs.Ticker.setFPS(30);  createjs.Ticker.addEventListener('tick', this.onTick.bind(this));//callback function for what to do on each tick
            GAME.AI = new GAME.AI();

            //set up state space
            GAME.flowController = new GAME.FlowController();


        }


    };

    GAME.recordResults = function (results) {
        console.log(results);
        //the error you get here is just from the RESPONSE - the data seems to be posting fine.
        try {
            $.ajax({

                url: "https://docs.google.com/forms/d/1zlpe2jwCN6uKZOu5YhvZP4NuzMzMTe4axvJKESZAPUE/formResponse",
                type: "POST",
                dataType: "xml",
                data: { "entry.2110483516": "~~TEST~~",
                    "entry.527129473": results}, //this is the question id

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
    scope.TowerDefense = TowerDefense;

}(window));



(function (scope) {
    /*
    This object does two things
    1) Keeps track of level details to display to the user (number of crystals, which base, etc)
    2) Keeps track of data COLLECTED from the user and data displayed on the screen

    - use the logData function to add data
     */

    function LevelData(number, baseType, weaponColors, weaponStrengths, startingCrystalCounts, dataCollectionParameter, startingCountIsRandom) {
        this.setup(number, baseType, weaponColors, weaponStrengths, startingCrystalCounts, dataCollectionParameter, startingCountIsRandom);
    }

    LevelData.prototype = {
        constructor: LevelData,

        setup: function(number, baseType, weaponColors, weaponStrengths, startingCrystalCounts, dataCollectionParameter, startingCountIsRandom){

            this.number = number; //1, 2, ...
            this.baseType = baseType; //1, 2, 3...
            this.weaponColors = weaponColors; //length=2 array of colors, like ["green", "blue"] or ["
            this.weaponStrengths = weaponStrengths;//length=2 array of damage done by weapons, like [10, 20] or [5, 6]
            this.startingCrystalCounts = startingCrystalCounts; //length=2 array of the number of crystals available at the beginning of the level
            this.dataCollectionParameter = dataCollectionParameter;//parameter indicating how long to wait till
            this.startingCountIsRandom = startingCountIsRandom; //boolean, saying whether to use random starting counts or to use from other selections
            this.recoveredCrystalCounts = [0, 0];

            this.collectedData = []; /*this will be an array of dicts, where each dict looks like:
                                      {label:
                                       value:
                                       time:
                                       }
                                      */


        }
    };
    scope.LevelData = LevelData;
}(window.GAME));





(function (scope) {


    function FlowController() {
        this.setup();

    }

    FlowController.prototype = {
        constructor: FlowController,

        setup: function () {

            GAME.weaponsSuppliedToLevels = [];//list of {baseType:baseNumber,
                                                        //startingCrystalCounts:{"color1":X
                                                        // "color2":Y}
                //use will be a Last In First Out queue, where the most recent supply for a given base will be used

            this.nextPage = "live";

            var totalCrystalCount = GAME.settings.basicCrystalNumber;


            // SET UP LEVEL SEQUENCE
            GAME.currentLevelNumber = 0;
            GAME.levels = [];
            for(var levelNumber=1; levelNumber < GAME.settings.levelCount; levelNumber++){

                // settings based on which base it is
                var baseType = Math.floor(Math.random()*2+1);
                if(levelNumber===1){

                    baseType = 1;
                    //THIS GETS OVERWRITTEN
                    var startingCrystalCounts = {};
                    startingCrystalCounts[GAME.settings.base1Colors[0]] = Math.floor(totalCrystalCount/2);
                    startingCrystalCounts[GAME.settings.base1Colors[1]] = Math.floor(totalCrystalCount/2);
                    var startingCrystalCountIsRandom = true;
                    var weaponColors = GAME.settings.base1Colors;
                    var weaponStrengths = GAME.settings.base1Strengths;
                }else {
                    if (baseType === 1) {
                        var weaponColors = GAME.settings.base1Colors;
                        var weaponStrengths = GAME.settings.base1Strengths;
                    } else if (baseType === 2) {
                        var weaponColors = GAME.settings.base2Colors;
                        var weaponStrengths = GAME.settings.base2Strengths;
                    }

                    if(Math.random() > 0.5){
                        //random starting count
                        var startingCrystalCountIsRandom = true;
                    }else{
                        //don't know what they'll be yet
                        var startingCrystalCountIsRandom = false;
                    }
                    var startingCrystalCounts =[null, null]; //counts are inserted when the level is created add up to startingCrystalCount
                }
                GAME.levels.push(new GAME.LevelData(levelNumber,baseType, weaponColors, weaponStrengths, startingCrystalCounts, 0,startingCrystalCountIsRandom));
            }




            //STUFF FOR STATE TRANSITIONS

            //keep track of overall state
            //https://github.com/jakesgordon/javascript-state-machine
            /* game states and events
             *
             * These control what type of object is showing on the screen at a given time - LevelPage, WeaponSelectPage, etc.
             * The these are changed by calls from the FlowController object, which keeps finer control over the game flow
             *
             */
            GAME.state = StateMachine.create({
                events: [
                    {name: 'startup', from: 'none', to: 'MENU'},
                    {name: 'to_live', from: ['MENU','SELECT_WEAPONS','TRANSITION'], to: 'LIVE'},
                    {name: 'to_weapons', from: ['MENU','LIVE','TRANSITION'], to: 'SELECT_WEAPONS'},
                    {name: 'to_transition', from: ['MENU','LIVE','SELECT_WEAPONS'], to: 'TRANSITION'}
                ],

                callbacks: {
                    // these handle when new pages load
                    onSELECT_WEAPONS: function (event, from, to, msg) {
                        GAME.stage.removeAllChildren();
                        console.log("DEBUG weapnSelect init", GAME.currentPage)
                        GAME.currentPage = new GAME.WeaponSelectPage(GAME.flowController.weaponsToPickFrom,GAME.flowController.baseToSendTo);
                        GAME.stage.addChild(GAME.currentPage);
                    },
                    onLIVE: function (event, from, to, msg) {

                        console.log("DEBUG queue", GAME.weaponsSuppliedToLevels);
                        GAME.stage.removeAllChildren();

                        GAME.currentLevelNumber += 1;
                        GAME.flowController.checkNewLevelForCrystalSupply();
                        console.log("NOW AT LEVEL", GAME.currentLevelNumber);
                        GAME.currentPage = new GAME.LevelPage();
                        GAME.stage.addChild(GAME.currentPage);
                    },
                    onMENU: function (event, from, to, msg) {
                        GAME.currentPage = new GAME.MenuPage();
                        GAME.stage.addChild(GAME.currentPage);
                    },
                    onTRANSITION: function (event, from, to, msg) {
                        //msg is options to send when creating the page
                        GAME.stage.removeAllChildren();
                        //TODO - choose (in principle) which go here!)
                        GAME.currentPage = new GAME.TransitionPage();
                        GAME.stage.addChild(GAME.currentPage);
                    }
                }
            });

            GAME.state.startup();

        },

        checkNewLevelForCrystalSupply: function(){

            //get colors of level in question
            if(GAME.levels[GAME.currentLevelNumber - 1].baseType === 1){
                var color1 = GAME.settings.base1Colors[0];
                var color2 = GAME.settings.base1Colors[1];
            }else if(GAME.levels[GAME.currentLevelNumber - 1].baseType === 2){
                var color1 = GAME.settings.base2Colors[0];
                var color2 = GAME.settings.base2Colors[1];
            }

            //check if the new level will have crystals randomly selected
            if(GAME.levels[GAME.currentLevelNumber-1].startingCountIsRandom) {
                //sample from binomial distribution
                var tempCount = 0;
                for(var j=0; j<GAME.settings.basicCrystalNumber; j++){
                    if(Math.random() > 0.5){
                        tempCount++;
                    }
                }
                var startingCrystalCounts = {};

                startingCrystalCounts[color1] = tempCount;
                startingCrystalCounts[color2] = GAME.settings.basicCrystalNumber - tempCount;

                GAME.levels[GAME.currentLevelNumber-1].startingCrystalCounts = startingCrystalCounts;
            }else{
                var levelSupplied = false;
                //if not, count backwards from the end of the list of supplies
                for(var i=GAME.weaponsSuppliedToLevels.length-1; i>=0; i--){

                    //check if level number in the supply queue is the same as the current level number
                    if(GAME.weaponsSuppliedToLevels[i]['baseType'] === GAME.levels[GAME.currentLevelNumber-1].baseType){

                        //if so, set level supplies to the prespecified amount
                        GAME.levels[GAME.currentLevelNumber-1].startingCrystalCounts = GAME.weaponsSuppliedToLevels[i]['startingCrystalCounts']
                        GAME.weaponsSuppliedToLevels.splice(i, 1); //remove supplies, since it was used
                        levelSupplied = true;
                        break;

                    }
                }
                //if the queue doesn't have a supply it can use, make a random one
                if(!levelSupplied){
                    //sample from binomial distribution
                    var tempCount = 0;
                    for(var j=0; j<GAME.settings.basicCrystalNumber; j++){
                        if(Math.random() > 0.5){
                            tempCount++;
                        }
                    }

                    var startingCrystalCounts = {};
                    startingCrystalCounts[color1] = tempCount;
                    startingCrystalCounts[color2] = GAME.settings.basicCrystalNumber - tempCount;
                    GAME.levels[GAME.currentLevelNumber-1].startingCrystalCounts = startingCrystalCounts;
                }
            }
        },

        //due to tweening, each "leave page" event calls one of these helpers.
        //these tell the page to tween out, and what to do next.
        //It also updates the options that need to be read by the onXXX methods for the GAME.state
        //doing it this way avoids having to use event listeners
        // 1. other button calls X_to_Y function (it's bound to it)
        // 2. this tells that page to tween out, and when finished, call CALL_X function
        // 3. that changes the game state, which loads the new page

        //transitioning to the live/play state

        MENU_to_LIVE: function (event, from, to, msg) {
            GAME.flowController.nextPage = "live";
            console.log("MENU_to_LIVE called", this.nextPage);
            GAME.currentPage.tweenOutSelf(GAME.flowController.to_live_transition);
        },

        MENU_to_WEAPONS: function (event, from, to, msg) {
            GAME.flowController.nextPage = "weapons";
            console.log("MENU_to_WEAPONS called", this.nextPage);
            GAME.currentPage.tweenOutSelf(GAME.flowController.to_weapons_transition);
        },

        WEAPONS_to_LIVE: function (event, from, to, msg) {
            GAME.flowController.nextPage = "live";
            GAME.currentPage.tweenOutSelf(GAME.flowController.to_live_transition);
        },

        LIVE_to_WEAPONS: function (event, from, to, msg) {
            GAME.flowController.nextPage = "weapons";
            GAME.currentPage.tweenOutSelf(GAME.flowController.to_weapons_transition); //tween out then change

            //try to save data
            GAME.recordResults(JSON.stringify(GAME.levels[GAME.currentLevelNumber-1].collectedData));
        },

        to_live_transition: function (event, from, to, msg) {

            GAME.state.to_transition();
        },

        to_weapons_transition: function(event,from,to,msg){

//
            //decide what weapons to show
            if(Math.random() > .5){
                GAME.flowController.weaponsToPickFrom = GAME.settings.base2Colors;
                GAME.flowController.baseToSendTo = 2;
            }else{
                GAME.flowController.weaponsToPickFrom = GAME.settings.base1Colors;
                GAME.flowController.baseToSendTo = 1;
            }

            //TODO - ADD OCCASIONAL 3-choices

            console.log("DEBUG weapons GOT HEREEEE");

            GAME.state.to_transition();

        },

        //these are called by the transition page when they're finished
        to_transition_finished: function(){

            if(GAME.flowController.nextPage === "weapons"){
                GAME.state.to_weapons();
            }else if(GAME.flowController.nextPage === "live"){
                GAME.state.to_live();
            }
            GAME.flowController.nextPage = null;
        }



    };

    scope.FlowController = FlowController;
}(window.GAME));






(function (scope) {

    function TransitionPage() {
        createjs.Container.call(this);
        this.setup();
    }

    inheritPrototype(TransitionPage, createjs.Container);

    var p = TransitionPage.prototype;

    p.setup = function () {

        if(GAME.currentLevelNumber === 0){//level hasn't started yet
            if(GAME.flowController.nextPage === "live") {
                this.pages = ["tutorial1", "tutorial2", "tutorial3", "tutorial4", "tutorial5"];
                this.numPages = 5;
            }
        }else if(GAME.currentLevelNumber === 1 && GAME.flowController.nextPage === "weapons") {
            this.pages = ["weapon_select_tutorial"];
            this.numPages = 1;
        }else{
            if(GAME.flowController.nextPage === "live") {
                this.pages = ["base_transition"];
                this.numPages = 1;
            }
            if(GAME.flowController.nextPage === "weapons"){
                this.pages = ["control_room_transition"];
                this.numPages = 1;
            }
        }
//        this.text = options.text;
        this.numPages = this.pages.length;

        this.currentPageNumber = 0;

        this.displayCurrentPage();


    };

    p.displayCurrentPage = function(){
        this.removeAllChildren();
        this.currentPage = new createjs.Bitmap(GAME.assets.getResult(this.pages[this.currentPageNumber]));
        this.addChild(this.currentPage);
        this.currentPage.on("click",this.displayNextPage.bind(this));
        //don't make a button if there's no text - this is true in the opening tutorial
        if(GAME.currentLevelNumber > 0 && GAME.flowController.nextPage === "live"){
            if(GAME.levels[GAME.currentLevelNumber - 1 + 1].startingCountIsRandom){ //look one ahead b/c the level number hasn't been incremented yet
                var text = "This base was stocked by someone else."
            }else{
                var text = "This base was stocked by you!"
            }
            this.currentTextButton = new GAME.Button((GAME.GameCanvas.width) / 2, 500, 600, 100);
            this.currentTextButton.setBitmapText(text, GAME.settings.fontSpriteSheetWhite, 1.3);
            this.addChild(this.currentTextButton);
        }

    };

    p.displayNextPage = function(){
        this.currentPageNumber += 1;
        if (this.currentPageNumber >= this.numPages){
            GAME.flowController.to_transition_finished();
        }else{
            //display the next page
            this.displayCurrentPage();
        }
    };

    p.update = function(){

    };

    p.render = function(){

    };

    scope.TransitionPage = TransitionPage;

}(window.GAME));


