/**
 * Created by Tom on 4/14/14.
 */

/**
 * Created by Tom on 4/7/14.
 */



(function (scope) {

    function WeaponSelectPage() {
        createjs.Container.call(this);
        this.setup();
    }

    inheritPrototype(WeaponSelectPage, createjs.Container);

    ///////////////////////////////////////
    // define new functions as necessary //
    ///////////////////////////////////////
    var p = WeaponSelectPage.prototype;


    p.setup = function () {

        if (GAME.debugmode)
            log('WeaponSelectPage.setup');




        //background
        this.background = new createjs.Bitmap(GAME.assets.getResult("WEAPON_SELECT_background"));
        this.addChild(this.background);

        createjs.Tween.get(this.background)
            .to({y: GAME.GameCanvas.height / 2, scaleY: .01, x: GAME.GameCanvas.width / 2, scaleX: .001})
            .wait(300)
            .to({x: 0, scaleX: 1}, 70)
            .wait(50)
            .to({y: 0, scaleY: 1}, 100)
            .call(this.drawWeaponMeters, null, this);


        //play button - how to align to the right of the rightmost weapon meter thing?
        this.playButton = new createjs.Bitmap(GAME.assets.getResult("play_button"));
        this.addChild(this.playButton);
        this.playButton.x = GAME.GameCanvas.width/2 - this.playButton.image.width/2;
        this.playButton.y = GAME.GameCanvas.height/10;
        createjs.Tween.get(this.playButton)
            .to({scaleY:0, y:this.playButton.image.height/2 })
            .wait(1000)
            .to({scaleY:1,  y:0}, 300);

        createjs.Tween.tick(1);

        this.changeMeterListener = this.on("increased_meter", this.handleMeterChange.bind(this)); //listen for finished tweening


    };

    p.handleMeterChange = function (evt, data) {
        var index_remains_the_same = evt.data;
        //log(index_remains_the_same);
        var amount_to_decrease = evt.decrease;

        //count
        var num_to_decrease_from = 0;
        for (i = 0; i < 7; i++) {
            if (i + 1 != index_remains_the_same && this.weaponMeters[i].percentFull > 0.01) {
                num_to_decrease_from += 1;
            }
        }

        for (i = 0; i < 7; i++) {
            if (i + 1 != index_remains_the_same && this.weaponMeters[i].percentFull > 0.01) {
                this.weaponMeters[i].percentFull -= amount_to_decrease / num_to_decrease_from;
            }
            this.weaponMeters[i].render();
        }


    };

    p.drawWeaponMeters = function () {

        var i;
        this.weaponMeters = new Array();
        for (i = 0; i < 7; i++) {
            this.weaponMeters.push(new WeaponMeter(i + 1, 7));
        }
        for (i = 0; i < 7; i++) {
            this.addChild(this.weaponMeters[i]);
        }
    };

    p.update = function () {
        var i;
        for (i = 0; i < 7; i++) {
            this.weaponMeters[i].update();
        }
    };

    p.render = function () {
        //nothing changes

    };

    scope.WeaponSelectPage = WeaponSelectPage;


//
//
    function WeaponMeter(index, totalCount) {//x,y,height,width) {
        createjs.Container.call(this);
        this.index = index;
        this.totalCount = totalCount;

        this.colors = new Array();
        this.colors.push(createjs.Graphics.getRGB(253, 0, 7));
        this.colors.push(createjs.Graphics.getRGB(255, 255, 0));
        this.colors.push(createjs.Graphics.getRGB(40, 255, 0));
        this.colors.push(createjs.Graphics.getRGB(18, 255, 255));
        this.colors.push(createjs.Graphics.getRGB(0, 0, 255));
        this.colors.push(createjs.Graphics.getRGB(250, 0, 255));
        this.colors.push(createjs.Graphics.getRGB(255, 255, 255));

        this.setup();

        this.percentFull = 1 / this.totalCount;
    }

    inheritPrototype(WeaponMeter, createjs.Container);
    var wp = WeaponMeter.prototype;

    wp.setup = function () {
        var interWidth = 25;
        this.width = 100;
        this.height = GAME.GameCanvas.height / 2;
        this.x = GAME.GameCanvas.width / 2 - this.width / 2 + (this.index - 0.5 * this.totalCount - 0.5) * (this.width + interWidth);
        this.y = 2 * GAME.GameCanvas.height / 5;
        this.radius = 5;
        this.cellBuffer = this.height / (12 * 6);
        this.cellHeight = this.height / 12;
        this.strokeWidth = 4;


        //holders
        this.cellHolder = new createjs.Shape();
        this.cellHolder = this.addChild(this.cellHolder);
        this.shape = new createjs.Shape();
        this.shape = this.addChild(this.shape);


        this.cell = new createjs.Shape();
        this.cell.graphics
            .beginFill(this.colors[this.index - 1])
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
                    .drawRoundRect(0, evt.target.target.y, this.width, evt.target.target.height + this.cellBuffer, this.radius); //with respect to the shape bounds

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

    };

    wp.render = function () {
        //console.log(this.index, this.percentFull)
        this.cellHolder.graphics.clear()
            .beginBitmapFill(this.progressBmp, "repeat-y")
            .drawRoundRect(0, this.height - this.height * this.percentFull+ this.cellBuffer, this.width, this.height * this.percentFull, this.radius);
    };


}(window.GAME));