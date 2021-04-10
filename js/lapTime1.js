// eslint-disable-next-line no-unused-vars
let counter = 0;

class LapTime1 {
  constructor(_config, _data) {
    // Set the sizing metrics
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 180,
      containerHeight: 180,
      tooltipPadding: 15,
      // eslint-disable-next-line no-unused-vars
      margin: {
        top: 15,
        right: 10,
        bottom: 40,
        left: 50,
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
      .ticks(5)
      .tickSizeOuter(0)
      .tickPadding(-5)
      .tickFormat((x) => getMinuteStringFromMillisecond(x));

    // set the x domain
    vis.xScale.domain(d3.extent(vis.data, (c) => c.year));
    vis.yScale.domain(d3.extent(vis.data, (c) => c.laptimeMillis));
    // group the vis.data
    vis.metrics = Array.from(d3.group(vis.data,
      (d) => d.circuitName),
    ([key, value]) => ({ key, value }));
    vis.metrics.forEach((track) => track.value.sort((a, b) => d3.ascending(a.year, b.year)));

    vis.svg = d3.select('#lap-time-1');

    vis.updateVis();
  }

  updateVis() {
    const vis = this;
    vis.svg = vis.svg.selectAll('svg');
    vis.chart = vis.svg.data(vis.metrics)
      .join('svg')
      .attr('class', (d) => d.value[0].circuitRef)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight)
      .style('padding-left', '15px')
  .append('g')
      // .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // loop over the vis.data and create the bars
    vis.metrics.forEach((circuitGroup) => {
      vis.renderVis(circuitGroup);
    });
  }

  renderVis(circuitGroup) {
    // console.log('hi');
    const currentData = circuitGroup.value;
    const vis = this;
    // select the right svg for this set of metrics
    const chart = d3.selectAll(`svg.${circuitGroup.value[0].circuitRef}`);

    const line = chart
      .selectAll('.lap-time-1-line')
      .data([currentData])
      .join('path')
      .attr('class', 'lap-time-1-line')
      .attr('d', d3.line()
        .x((d) => vis.xScale(vis.xValue(d)))
        .y((d) => vis.yScale(vis.yValue(d)))
        .curve(d3.curveMonotoneX));

    // console.log(line.data()[0])

    const circles = chart.selectAll('.lt1-point')
      .data(line.data()[0])
      .join('circle')
      .attr('class', (d) => (lt0lt1SelectedYears.includes(vis.yearAccessor(d)) ? 'lt1-point lt1-selected' : 'lt1-point'))
      .attr('r', 4)
      .attr('cy', (d) => vis.yScale(vis.yValue(d)))
      .attr('cx', (d) => vis.xScale(vis.xValue(d)))
      // .attr('fill', (d) => {
      //   if (lt0lt1SelectedYears.includes(vis.yearAccessor(d))) {
      //     return colorScale(vis.yearAccessor(d));
      //   }
      //   return '#8e8e8e';
      // });

    // console.log('lt1Circles', lt1Circles)

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
          .style('opacity', 0);
      })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', `${event.pageX + vis.config.margin.left}px`)
          .style('top', `${event.pageY + vis.config.margin.top}px`);
      });

    // call axis just on this SVG
    // kind of a hack
    if (counter < 35) {
      chart.append('text')
        .attr('text-anchor', 'start')
        .attr('y', 20)
        .attr('x', 0)
        .attr('font-size', 12)
        .text((d) => d.key)
        .style('fill', 'black');

      // console.log(counter);
      counter++;
      d3.select(`svg.${circuitGroup.value[0].circuitRef}`)
        .append('g')
        .call(vis.yAxis);

      d3.select(`svg.${circuitGroup.value[0].circuitRef}`)
        .append('g')
        .attr('transform', `translate(0,${vis.height})`)
        .call(vis.xAxis)
        // .selectAll('text')
        // .attr('font-size', 6)
        // .attr('text-anchor', 'start')
        // .attr('transform', 'translate(5, 5), rotate(45)');
    }
  }
}
