// Rounded distances based on Justin Alexander's work here:
// https://thealexandrian.net/wordpress/45138/roleplaying-games/icewind-dale-travel-times
const graph = {
    'br': {'tg': 2},
    'bs': {'tg': 2, 'ew': 9},
    'cd': {'ew': 7.5, 'ck': 4.5},
    'ck': {'cd': 4.5},
    'dh': {'gm': 4.5},
    'eh': {'ew': 5},
    'gm': {'ew': 4, 'dh': 4.5},
    'lw': {'tm': 1.5},
    'tg': {'br': 2, 'tm': 9.5, 'bs': 3},
    'tm': {'tg': 9.5, 'lw': 1.5},
    'ew': {'bs': 9, 'gm': 4, 'cd': 7.5, 'eh': 5},
}

travelMod = {
    'foot': { 'road': 2, 'snow': 0.25, 'mnt': 0.125 },
    'shoe': { 'road': 2, 'snow': 0.5, 'mnt': 0.25 },
    'sled': { 'road': 4, 'snow': 1, 'mnt': 0.5 },
    'beak': { 'road': 2, 'snow': 1, 'mnt': 0.5 },
}

paceMod = {
    'slow': [0.125, 0.25, 0.5, 1, 2],
    'normal': [0.25, 0.5, 1, 2, 4],
    'fast': [0.5, 1, 1.5, 3, 6],
}

const unitsElem = document.querySelectorAll("input[name='units']");
const townSelect = document.querySelectorAll('.town-select');
const travelDistance = document.querySelector('#distance');
const travelSpeed = document.querySelector('#speed');
const time = document.querySelector('#time');

// save current (raw) value and show value rounded to nearest unit (default 0.5)
function round(element, distance, unit=0.5) {
    element.setAttribute('data-raw', distance);
    return Math.ceil(parseFloat(distance) / unit) * unit;
 }
 
 function raw(element) {
    return element.getAttribute('data-raw') || element.value || 0;
 }

// miles to kilometers
const mi2km = function(mi) { return mi * 1.609344; }

// kilometers to miles
const km2mi = function(km) { return  km * 0.621371; }

const convertDistance = function(distance, convert_miles=false) {
    if (document.querySelector('input[name="units"]:checked').value === "km") {
        return mi2km(distance);
    } else if (convert_miles == true) {
        // speed is in miles, so can't assume we need to convert this!
        return km2mi(distance);
    }

    return distance;
}

// set distance field based on chosen unit type
const setDistance = function(distance) {
    // don't display infinity
    if (distance === "Infinity") { distance = 0 }
    travelDistance.value = round(travelDistance, distance);
}

// Get speed for current travel pace
const getPaceSpeed = function(distance) {
    let travelPace = document.querySelector("input[name='pace']:checked").value;

    // no need to convert if it's already normal
    if (travelPace === 'normal') return distance;

    // convert from normal pace to current pace
    let normalSpeed = Object.keys(paceMod['normal']).find(key => paceMod['normal'][key] === distance);
    let paceSpeed = paceMod[travelPace][normalSpeed];

    return paceSpeed;
}

// Calculate travel speed by method, terrain, and pace
const calculateSpeed = function(distance) {
    let method = document.querySelector('#method').value;
    let terrain = document.querySelector("input[name='terrain']:checked").value;
    
    // look up speed by method and terrain
    modSpeed = travelMod[method][terrain];
    // modify speed by current travel pace
    paceSpeed = getPaceSpeed(modSpeed);

    return paceSpeed;
}

const calculateTime = function (distance, rate) {
    return distance / rate;
}

// Update distance when unit type is changed
unitsElem.forEach(function(elem) {
    elem.addEventListener('change', (event) => {
        let rawDistance = raw(travelDistance);
        let convDistance = convertDistance(rawDistance, true);
        setDistance(convDistance);
    })
});

// Update distance based on towns selected
townSelect.forEach(function(elem) {
    elem.addEventListener('change', (event) => {
        let units = document.querySelector('input[name="units"]:checked').value

        // Calculate distance between towns
        let startNode = document.querySelector('#start-town').value;
        let endNode = document.querySelector('#ending-town').value;

        let distance = findShortestPath(graph, startNode, endNode).distance;
        let convDistance = convertDistance(distance);
        
        setDistance(convDistance);
    });
});

// calculate speed and time on form update
var form = document.querySelector('#travelCalc');
form.addEventListener('change', function() {
    let rawDistance = raw(travelDistance);
    
    let calcSpeed = calculateSpeed(rawDistance);
    let calcTime = calculateTime(rawDistance, calcSpeed);
    
    let convSpeed = convertDistance(calcSpeed);
    
    travelSpeed.value = round(travelSpeed, convSpeed, 0.125);
    time.value = round(time, calcTime);
});

