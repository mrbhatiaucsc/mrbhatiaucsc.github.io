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

var partyLabelTT = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.json("bundestag2009wom.json").then(function(nodes){
  var blocks = nodes.length;
  
  var aScale = d3.scaleLinear().range([0.0, 700]).domain([0.0, 1.0]);
  var bScale = d3.scaleLinear().range([0.0, 700]).domain([1.0, 0.0]);
  var uScale = d3.scaleLinear().range([0.0, 450/blocks]).domain([1.0, 0.0]);

  var tickData = {
    0: "1.0 / 0.0",
    0.5: "0.5",
    1: "1.0 / 0.0"
  }
  
  var bottomTickData = {
    0: "0.0",
    0.5: "0.5",
    1: "1.0 / 0.0"
  }
  
  var topTickData = {
    0: "1.0 / 0.0",
    0.5: "0.5",
    1: "1.0"
  }

  var alphaAxis = d3.axisTop().scale(aScale).tickPadding(2);
  var betaAxis = d3.axisBottom().scale(bScale).tickPadding(2);
  var utilityAxis = d3.axisRight().scale(uScale).ticks(3).tickFormat(function(d){ return tickData[d] });
  var utilityTopAxis = d3.axisRight().scale(uScale).ticks(3).tickFormat(function(d){ return topTickData[d] });
  var utilityBottomAxis = d3.axisRight().scale(uScale).ticks(3).tickFormat(function(d){ return bottomTickData[d] });
  
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

  var yPos = 25;
  var xPos = 150;
  var shadeColor = "white";
  nodes.forEach(function(d, i){
    xPos = 150;
    if(i == 0){
      var topAxis = svg.append("g")
      .attr("class", "u axis")
      .attr("transform", "translate(850," + yPos + ")")
      .call(utilityTopAxis);
      
      topAxis.append("text")
      .text("Utility")
      .attr("fill", "black")
      .attr("x", 200)
      .attr("y", -60)
      .style("font-size", 15)
      .attr("transform", "rotate(90)");

    } else if(i == (nodes.length-1)){
      svg.append("g")
      .attr("class", "u axis")
      .attr("transform", "translate(850," + yPos + ")")
      .call(utilityBottomAxis);
    } else {
      svg.append("g")
      .attr("class", "u axis")
      .attr("transform", "translate(850," + yPos + ")")
      .call(utilityAxis);
    }
    d.coalitionNames.forEach(function(c, j){
      if(d.coalitionShade[j]){
        shadeColor = "lightgrey";
      } else {
        shadeColor = "white";
      }
      var block = svg.append("rect")
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("width", (aScale(d.ranges[j+1]) - aScale(d.ranges[j])))
        .attr("height", 450/blocks)
        .style("fill", shadeColor)
        .style("stroke-width", "1px")
        .style("stroke", "black");
      
      block.on("mouseover", function(e){
        console.log(c);
        partyLabelTT.transition()
        .duration(200)
        .style("opacity", 1); 
        partyLabelTT.html("<div class='ttip'><p style='text-align:center;'><b>" + c + "</b></p><p>Office Range: " + 
                         d.ranges[j].toFixed(2) + " - " + d.ranges[j+1].toFixed(2) + "</p><p>Policy Range: " + (1 - d.ranges[j]).toFixed(2) + " - " + (1 - d.ranges[j+1]).toFixed(2) + "</p></div>")
                //set x and y pos using style and use the d3.event to track pan drag zoom movement and update pos of tooltip
                .style("top", (d3.event.pageY + 450/blocks) + "px")		
                .style("left", (d3.event.pageX +10) + "px");	
        console.log(d3.event.pageY);
      })
      .on("mouseout", function(d){
          partyLabelTT.transition()
              .duration(200)
              .style("opacity", 0); 
      }); 
      
      if(d.ranges[j+1]-d.ranges[j] > 0.05){
        svg.append("text")
        .text(c)
        .attr("x", xPos+3)
        .attr("y", yPos+15)
        .style("font-size", 12);
      }
  
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
      .attr("y", yPos + (450/blocks)/2);
    
    yPos += 450/blocks;
  })
      

//call x-axis to draw on screen and append axis labels
    var gA = svg.append("g")
        .attr("class", "a axis")
        .attr("transform", "translate(150, 25)")
        .call(alphaAxis);
  
    gA.append("text")
        .text("Office (α)")
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
        .text("Policy (β)")
        .attr("fill", "black")
        .attr("x", -50)
        .attr("y", 0)
        .style("font-size", 12);
  
  
})