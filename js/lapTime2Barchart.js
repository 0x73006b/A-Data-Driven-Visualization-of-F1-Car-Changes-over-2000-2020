// Todo: Implement laptime 2 barchart
// x-axis: years, y-axis: best qualifying time in seconds
class Barchart {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _reatimeLap) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      // colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {
        top: 25, right: 20, bottom: 20, left: 40,
      },
    };
    this.data = _data;
    this.reatimeLap = _reatimeLap;
    this.dropDownReady = false;
    this.initVis();
    this.lt2SelectedYears = [];
  }

  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    const vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales and axes

    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    vis.xScale = d3.scaleBand()
      .range([0, vis.width])
      .paddingInner(0.2);

    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSizeOuter(0)
      .tickSize(0);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickFormat((x) => {
        const millis = (x % 1000);
        let sec = Math.floor(x / 1000);
        const minute = Math.floor(sec / 60);
        sec %= 60;
        return `${minute.toString()}:${sec.toString()}.${(millis / 10).toString()}`;
      })
      .ticks(6)
      .tickSizeOuter(0);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group 
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    // Append axis title
    vis.svg.append('text')
      .attr('class', 'axis-title')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '.71em')
      .text('Lap Time');
    vis.svg.append('text')
      .attr('class', 'axis-title')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '.71em')
      .text('Lap Time');

    vis.selectedTrack = '';

    vis.updateVis();
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    const vis = this;

    // prep data
    vis.circuitNames = Array.from(new Set(vis.data.map((d) => d.circuitName))).sort();
    vis.trackNames = vis.data.map((d) => [d.circuitName, d.circuitId]);
    vis.selectedTrackData = vis.data.filter((lt) => lt.circuitName === this.selectedTrack);
    vis.years = Array.from(vis.data.map((d) => d.year)).sort();

    // Specificy accessor functions
    vis.colorValue = (d) => d.key;
    vis.xValue = (d) => d.year;
    vis.yValue = (d) => d.laptimeMillis;

    // Set the scale input domains
    vis.xScale.domain(vis.years);
    vis.yScale.domain(
      [d3.min(vis.selectedTrackData, vis.yValue)
        - 1000, d3.max(vis.selectedTrackData, vis.yValue)],
    );
    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    const vis = this;

    vis.chart.selectAll('.circuiteName')
      .data(vis.selectedTrackData)
      .join('text')
      .attr('class', 'circuiteName')
      .text((d) => d.circuitName)
      // translate and rotate
      .attr('transform', `translate(${40},${-10})`);

    // Add rectangles
    vis.chart.selectAll('.bar')
      .data(vis.selectedTrackData, vis.yValue)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => vis.xScale(vis.xValue(d)))
      .attr('width', 35)
      .attr('height', (d) => vis.height - vis.yScale(vis.yValue(d)))
      .attr('y', (d) => vis.yScale(vis.yValue(d)))
      .attr('fill', () => '#800020')
      .attr('stroke', '#FF0000')
      .attr('stroke-width', (d) => {
        if (vis.lt2SelectedYears.includes(d.year)) {
          return '3';
        }
        return '0';
      })
      .on('click', (event, d) => {
        console.log(d)
        if (vis.lt2SelectedYears.includes(d.year)) {
          vis.lt2SelectedYears = vis.lt2SelectedYears.filter((year) => year !== d.year);
        } else {
          vis.lt2SelectedYears.push(d.year);
        }
        vis.updateVis();
      });

    // Update axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);

    // add the options to the button
    if (!vis.dropDownReady) {
      d3.select('#selectButton')
        .selectAll('myOptions')
        .data(vis.circuitNames)
        .join('option')
        .text((d) => d) // text showed in the menu
        .attr('value', (d) => d); // corresponding value returned by the button
      vis.dropDownReady = true;
    }

    // eslint-disable-next-line func-names
    d3.select('#selectButton').on('change', function () {
      // recover the option that has been chosen
      vis.selectedTrack = d3.select(this).property('value');
      // clear the selected years for new track
      vis.lt2SelectedYears = [];
      // run the updateChart function with this selected option
      vis.updateVis();
    });

    vis.reatimeLap.updateVis(vis.selectedTrack, -1);
  }
}
