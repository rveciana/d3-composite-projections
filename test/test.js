var assert = require("assert")
var d3 = require('../bower_components/d3/d3.js'); 
var composite_projection = require('../composite-projections.js'); 

describe('Composite Projections', function(){
  describe('Methods', function(){
    it('All projections must be defined', function(){
        assert.equal(typeof d3.geo.conicConformalSpain , 'function');
     
    })
  });
  describe('Spain', function(){
    it('Projection results should be correct', function(){
        assert.equal(typeof d3.geo.conicConformalSpain , 'function');
       //assert.equal(composite_projection, );
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
});  