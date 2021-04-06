// const colors = [
//   '#771155', '#AA4488', '#CC99BB', '#114477', '#4477AA', '#77AADD', '#117777',
//   '#44AAAA', '#77CCCC', '#117744', '#44AA77', '#88CCAA', '#777711', '#AAAA44',
//   '#DDDD77', '#774411', '#AA7744', '#DDAA77', '#771122', '#AA4455', '#DD7788'];
// TODO: Cite https://sashamaps.net/docs/resources/20-colors/ if we use this
const colors = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
  '#f58231', '#911eb4', '#46f0f0', '#f032e6',
  '#bcf60c', '#fabebe', '#008080', '#e6beff',
  '#9a6324', '#fffac8', '#800000', '#aaffc3',
  '#808000', '#ffd8b1', '#000075', '#808080',
  '#ffffff', '#000000'];

/**
 *
 */
// TODO: fix color by order rather than consistent color scale issue
const colorScale = d3.scaleOrdinal()
  .range(colors)
  .domain([2000, 2021]);

// color scale for mechanical changes Overview, by constructor group
// eslint-disable-next-line no-unused-vars
const colorScaleGroup = d3.scaleOrdinal()
  .range(colors)
  .domain([1, 16]);

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
  return `${minute.toString()}:${sec.toString().padStart(2, '0')}.${(millis / 10).toString()}`;
}

/**
 * Append chart title.
 * @param vis{Object} - passed in `this`, refers to whatever class that's passed in
 * @param title{string} - title of chart to append
 */
// eslint-disable-next-line no-unused-vars
function chartTitle(vis, title, yOffset) {
  vis.svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', `${vis.width / 2}`)
    .attr('y', 15 + yOffset)
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
function axisLabel(vis, isX, title, xOffset, yOffset) {
  const x = isX ? vis.width + 50 + xOffset : 10 + xOffset;
  const y = isX ? (vis.config.containerHeight - 10) + yOffset : -38 + yOffset;
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
 * @param chartName {string} - Used for selectAll and class attr.
 * @param dataArray {[]} - Array of objects to check if class should also have 'selected'.
 * @param radius {null|number} - Circle's radius.
 * @returns {*}
 */
// accessor is typically year, but can be group too (Mechanical changes)
// eslint-disable-next-line no-unused-vars
function getCircles(vis, chartName, dataArray, radius) {
  return vis.chart.selectAll(`.${chartName}-point`)
    .data(vis.processedData)
    .join('circle')
    .attr('class', (d) => (dataArray.includes(vis.yearAccessor(d)) ? `${chartName}-point ${chartName}-selected` : `${chartName}-point`))
    .attr('id', (d) => `${chartName}-point-${vis.yValue(d)}-${vis.xValue(d)}`)
    .attr('r', () => (radius || 5))
    .attr('cy', (d) => vis.yScale(vis.yValue(d)))
    .attr('cx', (d) => vis.xScale(vis.xValue(d)))
    .attr('fill', (d) => {
      if (dataArray.includes(vis.yearAccessor(d))) {
        return colorScale(vis.yearAccessor(d));
      }
      return '#8e8e8e';
    });
}
