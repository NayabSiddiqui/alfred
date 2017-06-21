var axios = require('axios'),
  Promise = require('bluebird');

const LeaveService = function (apiRootUrl) {

  const url = apiRootUrl;

  const registerEmployee = function (employeeId, email, givenName) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}/employees`, {
        id: employeeId,
        email: email,
        givenName: givenName
      })
        .then((data) => resolve(data))
        .catch(error => reject(error))
    });
  };

  const creditLeaves = function (employeeId, creditedLeaves) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}/employees/${employeeId}/leaves/balance`, {
        creditedLeaves: creditedLeaves
      })
        .then((response) => resolve(response.data.balance))
        .catch(error => reject(error))
    })
  };

  const getBalance = function (employeeId) {
    return new Promise((resolve, reject) => {
      axios.get(`${url}/employees/${employeeId}/leaves/balance`)
        .then((response) => resolve(response.data.balance))
        .catch(error => reject(error))
    })
  };

  const getLeaveSummary = function (employeeId) {
    return new Promise((resolve, reject) => {
      axios.get(`${url}/employees/${employeeId}/leaves`)
        .then((response) => resolve(response.data))
        .catch(error => reject(error.response || {data: 'Some error occured'}))
    });
  };

  const applyFullDayLeaves = function (employeeId, from, to) {
    return applyLeaves(employeeId, from, to, false);
  };

  const applyHalfDayLeaves = function (employeeId, from, to) {
    return applyLeaves(employeeId, from, to, true);
  };

  const applyLeaves = function (employeeId, from, to, isHalfDay) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}/employees/${employeeId}/leaves`, {
        from: from.format(),
        to: to.format(),
        isHalfDay: isHalfDay
      })
        .then((data) => resolve(data))
        .catch(error => {
          reject(error)
        })
    });
  };

  const getLeaveApplicationPreview = function (from, to) {
    return new Promise((resolve, reject) => {
      axios.post(`${url}/leaves/preview`, {
        from: from.format(),
        to: to.format()
      })
        .then((response) => resolve(response.data))
        .catch(error => {
          console.log(error);
          reject(error)
        })
    });
  };

  const cancelLeave = function(employeeId, applicationId) {
    return new Promise((resolve, reject) => {
      axios.delete(`${url}/employees/${employeeId}/leaves/${applicationId}`)
        .then(() => resolve())
        .catch(error => reject(error))
    });
  };

  return {
    registerEmployee: registerEmployee,
    creditLeaves: creditLeaves,
    getBalance: getBalance,
    applyFullDayLeaves: applyFullDayLeaves,
    applyHalfDayLeaves: applyHalfDayLeaves,
    getLeaveSummary: getLeaveSummary,
    getLeaveApplicationPreview: getLeaveApplicationPreview,
    cancelLeave: cancelLeave
  }

};

module.exports = LeaveService;