let mechanicalChangesOverview;
// TODO: Need to name these better
let mechanicalChangesDetailView;
let mechanicalChangesPowerToWeight;
let mechanicalChangesData;
const mechanicalChangesSelectedGroup = null;

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

    // converting lap time from minute:second.10*millis to millis
    circuitData.map(d=>{
      var minuteParsed = d.bestLapTime.split(":")
      var secondParsed = minuteParsed[1].split(".")
      var millis = secondParsed[1]
      d.laptimeMillis=((+minuteParsed[0]*60+(+secondParsed[0]))*1000+(+millis)*10)
    })

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

    // Create Laptime Plot 2
    reatimeMap = new RealTimeLap({ parentElement: '#laptime2-reatimeLap' }, circuitData);
    barchart = new Barchart({ parentElement: '#laptime2-barchart' }, circuitData, reatimeMap);
  });
