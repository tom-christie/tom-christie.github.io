/*

 Javascript geo library - https://github.com/tom-christie/geo

 Copyright (c) 2014, Tom Christie and contributors
 Released under the MIT license

 todo - make sure points/intersections don't duplicate

 */

(function (scope) {

    var geo = {

        //---------------------------------------------------------------------------
        // SETTINGS
        VERSION: "0.0.1",

        //---------------------------------------------------------------------------
        // DEFAULTS
        pointWidth: 2,
        pointColor: "#FFF",
        pointColorMouseover: "#F00",
        lineWidth: 1,
        lineColor: "#000",
        circleWidth: 1.5,
        circleColor: "#000",
        circleColorMouseover: "#F00",


        //---------------------------------------------------------------------------
        // CONSTRUCTORS
        stage: new createjs.Container(),
        manifest: [],


        point: function (x, y) {
            geo.redraw = true;
            this.manifest.push(new geo.Point(x, y));
            return this.manifest[this.manifest.length - 1];
        },

        addPoint: function (point) {
            geo.redraw = true;
            this.manifest.push(point);
            return this.manifest[this.manifest.length - 1];
        },

        /**
         * Returns a list of lines connecting every Nth points in a list
         * @param {List} count points The list of points you want connected
         * @param {Number} N Optional - Every Nth points should be connected
         * @return {List} points A list of geo.Line objects
         */
        connectEveryN: function (points, N) {

            if (!N) {
                //set default N value
                var N = 1;
            }

            var lines = [];
            var index1 = 0;
            var index2 = N % points.length;
            for (var i = 0; i < points.length; i++) {
                //console.log('index', index1, index2)
                lines.push(geo.lineFromPoints(points[index1], points[index2]));
                geo.redraw = true;
                this.manifest.push(lines[lines.length - 1]);
                index1 = (index1 + 1) % points.length;
                index2 = (index2 + 1) % points.length;
            }
            return lines;
        },

        lineFromPoints: function (p1, p2) {
            geo.redraw = true;
            this.manifest.push(new geo.Line(p1.x, p1.y, p2.x, p2.y));
            return this.manifest[this.manifest.length - 1];
        },

        lineFromCoords: function (x1, y1, x2, y2) {
            geo.redraw = true;
            this.manifest.push(new geo.Line(x1, y1, x2, y2));
            return this.manifest[this.manifest.length - 1];
        },

        circleFromPoint: function (center, radius) {
            geo.redraw = true;
            this.manifest.push(new geo.Circle(center.x, center.y, radius));
            return this.manifest[this.manifest.length - 1];
        },

        circleFromCoords: function (x1, x2, radius) {

        },


        //---------------------------------------------------------------------------
        // INTERSECTIONS

        getLineIntersection: function (line1, line2) {
            //returns a point object, or "null" if no line exists
            //console.log('finding new point')
            //lines are parallel
            if ((line1.y2 - line1.y1) / (line1.x2 - line1.x1) === (line2.y2 - line2.y1) / (line2.x2 - line2.x1)) {
                return null;
            }

            var x = ( (line1.x1 * line1.y2 - line1.y1 * line1.x2) * (line2.x1 - line2.x2) - (line1.x1 - line1.x2) * (line2.x1 * line2.y2 - line2.y1 * line2.x2))
                / ((line1.x1 - line1.x2) * (line2.y1 - line2.y2) - (line1.y1 - line1.y2) * (line2.x1 - line2.x2));
            var y = ( (line1.x1 * line1.y2 - line1.y1 * line1.x2) * (line2.y1 - line2.y2) - (line1.y1 - line1.y2) * (line2.x1 * line2.y2 - line2.y1 * line2.x2))
                / ((line1.x1 - line1.x2) * (line2.y1 - line2.y2) - (line1.y1 - line1.y2) * (line2.x1 - line2.x2));

            //console.log('new point', x, y)
            geo.redraw = true;
            this.manifest.push(new geo.Point(x, y));
            return this.manifest[this.manifest.length - 1];


        },

        getAllIntersections: function (line, type) {
            //optional type argument - get all intersections with things of a specific type
            if (!type) {
                type = "line";
            }

            var points = [];
            var i;
            for (i = 0; i < this.manifest.length; i++) {
                if (this.manifest[i].type === "line") {
                    points.push(this.getLineIntersection(line, this.manifest[i]));
                }
            }

            return points;
        },
        //===========================================================================
        // internal representation - everything you add is appended here,
        // which keeps track...so that you can later fill in shapes, find paths, etc

        add: function (thing) {

        },


        draw: function (canvas) {
            //draw everything on the createjs stage
            this.canvas = canvas; //need to pass this in to get screen bounds

//            var i, j;
//            if (this.drawnPreviously) {
//                console.log('holla!!')
//                for (i = 0; i < this.manifest.length; i++) {
//
//                    var id = this.manifest[i].id;
//                    for (j = 0; j < this.stage.children.length; j++) {
//                        if (this.stage.children[j].id === id) {
//                            var temp = this.stage.removeChildAt(id);
//                            console.log('removing', temp)
//                            break;
//                        }
//                    }
//                }
//            }

            this.stage.removeAllChildren();
            for (i = 0; i < this.manifest.length; i++) {
                if (this.manifest[i].type === "line" || this.manifest[i].type === "circle") {
                    this.manifest[i].draw();
                }
            }
            //draw points last so they'll be on top
            for (i = 0; i < this.manifest.length; i++) {
                if (this.manifest[i].type === "point") {
                    this.manifest[i].draw();
                }
            }
            this.redraw = false;
        }
        //===========================================================================


    }; // geo

    //===========================================================================
    // NAMESPACES
    scope.geo = geo;

}(window));


