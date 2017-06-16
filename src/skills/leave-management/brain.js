const unplannedLeaveMessages = require('./unplanned-leave-messages'),
  callbackTypes = require('../callback-types'),
  dateUtils = new require('../common/date-utils')(),
  moment = require('moment'),
  MessageBuilder = require('./message-builder');

module.exports = function (controller, leaveService) {

  const messageBuilder = new MessageBuilder();

  moment.locale('en');

  const promptLeaveOnMessage = {
    text: "Oops! didn't quite get that. :confused:",
    attachments: [
      {
        text: "you can type `leave on mm-dd` or `taking the day off on mm-dd` to apply leave for a particular day",
        color: '#9999ff',
        mrkdwn_in: ['text']
      },
      {
        text: "type `help leaves` to know more about how to apply planned & unplanned leaves, notify when working remotely etc.",
        color: '#9999ff',
        mrkdwn_in: ['text']
      }
    ]
  };

  const promptDayIsWeekdayMessage = (displayDate) => {
    return {
      text: 'Oops !',
      attachments: [
        {
          title: `${displayDate} is a weekend, which is a weekly off for you. Please check the date and apply again.`
        }
      ]
    }
  };

  const leaveAppliedSuccessfully = (date, isHalfDay) => {
    return {
      text: " :white_check_mark: Success!",
      attachments: [
        {
          text: `*${isHalfDay ? 'Half' : 'One'} day* leave applied for *${date}*`,
          color: '#36a64f',
          mrkdwn_in: ['text']
        },
        {
          text: "FYI: You can type `summary leaves` to view the summary of your leaves...",
          color: '#9999ff',
          mrkdwn_in: ['text']
        }
      ]
    }
  };

  const errorMessage = (reason) => {
    return {
      text: 'Oops! Failed to process your request. :confused:',
      attachments: [
        {
          text: `Reason:  \`${reason}\`.`,
          color: '#ff4c4c',
          mrkdwn_in: ['text']
        }
      ]
    }
  };

  controller.hears(unplannedLeaveMessages, 'direct_message', function (bot, message) {

    const today = moment();
    if (dateUtils.isWeekend(today)) {
      bot.reply(message, promptDayIsWeekdayMessage(today.format("LL")))
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
                    convo.say(leaveAppliedSuccessfully(convo.vars.displayDate, true));
                  })
                  .catch((error) => {
                    const reasonForFailure = error.response.data || 'not clear at the moment. Please contact your administrator.';
                    convo.say(errorMessage(reasonForFailure));
                  })
                  .finally(() => convo.next());
              }
              else {
                leaveService.applyFullDayLeaves(message.from, convo.vars.leaveDate, convo.vars.leaveDate)
                  .then(() => {
                    convo.say(leaveAppliedSuccessfully(convo.vars.displayDate, false));
                  })
                  .catch((error) => {
                    const reasonForFailure = error.response.data || 'not clear at the moment. Please contact your administrator.';
                    convo.say(errorMessage(reasonForFailure));
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

      const result = dateUtils.extractDate(message.text);
      if (result.isWeekend) {
        const displayDate = result.date.format("LL");
        bot.reply(message, promptDayIsWeekdayMessage(displayDate));
      }
      else {
        const leaveDate = result.date;
        if (!leaveDate) {
          bot.reply(message, promptLeaveOnMessage);
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
                      convo.say(leaveAppliedSuccessfully(convo.vars.displayDate, false));
                    })
                    .catch((error) => {
                      const reasonForFailure = error.response.data || 'not clear at the moment. Please contact your administrator.';
                      convo.say(errorMessage(reasonForFailure));
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
      bot.reply(message, promptLeaveOnMessage)
    }
  });

  controller.hears(['summary leaves', 'leaves summary', 'leave summary'], 'direct_message', function (bot, message) {
    console.log("## did come here #")
    bot.api.users.info({user: message.user}, function (error, response) {
      if (error) {
        console.log("## Error Occurred ##");
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
            bot.reply(message, errorMessage(error))
          })
      }
    })

  });
};