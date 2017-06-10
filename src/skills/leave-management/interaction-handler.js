const InteractionHandler = function () {
  var handleResponse = function(response){
    switch (response) {
      case "yes-full-day":
        return 'Full day leave applied. :thumbsup: ';
      case "yes-half-day":
        return 'Half day leave applied. :thumbsup: ';
      case "no":
        return 'Roger that! Cancelled your last request. :thumbsup: ';
    }
  };

  return {
    handleResponse: handleResponse
  }
};

module.exports = InteractionHandler;