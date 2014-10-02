/**
 * Created by Tom on 4/7/14.
 *
 * What data to log?
 *  x goon appears (goon number)
 *  x goon shot (by which color)
 *  x goon killed (and by which color laser)
 *  x goon turns into crystal (which color crystal?) (same as goon killed)
 *  x goon reaches target (goon number)
 *  x weapon crystal selected (which?)
 *  x crystal collected
 *
 */



(function (scope) {

    function LevelPage(options) {
        createjs.Container.call(this);
        this.setup(options);
    }

    inheritPrototype(LevelPage, createjs.Container);

    var p = LevelPage.prototype;


    p.setup = function (options) {

        //console.log("INITIALIZING LEVEL", GAME.currentLevelNumber);
        //console.log("Random crystals?", GAME.levels[GAME.currentLevelNumber-1].startingCountIsRandom);


        //make layers for game and alerts
        this.gameLayer = new createjs.Container();
        this.addChild(this.gameLayer);
        this.alertLayer = new createjs.Container();
        this.addChild(this.alertLayer);


        this.options = {
            //-1 b/c array is 0-indexed
            weapon1_color: GAME.levels[GAME.currentLevelNumber-1].weaponColors[0],
            weapon1_strength: GAME.levels[GAME.currentLevelNumber-1].weaponStrengths[0],
            weapon1_available_count: Math.round(GAME.levels[GAME.currentLevelNumber-1].startingCrystalCounts[GAME.levels[GAME.currentLevelNumber-1].weaponColors[0]]),
            weapon2_color: GAME.levels[GAME.currentLevelNumber-1].weaponColors[1],
            weapon2_strength: GAME.levels[GAME.currentLevelNumber-1].weaponStrengths[1],
            weapon2_available_count: Math.round(GAME.levels[GAME.currentLevelNumber-1].startingCrystalCounts[GAME.levels[GAME.currentLevelNumber-1].weaponColors[1]]),
            base: GAME.levels[GAME.currentLevelNumber-1].baseType
        };


        //TEMPORARY
//        GAME.state.current = "LIVE";
//        //GAME.state.current = "PLAYBACK";

        if (GAME.debugmode)
            log('LevelPage.setup');

        this.crystalActive = 0; //0 is neither, 1 is first and 2 is second

        this.loadLevelData();

        this.x_offset = 200;
        //draw background
        if(this.options.base === 1){
            this.map = new createjs.Bitmap(GAME.assets.getResult("base1"));
        }else if(this.options.base === 2){
            this.map = new createjs.Bitmap(GAME.assets.getResult("base2"));
        }else if(this.options.base === 3){
            this.map = new createjs.Bitmap(GAME.assets.getResult("base3"));
        }

        this.map.x = this.x_offset;//GAME.GameCanvas.width/2 - this.map.image.width/2;
        this.map.y = 0;//GAME.GameCanvas.height/2 - this.map.image.height/2;

        this.x = GAME.GameCanvas.width / 2 - this.map.image.width / 2 - this.x_offset / 2;
        this.y = GAME.GameCanvas.height / 2 - this.map.image.height / 2;

        //draw a box around the screen
        this.border_rectangle = new createjs.Shape();
        this.border_rectangle.graphics
            .beginFill("#2A3034") //todo put this in GameData.json
            .drawRoundRect(this.map.x - 20 - this.x_offset, this.map.y - 20, this.map.image.width + 40 + this.x_offset, this.map.image.height + 40, 0);
        this.gameLayer.addChild(this.border_rectangle);
        this.gameLayer.addChild(this.map);

        //tween in whole page - could be fancier, but this is fine for now
//        createjs.Tween.get(this.gameLayer)
//            .to({y: GAME.GameCanvas.height / 2, scaleY: .01, x: GAME.GameCanvas.width / 2, scaleX: .001})
//            .wait(300)
//            .to({x: 0, scaleX: 1}, 70)
//            .wait(50)
//            .to({y: 0, scaleY:1}, 100);
//        createjs.Tween.get(this.alertLayer)
//            .to({y: GAME.GameCanvas.height / 2, scaleY: .01, x: GAME.GameCanvas.width / 2, scaleX: .001})
//            .wait(300)
//            .to({x: 0, scaleX: 1}, 70)
//            .wait(50)
//            .to({y: 0, scaleY:1}, 100);
//        createjs.Tween.tick(1);

        //add towers
        this.tiles = this.levelData.layers[1].data;
        this.tower_tile_number = GAME.settings.TILE_INDEX_BUILDABLE;
        this.tile_height = this.levelData.tileheight;
        this.tile_width = this.levelData.tilewidth;
        this.num_tiles_across = this.levelData.layers[1].width;
        this.num_total_tiles = this.num_tiles_across * this.levelData.layers[1].width;

        //actually adding towers here
        this.towers = [];
        for (var i = 0; i < this.num_total_tiles; i++) {
            //add towers at appropriate places
            if (this.tiles[i] == this.tower_tile_number) {
                var y = this.tile_height * Math.floor(i / this.num_tiles_across);
                var x = this.tile_width * (i % this.num_tiles_across) + this.x_offset;
                this.towers.push(new GAME.Tower(x, y, "dead"));
            }
        }
        for (i = 0; i < this.towers.length; i++) {
            this.gameLayer.addChild(this.towers[i]);
        }

        //add mine (target)
        this.mine_tile_number = GAME.settings.TILE_INDEX_GOAL;
        for (var i = 0; i < this.num_total_tiles; i++) {
            if (this.tiles[i] == this.mine_tile_number) {
                this.mine = new createjs.Bitmap(GAME.assets.getResult("mine"));
                this.mine.y = this.tile_height * Math.floor(i / this.num_tiles_across) - this.tile_height;
                this.mine.x = this.tile_width * (i % this.num_tiles_across) + this.x_offset;
                this.mine.scaleX = 0.5;
                this.mine.scaleY = 0.5;
                this.gameLayer.addChild(this.mine);
            }
        }

        //add projectiles
        this.projectileMagazine = new GAME.ProjectileMagazine();

        GAME.AI.newGrid(this.levelData.layers[1].data, this.levelData.width, this.levelData.height);

        this.startX = GAME.AI.spawnX * this.levelData.tilewidth;
        this.startY = GAME.AI.spawnY * this.levelData.tileheight;

        this.goons = [];
        this.numGoonsSpawned = 0;


        //add box for weapon select
        this.y_separation = 20;
        //add weapon select - but don't add it to the page unless state = LIVE
        //this is the bounding box
        this.weaponSelectRectangle = new createjs.Shape();
        this.weaponSelectRectangle.height = 300;
        this.weaponSelectRectangle.y = 0;
        this.weaponSelectRectangle.graphics
            .beginFill("#858B8E") //todo put this in GameData.json
            .drawRoundRect(0, this.weaponSelectRectangle.y, this.x_offset - 20, this.weaponSelectRectangle.height, 0);
        this.gameLayer.addChild(this.weaponSelectRectangle);


        //contents of weaponSelect box
        this.currentEnergy = 0;
        this.weapon1 = new GAME.WeaponSelect(this.options.weapon1_color, 1, false);
        this.weapon2 = new GAME.WeaponSelect(this.options.weapon2_color, 2, false);




        //add crystal storage
        this.recoveredCrystals1Count = 0;
        this.recoveredCrystals2Count = 0;
        this.shotsFired1 = 0;
        this.shotsFired2 = 0;

        this.crystalStorageRectangle = new createjs.Shape();
        this.crystalStorageRectangle.y = this.weaponSelectRectangle.y + this.weaponSelectRectangle.height + this.y_separation;
        this.crystalStorageRectangle.height = 240;
        this.crystalStorageRectangle.graphics
            .beginFill("#858B8E") //todo put this in GameData.json
            .drawRoundRect(0, 0,// the .y parameter sets the y value already
                this.x_offset - 20, this.crystalStorageRectangle.height, 0);
        this.gameLayer.addChild(this.crystalStorageRectangle);
        this.crystalStorageText = new createjs.BitmapText("Crystals\nRecovered",GAME.settings.fontSpriteSheetBlack);
        //this.crystalStorageText = new createjs.Text("Energy Source");
        this.crystalStorageText.scaleX = 0.7;
        this.crystalStorageText.scaleY = 0.7;
        this.crystalStorageText.x = 20;
        this.crystalStorageText.y = this.crystalStorageRectangle.y + 23;
        this.crystalStorageText.textBaseline = "alphabetic";

        //contents of the crystal storage box
        //contents of availableEnergy Box
        //crystals with a "X 8" or whatever next to them
        this.crystalStorageCrystal1 = new GAME.Crystal(20,this.crystalStorageRectangle.y + 60,
            this.options.weapon1_color, "recovered",true);
        this.crystalStorageCrystal2 = new GAME.Crystal(20,this.crystalStorageRectangle.y + 100,
            this.options.weapon2_color, "recovered",true);
        this.gameLayer.addChild(this.crystalStorageCrystal1);
        this.gameLayer.addChild(this.crystalStorageCrystal2);


        this.crystalStorageRatioCrystal1 = new GAME.Crystal(20,this.crystalStorageRectangle.y + 150,
            this.options.weapon1_color, "recovered",true);
        this.crystalStorageRatioCrystal2 = new GAME.Crystal(20,this.crystalStorageRectangle.y + 190,
            this.options.weapon2_color, "recovered",true);
        this.gameLayer.addChild(this.crystalStorageRatioCrystal1);
        this.gameLayer.addChild(this.crystalStorageRatioCrystal2);



        //this.updateCrystalCounts();


        if (GAME.state.is("LIVE")) {

            this.gameLayer.addChild(this.weaponSelectText);
            this.gameLayer.addChild(this.crystalStorageText);
            //this.gameLayer.addChild(this.availableEnergyText);
            this.gameLayer.addChild(this.weapon1);
            this.gameLayer.addChild(this.weapon2);

            ///////////////////////
            this.alertButton("add", "weapon_select");

        }

//        else if (GAME.state.is("PLAYBACK")) {
//
//            this.remoteControl = new GAME.RemoteControl();
//            this.gameLayer.addChild(this.remoteControl);
//
//            //add static
//            this.static = new createjs.SpriteSheet({
//                "animations": {
//                    "static": [0, 13, "static", .25]
//                },
//                "images": [GAME.assets.getResult("static")],
//                "frames": {
//                    "height": 600,
//                    "width": 800,
//                    "regX": 0,
//                    "regY": 0,
//                    "count": 14
//                }
//            });
//            this.staticSprite = new createjs.Sprite(this.static, "static");
//            this.staticSprite.x = this.x_offset;
//            this.staticSprite.y = 0;
//            this.staticSprite.alpha = .5;
//            this.gameLayer.addChild(this.staticSprite);
//
//
//        }


        this.startTime = createjs.Ticker.getTicks();
        this.spawnTime = createjs.Ticker.getTicks();

        this.options["label"] = "newLevel";
        logData(this.options);

        if (GAME.debugmode)
            log('initLevel complete.');


    };

    p.tweenOutSelf = function (fn) {
//        createjs.Tween.get(this.gameLayer)
//            .wait(100)
//            .to({y: GAME.GameCanvas.height / 2, scaleY: .001}, 70)
//            .wait(50)
//            .to({x: GAME.GameCanvas.width / 2, scaleX: .001}, 100);
//        createjs.Tween.get(this.alertLayer)
//            .wait(100)
//            .to({y: GAME.GameCanvas.height / 2, scaleY: .001}, 70)
//            .wait(50)
//            .to({x: GAME.GameCanvas.width / 2, scaleX: .001}, 100)
//            .call(fn);
//        createjs.Tween.tick(1);
        fn();

    };


    p.loadLevelData = function () {
        this.levelData = GAME.assets.getResult("level01_data");
        log(this.levelData);
        if (!this.levelData) {
            if (GAME.debugmode)
                log('ERROR: Missing level data!');
            return;
        }
        if (!this.levelData.properties) {
            if (GAME.debugmode)
                log('ERROR: Missing level.properties!');
            return;
        }

    };

    p.updateGoons = function () {
        //SPAWN NEW GOONS
        if ((createjs.Ticker.getTicks() - this.spawnTime) > GAME.settings.goon_spawn_ticks) {
            //get number of spawn intervals passed
            var spawn_intervals = Math.floor(( createjs.Ticker.getTicks() - this.startTime) / GAME.settings.goon_spawn_ticks) - 1;
            var goon_type_to_spawn = GAME.settings.level01_goons[spawn_intervals];
            this.spawnTime = createjs.Ticker.getTicks();
            //if the interval has a goon associated with it in the game settings
            if (goon_type_to_spawn == 1) {
                logData({label:"goonSpawn",goonNum:this.numGoonsSpawned});
                //can't use spawn intervals as index as some intervals don't have an associated goon
                //so we need to use the ACTUAL goon number as the interval
                this.goons.push(new GAME.Goon(this.numGoonsSpawned, goon_type_to_spawn));
                this.goons[this.numGoonsSpawned].spawn(this.startX, this.startY);
                this.gameLayer.addChildAt(this.goons[this.numGoonsSpawned], this.gameLayer.getNumChildren());//-1);
                this.spawnTime = createjs.Ticker.getTicks();
                this.numGoonsSpawned += 1;
            }
        }
        GAME.AI.update();
        for (i = 0; i < this.numGoonsSpawned; i++) {
            this.goons[i].update();
        }

        //CHECK FOR GOON REACHING DESTINATION
        for (i = 0; i < this.numGoonsSpawned; i++) {
            if (ndgmr.checkRectCollision(this.goons[i].sprite, this.mine)) {
                this.goons[i].hitMine();
            }
        }
    };

    p.getCrystalStorageCoords = function(color){
        console.log(color, this.crystalStorageCrystal1.color, this.crystalStorageCrystal2.color)
        if(color === this.crystalStorageCrystal1.color){
            return {x:this.crystalStorageCrystal1.crystalSprite.x, y:this.crystalStorageCrystal1.crystalSprite.y};
        }else if(color === this.crystalStorageCrystal2.color){
            return {x:this.crystalStorageCrystal2.crystalSprite.x, y:this.crystalStorageCrystal2.crystalSprite.y};
        }
    };


    p.handleCrystals = function () {
        var i;
        this.updateCrystalCounts();
        if (this.currentEnergy <= 0) {
            this.crystalActive = 0;
        } else {
            this.weapon1.update();
            this.weapon2.update();
        }

        //if no crystals are active
        if (this.crystalActive === 0) {

            if(this.weaponsRemaining > 0) {
                if (GAME.state.is("LIVE")) {
                    this.alertButton("add", "weapon_select");
                }

                this.weapon2.active = false;
                this.weapon2.weapon_select_crystal.crystalSprite.stop();
                this.weapon1.active = false;
                this.weapon1.weapon_select_crystal.crystalSprite.stop();

                //make towers grey
                //change tower colors
                for (i = 0; i < this.towers.length; i++) {
                    this.towers[i].changeColor("dead");
                }
            }else{
                //don't do anything if no weapons are left
            }

        } else {
            for (i = 0; i < this.towers.length; i++) {
                this.towers[i].update();
            }

            if(this.weapon_select_button_showing){

                this.alertButton("remove", "weapon_select")
            }
        }




    };

    p.updateRecoveredCrystalCount = function(color){
        //console.log("DEBUG recovered", color, this.crystalStorageCrystal1.color, this.crystalStorageCrystal2.color)
        if(color === this.crystalStorageCrystal1.color){
            this.recoveredCrystals1Count += 1;

//            this.crystalStorageCrystal1.crystalSprite.gotoAndPlay("sparkle");
//            //this.crystalStorageCrystal1.crystalSprite._animation.speed = .01;
//            createjs.Tween.get({s:this.crystalStorageCrystal1.crystalSprite._animation.speed})
//                .to({s:5})
//                .to({s:0},2000)
//                .on("change", function (evt){
//                    this.crystalStorageCrystal1.crystalSprite._animation.speed = evt.target.target.s;
//                    }, this);
//                //.call(GAME.currentPage.crystalStorageCrystal1.crystalSprite.stop);



        }else if(color === this.crystalStorageCrystal2.color){
            this.recoveredCrystals2Count += 1;
        }
        this.updateCrystalCounts();


    };

    p.updateCrystalCounts = function(){

        //tell WeaponSelect
        this.weapon1.update();
        this.weapon2.update();

        //recovered crystals
        this.gameLayer.removeChild(this.crystalStorageCrystal1Text);
        this.crystalStorageCrystal1Text = new createjs.BitmapText("X "+this.recoveredCrystals1Count,
            GAME.settings.fontSpriteSheetBlack);
        this.crystalStorageCrystal1Text.scaleX = 1;
        this.crystalStorageCrystal1Text.scaleY = 1;
        this.crystalStorageCrystal1Text.x = 70;
        this.crystalStorageCrystal1Text.y = this.crystalStorageRectangle.y + 67;
        this.crystalStorageCrystal1Text.textBaseLine = "alphabetic";
        this.gameLayer.addChild(this.crystalStorageCrystal1Text);

        this.gameLayer.removeChild(this.crystalStorageCrystal2Text);
        this.crystalStorageCrystal2Text = new createjs.BitmapText("X "+this.recoveredCrystals2Count,
            GAME.settings.fontSpriteSheetBlack);
        this.crystalStorageCrystal2Text.scaleX = 1;
        this.crystalStorageCrystal2Text.scaleY = 1;
        this.crystalStorageCrystal2Text.x = 70;
        this.crystalStorageCrystal2Text.y = this.crystalStorageRectangle.y + 107;
        this.crystalStorageCrystal2Text.textBaseLine = "alphabetic";
        this.gameLayer.addChild(this.crystalStorageCrystal2Text);

        //crystals recovered per shot

        this.gameLayer.removeChild(this.crystalStorageRatioCrystal1Text);
        this.crystalStorageRatioCrystal1Text = new createjs.BitmapText("/shot="+(this.recoveredCrystals1Count/this.shotsFired1).toFixed(2),
            GAME.settings.fontSpriteSheetBlack);
        this.crystalStorageRatioCrystal1Text.scaleX = .8;
        this.crystalStorageRatioCrystal1Text.scaleY = .8;
        this.crystalStorageRatioCrystal1Text.x = 50;
        this.crystalStorageRatioCrystal1Text.y = this.crystalStorageRectangle.y + 157;
        this.crystalStorageRatioCrystal1Text.textBaseLine = "alphabetic";
        this.gameLayer.addChild(this.crystalStorageRatioCrystal1Text);

        this.gameLayer.removeChild(this.crystalStorageRatioCrystal2Text);
        this.crystalStorageRatioCrystal2Text = new createjs.BitmapText("/shot="+(this.recoveredCrystals2Count/this.shotsFired2).toFixed(2),
            GAME.settings.fontSpriteSheetBlack);
        this.crystalStorageRatioCrystal2Text.scaleX = .8;
        this.crystalStorageRatioCrystal2Text.scaleY = .8;
        this.crystalStorageRatioCrystal2Text.x = 50;
        this.crystalStorageRatioCrystal2Text.y = this.crystalStorageRectangle.y + 197;
        this.crystalStorageRatioCrystal2Text.textBaseLine = "alphabetic";
        this.gameLayer.addChild(this.crystalStorageRatioCrystal2Text);



    };


    p.update = function () {
        var i;

        //update goons if game is live OR playing back OR fastforwarding
        //if (GAME.state.is("LIVE") || (GAME.state.is("PLAYBACK") && (this.remoteControl.playButton.active || this.remoteControl.FFButton.active) )) {

        this.weaponsRemaining = GAME.currentPage.options.weapon1_available_count + GAME.currentPage.options.weapon2_available_count;


        if(!this.supply_button_showing) {

            this.updateGoons(); //goons

            this.projectileMagazine.update(); //lasers

            this.handleCrystals(); //towers and crystals and shooting

            var ticksElapsed = createjs.Ticker.getTicks() - this.startTime;


            //END OF LEVEL STUFF
            //speed things up if no weapons left
            if (this.weaponsRemaining === 0 && this.crystalActive === 0){
                createjs.Ticker.setFPS(60);
            }

            //end level if eveyrone is dead or reached the mine
            var allTermsEnded = true;
            if(this.numGoonsSpawned < GAME.settings.level01_goons.length){
                allTermsEnded = false; //if not all goons have spawned
            }else if(this.numGoonsSpawned === GAME.settings.level01_goons.length){
                for (i = 0; i < this.numGoonsSpawned; i++) {
                    if(this.goons[i].termEnded === false){
                        allTermsEnded = false; //if at least one goon hasn't had his term ended
                    }
                }
            }

            if(allTermsEnded){
                createjs.Ticker.setFPS(30);
                this.alertButton("add","supply_other_base");
            }

        }


    };

    //number clicked from the post-level efficacy query
    p.numberClicked = function(evt){
        var properties = evt.currentTarget.properties;
        console.log(properties
        )
        if(properties.weapon === 1){
            this.weapon1NumberClicked = true;
            //set all of your type inactive
            for(var i=0; i<this.numbersWeapon1.length; i++){
                this.numbersWeapon1[i].properties.selected = false;
                this.numbersWeapon1[i].setBlinkFrequency(0);

            }

            //set yourself active
            this.numbersWeapon1[properties.number-1].properties.selected = true;
            this.numbersWeapon1[properties.number-1].setBlinkFrequency(500);
            this.weapon1EfficacyQueryResponse = properties.number;
        }else if(properties.weapon === 2){
            this.weapon2NumberClicked = true;
            for(var i=0; i<this.numbersWeapon2.length; i++){
                this.numbersWeapon2[i].properties.selected = false;
                this.numbersWeapon2[i].setBlinkFrequency(0);
            }

            //set yourself active
            this.numbersWeapon2[properties.number-1].properties.selected = true;
            this.numbersWeapon2[properties.number-1].setBlinkFrequency(500);
            this.weapon2EfficacyQueryResponse = properties.number;
        }

        if(this.weapon1NumberClicked && this.weapon2NumberClicked && !this.supply_button){


            this.supply_button = new GAME.Button((GAME.GameCanvas.width - this.x_offset)/2 + this.x_offset, 500, 600, 100);
            this.supply_button.setBitmapText("Send resources!!",GAME.settings.fontSpriteSheetRed, 1.5)
                .setColor("#000", 0.5) //background color
                .setRadius(10)
                .setBlinkFrequency(500);
            this.supply_button.on("click", this.finishLevel.bind(this));
            this.alertLayer.addChild(this.supply_button);

        }



    };

    p.finishLevel  = function(){
        logData({label: "efficacyQueryResponse",
            weapon1Color:this.options.weapon1_color,
            weapon2Color:this.options.weapon2_color,
            weapon1Strength:this.options.weapon1_strength,
            weapon2Strength:this.options.weapon2_strength,
            weapon1ShotsToKillGoon:100.0/this.options.weapon1_strength,
            weapon2ShotsToKillGoon:100.0/this.options.weapon2_strength,
            weapon1QueryResponse: this.weapon1EfficacyQueryResponse,
            weapon2QueryResponse: this.weapon2EfficacyQueryResponse

        });
        GAME.flowController.LIVE_to_WEAPONS();
    };

    p.alertButton = function (action, type) {

        //console.log("FROM ALERT_BUTTON PERSPECTIVE, current page is ", this)
        if (type === "weapon_select") {

            if (action === "add" && !this.weapon_select_button_showing && !this.supply_button_showing) {
                this.weapon_select_button_showing = true;

                this.weapon_select_button = new GAME.Button((GAME.GameCanvas.width - this.x_offset)/2 + this.x_offset, 500, 500, 100);
                this.weapon_select_button.setBitmapText("Select Energy Source!",GAME.settings.fontSpriteSheetWhite,1.3)
                    .setColor("#000",.5)
                    .setRadius(10);
                this.alertLayer.addChild(this.weapon_select_button);
                //console.log("ADDED WEAPON SELECT BUTTON")


                //make the crystals tween
                this.crystal1Pulse = createjs.Tween.get(this.weapon1.weapon_select_crystal.crystalSprite,{loop:true})
                    .to({ alpha:.2},500)
                    .to({ alpha:1},500);
                this.crystal2Pulse = createjs.Tween.get(this.weapon2.weapon_select_crystal.crystalSprite,{loop:true})
                    .to({ alpha:.2},500)
                    .to({ alpha:1},500);



            } else if (action === "remove" && this.weapon_select_button_showing) {
                this.crystal1Pulse.pause();
                this.crystal2Pulse.pause();
                this.alertLayer.removeChild(this.weapon_select_button);
                this.weapon_select_button_showing = false;
            }
        }else if (type === "supply_other_base") {

            if (action === "add" && !this.supply_button_showing) {

                this.stopEverything();
                this.updateCrystalsToSend();

//
                this.hitGuessButton = new GAME.Button((GAME.GameCanvas.width - this.x_offset)/2 + this.x_offset, 200, 600, 200);
                this.hitGuessButton.setColor("#000",0.5)
                    .setRadius(10)
                    .setBitmapText("How many shots did it\n take for each crystal\ntype to kill a goon?",GAME.settings.fontSpriteSheetWhite,1.3, -70);
                this.alertLayer.addChild(this.hitGuessButton);



                //add crystal images relative to the button container
                this.hitGuessButton.addChild(new GAME.Crystal(20,100,
                    this.options.weapon1_color, "available",true));
                this.hitGuessButton.addChild(new GAME.Crystal(20,140,
                    this.options.weapon2_color, "available",true));

                //add numbers
                this.numbersWeapon1 = [];
                this.numbersWeapon2 = [];
                for(var i=1; i<=15; i++){
                    this.numbersWeapon1.push(new GAME.Button(40 + i*32, 118, 25, 16)
                        .setBitmapText(i.toString(),GAME.settings.fontSpriteSheetRed, 1)
                        .setColor("#000",0.01)
                        .setRadius(0)
                        .setProperties({weapon:1, number:i, selected:false}));

                    this.numbersWeapon2.push(new GAME.Button(40 + i*32, 159, 20, 10)
                        .setBitmapText(i.toString(),GAME.settings.fontSpriteSheetRed, 1)
                        .setColor("#000",0.01)
                        .setRadius(0)
                        .setProperties({weapon:2, number:i, selected:false}));
                }

                for(var i=0; i<this.numbersWeapon1.length; i++){
                    this.numbersWeapon1[i].on("click",this.numberClicked.bind(this));
                    this.numbersWeapon2[i].on("click",this.numberClicked.bind(this));
                    this.hitGuessButton.addChild(this.numbersWeapon1[i]);
                    this.hitGuessButton.addChild(this.numbersWeapon2[i]);
                }


                //console.log("REMOVED WEAPON SELECT BUTTON222")
                this.alertLayer.removeChild(this.weapon_select_button); //remove weapon select button if it's showing
                this.supply_button_showing = true;







            } else if (action === "remove" && this.supply_button_showing) {
                this.alertLayer.removeChild(this.supply_button);
                this.supply_button_showing = false;
            }
        }
    };

    p.stopEverything = function(){
        var i;

        for (i = 0; i < GAME.currentPage.numGoonsSpawned; i++) {
            if (GAME.currentPage.goons[i].alive) {
                GAME.currentPage.goons[i].sprite.stop();
            }else{
                try{
                    GAME.currentPage.goons[i].droppedCrystal.crystalSprite.stop();
                }catch(err){
                    //this will happen when the goon's hit the mine and there's no dropped crystal...//

                    //todo - fix this
                }
            }

        }

        //make gray
        var matrix = new createjs.ColorMatrix().adjustSaturation(-100);
        this.gameLayer.filters = [
            new createjs.ColorMatrixFilter(matrix)
        ];

        this.gameLayer.cache(-20,-20, GAME.GameCanvas.width+20, GAME.GameCanvas.height+20);

    };

    p.updateCrystalsToSend = function(){

        GAME.levels[GAME.currentLevelNumber-1].recoveredCrystalCounts[0] = this.recoveredCrystals1Count;
        GAME.levels[GAME.currentLevelNumber-1].recoveredCrystalCounts[1] = this.recoveredCrystals2Count;

    };

    p.initiateNewCrystal = function (crystalNumber) {
        var i;
        this.crystalActive = crystalNumber;
        this.currentEnergy = 1;

        //make the correct crystal turn
        if (crystalNumber === 1) {

            this.weapon2.active = false;
            this.weapon2.weapon_select_crystal.crystalSprite.stop();
            //change tower colors
            for (i = 0; i < this.towers.length; i++) {
                this.towers[i].changeColor(this.options.weapon1_color, this.options.weapon1_strength);
            }

        } else if (crystalNumber === 2) {

            this.weapon1.active = false;
            this.weapon1.weapon_select_crystal.crystalSprite.stop();
            //change tower colors
            for (i = 0; i < this.towers.length; i++) {
                this.towers[i].changeColor(this.options.weapon2_color, this.options.weapon2_strength);
            }

        }


    };


    p.decreaseEnergy = function (amt) {
        this.currentEnergy -= amt;
    };

    p.render = function () {


    };

    p.tweenOut = function(){

    };

    scope.LevelPage = LevelPage;

}(window.GAME));



