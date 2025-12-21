import { useEffect, useRef } from 'react';

/**
 * Hook to track user inactivity and trigger a callback
 * @param {number} timeout - Timeout in milliseconds
 * @param {function} onTimeout - Callback to trigger on timeout
 */
const useInactivityTimeout = (timeout, onTimeout) => {
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(onTimeout, timeout);
  };

  useEffect(() => {
    const events = [
      'mousemove',
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Initialize timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeout, onTimeout]);

  return resetTimer;
};

export default useInactivityTimeout;
