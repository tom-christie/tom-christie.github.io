/**
 * Created by Tom on 4/13/14.
 */
(function (scope) {

    function AI() {
        this.astar = new window.EasyStar.js();
        this.astar.enableDiagonals();
    }

    AI.prototype = {
        constructor: AI,


///////////////////////////////////////////////
// Enemy AI uses levelX.js data for pathfinding
///////////////////////////////////////////////

        newGrid: function (lvldata, lvlw, lvlh) {

            var TILE_INDEX_WALKABLES = [GAME.settings.TILE_INDEX_WALKABLE,
                GAME.settings.TILE_INDEX_SPAWN,
                GAME.settings.TILE_INDEX_GOAL];
//                GAME.settings.TILE_INDEX_BUILDABLE];

//            if (GAME.debugmode)
//                log('pathfinding.newGrid is ' + lvlw + 'x' + lvlh);

            this._grid = this.listToMatrix(lvldata, lvlw); // turn the 1d array into a 2d array
            this.astar.setGrid(this._grid); //Tell EasyStar that this is the grid we want to use
            this.astar.setAcceptableTiles(TILE_INDEX_WALKABLES); //Set acceptable tiles - an array of tile numbers we're allowed to walk on

        },

        temp: function(testAI,path){
            this.pathFoundCallback(testAI, path);
        },



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
//                    if (GAME.debugmode)
//                        log('Found the SPAWN at ' + this.spawnX + ',' + this.spawnY);
                }
                if (list[i] == GAME.settings.TILE_INDEX_GOAL) {
                    this.goalX = currentCol; // in pixels: * TILESIZE + TILESIZEDIV2;
                    this.goalY = k; //in pixels: * TILESIZE + TILESIZEDIV2;
                    //if (GAME.debugmode)
                    //    log('Found the GOAL at ' + this.goalX + ',' + this.goalY);
                }

                currentCol++;

                matrix[k].push(list[i]);
            }

            return matrix;
        },

        findPath: function (who, x1, y1, x2, y2) {
//            if (GAME.debugmode)
//                console.log('Requesting a path from ' + x1 + ',' + y1 + ' to ' + x2 + ',' + y2 + "for", who);
            if (!this._grid) {
//                if (GAME.debugmode)
//                    log('ERROR: Unable to findPath: newGrid has net yet been called!');
                this.pathFoundCallback(who, null);
                return;
            }
            who.waitingForPath = true;
            this.astar.findPath(x1, y1, x2, y2,
                function (path) {
                    GAME.AI.pathFoundCallback(who, path);
                });
        },

        update: function () {
            //profile_start('Pathfinding.update');
            //if (debugmode>1) log('Pathfinding.update');
            this.astar.calculate();
            //profile_end('Pathfinding.update');
        },

        pathFoundCallback: function (who, path) {
//            console.log('callback who',who)
//            console.log('callback path',path)
//            if (GAME.debugmode)
//                log('pathFoundCallback');
            if (path == null) {
//                if (GAME.debugmode)
//                    log('Unable to find path!');
            } else {
//                if (GAME.debugmode)
//                    log('We found a path!');
                var pathstring = '';
                for (var pathloop = 0; pathloop < path.length; pathloop++) {
                    pathstring += path[pathloop].x + ',' + path[pathloop].y + '|';
                }
//                if (GAME.debugmode)
//                    log(pathstring);

                if (who) {
                    who.currentPath = path;
                    who.waitingForPath = false;
                }

            }
        },


        /**
         * Very simplistic entity AI update function
         * called every frame to move entities
         */
        entityAI: function (nme) {

            if (!nme.active) {
                //if (debugmode) log("entityAI ignoring inactive entity");
                return;
            }

            //if (debugmode) log("entityAI for an entity with speed " + nme.speed);

//            // do we need to move?
//            if (nme.speed) {
//                if (!nme.currentPath && !nme.waitingForPath) {
//                    if (debugmode)
//                        log('Generating new path for an entity');
//                    nme.pathCurrentNode = 0;
//
//                    var currentGridX = (nme.x / GAME.settings.TILESIZE) | 0;
//                    var currentGridY = (nme.y / GAME.settings.TILESIZE) | 0;
//                    GAME.AI.findPath(nme, currentGridX, currentGridY, GAME.AI.goalX, GAME.AI.goalY);
//
//                } else if (nme.currentPath && !nme.waitingForPath) {
//                    //if (debugmode) log('Entity has a currentPath');
//
//                    if ((nme.pathCurrentNode < nme.currentPath.length - 1) && nme.currentPath[nme.pathCurrentNode + 1]) {
//                        nme.destinationX = nme.currentPath[nme.pathCurrentNode + 1].x * TILESIZE + TILESIZEDIV2; // + wobbleAI();
//                        nme.destinationY = nme.currentPath[nme.pathCurrentNode + 1].y * TILESIZE + TILESIZEDIV2; // + wobbleAI();
//
//                        // move towards our next waypoint
//                        // and switch animations accordingly
//                        if (nme.destinationY > nme.y) {
//                            nme.y += nme.speed;
//                            nme.currentAnimation = nme.move_s;
//                        }
//                        if (nme.destinationY < nme.y) {
//                            nme.y -= nme.speed;
//                            nme.currentAnimation = nme.move_n;
//                        }
//                        if (nme.destinationX > nme.x) {
//                            nme.x += nme.speed;
//                            nme.currentAnimation = nme.move_e;
//                        }
//                        if (nme.destinationX < nme.x) {
//                            nme.x -= nme.speed;
//                            nme.currentAnimation = nme.move_w;
//                        }
//
//                        // rotate nicely - good for racing games or pure top view
//                        // lookAt(nme, nme.destinationX, nme.destinationY);
//
//                        // only animate if moving
//                        // animate using the spritesheet - if specified: might be a static sprite (tower)
////                        if (nme.currentAnimation) {
////                            nme.setImage(nme.currentAnimation.next());
////                            if (nme.currentAnimation.atLastFrame()) {
////                                if (nme.dying) { // todo fixme - unimplemented - need anim art
////                                    nme.active = false;
////                                    nme.dying = false;
////                                    nme.dead = true;
////                                    //nme.currentAnimation = nme.deathanim;
////                                    //anentity.setImage(anentity.move_n.frames[0]);
////                                    if (debugmode)
////                                        log('Death anim completed');
////                                }
////                            }
////                        }
//
////                        if (closeEnough(nme.destinationX, nme.destinationY, nme.x, nme.y, 5)) {
////                            nme.pathCurrentNode++;
////                            if (debugmode > 2)
////                                log('entityAI arrived at ' + nme.destinationX + ',' + nme.destinationY);
////                            if (debugmode > 2)
////                                log('entityAI next path node: ' + nme.pathCurrentNode);
////                        }
//                    } //else {
////                        if (debugmode)
////                            log('entityAI finished entire path!');
////                        nme.currentPath = null;
////                        // for this game, once we reach the destination we've completed our objective!
////                        attackCastle(nme);
////                    }
//
//                }
//            } // movement
        },


        getTileType: function (tileX, tileY) {
            var tileStyle = 0;
            // which kind of tile did we click?
            if (AI && AI._grid && AI._grid[tileY]) {
                tileStyle = AI._grid[tileY][tileX];
            }
            if (debugmode)
                log('getTileType(' + tileX + ',' + tileY + ')=' + tileStyle);
            return tileStyle;
        },

        setTileType: function (tileX, tileY, setTo) {
            if (debugmode)
                log('setTileType(' + tileX + ',' + tileY + ') to ' + setTo);
            if (AI && AI._grid && AI._grid[tileY]) {
                AI._grid[tileY][tileX] = setTo;
            }
        }

//profile_end('test Pathfinding');    };
    };

    scope.AI = AI;


}(window.GAME));