const express = require('express'); 
const fetch = require('node-fetch');
require('dotenv').config(); 

const app = express();
app.listen(3000, () => console.log('listening at port 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const formatData = (data) => {
    const arr = data.near_earth_objects[Object.keys(data.near_earth_objects)[0]];
    const asteroids = arr.map(item => {
        const obj = {
            name: item.name, 
            jpl_url: item.nasa_jpl_url, 
            abs_magnitude: item.absolute_magnitude_h,
            miss_distance: item.close_approach_data[0].miss_distance, 
            velocity: item.close_approach_data[0].relative_velocity,
            diameter_km: item.estimated_diameter.kilometers, 
            diameter_m: item.estimated_diameter.miles, 
            hazard: item.is_potentially_hazardous_asteroid,
        }
        return obj;
    })

    const result = {
        amount: data.element_count,
        asteroids: asteroids 
    }

    return result;
}

//route for post request
app.get('/api/:date', (req, res) => {
    const q = req.params.date;
    const api_key = process.env.API_KEY;   
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${q}&end_date=${q}&api_key=${api_key}`;

    //fetch data and send to frontend 
    fetch(url)
      .then(res => res.json())
      .then(json => formatData(json))
      .then(data => res.json(data)); 
});




