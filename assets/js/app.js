// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Calculate chart width and height
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial params
var chosenXaxis = "poverty";
var chosenYaxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(csvData, chosenXAxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.9,
        d3.max(csvData, d => d[chosenXAxis]) * 1.1
      ])
      .range([0, width]);
  
    return xLinearScale;
  };
  
// function used for updating y-scale var upon click on axis label
function yScale(csvData, chosenYAxis) {
    // create scales
    let yLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d[chosenYAxis]) - 1,
        d3.max(csvData, d => d[chosenYAxis]) + 1
      ])
      .range([height, 0]);
  
    return yLinearScale;
  };

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  };

  // function used for updating yAxis const upon click on axis label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  };

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d=>newYScale(d[chosenYAxis]));
  return circlesGroup;
};

function renderTexts(txtGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  txtGroup.transition()
    .duration(1000)
    .attr("x", d=>newXScale(d[chosenXAxis]))
    .attr("y", d=>newYScale(d[chosenYAxis]))
  return txtGroup;
};

// function used for updating tooltip for circles group
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup){

  let xLabel = ""
  let yLabel = ""

  if (chosenXaxis === "poverty"){
    xLabel = "Poverty: "
  }
  else if (chosenXaxis === "age"){
    xLabel = "Age: "
  }
  else{
    xLabel = "Income: $"
  }
  if (chosenYaxis === "healthcare"){
    yLabel = "Healthcare: "
  }
  else if (chosenYaxis === "smokes"){
    yLabel = "Smokes: "
  }
  else{
    yLabel = "Obesity: "
  };

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d){
        if (chosenYaxis === "smokes" || chosenYaxis === "obesity") {
        if (chosenXaxis === "poverty"){
            return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}%<br>${yLabel}${d[chosenYaxis]}%`)
        }
        return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}<br>${yLabel}${d[chosenYaxis]}%`)
        }
        else if (chosenXaxis === "poverty"){
        return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}%<br>${yLabel}${d[chosenYaxis]}`)
        }
        else{
        return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}<br>${yLabel}${d[chosenYaxis]}`)
        }  
    });
  
  circlesGroup.call(toolTip);
  circlesGroup.on("mouseover", function(data){
    toolTip.show(data, this);
    d3.select(this).style("stroke", "black");
    
  });

  circlesGroup.on("mouseout", function(data, index){
    toolTip.hide(data, this)
    d3.select(this).style("stroke", "white");
  });

  return circlesGroup;
};

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(csvData, err) {
    if (err) throw err;

    // parse data 
    csvData.forEach(function(data){
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    // xLinearScale function after csv import
    var xLinearScale = xScale(csvData, chosenXaxis);

    // yLinearScale function after csv import
    var yLinearScale = yScale(csvData, chosenYaxis)

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append X-axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);
    
    var circleTextGroup = chartGroup.selectAll("mycircles")
        .data(csvData)
        .enter()
        .append("g");

    var circlesGroup = circleTextGroup.append("circle")
        .attr("cx", d=>xLinearScale(d[chosenXaxis]))
        .attr("cy", d=>yLinearScale(d[chosenYaxis]))
        .classed("stateCircle", true)
        .attr("r", 10)
        .attr("opacity", "1");

    var txtGroup = circleTextGroup.append("text")
        .text(d=>d.abbr)
        .attr("x", d=>xLinearScale(d[chosenXaxis]))
        .attr("y", d=>yLinearScale(d[chosenYaxis])+3)
        .classed("stateText", true)
        .style("font-size", "7px")
        .style("font-weight", "700");

     // Create group for  3 x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);
    
    // Create group for  3 y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0-margin.left/4}, ${height/2})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("aText", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Household Income (Median)");
    
    var healthCareLabel = ylabelsGroup.append("text")
        .attr("y", 0 - 20)
        .attr("x", 0)
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .classed("aText", true)
        .text("Lacks Healthcare (%)");
    
    var smokeLabel = ylabelsGroup.append("text")
        .attr("y", 0 - 40)
        .attr("x", 0)
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Smokes (%)");
                                
    var obesityLabel = ylabelsGroup.append("text")
        .attr("y", 0 - 60)
        .attr("x", 0)
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Obese (%)");

    // updateToolTip function after csv import
    circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        //console.log(`${value} click`)
        if (value !== chosenXaxis) {

            // replaces chosenXAxis with value
            chosenXaxis = value;
            //console.log(chosenXaxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(csvData, chosenXaxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

             // updates texts with new x values
            txtGroup = renderTexts(txtGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

            // update tooltip with new info after changing x-axis 
            circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup); 
            // changes classes to change bold text
            if (chosenXaxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXaxis === "age"){
              povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
              ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
              incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
            }
            else{
              povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);  
            }
      }});
// y axis labels event listener
ylabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    //console.log(`${value} click`)
    if (value !== chosenYaxis) {

    // replaces chosenXAxis with value
    chosenYaxis = value;
    //console.log(chosenYaxis)

    // functions here found above csv import
    // updates x scale for new data
    yLinearScale = yScale(csvData, chosenYaxis);

    // updates x axis with transition
    yAxis = renderYAxes(yLinearScale, yAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

    // update tooltip with new info after changing y-axis 
    circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup); 

     // updates texts with new x values
    txtGroup = renderTexts(txtGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

    // changes classes to change bold text
    if (chosenYaxis === "healthcare") {
      healthCareLabel
            .classed("active", true)
            .classed("inactive", false);
      smokeLabel
            .classed("active", false)
            .classed("inactive", true);
      obesityLabel
            .classed("active", false)
            .classed("inactive", true);
    }
    else if (chosenYaxis === "smokes"){
      healthCareLabel
          .classed("active", false)
          .classed("inactive", true);
      smokeLabel
          .classed("active", true)
          .classed("inactive", false);
      obesityLabel
          .classed("active", false)
          .classed("inactive", true);
    }
    else{
      healthCareLabel
            .classed("active", false)
            .classed("inactive", true);
      smokeLabel
            .classed("active", false)
            .classed("inactive", true);
      obesityLabel
            .classed("active", true)
            .classed("inactive", false);  
    }
  }});

}).catch(function(error) {
    console.log(error);
});