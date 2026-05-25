/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
export function shallowEqual<T extends Record<string, any>>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}

export function memoizeSelector<T, U>(selector: (data: T) => U): (data: T) => U {
  let lastData: T | undefined;
  let lastResult: U | undefined;

  return (data: T) => {
    if (lastData === data) {
      return lastResult as U;
    }
    
    const newResult = selector(data);
    
    if (lastResult !== undefined && typeof newResult === 'object' && newResult !== null) {
        if (Array.isArray(newResult) && Array.isArray(lastResult)) {
            let isSame = newResult.length === lastResult.length;
            if (isSame) {
                for (let i = 0; i < newResult.length; i++) {
                    if (newResult[i] !== lastResult[i]) {
                        isSame = false;
                        break;
                    }
                }
            }
            if (isSame) return lastResult;
        } else if (shallowEqual(newResult as any, lastResult as any)) {
            return lastResult;
        }
    }
    
    lastData = data;
    lastResult = newResult;
    return newResult;
  };
}
