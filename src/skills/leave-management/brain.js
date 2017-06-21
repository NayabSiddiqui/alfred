const DateUtils = require('../common/date-utils'),
  moment = require('moment'),
  MessageBuilder = require('./message-builder');

module.exports = function (controller, leaveService) {

  const messageBuilder = new MessageBuilder();
  const dateUtils = new DateUtils();

  moment.locale('en');

  require('./neurons/unplanned-leave')(controller, dateUtils, messageBuilder, moment, leaveService);
  require('./neurons/leave-summary')(controller, leaveService, messageBuilder);
  require('./neurons/planned-leave')(controller, dateUtils, messageBuilder, leaveService);
  require('./neurons/delete-leave-application')(controller, messageBuilder, leaveService, moment);
};