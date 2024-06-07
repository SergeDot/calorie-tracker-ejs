export default (reqBody) => {
  const keys = Object.keys(reqBody);
  let result = {};
  result.amount = {};
  if (keys.includes('quantity')) {
    result.amount.quantity = reqBody.quantity;
  };
  if (keys.includes('unit')) {
    result.amount.unit = reqBody.unit;
  };
  keys.map(key => {
    if (key === 'quantity' || key === 'unit') {
      result.amount[key] = reqBody[key];
    } else {
    result[key] = reqBody[key];
    }
  })
  return result;
};
