/**
 *
 * @type {"events".internal}
 */
const EventEmitter = require('events');


/**
 * @access {public}
 */
class CustomEventEmitter extends EventEmitter {
  /**
   *
   */
  constructor() {
    super();
  }

  /**
   *
   * @param args
   * @returns {*}
   */
  on(...args) {
    return super.on.apply(this, args)
  }

  /**
   *
   * @param args
   * @returns {boolean}
   */
  emit(...args) {
    return super.emit.apply(this, args)
  }

  /**
   *
   * @param args
   * @returns {boolean}
   */
  cemit(...args) {
    args[1].key = args[0];

    return super.emit.apply(this, args)
  }
}


/**
 *
 * @type {CustomEventEmitter}
 */
module.exports = new CustomEventEmitter;