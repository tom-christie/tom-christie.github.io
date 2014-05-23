/**
 * Created by Tom on 3/21/14.
 */
/**
 * Created by Tom on 3/20/14.
 */
(function (scope) {

    function Intro() {
        this.initialize();
    }

    Intro.prototype = {

        // Passed in via initialize
        view: null,

        initialize: function () {

            //Text / event pairs
            this.options = {
                modifier: {
                    instructions:"Choose whether to do training or testing. To do testing, you must do training first!",
                    instructions_train:"Respond by pressing the key corresponding to the modified version of each arrow.\n\n The number of modifiers in this round is:",
                    instructions_test:"Respond by pressing the key corresponding to the modified version of each arrow.\n\nSelect the number of modifiers you wish to use."
                },
                oneback: {
                    instructions:"Press any key to move the first arrow. After the first arrow, respond by pressing the key indicating the direction of the previous arrow."
                }
            };
            this.view = new GLOBAL.IntroView(this.options);


        },

        onTick: function () {
            this.view.onTick();
        },


        make1BackIntro: function () {


        },

        makeModifierIntro: function () {


        }



    };


    scope.Intro = Intro;

}(window.GLOBAL));