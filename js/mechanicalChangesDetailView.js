// X-Axis: Years
// Y-Axis: HP
// TODO: Ref 436 tutorial
// eslint-disable-next-line no-unused-vars
class MechanicalChangesDetailView {
  /**
   * Class constructor with initial configuration
   * @param {Object} _config
   * @param {Object[]} _data
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 350,
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
    vis.halfHeight = (vis.height / 2);

    // We want X-Axis and Y-Axis to stay consistent
    vis.xValue = (d) => d.year;
    vis.yValueTop = (d) => d.power;
    vis.yValueBottom = (d) => d.powerToWeightRatio;

    vis.xScale = d3.scaleLinear()
      .range([0, vis.width])
      .domain(d3.extent(vis.data, vis.xValue));

    vis.yScaleTop = d3.scaleLinear()
      .range([vis.halfHeight, 0])
      .nice()
      .domain(d3.extent(vis.data, vis.yValueTop));

    vis.yScaleBottom = d3.scaleLinear()
      .range([vis.halfHeight, 0])
      .nice()
      .domain(d3.extent(vis.data, vis.yValueBottom));

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(5)
      .tickFormat(d3.format('d'));

    vis.yAxisTop = d3.axisLeft(vis.yScaleTop)
      .ticks(4)
      .tickSizeOuter(0)
      .tickPadding(10);

    vis.yAxisBottom = d3.axisLeft(vis.yScaleBottom)
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

    // Append y-axis groups
    vis.yAxisTopG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    vis.yAxisBottomG = vis.chart.append('g')
      .attr('class', 'axis y-axis-bottom')
      .attr('transform', `translate(0, ${vis.halfHeight})`);

    // We need to make sure that the tracking area is on top of other chart elements
    vis.marks = vis.chart.append('g');
    // TODO: Axis titles

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // TODO: Setup proper filter
    if (mechanicalChangesSelectedGroup) {
      vis.filteredData = d3.filter(vis.data, (d) => d.group === mechanicalChangesSelectedGroup);
      vis.renderVis();
    } else {
      vis.marks.selectAll('.chart-line')
        .remove();
      vis.marks.selectAll('.point-hp')
        .remove();
      vis.marks.selectAll('.chart-line-pwr')
        .remove();
      vis.marks.selectAll('.point-pwr')
        .remove();
      this.drawAxis();
    }
  }

  renderVis() {
    const vis = this;

    // TODO: Refactor into helper function?
    // Add line path
    // eslint-disable-next-line no-unused-vars
    const horsePowerLine = vis.marks.selectAll('.chart-line')
      .data([vis.filteredData])
      .join('path')
      .attr('class', 'chart-line')
      .attr('fill', 'none')
      .attr('stroke', 'red');

    // TODO: how does merge work on transition?
    horsePowerLine
      .merge(horsePowerLine)
      .transition()
      .duration(1000)
      .ease(d3.easeSin)
      .attr('d', d3.line()
        // .curve(d3.curveNatural)
        .x((d) => vis.xScale(vis.xValue(d)))
        .y((d) => vis.yScaleTop(vis.yValueTop(d))));

    // eslint-disable-next-line no-unused-vars
    const horsePowerCircle = vis.marks.selectAll('.point-hp')
      .data(vis.filteredData, (d) => d)
      .join('circle')
      .attr('class', 'point-hp')
      .attr('r', 6);

    horsePowerCircle.merge(horsePowerCircle)
      .transition()
      .duration(1000)
      .ease(d3.easeExpOut)
      .attr('cy', (d) => vis.yScaleTop(vis.yValueTop(d)))
      .attr('cx', (d) => vis.xScale(vis.xValue(d)))
      .attr('fill-opacity', 0.5)
      .attr('fill', 'red');

    // Add line path
    // eslint-disable-next-line no-unused-vars
    const powerWeightRatioLine = vis.marks.selectAll('.chart-line-pwr')
      .data([vis.filteredData])
      .join('path')
      .attr('class', 'chart-line-pwr')
      .attr('fill', 'none')
      .attr('stroke', 'red');

    // TODO: how does merge work on transition?
    powerWeightRatioLine
      .merge(powerWeightRatioLine)
      .transition()
      .duration(1000)
      .ease(d3.easeSin)
      .attr('d', d3.line()
        // .curve(d3.curveNatural)
        .x((d) => vis.xScale(vis.xValue(d)))
        .y((d) => vis.yScaleBottom(vis.yValueBottom(d)) + vis.halfHeight));

    // eslint-disable-next-line no-unused-vars
    const powerWeightRatioCircle = vis.marks.selectAll('.point-pwr')
      .data(vis.filteredData, (d) => d)
      .join('circle')
      .attr('class', 'point-pwr')
      .attr('r', 6);

    powerWeightRatioCircle.merge(powerWeightRatioCircle)
      .transition()
      .duration(1000)
      .ease(d3.easeExpOut)
      .attr('cy', (d) => vis.yScaleBottom(vis.yValueBottom(d)))
      .attr('cx', (d) => vis.xScale(vis.xValue(d)))
      .attr('transform', `translate(0, ${vis.halfHeight})`)
      .attr('fill-opacity', 0.5)
      .attr('fill', 'red');

    // TODO: Tool tpi

    // Update the axes
    this.drawAxis();
  }

  drawAxis() {
    const vis = this;
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisTopG.call(vis.yAxisTop);
    vis.yAxisBottomG.call(vis.yAxisBottom);
  }
}
