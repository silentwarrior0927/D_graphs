$(document).ready(function() {

	var margin = {top: 101, right: 0, bottom: 23, left: 63},
    	width = 1288 - margin.left - margin.right,
    	height = 688 - margin.top - margin.bottom;

    // Container
	var svg = d3.select("#chart").append("svg")
								 .attr("width", width + margin.left + margin.right)
								 .attr("height", height + margin.top + margin.bottom)
							 	 .append("g")
								 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Title
	svg.append("text")
	   .attr("x", width / 2)
	   .attr("y", -53)
	   .attr("text-anchor", "middle")
	   .attr("class", "title")
	   .text("Net exposure (by country)")

	var instruction = svg.append("text")
					  .attr("x", width / 2)
					  .attr("y", -1)
					  .attr("text-anchor", "middle")
					  .attr("class", "instruction")
					  .text("Move your mouse over the bars")

	// Tools for later use
	var stack = d3.layout.stack();
	f = [d3.format("%"), d3.format(".1%")];
	barWidth = 60;

	d3.csv("data.csv", function(error, rawData) {

		dates = Object.keys(rawData[0]).sort();
		dates.pop();
		numDates = dates.length;
		xRange = [];
		for(var i = 1; i < numDates + 1; i++) xRange.push(i * width / (numDates + 1));
		countries = [];
		for(var i = 0; i < rawData.length; i++) countries.push(rawData[i].country);

		// Build scales & axes
		var xScale = d3.scale.ordinal()
						 .domain(dates)
						 .range(xRange);
		var xAxis = d3.svg.axis()
						  .scale(xScale)
						  .orient("bottom");
		svg.append("g")
		   .attr("transform", "translate(0, " + height + ")")
		   .attr("class", "x axis")
		   .call(xAxis);

		var yScale = d3.scale.linear()
						 .domain([0, 1])
						 .range([height, 0]);
		var yAxis = d3.svg.axis()
						  .scale(yScale)
						  .orient("left")
						  .tickFormat(f[0]);
		svg.append("g")
		   .attr("class", "axis")
		   .call(yAxis);

		var colorScale = d3.scale.category20()
								 .domain(countries);

		// Put rawData in format appropriate for d3.layout.stack(), and stack rawData
		var data = [];
		// Loop through rawData
		for(var i = 0; i < rawData.length; i++) {
			// Loop through the object corresponding to each country
			data[i] = [];
			for(var j in rawData[i]) {
				if(rawData[i].hasOwnProperty(j) && isNaN(rawData[i][j]) == false) {
					data[i].push({'x': j, 'y': parseFloat(rawData[i][j]), 'country': rawData[i]['Row Labels']})
				}
			}
		}

		stack(data);

		var countrySeries = svg.selectAll("country")
						 .data(data)
						 .enter()
						 .append("g");

		var labels = countrySeries.append("text")
							.attr("x", width - 116)
							.attr("y", function(d) { return yScale(d[numDates - 1].y0) - height * d[numDates - 1].y / 2 + 4; })
							.text(function(d) { if(height * d[numDates - 1].y < 7) return ""; else return d[0].country; })
							.attr("class", "label");

		var rects = countrySeries.selectAll("rect")
						   .data(function(d) { return d; })
						   .enter()
						   .append("rect")
						   .attr("x", function(d) { return xScale(d.x) - barWidth / 2 ; })
						   .attr("y", function(d) { return yScale(d.y0) - d.y * height; })
						   .attr("height", function(d) { return d.y * height; })
        				   .attr("width", barWidth)
						   .style("fill", function(d) { return colorScale(d.country); })
						   .style("shape-rendering", "crispEdges")
						   .append("text")
						   .text("cow");

		countrySeries.on("mouseenter", function(d) {

													instruction.style("display", "none");

													// dashboard is a global variable
													dashboard = svg.append("g")
													dashboard.append("text")
																 .attr("class", "dashboard dashboard-title")
																 .attr("x", width / 2)
																 .attr("y", -1)
																 .attr("text-anchor", "middle")
																 .text(d[0].country);
													for(var j = 0; j < d.length; j++) {
														dashboard.append("text")
																 .attr("class", "dashboard dashboard-heading")
																 .attr("x", (j + 1) * width / (numDates + 1))
																 .attr("y", 18)
																 .attr("text-anchor", "middle")
																 .text(d[j].x);
														dashboard.append("text")
																 .attr("class", "dashboard")
																 .attr("x", (j + 1) * width / (numDates + 1))
																 .attr("y", 33)
																 .attr("text-anchor", "middle")
																 .text(f[1](d[j].y));
													}
													return "";

						})
					 .on("mouseleave", function(d) { 
					 								dashboard.remove();
					 								instruction.style("display", "block");
						})

	});

	d3.selection.prototype.moveToFront = function() {
		return this.each(function(){
			this.parentNode.appendChild(this);
	});
};

});