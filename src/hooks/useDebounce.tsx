import { useEffect, useState } from "react";

function useDebounceCallback<T1, T2 extends (arg0: T1) => void>(
  value: T1,
  callback: T2,
  delay?: number
) {
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isFirst) {
        callback(value);
      } else {
        setIsFirst(false);
      }
    }, delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
}

export default useDebounceCallback;
