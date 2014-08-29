/**
 * Created by Tom on 4/7/14.
 * font is from http://doryen.eptalys.net/forum/index.php?topic=1468.0
 */

(function (scope) {

    function Preloader() {
        GLOBAL.queue = null;
    }

    Preloader.prototype = {

        constructor: Preloader,

        load: function () {

            //background
            this.bg = new createjs.Shape(); //have to set color manually here
            this.bg.graphics.clear().beginFill("#34AADC").drawRect(0, 0, GLOBAL.stage.canvas.width, GLOBAL.stage.canvas.height);
            GLOBAL.stage.addChild(this.bg);


            //progress bar
            this.progress = currentView = GLOBAL.stage.addChild(new createjs.Shape());
            this.progress.x = GLOBAL.stage.canvas.width / 2;
            this.progress.y = GLOBAL.stage.canvas.height / 2;
            this.initProgressBmp();
            //"loading..." text
            this.loading_text = new createjs.Text("Loading...", "40px Arial", "#FFF");
            this.loading_text.textAlign = "center"; //sets the center of the TEXT to be the thing that's recorded by x-value
            this.loading_text.x = GLOBAL.stage.canvas.width / 2;
            this.loading_text.y = GLOBAL.stage.canvas.height / 2 + 30;
            this.loading_text.shadowOffsetX = 20;
            GLOBAL.stage.addChild(this.loading_text);


            createjs.Ticker.setFPS(30);
            createjs.Ticker.addEventListener('tick', this.onTick.bind(this));//callback function for what to do on each tick


            //actual queue loading
            GLOBAL.queue = new createjs.LoadQueue(true);
            GLOBAL.queue.on("complete", this.handleComplete, this);
            GLOBAL.queue.on("error", this.handlePreloadError, this);
            GLOBAL.queue.addEventListener("fileload", this.handleFileLoad.bind(this));
            GLOBAL.queue.addEventListener("progress", this.handleProgress.bind(this));
            //finicky reading from a different file for some reason, so put the manifest here
            //finicky reading from a different file for some reason, so put the manifest here
            GLOBAL.queue.loadManifest(this.assets, true);

        },

        assets: [

            //game parameters
            {"id": "manifest", "src": "assets/manifest.json", "type": "manifest" },

            //source code
            {"src": "js/game/Menu.js"},
            {"src": "js/game/MenuView.js"},
            {"src": "js/game/Intro.js"},
            {"src": "js/game/IntroView.js"},
            {"src": "js/game/Button.js"},
            {"src": "js/game/1BackTask.js"},
            {"src": "js/game/1BackTaskView.js"},
            {"src": "js/game/ArrowView.js"},
            {"src": "js/game/ModifierView.js"},
            {"src": "js/game/ModifierTask.js"},
            {"src": "js/game/ModifierTaskView.js"},

            //multimedia assets
            {"id": "background_image", "src": "assets/images/background.png"},
            {"id": "background_menu", "src": "assets/images/background_menu.png"},
            {"id": "menu_buttons", "src": "assets/images/menu_buttons.png"},
            {"id": "arrow_png", "src": "assets/images/arrow.png"},
            {"id": "modifier_clockwise", "src": "assets/images/clockwise.png"},
            {"id": "modifier_counterclockwise", "src": "assets/images/counterclockwise.png"},
            {"id": "modifier_reflectupdown", "src": "assets/images/reflect_up_down.png"},
            {"id": "modifier_reflectleftright", "src": "assets/images/reflect_left_right.png"}

        ],

        handleProgress: function (evt) {

            this.drawProgress(evt.loaded / evt.total);

        },

        handleFileLoad: function (evt) {

            //if you've loaded javascript, add it to the document
            var o = evt.item;
            if (o.type == createjs.LoadQueue.JAVASCRIPT) {
                // add JS to the document as it loads:
                document.body.appendChild(evt.result);
            }
            //log('one');
            //log(GLOBAL.queue);

        },

        drawProgress: function (value) {
            this.progress.graphics.clear()
                .beginFill("#EB2").drawRoundRect(-103, -13, 206, 26, 13)
                .beginBitmapFill(this.progressBmp).drawRoundRect(-100, -10, value * 200 | 0, 20, 10);
        },
//
//
//        loadImg: function(){
//
//            this.q = new createjs.LoadQueue();
//            this.q.loadFile({id:"loadingImg", src:"assets/images/loading.png"});
//            this.q.on("complete", this.initProgressBmp, this);
//
////            this.loadingImg = new createjs.Image();
////            this.loadingImg.src = "assets/images/loading.png";
//        },

        initProgressBmp: function () {

            // generate the barber pole pattern that we will fill our progress bar with:
            this.shape = new createjs.Shape();
            this.shape.graphics.beginFill("#333").drawRect(0, 0, 20, 20).beginFill("#EB2")
                .moveTo(0, 0).lineTo(10, 0).lineTo(0, 10).closePath()
                .moveTo(0, 20).lineTo(20, 0).lineTo(20, 10).lineTo(10, 20).closePath();
            this.shape.cache(0, 0, 20, 20);
            this.progressBmp = this.shape.cacheCanvas;
        },


        handleComplete: function (evt) {
            this.moveOut();

        },

        onTick: function () {
            GLOBAL.stage.update();
        },


        moveOut: function () {
            //console.log(progress);
            createjs.Tween.get(this.loading_text).to({x: -1000}, 800, createjs.Ease.backIn);
            createjs.Tween.get(this.progress)
                .to({x: 1000}, 800, createjs.Ease.backIn)
                .wait(400)
                .call(this.finishedPreloading, null, this);
        },

        finishedPreloading: function(){
            //give game assets and control
            GLOBAL.assets = GLOBAL.queue;
            window.arrowTask.start()
        },

        handlePreloadError: function (evt) {
            console.log('loading error',evt);

        }

    };

    scope.Preloader = Preloader;


}(window.GLOBAL));

