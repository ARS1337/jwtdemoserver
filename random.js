const random = () => {
  let temp = Math.floor(Math.random() * 10);
  if (temp >= 5) {
    return true;
  } else {
    return false;
  }
};

module.exports = { random };
