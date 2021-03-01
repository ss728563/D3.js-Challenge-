// @TODO: YOUR CODE HERE!
// read csv and plot graphs using svg .

// Scatter plot.

// Chart area
var svgWidth = 900;
var svgHeight = 500;

//Define Margins.
var margin = {
  top: 20,
  right: 100,
  bottom: 70,
  left: 100
};

// Chart Area  minus Margins.
var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth  = svgWidth - margin.left - margin.right;

// create svg container and move contents over by the margins using transform/translate.
var svg = d3
    .select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var chartGroup = svg.append("g")
// Move contents over beside the Margins
// .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Read from data.csv
d3.csv("data.csv", function(err, data) {
    //d3.csv("/data/data.csv", function(err, data) {
    if (err) throw err;
    //if (error) return console.warn(error);
    console.log(data)
    
    //loop through the csv file & .
    for (var i = 0; i < data.length; i++) {
        console.log(i, data[i].state, data[i].poverty, data[i].healthcare );
        console.log(i, data[i].obesity, data[i].income  );
    }

    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
      })
  
       // Functions to set scale y to chart height.
      var yLinearScale = d3.scaleLinear().range([chartHeight, 0]);
      // scale x to chart width.
      var xLinearScale = d3.scaleLinear().range([0, chartWidth]);
  
      // Create Axis functions
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);
  
      // Scale the domain
      xLinearScale.domain([8,
          d3.max(data, function(data) {
          return +data.poverty * 1.05;
        }),
      ]);

      yLinearScale.domain([0,
          d3.max(brfssdata, function(data) {
          return +data.healthcare * 1.1;
        }),
      ]);
  
    
      // Create tool tip
      var toolTip = d3
        .tip()
        .attr('class', 'tooltip')
        .offset([60, 15])

        .html(function(data) {
            var state = data.state;
            var poverty = +data.poverty;
            var healthcare = +data.healthcare;
            return (
            state + '<br> Poverty Percentage: ' + poverty + '<br> Lacks Healthcare Percentage: ' + healthcare
            );
        });
  
      chartGroup.call(toolTip);
      
      // Generate Scatter Plot
      chartGroup
      .selectAll('circle')
      .data(brfssdata)
      .enter()
      .append('circle')
      .attr('cx', function(data, index) {
        return xLinearScale(data.poverty);
      })
      .attr('cy', function(data, index) {
        return yLinearScale(data.healthcare);
      })
      .attr('r', '16')
      .attr('fill', 'lightgreen')
      .attr('fill-opacity',0.6)
      
      // Display tooltip on mouseover. 
      .on("mouseover",function(data) {
        toolTip.show(data);
      })
      // Hide and Show on mouseout
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
      chartGroup
        .append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);
  
      chartGroup.append('g').call(leftAxis);
  
      svg.selectAll(".dot")
      .data(brfssdata)
      .enter()
      .append("text")
      .text(function(data) { return data.abbr; })
      .attr('x', function(data) {
        return xLinearScale(data.poverty);
      })
      .attr('y', function(data) {
        return yLinearScale(data.healthcare);
      })
      .attr("font-size", "10px")
      .attr("fill", "black")
      .style("text-anchor", "middle");
  
      chartGroup
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left + 40)
        .attr('x', 0 - chartHeight / 2)
        .attr('dy', '1em')
        .attr('class', 'axisText')
        .text('No Healthcare (%)');
  
      // x-axis labels
      chartGroup
        .append('text')
        .attr(
          'transform',
          'translate(' + chartWidth / 2 + ' ,' + (chartHeight + margin.top + 40) + ')',
        )
        .attr('class', 'axisText')
        .text('Poverty (%)');

      //Event listeners with transitions for obesity vs income to be added. 


})