module.exports = {
  castIntegers: function(requestParams, context, ee, next) {
    if (requestParams.json) {
      if (requestParams.json.customerId) requestParams.json.customerId = parseInt(requestParams.json.customerId, 10);
      if (requestParams.json.productVariantId) requestParams.json.productVariantId = parseInt(requestParams.json.productVariantId, 10);
      if (requestParams.json.items) {
        requestParams.json.items.forEach(item => {
          if (item.productId) item.productId = parseInt(item.productId, 10);
        });
      }
    }
    return next();
  }
};