(function (scope) {

    function WeaponSelect(color, position, active) {
        createjs.Container.call(this);
        this.setup(color, position, active);
    }

    inheritPrototype(WeaponSelect, createjs.Container);
    var p = WeaponSelect.prototype;

    p.setup = function (color, position, active) {
        this.active = active;
        this.color = color;
        this.position = position;
        this.weapon_select_crystal = new GAME.Crystal(41 + (this.position - 1) * 68, 210, color, "weapon_select", active);
        this.addChild(this.weapon_select_crystal);

        //text
        this.weaponSelectText = new createjs.BitmapText("Energy Source",GAME.settings.fontSpriteSheetBlack);
        //this.weaponSelectText = new createjs.Text("Energy Source");
        this.weaponSelectText.scaleX = 0.7;
        this.weaponSelectText.scaleY = 0.7;
        this.weaponSelectText.x = 20;
        this.weaponSelectText.y = 23;
        this.weaponSelectText.textBaseline = "alphabetic";
        this.addChild(this.weaponSelectText)

        //add energy bars
        this.energy_bar_background = new createjs.Shape();
        this.energy_bar_background.graphics
            .beginFill("white")
            .drawRoundRect(31 + (this.position - 1) * 68,50, 50, 150, 3);
        this.energy_bar_background.alpha = 0.2;
        this.addChild(this.energy_bar_background);




        this.energy_bar = new createjs.Shape();

        this.addChild(this.energy_bar);

        if (this.active) {
            this.energy_bar.graphics
                .beginFill(GAME.settings[this.color])
                .drawRoundRect(31 + (this.position - 1) * 68,50, 50, 150 * GAME.currentPage.currentEnergy, 3);
        } else {
            this.energy_bar.graphics
                .beginFill(GAME.settings[this.color])
                .drawRoundRect(31 + (this.position - 1) * 68,50, 50, 0, 3);
        }


        //add click region
        this.clickRegion = new createjs.Shape();
        this.clickRegion.graphics
            .beginFill("white")
            .drawRoundRect(31 + (this.position - 1) * 68,50, 50, 190, 3);//extra height so it'll cover the crystal as well
        this.clickRegion.alpha = 0.01;
        this.addChild(this.clickRegion);

        this.clickRegion.on("click", this.handleClick.bind(this));



//        //add weapon select - but don't add it to the page unless state = LIVE
//        this.availableEnergyRectangle = new createjs.Shape();
//        this.availableEnergyRectangle.height = 160;
//        this.availableEnergyRectangle.y = this.weaponSelectRectangle.y + this.weaponSelectRectangle.height + this.y_separation;
//        this.availableEnergyRectangle.graphics
//            .beginFill("#858B8E") //todo put this in GameData.json
//            .drawRoundRect(0, 0,// the .y parameter sets the y value already
//                this.x_offset - 20, this.availableEnergyRectangle.height, 0);
//        this.addChild(this.availableEnergyRectangle);
//        this.availableEnergyText = new createjs.BitmapText("Available\nCrystals",GAME.settings.fontSpriteSheetBlack);
//        //this.availableEnergyText = new createjs.Text("Energy Source");
//        this.availableEnergyText.scaleX = 0.7;
//        this.availableEnergyText.scaleY = 0.7;
//        this.availableEnergyText.x = 20;
//        this.availableEnergyText.y = this.availableEnergyRectangle.y + 23;
//        this.availableEnergyText.textBaseline = "alphabetic";

        //contents of availableEnergy Box
        //crystals with a "X 8" or whatever next to them
//        this.availableEnergyCrystal1 = new GAME.Crystal(20,this.weaponSelectRectangle.y + 60,
//            this.options.weapon1_color, "available",true);
//        this.availableEnergyCrystal2 = new GAME.Crystal(20,this.weaponSelectRectangle.y + 100,
//            this.options.weapon2_color, "available",true);
//        this.addChild(this.availableEnergyCrystal1);
//        this.addChild(this.availableEnergyCrystal2);



    };

    p.handleClick = function () {
        //only accept a click if nothing is currently selected
        if (GAME.currentPage.crystalActive === 0) {
            if(this.position === 1 && GAME.currentPage.options.weapon1_available_count > 0){
                logData({label: "weaponCrystalClicked",
                    number: 1,
                    color: GAME.currentPage.options.weapon1_color,
                    countRemainingBeforeClick: GAME.currentPage.options.weapon1_available_count,
                    countRemainingAfterClick: GAME.currentPage.options.weapon1_available_count - 1
                });
                GAME.currentPage.initiateNewCrystal(this.position);
                this.active = true;
                this.weapon_select_crystal.crystalSprite.gotoAndPlay("sparkle");

                GAME.currentPage.options.weapon1_available_count -= 1;
                GAME.currentPage.updateCrystalCounts();
            }else if(this.position == 2 && GAME.currentPage.options.weapon2_available_count > 0){
                logData({label: "weaponCrystalClicked",
                    number: 2,
                    color: GAME.currentPage.options.weapon2_color,
                    countBeforeClick: GAME.currentPage.options.weapon2_available_count,
                    countAfterClick: GAME.currentPage.options.weapon2_available_count - 1
                });

                GAME.currentPage.initiateNewCrystal(this.position);
                this.active = true;
                this.weapon_select_crystal.crystalSprite.gotoAndPlay("sparkle");

                GAME.currentPage.options.weapon2_available_count -= 1;
                GAME.currentPage.updateCrystalCounts();
            }

        }

    };

    p.update = function () {



        ///AVAILABLE CRYSTALS
        //update available crystal counts
        //text to say how many are available
        this.removeChild(this.availableEnergyCrystalText);
        if(this.position === 1){
            this.availableEnergyCrystalText = new createjs.BitmapText(GAME.currentPage.options.weapon1_available_count.toString(),
                GAME.settings.fontSpriteSheetBlack);
        }else if(this.position === 2){
            this.availableEnergyCrystalText = new createjs.BitmapText(GAME.currentPage.options.weapon2_available_count.toString(),
                GAME.settings.fontSpriteSheetBlack);
        }
        this.availableEnergyCrystalText.scaleX = 1.5;
        this.availableEnergyCrystalText.scaleY = 1.5;
        this.availableEnergyCrystalText.x = 45 + (this.position - 1) * 68;
        this.availableEnergyCrystalText.y = 250;
        this.availableEnergyCrystalText.textBaseLine = "alphabetic";
        this.addChild(this.availableEnergyCrystalText);

//        this.removeChild(this.availableEnergyCrystal2Text);
//        this.availableEnergyCrystal2Text = new createjs.BitmapText(GAME.currentPage.options.weapon2_available_count.toString(),
//            GAME.settings.fontSpriteSheetBlack);
//        this.availableEnergyCrystal2Text.scaleX = 1;
//        this.availableEnergyCrystal2Text.scaleY = 1;
//        this.availableEnergyCrystal2Text.x = 31 + (this.position - 1) * 68;
//        this.availableEnergyCrystal2Text.y = 240;
//        this.availableEnergyCrystal2Text.textBaseLine = "alphabetic";
//        this.addChild(this.availableEnergyCrystal2Text);

        if (this.active && GAME.currentPage.currentEnergy > 0) {
            this.energy_bar.graphics.clear()
                .beginFill(GAME.settings[this.color])
                .drawRoundRect(31 + (this.position - 1) * 68,200 - 150 * GAME.currentPage.currentEnergy, 50, 150 * GAME.currentPage.currentEnergy, 3);
        } else {
            this.energy_bar.graphics.clear()
                .beginFill(GAME.settings[this.color])
                .drawRoundRect(31 + (this.position - 1) * 68,50, 50, 0, 3);
        }
    };


    scope.WeaponSelect = WeaponSelect;
}(window.GAME));


