// Todo: Implement laptime 2 animated view and dropdown
// dropdown filters for which track;
// the geomap will have animations drawn to demonstrate the times for the race
// The default state with nothing selected for dropdown would have nothing showing
// The default state with only dropdown selected the barchart without highlights,
// and the track map without any animation drawn in.

class RealTimeLap {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      // colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 40},
    }
    this.data = _data;
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;


    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    
    vis.selectedTrack=""
    vis.startLap=false
    vis.updateVis();
  }

  /**
   * Prepare data and scales before we render it
   */
   updateVis(_selectedTrack,_startLap) {
    let vis = this;
    vis.selectedTrack=_selectedTrack
    vis.startLap = _startLap
    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    let circuit = vis.data.filter(d=>d.circuitName==vis.selectedTrack)
    if(circuit.length>0){
      let fileName = "data/maps/"+circuit[0].circuitRef+".svg"
      d3.xml(fileName)
      .then(data => {
        d3.select("#laptime2-reatimeLap").selectAll("*").remove();
        d3.select("#laptime2-reatimeLap").node().append(data.documentElement)
        var path = d3.select("#track");
        if(this.startLap){
          var totalLength = path.node().getTotalLength();
          path
            .attr("stroke-width", 2)
            .attr("stroke", "#800020")
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(10000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
        }
        else{
          path
            .attr("stroke-width", 0)
        }
      });
    }
    let button = d3.select("#raceButton")
    .on('click', function(event, d) {
      vis.startLap=true
      vis.updateVis(vis.selectedTrack,true)
    });
  }

}