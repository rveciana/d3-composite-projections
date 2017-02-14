var d3 = require("../");

var data = require("./data/france.json");

var projection = d3.geoConicConformalFrance().fitSize([960, 960], data);
