const DASHED = true;
const NOT_DASHED = false;

// eslint-disable-next-line no-unused-vars
class LapTime1 {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      smallMultiplecontainerWidth: 300,
      smallMultiplecontainerHeight: 100,
      tooltipPadding: 15,
      containerWidth: 220,
      containerHeight: 95,
      margin: {
        top: 20, right: 15, bottom: 20, left: 15,
      },
    };
    this.data = _data;
    this.initData();
  }

  initData() {
    const vis = this;

    vis.yValue = (d) => d.laptimeMillis;
    vis.xValue = (d) => d.year;
    vis.keyValue = (d) => d.key;
    vis.yearAccessor = (d) => d.year;
    vis.circuitRef = (d) => (`svg.${d.value[0].circuitRef}`);

    vis.makeLine = d3.line()
      .defined((d) => (vis.yValue(d) ? 1 : 0))
      .x((d) => vis.xScale(vis.xValue(d)))
      .y((d) => vis.yScale(vis.yValue(d)))
      // .curve(d3.curveMonotoneX);

    // with null fill
    vis.tracks = trackData;

    // "valid" data only, NO null fill
    vis.tracksNoNull = Array.from(d3.group(vis.data, (d) => d.circuitName),
      ([key, value]) => ({ key, value }));

    this.initVis();
  }

  // Create the axes
  initVis() {
    const vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleLinear()
      .domain(d3.extent(vis.data, (d) => vis.xValue(d)))
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .domain([d3.min(vis.data, (d) => vis.yValue(d)), d3.max(vis.data, (d) => vis.yValue(d))])
      .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(3)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat((x) => x);

    // Initialize Y-Axis
    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(3)
      .tickSizeOuter(0)
      .tickPadding(0)
      .tickFormat((x) => getMinuteStringFromMillisecond(x));

    // set the x domain
    vis.xScale.domain(d3.extent(vis.data, (c) => c.year));
    vis.yScale.domain(d3.extent(vis.data, (c) => c.laptimeMillis));
    // group the vis.data

    vis.idSelected = d3.select('#lap-time-1');

    vis.svg = vis.idSelected.selectAll('svg');

    vis.chart = vis.svg
      .data(vis.tracks)
      .join((g) => g
        .append('div')
        .attr('class', 'small-multiple-div')
        .attr('width', vis.config.smallMultiplecontainerWidth)
        .attr('height', vis.config.smallMultiplecontainerHeight)
        .append('svg'))
      .attr('class', (d) => `lt1-chart ${d.value[0].circuitRef}`)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight)
      .attr('overflow', 'visible');
    vis.tracks.forEach((circuitGroup) => {
      const currentCircuit = vis.circuitRef(circuitGroup);
      const chart = d3.selectAll(currentCircuit);

      chart.append('text')
        .attr('class', 'small-multiple-title')
        .attr('id', (d) => `title-${d.key}`)
        .attr('text-anchor', 'start')
        .attr('y', 0)
        .attr('x', 0)
        .attr('font-size', 12)
        .text((d) => d.key)
        .style('fill', 'black');

      chart.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)

      // append y-axis
      d3.select(currentCircuit)
        .append('g')
        .call(vis.yAxis);

      // append x-axis
      d3.select(currentCircuit)
        .append('g')
        .attr('transform', `translate(0,${vis.height})`)
        .call(vis.xAxis);
    });

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // draws line with gaps where no data exists
    vis.tracks.forEach((circuitGroup) => {
      vis.renderVis(circuitGroup, NOT_DASHED);
    });

    // draws dashed line to show data gaps
    vis.tracksNoNull.forEach((circuitGroup) => {
      vis.renderVis(circuitGroup, DASHED);
      d3.selectAll(vis.circuitRef(circuitGroup)).selectAll('.lap-time-1-line-dashed').lower();
    });
  }

  renderVis(circuitGroup, isDashedLine) {
    const currentData = circuitGroup.value;
    const vis = this;
    const currentCircuit = vis.circuitRef(circuitGroup);
    const chart = d3.selectAll(currentCircuit);

    const line = chart
      .selectAll(`.lap-time-1-line${isDashedLine ? '-dashed' : ''}`)
      .data([currentData])
      .join('path')
      .attr('class', `lap-time-1-line${isDashedLine ? '-dashed' : ''}`)
      .attr('d', vis.makeLine);

    if (!isDashedLine) {
      const circles = chart.selectAll('.lt1-point')
        .data(line.data()[0].filter((d) => !!vis.yValue(d)))
        .join('circle')
        .attr('class', (d) => (
          lt0lt1SelectedYears.includes(vis.yearAccessor(d)) ? 'lt1-point lt1-selected' : 'lt1-point'))
        .attr('r', 2.5)
        .attr('cy', (d) => vis.yScale(vis.yValue(d)))
        .attr('cx', (d) => vis.xScale(vis.xValue(d)));

      circles.on('mouseover', (e, d) => {
        // console.log(d);
        circles.attr('cursor', 'pointer');
        d3.select('#tooltip')
          .style('opacity', 1)
          .html((`
            <div class="tooltip-label">
            ${d.year}
            </div>
           `));
      })
        .on('mouseleave', () => {
          d3.select('#tooltip')
            .style('opacity', 0)
            .html(clearTooltip());
        })
        .on('mousemove', (event) => {
          d3.select('#tooltip')
            .style('left', `${event.pageX + vis.config.margin.left}px`)
            .style('top', `${event.pageY + vis.config.margin.top}px`);
        });
    }
  }
}
