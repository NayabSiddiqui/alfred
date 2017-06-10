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
    const date = utils.extractDate(inputString);

    const currentYear = moment().year();
    const expectedDate = moment(`08-23-${currentYear}`).format("LL");

    expect(date.format("LL")).to.equal(expectedDate);
  });

  it('should return null for an invalid date construct', () => {
    const inputString = 'leave on 23-23';
    const date = utils.extractDate(inputString);

    expect(date).to.equal(null);
  })
});

