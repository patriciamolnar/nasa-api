window.addEventListener('DOMContentLoaded', function() {
    const dateSpan = document.getElementById('date');
    const neoTotal = document.getElementById('neo-total');
    const neoHazard = document.getElementById('neo-hazard');
    const neoBiggest = document.getElementById('neo-biggest');
    const neoFastest = document.getElementById('neo-fastest');
    const neoClosest = document.getElementById('neo-closest'); 

    const appendData = (json) => {
        console.log(json); 
        neoTotal.textContent = json.amount;
        formatData(json.asteroids);
    }

    const formatData = (arr) => {
        let biggest = [], fastest = 0, closest = 0; 

        arr.forEach(neo => {
            //save the biggest one
            if(neo.diameter.kilometers.estimated_diameter_min > biggest) {
                biggest[0] = neo.diameter.kilometers.estimated_diameter_min;
                biggest[1] = neo.diameter.kilometers.estimated_diameter_max;
            }
            //save the fastest one
            if(neo.approach[0].relative_velocity.kilometers_per_hour > fastest) {
                fastest = neo.approach[0].relative_velocity.kilometers_per_hour;
            }
            //save the closest one
            if(neo.approach[0].miss_distance.kilometers > closest) {
                closest = neo.approach[0].miss_distance.kilometers;
            }
        }); 

        //if diameter smaller than a kilometer => convert to meters.
        let metric = 'kilometers';
        if(biggest[0] < 1) {
            biggest[0] *= 1000;
            metric = 'meters';
        } 

        if(biggest[1] < 1) {
            biggest[1] *= 1000;
        } 
        neoBiggest.textContent = `${biggest[0].toFixed(2)} - ${biggest[0].toFixed(2)} ${metric}`;
        neoFastest.textContent = `${parseInt(fastest).toFixed(2)}/km/h`;
        neoClosest.textContent = `${parseInt(closest).toFixed(2)}km away from Earth`; 
        
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
    const fetchApi = (query) => {
        //call API with specified query
        fetch('/api/' + query)
            .then(response => response.json())
            .then(data => appendData(data));

        //append date to DOM
        dateSpan.textContent = query;
    }

    //query API with timestamp
    const fetchApiTimestamp = (timestamp) => {
        //create the date query string
        const query = createDate(timestamp);
        fetchApi(query);
    }

    // when page loads query database with today's date. 
    let timestamp = Date.now();
    fetchApiTimestamp(timestamp);

    //variable to keep track of how many days we are away from today.
    let num = 0; 

    //load next day 
    const next = document.getElementById('next'); 
    next.addEventListener('click', () => {
        ++num;
        fetchApiTimestamp(Date.now() + 8.64e+7 * num); 
    });

    //load previous day
    const prev = document.getElementById('prev'); 
    prev.addEventListener('click', () => {
        --num;
        fetchApiTimestamp(Date.now() + 8.64e+7 * num);
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
        fetchApi(`${year.value}-${month.value}-${day.value}`);
    }); 
    
});