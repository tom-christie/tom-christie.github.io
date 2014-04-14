/**
 * Created by Tom on 4/7/14.
 */



(function (scope) {

    function LevelPage() {
        GAME.Page.call(this);
    }
    inheritPrototype(LevelPage,GAME.Page);


    ///////////////////////////////////////
    // define new functions as necessary //
    ///////////////////////////////////////
    var p = LevelPage.prototype;

    p.setup = function () {

        if (GAME.debugmode)
            log('LevelPage.setup');

        // used only for the particle decorations
        var titleframecount = 0;

        // if the game is running in a web page, we may want the loading screen to be invisible
        // CSS display:none, and the game will only appear when ready to play: harmless if unhidden/app.
//        GAME.canvas.style.display = 'block';

//
//        game_paused = 3; // special paused setting: MENU MODE
//        soundIntroHasBeenPlayed = false; // so that next game we start, we hear it again

        var keyCombos = [
//            {
//                "keys": "s",
//                "prevent_repeat": true,
//                "on_keydown": function (e) {
//                    GLOBAL.lastKeyPressed = 's';
//                    GLOBAL.currentView.keyPressed();
//                }
//            },
        ];
        GAME.keyboardListener.register_many(keyCombos);

        this.initLevel(GAME.assets.getResult("level01_data"))

//        // an html gui element (using the DOM!) with the FPS and debug profile stats
//        var info_tag = document.getElementById("info");
//
////        // the main menu background
//        if (!splashSprite)
//            splashSprite = new jaws.Sprite({
//                image : "titlescreen.png",
//                x : (jaws.width / 2) | 0,
//                y : (jaws.height / 2) | 0,
//                anchor : "center_center"
//            });

//        // the level select screen - the second phase of our title screen main menu
//        if (!levelSelectSprite)
//            levelSelectSprite = new jaws.Sprite({
//                image : "level-select-screen.png",
//                x : (jaws.width / 2) | 0,
//                y : (jaws.height / 2) | 0,
//                anchor : "center_center"
//            });
//        // so we can trap clicks on the map sprite
//        levelSelectSprite.action = levelSelectClick;
//
//        // reset in between play sessions - a list of clickable buttons
//        guiButtonSprites = new jaws.SpriteList(); /// see guiClickMaybe()
//        guiButtonSprites.push(levelSelectSprite);
//
//        // the msgbox background - used for pause screen, gameover, level transitions
//        if (!msgboxSprite)
//            msgboxSprite = new jaws.Sprite({
//                image : "msgbox.png",
//                x : (jaws.width / 2) | 0,
//                y : (jaws.height / 2) | 0,
//                anchor : "center_center"
//            });
//
//        // the numbers 0..9 in 32x32 spritesheet fontmap
//        // then we can use fontSpriteSheet.frames[num]
//        if (debugmode)
//            log("Chopping up font spritesheet...");
//        if (!fontSpriteSheet)
//            fontSpriteSheet = new jaws.SpriteSheet({
//                image : "font.png",
//                frame_size : [32, 32],
//                orientation : 'down'
//            });
//
//        // the gui image has all sorts of labels, the credits screen, etc.
//        if (!guiSpriteSheet)
//            guiSpriteSheet = new jaws.Sprite({
//                image : "gui.png"
//            });
//
//        // the credits screen
//        if (!creditsSprite)
//            creditsSprite = extractSprite(guiSpriteSheet.image, 0, 32 * 17, 352, 224, {
//                x : (jaws.width / 2) | 0,
//                y : ((jaws.height / 2) | 0) - 8,
//                anchor : "center_center"
//            });
//
//        // particle system - one explosion per sprite
//        if (particles_enabled) {
//            if (!particles)
//                particles = new jaws.SpriteList();
//            // every frame of every particle animation
//            if (!allparticleframes) {
//                if (debugmode)
//                    log("Chopping up particle animation spritesheet...");
//                allparticleframes = new jaws.Animation({
//                    sprite_sheet : jaws.assets.get("particles.png"),
//                    frame_size : particle_framesize,
//                    frame_duration : PARTICLE_FRAME_MS,
//                    orientation : 'right'
//                });
//            }
//        }
//
//        displayedGold = 0; // we increment displayed score by 1 each frame until it shows true player_Gold
//
//        // the HUD gui sprites: score, etc.
//        if (gui_enabled) {
//
//            var n = 0; // temp loop counter
//
//            if (!WaveGUIlabel)
//                WaveGUIlabel = extractSprite(guiSpriteSheet.image, 0, 32 * 14, 256, 32, {
//                    x : wave_gui_x,
//                    y : wave_gui_y,
//                    anchor : "top_left"
//                });
//            if (!GoldGUIlabel)
//                GoldGUIlabel = extractSprite(guiSpriteSheet.image, 0, 32 * 16, 256, 32, {
//                    x : gold_gui_x,
//                    y : gold_gui_y,
//                    anchor : "top_left"
//                });
//            if (!HealthGUIlabel)
//                HealthGUIlabel = extractSprite(guiSpriteSheet.image, 0, 32 * 15, 256, 32, {
//                    x : health_gui_x,
//                    y : health_gui_y,
//                    anchor : "top_left"
//                });
//            if (!PausedGUI)
//                PausedGUI = extractSprite(guiSpriteSheet.image, 0, 32 * 13, 352, 32, {
//                    x : (jaws.width / 2) | 0,
//                    y : (jaws.height / 2) | 0,
//                    anchor : "center_center"
//                });
//
//            if (!WaveGUI) {
//                if (debugmode)
//                    log('creating wave gui');
//                WaveGUI = new jaws.SpriteList();
//                // the label
//                WaveGUI.push(WaveGUIlabel);
//                // eg 00000 from right to left
//                for (n = 0; n < wave_gui_digits; n++) {
//                    WaveGUI.push(new jaws.Sprite({
//                        x : wave_gui_x + wave_gui_digits_offset + (wave_gui_spacing * wave_gui_digits) - (wave_gui_spacing * n),
//                        y : wave_gui_y,
//                        image : fontSpriteSheet.frames[0],
//                        anchor : "top_left"
//                    }));
//                }
//            }
//
//            // these are sprite lists containing 0..9 digit tiles, ordered from right to left (1s, 10s, 100s, etc)
//            if (!GoldGUI) {
//                if (debugmode)
//                    log('creating gold gui');
//                GoldGUI = new jaws.SpriteList();
//                // the label
//                GoldGUI.push(GoldGUIlabel);
//                // eg 00000 from right to left
//                for (n = 0; n < gold_gui_digits; n++) {
//                    GoldGUI.push(new jaws.Sprite({
//                        x : gold_gui_x + gold_gui_digits_offset + (gold_gui_spacing * gold_gui_digits) - (gold_gui_spacing * n),
//                        y : gold_gui_y,
//                        image : fontSpriteSheet.frames[0],
//                        anchor : "top_left"
//                    }));
//                }
//            }
//
//            if (!HealthGUI) {
//                if (debugmode)
//                    log('creating health gui');
//                HealthGUI = new jaws.SpriteList();
//                // the label
//                HealthGUI.push(HealthGUIlabel);
//                // eg 00000 from right to left
//                for (n = 0; n < health_gui_digits; n++) {
//                    HealthGUI.push(new jaws.Sprite({
//                        x : health_gui_x + health_gui_digits_offset + (health_gui_spacing * health_gui_digits) - (health_gui_spacing * n),
//                        y : health_gui_y,
//                        image : fontSpriteSheet.frames[0],
//                        anchor : "top_left"
//                    }));
//                }
//            }
//        } // if (gui_enabled)
//
//        // create all the sprites used by the GUI
//        if (!menuSprite)
//            menuSprite = new jaws.Sprite({
//                image : chopImage(guiSpriteSheet.image, 0, 32 * 10, 352, 32 * 2),
//                x : (jaws.width / 2) | 0,
//                y : (jaws.height / 2 + 40) | 0,
//                anchor : "center_center",
//                flipped : false
//            });
//        if (!levelcompleteSprite)
//            levelcompleteSprite = new jaws.Sprite({
//                image : chopImage(guiSpriteSheet.image, 0, 0, 352, 128),
//                x : (jaws.width / 2) | 0,
//                y : (jaws.height / 2) | 0,
//                anchor : "center_center",
//                flipped : false
//            });
//        if (!gameoverSprite)
//            gameoverSprite = new jaws.Sprite({
//                image : chopImage(guiSpriteSheet.image, 0, 128, 352, 64),
//                x : (jaws.width / 2) | 0,
//                y : ((jaws.height / 2) | 0) - 42,
//                anchor : "center_center",
//                flipped : false
//            });
//        if (!youloseSprite)
//            youloseSprite = new jaws.Sprite({
//                image : chopImage(guiSpriteSheet.image, 0, 192, 352, 64),
//                x : (jaws.width / 2) | 0,
//                y : ((jaws.height / 2) | 0) + 42,
//                anchor : "center_center",
//                flipped : false
//            });
//        if (!beatTheGameSprite)
//            beatTheGameSprite = new jaws.Sprite({
//                image : chopImage(guiSpriteSheet.image, 0, 256, 352, 64),
//                x : (jaws.width / 2) | 0,
//                y : ((jaws.height / 2) | 0) + 42,
//                anchor : "center_center",
//                flipped : false
//            });
//
//        // move all gui elements around in a window size independent way (responsive liquid layout)
//        if (gui_enabled)
//            liquidLayoutGUI();
//
//        // trigger a menu press if we click anywhere: uses the pos to determine which menu item was clicked
//        window.addEventListener("mousedown", unPause, false);
//
//        // scrolling background images
//        if (use_parallax_background_titlescreen) {
//            if (!titlebackground) {
//                titlebackground = new jaws.Parallax({
//                    repeat_x : true,
//                    repeat_y : true
//                }); // skelevator: was repeat_y: false
//                titlebackground.addLayer({
//                    image : "titlebackground.png",
//                    damping : 1
//                });
//                //titlebackground.addLayer({ image: "parallaxlayer2.png", damping: 8 });
//            }
//        }

    };


    /**
     * inits a new level using json data: sets level specific variables
     */
    p.initLevel = function(leveldata) {
        //profile_start('initLevel');
        if (GAME.debugmode)
            log('initLevel...');
        if (!leveldata) {
            if (GAME.debugmode)
                log('ERROR: Missing level data!');
            return;
        }
        if (!leveldata.properties) {
            if (GAME.debugmode)
                log('ERROR: Missing level.properties!');
            return;
        }

        // clear any previous levels from memory
        world_complexity = 0; // tile count

        // calculate pathfinding costs
        GAME.AI.newGrid(leveldata.layers[1].data, leveldata.width, leveldata.height);

        // remove any leftover terrain from a previous level
//        if (terrainSprite)
//            game_objects.remove(terrainSprite);

//        // the pre-rendered map terrain eg level0.png level1.png level2.png etc
//        terrainSprite = new jaws.Sprite({
//            image : jaws.assets.get("level" + (current_level_number) + ".png"),
//            x : 0,
//            y : 0
//        });
        // put the new terrain at the very first index in the game_objects spritelist array
        //game_objects.unshift(terrainSprite); // why unshift and not push? so the terrain is always drawn before the buildMenu

        // unused
        time_remaining = 0;
        time_direction = 1; // count up
        gameover_when_time_runs_out = false;

//        if (leveldata.properties.start_tile) {
//            var startarray = String(leveldata.properties.start_tile).split(",");
//            startx = parseInt(startarray[0] * leveldata.tilewidth, 10);
//            starty = parseInt(startarray[1] * leveldata.tileheight, 10);
//            if (GAME.debugmode)
//                log('Respawn start point is: ' + startx + ',' + starty);
//        }

//        viewport_max_x = leveldata.width * leveldata.tilewidth;
//        viewport_max_y = (leveldata.height + 2) * leveldata.tileheight; // extend past the level data: fell_too_far + 1;

        if (GAME.debugmode)
            log('initLevel complete.');

        if (GAME.debugmode)
            log('Total tiles in the world: ' + world_complexity);

        //profile_end('initLevel');
    };


    p.update = function(){


    };

    p.draw = function(){


    };

    scope.LevelPage = LevelPage;

}(window.GAME));