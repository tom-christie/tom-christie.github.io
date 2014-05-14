/**
 * Created by Tom on 4/7/14.
 *
 * todo - question: how does the playback AI pick which color laser to shoot? Randomly?
 */



(function (scope) {

    function LevelPage(options) {
        createjs.Container.call(this);
        this.setup(options);
    }

    inheritPrototype(LevelPage, createjs.Container);

    var p = LevelPage.prototype;

    p.setup = function (options) {

        this.options = {
            "weapon1_color":"white",
            "weapon1_strength":5,
            "weapon2_color":"yellow",
            "weapon2_strength":10
        };



        //TEMPORARY
        GAME.state.current = "LIVE";
        //GAME.state.current = "PLAYBACK";

        if (GAME.debugmode)
            log('LevelPage.setup');

        this.crystalActive = 0; //0 is neither, 1 is first and 2 is second

        this.loadLevelData();

        this.x_offset = 200;
        //draw background
        this.map = new createjs.Bitmap(GAME.assets.getResult("background_level1"));
        this.map.x = this.x_offset;//GAME.GameCanvas.width/2 - this.map.image.width/2;
        this.map.y = 0;//GAME.GameCanvas.height/2 - this.map.image.height/2;

        this.x = GAME.GameCanvas.width / 2 - this.map.image.width / 2 - this.x_offset / 2;
        this.y = GAME.GameCanvas.height / 2 - this.map.image.height / 2;

        //draw a box around the screen
        this.border_rectangle = new createjs.Shape();
        this.border_rectangle.graphics
            .beginFill("#2A3034") //todo put this in GameData.json
            .drawRoundRect(this.map.x - 20 - this.x_offset, this.map.y - 20, this.map.image.width + 40 + this.x_offset, this.map.image.height + 40, 10);
        this.addChild(this.border_rectangle);
        this.addChild(this.map);

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
            this.addChild(this.towers[i]);
        }

        //add projectiles
        this.projectileMagazine = new GAME.ProjectileMagazine();

        //add crystal storage
        this.crystalStorageRectangle = new createjs.Shape();
        this.crystalStorageRectangle.graphics
            .beginFill("#858B8E") //todo put this in GameData.json
            .drawRoundRect(0, 300, this.x_offset - 20, 280, 5);
        this.addChild(this.crystalStorageRectangle);
        this.nextCrystalCoords = {"x": 10, "y": 310};


        GAME.AI.newGrid(this.levelData.layers[1].data, this.levelData.width, this.levelData.height);

        this.startX = GAME.AI.spawnX * this.levelData.tilewidth;
        this.startY = GAME.AI.spawnY * this.levelData.tileheight;

        this.goons = [];
        this.num_goons = 0;

        //add weapon select - but don't add it to the page unless state = LIVE
        this.weapon_select_rectangle = new createjs.Shape();
        this.weapon_select_rectangle.graphics
            .beginFill("#858B8E") //todo put this in GameData.json
            .drawRoundRect(0, 0, this.x_offset - 20, 280, 5);
        this.addChild(this.weapon_select_rectangle);
        this.weapon_select_text = new createjs.Text("Energy Source", "12px Lucida Console", "black");
        this.weapon_select_text.x = 20;
        this.weapon_select_text.y = 25;
        this.weapon_select_text.textBaseline = "alphabetic";

        this.currentEnergy = 0;
        this.weapon1 = new GAME.WeaponSelect(this.options.weapon1_color, 1, false);
        this.weapon2 = new GAME.WeaponSelect(this.options.weapon2_color, 2, false);

        if (GAME.state.is("LIVE")) {

            this.addChild(this.weapon_select_text);
            this.addChild(this.weapon1);
            this.addChild(this.weapon2);

            //in the middle!
            this.weapon_select_sign_text = new createjs.Text("Select Energy Source!", "50px Lucida Console", "white");
            this.weapon_select_sign_text.x = 300;
            this.weapon_select_sign_text.y = 500;
            this.addChild(this.weapon_select_sign_text);

        } else if (GAME.state.is("PLAYBACK")) {

            this.remoteControl = new GAME.RemoteControl();
            this.addChild(this.remoteControl);

            //add static
            this.static = new createjs.SpriteSheet({
                "animations": {
                    "static": [0, 13, "static", .25]
                },
                "images": [GAME.assets.getResult("static")],
                "frames": {
                    "height": 600,
                    "width": 800,
                    "regX": 0,
                    "regY": 0,
                    "count": 14
                }
            });
            this.staticSprite = new createjs.Sprite(this.static, "static");
            this.staticSprite.x = this.x_offset;
            this.staticSprite.y = 0;
            this.staticSprite.alpha = .5;
            this.addChild(this.staticSprite);


        }


        this.startTime = createjs.Ticker.getTicks();
        this.spawnTime = createjs.Ticker.getTicks();

        if (GAME.debugmode)
            log('initLevel complete.');


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

    p.update = function () {
        var i;

        //update goons if game is live OR playing back OR fastforwarding
        if (GAME.state.is("LIVE") || (GAME.state.is("PLAYBACK") && (this.remoteControl.playButton.active || this.remoteControl.FFButton.active) )) {
            //decide whether to spawn a new goon
            if ((createjs.Ticker.getTicks() - this.spawnTime) > GAME.settings.goon_spawn_ticks) {

                //get number of spawn intervals passed
                var spawn_intervals = Math.floor(( createjs.Ticker.getTicks() - this.startTime) / GAME.settings.goon_spawn_ticks) - 1;
                var goon_type_to_spawn = GAME.settings.level01_goons[spawn_intervals];
                this.spawnTime = createjs.Ticker.getTicks();
                //if the interval has a goon associated with it in the game settings
                if (goon_type_to_spawn == 1) {
                    //can't use spawn intervals as index as some intervals don't have an associated goon
                    //so we need to use the ACTUAL goon number as the interval
                    this.goons.push(new GAME.Goon(this.num_goons, goon_type_to_spawn));
                    this.goons[this.num_goons].spawn(this.startX, this.startY);
                    this.addChildAt(this.goons[this.num_goons], this.getNumChildren());//-1);
                    this.spawnTime = createjs.Ticker.getTicks();
                    this.num_goons += 1;
                }
            }
            GAME.AI.update();
            for (i = 0; i < this.num_goons; i++) {
                this.goons[i].update();
            }

            this.projectileMagazine.update();

            if (this.currentEnergy <= 0) {
                this.crystalActive = 0;

                if(GAME.state.is("PLAYBACK")){
                    //select new crystal at random
                    this.crystalActive = Math.floor(Math.random()*2 + 1);
                    this.initiateNewCrystal(this.crystalActive);
                }

            } else {
                this.weapon1.update();
                this.weapon2.update();
            }


            //only shoot if one of the crystals is active
            if (this.crystalActive === 0) {

                if (GAME.state.is("LIVE")) {
                    this.addChild(this.weapon_select_sign_text);
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

            } else {
                for (i = 0; i < this.towers.length; i++) {
                    this.towers[i].update();
                }
                this.removeChild(this.weapon_select_sign_text);//todo - is this called a lot?
            }
        }

    };

    p.initiateNewCrystal = function (crystalNumber) {
        this.crystalActive = crystalNumber;
        this.currentEnergy = 1;
        log('initating!');

        log(this.options)
        //make the correct crystal turn
        if (crystalNumber === 1) {

            this.weapon2.active = false;
            this.weapon2.weapon_select_crystal.crystalSprite.stop();
            //change tower colors
            for (var i = 0; i < this.towers.length; i++) {
                this.towers[i].changeColor(this.options.weapon1_color, this.options.weapon1_strength);
            }

        } else if (crystalNumber === 2) {

            this.weapon1.active = false;
            this.weapon1.weapon_select_crystal.crystalSprite.stop();
            //change tower colors
            for (var i = 0; i < this.towers.length; i++) {
                this.towers[i].changeColor(this.options.weapon2_color, this.options.weapon2_strength);
            }

        }



    };

    p.getCrystalStorageCoords = function () {
        var lastCoords = this.nextCrystalCoords;
        //update coordinates for next time
        var new_x = lastCoords.x + 32;
        var new_y = lastCoords.y;

        if (new_x + 32 > this.x_offset) {
            new_x = 10;
            new_y += 42;
        }

        this.nextCrystalCoords = {"x": new_x, "y": new_y}
        return lastCoords;
    };

    p.decreaseEnergy = function (amt) {
        this.currentEnergy -= amt;
    };

    p.render = function () {


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
        this.weapon_select_crystal = new GAME.Crystal(20, 50 + (this.position - 1) * 50, color, "weapon_select", active);
        this.addChild(this.weapon_select_crystal);


        //add energy bars
        this.energy_bar_background = new createjs.Shape();
        this.energy_bar_background.graphics
            .beginFill("white")
            .drawRoundRect(60, 50 + (this.position - 1) * 50, 100, 32, 3);
        this.energy_bar_background.alpha = 0.2;
        this.addChild(this.energy_bar_background);

        this.energy_bar = new createjs.Shape();
        if (active) {
            this.energy_bar.graphics
                .beginFill(GAME.settings[this.color]) //todo put these colors in JSON file
                .drawRoundRect(60, 50 + (this.position - 1) * 50, 100 * GAME.currentPage.currentEnergy, 32, 3);
        } else {
            this.energy_bar.graphics
                .beginFill(GAME.settings[this.color]) //todo put these colors in JSON file
                .drawRoundRect(60, 50 + (this.position - 1) * 50, 0, 32, 3);
        }
        this.addChild(this.energy_bar);


        //add click region
        this.clickRegion = new createjs.Shape();
        this.clickRegion.graphics
            .beginFill("white")
            .drawRoundRect(0, 50 + (this.position - 1) * 50, 180, 32, 3);
        this.clickRegion.alpha = 0.01;
        this.addChild(this.clickRegion);

        this.clickRegion.on("click", this.handleClick.bind(this));

    };

    p.handleClick = function () {
        //only accept a click if nothing is currently selected
        if (GAME.currentPage.crystalActive === 0) {
            log('clicked!');
            GAME.currentPage.initiateNewCrystal(this.position);
            this.active = true;
            this.weapon_select_crystal.crystalSprite.gotoAndPlay("sparkle");
            log("WHAT, you should be turning now!");

        }

    };

    p.update = function () {
        if (this.active) {
            this.energy_bar.graphics.clear()
                .beginFill(GAME.settings[this.color]) //todo put these colors in JSON file
                .drawRoundRect(60, 50 + (this.position - 1) * 50, 100 * GAME.currentPage.currentEnergy, 32, 3);
        } else {
            //not strictly necessary
            this.energy_bar.graphics.clear()
                .beginFill(GAME.settings[this.color]) //todo put these colors in JSON file
                .drawRoundRect(60, 50 + (this.position - 1) * 50, 0, 32, 3);

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

        for (i = 0; i < GAME.currentPage.num_goons; i++) {
            if(GAME.currentPage.goons[i].alive){
            GAME.currentPage.goons[i].sprite.stop();
            }
        }
        GAME.currentPage.staticSprite.stop();

    };


    scope.RemoteControl = RemoteControl;
}(window.GAME));
