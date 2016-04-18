# d3-composite-projections

[![Build Status](https://travis-ci.org/rveciana/d3-composite-projections.svg?branch=master)](https://travis-ci.org/rveciana/d3-composite-projections)

Set of d3 projections for showing countries' distant lands together

![conicConformalFrance](/src/conicConformalFrance.png "Conic Conformal France example")

USAGE
=====

The projection itself works the same way as the other d3 projections. To be more precise, exacly as the [albersUsa](https://github.com/mbostock/d3/wiki/Geo-Projections#albersUsa) projection, so no rotation is supported:

    var projection = d3.geo.conicConformalPortugal();

Change the scale using scale i.e. `.scale(3000)`, as usual.

The projection is available for:

* USA: [albersUSA](http://bl.ocks.org/rveciana/170a76b8dc1f9cfd8b2d)
* France: [conicConformalFrance](http://bl.ocks.org/rveciana/02eb5b83848e0b06fa8e)
* Portugal: [conicConformalPortugal](http://bl.ocks.org/rveciana/aec08199d43759e98afe)
* Spain: [conicConformalSpain](http://bl.ocks.org/rveciana/472b7749352554ca4b68)
* Europe: [conicConformalEurope](http://bl.ocks.org/rveciana/4bcc5750c776c22ffda6) (thought for Eurostat data)
* Japan: [conicEquidistantJapan](http://bl.ocks.org/rveciana/72987a139a9886ed6a87)
* Ecuador: [mercatorEcuador](http://bl.ocks.org/rveciana/f00299fdacf079ecf3a60aca63eef66d)
* Chile: [transverseMercatorChile](http://bl.ocks.org/rveciana/eaf7bce2b2cc8f90d2ac9142659962ed), including the [Chilean Antarctic Territory](https://en.wikipedia.org/wiki/Chilean_Antarctic_Territory)

To draw the borders between the projection zones, use `getCompositionBorders()`:

    svg.append("path")
     .style("fill","none")
     .style("stroke","#000")
     .attr("d", path(projection.getCompositionBorders()));

INSTALLATION
============

Getting the files
-----------------

You can get the files just by cloning the repository:

  git clone https://github.com/rveciana/d3-composite-projections.git

or downloading the *composite-projections.js* or *composite-projections.min.js* files.

Using cdnjs
-----------

You can link the files from your web page to [cdnjs](https://cdnjs.com/libraries/d3-composite-projections):

    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3-composite-projections/0.3.5/composite-projections.min.js"></script>

Using bower
-----------

The bower package will install the production files, without tests or building options:

    bower install d3-composite-projections

Using NPM
---------

[![NPM](https://nodei.co/npm/d3-composite-projections.png?downloads=true&stars=true)](https://nodei.co/npm/d3-composite-projections/)

To install the projections with npm so you can run the tests, use it with node, etc, just run:

    npm install d3-composite-projections
    npm install -g gulp
    gulp

This will download all the dependencies, the test files, and build and run the tests.

Running the tests
-----------------

The tests are made using [mocha](https://github.com/mochajs/mocha). You can run them without using gulp:

    npm install -g mocha

And, from the *test* directory,

    mocha
