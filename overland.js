// Rounded distances based on Justin Alexanders work here:
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
    'foot': {
        'road': 2,
        'snow': 0.25,
        'mnt': 0.125,
    },
    'shoe': {
        'road': 2,
        'snow': 0.5,
        'mnt': 0.25,
    },
    'sled': {
        'road': 4,
        'snow': 1,
        'mnt': 0.5,
    },
    'beak': {
        'road': 2,
        'snow': 1,
        'mnt': 0.5,
    },
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
        // console.log('conv 2 km');
        return mi2km(distance);
    } else if (convert_miles == true) {
        // console.log('conv 2  mi');
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

// Distance times pace
const getPaceSpeed = function(distance) {
    let travelPace = document.querySelector("input[name='pace']:checked").value;

    if (travelPace === 'normal') return distance;

    let normalSpeed = Object.keys(paceMod['normal']).find(key => paceMod['normal'][key] === distance);
    let paceSpeed = paceMod[travelPace][normalSpeed];

    console.log('distance: ' + distance);
    console.log('travelPace: ' + travelPace);
    console.log('normalSpeed: ' + normalSpeed);
    console.log('paceSpeed: ' + paceSpeed);

    return paceSpeed;
}

// Calculate travel speed by method, terrain, and pace
const calculateSpeed = function(distance) {
    let method = document.querySelector('#method').value;
    let terrain = document.querySelector("input[name='terrain']:checked").value;
    
    console.log("method: " + method);
    console.log("terrain: " + terrain);
    
    modSpeed = travelMod[method][terrain];
    
    console.log("modSpeed: "+ modSpeed);
    paceSpeed = getPaceSpeed(modSpeed);

    console.log('pace speed: '+paceSpeed);

    return paceSpeed;
}

const calculateTime = function (distance, rate) {
    console.log('time distance: ' + distance);
    return distance / rate;
}

// update distance and speed when units are changed
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

travelDistance.addEventListener('onblur', function() {
    travelDistance.value = round(travelDistance);
});

travelDistance.addEventListener('onfocus', function() {
    travelDistance.value = raw(travelDistance);
})

// calculate speed and time on form update
var form = document.querySelector('#travelCalc');
form.addEventListener('change', function() {
    let distance = raw(travelDistance);
    console.log('raw travel distance: ' + distance);
    
    let rawSpeed = calculateSpeed(distance);
    let convSpeed = convertDistance(rawSpeed);

    travelSpeed.value = round(travelSpeed, convSpeed, 0.125);
    
    time.value = round(time, calculateTime(distance, raw(travelSpeed)));
});