(function (scope) {

    function RemoteControl() {
        createjs.Container.call(this);
        this.setup();
    }

    inheritPrototype(RemoteControl, createjs.Container);
    var p = RemoteControl.prototype;

    p.setup = function () {

        this.background = new createjs.Shape();
        this.background.graphics
            .beginFill("#858B8E") //todo put this in GameData.json
            .drawRoundRect(0, 0, 200 - 20, 280, 5); //todo - why doesn't GAME.currentPage.x_offset work?
        this.addChild(this.background);

        this.y_offset = 40;
        this.playButton = new createjs.Bitmap(GAME.assets.getResult("play_button_active"));
        this.playButton.x = 20;
        this.playButton.y = 30 + this.y_offset;
        this.playButton.scaleX = 0.5;
        this.playButton.scaleY = 0.5;
        this.playButton.active = true; //start out as active
        this.addChild(this.playButton);
        this.playButtonClickRegion = new createjs.Shape();
        this.playButtonClickRegion.graphics
            .beginFill("white")
            .drawRoundRect(this.playButton.x, this.playButton.y,
                this.playButton.image.width * this.playButton.scaleX,
                this.playButton.image.height * this.playButton.scaleY, 3);
        this.playButtonClickRegion.alpha = 0.01;
        this.addChild(this.playButtonClickRegion);
        this.playButtonClickRegion.on("click", this.handlePlayButtonClick.bind(this))

        this.pauseButton = new createjs.Bitmap(GAME.assets.getResult("pause_button"));
        this.pauseButton.x = 90;
        this.pauseButton.y = 30 + this.y_offset;
        this.pauseButton.scaleX = 0.5;
        this.pauseButton.scaleY = 0.5;
        this.pauseButton.active = false;
        this.addChild(this.pauseButton);
        this.pauseButtonClickRegion = new createjs.Shape();
        this.pauseButtonClickRegion.graphics
            .beginFill("white")
            .drawRoundRect(this.pauseButton.x, this.pauseButton.y,
                this.pauseButton.image.width * this.pauseButton.scaleX,
                this.pauseButton.image.height * this.pauseButton.scaleY, 3);
        this.pauseButtonClickRegion.alpha = 0.01;
        this.addChild(this.pauseButtonClickRegion);
        this.pauseButtonClickRegion.on("click", this.handlePauseButtonClick.bind(this))

        this.stopButton = new createjs.Bitmap(GAME.assets.getResult("stop_button"));
        this.stopButton.x = 20;
        this.stopButton.y = 110 + this.y_offset;
        this.stopButton.scaleX = .5;
        this.stopButton.scaleY = .5;
        this.stopButton.active = false;
        this.addChild(this.stopButton);
        this.stopButtonClickRegion = new createjs.Shape();
        this.stopButtonClickRegion.graphics
            .beginFill("white")
            .drawRoundRect(this.stopButton.x, this.stopButton.y,
                this.stopButton.image.width * this.stopButton.scaleX,
                this.stopButton.image.height * this.stopButton.scaleY, 3);
        this.stopButtonClickRegion.alpha = 0.01;
        this.addChild(this.stopButtonClickRegion);
        this.stopButtonClickRegion.on("click", this.handleStopButtonClick.bind(this))

        this.FFButton = new createjs.Bitmap(GAME.assets.getResult("FF_button"));
        this.FFButton.x = 90;
        this.FFButton.y = 105 + this.y_offset;
        this.FFButton.scaleX = 0.5;
        this.FFButton.scaleY = 0.5;
        this.FFButton.active = false;
        this.addChild(this.FFButton);
        this.FFButtonClickRegion = new createjs.Shape();
        this.FFButtonClickRegion.graphics
            .beginFill("white")
            .drawRoundRect(this.FFButton.x, this.FFButton.y,
                this.FFButton.image.width * this.FFButton.scaleX,
                this.FFButton.image.height * this.FFButton.scaleY, 3);
        this.FFButtonClickRegion.alpha = 0.01;
        this.addChild(this.FFButtonClickRegion);
        this.FFButtonClickRegion.on("click", this.handleFFButtonClick.bind(this))

    };

    p.handlePlayButtonClick = function () {
        //only accept a click if nothing is currently selected
        if (!this.playButton.active) {

            //reset conditions
            this.playButton.active = true;
            this.pauseButton.active = false;
            this.stopButton.active = false;
            this.FFButton.active = false;

            //reset images
            this.playButton.image = GAME.assets.getResult('play_button_active');
            this.pauseButton.image = GAME.assets.getResult('pause_button');
            this.stopButton.image = GAME.assets.getResult('stop_button');
            this.FFButton.image = GAME.assets.getResult('FF_button');

            //do play-button specific stuff
            createjs.Ticker.setFPS(30);
            GAME.currentPage.staticSprite.gotoAndPlay("static");

            //start goons wiggling - they start back automatically - why?

        }

    };


    p.handleStopButtonClick = function () {
        //only accept a click if nothing is currently selected

        //reset conditions
//        this.playButton.active = false;
//        this.pauseButton.active = false;
//        this.stopButton.active = true;
//        this.FFButton.active = false;
//
//        //reset images
//        this.playButton.image = GAME.assets.getResult('play_button');
//        this.pauseButton.image = GAME.assets.getResult('pause_button');
//        this.stopButton.image = GAME.assets.getResult('stop_button_active');
//        this.FFButton.image = GAME.assets.getResult('FF_button');

        //go back to playback page


    };


    p.handleFFButtonClick = function () {
        //only accept a click if nothing is currently selected
        //reset conditions
        this.playButton.active = false;
        this.pauseButton.active = false;
        this.stopButton.active = false;
        this.FFButton.active = true;

        //reset images
        this.playButton.image = GAME.assets.getResult('play_button');
        this.pauseButton.image = GAME.assets.getResult('pause_button');
        this.stopButton.image = GAME.assets.getResult('stop_button');
        this.FFButton.image = GAME.assets.getResult('FF_button_active');

        //do play-button specific stuff
        createjs.Ticker.setFPS(90);
        GAME.currentPage.staticSprite.gotoAndPlay("static");


    };


    p.handlePauseButtonClick = function () {
        var i;

        //only accept a click if nothing is currently selected
        //reset conditions
        this.playButton.active = false;
        this.pauseButton.active = false;
        this.stopButton.active = true;
        this.FFButton.active = false;

        //reset images
        this.playButton.image = GAME.assets.getResult('play_button');
        this.pauseButton.image = GAME.assets.getResult('pause_button_active');
        this.stopButton.image = GAME.assets.getResult('stop_button');
        this.FFButton.image = GAME.assets.getResult('FF_button');

        //stop goons from wiggling

        for (i = 0; i < GAME.currentPage.numGoonsSpawned; i++) {
            if (GAME.currentPage.goons[i].alive) {
                GAME.currentPage.goons[i].sprite.stop();
            }
        }
        GAME.currentPage.staticSprite.stop();

    };


    scope.RemoteControl = RemoteControl;
}(window.GAME));
