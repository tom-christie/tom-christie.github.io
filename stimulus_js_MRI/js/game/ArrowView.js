/**
 * Created by Tom on 3/27/14.
 */
/**
 * Created by Tom on 3/27/14.
 *
 * View object for an arrow pointing in a specific direction.
 * Sub-class of a Container
 */


(function (scope) {

    function ArrowView(index, direction) {
        this.initialize(index, direction);
    }

    ArrowView.prototype = new createjs.Container(); //inherits from container
    ArrowView.prototype.Container_initialize = ArrowView.prototype.initialize;
    createjs.EventDispatcher.initialize(ArrowView.prototype);
    var p = ArrowView.prototype;

    p.initialize = function (index, direction) {
        //index is a number that keeps track of where the arrowView object is in the parent array
        //direction is a integer that says what direction it points in - 0 is right, and other integers rotate counterclockwise
        //by direction * 90 degrees


        /*
         * directions
         * 0 = right
         * 1 = up
         * 2 = left
         * 3 = down
         */


        this.Container_initialize();

        GameInfo = {
            "width": "800",
            "height": "480",
            "backgroundColor": "#34AADC",
            "menuButtonColor": "#FFCC00",
            "menuButtonColorMouseover": "#FF9500",
            "introRegionColor": "#4CD964",
            "introButtonColor": "#FFCC00",
            "introButtonColorMouseover": "#FF9500",
            "arrowInnerColor": "#ff9300",
            "arrowOuterColor": "#2d2d2d",
            "arrowColor": "#2d2d2d"

        };


        this.index = index;
        this.direction = direction;

        this.radius = 80; //default
        this.x = GameInfo.width / 2;// - this.radius; //describes center
        this.y = GameInfo.height / 2;// - this.radius; //center

        this.outerColor = GameInfo.arrowOuterColor;//transparent if color is not set
        this.innerColor = GameInfo.arrowInnerColor;
        this.borderWidth = 4;
        this.isArrow = true;
        this.shouldTweenOut = true;

        //circle
        this.shape = new createjs.Shape();
        this.shape = this.addChild(this.shape);
        this.shape.horizontalAlign = "center";
        //outer
        this.shape.graphics.clear()
            .beginFill(this.outerColor)
            .drawCircle(0, 0, this.radius) //with respect to the shape bounds
            .endFill();
        this.shape.graphics
            .beginFill(this.innerColor)
            .drawCircle(0, 0, this.radius - this.borderWidth);

        //add arrow
        this.arrowBitmap = new createjs.Bitmap(GLOBAL.assets.getResult("arrow_png"));
        this.arrowBitmap.x = 0 - this.radius;//relative to
        this.arrowBitmap.y = 0 - this.radius;//GameInfo.height/2;
        this.arrowBitmap.alpha = 1;
        this.addChild(this.arrowBitmap);
        this.rotate(this.direction);


        //add animation circle
        this.coverCircle = new createjs.Shape();
        this.coverCircle = this.addChild(this.coverCircle);
        this.coverCircle.horizontalAlign = "center";
        this.coverCircle.graphics.clear()
            .beginFill(createjs.Graphics.getRGB(0, 0, 0, 0))
            .drawCircle(0, 0, this.radius) //with respect to the shape bounds
            .endFill();

        return this;

    };

    p.rotate = function (direction) {

        this.rotation = direction * -90; //rotate the whole thing, not just the arrow

    };


//    p.goTo = function(yTarget){
//        this.tweenIn('y',0,yTarget,300,tweenjs.Ease())
//
//    }
//
//
//    //tweening
    p.tweenIn = function () {

        createjs.Tween.get({outerFill: this.radius}).to({outerFill: 0}, 200, createjs.Ease.quintOut)
            .on("change", function (evt) {
                this.coverCircle.graphics.clear()
                    .beginStroke(this.outerColor) //color
                    .setStrokeStyle(evt.target.target.outerFill, "round") //stroke width
                    .drawCircle(0, 0, this.radius - evt.target.target.outerFill / 2); //radius
            }, this);
        createjs.Tween.tick(1);
        return this;
    };

    p.tweenOut = function () {
        createjs.Tween.get({outerFill: 0})
            .to({outerFill: this.radius}, 150, createjs.Ease.qintOut)
            .call(this.doneTweeningOut)
            .on("change", function (evt) {
                try {
                    this.coverCircle.graphics.clear()
                        .beginStroke(this.outerColor) //color
                        .setStrokeStyle(evt.target.target.outerFill, "round") //stroke width
                        .drawCircle(0, 0, this.radius - evt.target.target.outerFill / 2); //radius
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
        createjs.Tween.get(this)
            .to({radius: 0}, 1000, createjs.Ease.backIn)
            .call(this.doneTweeningOutLevel)
            .on("change", function (evt) {
                try {
                    this.shape.graphics.clear()
                        .beginFill(this.outerColor)
                        .drawCircle(0, 0, this.radius) //with respect to the shape bounds
                        .endFill();
                    this.shape.graphics.clear()
                        .beginFill(this.innerColor)
                        .drawCircle(0, 0, this.radius);

                    this.coverCircle.graphics.clear()
                        .beginFill(createjs.Graphics.getRGB(0, 0, 0, 0))
                        .drawCircle(0, 0, this.radius) //with respect to the shape bounds
                        .endFill();

                    this.arrowBitmap.scaleX = this.radius / start_radius;
                    this.arrowBitmap.scaleY = this.radius / start_radius;
                    this.arrowBitmap.x = -this.radius;
                    this.arrowBitmap.y = -this.radius;


                } catch (e) {

                }
            }, this);
        createjs.Tween.tick(1);
        return this;

    };

    p.doneTweeningOut = function () {
        var evt2 = new createjs.Event("done_tweening_out");
        GLOBAL.oneBackTask.view.dispatchEvent(evt2); //send event to parent


//        GLOBAL.doneTweeningListener = GLOBAL.stage.addEventListener("done_tweening_out", GLOBAL.state.handleDoneTweeningOut); //listen for finished tweening

    };

    //tell stage you're done tweening
    p.doneTweeningOutLevel = function(){
        var evt2 = new createjs.Event("done_tweening_out");
        GLOBAL.stage.dispatchEvent(evt2);

    };
    scope.ArrowView = ArrowView;

}(window.GLOBAL));