(function (scope) {

    function Point(x, y) {

        this.init(x, y);
        this.type = "point";
        this.color = geo.pointColor;
    }

    Point.prototype = {
        constructor: Point,

        init: function (x, y) {
            this.x = x;
            this.y = y;
        },

        handleMouseOver: function () {
            this.color = geo.pointColorMouseover;
            geo.redraw = true;
        },

        handleMouseOut: function () {
            this.color = geo.pointColor;
            geo.redraw = true;
        },
        draw: function () {
            //console.log('drawing')
            this.shape = new createjs.Shape();
            this.shape.graphics.clear()
                .setStrokeStyle(geo.pointWidth)
                .beginStroke(this.color)
                .beginFill(this.color)
                .drawCircle(this.x, this.y, geo.pointWidth);
            geo.stage.addChild(this.shape);

            this.id = this.shape.id;
            this.shape.on("mouseover", this.handleMouseOver.bind(this));
            this.shape.on("mouseout", this.handleMouseOut.bind(this));


        }

    };

    geo.Point = Point;

}(geo));


(function (scope) {

    function Line(x1, y1, x2, y2) {

        this.init(x1, y1, x2, y2);
        this.type = "line";

    }

    Line.prototype = {
        constructor: Line,

        init: function (x1, y1, x2, y2) {

            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;

        },

        draw: function () {

            //draw using the bounds of the screen
            var m = (this.y2 - this.y1) / (this.x2 - this.x1);
            var b = this.y2 - m * this.x2;
            var A = -m / b;
            var B = 1 / b;

            var x1 = null;
            var y1 = null;
            var x2 = null;
            var y2 = null;

            if (!isFinite(m)) {
                //line is vertical
                x1 = this.x1;
                y1 = 0;
                x2 = this.x2;
                y2 = geo.canvas.height;
            } else {
                //not vertical - find screen boundaries
                //find screen border intersections
                var x_top = 1 / A;
                var y_top = 0;
                var x_left = 0;
                var y_left = 1 / B;
                var x_right = geo.canvas.width;
                var y_right = (1 - A * geo.canvas.width) / B;
                var x_bottom = (1 - B * geo.canvas.height) / A;
                var y_bottom = geo.canvas.height;

                //find first point
                if (x_top > 0 && x_top < geo.canvas.width) {
                    x1 = x_top;
                    y1 = y_top;
                } else if (x_bottom > 0 && x_bottom < geo.canvas.width) {
                    x1 = x_bottom;
                    y1 = y_bottom;
                } else if (y_left > 0 && y_left < geo.canvas.height) {
                    x1 = x_left;
                    y1 = y_left;
                } else if (y_right > 0 && y_right < geo.canvas.height) {
                    x1 = x_right;
                    y1 = y_right;
                }

                //find second point - go in opposite order
                if (y_right > 0 && y_right < geo.canvas.height) {
                    x2 = x_right;
                    y2 = y_right;
                } else if (y_left > 0 && y_left < geo.canvas.height) {
                    x2 = x_left;
                    y2 = y_left;
                } else if (x_bottom > 0 && x_bottom < geo.canvas.width) {
                    x2 = x_bottom;
                    y2 = y_bottom;
                } else if (x_top > 0 && x_top < geo.canvas.width) {
                    x2 = x_top;
                    y2 = y_top;
                }
            }

            //console.log('line', x1, y1, x2, y2, m, b, A, B);
            if (x1 != null && x2 != null) {

                this.shape = new createjs.Shape();
                this.shape.graphics.clear()
                    .setStrokeStyle(geo.lineWidth)
                    .beginStroke(geo.lineColor);
                this.shape.graphics
                    .moveTo(x1, y1)
                    .lineTo(x2, y2);
                geo.stage.addChild(this.shape);
                this.id = this.shape.id;
            }


        }


    };

    geo.Line = Line;

}(geo));


