/* ----------------------------------------------------------------------------
File: MutilineChart.js
Contructs the Multi Line chart using D3
80 characters perline, avoid tabs. Indet at 4 spaces.
-----------------------------------------------------------------------------*/ 

//code to set the margins for the chart and defines margin variables
var margin = {top: 20, right: 80, bottom: 30, left: 70},
    //make the width variable for the chart and the height variable according to the margins
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


//create the svg and append to svg variable to call again later and put it in body section of html
var svg = d3.select("body").append("svg")
    //setting the width and height attributes of the svg using the marging vars defined above
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //use .append("g") to append all svg elements to the DOM
    .append("g")
    //translate the svg by the margins
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var aScale = d3.scaleLinear().range([0.0, 700]).domain([0.0, 1.0]);
var bScale = d3.scaleLinear().range([0.0, 700]).domain([1.0, 0.0]);
var uScale = d3.scaleLinear().range([0.0, 450/6]).domain([1.0, 0.0]);

var tickData = {
  0: "0.0 / 1.0",
  0.5: "0.5",
  1: "0.0 / 1.0"
}

var alphaAxis = d3.axisTop().scale(aScale).tickPadding(2);
var betaAxis = d3.axisBottom().scale(bScale).tickPadding(2);
var utilityAxis = d3.axisRight().scale(uScale).ticks(3).tickFormat(function(d){ return tickData[d] });

var outline = svg.selectAll("rect")
      .data("A")
      .enter()
      .append("g")
      .append("rect")
      .attr("width", 1000)
      .attr("height", 500)
      .style("stroke", "black")
      .style("fill", "none")
      .style("stroke-width", "3px");

d3.json("coalizerViz.json").then(function(nodes){
  var yPos = 25;
  var xPos = 150;
  var shadeColor = "none"; 
  nodes.forEach(function(d, i){
    xPos = 150;
    svg.append("g")
      .attr("class", "u axis")
      .attr("transform", "translate(850," + yPos + ")")
      .call(utilityAxis);
    d.coalitionNames.forEach(function(c, j){
      if(d.coalitionShade[j]){
        shadeColor = "lightgrey";
      } else {
        shadeColor = "none";
      }
      svg.append("rect")
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("width", (aScale(d.ranges[j+1]) - aScale(d.ranges[j])))
        .attr("height", 450/6)
        .style("fill", shadeColor)
        .style("stroke-width", "1px")
        .style("stroke", "black")
        .style("text", c);
      
      svg.append("text")
        .text(c)
        .attr("x", xPos+3)
        .attr("y", yPos+15)
        .style("font-size", 12)
  
      if(c != "Opposition"){
        svg.append("line")
        .attr("class", "line")
        .style("stroke", "black")
        .style("stroke-dasharray", ("1, 1"))
        .style("stroke-width", "1px")
        .attr("x1", xPos)
        .attr("y1", yPos+uScale(d.utilityRanges[j]))
        .attr("x2", xPos+(aScale(d.ranges[j+1]) - aScale(d.ranges[j])))
        .attr("y2", yPos+uScale(d.utilityRanges[j+1]));
      }
      
      xPos += (aScale(d.ranges[j+1]) - aScale(d.ranges[j]));
    })
    svg.append("text")
      .text(d.name)
      .attr("x", 75)
      .attr("y", yPos + (450/6)/2);
    
    yPos += 450/6;
  })
      

//call x-axis to draw on screen and append axis labels
    var gA = svg.append("g")
        .attr("class", "a axis")
        .attr("transform", "translate(150, 25)")
        .call(alphaAxis);
  
    gA.append("text")
        .text("α-Office")
        .attr("fill", "black")
        .attr("x", -50)
        .attr("y", 0)
        .style("font-size", 12);

    
    //call y-axis to draw on screen and append axis labels
    var gB = svg.append("g")
        .attr("class", "b axis")
        .attr("transform", "translate(150, 475)")
        .call(betaAxis); 
  
    gB.append("text")
        .text("β-Policy")
        .attr("fill", "black")
        .attr("x", -50)
        .attr("y", 0)
        .style("font-size", 12);
  
})