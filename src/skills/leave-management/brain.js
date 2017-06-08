var unplannedLeaveMessages = require('./unplanned-leave-messages'),
  callbackTypes = require('../callback-types');

module.exports = function(controller){
  controller.hears(unplannedLeaveMessages, 'direct_message', function (bot, message) {
    bot.reply(message, {
      attachments: [
        {
          title: 'Do you want me to apply for an unplanned leave today on your behalf ?',
          callback_id: callbackTypes.unplannedLeave,
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
    });
  });


};