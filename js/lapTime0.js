// TODO: PUT THIS FUNCTION INTO UTILS
function getMilisecondsFromTimeString(d) {
  const minuteParsed = d.bestLapTime.split(':');
  const secondParsed = minuteParsed[1].split('.');
  const millis = secondParsed[1];
  return ((+minuteParsed[0] * 60 + (+secondParsed[0])) * 1000 + (+millis) * 10);
}

// TODO: PUT THIS FN INTO UTILS
function getMinuteStringFromMillisecond(x) {
  const millis = (x % 1000);
  let sec = Math.floor(x / 1000);
  const minute = Math.floor(sec / 60);
  sec %= 60;
  // TODO: 1:0:0 should display as 1:00:00
  return `${minute.toString()}:${sec.toString()}.${(millis / 10).toString()}`;
}

// x-axis: years, y-axis: averaged fastest qualifying lap time
class LapTime0 {
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
    // eslint-disable-next-line prefer-const
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Xscale should be years 2000-2020
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    // Yscale should be best averaged laptime in seconds
    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0])
      .nice();

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat((x) => x);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat((x) => getMinuteStringFromMillisecond(x));

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
    // TODO: append Y axis title; AVERAGED best laptime in minute
    vis.updateVis();
  }

  updateVis() {
    // eslint-disable-next-line prefer-const
    let vis = this;

    // Specify accessor functions
    // TODO: Y VALUE should be averaged time
    // see https://www.reddit.com/r/formula1/comments/cs1txp/f1_lap_times_by_year_from_20002019/
    // reference for how to calculate it
    // get percentage relative to last value, group by circuit name!

    // accessors for rollups, [ [YEAR int, AVG TIME int] ]
    vis.xValue = (d) => d[0];
    vis.yValue = (d) => d[1];

    // TODO: Remove this
    // Filter data to show fastest f1 lap time averaged
    // averaged fastest laptime in one circuit compared to fastest time from the previous year
    // as percentage decrease in time
    // vis.averagedData = vis.data;

    // TODO: Implement averaging properly -- this is solely for displaying line
    vis.averagedData = d3.rollups(vis.data, (d) => {
      let cumulativeSum = 0;
      d.forEach((v) => {
        // for each year, get millisec. and add it to cumulative sum
        cumulativeSum = +getMilisecondsFromTimeString(v);
      });
      // average cumsum by amount of rounds, obtained through the length of that year's array
      const averagedTime = Math.round(cumulativeSum / d.length);
      return averagedTime;
    }, (d) => d.year);

    // need sort to make sure line displays properly when using rollupS
    vis.averagedData = vis.averagedData.sort();

    // Set the scale input domains
    // eslint-disable-next-line max-len
    // TODO: vis.averagedData is showing negatives for some reason
    // DEBUG
    console.log(vis.averagedData);
    // console.log(vis.yValue);
    vis.xScale.domain([d3.min(vis.averagedData, vis.xValue), d3.max(vis.averagedData, vis.xValue)]);
    vis.yScale.domain([d3.min(vis.averagedData, vis.yValue), d3.max(vis.averagedData, vis.yValue)]);
    // console.log(vis.yScale.domain())
    vis.bisectTime = d3.bisector(vis.xValue).left;

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    // eslint-disable-next-line prefer-const
    let vis = this;

    // Add line path
    vis.marks.selectAll('.lap-time-0-line')
      .data([vis.averagedData])
      .join('path')
      .attr('class', 'lap-time-0-line')
      .attr('fill', 'none')
      .attr('stroke', '#517390')
      .attr('stroke-width', '2px')
      .attr('d', d3.line()
        .x((d) => vis.xScale(vis.xValue(d)))
        .y((d) => vis.yScale(vis.yValue(d))));

    // TODO: tool tip
    // vis.trackingArea
    //   .on('mouseenter', () => {
    //     vis.tooltip.style('display', 'block');
    //   })
    //   .on('mouseleave', () => {
    //     vis.tooltip.style('display', 'none');
    //   })
    //   .on('mousemove', (event) => {
    //     // Get best laptime that corresponds to current mouse x-coordinate
    //     const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
    //     const bestLapTime = vis.xScale.invert(xPos);
    //
    //     // Find nearest data point
    //     const index = vis.bisectTime(vis.averagedData, bestLapTime, 1);
    //     const a = vis.averagedData[index - 1];
    //     const b = vis.averagedData[index];
    //     const d = b && (bestLapTime - a.bestLapTime > b.bestLapTime - bestLapTime) ? b : a;
    //
    //     // Update tooltip
    //     vis.tooltip.select('circle')
    //       .attr('transform', `translate(${vis.xScale(vis.xValue(d))},${vis.yScale(vis.yValue(d))})`);
    //
    //     vis.tooltip.select('text')
    //       .attr('transform', `translate(${vis.xScale(vis.xValue(d))},${(vis.yValue(d) - 15)})`)
    //       .text(Math.round(d.close));
    //   });

    // Update the axes
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
      .call(vis.xAxis);
    // .call((g) => g.select('.domain')
    //   .remove());
    vis.yAxisG
      .call(vis.yAxis);
    // .call((g) => g.select('.domain')
    //   .remove());
  }
}
