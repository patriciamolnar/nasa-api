window.addEventListener('DOMContentLoaded', function() {
    const dateSpan = document.getElementById('date');
    const neoTotal = document.getElementById('neo-total');
    const neoHazard = document.getElementById('neo-hazard');
    const neoBiggest = document.getElementById('neo-biggest');
    const neoFastest = document.getElementById('neo-fastest');
    const neoClosest = document.getElementById('neo-closest'); 
    const list = document.getElementById('list');

    //convert string to float
    const p = (str) => {
        return parseFloat(str);
    }

    //round number to 2 decimal places
    const f = (num) => {
        return num.toFixed(2);
    }

    //format number
    const n = (num) => {
        return Number(num).toLocaleString();
    }

    const appendData = (json, metric) => {
        console.log(json); 
        neoTotal.textContent = json.amount;

        //appent biggest/fastest/closest data
        if(metric === 'km') {
            filterSizeKm(json.asteroids);
        } else {
            filterSizeM(json.asteroids);
        }
        
        list.textContent = ''; 
        listAsteroids(json.asteroids, metric);
    }

    const filterSizeKm = (arr) => {
        let countHazard = 0; 
        let biggest = [0, 0], fastest = 0, closest = 0; 
        let nameBiggest = '', nameFastest = '', nameClosest = '';

        arr.forEach(neo => {
            //count hazardous NEOs
            if(neo.hazard == true) {
                ++countHazard;
            }

            //save biggest NEO
            const diameterMin = p(neo.diameter_km.estimated_diameter_min);
            const diameterMax = p(neo.diameter_km.estimated_diameter_max);
            
            if(diameterMin > biggest[0]) {
                biggest[0] = diameterMin;
                biggest[1] = diameterMax;
                nameBiggest = neo.name;
            }
            //save fastest NEO
            const kmh = p(neo.velocity.kilometers_per_hour)
            if(kmh > fastest) {
                fastest = kmh;
                nameFastest = neo.name;
            }
            //save closest NEO
            const distance = p(neo.miss_distance.kilometers);
            if(distance > closest) {
                closest = distance;
                nameClosest = neo.name;
            }
        }); 

        //if diameter smaller than a kilometer => convert to meters.
        let txt = 'kilometers';
        if(biggest[0] < 1) {
            biggest[0] *= 1000;
            biggest[1] *= 1000;
            txt = 'meters';
        } 

        //append to DOM
        neoHazard.textContent = countHazard; 
        neoBiggest.textContent = `Min Diameter: ${n(f(biggest[0]))}${txt},
        Max Diameter: ${n(biggest[1])}${txt}`;
        neoFastest.textContent = `${n(f(fastest))}km/h`;
        neoClosest.textContent = `${n(f(closest))}km away from Earth`;  
    }

    //get information in miles 
    const filterSizeM = (arr) => {
        let countHazard = 0; 
        let biggest = [0, 0], fastest = 0, closest = 0; 
        let nameBiggest = '', nameFastest = '', nameClosest = '';

        arr.forEach(neo => {
            //count hazardous NEOs
            if(neo.hazard == true) {
                ++countHazard;
            }

            //save biggest NEO
            const diameterMin = p(neo.diameter_m.estimated_diameter_min);
            const diameterMax = p(neo.diameter_m.estimated_diameter_max);
            
            if(diameterMin > biggest[0]) {
                biggest[0] = diameterMin;
                biggest[1] = diameterMax;
                nameBiggest = neo.name;
            }
            //save fastest NEO
            const velocity = p(neo.velocity.miles_per_hour)
            if(velocity > fastest) {
                fastest = velocity;
                nameFastest = neo.name;
            }
            //save closest NEO
            const distance = p(neo.miss_distance.miles);
            if(distance > closest) {
                closest = distance;
                nameClosest = neo.name;
            }
        }); 

        //if diameter smaller than a kilometer => convert to meters.
        let txt = 'miles';
        if(biggest[0] < 1) {
            biggest[0] *= 5280;
            biggest[1] *= 5280;
            txt = 'feet';
        } 

        //append to DOM
        neoHazard.textContent = countHazard; 
        neoBiggest.textContent = `Min Diameter: ${n(f(biggest[0]))}${txt},
        Max Diameter: ${n(biggest[1])}${txt}`;
        neoFastest.textContent = `${n(f(fastest))}m/h`;
        neoClosest.textContent = `${n(f(closest))}m away from Earth`; 
    }

    //list all NEOs
    const listAsteroids = (arr, metric) => {
        let metricFull; 
        if(metric === 'km') {
            metricFull = 'kilometers';
        } else {
            metricFull = 'miles';
        }

        arr.forEach(neo => {
            const listItem = document.createElement('div');
            listItem.classList.add('list-item');
            //name as link to documentation
            const name = document.createElement('a'); 
            name.setAttribute('href', neo.jpl_url);
            name.setAttribute('target', '_blank');
            name.textContent = neo.name;

            //hazard
            const hazard = document.createElement('p');
            let text;
            if(neo.hazard) {
                text = 'Yes';
            } else {
                text = 'No';
            }
            hazard.textContent = `Potentially hazardous: ${text}`;

            //miss distance 
            const miss = document.createElement('p');
            miss.textContent = `Missed Earth By: ${n(f(p(neo.miss_distance[metricFull])))}${metric}`;

            //relative velocity
            const velocity = document.createElement('p');

            // this will not work with miles => solve it
            const velocityProp = [
                `${metricFull}_per_hour`, 
                `${metricFull}_per_second`
            ]

            // generate miles per second
            if(metric !== 'km') {
                velocityProp[1] = velocityProp[0]/3600;
            }

            velocity.textContent = `
            Relative Velocity: ${n(f(p(neo.velocity[velocityProp[0]])))}${metric}/h - 
            That is: ${n(f(p(neo.velocity[velocityProp[1]])))}${metric}/s`; 

            //size 
            const size = document.createElement('p');
            sizeProp = [
                `diameter_${metric}`,
                `diameter_${metric}`
            ]
            const min = p(neo[sizeProp[0]].estimated_diameter_min);
            const max = p(neo[sizeProp[1]].estimated_diameter_max);
            size.textContent = `
            Min Diameter: ${n(f(min))}${metric} 
            - Max Diameter: ${n(f(max))}${metric}`;

            //absolute magnitude
            const absMagn = document.createElement('p');
            absMagn.textContent = `Absolute Magnitude (H): ${n(f(p(neo.abs_magnitude)))}`;

            //append neo details to DOM
            listItem.append(name, hazard, miss, velocity, size,absMagn);
            list.appendChild(listItem);
        });         
    }

    //create date based on milliseconds
    const createDate = (timestamp) => {
        const gmt = new Date(timestamp);
        const year = gmt.getFullYear();
        const month = gmt.getMonth() + 1; 
        const day = gmt.getDate();
        return `${year}-${month}-${day}`;
    }

    //query API directly with date string
    const fetchApi = (query, metric) => {
        //call API with specified query
        fetch('/api/' + query)
            .then(response => response.json())
            .then(data => appendData(data, metric));

        //append date to DOM
        dateSpan.textContent = query;
    }

    // when page loads query database with today's date. 
    let current = Date.now();
    let metric = 'km'
    fetchApi(createDate(current), metric); 

    //load next day 
    const next = document.getElementById('next'); 
    next.addEventListener('click', () => {
        current += 8.64e+7;
        fetchApi(createDate(current), metric); 
    });

    //load previous day
    const prev = document.getElementById('prev'); 
    prev.addEventListener('click', () => {
        current -= 8.64e+7;
        fetchApi(createDate(current), metric);
    });

     
    //move focus automatically to next element
    const focusNextEle = (ele) => {
        ele.nextElementSibling.focus(); 
    }

    const checkInputLength = (ele) => {
        const length = parseInt(ele.getAttribute('maxlength')); 
        if(ele.value.length === length) {
            focusNextEle(ele);
        }
    } 

    const inputFields = document.querySelectorAll('.search-form > input'); 
    inputFields.forEach(input => {
        input.addEventListener('keyup', e => checkInputLength(e.target));
    });

    //send specific date query to API
    const year = document.getElementById('search-year');
    const month = document.getElementById('search-month');
    const day = document.getElementById('search-day');

    const searchBtn = document.getElementById('search-btn'); 
    searchBtn.addEventListener('click', function() {
        let input = `${year.value}-${month.value}-${day.value}`;
        current = new Date(year.value, month.value - 1, day.value).getTime();
        fetchApi(input, metric);
    }); 
    
    //let user change the preferred metric unit 
    const metricSelect = document.getElementById('metric'); 
    metricSelect.addEventListener('change', () => {
        metric = metricSelect.value; 
        fetchApi(createDate(current), metric);
    });
});