let mechanicalChangesScatterPlot;
// TODO: Need to name these better
let mechanicalChangesHorsePower;
let mechanicalChangesPowerWeightRatio;
let mechanicalChangesData;
let mechanicalChangesSelectedGroup = null;

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
    mechanicalChangesScatterPlot = new MechanicalChangesScatterPlot({
      parentElement: '#mechanical-changes-scatterplot',
    }, mechanicalChangesData.data);
    mechanicalChangesHorsePower = new MechanicalChangesHorsePower({
      parentElement: '#mechanical-changes-horsepower',
    },
    mechanicalChangesData.data);
    // mechanicalChangesPowerWeightRatio = new MechanicalChangesPowerWeight({
    //   parentElement: '#mechanical-changes-powerweight',
    // },
    // mechanicalChangesData.data);
  });