(function (scope) {

    function Circle(x, y, radius) {

        this.init(x, y, radius);
        this.type = "circle";

    }

    Circle.prototype = {
        constructor: Circle,

        init: function (x, y, radius) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = geo.circleColor;
        },

        /**
         * Finds a number of equally spaced points around the circle
         * @param {Number} count The number of points you want
         * @param {Number} angle Optional - the angle (in radians) of a point to start with
         * @param {Number} y Optional - the y coordinate of a point to start with
         * @return {List} points A list of geo.Point objects
         */
        getEquallySpacedPoints: function (count, startAngle) {
            if (!count) {
                return [];
            }
            if (!startAngle) {
                //x or y weren't defined
                //use the top most point of the circle
                startAngle = Math.PI / 2;
            }

            var points = [];

            //make the points
            var angle_diff = 2 * Math.PI / count;
            for (var i = 0; i < count; i++) {
                var angle = startAngle + angle_diff * i;
                var x = this.radius * Math.cos(angle) + this.x;
                var y = -this.radius * Math.sin(angle) + this.y;
                points.push(new geo.Point(x, y));
            }
            for (var i = 0; i < points.length; i++) {
                geo.manifest.push(points[i]);
            }
            return points;

        },

        handleMouseOver: function () {
            this.color = geo.circleColorMouseover;
            geo.redraw = true;
        },

        handleMouseOut: function () {
            this.color = geo.circleColor;
            geo.redraw = true;
        },

        draw: function () {

            //console.log('drawing circle', this.x, this.y, this.radius);
            this.shape = new createjs.Shape();
            this.shape.graphics.clear()
                .setStrokeStyle(geo.circleWidth)
                .beginStroke(this.color)
                .drawCircle(this.x, this.y, this.radius);
            geo.stage.addChild(this.shape);
            this.id = this.shape.id;
            this.shape.on("mouseover", this.handleMouseOver.bind(this));
            this.shape.on("mouseout", this.handleMouseOut.bind(this));

        }

    };

    geo.Circle = Circle;

}(geo));



