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
      containerWidth: _config.containerWidth || 800,
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

    vis.iterateNum = 0;
    vis.selectedTrack = '';
    vis.trackColor = [['#f20002', '#2fb2e3', '#fcd303'], ['#13C296', '#F5D900', '#F63EBA']];
    vis.updateVis();
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis(_selectedTrack) {
    const vis = this;
    vis.iterateNum += 1;
    vis.selectedTrack = _selectedTrack;
    vis.renderVis();
  }

  renderVis() {
    const vis = this;
    vis.laps = vis.data.filter((d) => d.circuitName === vis.selectedTrack);
    if (this.selectedTrack === '') {
      d3.select('#laptime2-reatimeLap').selectAll('*').remove();
      const ANIMATION_SVG = d3.select('#laptime2-reatimeLap')
        .append('svg')
        .attr('width', 1000)
        .attr('height', 800);

      ANIMATION_SVG.append('text')
        .attr('x', 50)
        .attr('y', 50)
        .attr('dy', '.35em')
        .text('Please select a track to race');
    } else if (vis.laps.length > 0) {
      const fileName = `data/maps/${vis.laps[0].circuitName}.svg`;
      d3.xml(fileName)
        .then((data) => {
        // clean up previous drawings
          d3.select('#laptime2-reatimeLap').selectAll('*').remove();
          d3.select('#laptime2-reatimeLap').node().append(data.documentElement);
          // setup background
          const background = d3.select('#background');
          background
            .attr('stroke-width', 15)
            .transition()
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);

          vis.animationPaths = [[], []];
          // draw out actual lap
          for(var i = 0; i <3; i++) {
            vis.animationPaths[0][i] = d3.select(`#sector0${i}`);
            vis.animationPaths[1][i] = d3.select(`#sector1${i}`);
            vis.animationPaths[0][i]
              .attr('stroke-width', 0);
            vis.animationPaths[1][i]
              .attr('stroke-width', 0);
          }
        }).catch(() => {
          d3.select('#laptime2-reatimeLap').selectAll('*').remove();
          const ANIMATION_SVG = d3.select('#laptime2-reatimeLap')
            .append('svg')
            .attr('width', 1000)
            .attr('height', 800);

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
        for(var i = 0; i <3; i++) {
          vis.animationPaths[0][i].interrupt();
          vis.animationPaths[1][i].interrupt();
          vis.animationPaths[0][i].attr('stroke-width', 0);
          vis.animationPaths[1][i].attr('stroke-width', 0);
        }
        vis.updateAnimation(0, 0, vis.iterateNum);
        vis.updateAnimation(1, 0, vis.iterateNum);
      });
  }

  updateAnimation(trackNum, sectorNum, iterateNum) {
    const vis = this;
    if (iterateNum >= vis.iterateNum) {
      const sectorLength = vis.animationPaths[trackNum][sectorNum].node().getTotalLength();
      vis.animationPaths[trackNum][sectorNum]
        .attr('stroke-width', 3)
        .attr('stroke', vis.trackColor[trackNum][sectorNum])
        .attr('stroke-dasharray', `${sectorLength} ${sectorLength}`)
        .attr('stroke-dashoffset', sectorLength)
        .transition()
        .duration(vis.laps[trackNum]['sector' + (sectorNum + 1) ] * 1000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          if (sectorNum < 2) {
            vis.updateAnimation(trackNum, sectorNum + 1, iterateNum);
          }
        });
    }
  }
}
