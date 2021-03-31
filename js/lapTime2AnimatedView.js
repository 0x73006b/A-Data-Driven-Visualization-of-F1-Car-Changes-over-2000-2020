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
      margin: _config.margin || {
        top: 25, right: 20, bottom: 20, left: 40,
      },
    };
    this.data = _data;
    this.initVis();
  }

  initVis() {
    const vis = this;

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

    vis.selectedTrack = '';
    vis.startLap = false;
    vis.updateVis();
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis(_selectedTrack, _startLap) {
    const vis = this;
    vis.selectedTrack = _selectedTrack;
    vis.startLap = _startLap;
    vis.renderVis();
  }

  renderVis() {
    const vis = this;
    const laps = vis.data.filter((d) => d.circuitName === vis.selectedTrack);
    const laptimes = laps.map((d) => d.laptimeMillis).sort();

    if (this.selectedTrack === '') {
      d3.select('#laptime2-reatimeLap').selectAll('*').remove();
      const ANIMATION_SVG = d3.select('#laptime2-reatimeLap')
        .append('svg')
        .attr('width', 1000)
        .attr('height', 1000);

      ANIMATION_SVG.append('text')
        .attr('x', 50)
        .attr('y', 50)
        .attr('dy', '.35em')
        .text('Please select a track to race');
    } else if (laps.length > 0) {
      const fileName = `data/maps/${laps[0].circuitRef}.svg`;
      d3.xml(fileName)
        .then((data) => {
        // clean up previous drawings
          d3.select('#laptime2-reatimeLap').selectAll('*').remove();
          d3.select('#laptime2-reatimeLap').node().append(data.documentElement);

          // setup background
          const background = d3.select('#background');
          background
            .attr('stroke-width', 1)
            .transition()
            .duration(laptimes[0])
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);

          // draw out actual lap
          const path = d3.select('#track');

          if (this.startLap) {
            const totalLength = path.node().getTotalLength();
            path
              .attr('stroke-width', 3)
              .attr('stroke', '#800020')
              .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
              .attr('stroke-dashoffset', totalLength)
              .transition()
              .duration(laptimes[0])
              .ease(d3.easeLinear)
              .attr('stroke-dashoffset', 0);
          } else {
            path
              .attr('stroke-width', 0);
          }
        }).catch(() => {
          const ANIMATION_SVG = d3.select('#laptime2-reatimeLap')
            .append('svg')
            .attr('width', 1000)
            .attr('height', 1000);

          ANIMATION_SVG.append('text')
            .attr('x', 50)
            .attr('y', 50)
            .attr('dy', '.35em')
            .text('Selected track is not available for animation');
        });
    }
    // start button
    d3.select('#startButton')
      // eslint-disable-next-line no-unused-vars
      .on('click', (_event, d) => {
        vis.startLap = true;
        vis.updateVis(vis.selectedTrack, true);
      });
  }
}
