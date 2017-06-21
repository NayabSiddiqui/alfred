module.exports = function (controller, leaveService, messageBuilder) {

  controller.hears(['summary leaves', 'leaves summary', 'leave summary'], 'direct_message', function (bot, message) {
    const userMessage = message.text;
    const mentionedUserSlackId = userMessage.indexOf("<@") > -1
      ? userMessage.substring(userMessage.lastIndexOf('<@') + 2, userMessage.lastIndexOf('>'))
      : message.user;
    console.log("## user ##");
    console.log(mentionedUserSlackId)
    bot.api.users.info({user: mentionedUserSlackId}, function (error, response) {
      if (error) {
        console.log(error);
        bot.reply(message, messageBuilder.buildLeaveSummaryUsagePrompt);
      }
      else {
        const currentUser = response["user"];
        const mentionedUserName = currentUser.name;
        leaveService.getLeaveSummary(mentionedUserName)
          .then((response) => {
            const summaryMessage = {
              text: `Here is the synopsis of leaves for <@${mentionedUserSlackId}>`,
              attachments: messageBuilder.buildLeaveSummary(response)
            };

            bot.startConversation(message, function (err, convo) {
              convo.addMessage(summaryMessage);
            });
          })
          .catch(error => {
            bot.reply(message, messageBuilder.buildErrorMessage(error))
          })
      }
    });
  });
};

