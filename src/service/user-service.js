var MongoClient = require('mongodb').MongoClient,
  Promise = require('bluebird');

const usersCollection = 'users';

const UserService = function (mongoUrl) {

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
            .finally(() => {
              db.close();
            });
        })
        .catch(error => {
          reject(error);
        })
    });
  };

  return {
    registerUserIfNotPresent: registerUserIfNotPresent
  }
};

module.exports = UserService;