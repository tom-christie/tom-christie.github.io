/**
 * Created by Tom on 4/13/14.
 */



(function (scope) {

    var Tower = function (x,y) {
        this.setup(x,y);
    };

    Tower.prototype = new createjs.Container();
    var p = Tower.prototype;
    Tower.prototype.Container_initialize = p.initialize;


    p.setup = function (x,y) {
        this.Container_initialize();
        // add custom setup logic here.
        this.x = x;
        this.y = y - GAME.settings.TILESIZEDIV2; //so the base is in the center of the tile
        this.tower_image = new createjs.Bitmap(GAME.assets.getResult("tower"));
        this.addChild(this.tower_image);
        this.width = this.tower_image.image.width;
        this.height = this.tower_image.image.height;

        this.line = new createjs.Shape();
        this.addChild(this.line);

        this.firePeriod = GAME.settings.towerFirePeriod;
        this.lastFiredTime = createjs.Ticker.getTime() - this.firePeriod;//so it can start immediately
        this.radius = GAME.settings.towerShootRadius;
        this.distToGoon = this.radius + 1;
//        this.goons_sorted = [];

    };

    p.update = function (){
        //this tracks the nearest goons
        //the laser finds the closest goon and follows him till he's out of signt
        //then it finds the closest goon that's still in sight (NOT furthest along - change this?)



        var x = this.x;
        var y = this.y;

        //if you have no target and goons exist
        if(  GAME.currentPage.goons.length > 0 && this.distToGoon > this.radius){
            //go through in order, picking the first that's within radius
            for(i=0; i<GAME.currentPage.goons.length; i++){
                if(this.distanceTo(GAME.currentPage.goons[i]) < this.radius && GAME.currentPage.goons[i].visible){
                    this.goon_to_shoot_index = i;
                    //fire!
                    this.fire();
                    break;
                }
            }
        }

        //see if the goon is too far away
        if(GAME.currentPage.goons.length > 0 && this.distToGoon < this.radius){
            this.distToGoon = this.distanceTo(GAME.currentPage.goons[this.goon_to_shoot_index]);
        }




    };

    p.fire = function(){
        if( (createjs.Ticker.getTime() - this.lastFiredTime)  > this.firePeriod){
            var from_x = this.x + this.width/4;
            var from_y = this.y + this.height/4;
            var to_x = GAME.currentPage.goons[this.goon_to_shoot_index].x + GAME.currentPage.goons[this.goon_to_shoot_index].width/2;
            var to_y = GAME.currentPage.goons[this.goon_to_shoot_index].y + GAME.currentPage.goons[this.goon_to_shoot_index].height/2;
//            this.line.graphics.clear()
//                .setStrokeStyle(1)
//                .beginStroke("white")
//                .moveTo(this.width/2, 4) //top center of the tower
//                .lineTo(to_x - this.x, to_y - this.y ) //center of the goon
//                .endStroke();

            this.lastFiredTime = createjs.Ticker.getTime();
            var weapon_type = Math.floor(Math.random()*7);
            GAME.currentPage.projectileMagazine.fireProjectile(from_x,from_y,to_x,to_y, weapon_type);
        }
    };

    p.distanceTo = function(obj){
        return Math.sqrt( Math.pow(this.x - obj.x ,2) + Math.pow(this.y - obj.y ,2) )
    };


    scope.Tower = Tower;
}(window.GAME));
