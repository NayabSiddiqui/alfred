var chai = require("chai"),
  expect = chai.expect,
  assert = chai.assert,
  moment = require('moment'),
  MessageBuilder = require('../../../src/skills/leave-management/message-builder');

describe('Leave: Message builder', () => {

  let messageBuilder = null;

  beforeEach(() => {
    messageBuilder = new MessageBuilder();
  });

  it('should respond when there is no existing record for leaves', () => {
    const summary = {
      "leaveApplications": [],
      "balance": "9.5"
    };

    const message = messageBuilder.buildLeaveSummary(summary);
    expect(message).to.eql([
      {
        title: 'No leaves applied yet.',
        color: '#4286f4',
        mrkdwn_in: ['text']
      },
      {
        text: 'Available balance : *9.5 days(s)*',
        color: '#fec611',
        mrkdwn_in: ['text']
      }]);
  });

  it('should construct leave summary from summary object', () => {
    const summary = {
      "leaveApplications": [
        {
          "id": "15c0d9d5-8b8b-4631-92bb-9b714f6e8efa",
          "days": [
            "2017-05-05T00:00:00Z",
            "2017-05-06T00:00:00Z"
          ],
          "halfDayLeaves": false
        },
        {
          "id": "5e909220-24a8-4cfc-b6bd-5fde059451fa",
          "days": [
            "2017-06-15T00:00:00Z"
          ],
          "halfDayLeaves": false
        },
        {
          "id": "044a89fd-862b-4733-8dc3-b4ed763e83b5",
          "days": [
            "2017-11-09T00:00:00Z"
          ],
          "halfDayLeaves": false
        },
        {
          "id": "6dfcfbfc-45c9-446a-98e6-91e0274c56bf",
          "days": [
            "2017-12-12T00:00:00Z"
          ],
          "halfDayLeaves": false
        },
        {
          "id": "0b379fc6-01b5-481f-aa1f-2d128b6ee1f4",
          "days": [
            "2017-06-14T00:00:00Z"
          ],
          "halfDayLeaves": true
        }
      ],
      "balance": "7.0"
    };

    const message = messageBuilder.buildLeaveSummary(summary);
    expect(message).to.eql([{
      title: 'Single Day Leave(s) applied on',
      text: '\nJune 15, 2017,\nNovember 9, 2017,\nDecember 12, 2017',
      color: '#4286f4',
      mrkdwn_in: ['text']
    },
      {
        title: 'Half Day Leave(s) applied on',
        text: '\nJune 14, 2017',
        color: '#d36331',
        mrkdwn_in: ['text']
      },
      {
        title: 'Your planned vacations',
        text: '\n*2 day(s)* of leave starting from May 5, 2017, ending on May 6, 2017',
        color: '#92c544',
        mrkdwn_in: ['text']
      },
      {
        text: 'Available balance : *7.0 days(s)*',
        color: '#fec611',
        mrkdwn_in: ['text']
      }]);
  });
});