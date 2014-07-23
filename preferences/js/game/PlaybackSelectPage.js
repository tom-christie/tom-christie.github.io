/**
 * Created by Tom on 5/14/14.
 */
/**
 * Created by Tom on 4/7/14.
 *
 * todo - question: how does the playback AI pick which color laser to shoot? Randomly?
 */



(function (scope) {

    function PlaybackSelectPage(options) {
        createjs.Container.call(this);
        this.setup(options);
    }

    inheritPrototype(PlaybackSelectPage, createjs.Container);

    var p = PlaybackSelectPage.prototype;

    p.setup = function (options) {

        this.x_offset = 0;
        this.background_width = 800;
        this.background_height = 600;

        this.x = GAME.GameCanvas.width / 2 - this.background_width / 2 - this.x_offset / 2;
        this.y = GAME.GameCanvas.height / 2 - this.background_height / 2;

        //draw a box around the screen
        this.border_rectangle = new createjs.Shape();
        this.border_rectangle.graphics
            .beginFill("#2A3034") //todo put this in GameData.json
            .drawRoundRect( 0, 0, this.background_width, this.background_height, 10);
        this.addChild(this.border_rectangle);
        this.addChild(this.map);





    };


    p.update = function () {
        var i;


    };

    p.render = function () {


    };


    scope.PlaybackSelectPage = PlaybackSelectPage;

}(window.GAME));
