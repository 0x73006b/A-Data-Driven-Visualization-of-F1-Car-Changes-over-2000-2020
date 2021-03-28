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

    vis.updateVis();
  }

  /**
   * Prepare data and scales before we render it
   */
   updateVis() {
    let vis = this;

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    d3.xml("data/maps/Cleaned_Mugello_Racing_Circuit_track_map.svg")
    .then(data => {
      d3.select("#laptime2-reatimeLap").selectAll("*").remove();
      d3.select("#laptime2-reatimeLap").node().append(data.documentElement)

      var path = d3.select("#track");
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
    });




    d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      vis.selectedTrack = d3.select(this).property("value")
      // run the updateChart function with this selected option
      vis.updateVis()
    })
  }

}