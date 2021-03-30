window.addEventListener('DOMContentLoaded', function() {
//PART 1: NEOs
    const dateSpan = document.getElementById('date');
    const neoTotal = document.getElementById('neo-total');
    const neoHazard = document.getElementById('neo-hazard');
    const neoBiggest = document.querySelector('.neo-biggest');
    const neoFastest = document.querySelector('.neo-fastest');
    const neoClosest = document.querySelector('.neo-closest'); 
    const list = document.getElementById('list');
    const loading = document.getElementById('loading');
    const main = document.querySelector('main');
    const errorDiv = document.getElementById('error');
    const apod = document.getElementById('apod');

    //convert string to float
    const p = (str) => {
        return parseFloat(str);
    }

    //round number to 2 decimal places
    const f = (num) => {
        return num.toFixed(2);
    }

    //format number with komas
    const n = (num) => {
        return Number(num).toLocaleString();
    }

    const handleError = (msg) => {
        errorDiv.style.display = 'block';
        errorDiv.textContent = msg;
    }

    const getMetric = (str) => {
        if(str === 'km') {
            return 'kilometers';
        } else {
            return 'miles';
        }
    }

    //create dynamic props based on users selection
    const getProps = (metric, metricFull) => {
        const object = {
            velocity: [
                `${metricFull}_per_hour`, 
                `${metricFull}_per_second`
            ], 
            size: `diameter_${metric}`
        }
        return object;
    }

    //create link of NEO name and JPL documentation
    const createLink = arr => {
        const link = document.createElement('a'); 
        link.setAttribute('href', arr[1]); 
        link.setAttribute('target', '_blank');
        link.textContent = arr[0];
        return link;
    }

    const showHideListItem = (ele) => {
        const parent = ele.parentElement;
        if(parent.classList.contains('appear')) {
            parent.classList.remove('appear');
            ele.textContent = '+';
        } else {
            parent.classList.add('appear');
            ele.textContent = '-';
        }
    }


    const appendData = (json, metric) => {
        loading.style.display = 'none';
        try {
            console.log(json); 
            if (json.amount === undefined) { //if no asteroids returned for date
                errorDiv.style.display = 'block';
                errorDiv.textContent = 'No NEOs spotted on the selected date.';
            } else {
                errorDiv.style.display = 'none';
                neoTotal.textContent = json.amount;
                filterSize(json.asteroids, metric);
                list.textContent = ''; 
                listAsteroids(json.asteroids, metric);
                main.style.display = 'block';
            }
        } catch(error) {
            handleError('An error occured - please try again.');
        }
    }

    const filterSize = (arr, metric) => {
        const metricFull = getMetric(metric);
        const props = getProps(metric, metricFull);

        let countHazard = 0; 
        let biggest = [0, 0], fastest = 0, closest = 0;  

        arr.forEach(neo => {
            //count hazardous NEOs
            if(neo.hazard == true) {
                ++countHazard;
            }

            //save biggest NEO
            const diameterMin = p(neo[props.size].estimated_diameter_min);
            const diameterMax = p(neo[props.size].estimated_diameter_max);
            
            if(diameterMin > biggest[0]) {
                biggest[0] = diameterMin;
                biggest[1] = diameterMax;
            }
            //save fastest NEO
            const velocity = p(neo.velocity[props.velocity[0]]);
            if(velocity > fastest) {
                fastest = velocity;
            }
            //save closest NEO
            const distance = p(neo.miss_distance[metricFull]);
            if(distance > closest) {
                closest = distance;
            }
        }); 

        //if diameter smaller than 1km/0.5m convert to smaller unit.
        let txt = metricFull;
        if(biggest[0] < 1 && metric === 'km') {
            biggest[0] *= 1000;
            biggest[1] *= 1000;
            txt = 'meters';
        } 

        if(biggest[0] < 0.5 && metric === 'm') {
            biggest[0] *= 2640;
            biggest[1] *= 2640;
            txt = 'feet';
        } 

        //append to DOM
        neoHazard.textContent = countHazard; 
        neoBiggest.innerHTML = `<span class="overview-info">${n(f(biggest[0]))}${txt}</span> 
        (minimum diameter) <span class="overview-info">${n(biggest[1])}${txt}</span>(maximum diameter)`;
        neoFastest.textContent = `${n(f(fastest))}${metric}/h`;
        neoClosest.innerHTML = `<span class="overview-info">${n(f(closest))}${metric}</span> away from Earth`;  
    }


    //list all NEOs
    const listAsteroids = (arr, metric) => {
        let metricFull = getMetric(metric); 
        const props = getProps(metric, metricFull);

        arr.forEach(neo => {
            const listItem = document.createElement('div');
            listItem.classList.add('list-item');
            //add button to show / hide more info
            const btn = document.createElement('button');
            btn.textContent = '+';
            btn.classList.add('list-item-button');
            btn.addEventListener('click', e => showHideListItem(e.target));
            //name as link to documentation
            const name = createLink([neo.name, neo.jpl_url]);

            //hazard
            const hazard = document.createElement('p');
            const hazardState = document.createElement('span');
            let text;
            if(neo.hazard) {
                text = 'Yes';
            } else {
                text = 'No';
            }
            hazard.textContent = 'Potentially hazardous: ';
            hazardState.textContent = text;
            hazard.append(hazardState);
            const className = `hazard-${text.toLowerCase()}`;
            hazardState.classList.add(className); 

            //miss distance 
            const miss = document.createElement('p');
            miss.textContent = `Missed Earth By: ${n(f(p(neo.miss_distance[metricFull])))}${metric}`;

            //relative velocity
            const velocityHour = n(f(p(neo.velocity[props.velocity[0]])));
            let velocitySecond = n(f(p(neo.velocity[props.velocity[1]])));

            //generate miles per second
            if(metric !== 'km') {
                velocitySecond = n(f(p(neo.velocity[props.velocity[0]])/3600));
            }

            const velocity = document.createElement('p');
            velocity.textContent = `
            Relative Velocity: ${velocityHour}${metric}/h - 
            That is: ${velocitySecond}${metric}/s`; 
           
            //size 
            const size = document.createElement('p');

            const min = p(neo[props.size].estimated_diameter_min);
            const max = p(neo[props.size].estimated_diameter_max);
            size.textContent = `
            Min Diameter: ${n(f(min))}${metric} 
            - Max Diameter: ${n(f(max))}${metric}`;

            //absolute magnitude
            const absMagn = document.createElement('p');
            absMagn.textContent = `Absolute Magnitude (H): ${n(f(p(neo.abs_magnitude)))}`;

            //append neo details to DOM
            listItem.append(btn, name, hazard, miss, velocity, size,absMagn);
            list.appendChild(listItem);
        });         
    }

    //create date based on milliseconds
    const createDate = (timestamp) => {
        const gmt = new Date(timestamp);
        const year = gmt.getFullYear();
        
        //ensuring that Jan - Sept are displayed as 01, 02, etc
        let month = gmt.getMonth() + 1; 
        if(month < 10) { 
            month = '0' + month; 
        }
        
        const day = gmt.getDate();
        return `${year}-${month}-${day}`;
    }

    //query API directly with date string
    const fetchApi = (query, metric) => {
        loading.style.display = 'block';
        main.style.display = 'none'; 
        fetch('/api/' + query)
            .then(response => response.json())
            .then(data => appendData(data, metric))
            .catch(error => console.log(error));

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

     
    //input fields: move focus automatically to next element
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
    const checkDate = (year, month, day) => {
        //check if entry can be converted into date
        const date = new Date(year, month-1, day);         
        if(date == 'Invalid Date') {
            handleError('Please enter a valid date'); 
            return false;
        }

        //ensure year contains 4 digits
        if(year.length !== 4) {
            handleError('Please enter a valid year'); 
            return false;
        }

        //month should be within 1 - 12
        if(month < 1 || month > 12) {
            handleError('Please enter a valid month'); 
            return false;
        }

        //check day 
        const m = parseInt(month);
        //months with 31 days
        if(m == 1 || m == 3 || m == 5 || m == 7 || m == 8 || m == 10 || m == 12) {
            if(day < 1 || day > 31) {
                handleError('Please enter a valid date'); 
                return false;
            }
        } else if (m === 2) { //february
            if(((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
                if(day < 1 || day > 29) { //if leap year
                    handleError('Please enter a valid date'); 
                    return false;
                }
            } else { //if not leap year
                if(day < 1 || day > 28) {
                    handleError(`Please enter a valid date.`); 
                    return false;
                }
            }
        } else { //months with 30 days
            if(day < 1 || day > 30) {
                handleError('Please enter a valid date'); 
                return false;
            }
        } 

        return true; 
    }

    const yearSearch = document.getElementById('search-year');
    const monthSearch = document.getElementById('search-month');
    const daySearch = document.getElementById('search-day');

    const searchBtn = document.getElementById('search-btn'); 
    searchBtn.addEventListener('click', function() {
        let year = yearSearch.value; 
        let month = monthSearch.value; 
        let day = daySearch.value; 
        if(checkDate(year, month, day)) {
            let input = `${year}-${month}-${day}`;
            current = new Date(year, month - 1, day).getTime();
            fetchApi(input, metric);
        }
    }); 
    
    //let user change the preferred metric unit 
    const metricSelect = document.getElementById('metric'); 
    metricSelect.addEventListener('change', () => {
        metric = metricSelect.value; 
        fetchApi(createDate(current), metric);
    });

//Part 2: APOD  
    //append apod image to site
    const appendApod = (json) => {
        console.log(json);
        if(json.error === undefined || json.url !== undefined) {
            apod.style.display = 'block';
            const img = document.createElement('img'); 
            img.src = json.url;
            img.alt = json.title;
            img.title = json.title; 
            const p = document.createElement('p'); 
            p.textContent = json.explanation;
            const link = createLink(['View HD image', json.hdurl]);
            apod.append(img, p, link);
        } 
    }

    //get JSON info for apod 
    fetch('/apod')
      .then(response => response.json())
      .then(data => appendApod(data));
});