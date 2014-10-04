/**
 * Created by Tom on 3/21/14.
 */
/**
 * Created by Tom on 3/20/14.
 * Handles the CreateJS part of the playbutton
 */


(function (scope) {

    function Button(x, y, w, h) {
        this.initialize(x, y, w, h);
    }

    Button.prototype = new createjs.Container(); //inherits from container
    Button.prototype.Container_initialize = Button.prototype.initialize;
    createjs.EventDispatcher.initialize(Button.prototype);
    var p = Button.prototype;

    p.initialize = function (x, y, w, h) {


        this.Container_initialize();

        this.iWasClicked = null;
        this.shouldCallFn = null;
        this.isButton = true;
        this.shouldTweenOut = false;

        this.finishedTweenOut = null;

        this.horizontalAlign = "center";

        this.x = x - w / 2; //describes center
        this.y = y - h / 2; //center
        this.width = w;
        this.height = h;
        this.color = createjs.Graphics.getRGB(0, 0, 0, 0);//transparent if color is not set
        this.mouseoverColor = null; //unless specified otherwise
        this.text = "default";
        this.radius = 0; //default
        this.textMargin = 50;

        //shape
        this.shape = new createjs.Shape();
        this.shape.setBounds(this.x, this.y, this.width, this.height);
        this.bounds = this.shape.getBounds();
        this.shape = this.addChild(this.shape);
        this.shape.horizontalAlign = "center";
        this.shape.graphics.clear()
            .beginFill(this.color)
            .drawRoundRect(0, 0, this.width, this.height, this.radius); //with respect to the shape bounds

        //text
        this.t = new createjs.Text(this.text, "40px Helvetica", "#000");
        //('happy');
        this.t.textAlign = "center";
        this.t.textBaseline = "middle";
        this.t.x = this.width / 2; //wrt shape bounds
        this.t.y = this.height / 2; //wrt shape bounds
        this.t.lineWidth = this.width - 2*this.textMargin;
        //this.addChild(this.t);


        //mouseover
        this.shape.on("mouseover", this.handleMouseOver.bind(this));
        this.shape.on("mouseout", this.handleMouseOff.bind(this));
        this.shape.on("click", this.handleMouseClick.bind(this));

        this.shape.on("change",this.redraw.bind(this));

        return this;

    };

    p.redraw = function(){

        this.shape.graphics.clear()
            .beginFill(this.color)
            .drawRoundRect(ti, 0, this.width, this.height, this.radius); //with respect to the shape bounds

    };

    p.setText = function (text) {
        //text
        this.t = new createjs.Text(text, "40px Helvetica", "#000");
        //('happy');
        this.t.textAlign = "center";
        this.t.textBaseline = "middle";
        this.t.x = this.width / 2; //wrt shape bounds
        this.t.y = this.height / 2; //wrt shape bounds
        this.t.lineWidth = this.width - 2*this.textMargin;
        this.text = text.toString();
        this.t.text = this.text;
        this.addChild(this.t);
        return this;
    };

    p.setBitmapText = function(text,spritesheet, scale,yOffset){

        if(!scale){
            scale=1;
        }
        if(!yOffset){
            yOffset = 0
        }

        try{
            var textArray = text.split("\n"); //split by newline??
        }catch(err){
            //dont do anything b/c there's just no text to split
        }

        for(var part in textArray){
            var textLine = textArray[part];
            this.t = new createjs.BitmapText(textLine,spritesheet);
            this.t.scaleX = scale;
            this.t.scaleY = scale;
            var letterWidth = spritesheet._frameWidth * scale;
            var letterHeight = spritesheet._frameHeight * scale;
            this.t.x = this.width / 2 - letterWidth*textLine.length/2; //wrt shape bounds - ASSUMES ITS ONE LINE
            this.t.y = this.height / 2 - letterHeight/2 + letterHeight*part + yOffset; //wrt shape bounds
            this.addChild(this.t);

        }
        return this;
    };

    p.setTextMargin = function(dist){
        this.textMargin = dist;
        this.t.y = this.textMargin; //distance from top
        this.t.lineWidth = this.width - 2*this.textMargin;
        return this;
    };

    p.setColor = function (color, alpha) {
        this.color = createjs.Graphics.getRGB(color,alpha);
        this.shape.graphics.clear()
            .beginFill(this.color)
            .drawRoundRect(0, 0, this.width, this.height, this.radius); //with respect to the shape bounds
        return this;
    };

    p.setProperties = function (properties) {
        this.properties = properties; //custom properites
        return this;
    };


    p.setAlpha = function(alpha){
        this.shape.graphics.alpha = alpha;
        return this;
    };

    p.setTextSize = function(size){
        this.t.font = size.toString() + "px  Helvetica";
        return this;

    };

    p.setTextColor = function(color){
      this.t.color = color;
        return this;
    };

    p.setMouseoverColor = function (color) {
        this.mouseoverColor = color;
        this.shape.graphics.clear()
            .beginFill(this.color)
            .drawRoundRect(0, 0, this.width, this.height, this.radius); //with respect to the shape bounds
        return this;
    };

    p.setBlinkFrequency = function (freq) {
        this.blinkFrequency = freq;
        if(freq > 0) {
            createjs.Tween.get(this.t, {loop: true})
                .to({ alpha: .2}, this.blinkFrequency)
                .to({ alpha: 1}, this.blinkFrequency);
        }
        else if(freq === 0){
            createjs.Tween.removeTweens(this.t);
            this.t.alpha = 1;
        }
        return this;
    };

    p.onTick = function () {

    };

    p.handleMouseOver = function (evt) {
        if(!!this.mouseoverColor){
        //console.log("OVER");
        this.shape.graphics.clear()
            .beginFill(this.mouseoverColor)
            .drawRoundRect(0, 0, this.width, this.height, this.radius);
        }
    };

    p.handleMouseOff = function (evt) {
        this.shape.graphics.clear()
            .beginFill(this.color)
            .drawRoundRect(0, 0, this.width, this.height, this.radius);
        //console.log("OUT");
    };


    p.setRadius = function (radius) {
        this.radius = radius;
        this.shape.graphics.clear()
            .beginFill(this.color)
            .drawRoundRect(0, 0, this.width, this.height, this.radius);
        return this;
    };


    //tweening
    p.tweenIn = function (property, fromLoc, toLoc, timeTaken, easingFn) {
        //args are [property, from, to, time, easing_function

        //just do it now
        if (property === 'x') {
            createjs.Tween.get(this).to({x: this.x + fromLoc}).to({x: this.x + toLoc}, timeTaken, easingFn).tick(1); //tick solves the flicker problem
        } else if (property === 'y') {
            createjs.Tween.get(this).to({y: this.y + fromLoc}).to({y: this.y + toLoc}, timeTaken, easingFn).tick(1);
        }
        return this;
    };



    //mouse click
    p.handleMouseClick = function (evt) {

        this.iWasClicked = true;
        this.callFunction();
//        if(this.shouldCallFn){
//        this.iWasClicked = true;
//            if(this.shouldTweenOut){
//                this.parent.tweenOut();
//            }
//        }
    };



    p.tweenOut = function (property, toLoc, timeTaken, easingFn) {

        this.shouldTweenOut = true;

        this.tweenOutArgs = {
            property: property,
            toLoc: toLoc,
            timeTaken: timeTaken,
            easingFn: easingFn
        };

        return this;
    };
    p.tweenOutSelf = function () {

        try {
            if (this.tweenOutArgs.property === 'x') {
                createjs.Tween.get(this).to({x: this.x + this.tweenOutArgs.toLoc}, this.tweenOutArgs.timeTaken, this.tweenOutArgs.easingFn).wait(this.tweenOutArgs.timeTaken).call(this.callFunction);
            } else if (this.tweenOutArgs.property === 'y') {
                createjs.Tween.get(this).to({y: this.y + this.tweenOutArgs.toLoc}, this.tweenOutArgs.timeTaken, this.tweenOutArgs.easingFn).wait(this.tweenOutArgs.timeTaken).call(this.callFunction);
            }
        } catch (err) {
        }

    };

    p.call = function (fn,arg, scope) {
        //what to do when clicked
        this.shouldCallFn = true;
        this.functionToCall = fn;
        this.functionArgs = arg;
        this.functionScope = scope;
        return this;
    };

    p.callFunction = function () {
        //console.log("FROM BUTTON PERSPECTIVE, current page is ", GAME.currentPage)
        //console.log("calling...", this.functionToCall,this.functionArgs)
        this.finishedTweenOut = true;
        if(this.iWasClicked && this.shouldCallFn){
        //console.log("trying to call...", this.functionToCall, this.text);

            if(this.shouldCallFn){
        this.functionToCall.call(this.functionArgs);
        this.shouldCallFn = false;
            }
            //console.log('state is now ',GLOBAL.state.current);

        }

        if(this.triggerStateChange){
            //console.log("trying to trigger state change");
            this.triggerStateChange();
        }

    };

    p.changeStateWhenFinishedTweeningOut = function(fn){
        //change state
        this.triggerStateChange = fn;
        return this;

    };

    p.sendChangeStateEvent = function(){
        //console.log('button sending done_tweening_out');
        var evt = new createjs.Event("done_tweening_out");
        GLOBAL.stage.dispatchEvent(evt);

    };

    scope.Button = Button;

}(window.GAME));