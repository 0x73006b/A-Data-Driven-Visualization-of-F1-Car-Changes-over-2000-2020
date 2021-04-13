# A Data Driven Visualization of F1 Car Changes over 2000-2020

## High Level Code Explanation

Please note that quite literally EVERYTHING is heavily a work in progress -- we've left a bunch of TODOs to remind ourselves of what some of the major things we need to do are (if only github had smart commits like bitbucket/jira).

### Main
#### `main.js`:
Main "entry" file that contains the data loading, the chart instantiation and also some global vars that are used in at least 2 js files.

### Mechanical Changes
Mechanical changes takes in data from `car_data.json` (loaded in the `main.js` promise).

#### `mechanicalChangesOverview.js`:
This is the "main" scatterplot for mechanical changes -- it is given the title "Power-to-Weight of All F1 Cars from 2000 to 2020". Its x-axis is `power`, its y-axis `weight`.

The control flow is `initVis->updateVis->renderVis` and `updateVis->renderVis` when it needs to update.

It updates a global variable `mechanicalChangesSelectedGroup`, which is `{null|number}`. When it changes (registered through an `.on('click')` on a circle point) it'll call `updateVis` for the mechanical change charts.

#### `mechanicalChangesDetailView.js`
This is 2 stacked line charts that share an x-axis. The y-axes, in order, are `power` for "Power Progression for Selected Constructor, through the Years", and `powerToWeightRatio` for "Power-to-Weight Ratio Progression for Selected Constructor, through the Years". The x-axis is `years`. Because of the 2 y-axes, you will see that there are 2 of yScale and yAxis (differentiated by `Top` and `Bottom`).

In `updateVis`, we do 1 of 2 things:
1. If `mechanicalChangesSelectedGroup` variable, we update our "filteredData" and go to `renderVis`.
2. Otherwise, that means the `mechanicalChangesSelectedGroup` is null and we need to remove whatever lines that we have drawn (if any exist).

### LapTime0
#### `lapTime0.js`:
LT0 is a basic line chart with circle points. There is an interaction between LT0<->LT1 that is transferred between LT0 and LT1 through `lt0lt1SelectedYears`, which is an array of years (year is type `number`). There is also a clear and reset button that clear any selections on LT0 (and thus LT1) and reset brings back the default for LT0 (and eventually LT1 -- it's currently a bit buggy, probably just missing a single call).

The current averaging is not how it will be in the final release, we are currently still working on deriving the proper/accurate average.

### LapTime1
#### `lapTime1.js`:
LT1 is stacked/connected scatterplot. The control flow is pretty basic `initVis -> updateVis -> renderVis`, and the interesting thing in `updateVis` is that we make a filtered data arary for the line.

Currently the `processedData` variable is actually just `vis.data`, but the way we wrote our `getCircles` helper, it had to be `processedData`.

### LapTime2
#### `lapTime2Barchart.js`:

Whenever a track is selected in `dropdown menu` in `barchart`, it will update the `animation`

Only real new part is the `preprocessing`.
For the `dropdown menu`, we had an issue where the selecting a new track using the dropdown kept appending the track options again, so we used a variable `dropdownReady` to make sure we don't reappend options.

Whenever the `barchart` is updated, we update the `animation` as well.

#### `lapTime2AnimatedView.js`:

In `animated view`, it waits for `selectedTrack` that's given by `dropdown menu`. if nothing selected, then it tells user that nothing is selected. if something is selected then it tries to find a track's svg file stored locally based on the `circuitRef` as the file name. Once it's found it gets appended to the space/container preallocated in `index.html` and if it's not found, then it will go to the error condition, and it indicates selected track is not available.

#### The `startLap` function
we always draw out the circuit geometry as backgroud.
we only start the animation when the start lap button is pressed

once it's pressed, the mechanism behind the animation is that we break down the whole track into pieces, we have the transition and duration which is calculated from the fastest laptime -- the laptime in millisecond count is used for how long a lap takes.

how svg file is constructed:
when we found it on wiki, it had extra marks besides the actual path, e.g. where to pit/break, etc., so we deleted all of that in text editor and also changed id of the path to "track" for every file so d3 is able to selct it. We also scaled it using Adobe Illustrator as d3 scaling tools are not as robust and always scale from the origin.

### Utils
`utils.js`: This contains all of our shared utility/helper functions currently.
- `colorScale`: This is our color scale we use to color in our LT0 and LT1 points.
- `getMillisecondsFromTimeString()`: This takes a time string in the format `Minutes:Seconds:Milliseconds` and outputs a number (in milliseconds). This is called in main, to get milliseconds for `circuitData`.
- `getMinuteStringFromMillisecond()`: This does the opposite of above.
- `chartTitle()`: This is a helper to append chart titles, it makes it a tiny bit quicker/saves some lines.
- `axisLabel()`: This is a helper to append axis labels, it also saves some lines.
- `getCircles()`: This is a helper to create circle points in the charts that require it, currently it is only used in LT0 and LT1 due to how it has been coded.

## External Resources

* https://github.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-line-chart
    * Line chart reference
* https://bl.ocks.org/sebg/0cc55428f83eb52bdfad6f5692023b07
    * General guidance on multi series line chart — specifically their data keying and structure helped me figure out multi series line charts.
* https://sashamaps.net/docs/resources/20-colors/
    * Color palette taken from here
* https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    * SVG animation reference
* https://stackoverflow.com/questions/17498830/animate-svg-path-with-d3js
    * SVG animation reference
* Previous assignments (Shabab, Robert, Lydia)
* https://stackoverflow.com/questions/17722497/scroll-smoothly-to-specific-element-on-page
    * javascript for scrolling button
* https://stackoverflow.com/questions/42344395/how-to-control-the-scroll-speed-in-window-scrolltox-coord-y-coord
    * refining scroll behaviour



