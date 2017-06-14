var LeaveService = require('../service/leave-service');

module.exports = function (controller, config) {
  
  const leaveService = new LeaveService(config.leaveApiRootUrl);
  
  require('./leave-management/brain')(controller, leaveService);
  require('./help/brain')(controller);
};