var assert = require("assert")
var d3 = require('../node_modules/d3/d3.js');
var composite_projection = require('../composite-projections.js');
var createSvgSample = require('./createSvgSample.js');
describe('Composite Projections', function(){

  describe('Methods', function(){
    it('All projections must be defined', function(){
        assert.equal(typeof d3.geo.albersUsa , 'function');
        assert.equal(typeof d3.geo.conicConformalSpain , 'function');

    });
  });

  describe('USA', function(){
    it('Must have a getCompositionBorders method', function(){
      var proj = d3.geo.albersUsa();

      //console.log(proj.invert(proj([-120.50000000,   47.50000000])));
      assert.equal(typeof proj.getCompositionBorders , 'function');
    });
  });

  describe('Spain', function(){
    it('Projection results should be correct', function(){

        var proj = d3.geo.conicConformalSpain();
        assert.equal(2500, proj.scale());


        var barcelona = [2.0, 41.0];
        var las_palmas = [-15.0, 28.0];

        var inv_barcelona = proj.invert(proj(barcelona));
        var inv_las_palmas = proj.invert(proj(las_palmas));

        assert.ok((inv_barcelona[0] - barcelona[0]) < 0.0001);
        assert.ok((inv_barcelona[1] - barcelona[1]) < 0.0001);

        assert.ok((inv_las_palmas[0] - las_palmas[0]) < 0.0001, "Las Palmas should be properly reprojected");
        assert.ok((inv_las_palmas[1] - las_palmas[1]) < 0.0001);


    });
  });

  describe('Portugal', function(){
    it('Projection results should be correct', function(){

        var proj = d3.geo.conicConformalPortugal();
        assert.equal(3000, proj.scale());

        var lisboa = [-9.15, 38.7];
        var ponta_delgada = [-25.7, 37.7];
        var funchal = [-16.91, 32.667];

        var inv_lisboa = proj.invert(proj(lisboa));
        var inv_ponta_delgada = proj.invert(proj(ponta_delgada));
        var inv_funchal = proj.invert(proj(funchal));

        assert.ok((inv_lisboa[0] - lisboa[0]) < 0.0001);
        assert.ok((inv_lisboa[1] - lisboa[1]) < 0.0001);

        assert.ok((inv_ponta_delgada[0] - ponta_delgada[0]) < 0.0001, "Ponta Delgada must be translated");
        assert.ok((inv_ponta_delgada[1] - ponta_delgada[1]) < 0.0001);

        assert.ok((inv_funchal[0] - funchal[0]) < 0.0001, "Funchal must be translated");
        assert.ok((inv_funchal[1] - funchal[1]) < 0.0001);

    });
  });

  /*
  Cayenne (Guyane) -52.314, 4.910
  Saint-Denis (Reunion) 55.4537, -20.885

  Mamoudzou (Mayotte) 45.23, -12.7777
  Fort de France (Martinique) -61.058909 14.607208,
  Pointe-à-Pitre (Guadeloupe) -61.535311, 16.244799

  Nouméa (Nouvelle Calédonie) 166.484263, -22.254973

  Papeete (Polynesie) -149.567121 -17.532704,

  Kolotai (Wallis et futuna) -178.080656 -14.311235,

  St Pierre (St Pierre et Miquelon)  -56.173538, 46.780368,

  Gustavia (St. Barthélemy ) -62.851940 17.895830,
  */

  describe('Create sample SVGs', function(){
    /* I still have to test something, but simply generating the SVG can htlp to see visually is everything works
    The test is outside each projection to make easy to skip, since it takes its time*/
    it('Spain SVG sample', function(){
        createSvgSample.createSvgSample("provincias.json", "conicConformalSpain", "conicConformalSpain.svg", "provincias");

    });

    it('USA SVG sample', function(){
        createSvgSample.createSvgSample("us.json", "albersUsa", "albersUsa.svg","states");

    });

    it('Portugal SVG sample', function(){
        createSvgSample.createSvgSample("world-50m.json", "conicConformalPortugal", "conicConformalPortugal.svg", "countries");

    });

    it('France SVG sample', function(){
        createSvgSample.createSvgSample("france.json", "conicConformalFrance", "conicConformalFrance.svg", "regions");

    });
  });


});
