var MongoClient = require('mongodb').MongoClient,
  Promise = require('bluebird');

const usersCollection = 'users';
const channelSubscriptionCollection = 'subscribed_channels';

const SlackMetaService = function (mongoUrl) {

  const registerUserIfNotPresent = function (user) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(mongoUrl, {
        promiseLibrary: Promise
      })
        .then((db) => {
          let collection = db.collection(usersCollection);
          collection.findOne({userId: user.userId})
            .then(existingUser => {
              if (existingUser) {
                resolve({newUser: false});
              } else {
                collection.insertOne(user)
                  .then(() => {
                    resolve({newUser: true});
                  })
                  .catch((error) => {
                    reject(error);
                  })
              }
            })
            .catch(error => reject(error))
            .finally(() => {
              db.close();
            });
        })
        .catch(error => {
          reject(error);
        })
    });
  };

  const subscribeToChannel = function (channelId) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(mongoUrl, {
        promiseLibrary: Promise
      })
        .then((db) => {
          let collection = db.collection(channelSubscriptionCollection);
          collection.updateOne({channelId: channelId}, {channelId: channelId}, {upsert: true})
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            })
            .finally(() => {
              db.close();
            });
        })
        .catch(error => reject(error))

    });
  };

  const revokeChannelSubscription = function(channelId){
    return new Promise((resolve, reject) => {
      MongoClient.connect(mongoUrl, {
        promiseLibrary: Promise
      })
        .then((db) => {
          let collection = db.collection(channelSubscriptionCollection);
          collection.findOneAndDelete({channelId: channelId})
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            })
            .finally(() => {
              db.close();
            });
        })
        .catch(error => reject(error))

    });
  };

  return {
    registerUserIfNotPresent: registerUserIfNotPresent,
    subscribeToChannel: subscribeToChannel,
    revokeChannelSubscription: revokeChannelSubscription
  }
};

module.exports = SlackMetaService;