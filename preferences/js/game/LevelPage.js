/**
 * Created by Tom on 4/7/14.
 */



(function (scope) {

    function LevelPage() {
        createjs.Container.call(this);
        this.setup();
    }

    inheritPrototype(LevelPage, createjs.Container);

    var p = LevelPage.prototype;

    p.setup = function () {

        if (GAME.debugmode)
            log('LevelPage.setup');

        this.crystalActive = 0; //0 is NONE, 1 is 1 and 2 is 2

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

        //add weapon select
        this.weapon_select_rectangle = new createjs.Shape();
        this.weapon_select_rectangle.graphics
            .beginFill("#858B8E") //todo put this in GameData.json
            .drawRoundRect(0, 0, this.x_offset - 20, 280, 5);
        this.addChild(this.weapon_select_rectangle);
        this.weapon_select_text = new createjs.Text("Energy Source", "12px Lucida Console", "black");
        this.weapon_select_text.x = 20;
        this.weapon_select_text.y = 25;
        this.weapon_select_text.textBaseline = "alphabetic";
        this.addChild(this.weapon_select_text);

        this.currentEnergy = .9;
        this.weapon1 = new GAME.WeaponSelect("green", 1, false);
        this.weapon2 = new GAME.WeaponSelect("blue", 2, false);
        this.addChild(this.weapon1);
        this.addChild(this.weapon2);


        //add crystal storage
        this.crystalStorageRectangle = new createjs.Shape();
        this.crystalStorageRectangle.graphics
            .beginFill("#858B8E") //todo put this in GameData.json
            .drawRoundRect(0, 300, this.x_offset - 20, 280, 5);
        this.addChild(this.crystalStorageRectangle);
        this.nextCrystalCoords = {"x":10, "y":310};


        //in the middle!
        this.weapon_select_sign_text = new createjs.Text("Select Energy Source!", "50px Lucida Console", "white");
        this.weapon_select_sign_text.x = 300;
        this.weapon_select_sign_text.y = 500;
        //this.weapon_select_sign_text.textBaseline = "alphabetic";
        //this.weapon_select_sign_text.lineWidth = 180;
        this.addChild(this.weapon_select_sign_text);


        //add static
        this.static = new createjs.SpriteSheet({
            "animations": {
                "static": [0, 13, "static",.25]
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
        this.addChild(this.staticSprite);


        GAME.AI.newGrid(this.levelData.layers[1].data, this.levelData.width, this.levelData.height);

        this.startX = GAME.AI.spawnX * this.levelData.tilewidth;
        this.startY = GAME.AI.spawnY * this.levelData.tileheight;

        this.goons = [];
        this.num_goons = 0;

//        viewport_max_x = this.levelData.width * this.levelData.tilewidth;
//        viewport_max_y = (this.levelData.height + 2) * this.levelData.tileheight; // extend past the level data: fell_too_far + 1;


        this.startTime = createjs.Ticker.getTime();
        this.spawnTime = createjs.Ticker.getTime();

        if (GAME.debugmode)
            log('initLevel complete.');


    };

    p.loadLevelData = function () {
        this.levelData = GAME.assets.getResult("level01_data");
        log(this.levelData);
        //profile_start('initLevel');
//        if (GAME.debugmode)
//            log('initLevel...');
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
        //decide whether to spawn a new goon
        if ((createjs.Ticker.getTime() - this.spawnTime) / 1000 > GAME.settings.goon_spawn_time) {

            //get number of spawn intervals passed
            var spawn_intervals = Math.floor(( createjs.Ticker.getTime() - this.startTime) / 1000 / GAME.settings.goon_spawn_time);
            var goon_type_to_spawn = GAME.settings.level01_goons[spawn_intervals];
            this.spawnTime = createjs.Ticker.getTime();
            //if the interval has a goon associated with it in the game settings
            if (goon_type_to_spawn == 1) {
                //can't use spawn intervals as index as some intervals don't have an associated goon
                //so we need to use the ACTUAL goon number as the interval
                this.goons.push(new GAME.Goon(this.num_goons, goon_type_to_spawn));
                this.goons[this.num_goons].spawn(this.startX, this.startY);
                this.addChildAt(this.goons[this.num_goons], this.getNumChildren()-1);

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
        }else{
            this.weapon1.update();
            this.weapon2.update();
        }




        //only shoot if one of the crystals is active
        if (this.crystalActive === 0) {
            this.addChild(this.weapon_select_sign_text);//.text = "Select Energy Source!";
            this.weapon2.active = false;
            this.weapon2.weapon_select_crystal.crystalSprite.stop();
            this.weapon1.active = false;
            this.weapon1.weapon_select_crystal.crystalSprite.stop();

            //make towers grey
            //change tower colors
            for(var i=0; i<this.towers.length; i++){
                this.towers[i].changeColor("dead");
            }

        } else {
            for (i = 0; i < this.towers.length; i++) {
                this.towers[i].update();
            }
            this.removeChild(this.weapon_select_sign_text)
        }

    };

    p.initiateNewCrystal = function (crystalNumber) {
        this.crystalActive = crystalNumber;
        this.currentEnergy = 1;
        log('initating!');


        //make the correct crystal turn
        if (crystalNumber === 1) {

            var new_color = this.weapon1.color;
            this.weapon2.active = false;
            this.weapon2.weapon_select_crystal.crystalSprite.stop();


        } else if (crystalNumber === 2) {

            var new_color = this.weapon2.color;
            this.weapon1.active = false;
            this.weapon1.weapon_select_crystal.crystalSprite.stop();

        }
        //change tower colors
        for(var i=0; i<this.towers.length; i++){
            this.towers[i].changeColor(new_color);
        }


    };

    p.getCrystalStorageCoords = function(){
        var lastCoords = this.nextCrystalCoords;
        //update coordinates for next time
        var new_x = lastCoords.x + 32;
        var new_y = lastCoords.y;

        if(new_x+32 > this.x_offset){
            new_x = 10;
            new_y += 42;
        }

        this.nextCrystalCoords = {"x":new_x, "y":new_y}
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
