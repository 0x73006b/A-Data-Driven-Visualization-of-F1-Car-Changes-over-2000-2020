let mechanicalChanges;
let mechanicalChangesData;

// TODO: Remove the eslint disables once ready
// eslint-disable-next-line no-unused-vars
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
    mechanicalChanges = new ScatterPlot({ parentElement: '#mechanical-changes' }, mechanicalChangesData.data);
  
    // Create Laptime Plot 2
    barchart = new Barchart({parentElement: '#laptime2-barchart'}, circuitData);
  });

