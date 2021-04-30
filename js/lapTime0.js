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
      containerWidth: 780,
      containerHeight: 200,
      legendTopY: -200,
      tooltipPadding: 15,
      margin: {
        top: 40,
        right: 230,
        bottom: 30,
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
      .ticks(11)
      .tickSizeOuter(0)
      .tickPadding(5)
      .tickFormat((x) => x);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(5)
      .tickSizeOuter(0)
      .tickPadding(5)
      .tickFormat((x) => getMinuteStringFromMillisecond(900 * x));

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
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

    /**
     * Legend creation
     * spacer Y makes an even 30px gap between, spacerY itself modified conditionally
     * offsetUp and offsetDown adjust the position
     */
    const spacerY = 30;
    const offsetUp = 0.5;
    const offsetDown = 0.35;
    vis.legend = vis.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${vis.config.containerWidth + 27.5},${vis.config.containerHeight-10})`);

    /**
     * Circle creation loop, 1 based counting
     * OffsetModifier checks if index 4 or 6 -- those are the Interpolated Data circles
     * lt1Only is active if i has already drawn the first two circles (which are LT0+LT1)
     * The i%6 moves circles:
     *      - Up for existing data circle
     *      - Down for interpolated data's right circle
     * The i%2 is for unselected/selected and does the same as above.
     */
    for (let i = 1; i <= 6; i++) {
      const offsetModifier = (i === 4 || i === 6) ? 0.5 : 0;
      const lt1Only = i >= 3 ? 1 : 0;
      const circle = vis.legend.append('circle').attr('id', 'legend-lt0-lt1-shared').attr('r', 5)
        .attr('class', i === 2 ? 'lt1-selected' : 'lt1-point');
      if (i > 4) {
        circle
          .attr('cx', -(vis.config.margin.right - 150))
          .attr('cy', (vis.config.legendTopY + spacerY * (i - 1 + offsetModifier + (i % 6 ? offsetUp : offsetDown))));
      } else {
        circle
          .attr('cx', -(vis.config.margin.right - 50))
          .attr('cy', (vis.config.legendTopY + spacerY * (i + lt1Only + offsetModifier + (i % 2 ? offsetUp : offsetDown))));
      }
    }

    /**
     * Loop to create text, lines. exists outside the other loop because it only runs twice.
     * It appends the text and the lines.
     */
    for (let i = 1; i <= 2; i++) {
      vis.legend.append('text').attr('class', 'legend-title')
        .attr('x', -(vis.config.margin.right - 45))
        .attr('y', (vis.config.legendTopY + spacerY + (i % 2 ? 0 : 75)))// the +5 is to vertically center text
        .text(i % 2 ? 'LT0 and LT1:' : 'LT1 Only:');

      vis.legend.append('text').attr('class', 'legend-text')
        .attr('x', -(vis.config.margin.right - 60))
        .attr('y', (vis.config.legendTopY + spacerY * (i + (i % 2 ? offsetUp : offsetDown)) + 5)) // the +5 is to vertically center text
        .text(i % 2 ? 'Unselected' : 'Selected');

      vis.legend.append('text').attr('class', 'legend-text')
        .attr('x', -(vis.config.margin.right - 45))
        .attr('y', (vis.config.legendTopY + (spacerY + (i % 2 ? 6 : 8)) * (i % 2 ? 3 + offsetUp : 4 + offsetDown)))
        .text(i % 2 ? 'Existing Data' : 'Interpolated Data');

      vis.legend.append('line').attr('id', 'legend-line')
        .attr('class', i % 2 ? 'lap-time-1-line' : 'lap-time-1-line-dashed')
        .attr('x1', -(vis.config.margin.right - 50))
        .attr('y1', (vis.config.legendTopY + spacerY * (i % 2 ? (4 + offsetUp) : (5.5 + offsetDown))))
        .attr('x2', -(vis.config.margin.right - 50 - 100))
        .attr('y2', (vis.config.legendTopY + spacerY * (i % 2 ? (4 + offsetUp) : (5.5 + offsetDown))));
    }

    // Titles
    chartTitle(vis, 'Theoretical Yearly Lap Time Progression (aka LT0)', vis.width/2-13, 0);
    // axisLabel(vis, true, 'Years', 20, -20);
    axisLabel(vis, false, 'Theoretical Time (Minutes)', 0, -vis.config.containerHeight / 3);

    vis.initData();
  }

  initData() {
    const vis = this;

    vis.processedData = vis.data;

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

    const lt0Circles = getCircles(vis, 'lt0', lt0lt1SelectedYears, null);

    lt0Circles
      .on('mouseover', (event, d) => {
        lt0Circles.attr('cursor', 'pointer');
        d3.select('#tooltip')
          .style('opacity', 1)
          .html((`
          <div class="tooltip-label">
            <div class="tooltip-title">Year: ${d[0]}</div> 
            Theoretical Time: ${d[1].toFixed(2)}
          </div>
           `));
      })
      .on('mouseleave', () => {
        clearTooltip();
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

    const clearButton = d3.select('#lap-time-0-clear')
      .on('click', () => {
        // clear selectedYears array
        lt0lt1SelectedYears = [];
        // call update
        lapTime0.updateVis();
        lapTime1.updateVis();
      });

    /**
     * reset button
     * calls lt0 initData to reset max/min.
     * calls lt1.updateVis() to re-render selected points in small mult.
     */
    const resetButton = d3.select('#lap-time-0-reset')
      .on('click', () => {
        // resets lap-time-1-remove button state
        pointsRemoved = false;
        d3.select('#lap-time-1-disableEnable')
          .text('Disable Small Multiple Points');
        lapTime0.initData();
        lapTime1.updateVis();
      });

    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}
