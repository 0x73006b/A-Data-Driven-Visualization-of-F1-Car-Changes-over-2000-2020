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
      containerHeight: 400,
      tooltipPadding: 15,
      margin: {
        top: 30,
        right: 50,
        bottom: 70,
        left: 70,
      },
    };
    this.data = _data;
    this.processedData = null;
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
      .ticks(21)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat((x) => x);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat((x) => getMinuteStringFromMillisecond(x));

    // TODO: cite https://sashamaps.net/docs/resources/20-colors/ for colors

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

    // Empty tooltip group (hidden by default)
    // TODO: mouseover tooltip-> flesh this out
    vis.tooltip = vis.chart.append('g')
      .attr('class', 'tooltip')
      .style('display', 'none');

    vis.tooltip.append('circle')
      .attr('r', 4);

    vis.tooltip.append('text');

    chartTitle(vis, 'Averaged Best Lap Time by Year', 0);
    axisLabel(vis, true, 'Years', 0, 0);
    axisLabel(vis, false, 'Averaged Best Lap Time (Minute)', 0, 0);

    vis.initData();
  }

  initData() {
    const vis = this;

    // TODO: Implement averaging properly -- this is solely for displaying line
    vis.processedData = d3.rollups(vis.data, (d) => {
      let cumulativeSum = 0;
      d.forEach((v) => {
        // for each year, get millisec. and add it to cumulative sum
        cumulativeSum += v.laptimeMillis;
      });
      // average cumsum by amount of rounds, obtained through the length of that year's array
      const averagedTime = Math.round(cumulativeSum / d.length);
      return averagedTime;
    }, (d) => d.year);

    // need sort to make sure line displays properly when using rollupS
    vis.processedData = vis.processedData.sort();
    lt0lt1SelectedYears = [];
    lt0lt1SelectedYears.push(vis.processedData[d3.minIndex(vis.processedData, (d) => d[1])][0]);
    lt0lt1SelectedYears.push(vis.processedData[d3.maxIndex(vis.processedData, (d) => d[1])][0]);
    vis.updateVis();
  }

  updateVis() {
    // eslint-disable-next-line prefer-const
    let vis = this;

    // Accessors: 0 = YEAR int, 1 = AVG TIME int
    vis.xValue = (d) => d[0];
    vis.yValue = (d) => d[1];
    vis.yearAccessor = vis.xValue;

    vis.xScale.domain([d3.min(vis.processedData, vis.xValue),
      d3.max(vis.processedData, vis.xValue)]);
    vis.yScale.domain([d3.min(vis.processedData, vis.yValue),
      d3.max(vis.processedData, vis.yValue)]);

    vis.bisectOnXVal = d3.bisector(vis.xValue).left;

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    // eslint-disable-next-line prefer-const
    let vis = this;

    // Add line path
    const lt0Line = vis.marks.selectAll('.lap-time-0-line')
      .data([vis.processedData])
      .join('path')
      .attr('class', 'lap-time-0-line')
      .attr('d', d3.line()
        .x((d) => vis.xScale(vis.xValue(d)))
        .y((d) => vis.yScale(vis.yValue(d))));

    // console.log(lt0lt1SelectedYears);

    const lt0Circles = getCircles(vis, 'lt0', lt0lt1SelectedYears, null);

    lt0Circles
      .on('mouseover', (event, d) => {
        lt0Circles.attr('cursor', 'pointer');
        d3.select('#tooltip')
          .style('opacity', 1)
          .html((`
            <div class="tooltip-label">
                <div class="tooltip-title">Average best laptime for ${d[0]}</div>
                ${d[1]}
            </div>
           `));
      })
      .on('mouseleave', (event, d) => {
        d3.select('#tooltip')
          .style('opacity', 0);
      })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', `${event.pageX + vis.config.tooltipPadding}px`)
          .style('top', `${event.pageY + vis.config.tooltipPadding}px`);
      })
      .on('click', (event, d) => {
        if (lt0lt1SelectedYears.includes(d[0])) {
          lt0lt1SelectedYears = lt0lt1SelectedYears.filter((year) => year !== d[0]);
        } else {
          lt0lt1SelectedYears.push(d[0]);
        }
        lapTime0.updateVis();
        lapTime1.updateVis();
      });

    let clearButton = d3.select('#lap-time-0-clear')
      .on('click', () => {
        // clear selectedYears array
        lt0lt1SelectedYears = [];
        // call update
        lapTime0.updateVis();
        lapTime1.updateVis();
      });

    let resetButton = d3.select('#lap-time-0-reset')
      .on('click', () => {
        vis.initData();
      });

    // Update the axes
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}
