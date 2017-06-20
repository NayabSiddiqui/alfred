const greetingMessages = require('./greeting-messages');

module.exports = function(controller){
  controller.hears('help leaves', 'direct_message', function (bot, message) {
    bot.reply(message, {
      text: "You can try one of the following..",
      attachments: [
        {
          text: "Type `not feeling well today` or `taking day off` to apply for an unplanned leave for today.",
          color: '#4286f4',
          mrkdwn_in: ['text']
        },
        {
          text: "Say `leave on dd-mm` or `leave from dd-mm to dd-mm` to apply for planned leaves.",
          color: '#92c544',
          mrkdwn_in: ['text']
        },
        {
          text: "Type `leave summary` to view the summary of your leaves...",
          color: '#fec611',
          mrkdwn_in: ['text']
        }
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
      text: `Hey <@${message.user}>. How are you today ? `,
      attachments: [
        {
          text: "[Hint:] type `help` to know more about what I can do...",
          color: '#9999ff',
          mrkdwn_in: ['text']
        }
      ]
    });
  });
};