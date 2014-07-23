/**
 * Created by Tom on 5/5/14.
 */

/**
 * Created by Tom on 4/13/14.
 */


(function (scope) {

    var Crystal = function (x, y, color, type, active) {
        //float, float, string, int (16/32), text
        this.setup(x, y, color, type, active);
    };

    Crystal.prototype = new createjs.Container();
    var p = Crystal.prototype;
    Crystal.prototype.Container_initialize = p.initialize;


    Crystal.prototype.setup = function (x, y, color, type, active) {
        this.Container_initialize();

        this.color = color;
        /* possible types are:
            weapon_select - size is 32, sometimes rotating
            dropped - size is 16, always rotating
         */

        if(type === "weapon_select"){
            var size = 32;
        }else if(type === "dropped"){
            var size = 16;
        }else if(type === "recovered"){
            var size = 32;
        }else if(type === "available"){
            var size = 32;
        }
        //console.log("Debug_crystal", color, size)
        var rate = .25;


         this.crystal = new createjs.SpriteSheet({

            "animations": {
                "sparkle": [0, 7, "sparkle", rate]
            },
            "images": [GAME.assets.getResult("crystal_" + this.color + "_" + size)],
            "frames": {
                "height": size,
                "width": size,
                "regX": 0,
                "regY": 0,
                "count": 8
            }
        });

        this.crystalSprite = new createjs.Sprite(this.crystal, "sparkle");

        this.crystalSprite.x = x;
        this.crystalSprite.y = y;
        this.addChild(this.crystalSprite);
        //make it so the x and y coordinates refer to the center rather than the top left edge

        this.crystal.x = -size / 2;
        this.crystal.y = -size / 2;

        this.addChild(this.crystalSprite);
        //console.log('new crystal active?',active);
//        if(!active){
//            this.crystalSprite.stop();
//        }

        //this.on("click",this.handle_click.bind(this));
        if( type === "recovered" || type === "available"){
            this.crystalSprite.stop();
        }
    };

    p.handle_click = function(){

    };


    scope.Crystal = Crystal;
}(window.GAME));


