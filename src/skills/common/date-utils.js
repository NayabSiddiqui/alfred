var moment = require('moment');

const DateUtils = function () {

  const extractDateForUnplannedLeave = function (inputString) {
    const pattern = /(leave on|day off on)[/\s]+(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/i;
    if (pattern.test(inputString)) {
      return extractDate(inputString.split('on')[1])
    }
    else {
      return null;
    }
  };

  const extractDatesForPlannedLeave = function (inputString) {
    const pattern = /(leave from|vacation from)[\s]+(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[\s]+(to)[\s]+(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/i;
    if (!pattern.test(inputString))
      return null;

    const dateStringTokens = inputString.split('from')[1].split('to');
    const from = extractDate(dateStringTokens[0]);
    const to = extractDate(dateStringTokens[1]);

    return {
      from: from.date,
      to: to.date
    }
  };

  const isWeekend = function (date) {
    return date.isoWeekday() == 6 || date.isoWeekday() == 7
  };

  const extractDate = function (dateString) {
    const datePattern = /(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/g;

    const monthAndDay = dateString.match(datePattern)[0];
    const currentYear = moment().year();

    const date = moment(`${monthAndDay}-${currentYear}`, ['MM-DD-YYYY']);
    return {
      date: date.startOf('day'),
      isWeekend: isWeekend(date)
    };
  };

  return {
    extractDateForUnplannedLeave: extractDateForUnplannedLeave,
    isWeekend: isWeekend,
    extractDatesForPlannedLeave: extractDatesForPlannedLeave
  };
};

module.exports = DateUtils;