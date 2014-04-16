/**
 * Created by Tom on 4/7/14.
 */



(function (scope) {

    function LevelPage() {
        createjs.Container.call(this);
        this.setup();
    }
    inheritPrototype(LevelPage,createjs.Container);


    var p = LevelPage.prototype;

    p.setup = function () {

        if (GAME.debugmode)
            log('LevelPage.setup');

        this.loadLevelData();

        //draw background
        this.bg = new createjs.Bitmap(GAME.assets.getResult("background_level1"));
        this.addChild(this.bg);
        this.bg.x = GAME.GameCanvas.width/2 - this.bg.image.width/2;
        this.bg.y = GAME.GameCanvas.height/2 - this.bg.image.height/2;


        this.goon = GAME.goonArray[0];
        this.goon.setup(1);

//        // calculate pathfinding costs
//        GAME.AI.newGrid(this.levelData.layers[1].data, this.levelData.width, this.levelData.height);


//        if (GAME.debugmode)
//            log('Total tiles in the world: ' + world_complexity);

        if (GAME.debugmode)
            log('initLevel complete.');

    };

    p.loadLevelData = function(){
        this.levelData = GAME.assets.getResult("level01_data");
        log(this.levelData);
        //profile_start('initLevel');
        if (GAME.debugmode)
            log('initLevel...');
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

    p.update = function(){


    };

    p.render = function(){


    };

    scope.LevelPage = LevelPage;

}(window.GAME));