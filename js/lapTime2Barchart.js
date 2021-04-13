// Todo: Implement laptime 2 barchart
// x-axis: years, y-axis: best qualifying time in seconds
class Barchart {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _reatimeLap) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      // colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 250,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {
        top: 25, right: 20, bottom: 20, left: 40,
      },
    };
    this.data = _data;
    this.reatimeLap = _reatimeLap;
    this.dropDownReady = false;
    this.initVis();
    this.lt2SelectedYears = [];
  }

  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    const vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales and axes

    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    vis.xScale = d3.scaleBand()
      .range([0, vis.width])
      .paddingInner(0.2);

    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSizeOuter(0)
      .tickSize(0);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickFormat((x) => {
        const millis = (x % 1000);
        let sec = Math.floor(x / 1000);
        const minute = Math.floor(sec / 60);
        sec %= 60;
        return `${minute.toString()}:${sec.toString()}.${(millis / 10).toString()}`;
      })
      .ticks(4)
      .tickSizeOuter(0);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', 'translate(-1,0)');

    // Append axis title
    vis.svg.append('text')
      .attr('class', 'axis-title')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '.71em')
      .text('Lap Time');
    vis.svg.append('text')
      .attr('class', 'axis-title')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '.71em')
      .text('Lap Time');

    // Handmade legend
    const legendx = 160;
    const legendy = 10;
    vis.svg.append('circle').attr('cx', legendx).attr('cy', legendy).attr('r', 6)
      .attr('class', 'circuiteName bar-sector1');
    vis.svg.append('circle').attr('cx', legendx).attr('cy', legendy + 15).attr('r', 6)
      .attr('class', 'circuiteName bar-sector2');
    vis.svg.append('circle').attr('cx', legendx).attr('cy', legendy + 30).attr('r', 6)
      .attr('class', 'circuiteName bar-sector3');
    vis.svg.append('text').attr('x', legendx + 10).attr('y', legendy).text('Sector 1')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    vis.svg.append('text').attr('x', legendx + 10).attr('y', legendy + 15).text('Sector 2')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    vis.svg.append('text').attr('x', legendx + 10).attr('y', legendy + 30).text('Sector 3')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');

    vis.stack = d3.stack().keys(['sector1', 'sector2', 'sector3']);

    // todo: should this be empty? @ mr. rmzm
    vis.selectedTrack = '';

    vis.initData();
  }

  /**
   * Initialize data-related items that only needs to run once.
   */
  initData() {
    const vis = this;

    // Specificy accessor functions
    vis.colorValue = (d) => d.key;
    vis.xValue = (d) => d.year;
    vis.yValue = (d) => d.time * 1000;

    vis.circuitNames = Array.from(new Set(vis.data.map((d) => d.circuitName))).sort();
    console.log('circuitNames', vis.circuitNames);

    // todo: do we need this?
    vis.trackNames = Array.from(new Set(vis.data.map((d) => [d.circuitName])));
    console.log('trackNames', vis.trackNames);

    vis.years = d3.extent(vis.data, (d) => d.year);
    console.log('years', vis.years);
    vis.xScale.domain(vis.years);

    vis.updateVis();
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    const vis = this;

    // // prep data
    vis.selectedTrackData = vis.data.filter((lt) => lt.circuitName === this.selectedTrack);
    console.log('selectedTrackData', vis.selectedTrackData);

    const maxTime = d3.max(vis.selectedTrackData, (d) => (d.sector1 + d.sector2 + d.sector3));
    console.log(maxTime);
    // Set the scale input domains
    vis.yScale.domain([0, maxTime + 10000]);

    vis.stackedData = vis.stack(vis.selectedTrackData);
    console.log('stackedData', vis.stackedData);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    const vis = this;

    // todo: reference stacked bar chart 436v tutorial
    const stackedChart = vis.chart
      .selectAll('.circuiteName')
      .data(vis.stackedData)
      .join('g')
      .attr('class', (d) => `circuiteName bar-${d.key}`)
      .selectAll('rect')
      .data((d) => d)
      .join('rect')
      .attr('x', (d) => vis.xScale(d.data.year))
      .transition()
      .duration(700)
      .ease(d3.easeSinOut)
      .attr('y', (d) => vis.yScale(d[1]))
      .attr('height', (d) => vis.yScale(d[0]) - vis.yScale(d[1]))
      .attr('width', vis.xScale.bandwidth());

    // Update axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);

    d3.selectAll('input').on('change', function () {
      vis.selectedTrack = this.value;
      vis.updateVis();
    });

    vis.reatimeLap.updateVis(vis.selectedTrack, -1);
  }
}
