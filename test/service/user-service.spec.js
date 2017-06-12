var chai = require("chai"),
  expect = chai.expect,
  assert = chai.assert,
  nock = require('nock'),
  MongoClient = require('mongodb').MongoClient,
  Promise = require('bluebird'),
  UserService = require('../../src/service/user-service');

describe('User Service', () => {

  let userService = null;
  const mongoUrl = 'mongodb://localhost:27017/alfred';
  const blackWidowUser = {
    userId: 'blackwidow',
    email: 'blackwidow@shield.com',
    givenName: 'Natasha Romanov'
  };

  before((done) => {
    userService = new UserService(mongoUrl);

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

  it('should register user if user is not registered', function (done) {
    const user = {
      userId: 'voodooChild',
      email: "diana@dc.com",
      givenName: "diana"
    };

    userService.registerUserIfNotPresent(user)
      .then((result) => {
        expect(result).to.eql({newUser: true})
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
        console.log("@@@@@@@@@@",error);
        done(error);
      })
  });

  it('should not register an already registered user', (done) => {
    userService.registerUserIfNotPresent(blackWidowUser)
      .then(result => {
        expect(result).to.eql({newUser: false})
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
});