import React, { MutableRefObject } from "react";

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

type ReactRef<T> = React.Ref<T> | React.MutableRefObject<T>;

/**
 * Assigns a value to a ref function or object
 *
 * @param ref the ref to assign to
 * @param value the value
 */
export function assignRef<T>(ref: ReactRef<T> | undefined, value: T) {
  if (ref == null) return;

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  try {
    (ref as MutableRefObject<T>).current = value;
  } catch (error) {
    throw new Error(`Cannot assign value '${value}' to ref '${ref}'`);
  }
}

/**
 * Combine multiple React refs into a single ref function.
 *
 * @param refs refs to assign to value to
 */
export function useMergeRefs<T>(...refs: (ReactRef<T> | undefined)[]) {
  return React.useMemo(() => {
    if (refs.every((ref) => ref == null)) {
      return null;
    }
    return (node: T) => {
      refs.forEach((ref) => {
        if (ref) assignRef(ref, node);
      });
    };
    // It's safe to disable eslint rule here since we know surely refs already is an exhaustive dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
