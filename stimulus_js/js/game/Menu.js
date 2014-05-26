/**
 * Created by Tom on 3/20/14.
 */
(function(scope) {

    function Menu() {
        this.initialize();
    }

    Menu.prototype = {

        // Passed in via initialize
        options: null,
        p2: null,
        view:null,

        initialize: function() {

            //Text / event pairs
            this.options = [['1-Back Task','select1Back'],
                ['Modifier Task','selectModifiedArrows']];

            this.view = new GLOBAL.MenuView(this.options);

        },

        onTick: function() {
            this.view.onTick();
        }
    }

    scope.Menu = Menu;

}(window.GLOBAL));