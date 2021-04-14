/**
 * Convert millisecond Number to lap time string.
 * @param x {number}
 * @returns {string} Lap time string in Minutes:Seconds:Milliseconds
 */
// eslint-disable-next-line no-unused-vars
function getMinuteStringFromMillisecond(x) {
  const millis = (x % 1000);
  let sec = Math.floor(x / 1000);
  const minute = Math.floor(sec / 60);
  sec %= 60;
  return `${minute.toString()}:${sec.toString().padStart(2, '0')}.${(millis / 10).toString()}`;
}

/**
 * Append chart title.
 * @param vis{Object} - passed in `this`, refers to whatever class that's passed in
 * @param title{string} - title of chart to append
 */
// eslint-disable-next-line no-unused-vars
function chartTitle(vis, title, xOffset, yOffset, passedTextAnchor) {
  const xPosition = xOffset === null ? vis.width / 2 : xOffset;
  const textAnchor = passedTextAnchor === undefined ? 'middle' : passedTextAnchor;
  vis.svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', `${xPosition}`)
    .attr('y', 15 + yOffset)
    .attr('text-anchor', `${textAnchor}`)
    .attr('font-size', '0.75em')
    .text(title);
}

/**
 * Append axis titles. Note that for Y axis title, the x and y values are flipped.
 * @param vis {Object} - passed in `this`, refers to whatever class that's passed in
 * @param isX {boolean} - Boolean that determines if axisLabel is X (true) or Y (false)
 * @param title {string} - Title text
 */
// eslint-disable-next-line no-unused-vars
function axisLabel(vis, isX, title, xOffset, yOffset) {
  const x = isX ? vis.width + 50 + xOffset : 10 + xOffset;
  const y = isX ? (vis.config.containerHeight - 10) + yOffset : -38 + yOffset;
  const rotate = isX ? 0 : -90;
  return vis.svg.append('text')
    .attr('class', 'axis-title')
    .attr('x', `${isX ? x : y}`)
    .attr('y', `${isX ? y : x}`)
    .attr('transform', `rotate(${rotate})`)
    .text(title);
}

/**
 * Make circles for a given visualization.
 * @param vis{Object} - A given visualization.
 * @param chartName {string} - Used for selectAll and class attr.
 * @param dataArray {[]} - Array of objects to check if class should also have 'selected'.
 * @param radius {null|number} - Circle's radius.
 * @returns {*}
 */
// eslint-disable-next-line no-unused-vars
function getCircles(vis, chartName, dataArray, radius) {
  return vis.chart.selectAll(`.${chartName}-point`)
    .data(vis.processedData)
    .join('circle')
    .attr('class', (d) => (dataArray.includes(vis.yearAccessor(d)) ? `${chartName}-point ${chartName}-selected` : `${chartName}-point`))
    .attr('id', (d) => `${chartName}-point-${vis.yValue(d)}-${vis.xValue(d)}`)
    .attr('r', () => (radius || 5))
    .attr('cy', (d) => vis.yScale(vis.yValue(d)))
    .attr('cx', (d) => vis.xScale(vis.xValue(d)));
}

/**
 * Helper to clear tool tip of any string, etc.
 * @returns {string}
 */
// eslint-disable-next-line no-unused-vars
function clearTooltip() {
  d3.select('#tooltip')
    .style('opacity', 0)
    .style('left', 0)
    .html('<div class="tooltip-label"></div>');
}

/**
 * Helper to render legend.
 * @param vis{Object} - A given visualization.
 * @returns {*}
 */
// eslint-disable-next-line no-unused-vars
function renderUtilLegend(vis) {
  const keys = ['selected', 'unselected'];
  const legendArea = vis.legend.selectAll('.legendArea')
    .data(keys)
    .append('g')
    .attr('height', vis.config.legendHeight)
    .attr('width', vis.config.legendWidth);

  legendArea
    .data(keys)
    .join('circle')
    .attr('class', 'util-legend-dots')
    .attr('cx', (d, i) => 100 + i * vis.config.legendWidth)
    .attr('cy', 20)
    .attr('r', vis.config.legendRadius)
    .style('stroke', 'black')
    .style('stroke-width', '0.5')
    .style('fill', (d) => vis.colorScale(d));

  legendArea
    .data(keys)
    .join('text')
    .attr('class', 'legend-text')
    .attr('x', (d, i) => 110 + i * vis.config.legendWidth)
    .attr('y', 25)
    .text((d) => d)
    .attr('font-size', 15)
    .style('font-weight', 'bold');

  return legendArea;
}
