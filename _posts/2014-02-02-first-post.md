---
layout: default
title: First Post -- Processing.js works!

---

#Processing.org

This is mainly a test to see if I can get Processing.js to work.




<script src="/processing.org/processing.js" type="text/javascript"></script>
<script type="text/javascript">
// convenience function to get the id attribute of generated sketch html element
function getProcessingSketchId () { return 'sphereofpoints'; }
</script>

<div id="content">
			<div>
				<canvas id="sphereofpoints" data-processing-sources="/processing.org/sphereofpoints.pde" 
						width="600" height="400">
					<p>Your browser does not support the canvas tag.</p>
					<!-- Note: you can put any alternative content here. -->
				</canvas>
				<noscript>
					<p>JavaScript is required to view the contents of this page.</p>
				</noscript>
	    	</div>
			<h1>sphereofpoints</h1>
   		<p id="description">Esfera
by David Pena.  

Distribucion aleatoria uniforme sobre la superficie de una esfera.</p>
			<p id="sources">Source code: <a href="/processing.org/sphereofpoints.pde">sphereofpoints</a> </p>
			<p>
			Built with <a href="http://processing.org" title="Processing">Processing</a>
			and <a href="http://processingjs.org" title="Processing.js">Processing.js</a>
			</p>
		</div>