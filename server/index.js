const keys = module.require('./keys');

// Express App Setup

// Require Libraries
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// create new express application
const app = express();
// use cross-origin resource sharing
app.use(cors());
// Parse incoming requests from React into JSON
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});
pgClient.on('error', () => console.log('Lost PG Connection'));

// Create a table for all the indicies previously submitted.
pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch((err) => console.log(err));

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();


// Set up Express API
// Express Route Handlers
app.get('/', (req, res) => {
  res.send('Heya');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM VALUES');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  // redis doesn't have promise support
  redisClient.hgetall('values', (err, values) => {
    res.end(values);
  });
});

app.post('/values', async (req, res) => {
  const index = parseInt(req.body.index);

  if (index > 40) return res.status(422).send('Index is too damm high');

  redisClient(hset('values', index, 'Nothing yet!'));
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({
    working: true,
  });
});

app.listen(5000, err => {
  console.log('Listening on port 5K');
});
