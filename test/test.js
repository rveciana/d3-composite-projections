var assert = require("assert")
var d3 = require('../node_modules/d3/d3.js'); 
var composite_projection = require('../composite-projections.js'); 

describe('Composite Projections', function(){
  describe('Methods', function(){
    it('All projections must be defined', function(){
        assert.equal(typeof d3.geo.conicConformalSpain , 'function');
     
    })
  });
  describe('Spain', function(){
    it('Projection results should be correct', function(){
        var proj = d3.geo.conicConformalSpain();

        assert.equal(2500, proj.scale());
    })
  })
});  