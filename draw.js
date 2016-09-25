var d3_composite = require("d3-composite-projections");
var d3_geo = require("d3-geo");
var d3_request = require("d3-request");
var d3_selection = require("d3-selection");
var d3_transition = require("d3-transition");
var topojson = require("topojson");

var width = 960;
var height = 500;

var projection = d3_composite.geoConicConformalFrance();

var path = d3_geo.geoPath()
    .projection(projection);

var svg = d3_selection.select("#example_map").append("svg")
    .attr("width", width)
    .attr("height", height);

var t = d3_transition.transition()
  .on("interrupt", function(d,i){
    console.info(i);
  });

d3_request.json("france.json", function(error, topojsonData) {
    var us = topojson.feature(topojsonData, topojsonData.objects.regions);

    svg.selectAll(".region")
      .data(us.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class","region")
      .style("fill", "#aca")
      .style("stroke", "#000")
      .style("stroke-width", "0.5px")
      .on("mouseover", function(d,i) {
        d3_selection.select(this)
          .transition(t)
          .style("fill", "red");
        })
      .on("mouseout", function(d,i) {
        d3_selection.select(this).interrupt();
        d3_selection.select(this)
          .transition(t)
          .style("fill", "#aca");
        });

      svg
        .append("path")
          .style("fill","none")
          .style("stroke","#f00")
          .attr("d", projection.getCompositionBorders());

});
