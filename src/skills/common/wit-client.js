const {Wit, log} = require('node-wit'),
  Promise = require('bluebird');

module.exports = function () {

  const client = new Wit({
    accessToken: process.env.WIT_AI_TOKEN,
    logger: new log.Logger(log.DEBUG) // optional
  });

  const getIntent = function (message) {
    client.message(message.content, {})
      .then((data) => {
        console.log("## wit response is ###")
        console.log(JSON.stringify(data))
        return(JSON.stringify(data));
      })
      .catch(error => {
        console.log("## some error ##")
        console.log(error)
        return null;
      })
  };

  return {
    getIntent: getIntent
  }
};