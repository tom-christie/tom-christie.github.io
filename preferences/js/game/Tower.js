/**
 * Created by Tom on 4/13/14.
 */



(function (scope) {

    var Tower = function (x,y,color) {
        this.setup(x,y,color);
    };

    Tower.prototype = new createjs.Container();
    var p = Tower.prototype;
    Tower.prototype.Container_initialize = p.initialize;


    p.setup = function (x,y,color) {
        this.Container_initialize();
        // add custom setup logic here.
        this.x = x;
        this.y = y - GAME.settings.TILESIZEDIV2; //so the base is in the center of the tile
        this.color = color;
        this.make_tower();

        this.line = new createjs.Shape();
        this.addChild(this.line);

        this.firePeriod = GAME.settings.towerFirePeriod;
        this.lastFiredTime = createjs.Ticker.getTicks() - this.firePeriod;//so it can start immediately
        this.radius = GAME.settings.towerShootRadius;
        this.distToGoon = this.radius + 1;

        this.energyUsage = GAME.settings.projectileEnergyUsage;

        //add black spaces
        this.tower_image = new createjs.Bitmap(GAME.assets.getResult("tower_" + this.color));
        this.addChild(this.tower_image);

    };

    p.make_tower = function(){
        this.removeChild(this.tower_image); //if it exists
        this.tower_image = new createjs.Bitmap(GAME.assets.getResult("tower_" + this.color));
        this.addChild(this.tower_image);
        this.width = this.tower_image.image.width;
        this.height = this.tower_image.image.height;
        //tween in
        if(this.color != "dead") {
            createjs.Tween.get(this.tower_image)
                .to({y: this.tower_image.image.height, scaleY: .01})
                .to({y: 0, scaleY: 1}, 100);
            createjs.Tween.tick(1);
        }


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
                if(this.distanceTo(GAME.currentPage.goons[i]) < this.radius && GAME.currentPage.goons[i].alive){
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

    p.changeColor = function(newColor, strength){
        this.strength = strength;
        this.color = newColor;

        //tween out
        createjs.Tween.get(this.tower_image)
            .to({y: this.tower_image.image.height, scaleY: .01}, 100)
            .call(this.make_tower,null, this);
        createjs.Tween.tick(1);


    };


    p.fire = function(){
        if( (createjs.Ticker.getTicks() - this.lastFiredTime)  > this.firePeriod){

            if(GAME.currentPage.options.weapon1_color === this.color){
                GAME.currentPage.shotsFired1 += 1;
            }else if(GAME.currentPage.options.weapon2_color === this.color){
                GAME.currentPage.shotsFired2 += 1;
            }
            GAME.currentPage.updateCrystalCounts();
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

            GAME.currentPage.decreaseEnergy(this.energyUsage);
            this.lastFiredTime = createjs.Ticker.getTicks();
            GAME.currentPage.projectileMagazine.fireProjectile(from_x,from_y,to_x,to_y, this.color, this.strength);
        }
    };

    p.distanceTo = function(obj){
        return Math.sqrt( Math.pow(this.x - obj.x ,2) + Math.pow(this.y - obj.y ,2) )
    };


    scope.Tower = Tower;
}(window.GAME));
