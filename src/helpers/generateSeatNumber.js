module.exports = (list, capacity) => {
  const newList = [];

  for (let i = 1; i <= capacity; i += 1) {
    if (!list.includes(i)) {
      newList.push(i);
    }
  }
  return newList[Math.floor(Math.random() * newList.length)];
};
