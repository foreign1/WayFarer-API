export default (list, capacity) => {
  const bookedSeatList = list.map(i => i.seat_number);
  const newList = [];
  for (let i = 1; i <= capacity; i += 1) {
    if (!bookedSeatList.includes(i)) {
      newList.push(i);
    }
  }
  return newList[Math.floor(Math.random() * newList.length)];
};
