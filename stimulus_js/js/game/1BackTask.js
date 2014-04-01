/**
 * Created by Tom on 3/27/14.
 *
 * Data related to the 1-back task
 *
 */


(function (scope) {

    function OneBackTask() {
        this.initialize();
    }

    OneBackTask.prototype = {

        view: null,

        initialize: function () {

            var i;

            this.current_arrow_index = 0;

            //STIMULUS
            //make a list of arrowViews
            this.numArrowViews = 500;
            this.arrowViewArray = new Array(this.numArrowViews);
            for(i=0; i<this.numArrowViews; i++){
                this.arrowViewArray[i] = new GLOBAL.ArrowView(i,Math.floor(Math.random()*4));
            }

            //RESPONSES
            this.numberCorrect = 0;
            this.numberIncorrect = 0;
            this.responses = new Array(this.numArrowViews);
            this.responseTimes = new Array(this.numArrowViews);

            this.options = {
                duration:parseInt(GLOBAL.GameInfo.oneBackDuration),
                instructions:"Press an arrow key to start the game.",
                newInstructions:"Press the arrow key corresponding to the PREVIOUS arrow."
            };


        },

        onTick: function () {
            this.view.onTick();
        },

        keyPressed: function(){

          this.view.keyPressed();
        },
        makeNewArrow: function(){


        },

        make1BackOneBackTask: function () {


        },

        makeModifierOneBackTask: function () {


        }



    };


    scope.OneBackTask = OneBackTask;

}(window.GLOBAL));