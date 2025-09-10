//const Papa = require('papaparse');
//const fs = require('fs');

//const file = fs.readFileSync('sets.tsv', 'utf8');

const targetBand = "Grateful Dead";

function parseSetlists(data, bandName) {
  // Split by newlines into raw rows
  const rows = data.split("\n").map(r => r.trim()).map(r => r.replace(/\t/g, " ")).filter(r => r.length > 0);

  const setlists = [];
  let currentDate = null;
  let currentLocation = null;
  let collecting = false;
  let currentSongs = [];

  for (const row of rows) {
    // Check if the row starts with a date like YYYY/MM/DD
    const match = row.match(/^(\d{4}\/\d{2}\/\d{2})\s+(.+)$/);

    if (match) {
      const [, date, info] = match;

      // If we were collecting for a previous date, save it first
      if (collecting && currentDate) {
        setlists.push({ date: currentDate, location: currentLocation, songs: currentSongs });
      }
        if (info.includes(bandName)) {
          collecting = true;
          currentDate = date;
          currentLocation = info;
          currentSongs = [];
        } else {
          collecting = false;
          currentDate = null;
          currentLocation = null;
          currentSongs = [];
        }
      } else if (collecting && currentDate) {
        // It's a song line
        currentSongs.push(row);
      }
  }

  // Push the last setlist if still collecting
  if (collecting && currentDate) {
    setlists.push({ date: currentDate, location: currentLocation, songs: currentSongs });
  }

  return setlists;
}

//generate();

var currSet;
var currDate;

async function generate(){

  answered = 0;

  const scoreOutput = document.getElementById('score');
  scoreOutput.innerHTML = "";

    const response = await fetch('sets.tsv');
    const file = await response.text();

    const result = parseSetlists(file, targetBand);
        if (result.length === 0) {
            alert("Error loading setlist");
            return;
    }

    //const result = parseSetlists(file, targetBand);
    let rand = Math.floor(Math.random() * result.length);
    let randSet = result[rand];

    currSet = randSet;
    currDate = randSet.date;

    console.log(result[randSet]);
    
    displayHidden();
}

var max = 0;
var answered = 0;

function displayHidden(){
  const outputDiv = document.getElementById('output');  
  outputDiv.innerHTML = `<h2>Your Random Set:</h2><ol>` + currSet.songs.map(s => `<li>${s}</li>`).join('') + `</ol>`;

}

function displayReveal(pts, diff_days){
  //alert(pts + " " + diff_days);
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = `<h2>${currSet.date} - ${currSet.location}</h2><ol>` +currSet.songs.map(s => `<li>${s}</li>`).join('') +`</ol>`;
  
  const scoreOutput = document.getElementById('score');
  scoreOutput.innerHTML = "<br>" + pts + "% accurate, " + diff_days + " days apart from the actual set date!";

  const maxDiv = document.getElementById('max');
  maxDiv.innerHTML = "High score: " + max + "%";
}

async function enterGuess(){
    const input = document.getElementById("guess").value;
    
    if (answered == 0)
      calculateAnswer(input);
    else
      alert("Generate a new set and guess again.");
}


function calculateAnswer(input) {

    const year = input.slice(0, 4);
    const month = input.slice(5, 7);
    const day = input.slice(8, 10);
    
    const realYear = currDate.slice(0, 4);
    const realMonth = currDate.slice(5, 7);
    const realDay = currDate.slice(8, 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)){
      alert("Incorrect input format: follow YYYY/MM/DD format.");
      return;
    }

    let guessDate = new Date("" + month + "/" + day + "/" + year);
    let realDate = new Date("" + realMonth + "/" + realDay + "/" + realYear);

    let diff_time = realDate.getTime() - guessDate.getTime();

    let diff_days = Math.abs(Math.round(diff_time / (1000 * 3600 * 24)));
   
    let totalDays = 10775;
    const Dmax = totalDays / 2;

    //let pts = 0 - Math.pow(((1/half) * x), 2) + 100;

    const s = 100 * (1 - Math.pow (diff_days/ Dmax, 2));
    let pts = Math.round(s * 100) / 100;
    Math.round(pts);

    //alert(diff_days);

    if (diff_days >= Dmax)
      pts = 0;

    if (pts > max){
      max = pts;
    }

    displayReveal(pts, diff_days);
    answered = 1;


 
}
