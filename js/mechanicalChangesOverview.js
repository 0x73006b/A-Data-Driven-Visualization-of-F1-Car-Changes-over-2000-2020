// eslint-disable-next-line no-unused-vars
class MechanicalChangesOverview {
  /**
   * Class constructor with initial configuration
   * @param {Object} _config
   * @param {Object[]} _data
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 450,
      tooltipPadding: 15,
      margin: {
        top: 20, right: 50, bottom: 40, left: 50,
      },
      legendWidth: 100,
      legendHeight: 40,
      legendRadius: 7,
    };
    this.data = _data;
    this.processedData = null;
    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // We want X-Axis and Y-Axis to stay consistent
    // accessor functions
    vis.xValue1 = (d) => d.year; // year
    vis.yValue1 = (d) => d.powerToWeightRatio; // average power-to-weight ratio

    vis.xScale = d3.scaleLinear()
      .range([0, vis.width])
      .domain(d3.extent(vis.data, vis.xValue1));

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0])
      .nice()

    // Create color scale for legend
    vis.colorScale = d3.scaleOrdinal()
      .domain(['selected', 'unselected'])
      .range(['red', 'black']);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(5)
      .tickFormat(d3.format('d'));

    vis.yAxisBottom = d3.axisLeft(vis.yScale)
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

    vis.yAxisBottomG = vis.chart.append('g')
      .attr('class', 'axis y-axis-bottom');

    // We need to make sure that the tracking area is on top of other chart elements
    vis.marks = vis.chart.append('g');

    // Fix title, labels -- needs one for derived hp:weight
    chartTitle(vis, 'Average Power-to-Weight ratio over the Years', 208.5, -2.5);
    axisLabel(vis, true, 'Years', -230, 10);
    axisLabel(vis, false, 'Average-Power-to-Weight-Ratio', 0, -170);

    // legend
    vis.legend = vis.svg.append('g')
      .attr('transform', 'translate(0, 30)')
      .attr('class', 'legendArea');
    renderUtilLegend(vis);

    vis.initData();
  }

  initData() {
    const vis = this;
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

    // setup yDomain after getting averaged pwr
    vis.yScale.domain([d3.min(vis.processedData, d=>d[1])*.9, d3.max(vis.processedData, d=>d[1])*1.10])

    vis.processedData = vis.processedData.sort();
    mechanicalChangesSelectedYears = [];
    // some sort of default years selected?
    // eslint-disable-next-line max-len
    mechanicalChangesSelectedYears.push(vis.processedData[d3.minIndex(vis.processedData, (d) => d[1])][0]);
    // eslint-disable-next-line max-len
    mechanicalChangesSelectedYears.push(vis.processedData[d3.maxIndex(vis.processedData, (d) => d[1])][0]);
    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // accessors for the data
    vis.xValue = (d) => d[0]; // x-axis accesor for rollup data
    vis.yValue = (d) => d[1]; // y-axis accesor for rollup data

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
      .attr('stroke', 'black')
      .attr('stroke-width', '3');

    // TODO: how does merge work on transition?
    powerWeightRatioLine
      .merge(powerWeightRatioLine)
      .attr('d', d3.line()
        // .curve(d3.curveNatural)
        .x((d) => vis.xScale(vis.xValue(d)))
        .y((d) => vis.yScale(vis.yValue(d))));

    const powerWeightRatioCircle = vis.chart.selectAll('.mc-main-overview-point')
      .data(vis.processedData)
      .join('circle')
      .attr('class', (d) => (mechanicalChangesSelectedYears.includes(vis.xValue(d)) ? 'mc-main-overview-point mc-main-overview-selected' : 'mc-main-overview-point'))
      .attr('id', (d) => `mc-main-overview-point-${vis.yValue(d)}-${vis.xValue(d)}`)
      .attr('r', () => 5)
      .attr('cy', (d) => vis.yScale(vis.yValue(d)))
      .attr('cx', (d) => vis.xScale(vis.xValue(d)))
      .attr('fill', (d) => {
        if (mechanicalChangesSelectedYears.includes(vis.xValue(d))) {
          return 'red';
        }
        return 'black';
      });

    powerWeightRatioCircle.on('mouseover', (event, d) => {
      powerWeightRatioCircle.attr('cursor', 'pointer');
      d3.select('#tooltip')
        .style('opacity', 1)
        .html((`
        <div class="tooltip-label">
            <div class="tooltip-title">Season ${d[0]}</div>
            Average Power to Weight Ratio: 
            ${d[1]} <br/>
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
      })
      .on('click', (event, d) => {
        if (mechanicalChangesSelectedYears.includes(d[0])) {
          // eslint-disable-next-line max-len
          mechanicalChangesSelectedYears = mechanicalChangesSelectedYears.filter((year) => year !== d[0]);
        } else {
          mechanicalChangesSelectedYears.push(d[0]);
        }
        mechanicalChangesOverview.updateVis();
        mechanicalChangesSubOverview.updateVis();
        mechanicalChangesDetailView.updateVis();
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
