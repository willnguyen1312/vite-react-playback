export const uniqueId = (
  (counter) =>
  (str = "") =>
    `${str}${++counter}`
)(0);

export const clamp = (num: number, lower: number, higher: number) =>
  higher ? Math.min(Math.max(num, lower), higher) : Math.min(num, lower);

export const callAll =
  (...fns: any[]) =>
  (...arg: any) => {
    fns.forEach((fn) => fn && fn(...arg));
  };
