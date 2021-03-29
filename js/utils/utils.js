/**
 * Take in lap time string in Minutes:Seconds:Milliseconds and convert it to milliseconds number.
 * @param d
 * @returns {number}
 */
// eslint-disable-next-line no-unused-vars
function getMillisecondsFromTimeString(d) {
  const minuteParsed = d.bestLapTime.split(':');
  const secondParsed = minuteParsed[1].split('.');
  const millis = secondParsed[1];
  return ((+minuteParsed[0] * 60 + (+secondParsed[0])) * 1000 + (+millis) * 10);
}

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
  // TODO: 1:0:0 should display as 1:00:00
  return `${minute.toString()}:${sec.toString().padStart(2, '0')}.${(millis / 10).toString()}`;
}

/**
 * Append chart title.
 * @param vis{Object} - passed in `this`, refers to whatever class that's passed in
 * @param title{string} - title of chart to append
 */
// eslint-disable-next-line no-unused-vars
function chartTitle(vis, title) {
  vis.svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', `${vis.width / 2}`)
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.75em')
    .text(title);
}

/**
 * // TODO: Fix place holders for Y Axis's {x,y}!
 * Append axis titles. Note that for Y axis, the x and y values are flipped.
 * @param vis {Object} - passed in `this`, refers to whatever class that's passed in
 * @param isX {boolean} - Boolean that determines if axisLabel is X (true) or Y (false)
 * @param title {string} - Title text
 */
// eslint-disable-next-line no-unused-vars
function axisLabel(vis, isX, title) {
  const x = isX ? vis.width / 2 : 20;
  const y = isX ? (vis.config.containerHeight - 20) : -150;
  const rotate = isX ? 0 : -90;
  return vis.svg.append('text')
    .attr('class', 'axis-title')
    .attr('x', `${isX ? x : y}`)
    .attr('y', `${isX ? y : x}`)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.75em')
    .attr('transform', `rotate(${rotate})`)
    .text(title);
}

/**
 * Make circles for a given visualization.
 * @param vis{Object} - A given visualization.
 * @param visData {Object[]} - The data to join on.
 * @param chartName {string} - Used for selectAll and class attr.
 * @param dataArray {[]} - Array of objects to check if class should also have 'selected'.
 * @param dataToCheck {Object} - The value that determines if class is regular, or selected as well.
 * @param yScaleAccessor{function} - Determines value to pass into visualization's yScale.
 * @param radius {number} - Circle's radius.
 * @returns {*}
 */
// eslint-disable-next-line no-unused-vars
function getCircles(vis, visData, chartName, dataArray, dataToCheck, yScaleAccessor, radius) {
  return vis.chart.selectAll(`.${chartName}-point`)
    .data(visData)
    .join('circle')
    .attr('class', (d) => (dataArray.includes(dataToCheck(d)) ? `${chartName}-point ${chartName}-selected` : `${chartName}-point`))
    .attr('r', () => (radius || 5))
    .attr('cy', (d) => vis.yScale(yScaleAccessor(d)))
    .attr('cx', (d) => vis.xScale(vis.xValue(d)));
}
