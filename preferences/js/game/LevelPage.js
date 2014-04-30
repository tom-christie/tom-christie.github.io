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

        this.loadLevelData();


        //draw background
        this.map = new createjs.Bitmap(GAME.assets.getResult("background_level1"));
        this.map.x = 0;//GAME.GameCanvas.width/2 - this.map.image.width/2;
        this.map.y = 0;//GAME.GameCanvas.height/2 - this.map.image.height/2;

        this.x = GAME.GameCanvas.width/2 - this.map.image.width/2;
        this.y = GAME.GameCanvas.height/2 - this.map.image.height/2;

        //draw a box around the screen
        this.border_rectangle = new createjs.Shape();
        this.border_rectangle.graphics
            .beginFill("#2A3034") //todo put this in GameData.json
            .drawRoundRect(this.map.x - 20, this.map.y - 20, this.map.image.width+40, this.map.image.height+40,  10);
        this.addChild(this.border_rectangle);
        this.addChild(this.map);


        this.towers = [];
        var tiles = this.levelData.layers[1].data;
        var tower_tile_number = GAME.settings.TILE_INDEX_BUILDABLE;
        var tile_height =this.levelData.tileheight;
        var tile_width =  this.levelData.tilewidth;
        var num_tiles_across = this.levelData.layers[1].width;
        var num_total_tiles = num_tiles_across * this.levelData.layers[1].width;
        for(var i=0; i<num_total_tiles; i++){
            //add towers at appropriate places
            if(tiles[i]  == tower_tile_number){
                var y = tile_height * Math.floor(i/num_tiles_across);
                var x = tile_width * (i % num_tiles_across);
                this.towers.push(new GAME.Tower(x,y));
            }
        }
        for(i=0; i<this.towers.length; i++){
            this.addChild(this.towers[i]);
        }

        //add projectiles
        this.projectileMagazine = new GAME.ProjectileMagazine();







//        this.test_goon = new GAME.Goon();
//        console.log(this.test_goon);
//        this.addChild(this.test_goon);



        GAME.AI.newGrid(this.levelData.layers[1].data, this.levelData.width, this.levelData.height);

        this.startX = GAME.AI.spawnX * this.levelData.tilewidth;
        this.startY = GAME.AI.spawnY * this.levelData.tileheight;

        this.goons = [];
        this.num_goons = 0

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
                this.addChild(this.goons[this.num_goons]);

                this.num_goons += 1;
            }
        }
        GAME.AI.update();
        for(var i=0; i<this.num_goons; i++){
            this.goons[i].update();
        }

        for(var i=0; i<this.towers.length; i++){
            this.towers[i].update();
        }

        this.projectileMagazine.update();
    };

    p.render = function () {


    };

    scope.LevelPage = LevelPage;

}(window.GAME));