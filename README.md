# d3-composite-projections
Set of d3 projections for showing countries' distant lands together

![conicConformalFrance](/src/conicConformalFrance.png "Conic Conformal France example")

USAGE
=====

The projection itself works the same way as the other d3 projections. To be more precise, exacly as the [albersUsa](https://github.com/mbostock/d3/wiki/Geo-Projections#albersUsa) projection, so no rotation is supported:

    var projection = d3.geo.conicConformalPortugal();

Change the scale using scale i.e. `.scale(3000)`, as usual.

The projection is available for:

* USA: `albersUSA()`
* France: `conicConformalFrance()`
* Portugal: `conicConformalPortugal()`
* Spain: `conicConformalSpain()`

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

Of course, you can link the files from your script:

    <script src="https://raw.githubusercontent.com/rveciana/d3-composite-projections/master/composite-projections.min.js"></script>

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
