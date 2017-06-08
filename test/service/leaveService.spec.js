var chai = require("chai"),
  expect = chai.expect,
  assert = chai.assert,
  nock = require('nock'),
  moment = require('moment');

var LeaveService = require('../../src/service/leaveService');

describe('Leave Service', () => {

  const leaveApiRootUrl = 'http://alfred-manages-leaves/api';
  var leaveService = null;

  beforeEach(() => {
    leaveService = new LeaveService(leaveApiRootUrl);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  function givenThatEmployeeGetsRegistered(employeeId, firstName, lastName) {
    nock(leaveApiRootUrl)
      .post(`/employees`, {
        employeeId: employeeId,
        firstName: firstName,
        lastName: lastName
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

  function givenThatPastLeavesExist(employeeId, from, to){
    const leaves = getDatesBetween(from, to).map(date => {
      return {
        isHalfDay : false,
        date: date
      }
    });
    nock(leaveApiRootUrl)
      .get(`/employees/${employeeId}/leaves`)
      .reply(200, {
        leaves: leaves
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
    const firstName = 'Tony';
    const lastName = 'Stark';


    givenThatEmployeeGetsRegistered(employeeId, firstName, lastName);

    leaveService.registerEmployee(employeeId, firstName, lastName)
      .then(() => {
      })
      .catch(error => {
        console.log(error);
        assert.fail(error);
      })
      .finally(() => done())
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
        assert.fail()
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
        assert.fail()
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
        assert.fail()
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
        assert.fail()
      })
      .finally(() => done());
  });

  it('should be able to get all the applied leaves for given employee', (done) => {
    const employeeId = 'batman';
    const from = moment();
    const to = moment().add(3, 'days');

    givenThatPastLeavesExist(employeeId, from, to);

    leaveService.getAppliedLeaves(employeeId, from, to)
      .then((leaves) => {
        const actualDates = getDatesBetween(moment(), moment().add(3, 'days'))
          .map(date => {
            return {
              date: date,
              isHalfDay: false
            }
          });
        expect(leaves).to.eql(actualDates)
      })
      .catch(error => {
        console.log(error);
        assert.fail()
      })
      .finally(() => done());
  });
});

