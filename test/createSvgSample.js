var jsdom = require('jsdom');
var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');

exports.createSvgSample = function(dataFile, projFuncName, outFile, layerName){
//http://www.ciiycode.com/0HNJNUPePjXq/jsdomenv-local-jquery-script-doesnt-work
jsdom.env({
        html: "<html><body></body></html>",
        //documentRoot: __dirname , doesn't seem to work
        scripts: [
          __dirname + '/../node_modules/d3/d3.min.js', __dirname + '/../composite-projections.js'
        ],
        done:


  function (err, window) {

    var width = 900,
    height = 500;

    //console.info( window["d3"]["geo"]);
    var projection = window["d3"]["geo"][projFuncName]();

    //var projection = window.d3.geo.conicConformalSpain();

    var path = d3.geo.path()
        .projection(projection);

    var svg = window.d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var data = JSON.parse(fs.readFileSync(__dirname +'/data_files/'+dataFile, 'utf8'));

    var land = topojson.feature(data, data.objects[layerName]);
      svg
        .datum(land)
        .append("path")
        .attr("class", "land")
        .style("fill","#aca")
        .style("stroke","#000")
        .attr("d", path);


        /*
        svg.append("path")
            .datum(projection.getCompositionBorders())
              .style("fill","none")
              .style("stroke","#000")
              .attr("d", path);*/

        svg
          .append("path")
            .style("fill","none")
            .style("stroke","#000")
            .attr("d", projection.getCompositionBorders());

      if (!fs.existsSync(__dirname +'/sample_files')) {
            fs.mkdirSync(__dirname +'/sample_files',0744);
        }

      fs.writeFileSync(__dirname +'/sample_files/'+outFile, window.d3.select("body").html());
      }
    });
};

//createSvgSample("provincias.json", "conicConformalSpain", "conicConformalSpain.svg");
