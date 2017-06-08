module.exports = function (controller) {
  require('./leave-management/brain')(controller);
  require('./help/brain')(controller);
};