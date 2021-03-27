let mechanicalChangesOverview;
// TODO: Need to name these better
let mechanicalChangesDetailView;
let mechanicalChangesData;
let mechanicalChangesSelectedGroup = null;

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
    mechanicalChangesOverview = new MechanicalChangesOverview({
      parentElement: '#mechanical-changes-overview',
    }, mechanicalChangesData.data);
    mechanicalChangesDetailView = new MechanicalChangesDetailView({
      parentElement: '#mechanical-changes-detail-view',
    },
    mechanicalChangesData.data);
    // mechanicalChangesPowerToWeight = new MechanicalChangesPowerToWeight({
    //   parentElement: '#mechanical-changes-powerweight',
    // },
    // mechanicalChangesData.data);

    lapTime0 = new LapTime0({ parentElement: '#lap-time-0' }, circuitData);
  })
  .catch((error) => console.error(error));
