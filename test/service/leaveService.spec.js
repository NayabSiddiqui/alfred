var chai = require("chai"),
  expect = chai.expect,
  assert = chai.assert,
  nock = require('nock'),
  moment = require('moment');

var LeaveService = require('../../src/service/leave-service');

describe('Leave Service', () => {

  const leaveApiRootUrl = 'http://alfred-manages-leaves/api';
  var leaveService = null;

  beforeEach(() => {
    leaveService = new LeaveService(leaveApiRootUrl);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  function givenThatEmployeeGetsRegistered(employeeId, email, givenName) {
    nock(leaveApiRootUrl)
      .post(`/employees`, {
        id: employeeId,
        email: email,
        givenName: givenName
      })
      .reply(200, {
        ok: true
      })
  }

  function givenThatLeavesGetCredited(employeeId, creditedLeaves) {
    nock(leaveApiRootUrl)
      .post(`/employees/${employeeId}/leaves/balance`, {
        creditedLeaves: creditedLeaves
      })
      .reply(200, {
        balance: 13.5
      })
  }

  function givenThatLeavesWereApplied(employeeId, from, to, isHalfDay = false) {
    nock(leaveApiRootUrl)
      .post(`/employees/${employeeId}/leaves`, {
        from: from.format(),
        to: to.format(),
        isHalfDay: isHalfDay
      })
      .reply(200, {
        balance: 13.5
      });
  }

  function givenThatPastLeavesExist(employeeId, from, to) {
    const leaveApplications = getDatesBetween(from, to).map((date, index) => {
      return {
        id: `application-${index + 1}`,
        days: [date]
      }
    });
    nock(leaveApiRootUrl)
      .get(`/employees/${employeeId}/leaves`)
      .reply(200, {
        leaveApplications: leaveApplications,
        balance: "12.5"
      })
  }


  function getDatesBetween(from, to) {
    const appliedLeaves = [];
    const numberOfDays = to.diff(from, 'days');

    for (let i = 0; i < numberOfDays; i++) {
      appliedLeaves.push(from.add(i, 'days').startOf('day').format());
    }

    return appliedLeaves;
  }

  function givenThatEmployeeHasLeaveBalance(employeeId, creditedLeaves) {
    nock(leaveApiRootUrl)
      .get(`/employees/${employeeId}/leaves/balance`)
      .reply(200, {
        balance: creditedLeaves
      })
  }

  it('should be able to register a new employee', (done) => {
    const employeeId = 'ironman';
    const email = 'ironman@marvel.com';
    const givenName = 'Tony Stark';


    givenThatEmployeeGetsRegistered(employeeId, email, givenName);

    leaveService.registerEmployee(employeeId, email, givenName)
      .then(() => {
        done()
      })
      .catch(error => {
        console.log(error);
        done(error);
      })
  });

  it('should be able to credit leaves to employees account', (done) => {
    const employeeId = 'ironman@marvel.com';
    const creditedLeaves = 11.5;

    givenThatLeavesGetCredited(employeeId, creditedLeaves);
    leaveService.creditLeaves(employeeId, creditedLeaves)
      .then((newBalance) => {
        expect(newBalance).to.equal(13.5)
      })
      .catch(error => {
        console.log(error);
        done(error);
      })
      .finally(() => done());
  });

  it('should be able to get leave balance for an employee', (done) => {
    const employeeId = 'ironman@marvel.com';
    const creditedLeaves = 11.5;

    givenThatEmployeeHasLeaveBalance(employeeId, creditedLeaves);
    leaveService.getBalance(employeeId)
      .then((newBalance) => {
        expect(newBalance).to.equal(11.5)
      })
      .catch(error => {
        console.log(error);
        done(error);
      })
      .finally(() => done());
  });

  it('should be able to apply full day leaves for employee', (done) => {
    const employeeId = 'batman';
    const from = moment();
    const to = from.add(3, 'days');

    givenThatLeavesWereApplied(employeeId, from, to);

    leaveService.applyFullDayLeaves(employeeId, from, to)
      .then(() => {
      })
      .catch(error => {
        console.log(error);
        done(error);
      })
      .finally(() => done());
  });

  it('should be able to apply half day leaves for employee', (done) => {
    const employeeId = 'batman';
    const from = moment();
    const to = moment().add(3, 'days');

    givenThatLeavesWereApplied(employeeId, from, to, true);

    leaveService.applyHalfDayLeaves(employeeId, from, to)
      .then(() => {
      })
      .catch(error => {
        console.log(error);
        done(error);
      })
      .finally(() => done());
  });

  it('should be able to get all the applied leaves for given employee', (done) => {
    const employeeId = 'batman';
    const from = moment();
    const to = moment().add(3, 'days');

    givenThatPastLeavesExist(employeeId, from, to);

    leaveService.getLeaveSummary(employeeId, from, to)
      .then((leaves) => {
        const result = {
          leaveApplications: getDatesBetween(moment(), moment().add(3, 'days'))
            .map((date, index) => {
              return {
                id: `application-${index + 1}`,
                days: [date]
              }
            }),
          balance: "12.5"
        };
        expect(leaves).to.eql(result);
        done();
      })
      .catch(error => {
        console.log(error);
        done(error);
      })
  });
});

