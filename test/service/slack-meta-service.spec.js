var chai = require("chai"),
  expect = chai.expect,
  assert = chai.assert,
  nock = require('nock'),
  MongoClient = require('mongodb').MongoClient,
  Promise = require('bluebird'),
  SlackMetaService = require('../../src/service/slack-meta-service');

describe('Slack Meta Service', () => {

  let slackMetaService = null;
  const mongoUrl = 'mongodb://localhost:27017/alfred-test';
  const blackWidowUser = {
    slackId: '123321',
    userId: 'blackwidow',
    email: 'blackwidow@shield.com',
    givenName: 'Natasha Romanov'
  };

  before((done) => {
    slackMetaService = new SlackMetaService(mongoUrl);

    MongoClient.connect(mongoUrl, {
      promiseLibrary: Promise
    })
      .then(db => {
        const collection = db.collection('users');
        collection.insertOne(blackWidowUser)
          .then(() => db.close())
      })
      .finally(() => done())
  });

  after((done) => {
    MongoClient.connect(mongoUrl, {
      promiseLibrary: Promise
    })
      .then(db => {
        db.dropDatabase()
          .then(() => {
            console.log("Test Mongo DB dropped...");
          })
          .catch(error => {
            console.log("Test Mongo DB could not be dropped\n" + error);
          })
          .finally(() => {
            db.close();
          });
        done();
      })
      .catch(error => {
        console.log("failed to connect to mongo db\n" + error);
        done(error);
      })
  });

  function givenThatChannelWasSubscribedTo(channelId){
    return new Promise((resolve, reject) => {
      MongoClient.connect(mongoUrl, {
        promiseLibrary: Promise
      })
        .then((db) => {
          let collection = db.collection('subscribed_channels');
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
  }

  it('should register user if user is not registered', function (done) {
    const user = {
      slackId: 'vodoo',
      userId: 'voodooChild',
      email: "diana@dc.com",
      givenName: "diana"
    };

    slackMetaService.registerUserIfNotPresent(user)
      .then((result) => {
        expect(result).to.eql({newUser: true});
        MongoClient.connect(mongoUrl, {
          promiseLibrary: Promise
        })
          .then((db) => {
            const collection = db.collection('users');
            collection.findOne({userId: user.userId})
              .then((user) => {
                expect(user).to.eql(user);
              });
            done();
          })
      })
      .catch((error) => {
        console.log("@@@@@@@@@@", error);
        done(error);
      })
  });

  it('should not register an already registered user', (done) => {
    slackMetaService.registerUserIfNotPresent(blackWidowUser)
      .then(result => {
        expect(result).to.eql({newUser: false});
        MongoClient.connect(mongoUrl, {
          promiseLibrary: Promise
        })
          .then((db) => {
            const collection = db.collection('users');
            collection.find({userId: blackWidowUser.userId})
              .toArray()
              .then(result => {
                expect(result.length).to.equal(1);
                expect(result[0]).to.eql(blackWidowUser);
              })
              .finally(() => {
                db.close();
                done();
              })
          })
      })
      .catch(error => {
        done(error)
      })
  });

  it('should be able to subscribe to a new channel', (done) => {
    const channelId = 'BatCave';
    slackMetaService.subscribeToChannel(channelId)
      .then(result => {
        MongoClient.connect(mongoUrl, {
          promiseLibrary: Promise
        })
          .then((db) => {
            const collection = db.collection('subscribed_channels');
            collection.find({channelId: channelId})
              .toArray()
              .then(result => {
                expect(result.length).to.equal(1);
                expect(result[0].channelId).to.equal(channelId);
              })
              .finally(() => {
                db.close();
                done();
              })
          })
      })
      .catch(error => done(error));
  });

  it('should be able to cancel subscription for a channel', (done) => {
    const channelId = 'BatCave';
    givenThatChannelWasSubscribedTo(channelId)
      .then(() => {
        slackMetaService.revokeChannelSubscription(channelId)
          .then(result => {
            MongoClient.connect(mongoUrl, {
              promiseLibrary: Promise
            })
              .then((db) => {
                const collection = db.collection('subscribed_channels');
                collection.find({channelId: channelId})
                  .toArray()
                  .then(result => {
                    expect(result.length).to.equal(0);
                  })
                  .finally(() => {
                    db.close();
                    done();
                  })
              })
          })
          .catch(error => done(error));
      });
  })

});