// 0. Setup

//API keys
//TO DO: security risk
const AVKEY = 'L0BKG4QKIPG5VG94';
const IEXKEY = 'pk_acc8c0894c5f434b95bbbe6e769c4e87';

//Variables to store fetched data
let current; //stores currend USD price in CLP
let closed; //stores last day closed price in CLP
let marketChange; //stores current market change (intraday)

//Variables to store days (usefull to )
let today = new Date(); 
let yesterday = new Date();
//Those serves to call previous days if market was closed (weekends, holydays)
let yesterdayM1 = new Date();
let yesterdayM2 = new Date();
let yesterdayM3 = new Date();

//variables to do the math 
let currentShift;
let currentShiftPerc;
let totalImpact

// 1. Execution

//1.1. Initialize yesterday date (and backups for previous days)
yesterday.setDate(yesterday.getDate() - 1);
yesterdayM1.setDate(yesterdayM1.getDate() - 2);
yesterdayM2.setDate(yesterdayM2.getDate() - 3);
yesterdayM3.setDate(yesterdayM3.getDate() - 4);

// 1.2. Fetch data with functions (defined below, in 2). They update current, closed and marketChange
getcurrent()
  .then(() => getclosed())
  .then(() => getmarket())
  .then(() => {

    //Remove loading gifs
    document.getElementById('loading').style.display = 'none';
    document.getElementById('loading2').style.display = 'none';
    document.getElementById('loading3').style.display = 'none';
    
    //1.3. if SPY fetch is OK, then show market change
    if (typeof marketChange != 'undefined') {
      console.log('Variación mercado: ' + marketChange + '%');
      document.getElementById('mercmov').innerHTML = (roundToTwo(marketChange * 100) + '%');
    } else {
      console.log('Variación mercado: ' + 'No disponible');
      document.getElementById('mercmov').innerHTML = 'No disponible';
    }

    //1.4. if USD to CLP fetches are OK, then calc currentShift (and %) and show it
    let statusCurrent

    if ((typeof current != 'undefined') && (typeof closed != 'undefined')) {
      currentShift = current - closed;
      currentShiftPerc = currentShift / closed * 100;   

      console.log('Movimiento divisa: ' + currentShift + ' (' + currentShiftPerc + '%)');
      console.log('Valor actual: ' + current);
      console.log('Valor en que cerró ayer: ' + closed);
      document.getElementById('usdmov').innerHTML = (roundToTwo(currentShiftPerc) + '%');
    } else {
      console.log('Movimiento divisa: ' + 'No disponible');
      console.log('Valor actual: ' + 'No disponible');
      console.log('Valor en que cerró ayer: ' + 'No disponible');
      document.getElementById('usdmov').innerHTML = 'No disponible';
    }

    //1.5. if both steps were OK, then calc and show total impact
    if ((typeof marketChange != 'undefined') && (typeof currentShift == 'number')) {
      totalImpact = ((1 + marketChange) * (1 + currentShiftPerc / 100) - 1) * 100;
      console.log ('Impacto total: ' + totalImpact + '%');
      document.getElementById('impact').innerHTML = (roundToTwo(totalImpact) + '%');
    } else {
      console.log ('Impacto total: ' + 'No disponible');
      document.getElementById('impact').innerHTML = 'No disponible';
    }
  });

// 2. Main functions

// 2.1. fetch current USD to CLP exchange rate
async function getcurrent() {
  const response = await fetch('https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=CLP&apikey='+AVKEY);
  if (response.ok) {
    const fetchedJson = await response.json();
    if (fetchedJson["Realtime Currency Exchange Rate"] != undefined) {
      current = fetchedJson["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
    }
  }
};

// 2.2. fetch last day closed exchange rate
async function getclosed() {
  const response = await fetch('https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=USD&to_symbol=CLP&outputsize=compact&apikey='+AVKEY);
  if (response.ok) {
    const fetchedJson = await response.json();
    if (fetchedJson["Time Series FX (Daily)"] != undefined) {
      if (fetchedJson["Time Series FX (Daily)"][stringDate(yesterday)] != undefined) {
        closed = fetchedJson["Time Series FX (Daily)"][stringDate(yesterday)]["4. close"];
      } else if (fetchedJson["Time Series FX (Daily)"][stringDate(yesterdayM1)] != undefined) {
        closed = fetchedJson["Time Series FX (Daily)"][stringDate(yesterdayM1)]["4. close"];
      } else if (fetchedJson["Time Series FX (Daily)"][stringDate(yesterdayM2)] != undefined) {
        closed = fetchedJson["Time Series FX (Daily)"][stringDate(yesterdayM2)]["4. close"];
      } else if (fetchedJson["Time Series FX (Daily)"][stringDate(yesterdayM3)] != undefined) {
        closed = fetchedJson["Time Series FX (Daily)"][stringDate(yesterdayM3)]["4. close"];
      }
    }
  }
};

// 2.3. Fetch market change
async function getmarket() {
  const response = await fetch('https://cloud.iexapis.com/stable/stock/spy/quote?token='+IEXKEY);
  if (response.ok) {
    const fetchedJson = await response.json();
    //Show 0 if market isn't open yet
    marketChange = ((fetchedJson['latestTime'] == stringDateFull(yesterday)) ||
                   (fetchedJson['latestTime'] == stringDateFull(yesterdayM1)) ||
                   (fetchedJson['latestTime'] == stringDateFull(yesterdayM2)) ||
                   (fetchedJson['latestTime'] == stringDateFull(yesterdayM3)) ) ? 0 : fetchedJson['changePercent'];
  }
};

// 3. Aux functions

// 3.1. Returns date in format 2020-10-29 
function stringDate(date) {
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = date.getFullYear();

  return yyyy + '-' + mm + '-' + dd;
}

// 3.2. Returns date in format format October 29, 2020
function stringDateFull(date) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];
  
  let dd = String(date.getDate()).padStart(2, '0');
  let month = monthNames[date.getMonth()];
  let yyyy = date.getFullYear();

  return month + ' ' + dd + ', ' + yyyy;
}

// 3.3. Function for rounding numbers (2 decimals)
function roundToTwo(num) {    
  return +(Math.round(num + "e+2")  + "e-2");
}
