const moment = require('moment');

const MessageBuilder = function () {

  const buildSingleDayUsagePrompt = {
    text: "Oops! didn't quite get that. :confused:",
    attachments: [
      {
        text: "you can type `leave on mm-dd` or `taking the day off on mm-dd` to apply leave for a particular day",
        color: '#9999ff',
        mrkdwn_in: ['text']
      },
      {
        text: "type `help leaves` to know more about how to apply planned & unplanned leaves, notify when working remotely etc.",
        color: '#9999ff',
        mrkdwn_in: ['text']
      }
    ]
  };
  
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

  const buildDayIsWeekendPrompt = (displayDate) => {
    return {
      text: 'Oops !',
      attachments: [
        {
          title: `${displayDate} is a weekend, which is a weekly off for you. Please check the date and apply again.`
        }
      ]
    }
  };

  const buildUnplannedLeaveAppliedMessage = (date, isHalfDay) => {
    return {
      text: " :white_check_mark: Success!",
      attachments: [
        {
          text: `*${isHalfDay ? 'Half' : 'One'} day* leave applied for *${date}*`,
          color: '#36a64f',
          mrkdwn_in: ['text']
        },
        {
          text: "FYI: You can type `summary leaves` to view the summary of your leaves...",
          color: '#9999ff',
          mrkdwn_in: ['text']
        }
      ]
    }
  };

  const errorMessage = (reason) => {
    return {
      text: 'Oops! Failed to process your request. :confused:',
      attachments: [
        {
          text: `Reason:  \`${reason}\`.`,
          color: '#ff4c4c',
          mrkdwn_in: ['text']
        }
      ]
    }
  };

  return {
    buildLeaveSummary: buildLeaveSummary,
    buildSingleDayUsagePrompt: buildSingleDayUsagePrompt,
    buildDayIsWeekendPrompt: buildDayIsWeekendPrompt,
    buildUnplannedLeaveAppliedMessage: buildUnplannedLeaveAppliedMessage,
    buildErrorMessage: errorMessage
  }
};

module.exports = MessageBuilder;
