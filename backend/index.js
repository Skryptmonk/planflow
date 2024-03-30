///Name Space///
const express = require('express')
const app = express()
const cors = require('cors');
const axios = require('axios')

const port = 4001
const { Pool } = require('pg')
const bodyParser = require('body-parser')
require('dotenv').config()
app.use(bodyParser.json())
const constant = require('./helpers/constant.json')
app.use(cors());

//router file
const router = require('./route/router');
app.use(router);

// Define a route for handling GET requests
app.get('/api', async (req, res) => {
  try {
    const { headers, query } = req;
    const { url, ...params } = query;
    const newHeaders = {authorization:headers.authorization};
    const response = await axios.get(url, { headers:newHeaders, params });

    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Define a route for handling POST requests
app.post('/api', async (req, res) => {
  try {
    const { headers, body, query } = req;
    const { url } = query;
    const newHeaders = {authorization:headers.authorization};

    let config = {
      method: "POST",
      url: url,
      data:body,
      headers: newHeaders,
    };
    const response = await axios(config);
console.log(config);
    // const response = await axios.post(url, body, { headers:newHeaders });

    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

///Db Connection///
const pool = new Pool({
    user: 'postgres',
    host: '139.84.133.16',
    database: 'postgres',
    password: 'postgres',
    port: 49153, // default PostgreSQL port is 5432
  });
  

///Get table records///
app.get('/root_planner',(req,res) => {
    try {
        pool.query('SELECT * FROM root_planner', (err, result) => {
            if (err) {
              console.error(err);
              res.status(500).send('Error retrieving data');
            } else {
              res.json(result.rows);
            }
          });
    } catch (error) {
        console.log(error.message)
    }
})

///Insert records into table///
app.post('/root_planner',(req,res) => {
    try {
        const { first_name, last_name, username } = req.body; // Get the values from the request body
        const insertQuery = 'INSERT INTO root_planner (first_name, last_name, username) VALUES ($1, $2, $3)';
        const values = [first_name, last_name, username ]
        pool.query(insertQuery, values, (error, result) => {
            if (error) {
              console.error('Error inserting record:', error);
              res.status(500).send('Error inserting record');
            } else {
              console.log('Record inserted successfully');
              res.status(200).send('Record inserted successfully');
            }
          });
    } catch (error) {
        console.log(error.message)
    }
})

///Update Records into table///
app.put('/root_planner/:id', (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, username } = req.body;
  
    const updateQuery = 'UPDATE root_planner SET first_name = $1, last_name = $2, username = $3 WHERE id = $4';
    const values = [first_name, last_name, username, id];
  
    pool.query(updateQuery, values, (error, result) => {
      if (error) {
        console.error('Error updating record:', error);
        res.status(500).send('Error updating record');
      } else {
        console.log('Record updated successfully');
        res.status(200).send('Record updated successfully');
      }
    });
  });

  ///Delete records into table///
  app.delete('/root_planner/:id', (req, res) => {
    const { id } = req.params;
  
    const deleteQuery = 'DELETE FROM root_planner WHERE id = $1';
    const values = [id];
  
    pool.query(deleteQuery, values, (error, result) => {
      if (error) {
        console.error('Error deleting record:', error);
        res.status(500).send('Error deleting record');
      } else {
        console.log('Record deleted successfully');
        res.status(200).send('Record deleted successfully');
      }
    });
  });
  
///Port assign///
app.listen(port,() => {
  console.log(process.env.DB_USER)
    console.log(`The server is running on ${port}`)
})