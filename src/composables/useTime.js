export function useTime() {
  const convertTime = (createdTime, isFull = true) => {
    if (createdTime && typeof createdTime !== 'string') {
      let date = createdTime.toDate();
      let result = date.toDateString();
      if (!isFull) return `${result.split(' ')[1]} ${result.split(' ')[2]}`;
      return result;
    }
    return createdTime;
  };

  return { convertTime };
}
