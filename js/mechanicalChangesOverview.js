// Todo: Implement mechanical change scatterplot;
// x-axis: Horsepower; y-axis: weight(kg)

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

  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    const vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
    vis.xScale = d3.scaleLinear()
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
      .tickPadding(10);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    // TODO: Append X axis title (weight)
    // TODO: Append Y axis title (power)

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // TODO: Remove this?
    // Filter data to show only points where the GDP is known
    vis.filteredData = vis.data;

    // Specify accessor functions
    vis.xValue = (d) => d.power;
    vis.yValue = (d) => d.weight;

    // Set the scale input domains
    vis.xScale.domain([d3.min(vis.filteredData, vis.xValue), d3.max(vis.filteredData, vis.xValue)]);
    vis.yScale.domain([d3.min(vis.filteredData, vis.yValue), d3.max(vis.filteredData, vis.yValue)]);

    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    const vis = this;

    // Add circles
    const circles = vis.chart.selectAll('.point')
      .data(vis.filteredData, (d) => d)
      .join('circle')
      .attr('class', 'point')
      .attr('r', 5)
      .attr('cy', (d) => vis.yScale(vis.yValue(d)))
      .attr('cx', (d) => vis.xScale(vis.xValue(d)))
      .attr('fill-opacity', 0.35)
      .attr('fill', (d) => (d.group === mechanicalChangesSelectedGroup ? 'green' : 'red'));
    // .attr('fill-opacity', d => isGenderSelected(d) ? 0.7 : 0.15)
    // .attr('fill', d => isPoliticianSelected(d) ? 'red' : '#444');
    // Tooltip event listeners

    // Detail View Selector
    circles.on('click', (e, d) => {
      if (mechanicalChangesSelectedGroup === d.group) {
        mechanicalChangesSelectedGroup = null;
      } else {
        mechanicalChangesSelectedGroup = d.group;
        // console.log(d.group);
      }
      mechanicalChangesOverview.updateVis();
      mechanicalChangesDetailView.updateVis();
      // mechanicalChangesPowerToWeight.updateVis();
    });

    // TODO: Make tool tip better
    circles.on('mouseover', (event, d) => {
      circles.attr('cursor', 'pointer');
      d3.select('#tooltip')
        .style('opacity', 1)
        .html((`
            <div class="tooltip-label">
                <div class="tooltip-title">${d.car}</div>
                Season: ${d.year}
                <div><i>${d.power}, ${d.weight}</i></div>
                PWR:WEIGHT: ${d.powerToWeightRatio} <br/>
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

    // Update the axes/gridlines
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
