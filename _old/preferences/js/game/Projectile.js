/**
 * Created by Tom on 4/13/14.
 */


(function (scope) {

    var Projectile = function (x, y) {
        this.setup(x, y);
    };

    Projectile.prototype = new createjs.Container();
    var p = Projectile.prototype;
    Projectile.prototype.Container_initialize = p.initialize;


    Projectile.prototype.setup = function (x, y) {
        this.speed = 20;
        this.hitThreshold = 10; //todo height of sprite / 2

        this.Container_initialize();
        // add custom setup logic here.


        this.red = new createjs.Bitmap(GAME.assets.getResult("laser_red"));
        this.yellow = new createjs.Bitmap(GAME.assets.getResult("laser_yellow"));
        this.green = new createjs.Bitmap(GAME.assets.getResult("laser_green"));
        this.blue = new createjs.Bitmap(GAME.assets.getResult("laser_blue"));
        this.cyan = new createjs.Bitmap(GAME.assets.getResult("laser_cyan"));
        this.purple = new createjs.Bitmap(GAME.assets.getResult("laser_purple"));
        this.white = new createjs.Bitmap(GAME.assets.getResult("laser_white"));
        this.lasers = {"red":this.red,
            "yellow":this.yellow,
            "green":this.green,
            "blue":this.blue,
            "cyan":this.cyan,
            "purple":this.purple,
            "white":this.white};

        //keeps track of whether it's showing or not!
        this.visible = false;

    };

    p.fire = function (from_x, from_y, to_x, to_y, color, strength) {
        this.strength = strength;
        this.color = color;
        this.visible = true;
        //set initial coordinates
        this.x = from_x;
        this.y = from_y;
        //console.log('fire',from_x,from_y,to_x,to_y);
        //set from and to coordinates, as well as color
        this.laser = this.lasers[color];
        //console.log('laser',laser, this.white, GAME.assets)
        //make it so the x and y coordinates refer to the center rather than the top left edge

        this.laser.x = 0;//-this.laser.image.width / 2;
        this.laser.y = -this.laser.image.height / 2;

        this.angle = Math.atan2(to_y  - from_y,to_x - from_x);
        this.rotation = this.angle * 360/(2*Math.PI);
        this.dx = this.speed * Math.cos(this.angle);
        this.dy = this.speed * Math.sin(this.angle);

        this.addChild(this.laser);

    };


    p.move = function () {
        //log("moving")
        //move towards your goal
        this.x += this.dx;
        this.y += this.dy;

    };

    p.checkHit = function () {

        if(this.x < 0 || this.x > GAME.currentPage.width || this.y < 0 || this.y > (GAME.currentPage.height-100)){
            this.removeChild(this.laser);
            GAME.currentPage.removeChild(this);
            this.visible = false;
            //log("DYING - off screen")
        }
        //console.log("dist",GAME.currentPage.goons[0]);
        //go through each goon, and if you're close enough, die
        for (var i = 0; i < GAME.currentPage.goons.length; i++) {
            if ( this.distanceTo(GAME.currentPage.goons[i]) < this.hitThreshold) {
                this.removeChild(this.laser);
                this.visible = false;

                //tell goon he was hit
                GAME.currentPage.goons[i].hitBy(this.color,this.strength);

            }
            //log(this.distanceTo(GAME.currentPage.goons[i]));
        }

    };

    p.distanceTo = function (obj) {
        if(obj.alive){
        var dist = Math.sqrt(Math.pow(this.x - (obj.x + obj.width/2), 2) + Math.pow(this.y - (obj.y + obj.height/2), 2));
        //console.log('what',this,obj, dist)
        }else{
            var dist = 1000000;
        }
        return dist;
    };


    scope.Projectile = Projectile;
}(window.GAME));


(function (scope) {

    function ProjectileMagazine() {
        this.init();
    }

    ProjectileMagazine.prototype = {
        constructor: ProjectileMagazine,

        init: function () {
            this.numProjectiles = GAME.settings.numProjectiles;
            this.projectileArray = new Array();
            for (i = 0; i < GAME.settings.numProjectiles; i++) {
                this.projectileArray.push(new GAME.Projectile());
            }
        },

        fireProjectile: function (from_x, from_y, to_x, to_y, color, strength) {
            var i;
            //find first one that isn't
            for (i = 0; i < this.numProjectiles; i++) {
                if (!this.projectileArray[i].visible) {
                    this.projectileArray[i].fire(from_x, from_y, to_x, to_y, color, strength);
                    GAME.currentPage.addChild(this.projectileArray[i]); //adding to the current page...
                    break;
                }
            }
        },

        update: function () {

            this.moveProjectiles();
            this.checkHits();
        },

        moveProjectiles: function () {
            for (i = 0; i < this.numProjectiles; i++) {
                if (this.projectileArray[i].visible) {
                    this.projectileArray[i].move();
                }
            }

        },

        checkHits: function () {
            for (i = 0; i < this.numProjectiles; i++) {
                if (this.projectileArray[i].visible) {
                    this.projectileArray[i].checkHit();
                }
            }
        },

    };


    scope.ProjectileMagazine = ProjectileMagazine;
}(window.GAME));


