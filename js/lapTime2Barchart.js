// eslint-disable-next-line no-unused-vars
class Barchart {
  /**
   * Class constructor with basic chart configuration
   * @param _config - passed in config
   * @param _data - passed in data
   * @param _reatimeLap - real time lap
   */
  constructor(_config, _data, _reatimeLap) {
    this.config = {
      parentElement: _config.parentElement,
      tooltipPadding: 15,
      containerWidth: _config.containerWidth || 250,
      containerHeight: _config.containerHeight || 410,
      margin: _config.margin || {
        top: 60, right: 20, bottom: 60, left: 70,
      },
    };
    this.data = _data;
    this.reatimeLap = _reatimeLap;
    this.initVis();
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
      .tickFormat((x) => getMinuteStringFromMillisecond(x))
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
    chartTitle(vis, 'Sector Time Comparison', 0, 30, 'start');
    axisLabel(vis, false, 'Lap Time in Minutes', 0, -1 * (vis.height / 2));
    axisLabel(vis, true, 'Year', -60, -25);

    vis.stack = d3.stack().keys(['sector1', 'sector2', 'sector3']);

    // todo: should this be empty? @ mr. rmzm
    vis.selectedTrack = 'Suzuka Circuit';

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

    vis.trackNames = Array.from(new Set(vis.data.map((d) => [d.circuitName])));

    vis.years = d3.extent(vis.data, (d) => d.year);
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

    const maxTime = d3.max(vis.selectedTrackData, (d) => (d.sector1 + d.sector2 + d.sector3));
    // Set the scale input domains
    vis.yScale.domain([0, maxTime + 10000]);

    vis.stackedData = vis.stack(vis.selectedTrackData);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    const vis = this;
    let counter = 0;
    // todo: reference stacked bar chart 436v tutorial
    const stackedChart = vis.chart
      .selectAll('.circuiteName')
      .data(vis.stackedData)
      .join('g')
      .attr('class', (d) => `circuiteName lt2-0-${d.key}`)
      .selectAll('rect')
      .data((d) => d)
      .join('rect')
      .attr('x', (d) => vis.xScale(d.data.year))
      .on('mouseover', (e, d) => {
        d3.select('#tooltip')
          .style('opacity', 1)
          .html((`<div class="tooltip-label">
                    Sector Time <br/> 
                    Time for Sector: ${getMinuteStringFromMillisecond(d[1] - d[0])} <br/>
                    Time Elapsed in Lap: ${getMinuteStringFromMillisecond(d[1])}
                    </div>`));
      })
      .on('mouseleave', () => {
        clearTooltip();
      })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', `${event.pageX + vis.config.tooltipPadding}px`)
          .style('top', `${event.pageY + vis.config.tooltipPadding}px`);
      })
      .transition()
      .duration(700)
      .ease(d3.easeSinOut)
      .attr('y', (d) => vis.yScale(d[1]))
      .attr('height', (d) => vis.yScale(d[0]) - vis.yScale(d[1]))
      .attr('width', vis.xScale.bandwidth())
      .attr('class', () => {
        let a = ['lt2-0-sector1', 'lt2-1-sector1', 'lt2-0-sector2', 'lt2-1-sector2', 'lt2-0-sector3', 'lt2-1-sector3']
        let rv = a[counter];
        counter++;
        return rv;
    });

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
