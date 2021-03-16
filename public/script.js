window.addEventListener('DOMContentLoaded', function() {
    const dateSpan = document.getElementById('date');
    const neoTotal = document.getElementById('neo-total');
    const neoHazard = document.getElementById('neo-hazard');
    const neoBiggest = document.getElementById('neo-biggest');
    const neoFastest = document.getElementById('neo-fastest');
    const neoClosest = document.getElementById('neo-closest'); 

    const appendData = (json, metric) => {
        console.log(json); 
        neoTotal.textContent = json.amount;

        if(metric === 'km') {
            filterSizeKm(json.asteroids);
        } else {
            filterSizeM(json.asteroids);
        }
        
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
            const diameterMin = parseFloat(neo.diameter.kilometers.estimated_diameter_min);
            const diameterMax = parseFloat(neo.diameter.kilometers.estimated_diameter_max);
            
            if(diameterMin > biggest[0]) {
                biggest[0] = diameterMin;
                biggest[1] = diameterMax;
                nameBiggest = neo.name;
            }
            //save fastest NEO
            const kmh = parseFloat(neo.approach[0].relative_velocity.kilometers_per_hour)
            if(kmh > fastest) {
                fastest = kmh;
                nameFastest = neo.name;
            }
            //save closest NEO
            const distance = parseFloat(neo.approach[0].miss_distance.kilometers);
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
        neoBiggest.textContent = `${Number(biggest[0].toFixed(2)).toLocaleString()} - ${Number(biggest[1].toFixed(2)).toLocaleString()} ${txt}`;
        neoFastest.textContent = `${Number(fastest.toFixed(2)).toLocaleString()}km/h`;
        neoClosest.textContent = `${Number(closest.toFixed(2)).toLocaleString()}km away from Earth`;  
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
            const diameterMin = parseFloat(neo.diameter.miles.estimated_diameter_min);
            const diameterMax = parseFloat(neo.diameter.miles.estimated_diameter_max);
            
            if(diameterMin > biggest[0]) {
                biggest[0] = diameterMin;
                biggest[1] = diameterMax;
                nameBiggest = neo.name;
            }
            //save fastest NEO
            const velocity = parseFloat(neo.approach[0].relative_velocity.miles_per_hour)
            if(velocity > fastest) {
                fastest = velocity;
                nameFastest = neo.name;
            }
            //save closest NEO
            const distance = parseFloat(neo.approach[0].miss_distance.miles);
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
        neoBiggest.textContent = `${Number(biggest[0].toFixed(2)).toLocaleString()} - ${Number(biggest[1].toFixed(2)).toLocaleString()} ${txt}`;
        neoFastest.textContent = `${Number(fastest.toFixed(2)).toLocaleString()}m/h`;
        neoClosest.textContent = `${Number(closest.toFixed(2)).toLocaleString()}m away from Earth`;  
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