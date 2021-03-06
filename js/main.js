// TODO: Need to name these better
let mechanicalChangesSubOverview;
let mechanicalChangesDetailView;
let mechanicalChangesOverview;
let mechanicalChangesData;
let mechanicalChangesSelectedYears = [];
let sectorData;
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
  d3.json('data/filtered_sector_time.json'),
])
  .then((data) => {
    [circuitData, mechanicalChangesData, improvedMultiplier, trackData, sectorData] = data;

    sectorData.map((d) =>{
      d.sector1*=1000
      d.sector2*=1000
      d.sector3*=1000
    });

    // Create Mechanical Changes Overview: Linechart, Scatterplot, detail: Linecharts
    mechanicalChangesOverview = new MechanicalChangesOverview({ parentElement: '#mechanical-changes-main-overview' }, mechanicalChangesData.data);
    mechanicalChangesSubOverview = new MechanicalChangesSubOverview({ parentElement: '#mechanical-changes-overview' }, mechanicalChangesData.data);
    mechanicalChangesDetailView = new MechanicalChangesDetailView({ parentElement: '#mechanical-changes-detail-view' }, mechanicalChangesData.data);

    // Create LT0
    lapTime0 = new LapTime0({ parentElement: '#lap-time-0' }, improvedMultiplier);

    // Create LT1
    lapTime1 = new LapTime1({ parentElement: '#lap-time-1' }, circuitData);

    // Create LT2
    reatimeMap = new RealTimeLap({ parentElement: '#laptime2-reatimeLap' }, sectorData);
    barchart = new Barchart({ parentElement: '#lap-time-2-barchart' }, sectorData, reatimeMap);
  })
  // eslint-disable-next-line no-console
  .catch((error) => console.error(error));
