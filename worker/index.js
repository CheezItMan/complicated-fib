const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const sub = redisClient.duplicate();

const fibCalculator = (index) => {
  if (index < 2) return 1;

  return fibCalculator(index - 1) + fibCalculator(index - 2);
};


// Takes a message, and the channel and message
// Tells redis to store in a hash called 'values' they key
// being the 'message' and the value being the result
// of fibCalculator on that index.
sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fibCalculator(parseInt(message)));
});
