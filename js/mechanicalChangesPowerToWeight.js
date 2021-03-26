// X-Axis: Years
// Y-Axis: HP
// TODO: Ref 436 tutorial
// eslint-disable-next-line no-unused-vars
class MechanicalChangesPowerToWeight {
  /**
   * Class constructor with initial configuration
   * @param {Object} _config
   * @param {Object[]} _data
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 500,
      containerHeight: 250,
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

  initVis() {
    const vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // We want X-Axis and Y-Axis to stay consistent
    vis.xValue = (d) => d.year;
    vis.yValue = (d) => d.powerToWeightRatio;

    vis.xScale = d3.scaleLinear()
      .range([0, vis.width])
      .domain(d3.extent(vis.data, vis.xValue));

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0])
      .nice();

    // Set the scale input domains
    vis.yScale.domain(d3.extent(vis.data, vis.yValue));

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(5)
      .tickFormat(d3.format('d'));

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(4)
      .tickSizeOuter(0)
      .tickPadding(10);

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
    // TODO: Axis titles

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // TODO: Setup proper filter
    if (mechanicalChangesSelectedGroup) {
      console.log('true block');
      vis.filteredData = d3.filter(vis.data, (d) => d.group === mechanicalChangesSelectedGroup);
      vis.renderVis();
    } else {
      console.log('false block');
      vis.marks.selectAll('.chart-line-pwr')
        .remove();
      vis.marks.selectAll('.point-pwr')
        .remove();
      this.drawAxis();
    }
  }

  renderVis() {
    const vis = this;

    // Add line path
    // eslint-disable-next-line no-unused-vars
    const chartLine = vis.marks.selectAll('.chart-line-pwr')
      .data([vis.filteredData])
      .join('path')
      .attr('class', 'chart-line-pwr')
      .attr('fill', 'none')
      .attr('stroke', 'red');

    // TODO: how does merge work on transition?
    chartLine
      .merge(chartLine)
      .transition()
      .duration(1000)
      .ease(d3.easeSin)
      .attr('d', d3.line()
        // .curve(d3.curveNatural)
        .x((d) => vis.xScale(vis.xValue(d)))
        .y((d) => vis.yScale(vis.yValue(d))));

    // eslint-disable-next-line no-unused-vars
    const circles = vis.marks.selectAll('.point-pwr')
      .data(vis.filteredData, (d) => d)
      .join('circle')
      .attr('class', 'point-pwr')
      .attr('r', 5);

    circles.merge(circles)
      .transition()
      .duration(1000)
      .ease(d3.easeExpOut)
      .attr('cy', (d) => vis.yScale(vis.yValue(d)))
      .attr('cx', (d) => vis.xScale(vis.xValue(d)))
      .attr('fill-opacity', 0.5)
      .attr('fill', 'red');
    // TODO: Add Tool tip

    // Update the axes
    this.drawAxis();
  }

  drawAxis() {
    const vis = this;
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}
