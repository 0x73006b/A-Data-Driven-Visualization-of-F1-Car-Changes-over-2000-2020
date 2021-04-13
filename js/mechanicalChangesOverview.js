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
      legendWidth: 300,
      legendHeight: 100,
      legendRadius: 3,
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

    // for legend display colors
    vis.colorScaleMC = d3.scaleOrdinal()
      .domain([
        'group 0: Arrows',
        'group 1: McLaren',
        'group 2: Sauber, BMW Sauber, Alfa Romeo',
        'group 3: Williams-Mercedes, Williams',
        'group 4: Benetton, Lotus F1, Renault',
        'group 5: Minardi, Scuderia Toro Rosso, AlphaTauri',
        'group 6: Scuderia Ferrari',
        'group 7: Toyota',
        'group 8: Super Aguri F1',
        'group 9: Jaguar, Red Bull Racing',
        'group 10: British American Racing, BAR-Honda, Honda, Brawn GP, Mercedes',
        'group 11: Team Lotus, Caterham',
        'group 12: Dallara, HRT',
        'group 13: Virgin Racing, Marussia, Manor',
        'group 14: Prost',
        'group 15: Jordan Grand Prix, Midland F1 Racing,Spyker/Force India, Force India, Racing Point',
        'group 16: Haas',
      ])
      .range(['#f8a947', '#900000', '#1a5aff', '#FFE368', '#193A5B', '#D40000', 'white', '#808080', '#4a5074', '#3fdbc8',
        '#1b7a37', '#D4AF37', '#f95c31', '#051773', '#f7a9d1', '#f9f8fd',
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

    chartTitle(vis, 'Power-to-Weight of All F1 Cars from 2000 to 2020', 0);
    axisLabel(vis, true, 'Power', 0, 0);
    axisLabel(vis, false, 'Weight', 0, 0);

    // legend
    vis.legend = vis.svg.append('g')
      .attr('transform', 'translate(0, -20)');

    // Specify accessor functions
    vis.xValue = (d) => d.power;
    vis.yValue = (d) => d.weight;
    // Set the scale input domains
    vis.xScale.domain([d3.min(vis.data, vis.xValue), d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain([d3.min(vis.data, vis.yValue), d3.max(vis.data, vis.yValue)]);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // TODO: Remove this?
    // Filter data to show only points where the GDP is known
    // vis.filteredData = vis.data;

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
    // TODO: change
    vis.groupAccessor = (d) => d.group;

    vis.renderVis();
    vis.renderLegend();
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
      .attr('cy', (d) => vis.yScale(vis.yValue(d)))
      .attr('cx', (d) => vis.xScale(vis.xValue(d)))
      .attr('fill', (d) => {
        if (d.group === mechanicalChangesSelectedGroup) {
          return 'black';
        }
        return d.color;
      })
      .style('opacity', (d) => (d.group === mechanicalChangesSelectedGroup ? 1 : 0.8));
    // Detail View Selector
    circles.on('click', (e, d) => {
      if (mechanicalChangesSelectedGroup === d.group) {
        mechanicalChangesSelectedGroup = null;
      } else {
        mechanicalChangesSelectedGroup = d.group;
      }
      mechanicalChangesOverview.updateVis();
      mechanicalChangesDetailView.updateVis();
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
        d3.select('#tooltip')
          .style('opacity', 0)
          .html(clearTooltip());
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
    const keys = [
      'group 0: Arrows',
      'group 1: McLaren',
      'group 2: Sauber, BMW Sauber, Alfa Romeo',
      'group 3: Williams-Mercedes, Williams',
      'group 4: Benetton, Lotus F1, Renault',
      'group 5: Minardi, Scuderia Toro Rosso, AlphaTauri',
      'group 6: Scuderia Ferrari',
      'group 7: Toyota',
      'group 8: Super Aguri F1',
      'group 9: Jaguar, Red Bull Racing',
      'group 10: British American Racing, BAR-Honda, Honda, Brawn GP, Mercedes',
      'group 11: Team Lotus, Caterham',
      'group 12: Dallara, HRT',
      'group 13: Virgin Racing, Marussia, Manor',
      'group 14: Prost',
      'group 15: Jordan Grand Prix, Midland F1 Racing,Spyker/Force India, Force India, Racing Point',
      'group 16: Haas',

    ];

    const legendArea = vis.legend.selectAll('.legendArea')
      .data(keys)
      .append('g')
      .attr('class', 'legendArea')
      .attr('height', vis.config.legendHeight)
      .attr('width', vis.config.legendWidth);

    const legendAreaCircles = legendArea
      .data(keys)
      .join('circle')
      .attr('class', 'legend-dots')
      .attr('cx', (d, i) => {
        if (i % 2 === 0) {
        // if even index
          return 100;
        }
        // odd case
        return 100 + vis.config.legendWidth;
      })
      .attr('cy', (d, i) => {
        if (i % 2 === 0) {
        // if even index
          return 20 + (i / 2) * 25;
        }

        // item 2 and 4 = index 1,3
        // floor makes the index 0, 1
        return 20 + (Math.floor(i / 2)) * 25;
      })
      .attr('r', vis.config.legendRadius)
      .style('stroke', 'black')
      .style('stroke-width', '0.5')
      .style('fill', (d) => vis.colorScaleMC(d));

    const legendAreaText = legendArea
      .data(keys)
      .join('text')
      .attr('class', 'legend-text')
      .attr('x', (d, i) => {
        if (i % 2 === 0) {
          // if even index
          return 120;
        }
        return 120 + vis.config.legendWidth;
      })
      .attr('y', (d, i) => {
        if (i % 2 === 0) {
          // if even index
          return 25 + (i / 2) * 25;
        }

        // item 2 and 4 = index 1,3
        // floor makes the index 0, 1
        return 25 + (Math.floor(i / 2)) * 25;
      })
      .text((d) => d)
      .attr('font-size', 8);
  }
}
