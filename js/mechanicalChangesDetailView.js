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
        top: 60,
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
      .tickPadding(5);

    vis.yAxisBottom = d3.axisLeft(vis.yScaleBottom)
      .ticks(4)
      .tickSizeOuter(0)
      .tickPadding(5);

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

    // Append y-axis groups
    vis.yAxisTopG = vis.chart.append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', 'translate(0, -20)');

    vis.yAxisBottomG = vis.chart.append('g')
      .attr('class', 'axis y-axis-bottom')
      .attr('transform', `translate(0, ${vis.halfHeight + 10})`);

    // We need to make sure that the tracking area is on top of other chart elements
    vis.marks = vis.chart.append('g');

    chartTitle(vis, 'Power Progression for Selected Constructor', 0, 10, 'start');
    chartTitle(vis, 'Pwr:Weight Progression for Selected Constructor', 0, 170, 'start');
    axisLabel(vis, true, 'Years', 0, 10);
    axisLabel(vis, false, 'Power', 0, -65);
    axisLabel(vis, false, 'Power-to-Weight', 0, -220);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

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
      .attr('stroke', 'black')
      .attr('stroke-width', 3);

    // TODO: how does merge work on transition?
    horsePowerLine
      .merge(horsePowerLine)
      .transition()
      .duration(1000)
      .ease(d3.easeSinOut)
      .attr('d', d3.line()
        // .curve(d3.curveNatural)
        .x((d) => vis.xScale(vis.xValue(d)))
        .y((d) => vis.yScaleTop(vis.yValueTop(d)) - 20));

    // eslint-disable-next-line no-unused-vars
    // todo: if 2014 exists in next selection, update THAT one
    // make d3 know each circle is unique based on what year/data
    // make it select just the update, then it transitions to new position
    const horsePowerCircle = vis.marks.selectAll('.point-hp')
      .data(vis.filteredData)
      .join('circle')
      .attr('class', 'point-hp')
      .attr('r', 4)
      .attr('cy', (d) => vis.yScaleTop(vis.yValueTop(d)) - 20)
      .attr('cx', (d) => vis.xScale(vis.xValue(d)));

    horsePowerCircle.merge(horsePowerCircle)
      .transition()
      .duration(1000)
      .ease(d3.easeSinOut)
      .attr('fill-opacity', 1)
      .attr('fill', 'black');

    // eslint-disable-next-line no-unused-vars
    horsePowerCircle.on('mouseover', (event, d) => {
      d3.select('#tooltip')
        .style('opacity', 1)
        .html((`

            <div class="tooltip-label">
                <div class="tooltip-title">${d.car}</div>
                Season: ${d.year}
                <div><i>${d.power}, ${d.weight}</i></div>
                PWR:WEIGHT: ${parseFloat(d.powerToWeightRatio).toFixed(2)} <br/>
            </div>
           `));
    })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', `${event.pageX + vis.config.tooltipPadding}px`)
          .style('top', `${event.pageY + vis.config.tooltipPadding}px`);
      })
      .on('mouseleave', () => {
        clearTooltip();
      });

    // Add line path
    // eslint-disable-next-line no-unused-vars
    const powerWeightRatioLine = vis.marks.selectAll('.chart-line-pwr')
      .data([vis.filteredData])
      .join('path')
      .attr('class', 'chart-line-pwr')
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 3);

    // TODO: how does merge work on transition?
    powerWeightRatioLine
      .merge(powerWeightRatioLine)
      .transition()
      .duration(1000)
      .ease(d3.easeSinOut)
      .attr('d', d3.line()
        // .curve(d3.curveNatural)
        .x((d) => vis.xScale(vis.xValue(d)))
        .y((d) => vis.yScaleBottom(vis.yValueBottom(d)) + vis.halfHeight + 10));

    // eslint-disable-next-line no-unused-vars
    const powerWeightRatioCircle = vis.marks.selectAll('.point-pwr')
      .data(vis.filteredData, (d) => d)
      .join('circle')
      .attr('class', 'point-pwr')
      .attr('r', 4)
      .attr('transform', `translate(0, ${vis.halfHeight})`)
      .attr('cy', (d) => vis.yScaleBottom(vis.yValueBottom(d)) + 10)
      .attr('cx', (d) => vis.xScale(vis.xValue(d)));

    powerWeightRatioCircle.merge(powerWeightRatioCircle)
      .transition()
      .duration(1000)
      .ease(d3.easeSinOut)
      .attr('fill-opacity', 1)
      .attr('fill', 'black');

    powerWeightRatioCircle.on('mouseover', (event, d) => {
      powerWeightRatioCircle.attr('cursor', 'pointer');
      d3.select('#tooltip')
        .style('opacity', 1)
        .html((`
        <div class="tooltip-label">
            <div class="tooltip-title">${d.car}</div>
            Season: ${d.year}
            <div><i>${d.power}, ${d.weight}</i></div>
            PWR:WEIGHT: ${parseFloat(d.powerToWeightRatio).toFixed(2)} <br/>
        </div>
       `));
    })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', `${event.pageX + vis.config.tooltipPadding}px`)
          .style('top', `${event.pageY + vis.config.tooltipPadding}px`);
      })
      .on('mouseleave', () => {
        clearTooltip();
      });

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
