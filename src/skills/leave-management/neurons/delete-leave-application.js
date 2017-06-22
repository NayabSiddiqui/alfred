const callbackTypes = require('../../callback-types');

module.exports = function (controller, messageBuilder, leaveService, moment) {

  controller.hears(['cancel leaves'], 'direct_message', function (bot, message) {
    bot.api.users.info({user: message.user}, function (error, response) {
      if (error) {
        console.log(error);
        bot.reply(message, messageBuilder.errorMessage('Something went wrong :confused: please try after sometime...'));
      }
      else {
        const userId = response["user"].name;
        leaveService.getLeaveSummary(userId)
          .then(summary => {
            const today = moment();
            const leaveApplicationsMessage = {
              text: "Your leaves",
              attachments: summary.leaveApplications.map(application => {
                let startingDate = moment(application.days[0]).format("LL");
                let endingDate = moment(application.days[application.days.length - 1]).format("LL");
                return {
                  title: `Leave for ${application.days.length} days starting from ${startingDate}, ending on ${endingDate}`,
                  callback_id: callbackTypes.conversation,
                  attachment_type: 'default',
                  actions: [
                    {
                      "name": `yes-${application.id}`,
                      "text": "Delete",
                      "value": `yes`,
                      "type": "button",
                      "style": "danger"
                    }
                  ],
                  color: `${moment(application.days[application.days.length - 1]).isAfter(today, 'day') ? '#92c544' : '#ff4c4c'}`
                };
              })
            };
            bot.startConversation(message, function (error, convo) {
              convo.setVar('userId', userId);
              convo.addQuestion(leaveApplicationsMessage, [
                {
                  pattern: bot.utterances.yes,
                  callback: function (response, convo) {

                    const leaveApplicationId = response.actions[0].name.replace('yes-', '');
                    leaveService.cancelLeave(convo.vars.userId, leaveApplicationId)
                      .then(() => {
                        convo.say(messageBuilder.buildLeaveCancelledMessage());
                      })
                      .catch(error => {
                        console.log(error);
                        convo.say(messageBuilder.buildErrorMessage('Something weird happened. Please try again later.'));
                      })
                      .finally(() => convo.next());
                  }
                }
              ]);
            })
          })
      }
    })
  });
};