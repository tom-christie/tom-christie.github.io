/**
 * Created by Tom on 4/14/14.
 */

/**
 * Created by Tom on 4/7/14.
 *
 *  * What data to log?
 *  - how many crystals are available, and what color
 *  - what the base to send TO is
 *  - what proportions are selected
 *
 */



(function (scope) {

    function WeaponSelectPage(weaponsToChooseFrom, contextToSendTo) {
        // weaponsToChoose is an array of strings, namely the colors of the weapons to be selected

        createjs.Container.call(this);
        this.setup(weaponsToChooseFrom, contextToSendTo);
    }

    inheritPrototype(WeaponSelectPage, createjs.Container);

    ///////////////////////////////////////
    // define new functions as necessary //
    ///////////////////////////////////////
    var p = WeaponSelectPage.prototype;


    p.setup = function (weaponsToChoose, contextToSendTo) {

        this.availableWeapons = weaponsToChoose;
        this.contextToSendTo = contextToSendTo;

        console.log("DEBUGweapon",  this.availableWeapons, this.contextToSendTo)
            log('WeaponSelectPage.setup');

        this.availableWeapons = weaponsToChoose;
        console.log("DEBUG", this.availableWeapons);
        //background
        if(contextToSendTo === 1){
            this.background = new createjs.Bitmap(GAME.assets.getResult("base1_weapon_select"));
        }else if(contextToSendTo === 2){
            this.background = new createjs.Bitmap(GAME.assets.getResult("base2_weapon_select"));

        }else if(contextToSendTo === 3){
            this.background = new createjs.Bitmap(GAME.assets.getResult("base3_weapon_select")); //TODO - create this

        }
        this.background.x = GAME.GameCanvas.width/2 - this.background.image.width/2;
        this.background.y = GAME.GameCanvas.height/2 - this.background.image.height/2;
        this.addChild(this.background);

//        createjs.Tween.get(this.background)
//            .to({y: GAME.GameCanvas.height / 2, scaleY: .01, x: GAME.GameCanvas.width / 2, scaleX: .001})
//            .wait(300)
//            .to({x: this.background.x, scaleX: 1}, 70)
//            .wait(50)
//            .to({y: this.background.y, scaleY: 1}, 100)
//            .call(this.drawWeaponMeters, null, this);
        this.drawWeaponMeters();

        //TODO - CONTEXT/MESSAGE GOES HERE


        //play button - how to align to the right of the rightmost weapon meter thing?
        this.playButton = new createjs.Bitmap(GAME.assets.getResult("send_button"));
        this.addChild(this.playButton);
        this.playButton.x = GAME.GameCanvas.width/2 - this.playButton.image.width/2;
        createjs.Tween.get(this.playButton)
            .to({scaleY:0, y:0.15 * GAME.GameCanvas.height })
            .wait(1000)
            .to({scaleY:1,  y:0.15 * GAME.GameCanvas.height - this.playButton.image.height/2}, 300);
        buttonClickArea = new createjs.Shape();
        buttonClickArea.graphics
            .beginFill("#FFF")
                .drawRect(this.playButton.x, 0.15*GAME.GameCanvas.height - this.playButton.image.height/2, this.playButton.image.width, this.playButton.image.height);
        buttonClickArea.alpha = 0.01;
        this.addChild(buttonClickArea);
        buttonClickArea.on("click", this.handleSendButtonClick.bind(this));
//        buttonClickArea.on("click", this.tweenOut.bind(this));
        createjs.Tween.tick(1);

        this.changeMeterListener = this.on("increased_meter", this.handleMeterChange.bind(this)); //listen for finished tweening

    };

    p.handleSendButtonClick = function(evt,data){

        //add proportions to queue
        //this.contextToSendTo

        //take first proportion, multiply by the set number of crystals, and round
        var proportions =[]; //might be 2 or 3 proportions
        var total = 0;
        for(var i=0; i<this.weaponMeters.length; i++){
            proportions.push(this.weaponMeters[i].percentFull);
            total += this.weaponMeters[i].percentFull;
        }
        //make sure they add to 1
        for(var i=0; i<this; i++){
            proportions[i] = proportions[i] / total;
        }
        //multiply by the total number of crystals a base gets
        var weaponCounts = [];
        for(var i=0; i<proportions.length; i++){
            weaponCounts[i] = proportions[i]*GAME.settings.basicCrystalNumber;
        }

        //push onto queue
        var color1 = this.weaponMeters[0].color;
        var color2 = this.weaponMeters[1].color;
        var temp = {};
        temp["baseType"] = this.contextToSendTo;
        temp["startingCrystalCounts"] = {}
        temp["startingCrystalCounts"][color1] = weaponCounts[0];
        temp["startingCrystalCounts"][color2] = weaponCounts[1];
        GAME.weaponsSuppliedToLevels.push(temp);
//        {baseType:this.contextToSendTo,
//            startingCrystalCounts:{
//            color1:weaponCounts[0],
//                color2:weaponCounts[1]
//        }
//        }

        GAME.flowController.WEAPONS_to_LIVE();
    };

    p.handleMeterChange = function (evt, data) {
        var index_remains_the_same = evt.data;
        //log(index_remains_the_same);
        var amount_to_decrease = evt.decrease;

        //count
        var num_to_decrease_from = 0;
        for (i = 0; i < this.availableWeapons.length; i++) {
            if (i + 1 != index_remains_the_same && this.weaponMeters[i].percentFull > 0.01) {
                num_to_decrease_from += 1;
            }
        }

        for (i = 0; i < this.availableWeapons.length; i++) {
            if (i + 1 != index_remains_the_same && this.weaponMeters[i].percentFull > 0.01) {
                this.weaponMeters[i].percentFull -= amount_to_decrease / num_to_decrease_from;
                if (this.weaponMeters[i].percentFull < 0){
                    this.weaponMeters[i].percentFull = 0;

                }
            }
            this.weaponMeters[i].render();
        }


    };

    p.drawWeaponMeters = function () {
        var i;

        console.log("WEAPONS", this.availableWeapons)

        this.weaponMeters = [];
        for (i = 0; i < this.availableWeapons.length; i++) {
            this.weaponMeters.push(new WeaponMeter(i + 1, this.availableWeapons.length, this.availableWeapons[i]));
        }

        for (i = 0; i < this.availableWeapons.length; i++) {
            this.addChild(this.weaponMeters[i]);
        }
    };


    p.tweenOutSelf = function(fn){
//        createjs.Tween.get(this)
//            .to({y: GAME.GameCanvas.height / 2, scaleY: .01}, 100)
//            .wait(100)
//            .to({x: GAME.GameCanvas.width / 2, scaleX: .001}, 70)
//            .call(fn);
         fn();
//            .wait(50)
//            .to({y: 0, scaleY: 1}, 100)
//            .to({y: GAME.GameCanvas.height / 2, scaleY: .01, x: GAME.GameCanvas.width / 2, scaleX: .001})

    };


    p.update = function () {
        var i;
        try{
        for (i = 0; i < 7; i++) {
            this.weaponMeters[i].update();
        }
        }catch(e){
            //we expect this to fail before they're done being drawn, so just do nothing
        }

    };

    p.render = function () {
        //nothing changes

    };

    scope.WeaponSelectPage = WeaponSelectPage;








    function WeaponMeter(index, totalCount, color) {
        createjs.Container.call(this);
        this.index = index;
        this.totalCount = totalCount;
        this.color = color;


        console.log("WEAPONMETER", this.index, this.totalCount, this.color)

        this.setup();

        if(this.status != 0){
            this.percentFull = 1 / this.totalCount;
        }else{
            this.percentFull = 0;
        }
    }

    inheritPrototype(WeaponMeter, createjs.Container);
    var wp = WeaponMeter.prototype;

    wp.setup = function () {
        var interWidth = 25;
        this.width = 100;
        this.height = GAME.GameCanvas.height / 2;
        this.x = GAME.GameCanvas.width / 2 - this.width / 2 + (this.index - 0.5 * this.totalCount - 0.5) * (this.width + interWidth);
        this.y = 1.5/5 * GAME.GameCanvas.height;
        this.radius = 5;
        this.cellBuffer = this.height / (12 * 6);
        this.cellHeight = this.height / 12;
        this.strokeWidth = 4;


        //tower images beneath
        var tower_x = this.width/2 - 10;
        var tower_y = this.height + 30;
        this.tower = new GAME.Tower(tower_x, tower_y, this.color);
        this.addChild(this.tower);

        //holders
        this.cellHolder = new createjs.Shape();
        this.cellHolder = this.addChild(this.cellHolder);
        this.shape = new createjs.Shape();
        this.shape = this.addChild(this.shape);


        this.cell = new createjs.Shape();
        this.cell.graphics
            .beginFill(GAME.settings[this.color])
            .drawRoundRect(2 * this.cellBuffer, this.cellBuffer, this.width - 4 * this.cellBuffer, this.cellHeight - this.cellBuffer, 2);
        this.cell.cache(0, 0, this.width, this.cellHeight);
        this.progressBmp = this.cell.cacheCanvas;

        createjs.Tween
            .get({height: 10, y: this.height - 10}).to({height: this.height, y: 0}, 200 + 500 * Math.random())
            .wait(1000)
            .on("change", function (evt) {
                this.shape.graphics.clear()
                    .setStrokeStyle(this.strokeWidth)
                    .beginStroke("#474e4f")
                    .drawRect(0, evt.target.target.y, this.width, evt.target.target.height + this.cellBuffer, this.radius); //with respect to the shape bounds

                this.cellHolder.graphics.clear()
                    .setStrokeStyle(0)
                    .beginBitmapFill(this.progressBmp, "repeat-y")
                    .drawRoundRect(0, this.height - evt.target.target.height * this.percentFull + this.cellBuffer, this.width, evt.target.target.height * this.percentFull, this.radius);
            }, this);
        createjs.Tween.tick(1);


        //hitarea has to be added last so it's on top
        hitArea = new createjs.Shape();
        hitArea.graphics.beginFill("#FFF")
            .drawRoundRect(0, 0, this.width, this.height, this.radius); //with respect to the shape bounds
        hitArea.alpha = 0.01;
        this.addChild(hitArea);

        //handle click
//        this.cellHolder.on("click",this.handleClick.bind(this));
//        hitArea.on("mouseover", this.handleMouseOver.bind(this));
        hitArea.on("mouseout", this.handleMouseOut.bind(this));
        hitArea.on("click", this.handleMouseClick.bind(this));
        hitArea.on("mousedown", this.handleMouseDown.bind(this));

    };


    wp.handleMouseDown = function (evt) {
        this.mouseDown = true;
    };

    wp.handleMouseClick = function (evt) {
        this.mouseDown = false;
    };

//    wp.handleMouseOver = function (evt) {
//        console.log('over ');
//    };
//
    wp.handleMouseOut = function (evt) {
        this.mouseDown = false;
    };
//

    wp.update = function () {

        if(this.status != 0){
            if (this.mouseDown) {
            //console.log('hi, mouse is down');
                if (this.percentFull < .99) {
                    this.percentFull += .02;
                    var evt2 = new createjs.Event("increased_meter");
                    evt2.data = this.index;
                    evt2.decrease = 0.02;
                    GAME.currentPage.dispatchEvent(evt2); //send event to parent
                }
            }
        }

    };

    wp.render = function () {
        //console.log(this.index, this.percentFull)
        this.cellHolder.graphics.clear()
            .beginBitmapFill(this.progressBmp, "repeat-y")
            .drawRoundRect(0, this.height - this.height * this.percentFull+ this.cellBuffer, this.width, this.height * this.percentFull, this.radius);
    };


}(window.GAME));