var SlackMetaService = require('../service/slack-meta-service');

module.exports = function (controller, config) {
  const slackMetaService = new SlackMetaService(config.mongoUrl);

  controller.on('bot_channel_join', function (bot, message) {
    slackMetaService.subscribeToChannel(message.channel)
      .then(() => {
      })
      .catch(error => {
        console.log(error);
      })
  });

  controller.on('bot_channel_left', function (bot, message) {
    slackMetaService.revokeChannelSubscription(message.channel)
      .then(() => {
      })
      .catch(error => {
        console.log(error);
      })
  });
};