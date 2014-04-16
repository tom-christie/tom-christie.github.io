/**
 * Created by Tom on 4/13/14.
 */
(function (scope) {

    function AI() {
        //put this.whatever here

//        this.spawnX = 0;
//        this.spawnY = 0;
//        this.goalX = 1;
//        this.goalY = 1;


        this.astar = new window.EasyStar.js();
        this.astar.enableDiagonals();


    }

    AI.prototype = {
        constructor: AI,


///////////////////////////////////////////////
// Enemy AI uses levelX.js data for pathfinding
///////////////////////////////////////////////


        listToMatrix: function (list, elementsPerSubArray) {
            var matrix = [],
                i,
                k,
                currentCol;

            for (i = 0, k = -1; i < list.length; i++) {
                if (i % elementsPerSubArray == 0) {
                    k++;
                    matrix[k] = [];
                    currentCol = 0;
                }

                // detect start and end locations
                if (list[i] == GAME.settings.TILE_INDEX_SPAWN) {
                    this.spawnX = currentCol; // in pixels: * TILESIZE + TILESIZEDIV2;
                    this.spawnY = k; // in pixels: * TILESIZE + TILESIZEDIV2;
                    if (GAME.debugmode)
                        log('Found the SPAWN at ' + this.spawnX + ',' + this.spawnY);
                }
                if (list[i] == GAME.settings.TILE_INDEX_GOAL) {
                    this.goalX = currentCol; // in pixels: * TILESIZE + TILESIZEDIV2;
                    this.goalY = k; //in pixels: * TILESIZE + TILESIZEDIV2;
                    if (GAME.debugmode)
                        log('Found the GOAL at ' + this.goalX + ',' + this.goalY);
                }

                currentCol++;

                matrix[k].push(list[i]);
            }

            return matrix;
        },
//
//        this.newGrid = function (lvldata, lvlw, lvlh) {
//        if (debugmode)
//            log('pathfinding.newGrid is ' + lvlw + 'x' + lvlh);
//
//        this._grid = this.listToMatrix(lvldata, lvlw); // turn the 1d array into a 2d array
//        this.astar.setGrid(this._grid); //Tell EasyStar that this is the grid we want to use
//        this.astar.setAcceptableTiles(TILE_INDEX_WALKABLES); //Set acceptable tiles - an array of tile numbers we're allowed to walk on
//        // wp8 need to JSON.stringify
//        // if (debugmode) log(this._grid);
//    };

        /*
         // test pathfinding!
         // the callback is inline so we know which AI it is for
         profile_start('test Pathfinding');
         var testAI = {};
         this.astar.findPath(0, 0, 9, 9,
         function (path) { pathFoundCallback(testAI, path); }
         );
         //Tell EasyStar to calculate a little, right now!
         this.astar.calculate();
         */

        findPath: function (who, x1, y1, x2, y2) {
            if (GAME.debugmode > 1)
                log('Requesting a path from ' + x1 + ',' + y1 + ' to ' + x2 + ',' + y2);
            if (!this._grid) {
                if (GAME.debugmode)
                    log('ERROR: Unable to findPath: newGrid has net yet been called!');
                pathFoundCallback(who, null);
                return;
            }
            who.waitingForPath = true;
            this.astar.findPath(x1, y1, x2, y2,
                function (path) {
                    pathFoundCallback(who, path);
                });
        },

        /**
         * Tell EasyStar to calculate a little, right now!
         */
        update: function () {
            profile_start('Pathfinding.update');
            //if (debugmode>1) log('Pathfinding.update');
            this.astar.calculate();
            profile_end('Pathfinding.update');
        },
//
//profile_end('init Pathfinding');
//}

        pathFoundCallback: function (who, path) {
            if (GAME.debugmode)
                log('pathFoundCallback');
            if (path == null) {
                if (GAME.debugmode)
                    log('Unable to find path!');
            } else {
                if (GAME.debugmode)
                    log('We found a path!');
                var pathstring = '';
                for (var pathloop = 0; pathloop < path.length; pathloop++) {
                    pathstring += path[pathloop].x + ',' + path[pathloop].y + '|';
                }
                if (GAME.debugmode)
                    log(pathstring);

                if (who) {
                    who.currentPath = path;
                    who.waitingForPath = false;
                }

            }
        },

        newGrid: function (lvldata, lvlw, lvlh) {

            var TILE_INDEX_WALKABLES = [GAME.settings.TILE_INDEX_WALKABLE,
                GAME.settings.TILE_INDEX_SPAWN,
                GAME.settings.TILE_INDEX_GOAL,
                GAME.settings.TILE_INDEX_BUILDABLE];


            if (GAME.debugmode)
                log('pathfinding.newGrid is ' + lvlw + 'x' + lvlh);

            this._grid = this.listToMatrix(lvldata, lvlw); // turn the 1d array into a 2d array
            this.astar.setGrid(this._grid); //Tell EasyStar that this is the grid we want to use
            this.astar.setAcceptableTiles(GAME.settings.TILE_INDEX_WALKABLES); //Set acceptable tiles - an array of tile numbers we're allowed to walk on
            // wp8 need to JSON.stringify
            // if (debugmode) log(this._grid);
        }
//profile_end('test Pathfinding');    };
    };

    scope.AI = AI;


}(window.GAME));