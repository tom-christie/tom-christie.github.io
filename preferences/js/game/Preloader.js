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
            this.progress = GAME.stage.addChild(new createjs.Container());
            this.loadImg();

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
            {"src": "js/game/Goon.js"},
            {"src": "js/game/Tower.js"},
            {"src": "js/game/Projectile.js"},


            //multimedia assets
            {"id": "background_level1", "src": "assets/images/level1.png"},
            {"id": "MENU_background", "src": "assets/images/titlebackground.png"},
            {"id": "MENU_select_screen", "src":"assets/images/level-select-screen.png"},
            {"id": "WEAPON_SELECT_background", "src":"assets/images/weapon-select-screen.png"},
            {"id": "play_button", "src":"assets/images/play.png"},
            {"id":"goon1", "src": "assets/images/unit1.png"}
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
            try{
            this.loadingMask.graphics
                .drawRect(0,0, 390*value | 0, 31 );
            }catch (e){

            }
        },


        loadImg: function(){

            this.q = new createjs.LoadQueue();
            this.q.loadFile({id:"loadingImg", src:"assets/images/loading.png"});
            this.q.on("complete", this.initProgressBmp, this);

//            this.loadingImg = new createjs.Image();
//            this.loadingImg.src = "assets/images/loading.png";
        },

        initProgressBmp: function () {

            // masks can only be shapes.
            this.loadingMask = new createjs.Shape();
            this.progress.addChild( this.loadingMask);
            this.loadingMask.graphics.beginFill("#000")
                .drawRect(0,0, 100, 31 );

            //b&W background one
            this.loadingBmpBW = new createjs.Bitmap(this.q.getResult("loadingImg"));
            this.progress.addChild(this.loadingBmpBW);
            this.loadingBmpBW.filters = [new createjs.ColorMatrixFilter(new createjs.ColorMatrix(0,0,-100,0))];
            this.loadingBmpBW.cache(0,0,390,31);

            //masked color one
            this.loadingBmpColor = new createjs.Bitmap(this.q.getResult("loadingImg"));
            this.progress.addChild(this.loadingBmpColor);
            this.loadingBmpColor.mask = this.loadingMask;

            //hard code here height and width
            this.progress.x = GAME.GameCanvas.width/2 - 390/2;
            this.progress.y = GAME.GameCanvas.height/2 - 31/2;
            this.progress.height = 31;
            this.progress.width = 390;

        },


        handleComplete: function (evt) {
            this.moveOut();

        },

        onTick: function () {
            GAME.stage.update();
        },


        moveOut: function () {
            createjs.Tween.get(this.progress)
                .to({y: this.progress.y + this.progress.height/2, scaleY:.1}, 150)
                .wait(100)
                .to({x: this.progress.x + this.progress.width/2, scaleX: 0}, 150)
                .call(this.finished,null,this);
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

