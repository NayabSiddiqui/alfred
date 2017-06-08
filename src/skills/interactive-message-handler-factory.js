var callbackTypes = require('./callback-types'),
  unplannedLeaveHandler = require('./leave-management/interaction-handler');

module.exports = function (callbackId) {
  switch (callbackId) {
    case callbackTypes.unplannedLeave:
      return new unplannedLeaveHandler();
    default:
      return null;
  }
};