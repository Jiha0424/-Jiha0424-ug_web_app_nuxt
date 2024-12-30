const isInvalid = (data) => {
  if (data === undefined || data === null || data === '') return true;
  else return false;
};

export const useInvalidate = () => {
  return { isInvalid };
};
