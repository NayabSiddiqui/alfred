const callbackTypes = require('../../callback-types');

module.exports = function(controller, dateUtils, messageBuilder, leaveService){
  controller.hears(['leave from', 'vacation from'], 'direct_message', function (bot, message) {
    const leaveDates = dateUtils.extractDatesForPlannedLeave(message.text);
    if (!leaveDates) {
      bot.reply(message, messageBuilder.buildPlannedLeaveUsagePrompt)
    }
    else {
      leaveService.getLeaveApplicationPreview(leaveDates.from, leaveDates.to)
        .then(response => {
          bot.startConversation(message, function (err, convo) {
            convo.setVar('leaveDateFrom', leaveDates.from);
            convo.setVar('leaveDateTo', leaveDates.to);
            convo.setVar('displayDateFrom', leaveDates.from.format("LL"));
            convo.setVar('displayDateTo', leaveDates.to.format("LL"));
            convo.setVar('numberOfLeaveDays', response.numberOfLeaveDays);

            convo.addQuestion({
              text: 'Please confirm your leave application.',
              attachments: [
                {
                  title: 'Leave for {{vars.numberOfLeaveDays}} days starting from {{vars.displayDateFrom}}, ending on {{vars.displayDateTo}}',
                  callback_id: callbackTypes.conversation,
                  attachment_type: 'default',
                  actions: [
                    {
                      "name": "yes-full-day",
                      "text": "Confirm",
                      "value": "yes-full-day",
                      "type": "button",
                      "style": "primary"
                    },
                    {
                      "name": "cancel",
                      "text": "Cancel",
                      "value": "no",
                      "type": "button"
                    }
                  ]
                }
              ]
            }, [
              {
                pattern: bot.utterances.yes,
                callback: function (response, convo) {
                  leaveService.applyFullDayLeaves(message.from, convo.vars.leaveDateFrom, convo.vars.leaveDateTo)
                    .then(() => {
                      convo.say(messageBuilder
                        .buildPlannedLeaveAppliedMessage(convo.vars.displayDateFrom, convo.vars.displayDateTo,convo.vars.numberOfLeaveDays));
                    })
                    .catch((error) => {
                      const reasonForFailure = error.response.data || 'not clear at the moment. Please contact your administrator.';
                      convo.say(messageBuilder.buildErrorMessage(reasonForFailure));
                    })
                    .finally(() => convo.next());

                }
              },
              {
                pattern: bot.utterances.no,
                callback: function (response, convo) {
                  convo.say('Cancelled your last request.');
                  // do something else...
                  convo.next();
                }
              },
              {
                default: true,
                callback: function (response, convo) {
                  // just repeat the question
                  convo.repeat();
                  convo.next();
                }
              }
            ])
          });
        })
        .catch(error => {
          console.log(error)
          bot.reply(message, messageBuilder.buildErrorMessage('Unable to connect to service.'))
        })
    }
  });
}