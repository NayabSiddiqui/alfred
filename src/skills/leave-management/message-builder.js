const moment = require('moment');

const MessageBuilder = function () {

  const buildLeaveSummary = function (summary) {
    const singleFullDayLeaves = summary.leaveApplications
      .filter(application => (application.days.length == 1) && (!application.halfDayLeaves));
    const halfDayLeaves = summary.leaveApplications
      .filter(application => application.halfDayLeaves);
    const others = summary.leaveApplications.filter(application => application.days.length > 1);

    const oneDayLeaveSummary = singleFullDayLeaves.length > 0
      ?
    {
      title: 'Single Day Leave(s) applied on',
      text: `${singleFullDayLeaves.map(application => {
        return `\n${moment(application.days[0]).format("LL")}`;
      })}`,
      color: '#4286f4',
      mrkdwn_in: ['text']
    }
      : {};

    const halfDayLeaveSummary = halfDayLeaves.length > 0
      ? {
      title: 'Half Day Leave(s) applied on',
      text: `${halfDayLeaves.map(application => {
        return `\n${moment(application.days[0]).format("LL")}`;
      })}`,
      color: '#d36331',
      mrkdwn_in: ['text']
    }
      : {};

    const plannedVacationSummary = others.length > 0
      ?
    {
      title: 'Your planned vacations',
      text: others.map(application => {
        let numberOfDaysOfLeave = application.days.length;
        let leaveFrom = moment(application.days[0]).format("LL");
        let leaveTill = moment(application.days[numberOfDaysOfLeave - 1]).format("LL");

        return `\n*${numberOfDaysOfLeave} day(s)* of leave starting from ${leaveFrom}, ending on ${leaveTill}`;
      }),
      color: '#92c544',
      mrkdwn_in: ['text']
    }
      : {};

    const balanceLeaves = {
      text: `Available balance : *${summary.balance} days(s)*`,
      color: '#fec611',
      mrkdwn_in: ['text']
    };

    return [oneDayLeaveSummary, halfDayLeaveSummary, plannedVacationSummary, balanceLeaves];
  };

  return {
    buildLeaveSummary: buildLeaveSummary
  }
};

module.exports = MessageBuilder;
