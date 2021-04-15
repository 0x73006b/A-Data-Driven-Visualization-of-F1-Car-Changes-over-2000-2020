// eslint-disable-next-line no-unused-vars
class MechanicalChangesSubOverview {
  /**
   * Class constructor with initial configuration
   * @param {Object} _config
   * @param {Object[]} _data
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 500,
      tooltipPadding: 15,
      margin: {
        top: 180,
        right: 50,
        bottom: 40,
        left: 50,
      },
      legendWidth: 300,
      legendHeight: 50,
      legendRadius: 5,
    };
    this.data = _data;
    this.calculateLegendYPosition = (i, even) => (even ? 20 + (i / 2) * 15 : 18 + (Math.floor(i / 2)) * 15);
    this.initData();
  }

  initData() {
    const vis = this;
    // Specify accessor functions
    vis.xValue = (d) => d.power;
    vis.yValue = (d) => d.weight;
    vis.xValueJitter = (d) => d.jitterX;
    vis.yValueJitter = (d) => d.jitterY;

    vis.data.forEach((car, i) => vis.data[i].jitterY = (car.weight + (Math.random() * 5)));
    vis.data.forEach((car, i) => vis.data[i].jitterX = (car.power + (Math.random() * 5)));

    vis.initVis();
  }

  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    const vis = this;

    vis.keys = [
      'Arrows',
      'McLaren',
      'Sauber, BMW Sauber, Alfa Romeo',
      'Williams-Mercedes, Williams',
      'Benetton, Lotus F1, Renault',
      'Minardi, Toro Rosso, AlphaTauri',
      'Ferrari',
      'Toyota',
      'Super Aguri F1',
      'Jaguar, Red Bull Racing',
      'BAR, BAR-Honda, Honda, Brawn GP, Mercedes',
      'Team Lotus, Caterham',
      'Dallara, HRT',
      'Racing, Marussia, Manor',
      'Prost',
      'Jordan, Midland F1, Spyker/Force India, Force India, Racing Point',
      'Haas',
    ];

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    // for legend display colors
    vis.colorScaleMC = d3.scaleOrdinal()
      .domain(vis.keys)
      .range(['black', '#f8a947', '#900000', '#1a5aff', '#FFE368', '#193A5B', '#D40000', 'white',
        '#808080', '#4a5074', '#3fdbc8', '#1b7a37', '#D4AF37', '#f95c31', '#051773',
        '#f7a9d1', '#dddae8',
      ]);
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

    // Append X axis title (weight)
    // Append Y axis title (power)
    chartTitle(vis, 'Power-to-Weight of All F1 Cars from 2000 to 2020', 0, 0, 'start');
    axisLabel(vis, true, 'Power (HP)', -250, 10);
    axisLabel(vis, false, 'Weight (kg)', 0, -265);
    axisLabel(vis, true, '*Note: Points shifted for visiblity.', -250, -315)

    // legend
    vis.legend = vis.svg.append('g')
      .attr('transform', 'translate(-94, 10)')
      .attr('class', 'legendArea');
    vis.renderLegend();

    // Set the scale input domains
    vis.xScale.domain([d3.min(vis.data, vis.xValue), d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain([d3.min(vis.data, vis.yValue), d3.max(vis.data, vis.yValue)]);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    if (mechanicalChangesSelectedYears) {
      vis.filteredData = vis.data.filter((d) => mechanicalChangesSelectedYears.includes(d.year));
    } else {
      vis.marks.selectAll('.mech-overview-point')
        .remove();
      this.drawAxis();
    }
    // Specify accessor functions
    vis.xValue = (d) => d.power;
    vis.yValue = (d) => d.weight;
    vis.groupAccessor = (d) => d.group;

    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    const vis = this;

    // Add circles
    const circles = vis.chart.selectAll('.mech-overview-point')
      .data(vis.filteredData, (d) => d)
      .join('circle')
      .attr('class', 'mech-overview-point')
      .attr('r', 5)
      .attr('cy', (d) => vis.yScale(vis.yValueJitter(d)))
      .attr('cx', (d) => vis.xScale(vis.xValueJitter(d)))
      .attr('fill', (d) => d.color)
      .attr('opacity', (d) => { if (d.group === mechanicalChangesSelectedGroup) { return 1; } return 0.35; });

    // Detail View Selector
    circles.on('click', (e, d) => {
      if (mechanicalChangesSelectedGroup === d.group) {
        mechanicalChangesSelectedGroup = null;
      } else {
        mechanicalChangesSelectedGroup = d.group;
      }
      mechanicalChangesSubOverview.updateVis();
      mechanicalChangesDetailView.updateVis();
    });

    circles.on('mouseover', (event, d) => {
      circles.attr('cursor', 'pointer');
      d3.select('#tooltip')
        .style('opacity', 1)
        .html((`
            <div class="tooltip-label">
                <div class="tooltip-title">${d.car}</div>
                Season: ${d.year}
                <div><i>Power: ${d.power.toFixed(0)} HP, Weight: ${d.weight.toFixed(0)} KG</i></div>
                Power to Weight Ratio: ${parseFloat(d.powerToWeightRatio).toFixed(2)} <br/>
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

  renderLegend() {
    const vis = this;

    const legendArea = vis.legend.selectAll('.legendArea')
      .data(vis.keys)
      .append('g')
      .attr('height', vis.config.legendHeight)
      .attr('width', vis.config.legendWidth);

    const legendAreaCircles = legendArea
      .data(vis.keys)
      .join('circle')
      .attr('class', 'legend-dots')
      .attr('cx', (d, i) => {
        if (i % 2 === 0) {
        // if even index
          return 100;
        }
        // odd case
        return 100 + vis.config.legendWidth - 20;
      })
      .attr('cy', (d, i) => {
        if (i % 2 === 0) {
        // if even index
          return vis.calculateLegendYPosition(i, 1);
        }

        // item 2 and 4 = index 1,3
        // floor makes the index 0, 1
        return vis.calculateLegendYPosition(i);
      })
      .attr('r', vis.config.legendRadius)
      .style('stroke', 'black')
      .style('stroke-width', '0.5')
      .style('fill', (d) => vis.colorScaleMC(d));

    const legendAreaText = legendArea
      .data(vis.keys)
      .join('text')
      .attr('class', 'legend-text')
      .attr('x', (d, i) => {
        if (i % 2 === 0) {
          // if even index
          return 110;
        }
        return 110 + vis.config.legendWidth - 20;
      })
      .attr('y', (d, i) => {
        if (i % 2 === 0) {
          // if even index
          return 22 + (i / 2) * 15;
        }

        // item 2 and 4 = index 1,3
        // floor makes the index 0, 1
        return 22 + (Math.floor(i / 2)) * 15;
      })
      .text((d) => d)
      .attr('font-size', 13)
      // .style('font-weight', 'bold');
  }
}
