var UserService = require('../service/user-service'),
  LeaveService = require('../service/leave-service');

module.exports = function (controller, config) {

  const userService = new UserService(config.mongoUrl);
  const leaveService = new LeaveService(config.leaveApiRootUrl);

  controller.middleware.receive.use(function (bot, message, next) {
    bot.api.users.info({user: message.user}, function (err, response) {

      const currentUser = response["user"];
      if (!!currentUser && currentUser.name != 'alfred') {
        const userToBeRegistered = {
          userId: currentUser.name,
          email: currentUser.profile.email,
          givenName: currentUser.real_name
        };
        userService.registerUserIfNotPresent(userToBeRegistered)
          .then((result) => {
            if (result.newUser == true) {
              leaveService.registerEmployee(userToBeRegistered.userId, userToBeRegistered.email, userToBeRegistered.givenName);
            }
          });
        message.from = currentUser.name;
        next();
      }
      else {
        next();
      }
    });
  });
};