var SlackMetaService = require('../service/slack-meta-service'),
  LeaveService = require('../service/leave-service');

module.exports = function (controller, config) {

  const slackMetaService = new SlackMetaService(config.mongoUrl);
  const leaveService = new LeaveService(config.leaveApiRootUrl);

  controller.middleware.receive.use(function (bot, message, next) {
    bot.api.users.info({user: message.user}, function (err, response) {

      const currentUser = response["user"];
      if (!!currentUser && currentUser.name != 'alfred') {
        const userToBeRegistered = {
          slackId: message.user,
          userId: currentUser.name,
          email: currentUser.profile.email,
          givenName: currentUser.real_name
        };
        slackMetaService.registerUserIfNotPresent(userToBeRegistered)
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