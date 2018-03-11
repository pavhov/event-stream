const debug = require('debug')(process.env.NODE_NAME);
const Channel = require('./Channel');
const EventEmitter = require("./EventEmitter");


/**
 * @name open
 * @description open 'one-sided' channel for client for send command to them
 *
 * @param name
 * @param request
 * @param response
 * @returns {{sync: (function())}}
 */
const open = (name, request, response) => {
  request.socket.setTimeout(0);
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-No-Compression': 'without compress'
  });
  response.write('\n');

  const eventKey = request.storage.event.id + name;

  Channel.open(eventKey);

  const emitBounded = emit.bind(null, response);

  EventEmitter.on('rp:' + eventKey, emitBounded);

  request.client.once('close', () => {
    debug('close:', eventKey,
      console.colors.Reset);

    Channel.unsubscribe(eventKey);
    EventEmitter.removeListener('rp:' + eventKey, emitBounded);

  });

  debug('\u001b[36m EventStream Channel: Created', eventKey,
    console.colors.Reset);

};

/**
 * @name emit
 * @description send data to client
 *
 * @param response
 * @param data
 */
const emit = (response, data) => {
  let result = JSON.stringify(data) || Object.create(null);

  response.write('event: message\n' + `data: ${result}` + '\n\n');

  //TODO: result is received data
  debug('\u001b[36m EventStream emit: message',
    console.colors.Reset);

};


/**
 *
 * @type {{
 *  open: function(*=, *=),
 *  emit: function(*, *, *)
 * }}
 */
module.exports = {
  open,
  emit
};