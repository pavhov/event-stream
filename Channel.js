const debug = require('debug')(process.env.NODE_NAME);
const redis = require('redis');
const EventEmitter = require('./EventEmitter');

const channel = redis.createClient({
  url: process.env.REDIS,
  db: 0
});

const publisher = redis.createClient({
  url: process.env.REDIS,
  db: 0
});


let subscribeList = {};


/**
 * @name setup
 * @description Setup channel of redis
 * @example 'setup()'
 */
const setup = () => {
  debug('\u001b[36m Redis Channel:', 'setup() \'',
    console.colors.Reset);
  channel.on('subscribe', subscribe);
  channel.once('unsubscribe', unsubscribe);
  channel.on('message', message);
  channel.on('error', error);

};

/**
 * @name open
 * @description Open room  in channel of redis
 * @param key
 */
const open = (key) => {
  if (!subscribeList[key]) {
    subscribeList[key] = true;
    channel.subscribe(key);
  }

};

/**
 * @name subscribe
 * @description Callback on channel 'subscribe'
 * @example 'channel.on('subscribe', subscribe);'
 *
 * @param key
 * @param count
 */
const subscribe = (key, count) => {
  debug('\u001b[36m Redis Channel: subscribe() ', key + ', listener count: ' +
    count,
    console.colors.Reset);

  EventEmitter.on(key, chanelHandler);

};

/**
 * @name chanelHandler
 * @description Handler of subscribed channel for publish data
 *
 * @param result
 */
const chanelHandler = (result) => {
  let isObject, event, data, key;

  isObject = (result instanceof Object && Object.keys(result).length > 0);

  if (isObject) {
    event = result.event;
    data = result.data;
    key = result.key;
  }

  publisher.publish(key, JSON.stringify({event, data}));

  const used = process.memoryUsage().heapUsed / 1024 / 1024;

  debug('\u001b[36m Redis Channel: publish() ',
    `Memory: ${Math.round(used * 100) / 100} MB `,
    console.colors.Reset);

};

/**
 * @name message
 * @description Callback on channel get a 'message'
 * @example 'channel.on('message', message);'
 *
 * @param key
 * @param message
 */
const message = (key, message) => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;

  //TODO: message is received data
  debug('\u001b[36m Redis Channel:', key,
    'Received: message',
    `Memory: ${Math.round(used * 100) / 100} MB `,
    console.colors.Reset);

  EventEmitter.emit('rp:' + key, JSON.parse(message || {}));

};

/**
 * @name unsubscribe
 * @description Callback on channel 'unsubscribe'
 * @example 'channel.once('unsubscribe', unsubscribe);'
 *
 * @param key
 */
const unsubscribe = (key) => {
  debug('\u001b[36m Redis Channel: unsubscribe()', key,
    console.colors.Reset);

  EventEmitter.removeListener(key, chanelHandler);

  delete subscribeList[key];

};

/**
 * @name error
 * @description Callback on channel 'error'
 * @example 'channel.on('error', error);'
 * @param err
 */
const error = (err) => {
  debug(console.colors.FgRed, ' Redis Channel: error()',
    err.message, err.stack,
    console.colors.Reset);

};

setImmediate(time => setup());

/**
 *
 * @type {{
 *  open: function(*=),
 *  subscribe: function(*=),
 *  message: function(*=, *=)}}
 */
module.exports = {
  open,
  subscribe,
  unsubscribe,
};
