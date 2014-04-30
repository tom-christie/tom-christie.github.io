(function (scope) {

    var Goon = function () {
        this.setup();
    };

    Goon.prototype = new createjs.Container();
    var p = Goon.prototype;
    Goon.prototype.Container_initialize = p.initialize;


    Goon.prototype.setup = function (label) {
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

        this.explosionSprite.on("animationend", handleAnimationEnd.bind(this));
        function handleAnimationEnd(event) {
            this.removeChild(this.explosionSprite);
            this.visible = false;
        }

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


        //these are referenced by the pathfinding algorithm
        this.active = false;
        this.speed = null;
        this.currentPath = null;
        this.waitingForPath = null;
        this.destinationX = null;
        this.destinationY = null;
        this.currentAnimation = null;
        this.visible = false;

    };


    p.spawn = function (x, y) {
        this.visible = true;
        this.x_original = x;
        this.y_original = y;
        this.x = x;
        this.y = y;
        this.speed = 1;
        this.active = true;
        this.dead = false;
        this.dying = false;

        this.health = 100;
    };

    p.update = function () {
//        //get direction from pathfinder
        this.move();

    };

    p.move = function () {

        // do we need to move?
        if (this.speed) {
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
                    this.x = this.x_original;

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

    p.hitBy = function(color_index){
        this.health -= 5;
        if(this.health <= 0){
            this.die();
        }
        this.healthbar_green.graphics.clear()
            .beginFill("#0F0")
            .drawRoundRect(0, 0, 32*(this.health/100), 5, 2);
    };

    p.die = function(){
        this.removeChild(this.sprite);
        this.removeChild(this.healthbar_green);
        this.removeChild(this.healthbar_red);
        this.addChild(this.explosionSprite);
        this.explosionSprite.gotoAndPlay("explode");
        //don't make invisible till the explosion is over!
    };

    scope.Goon = Goon;
}(window.GAME));


///**
// * Created by Tom on 4/13/14.
// */
//
//
//(function (scope) {
//
//
//        var Goon = function (index, type) {
//            this.setup(index);
//        }
//
//        Goon.prototype = new createjs.Container();
//        var p = Goon.prototype;
//        Goon.prototype.Container_initialize = p.initialize;
//
//
//    ///////////////////////////////////////
//    // define new functions as necessary //
//    ///////////////////////////////////////
//
//    Goon.prototype.setup = function (index) {
//        this.Container_initialize();
////
////        this.index = index;
////
////        this.x = 0;
////        this.y = 0;
////
////        this.spriteSheet = new createjs.SpriteSheet({
////            "animations": {
////                "move_up": [0, 7, "move_up", .5],
////                "move_left": [8, 15, "move_left", .5],
////                "move_down": [16, 23, "move_down", .5],
////                "move_right": [24, 31, "move_right", .5]
////            },
////            "images": [GAME.assets.getResult("goon1")],
////            "frames": {
////                "height": 32,
////                "width": 32,
////                "regX": 0,
////                "regY": 0,
////                "count": 32
////            }
////        });
////        this.sprite = new createjs.Sprite(this.spriteSheet, "move_right");
////        this.frame = 0;
////
////        //not adding here for some reason
////        this.addChild(this.sprite);
//
//        //make health bar
//        this.healthbar_red = new createjs.Shape();
//        this.healthbar_red.graphics
//            .beginFill("#F00")
//            .drawRoundRect(0,0, 320, 50, 2);
//        this.healthbar_green = new createjs.Shape();
//        this.healthbar_green.graphics
//            .beginFill("#0F0")
//            .drawRoundRect(0,0, 302, 50, 2);
//
//        this.addChild(this.healthbar_red);
//        this.addChild(this.healthbar_green);
////
////        //these are referenced by the pathfinding algorithm
////        this.active = false;
////        this.speed = null;
////        this.currentPath = null;
////        this.waitingForPath = null;
////        this.destinationX = null;
////        this.destinationY = null;
//////
////        this.currentAnimation = null;
//
//    };
//
//    p.spawn = function (x, y) {
////        this.x = x; //in pixels
////        this.y = y; //in pixels
////        this.speed = 1;
////        this.active = true;
////        this.dead = false;
////        this.dying = false;
//    };
//
//    p.update = function () {
////        //get direction from pathfinder
////        this.move();
//
//    };
//
//    p.move = function () {
////
////        // do we need to move?
////        if (this.speed) {
////            if (!this.currentPath && !this.waitingForPath) {
////
////                this.pathCurrentNode = 0;
////
////                var currentGridX = (this.x / GAME.settings.TILESIZE) | 0;
////                var currentGridY = (this.y / GAME.settings.TILESIZE) | 0;
////                //console.log(currentGridX, currentGridY, GAME.AI.goalX, GAME.AI.goalY)
////                GAME.AI.findPath(this, currentGridX, currentGridY, GAME.AI.goalX, GAME.AI.goalY);
////
////            } else if (this.currentPath && !this.waitingForPath) {
////
////                if ((this.pathCurrentNode < this.currentPath.length - 1) && this.currentPath[this.pathCurrentNode + 1]) {
////                    this.destinationX = this.currentPath[this.pathCurrentNode + 1].x * GAME.settings.TILESIZE;// + GAME.settings.TILESIZEDIV2; // //center of the tile
////                    this.destinationY = this.currentPath[this.pathCurrentNode + 1].y * GAME.settings.TILESIZE;// + GAME.settings.TILESIZEDIV2; // + wobbleAI();
////
////                    // move towards our next waypoint
////                    // and switch animations accordingly
////                    this.frame = (this.frame + 1) % 8;
////                    //if(this.index == 1) log(this.frame);
////                    if (this.destinationY > this.y) {
////                        this.y += this.speed;
////                        this.sprite.gotoAndPlay("move_down");
////                        this.sprite.currentAnimationFrame += this.frame;
////                    }
////                    if (this.destinationY < this.y) {
////                        this.y -= this.speed;
////                        this.sprite.gotoAndPlay("move_up");
////                        this.sprite.currentAnimationFrame += this.frame;
////                    }
////                    if (this.destinationX > this.x) {
////                        this.x += this.speed;
////                        this.sprite.gotoAndPlay("move_right");
////                        this.sprite.currentAnimationFrame += this.frame;
////                    }
////                    if (this.destinationX < this.x) {
////                        this.x -= this.speed;
////                        this.sprite.gotoAndPlay("move_left");
////                        this.sprite.currentAnimationFrame += this.frame;
////
////                    }
//////                    this.sprite.y = this.y - GAME.settings.TILESIZEDIV2; //offset so goon feet are in the center of the tile
//////                    this.sprite.x = this.x;// - 12;
//////                    this.healthbar_green.x = this.sprite.x;
//////                    this.healthbar_green.y = this.sprite.y-2;
//////                    this.healthbar_red.x = this.sprite.x;
//////                    this.healthbar_red.y = this.sprite.y-2;
////
////
////                    if (this.closeEnough(this.destinationX, this.destinationY, this.x, this.y, 5)) {
////                        this.pathCurrentNode++;
////                    }
////                    // rotate nicely - good for racing games or pure top view
////                    // lookAt(this, this.destinationX, this.destinationY);
////
////                } //else {
////            }
////        } // movement
//    };
//
//    p.closeEnough = function (x1, y1, x2, y2, dist) {
//        return (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) <= dist);
//    };
//
//    p.draw = function () {
//
//
//    };
//
//    scope.Goon = Goon;
//
//}(window.GAME));