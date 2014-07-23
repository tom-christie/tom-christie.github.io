

(function (scope) {

    var Goon = function () {
        this.setup();
    };

    Goon.prototype = new createjs.Container();
    var p = Goon.prototype;
    Goon.prototype.Container_initialize = p.initialize;


    Goon.prototype.setup = function (id, type) {
        this.id = id;
        this.Container_initialize();
        // add custom setup logic here.

        this.spriteSheet = new createjs.SpriteSheet({
            "animations": {
                "move_up": [0, 7, "move_up", .5],
                "move_left": [8, 15, "move_left", .5],
                "move_down": [16, 23, "move_down", .5],
                "move_right": [24, 31, "move_right", .5]
            },
            "images": [GAME.assets.getResult("goon1")],
            "frames": {
                "height": 32,
                "width": 32,
                "regX": 0,
                "regY": 0,
                "count": 32
            }
        });

        this.height = 32;
        this.width = 32;

        this.sprite = new createjs.Sprite(this.spriteSheet, "move_right");
        this.frame = 0;
        this.addChild(this.sprite);


        this.explosionSpriteSheet = new createjs.SpriteSheet({
            "animations": {
                "explode": [0, 16]
            },
            "images": [GAME.assets.getResult("explosion")],
            "frames": {
                "height": 64,
                "width": 64,
                "regX": 0,
                "regY": 0,
                "count": 316
            }
        });


        this.explosionSprite = new createjs.Sprite(this.explosionSpriteSheet, "explode");
        this.explosionSprite.on("animationend", handleAnimationEnd.bind(this)); //don't remove sprite till explosion is over
        function handleAnimationEnd(event) {
            this.removeChild(this.explosionSprite);
        }
        this.exploded = false;


        //make health bar
        this.healthbar_red = new createjs.Shape();
        this.healthbar_red.graphics
            .beginFill("#F00")
            .drawRoundRect(0, 0, 32, 5, 2);
        this.healthbar_green = new createjs.Shape();
        this.healthbar_green.graphics
            .beginFill("#0F0")
            .drawRoundRect(0, 0, 32, 5, 2);

        this.addChild(this.healthbar_red);
        this.addChild(this.healthbar_green);

        this.damage = {
            "red":0,
            "yellow":0,
            "green":0,
            "cyan":0,
            "blue":0,
            "purple":0,
            "white":0};


        //these are referenced by the pathfinding algorithm
        this.speed = null;
        this.currentPath = null;
        this.waitingForPath = null;
        this.destinationX = null;
        this.destinationY = null;
        this.currentAnimation = null;
        this.collected = false; //whether the crystal's been collected or not
        //this.visible = false;

        this.on("click",this.handleCrystalClick.bind(this));

    };


    p.spawn = function (x, y) {
        //this.visible = true;
        this.alive = true;
        this.x_original = x;
        this.y_original = y;
        this.x = x  + GAME.currentPage.x_offset;
        this.y = y;
        this.speed = 1;
        this.health = 100;
    };

    p.update = function () {
//        //get direction from pathfinder
        this.move();

    };

    p.move = function () {

        // do we need to move?
        if (this.speed && this.alive) {
            if (!this.currentPath && !this.waitingForPath) {

                this.pathCurrentNode = 0;

                var currentGridX = (this.x_original / GAME.settings.TILESIZE) | 0;
                var currentGridY = (this.y_original / GAME.settings.TILESIZE) | 0;
                //console.log(currentGridX, currentGridY, GAME.AI.goalX, GAME.AI.goalY)
                GAME.AI.findPath(this, currentGridX, currentGridY, GAME.AI.goalX, GAME.AI.goalY);

            } else if (this.currentPath && !this.waitingForPath) {

                if ((this.pathCurrentNode < this.currentPath.length - 1) && this.currentPath[this.pathCurrentNode + 1]) {
                    this.destinationX = this.currentPath[this.pathCurrentNode + 1].x * GAME.settings.TILESIZE;// + GAME.settings.TILESIZEDIV2; // //center of the tile
                    this.destinationY = this.currentPath[this.pathCurrentNode + 1].y * GAME.settings.TILESIZE;// + GAME.settings.TILESIZEDIV2; // + wobbleAI();

                    // move towards our next waypoint
                    // and switch animations accordingly
                    this.frame = (this.frame + 1) % 8;
                    //if(this.index == 1) log(this.frame);

                    //todo make it so that diagonal movement is scaled down by sqrt(2)
                    if (this.destinationY > this.y_original) {
                        this.y_original += this.speed;
                        this.sprite.gotoAndPlay("move_down");
                        this.sprite.currentAnimationFrame += this.frame;
                    }
                    if (this.destinationY < this.y_original) {
                        this.y_original -= this.speed;
                        this.sprite.gotoAndPlay("move_up");
                        this.sprite.currentAnimationFrame += this.frame;
                    }
                    if (this.destinationX > this.x_original) {
                        this.x_original += this.speed;
                        this.sprite.gotoAndPlay("move_right");
                        this.sprite.currentAnimationFrame += this.frame;
                    }
                    if (this.destinationX < this.x_original) {
                        this.x_original -= this.speed;
                        this.sprite.gotoAndPlay("move_left");
                        this.sprite.currentAnimationFrame += this.frame;

                    }

                    //move up a bit so the feet are in the center of the tile
                    this.y = this.y_original - GAME.settings.TILESIZEDIV2;
                    this.x = this.x_original + GAME.currentPage.x_offset;

                    if (this.closeEnough(this.destinationX, this.destinationY, this.x_original, this.y_original, 5)) {
                        this.pathCurrentNode++;
                    }

                }
            }
        } // movement
    };

    p.closeEnough = function (x1, y1, x2, y2, dist) {
        return (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) <= dist);
    };

    p.hitBy = function(color, strength){
        logData({label:"goonShot",hitby:color,oldHealth:this.health,newHealth:this.health-strength,damage:strength,goonNum:this.id});
        //keep track of damage from each color
        this.damage[color] += strength;

        this.lastHitByColor = color;
        this.health -= strength;
        if(this.health <= 0){
            this.die(color);
        }
        this.healthbar_green.graphics.clear()
            .beginFill("#0F0")
            .drawRoundRect(0, 0, 32*(this.health/100), 5, 2);
    };

    p.die = function(color){


        var damage = this.damage;
        //figured out what crystal to send up
        var totalDamage = 0;
        for(var c in damage) totalDamage += damage[c];
        var r = Math.random();
        var cumsum = 0;
        for(c in damage){
            cumsum += damage[c]/totalDamage;
            if(r < cumsum){
                this.crystalColor = c;
                break;
            }
        }

        logData({label:"goonDeath", hitby:color,goonNum:this.id,crystalColor:this.crystalColor });


        this.alive = false;
        this.removeChild(this.sprite);
        this.removeChild(this.healthbar_green);
        this.removeChild(this.healthbar_red);

        this.addChild(this.explosionSprite);
        //so it won't explode twice ->
        if(!this.exploded && this.alive){
            this.explosionSprite.gotoAndPlay("explode");
            this.exploded = true;
        }else{

        }

        //make crystal
        this.droppedCrystal = new GAME.Crystal(0, 0, this.crystalColor, "weapon_select", true);
        this.addChild(this.droppedCrystal);
        //auto-pickup crystal if state is playack
        if(GAME.state.is("PLAYBACK")){
             this.handleCrystalClick();
        }
        //pick a random angle, and send it to that location
        var random_angle = 2*Math.PI*Math.random();
        var distance = 50;
        //todo - make sure the target coords are on the screen
        createjs.Tween.get(this).to({y:this.y + distance*Math.sin(random_angle)}, 500, createjs.Ease.quadIn);
        createjs.Tween.get(this).to({x:this.x + distance*Math.cos(random_angle)}, 500)


    };

    p.handleCrystalClick = function(){
        if(!this.alive && !this.collected){
            this.collected = true;
            var coords = GAME.currentPage.getCrystalStorageCoords(this.crystalColor);
            createjs.Tween.get(this).to({x:coords.x, y:coords.y}, 500).to({alpha:0},0).call(this.updateRecoveredCrystalCount);
            this.droppedCrystal.crystalSprite.stop();
            logData({
                label:"crystalCollected",
                crystalColor:this.crystalColor,
                crystals1CollectedCount:GAME.currentPage.recoveredCrystals1Count,
                crystals2CollectedCount:GAME.currentPage.recoveredCrystals2Count
            });
        }
    };

    p.updateRecoveredCrystalCount = function(){
        GAME.currentPage.updateRecoveredCrystalCount(this.crystalColor);


    };

    p.hitMine = function(){
        logData({label:"goonHitTarget",goonNum:this.id,health:this.health });


        this.alive = false;
            this.removeChild(this.sprite);
            this.removeChild(this.healthbar_green);
            this.removeChild(this.healthbar_red);
    };

    scope.Goon = Goon;
}(window.GAME));

