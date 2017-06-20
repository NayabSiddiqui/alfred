const unplannedLeaveMessages = require('./unplanned-leave-messages'),
  callbackTypes = require('../callback-types'),
  dateUtils = new require('../common/date-utils')(),
  moment = require('moment'),
  MessageBuilder = require('./message-builder');

module.exports = function (controller, leaveService) {

  const messageBuilder = new MessageBuilder();

  moment.locale('en');

  controller.hears(unplannedLeaveMessages, 'direct_message', function (bot, message) {

    const today = moment();
    if (dateUtils.isWeekend(today)) {
      bot.reply(message, messageBuilder.buildDayIsWeekendPrompt(today.format("LL")))
    }
    else {
      bot.startConversation(message, function (error, convo) {
        convo.setVar('leaveDate', today);
        convo.setVar('displayDate', today.format("LL"));

        convo.addQuestion({
          text: 'Do you want me to apply for an unplanned leave today on your behalf ? Please confirm.',
          attachments: [
            {
              title: 'Leave for {{vars.displayDate}}',
              callback_id: callbackTypes.conversation,
              attachment_type: 'default',
              actions: [
                {
                  "name": "yes-full-day",
                  "text": "Yes",
                  "value": "yes-full-day",
                  "type": "button",
                  "style": "primary"
                },
                {
                  "name": "yes-half-day",
                  "text": "Yes, for half day",
                  "value": "yes-half-day",
                  "type": "button",
                  "style": "primary"
                },
                {
                  "name": "no",
                  "text": "No",
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

              if (response.text == 'yes-half-day') {
                leaveService.applyHalfDayLeaves(message.from, convo.vars.leaveDate, convo.vars.leaveDate)
                  .then(() => {
                    convo.say(messageBuilder.buildUnplannedLeaveAppliedMessage(convo.vars.displayDate, true));
                  })
                  .catch((error) => {
                    const reasonForFailure = error.response.data || 'not clear at the moment. Please contact your administrator.';
                    convo.say(messageBuilder.buildErrorMessage(reasonForFailure));
                  })
                  .finally(() => convo.next());
              }
              else {
                leaveService.applyFullDayLeaves(message.from, convo.vars.leaveDate, convo.vars.leaveDate)
                  .then(() => {
                    convo.say(messageBuilder.buildUnplannedLeaveAppliedMessage(convo.vars.displayDate, false));
                  })
                  .catch((error) => {
                    const reasonForFailure = error.response.data || 'not clear at the moment. Please contact your administrator.';
                    convo.say(messageBuilder.buildErrorMessage(reasonForFailure));
                  })
                  .finally(() => convo.next());
              }
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
    }
  });


  controller.hears(['leave on', 'day off'], 'direct_message', function (bot, message) {
    const pattern = /(leave on|day off on)[/\s]+(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/i;

    if (pattern.test(message.text)) {

      const result = dateUtils.extractDateForUnplannedLeave(message.text);
      if (result.isWeekend) {
        const displayDate = result.date.format("LL");
        bot.reply(message, messageBuilder.buildDayIsWeekendPrompt(displayDate));
      }
      else {
        const leaveDate = result.date;
        if (!leaveDate) {
          bot.reply(message, messageBuilder.buildSingleDayUsagePrompt);
        }
        else {
          bot.startConversation(message, function (err, convo) {
            convo.setVar('leaveDate', leaveDate);
            convo.setVar('displayDate', leaveDate.format("LL"));

            convo.addQuestion({
              text: 'Please confirm your leave application.',
              attachments: [
                {
                  title: 'Leave for {{vars.displayDate}}',
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
                  leaveService.applyFullDayLeaves(message.from, convo.vars.leaveDate, convo.vars.leaveDate)
                    .then(() => {
                      convo.say(messageBuilder.buildUnplannedLeaveAppliedMessage(convo.vars.displayDate, false));
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
        }
      }
    }
    else {
      bot.reply(message, messageBuilder.buildSingleDayUsagePrompt)
    }
  });

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
};