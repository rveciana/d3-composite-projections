var jsdom = require('jsdom'); // Must be 3.x version, not 4.x, which doesn't work on nodejs npm install jsdom@3
var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');

var createSvgSample = function(dataFile, projFuncName, outFile){
//http://www.ciiycode.com/0HNJNUPePjXq/jsdomenv-local-jquery-script-doesnt-work
jsdom.env({
        html: "<html><body></body></html>",
        //documentRoot: __dirname , doesn't seem to work
        scripts: [
          __dirname + '/node_modules/d3/d3.min.js', __dirname + '/europe_proj.js'
        ],
        done:


  function (err, window) {
    var width = 900,
    height = 500;

    var projection = window["d3"]["geo"][projFuncName]();
    //var projection = window.d3.geo.conicConformalSpain();

    var path = d3.geo.path()
        .projection(projection);

    var svg = window.d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var provincias = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    var land = topojson.feature(provincias, provincias.objects.provincias);
      svg.selectAll("path")
          .data(land.features)
          .enter()
          .append("path")
          .attr("d", path);

        svg.append("path")
            .datum(projection.getCompositionBorders())
              .style("fill","none")
              .style("stroke","#000")
              .attr("d", path);

      fs.writeFileSync(outFile, window.d3.select("body").html());
      }
    });
};

//createSvgSample("provincias.json", "conicConformalSpain", "conicConformalSpain.svg");