const express = require('express'); 
const fetch = require('node-fetch');
require('dotenv').config(); 

const app = express();
app.listen(3000, () => console.log('listening at port 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const formatData = data => {
    const object = {
        amount: data.element_count 
    }

    return object;
}

//route for post request
app.get('/api/:date', (req, res) => {
    //get today
    const q = req.params.date;
    console.log(q);

    //build URL
    const api_key = process.env.API_KEY;   
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${q}&end_date=${q}&api_key=${api_key}`;

    //fetch data and return it 
    // fetch(url)
    //   .then(res => res.json())
    //   .then(json => formatData(json))
    //   .then(data => res.json(data)); 

    fetch(url)
      .then(res => res.json())
      .then(json => res.json(json));  
});




