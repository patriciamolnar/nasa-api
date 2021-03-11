window.addEventListener('DOMContentLoaded', function() {
    const dateSpan = document.getElementById('date');

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
            .then(data => console.log(data));

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
    //fetchApiTimestamp(timestamp);

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