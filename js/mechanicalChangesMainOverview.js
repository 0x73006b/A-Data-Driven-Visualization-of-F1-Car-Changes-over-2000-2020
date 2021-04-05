// TODO: implemented class should populate the scatterplot overview
// x-axis years; y-axis average power to weight ratio
// a line chart

// TODO: edit from Detailedview to get general linechart overview
// TODO: calculate average from the power-to-weight ratio
// TODO: fix all comments

class MechanicalChangesMainOverview {
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

    // We want X-Axis and Y-Axis to stay consistent
    // accessor functions
    vis.xValue = (d) => d.year; // year
    vis.yValueBottom = (d) => d.powerToWeightRatio; // average power-to-weight ratio

    vis.xScale = d3.scaleLinear()
      .range([0, vis.width])
      .domain(d3.extent(vis.data, vis.xValue));

    vis.yScaleBottom = d3.scaleLinear()
      .range([vis.height, 0])
      .nice()
      .domain(d3.extent(vis.data, vis.yValueBottom));

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(5)
      .tickFormat(d3.format('d'));

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
      .attr('transform', `translate(0,${vis.height + 10})`);

    vis.yAxisBottomG = vis.chart.append('g')
      .attr('class', 'axis y-axis-bottom');

    // We need to make sure that the tracking area is on top of other chart elements
    vis.marks = vis.chart.append('g');

    // Fix title, labels -- needs one for derived hp:weight
    chartTitle(vis, 'Average Power-to-Weight ratio over the Years', 0);
    axisLabel(vis, true, 'Years', 0, 10);
    axisLabel(vis, false, 'Average-Power-to-Weight-Ration', 0, -150);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // TODO: Setup proper filter
    // Should have averaged power-to-weight by each year

    vis.processedData = d3.rollups(vis.data, (d) => {
      let cumulativeSum = 0;
      d.forEach((v) => {
        // for each year, get all the ptw. ratio and add it to cumulative sum
        cumulativeSum += v.powerToWeightRatio;
      });
      // average cumsum by amount of rounds, obtained through the length of that year's array
      const averagedRatio = cumulativeSum / d.length;
      // Currently rounded to 3 decimal places
      return parseFloat(averagedRatio.toFixed(3));
    }, (d) => d.year);
    console.log(vis.processedData);

    // accessors for the data
    vis.yearAccessor = (d) => d[0]; // x-axis accesor for rollup data
    vis.avgRatioAccessor = (d) => d[1]; // y-axis accesor for rollup data

    vis.renderVis();
  }

  renderVis() {
    const vis = this;

    // Add line path
    // eslint-disable-next-line no-unused-vars
    const powerWeightRatioLine = vis.marks.selectAll('.chart-line-pwr')
      .data([vis.processedData], (d) => d)
      .join('path')
      .attr('class', 'chart-line-pwr')
      .attr('fill', 'none')
      .attr('stroke', 'red');

    // TODO: how does merge work on transition?
    powerWeightRatioLine
      .merge(powerWeightRatioLine)
      .transition()
      .duration(1000)
      .ease(d3.easeSinOut)
      .attr('d', d3.line()
        // .curve(d3.curveNatural)
        .x((d) => vis.xScale(vis.yearAccessor(d)))
        .y((d) => vis.yScaleBottom(vis.avgRatioAccessor(d))));

    // eslint-disable-next-line no-unused-vars
    const powerWeightRatioCircle = vis.marks.selectAll('.point-pwr')
      .data(vis.processedData, (d) => d)
      .join('circle')
      .attr('class', 'point-pwr')
      .attr('r', 6)
      .attr('cy', (d) => vis.yScaleBottom(vis.avgRatioAccessor(d)))
      .attr('cx', (d) => vis.xScale(vis.yearAccessor(d)));

    powerWeightRatioCircle.merge(powerWeightRatioCircle)
      .transition()
      .duration(1000)
      .ease(d3.easeSinOut)
      .attr('fill-opacity', 0.5)
      .attr('fill', 'red');

    powerWeightRatioCircle.on('mouseover', (event, d) => {
      powerWeightRatioCircle.attr('cursor', 'pointer');
      d3.select('#tooltip')
        .style('opacity', 1)
        .html((`
            <div class="tooltip-label">
                ${d[0]}, ${d[1]}
            </div>
           `));
    })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', `${event.pageX + vis.config.tooltipPadding}px`)
          .style('top', `${event.pageY + vis.config.tooltipPadding}px`);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip')
          .style('left', `${0}px`)
          .style('top', `${0}px`)
          .style('opacity', 0);
      });

    // Update the axes
    this.drawAxis();
  }

  drawAxis() {
    const vis = this;
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisBottomG.call(vis.yAxisBottom);
  }
}