// TODO: Need to name these better
let mechanicalChangesOverview;
let mechanicalChangesDetailView;
let mechanicalChangesData;
let mechanicalChangesSelectedGroup = null;
let lt0lt1SelectedYears = [];

let improvedMultiplier;

let lapTime0;
let lapTime1;
let pointsRemoved = false;
let circuitData;
let trackData;

Promise.all([
  d3.json('data/circuitData.json'),
  d3.json('data/car_data.json'),
  d3.json('data/lt0.json'),
  d3.json('data/circuitData_millis_nullFill_remDup.json'),
])
  .then((data) => {
    [circuitData, mechanicalChangesData, improvedMultiplier, trackData] = data;

    // converting lap time from minute:second.10*millis to millis

    // Create Mechanical Changes Scatterplot
    mechanicalChangesOverview = new MechanicalChangesOverview({ parentElement: '#mechanical-changes-overview' }, mechanicalChangesData.data);
    mechanicalChangesDetailView = new MechanicalChangesDetailView({ parentElement: '#mechanical-changes-detail-view' }, mechanicalChangesData.data);

    // Create LT0
    lapTime0 = new LapTime0({ parentElement: '#lap-time-0' }, improvedMultiplier);

    // Create LT1
    lapTime1 = new LapTime1({ parentElement: '#lap-time-1' }, circuitData);

    // Create LT2
    reatimeMap = new RealTimeLap({ parentElement: '#laptime2-reatimeLap' }, circuitData);
    barchart = new Barchart({ parentElement: '#lap-time-2-barchart' }, circuitData, reatimeMap);
  })
  // eslint-disable-next-line no-console
  .catch((error) => console.error(error));
