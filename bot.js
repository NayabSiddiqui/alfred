var Botkit = require('botkit'),
  unplannedLeaveMessages = require('./src/listeners/unplanned-leave');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./src/config/config')[env];

const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;


if (!clientId || !clientSecret || !config.port) {
  console.log('Error: Specify clientId clientSecret and PORT in environment');
  process.exit(1);
}

const slackController = Botkit.slackbot({
  debug: true,
  interactive_replies: true, // tells botkit to send button clicks into conversations
  json_file_store: './alfred-bot-db/'
});

const slackbot = slackController.spawn({
  token: process.env.SLACK_TOKEN,
}).startRTM();

slackController.configureSlackApp({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  redirectUri: 'https://00c4ebb2.ngrok.io/oauth',
  scopes: ['bot'],
  debug: true
});

// set up a botkit app to expose oauth and webhook endpoints
slackController.setupWebserver(config.port, function (err, webserver) {

  // set up web endpoints for oauth, receiving webhooks, etc.
  slackController
    .createHomepageEndpoint(slackController.webserver)
    .createOauthEndpoints(slackController.webserver, function (err, req, res) {
    })
    .createWebhookEndpoints(slackController.webserver);

});

slackController.hears('', 'direct_mention,mention', function (bot, message) {
  const user = message.user;

  bot.startPrivateConversation({
    user: user
  }, function (err, convo) {
    if (!err && convo) {
      convo.say({
        text: `Hello <@${user}> :wave:`,
        attachments: [
          {
            title: 'I cannot talk on public channels. But I\'m all ears out here :simple_smile:',
            text: 'Type `help` to learn more about me.',
            mrkdwn_in: ['text']
          }
        ]
      });
    }
  });
});

slackController.hears(unplannedLeaveMessages, 'direct_message', function (bot, message) {
  bot.reply(message, {
    attachments: [
      {
        title: 'Do you want me to apply for an unplanned leave today on your behalf ?',
        callback_id: 'unplanned-leave',
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

slackController.on('interactive_message_callback', function (bot, message) {

  const callbackId = message.callback_id;
  switch (callbackId) {
    case "unplanned-leave":
      const userResponse = message.actions[0].value;
      let botResponse = '';
      switch (userResponse) {
        case "yes-full-day":
          botResponse = "Full day leave applied.";
          break;
        case "yes-half-day":
          botResponse = "Half day leave applied.";
          break;
        case "no":
          botResponse = "Roger that!";
          break;
      }
      bot.replyInteractive(message, `${botResponse} :thumbsup: `);
      break;
    default:
      bot.replyInteractive(message, "Oops. Found myself in an unknown territory. :confused: ");
      break;
  }
});

