/**
 * Created by Tom on 4/7/14.
 */


(function (scope) {

    function UI() {
        //put this.whatever here
    }

    UI.prototype = {
        constructor: UI,


        onResize: function (e) {
            /**
             * this function is used to detect when the screen size has changed
             * due to rotation of a tablet or going into "snapped" view
             * it resizes the game canvas and pauses the game
             */

            if (GAME.debugmode)
                log('onResize!');
            if (GAME.debugmode)
                log('window size is now ' + window.innerWidth + 'x' + window.innerHeight);

            // for example, on a 1366x768 tablet, swiped to the side it is 320x768
            GAME.canvas.width = window.innerWidth;
            GAME.canvas.height = window.innerHeight;
            GAME.width = jaws.canvas.width;
            GAME.height = jaws.canvas.height;
            // move the gui elements around
            this.liquidLayoutGUI();

        },


        /**
         * moves all GUI sprites around depending on window size
         * this function allows TowerGameStarterKit games to be "responsive"
         */
        liquidLayoutGUI: function () {
            if (GAME.debugmode)
                log('liquidLayoutGUI');

            var n = 0; // gui sprite loop counter

//            CREDITS_BUTTON_X = (jaws.width / 2) | 0;
//            // move any msgboxes/GUIs that are centered:
//            if (gameoverSprite)
//                gameoverSprite.moveTo((jaws.width / 2) | 0, ((jaws.height / 2) | 0) - 42);
//            if (beatTheGameSprite)
//                beatTheGameSprite.moveTo((jaws.width / 2) | 0, ((jaws.height / 2) | 0) + 42);
//            if (levelcompleteSprite)
//                levelcompleteSprite.moveTo((jaws.width / 2) | 0, (jaws.height / 2) | 0);
//            if (menuSprite)
//                menuSprite.moveTo((jaws.width / 2) | 0, (jaws.height / 2 + 40) | 0);
//            if (creditsSprite)
//                creditsSprite.moveTo((jaws.width / 2) | 0, (jaws.height / 2) | 0);
//            if (splashSprite)
//                splashSprite.moveTo((jaws.width / 2) | 0, (jaws.height / 2) | 0);
//            if (msgboxSprite)
//                msgboxSprite.moveTo((jaws.width / 2) | 0, (jaws.height / 2) | 0); // (jaws.height / 2 + 8) | 0); if the shadow makes it not vistually centered
//            if (PausedGUI)
//                PausedGUI.moveTo((jaws.width / 2) | 0, (jaws.height / 2) | 0);
//            // move the gui timer/score/count
//
//            if (WaveGUIlabel)
//                WaveGUIlabel.moveTo(wave_gui_x, wave_gui_y);
//            if (GoldGUIlabel)
//                GoldGUIlabel.moveTo(gold_gui_x, gold_gui_y);
//            if (HealthGUIlabel)
//                HealthGUIlabel.moveTo(health_gui_x, health_gui_y);
//
//            if (WaveGUI) {
//                for (n = 0; n < wave_gui_digits; n++) {
//                    WaveGUI.at(n + 1).moveTo(wave_gui_x + wave_gui_digits_offset + (wave_gui_spacing * wave_gui_digits) - (wave_gui_spacing * n), wave_gui_y);
//                }
//            }
//            if (GoldGUI) {
//                for (n = 0; n < gold_gui_digits; n++) {
//                    GoldGUI.at(n + 1).moveTo(gold_gui_x + gold_gui_digits_offset + (gold_gui_spacing * gold_gui_digits) - (gold_gui_spacing * n), gold_gui_y);
//                }
//            }
//            if (HealthGUI) {
//                for (n = 0; n < health_gui_digits; n++) {
//                    HealthGUI.at(n + 1).moveTo(health_gui_x + health_gui_digits_offset + (health_gui_spacing * health_gui_digits) - (health_gui_spacing * n), health_gui_y);
//                }
//            }
        }
    };
}(window));