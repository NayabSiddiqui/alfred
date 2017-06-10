var moment = require('moment');

const DateUtils = function () {

  const extractDate = function (inputString) {
    const pattern = /(leave on|day off on)[/\s]+(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/i;
    if(pattern.test(inputString)){
      const datePattern = /(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/g;

      const monthAndDay = inputString.match(datePattern)[0];
      const currentYear = moment().year();

      const date = moment(`${monthAndDay}-${currentYear}`);
      return date.startOf('day');
    }
    else {
      return null;
    }
  };

  return {
    extractDate: extractDate
  };
};

module.exports = DateUtils;