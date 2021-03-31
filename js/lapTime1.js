// TODO: Better comments lol
class LapTime1 {
  /**
   * Class constructor with basic chart configuration
   * @param {Object} _config
   * @param {Array} _data
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 350,
      tooltipPadding: 15,
      margin: {
        top: 30,
        right: 50,
        bottom: 190,
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
    const vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
    vis.xScale = d3.scaleBand()
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSize(-vis.height)
      .tickPadding(10)
      .tickFormat((d) => d);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(6)
      .tickSize(-vis.width - 10)
      .tickPadding(10)
      .tickFormat((d) => getMinuteStringFromMillisecond(d));

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    // todo: rotate text
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    // Chart Title
    chartTitle(vis, 'LT1: Best Lap Times');
    axisLabel(vis, true, 'Tracks');
    axisLabel(vis, false, 'Averaged Fastest Qualifying Lap Time (in Minute)');

    vis.updateVis();
  }

  /**
   * Data updates and stuff
   */
  updateVis() {
    const vis = this;

    // Accessor
    vis.yValue = (d) => d.laptimeMillis;
    vis.xValue = (d) => d.circuitName;
    vis.yearAccessor = (d) => d.year;

    // TODO: Move this out into main -- something similar used by LT2 as well
    // group by circuitName
    // get circuit names
    let tracks = vis.data.map((entry) => entry.circuitName).sort();
    tracks = new Set(tracks);
    vis.xScale.domain(tracks);
    vis.yScale.domain([d3.min(vis.data, (d) => vis.yValue(d)), d3.max(vis.data, (d) => vis.yValue(d))]);

    let lineChartData = vis.data.filter((d) => (lt0lt1SelectedYears.includes(d.year)));
    lineChartData = lineChartData.sort((a, b) => d3.ascending(a.circuitName, b.circuitName));
    lineChartData = d3.rollup(lineChartData, (d) => d, (d) => d.year);
    vis.lineChartData = Array.from(lineChartData, ([year, values]) => ({ year, values }));

    vis.processedData = vis.data;

    vis.renderVis();
  }

  /**
   * Render visualization
   */
  renderVis() {
    const vis = this;

    const lt1Circles = getCircles(vis, 'lt1', lt0lt1SelectedYears, null);

    const line = d3.line()
      .x((d) => vis.xScale(vis.xValue(d)))
      .y((d) => vis.yScale(vis.yValue(d)));

    // todo: cite https://bl.ocks.org/sebg/0cc55428f83eb52bdfad6f5692023b07 for general guidance
    const lt1Line = vis.chart.selectAll('.lap-time-1-line')
      .data(vis.lineChartData)
      .join('path')
      .attr('class', 'lap-time-1-line')
      .attr('stroke', (d) => colorScale(vis.yearAccessor(d)))
      .attr('d', (d) => line(d.values));

    // If in selection, raise points that may be covered by others
    vis.chart.selectAll('.lt1-selected')
      .raise();

    lt1Circles.on('click', (event, d) => {
      if (lt0lt1SelectedYears.includes(d.year)) {
        lt0lt1SelectedYears = lt0lt1SelectedYears.filter((year) => year !== d.year);
      } else {
        lt0lt1SelectedYears.push(d.year);
      }
      lapTime0.updateVis();
      lapTime1.updateVis();
    });

    lt1Circles.on('mouseover', (event, d) => {
      lt1Circles.attr('cursor', 'pointer');
      d3.select('#tooltip')
        .style('opacity', 1)
        .html((`
            <div class="tooltip-label">
                <div class="tooltip-title">Laptime at ${d.circuitName} for ${d.year}</div>
                ${d.bestLapTime}
            </div>
           `));
    })
      .on('mouseleave', () => {
        d3.select('#tooltip')
          .style('opacity', 0);
      })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', `${event.pageX + vis.config.tooltipPadding}px`)
          .style('top', `${event.pageY + vis.config.tooltipPadding}px`);
      });

    vis.xAxisG
      .call(vis.xAxis)
      .selectAll('text')
      .attr('text-anchor', 'start')
      .attr('transform', 'translate(0, 5), rotate(45)');
    // .call((g) => g.select('.domain')
    //   .remove());

    vis.yAxisG
      .call(vis.yAxis);
    // .call((g) => g.select('.domain')
    //   .remove());
  }
}
