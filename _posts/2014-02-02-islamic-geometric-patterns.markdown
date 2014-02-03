---
layout: post
date: 2014-02-02
title: Rosettes
tags: [processing, patterns]
---

# Space-filling Islamic geometric patterns

I visited Turkey in 2005 and became a little bit obsessed with the ubiquitous space-filling geometric pattern that filled walls and doors of older buildings.  They clearly had structure, but how could a person start with a blank page and end up with one of these?  

![text](https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Roof_hafez_tomb.jpg/640px-Roof_hafez_tomb.jpg "Ceiling of Hafiz's Tomb")

This is the ceiling of a pavilion over Hafiz's Tomb in Iran. Hafiz was an incredible poet, but that's a topic for another post.

I looked all over to find information published on how to construct such patterns. At that time there wasn't much to be found - some books of pictures, mostly. I found a paper or two describing their construction using a computer, but the author used constructions based on careful angle measurements. Although the high quality craftsmanship of these patterns is very apparent, the angles don't feel arbitrary. I couldn't place my finger on why, but I didn't buy that the original artisans used careful angle measurements.

Since I couldn't find any helpful resources on constructing these things, I spent my senior year of college attempting to draw these patterns by hand and eventually came up with something of an algorithm for constructing a certain category of patterns. I found out later that the method I developed (redeveloped?) using a ruler-and-compass construction is known as a *Euclidean* construction.  My hunch was right, or at least plausible: these patterns could be made without any angle measurements.   

[Here's a copy of my paper.](/assets/docs/geometric_patterns.pdf "senior thesis") It's never seen the light of day, and I've just sat on it for the past 8 years (ugh, it's been 8 years...).   A couple weeks ago I realized that I now having enough coding skill to automate the creation of these patterns.  I'm midway through the project but I thought I'd share my progress so far. I'm using Processing.org / Processing.js.  

The patterns I'm working with are based around "rosettes", which are designs constructed inside a circle. You start by plotting points in regular intervals around the circumference of a circle (this can be done using Euclidean methods, but I'm taking it as a given here).  You then connect those points to each other in certain ways, draw a few more circles with the same center but smaller radii, draw *more* lines using the intersections of those lines and circles, and eventually you get something like this:

![img](/assets/images/rosette-12-lines.png "rosette")

Erasing the "construction lines" gives this:

![img](/assets/images/rosette-12-nolines.png "rosette")

As you can see, this is a pretty basic example. Still, you have to start somewhere. Beginning with this rosette, you can tile the plane using the circles the rosette is constructed within. You then connect the rosettes with each other, creating a space-filling pattern.  

You can play with the applet below.  You can click and drag on the circles to change their size, and drag the center to change the position of the rosette.  It's not NEAR done, so you can easily make it look screwy by dragging the circles on top of each other. Still, it gives you a decent idea of how the construction works.

<script src="/processing.org/processing.js" type="text/javascript"></script>
<script type="text/javascript">
// convenience function to get the id attribute of generated sketch html element
function getProcessingSketchId () { return 'rosette'; }
</script>

<div>
	<canvas id="rosette" data-processing-sources="/processing.org/rosette.pde" 
			width="600" height="600">
		<p>Your browser does not support the canvas tag.</p>
		<!-- Note: you can put any alternative content here. -->
	</canvas>
	<noscript>
		<p>JavaScript is required to view the contents of this page.</p>
	</noscript>
</div>

You can also check out the code [here](https://github.com/tom-christie/patterns).