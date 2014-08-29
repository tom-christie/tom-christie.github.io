/**
 * Created by Tom on 3/27/14.
 *
 * View for a modifier symbol
 *
 * Subclass of createjs.Container()
 *
 */

/**
 * Created by Tom on 3/27/14.
 */
/**
 * Created by Tom on 3/27/14.
 *
 * View object for an modifier pointing in a specific direction.
 * Sub-class of a Container
 */


(function (scope) {

    function ModifierView(index, number, type) {
        this.initialize(index, number, type);
    }

    ModifierView.prototype = new createjs.Container(); //inherits from container
    ModifierView.prototype.Container_initialize = ModifierView.prototype.initialize;
    createjs.EventDispatcher.initialize(ModifierView.prototype);
    var p = ModifierView.prototype;

    p.initialize = function (index,number,type) {
        this.Container_initialize();
        //index is a number that keeps track of where the modifierView object is in the parent array - i.e. which arrow it's associated with
        // number is the number modifier it is from left to right - 0, 1, or 2
        //type is the kind of modifier it is - 0=updown, 1=leftright, 2=clockwise, 3=counter-clockwise
        //the type is associated with an entry in this.translations

        /*
         * directions
         * 0 = right
         * 1 = up
         * 2 = left
         * 3 = down
         */

        this.number = number;
        this.index = index;
        this.type = type;

        this.translations = [
            {0: 0,
                1: 3,
                2: 2,
                3: 1},//up down
            {0: 2,
                1: 1,
                2: 0,
                3: 3
            },//left right
            {0: 3,
                1: 0,
                2: 1,
                3: 2},//clockwise
            {0: 1,
                1: 2,
                2: 3,
                3: 0}//counter-clockwise
        ];


        this.radius = 120; //default
        this.x = GLOBAL.GameInfo.width / 2 - this.radius / 2 - 1.5 * this.radius + this.number * this.radius * 1.5; //describes center
        this.y = GLOBAL.GameInfo.height / 2 - this.radius / 2 - 130; //center

        this.outerColor = GLOBAL.GameInfo.modifierOuterColor;//transparent if color is not set
        this.innerColor = GLOBAL.GameInfo.modifierInnerColor;
        this.borderWidth = 4;
        this.isModifier = true;
        this.shouldTweenOut = true;

        //square
        this.shape = new createjs.Shape();
        this.shape = this.addChild(this.shape);
        this.shape.horizontalAlign = "center";
        //outer
        this.shape.graphics.clear()
            .beginFill(this.outerColor)
            .drawRoundRect(0, 0, this.radius, this.radius, 15) //with respect to the shape bounds
            .endFill();
        this.shape.graphics
            .beginFill(this.innerColor)
            .drawRoundRect(this.borderWidth, this.borderWidth, this.radius - this.borderWidth * 2, this.radius - this.borderWidth * 2, 12);

        //add modifier image
        switch(this.type) {

            case 0:
                this.modifierBitmap = new createjs.Bitmap(GLOBAL.assets.getResult("modifier_reflectupdown"));
                break;
            case 1:
                this.modifierBitmap = new createjs.Bitmap(GLOBAL.assets.getResult("modifier_reflectleftright"));
                break;
            case 2:
                this.modifierBitmap = new createjs.Bitmap(GLOBAL.assets.getResult("modifier_clockwise"));
                break;
            case 3:
                this.modifierBitmap = new createjs.Bitmap(GLOBAL.assets.getResult("modifier_counterclockwise"));
                break;
        }
        this.modifierBitmap.alpha = 1;
        this.modifierBitmap.scaleX = 0.6;
        this.modifierBitmap.scaleY = 0.6;
        this.modifierBitmap.x = this.radius / 2 - this.modifierBitmap.scaleX * this.modifierBitmap.image.width / 2;//relative to
        this.modifierBitmap.y = this.radius / 2 - this.modifierBitmap.scaleY * this.modifierBitmap.image.height / 2;//this.modifierBitmap.image.height/2;//GameInfo.height/2;
        this.addChild(this.modifierBitmap);

        return this;

    };


//    //tweening
    p.tweenIn = function () {

        createjs.Tween.get({rad: 0}).to({rad: this.radius}, 200, createjs.Ease.quintOut)
            .on("change", function (evt) {
                this.shape.graphics.clear()
                    .beginFill(this.outerColor)
                    .drawRoundRect(0, 0, this.radius, this.radius, 15) //with respect to the shape bounds
                    .endFill();
                //this was a headache - since rad starts from 0, you have to make sure it's bigger than this.borderWidth*2
                if(evt.target.target.rad > this.borderWidth*2){
                    this.shape.graphics
                        .beginFill(this.innerColor)
                        .drawRoundRect(this.radius/2 - evt.target.target.rad/2 + this.borderWidth,
                            this.radius/2 - evt.target.target.rad/2 + this.borderWidth,
                            evt.target.target.rad - this.borderWidth*2,
                            evt.target.target.rad - this.borderWidth*2, 12) //with respect to the shape bounds
                        .endFill();
                }

            }, this);
        createjs.Tween.tick(1);
        return this;
    };

    //modifier switch
    p.tweenOut = function () {
        createjs.Tween.get({rad: this.radius})
            .to({rad: 0}, 150, createjs.Ease.qintOut)
            .call(this.doneTweeningOut)
            .on("change", function (evt) {
                try {

                    this.shape.graphics.clear()
                        .beginFill(this.outerColor)
                        .drawRoundRect(0, 0, this.radius, this.radius, 15) //with respect to the shape bounds
                        .endFill();

                    this.shape.graphics
                        .beginFill(this.innerColor)
                        .drawRoundRect(this.radius/2 - evt.target.target.rad/2,this.radius/2 - evt.target.target.rad/2, evt.target.target.rad, evt.target.target.rad, 15) //with respect to the shape bounds
                        .endFill();

                } catch (e) {

                }
            }, this);
        createjs.Tween.tick(1);
        return this;

    };


    //this one happens at the very end
    p.tweenOutSelf = function () {
        var start_radius = this.radius;
        //console.log("so far so b");
        //console.log(this)
        createjs.Tween.get({rad: this.radius}).to({rad: 0}, 1000, createjs.Ease.backIn)
            .call(this.doneTweeningOutLevel)
            .on("change", function (evt) {
                try {
                    this.shape.graphics.clear()
                        .beginFill(this.outerColor)
                        .drawRoundRect(this.radius/2 - evt.target.target.rad/2,this.radius/2 - evt.target.target.rad/2, evt.target.target.rad, evt.target.target.rad, 15) //with respect to the shape bounds
                        .endFill();
                    this.shape.graphics.clear()
                        .beginFill(this.innerColor)
                        .drawRoundRect(this.radius/2 - evt.target.target.rad/2,this.radius/2 - evt.target.target.rad/2, evt.target.target.rad, evt.target.target.rad, 15);

                    this.modifierBitmap.scaleX = evt.target.target.rad / this.radius * 0.6;
                    this.modifierBitmap.scaleY = evt.target.target.rad / this.radius * 0.6;
                    this.modifierBitmap.x = this.radius/2 - evt.target.target.rad/2;
                    this.modifierBitmap.y = this.radius/2 - evt.target.target.rad/2;

//
//                    this.coverCircle.graphics.clear()
//                        .beginFill(createjs.Graphics.getRGB(0, 0, 0, 0))
//                        .drawCircle(0, 0, this.radius) //with respect to the shape bounds
//                        .endFill();

//                    this.shape.graphics.clear()
//                        .beginFill(this.outerColor)
//                        .drawCircle(0, 0, this.radius) //with respect to the shape bounds
//                        .endFill();
//                    this.shape.graphics.clear()
//                        .beginFill(this.innerColor)
//                        .drawCircle(0, 0, this.radius);
//
//                    this.coverCircle.graphics.clear()
//                        .beginFill(createjs.Graphics.getRGB(0, 0, 0, 0))
//                        .drawCircle(0, 0, this.radius) //with respect to the shape bounds
//                        .endFill();
//
//                    this.modifierBitmap.scaleX = this.radius / start_radius;
//                    this.modifierBitmap.scaleY = this.radius / start_radius;
//                    this.modifierBitmap.x = -this.radius;
//                    this.modifierBitmap.y = -this.radius;
//






                } catch (e) {

                }
            }, this);
        createjs.Tween.tick(1);
        return this;

    };

    p.doneTweeningOut = function () {
        //don't want modifiers to send signals, only the arrow
        console.log('modifier done tweening out')
        //this is called when the modifier is done switching, DURING a trial
//        var evt2 = new createjs.Event("done_tweening_out");
//        GLOBAL.currentView.view.dispatchEvent(evt2); //send event to parent
    };



    p.doneTweeningOutLevel = function () {
        console.log('LEVEL done tweening out')
//        var evt2 = new createjs.Event("done_tweening_out");
//        GLOBAL.stage.dispatchEvent(evt2);

    };
    scope.ModifierView = ModifierView;

}(window.GLOBAL));