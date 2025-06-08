/**
 * Debounce utility function to limit the rate at which a function can fire
 * Useful for preventing excessive API calls or updates during typing
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  };
}

/**
 * Creates a debounced version of an async function
 * Useful for API calls that need to be debounced
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let latestResolve: ((value: ReturnType<T>) => void) | null = null;
  let latestReject: ((reason?: unknown) => void) | null = null;

  return function debouncedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise<ReturnType<T>>((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      // Cancel previous promise if it hasn't resolved
      if (latestReject) {
        latestReject(new Error('Debounced call cancelled'));
      }

      latestResolve = resolve;
      latestReject = reject;

      timeout = setTimeout(async () => {
        try {
          const result = await func(...args);
          if (latestResolve === resolve) {
            resolve(result as ReturnType<T>);
          }
        } catch (error) {
          if (latestReject === reject) {
            reject(error);
          }
        } finally {
          timeout = null;
          latestResolve = null;
          latestReject = null;
        }
      }, wait);
    });
  };
}

/**
 * Throttle utility function to limit function calls to at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}