const greetingMessages = require('./greeting-messages');

module.exports = function(controller){
  controller.hears('help leaves', 'direct_message', function (bot, message) {
    bot.reply(message, {
      text: "Try one of the following..",
      attachments: [
        {
          text: "type `not feeling well today` or `taking day off` to apply for an unplanned leave for today.",
          color: '#36a64f',
          mrkdwn_in: ['text']
        },
        // {
        //   text: "type `help meetings` to know more about how to book a room, invite others etc.",
        //   color: '#9999ff',
        //   mrkdwn_in: ['text']
        // }
      ]
    });
  });

  controller.hears('help', 'direct_message', function (bot, message) {
    bot.reply(message, {
      text: "I can help you out with various topics, for instance...",
      attachments: [
        {
          text: "type `help leaves` to know more about how to apply planned & unplanned leaves, notify when working remotely etc.",
          color: '#36a64f',
          mrkdwn_in: ['text']
        },
        {
          text: "type `help meetings` to know more about how to book a room, invite others etc.",
          color: '#9999ff',
          mrkdwn_in: ['text']
        }
      ]
    });
  });



  controller.hears(greetingMessages, 'direct_message', function (bot, message) {
    bot.reply(message, {
      text: `Hey <@${message.user}>. How can I assist you today ? `,
      attachments: [
        {
          text: "[Hint: type `help` to know more...",
          color: '#9999ff',
          mrkdwn_in: ['text']
        }
      ]
    });
  });
};