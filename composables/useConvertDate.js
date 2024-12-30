const { isInvalid } = useInvalidate();

const getYear = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric' });
};

const getMonth = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: '2-digit' });
};

const getDay = (date) => {
  return new Date(date).toLocaleDateString('en-US', { day: '2-digit' });
};

const gethour = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: false,
  });
};

const getMinute = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { minute: 'numeric' });
};

const getSecond = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { second: 'numeric' });
};

const getFullDate = (date) => {
  if (!isInvalid(date))
    return `${getYear(date)}-${getMonth(date)}-${getDay(date)}`;
  else return null;
};

const getFullDateTime = (date) => {
  if (!isInvalid(date))
    return `${getYear(date)}-${getMonth(date)}-${getDay(date)} ${gethour(
      date
    )}:${getMinute(date)}:${getSecond(date)}`;
  else return null;
};

const strToDate = (str) => {
  if (isInvalid(str)) return null;
  else {
    if (str.length !== 10) return null;
    else return new Date(str);
  }
};

export const useConvertDate = () => {
  return { getYear, getMonth, getDay, getFullDate, strToDate, getFullDateTime };
};
