/**
 * Created by Tom on 4/7/14.
 */

(function (scope) {

    function Preloader() {
        this.queue = null;
    }

    Preloader.prototype = {

        constructor: Preloader,

        load: function () {

//            //background
//            bg = new createjs.Shape(); //have to set color manually here
//            bg.graphics.clear().beginFill("#373f43").drawRect(0, 0, GAME.GameCanvas.width, GAME.GameCanvas.height);
//            GAME.stage.addChild(bg);

            //progress bar
            this.progress = GAME.stage.addChild(new createjs.Shape());
            this.progress.x = GAME.GameCanvas.width / 2;
            this.progress.y = GAME.GameCanvas.height / 2;
            this.initProgressBmp();

            //"loading..." text
            this.loading_text = new createjs.Text("Loading...", "40px Arial", "#FFF");
            this.loading_text.textAlign = "center"; //sets the center of the TEXT to be the thing that's recorded by x-value
            this.loading_text.x = GAME.GameCanvas.width / 2;
            this.loading_text.y = GAME.GameCanvas.height / 2 + 30;
            this.loading_text.shadowOffsetX = 20;
            GAME.stage.addChild(this.loading_text);

            createjs.Ticker.setFPS(30);
            createjs.Ticker.addEventListener('tick', this.onTick.bind(this));//callback function for what to do on each tick

            //actual queue loading
            this.queue = new createjs.LoadQueue(true);
            this.queue.on("complete", this.handleComplete.bind(this));
            this.queue.on("error", this.handlePreloadError.bind(this));
            this.queue.on("fileload", this.handleFileLoad.bind(this));
            this.queue.on("progress", this.handleProgress.bind(this));
            //finicky reading from a different file for some reason, so put the manifest here
            this.queue.loadManifest(this.assets, true);

        },

        assets: [

            //game parameters
            {"id": "manifest", "src": "assets/data/GameData.json", "type": "manifest" },
            {"id": "level01_data", "src": "assets/data/level01.json"},

            //source code
            {"src": "js/game/UI.js"},
            {"src": "js/game/AI.js"},
            {"src": "js/game/utils.js"},
            {"src": "js/game/Page.js"},
            {"src": "js/game/MenuPage.js"},
            {"src": "js/game/LevelPage.js"},
            {"src": "js/game/WeaponSelectPage.js"},


            //multimedia assets
            {"id": "level01_background", "src": "assets/images/level01.png"},
            {"id": "MENU_background", "src": "assets/images/titlebackground.png"},
            {"id": "MENU_select_screen", "src":"assets/images/level-select-screen.png"},
            {"id": "WEAPON_SELECT_background", "src":"assets/images/weapon-select-screen.png"},
            {"id": "play_button", "src":"assets/images/play.png"}
        ],

        handleProgress: function (evt) {

            this.drawProgress(evt.loaded / evt.total);
            GAME.stage.update();

        },

        handleFileLoad: function (evt) {

            //if you've loaded javascript, add it to the document
            var o = evt.item;
            if (o.type == createjs.LoadQueue.JAVASCRIPT) {
                // add JS to the document as it loads:
                document.body.appendChild(evt.result);
            }
            //log('one');
            //log(this.queue);

        },

        drawProgress: function (value) {
            this.progress.graphics.clear()
                .beginFill("#ff5442").drawRoundRect(-103, -13, 206, 46, 2)
                .beginBitmapFill(this.progressBmp).drawRoundRect(-100, -10, value * 200 | 0, 40, 10);
        },

        initProgressBmp: function () {
            // generate the barber pole pattern that we will fill our progress bar with:
            shape = new createjs.Shape();
            shape.graphics.beginFill("#333").drawRect(0, 0, 20, 20).beginFill("#EB2")
                .moveTo(0, 0).lineTo(10, 0).lineTo(0, 10).closePath()
                .moveTo(0, 20).lineTo(20, 0).lineTo(20, 10).lineTo(10, 20).closePath();
            shape.cache(0, 0, 20, 20);
            this.progressBmp = shape.cacheCanvas;
        },


        handleComplete: function (evt) {
            this.moveOut();

        },

        onTick: function () {
            GAME.stage.update();
        },


        moveOut: function () {

            //console.log(progress);
            createjs.Tween.get(this.loading_text).to({x: -2000}, 800, createjs.Ease.backIn);
            createjs.Tween.get(this.progress)
                .to({x: 2000}, 800, createjs.Ease.backIn)
                .wait(400)
                .call(this.finished,null,this); //note: made appropriate scope
        },

        finished: function(){
            //give game assets and control
            GAME.assets = this.queue;
            TowerDefenseGame.preloadComplete();
        },

        handlePreloadError: function (evt) {
            log('loading error',evt);

        }

    };

    scope.Preloader = Preloader;


}(window.GAME));

