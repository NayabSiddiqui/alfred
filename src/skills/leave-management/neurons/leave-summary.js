module.exports = function (controller, leaveService, messageBuilder) {

  controller.hears(['summary leaves', 'leaves summary', 'leave summary'], 'direct_message', function (bot, message) {
    bot.api.users.info({user: message.user}, function (error, response) {
      if (error) {
        console.log(error)
      }
      else {
        const currentUser = response["user"];
        const userId = currentUser.name;
        leaveService.getLeaveSummary(userId)
          .then((response) => {

            const summaryMessage = {
              text: "Here is the synopsis...",
              attachments: messageBuilder.buildLeaveSummary(response)
            };

            bot.startConversation(message, function (err, convo) {
              convo.addMessage(summaryMessage);
            });
            // bot.reply(message, summaryMessage)
            // bot.reply(message, summaryMessage)
          })
          .catch(error => {
            bot.reply(message, messageBuilder.buildErrorMessage(error))
          })
      }
    })

  });
};

