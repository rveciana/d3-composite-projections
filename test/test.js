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
        var projUSA = d3.geo.albersUsa();
        var proj = d3.geo.conicConformalSpain();
        assert.equal(2500, proj.scale());


        var barcelona = [2.0, 41.0];
        var las_palmas = [-15.0, 28.0];

        var inv_barcelona = proj.invert(proj(barcelona));
        var inv_las_palmas = proj.invert(proj(las_palmas));

        //var loc_las_palmas = proj(las_palmas);

        assert.ok((inv_barcelona[0] - barcelona[0]) < 0.0001);
        assert.ok((inv_barcelona[1] - barcelona[1]) < 0.0001);

        console.info('----------');
        console.info(proj(barcelona));
        console.info(proj(las_palmas));

        assert.ok((inv_las_palmas[0] - las_palmas[0]) < 0.0001, "Las Palmas should be properly reprojected");
        assert.ok((inv_las_palmas[1] - las_palmas[1]) < 0.0001);

        //assert.ok((proj.invert(loc_las_palmas)[0] - las_palmas[0]) < 0.0001, "Las Palmas should be properly reprojected");
        //assert.ok((proj.invert(loc_las_palmas)[1] - las_palmas[1]) < 0.0001);

    })
  })
});
