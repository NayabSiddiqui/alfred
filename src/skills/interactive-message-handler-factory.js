var callbackTypes = require('./callback-types'),
  unplannedLeaveHandler = require('./leave-management/interaction-handler');

module.exports = function (callbackId) {
  switch (callbackId) {
    case callbackTypes.unplannedLeave:
      return new unplannedLeaveHandler();
    case callbackTypes.conversation:
      return new conversationHandler();
    default:
      return null;
  }
};

const conversationHandler = function () {
  var handleResponse = function (response) {
    return ' :thumbsup: ';
  };

  return {
    handleResponse: handleResponse
  }
};