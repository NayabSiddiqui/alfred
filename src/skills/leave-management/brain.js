var unplannedLeaveMessages = require('./unplanned-leave-messages'),
  callbackTypes = require('../callback-types'),
  DateUtils = require('../common/date-utils'),
  moment = require('moment');

module.exports = function (controller) {

  moment.locale('en');
  const dateUtils = new DateUtils();

  controller.hears(unplannedLeaveMessages, 'direct_message', function (bot, message) {

    bot.startConversation(message, function(error, convo){
      convo.setVar('leaveDate', moment());
      convo.setVar('displayDate', moment().format("LL"));

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
        ]}, [
        {
          pattern: bot.utterances.yes,
          callback: function (response, convo) {
            convo.say('Great! I will continue...');

            // do something else...
            convo.next();

          }
        },
        {
          pattern: bot.utterances.no,
          callback: function (response, convo) {
            convo.say('Perhaps later.');
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
  });

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

  controller.hears(['leave on', 'day off'], 'direct_message', function (bot, message) {
    const pattern = /(leave on|day off on)[/\s]+(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/i;

    if (pattern.test(message.text)) {

      const result = dateUtils.extractDate(message.text);
      if(result.isWeekend){
        const displayDate = result.date.format("LL");
        bot.reply(message, {
          text: 'Oops !',
          attachments: [
            {
              title: `${displayDate} is a weekend, which is a weekly off for you. Please check the date and apply again.`
            }
          ]
        });
      }
      else {
        const leaveDate = result.date;
        if (!leaveDate) {
          bot.reply(message, promptLeaveOnMessage);
        }
        else {
          bot.startConversation(message, function (err, convo) {
            convo.setVar('leaveDate',leaveDate.toDate());
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
              ]}, [
              {
                pattern: bot.utterances.yes,
                callback: function (response, convo) {
                  convo.say('Great! I will continue...');
                  // do something else...
                  convo.next();

                }
              },
              {
                pattern: bot.utterances.no,
                callback: function (response, convo) {
                  convo.say('Perhaps later.');
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
          // bot.reply(message, 'Awesome')
        }
      }
    }
    else {
      bot.reply(message, promptLeaveOnMessage)
    }
  });
};