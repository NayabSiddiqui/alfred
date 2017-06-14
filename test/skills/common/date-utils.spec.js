var chai = require("chai"),
  expect = chai.expect,
  assert = chai.assert,
  moment = require('moment'),
  DateUtils = require('../../../src/skills/common/date-utils');

describe('Date utils', () => {

  let utils = null;

  beforeEach(() => {
    utils = new DateUtils();
  });

  it('should be able to extract date from the likes of \'leave on mm-dd\'', () => {
    const inputString = 'leave on 08-23';
    const result = utils.extractDate(inputString);

    const currentYear = moment().year();
    const expectedDate = moment(`08-23-${currentYear}`, ['MM-DD-YYYY']);

    expect(result).to.eql({
      date: expectedDate,
      isWeekend: false
    });
  });

  it('should be able to extract and detect weekend from the likes of \'leave on mm-dd\'', () => {
    const inputString_Saturday = 'leave on 06-10';
    const inputString_Sunday = 'leave on 06-11';
    const result_saturday = utils.extractDate(inputString_Saturday);
    const result_sunday = utils.extractDate(inputString_Sunday);

    const currentYear = moment().year();
    const expectedDate_Saturday = moment(`06-10-${currentYear}`, ['MM-DD-YYYY']);
    const expectedDate_Sunday = moment(`06-11-${currentYear}`, ['MM-DD-YYYY']);

    expect(result_saturday).to.eql({
      date: expectedDate_Saturday,
      isWeekend: true
    });
    expect(result_sunday).to.eql({
      date: expectedDate_Sunday,
      isWeekend: true
    });
  });

  it('should return null for an invalid date construct', () => {
    const inputString = 'leave on 23-23';
    const date = utils.extractDate(inputString);

    expect(date).to.equal(null);
  });

  it('should return true if the given date is a weekend', () => {
    const saturdayDate = moment('06-10-2017', ['MM-DD-YYYY']);
    const sundayDate = moment('06-11-2017', ['MM-DD-YYYY']);

    expect(utils.isWeekend(saturdayDate)).to.equal(true);
    expect(utils.isWeekend(sundayDate)).to.equal(true);
  });

  it('should return false if the given date is not a weekend', () => {
    const weekdayDate = moment('06-09-2017', ['MM-DD-YYYY']);

    expect(utils.isWeekend(weekdayDate)).to.equal(false);
  });
});

