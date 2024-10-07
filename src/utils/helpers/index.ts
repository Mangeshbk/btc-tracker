// Amount Wrapper
export const amountWrapper = (value: number) => {
  if (value % 1 === 0) {
    return value.toLocaleString();
  } else {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};
