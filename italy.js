/* ----------------------------------------------------------------------------
File: italy.js
Contructs the geomap of italy using D3
80 characters perline, avoid tabs. Indet at 4 spaces.
-----------------------------------------------------------------------------*/ 
//code to set the margins for the chart and defines margin variables
var margin = {top: 20, right: 80, bottom: 30, left: 70},
    //make the width variable for the chart and the height variable according to the margins
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//define the projection object under geoMercator
//center the map on the Lon Lat of Italy
//scale to zoom in 
 var projection = d3.geoMercator()
    .center([15.5, 41.8])
    .scale([1600]); 

//create the path object to make a path off of the coordinates and use the projection defined earlier
var path = d3.geoPath() 
    .projection(projection); 

//define the color scale using scaleThreshold and using the blues gradient with 9 colors
var color = d3.scaleThreshold()
    .range(d3.schemeBlues[7]); 

//define a scale for the legend 
var x = d3.scaleSqrt()
    .domain([30, 450])
    .rangeRound([450, 900]);

//create the svg and append to svg variable to call again later and put it in body section of html
var svg = d3.select("body").append("svg")
    //setting the width and height attributes of the svg using the marging vars defined above
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //use .append("g") to append all svg elements to the DOM
    .append("g")
    //translate the svg by the margins
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//read in the csv file for the population density for italy, 2015 
d3.csv("populationDensity2015.csv").then(function(data){
    //create an array of all the population density figures sorted in ascending order (least to greatest) for domain of color scale 
    var inputVals = data.map(function(d) { return (parseInt(d.value)) }).sort(d3.ascending);
    var finalVals = []; 
    //loop through input vals and store every 3rd value in finalVals array to lessen the data set to reduce crowding 
    for(var i = 0; i < inputVals.length; i++){
        if(i % 3 == 0){
            finalVals.push(inputVals[i]); 
        }
    }
    
    console.log(finalVals); 
    //Set input domain for color scale
    color.domain(
        finalVals
    );
    
    console.log(color.domain()); 
    console.log(color.range()); 
    
    //create the legend 
    //https://bl.ocks.org/mbostock/5562380
    var key = svg.append("g")
    .attr("class", "key"); 

    //select rects to make the leged and loop through every color in the scale
    key.selectAll("rect")
      .data(color.range().map(function(d) {
        //for each color get the range of values associated with it and adjust to pixel domain
          d = color.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
            console.log(d); 
          return d;
        }))
        //append the rect with fixed height and starting pos based on the pixel range and set the width the same way
        //give the scale a color based on value
      .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]);})
        .attr("width", function(d) { return x(d[1]) - x(d[0]);})
        .attr("fill", function(d) { return color(d[0]); });

    //append the axis label
    svg.append("text")
        .attr("class", "caption")
        .attr("x", 550)
        .attr("y", 50)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Population per square kilometer");

    //create the ticks to mark the legend 
    key.call(d3.axisBottom(x)
        .ticks(1)
        .tickPadding(10)
        .tickValues(color.domain().filter(function(d, i) { return !(d === 156); })))
        .select(".domain")
        .remove();

    //read in the json file 
    d3.json("italy.json").then(function(json){  

    //define the features of the jsin file (all paths)
    var features = json.geometries; 
    
    //reverse the winding of the coordinates to draw from the insides out not the outside in
    //https://stackoverflow.com/questions/54947126/geojson-map-with-d3-only-rendering-a-single-path-in-a-feature-collection
    features.forEach(function(feature) {
        if(feature.type == "MultiPolygon") {
            feature.coordinates.forEach(function(polygon) {
                polygon.forEach(function(ring) {
                    ring.reverse();
                })
            })
        }
        else if (feature.type == "Polygon") {
            feature.coordinates.forEach(function(ring) {
                ring.reverse();
                })  
        }
    })
        
    //Merge the population data and GeoJSON
    //Nested loop starting with every value for population per province
    for (var i = 0; i < data.length; i++) {

        //Get the province name
        var dataProvince = data[i].province;

        //Grab data value, and convert from string to int
        var dataValue = parseInt(data[i].value);

        //Find the corresponding province inside the GeoJSON
        for (var j = 0; j < json.geometries.length; j++) {

            var jsonProvince = json.geometries[j].name;
            
            if (dataProvince == jsonProvince) {

                //Copy the data value into the JSON
                json.geometries[j].value = dataValue;

                //Stop looking through the JSON
                break;

            }
        }		
    }

    //Bind data and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(json.geometries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", function(d){ return d.name})
        //set the style feature of the province according to the population density data based on the color scale
        .style("fill", function(d) {
            //Get data value
            var value = d.value;

            if (value) {
                //If value exists…
                return color(value);
            } else {
                //If value is undefined…
                return "#ccc";
            }
        });
			
    });
    
    
}); 
