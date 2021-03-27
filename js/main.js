let mechanicalChanges;
let mechanicalChangesData;
// TODO: Remove the eslint disables once ready
let lapTime0;
// eslint-disable-next-line no-unused-vars
let lapTime1;
let circuitData;

// TODO: Setup charts here
Promise.all([
  d3.json('data/Filtered Merged Circuit.json'),
  d3.json('data/car_data.json'),
])
  .then((data) => {
    // TODO: Remove eslint disable once utilized
    // eslint-disable-next-line no-unused-vars
    [circuitData, mechanicalChangesData] = data;

    // Create Mechanical Changes Scatterplot
    // eslint-disable-next-line no-unused-vars
    mechanicalChanges = new ScatterPlot({ parentElement: '#mechanical-changes' }, mechanicalChangesData.data);

    // Create LT0 Linegraph
    // eslint-disable-next-line no-unused-vars
    // Todo: data need to change to data here instead of circuit only to include tooltip information
    lapTime0 = new LapTime0({ parentElement: '#lap-time0' }, circuitData);
    lapTime0.updateVis();
  })
  // eslint-disable-next-line no-console
  .catch((error) => console.error(error));
