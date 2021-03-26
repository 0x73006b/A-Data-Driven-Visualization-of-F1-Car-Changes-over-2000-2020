// Todo: Implement laptime 0 line graph
// x-axis: years, y-axis: averaged fastest qualifying lap time
class LineChart {
  /**
   * Class constructor with basic chart configuration
   * @param {Object} _config
   * @param {Array} _data
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 500,
      tooltipPadding: 15,
      margin: {
        top: 30,
        right: 50,
        bottom: 40,
        left: 50,
      },
    };
    this.data = _data;
    this.initVis();
  }

  /**
   * Initialize scales/axes and append static elements, such as axis titles
  */
  initVis() {
    const vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Xscale should be years 2000-2020
    vis.xScale = d3.scaleTime()
      .range([0, vis.width])
      .domain([new Date(2000, 0, 0), new Date(2020, 11, 31)]);
    // Yscale should be best averaged laptime in seconds
    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0])
      .nice();

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(10);
    // .tickFormat(d => d + 'ms');

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    // We need to make sure that the tracking area is on top of other chart elements
    vis.marks = vis.chart.append('g');
    vis.trackingArea = vis.chart.append('rect')
      .attr('width', vis.width)
      .attr('height', vis.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    // Empty tooltip group (hidden by default)
    // TODO: mouseover tooltip-> flesh this out
    vis.tooltip = vis.chart.append('g')
      .attr('class', 'tooltip')
      .style('display', 'none');

    vis.tooltip.append('circle')
      .attr('r', 4);

    vis.tooltip.append('text');

    // TODO: append X axis title (years)
    // TODO: append Y axis title (best laptime in seconds(?) currently MM:SS:MS format...)
  }

  updateVis() {
    const vis = this;

    // TODO: Remove this
    // Filter data to show fastest f1 lap time averaged
    // averaged fastest laptime in one circuit compared to fastest time from the previous year
    // as percentage decrease in time
    vis.averagedData = vis.data;
    // vis.averagedData = d3.rollup(vis.data, (v,d) => d., d => d.year)

    // Specify accessor functions
    // TODO: xValue should be averaged time
    // see https://www.reddit.com/r/formula1/comments/cs1txp/f1_lap_times_by_year_from_20002019/
    // reference for how to calculate it
    // get percentage relative to last value, group by circuit name!

    // TODO: format from string to miliseconds
    // Following Robert's example
    vis.yValue = (d) => {
      const minuteParsed = d.bestLapTime.split(':');
      const secondParsed = minuteParsed[1].split('.');
      const millis = secondParsed[1];
      return ((+minuteParsed[0] * 60 + (+secondParsed[0])) * 1000 + (+millis) * 10);
    };
    vis.xValue = (d) => d.year;
    vis.line = d3.line()
      .x((d) => vis.xScale(vis.xValue(d)))
      .y((d) => vis.yScale(vis.yValue(d)));

    // Set the scale input domains
    // TODO: remove this console.log
    // eslint-disable-next-line no-console
    console.log(vis.line);
    // eslint-disable-next-line max-len
    vis.yScale.domain([d3.min(vis.averagedData, vis.yValue) - 1000, d3.max(vis.averagedData, vis.yValue)]);

    vis.bisectTime = d3.bisector(vis.xValue).left;

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    const vis = this;

    // Add line path
    vis.marks.selectAll('.chart-line')
      .data(vis.averagedData, (d) => d)
      .join('path')
      .attr('class', 'chart-line')
      .attr('stroke', 'grey')
      .attr('stroke-width', '2px')
      .attr('d', vis.line);

    vis.trackingArea
      .on('mouseenter', () => {
        vis.tooltip.style('display', 'block');
      })
      .on('mouseleave', () => {
        vis.tooltip.style('display', 'none');
      })
      .on('mousemove', (event) => {
        // Get best laptime that corresponds to current mouse x-coordinate
        const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
        const bestLapTime = vis.xScale.invert(xPos);

        // Find nearest data point
        const index = vis.bisectTime(vis.data, bestLapTime, 1);
        const a = vis.data[index - 1];
        const b = vis.data[index];
        const d = b && (bestLapTime - a.bestLapTime > b.bestLapTime - bestLapTime) ? b : a;

        // Update tooltip
        vis.tooltip.select('circle')
          .attr('transform', `translate(${vis.xScale(d.date)},${vis.yScale(d.close)})`);

        vis.tooltip.select('text')
          .attr('transform', `translate(${vis.xScale(d.date)},${(vis.yScale(d.close) - 15)})`)
          .text(Math.round(d.close));
      });

    // Update the axes
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
      .call(vis.xAxis)
      .call((g) => g.select('.domain')
        .remove());
    vis.yAxisG
      .call(vis.yAxis)
      .call((g) => g.select('.domain')
        .remove());
  }
}
