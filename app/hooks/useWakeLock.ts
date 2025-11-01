import { useEffect, useRef } from 'react';

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Check if Wake Lock API is supported
    if (!navigator.wakeLock) {
      console.log('Wake Lock API not supported');
      return;
    }

    const requestWakeLock = async () => {
      try {
        if (!navigator.wakeLock) return;

        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired');

        // Listen for release events
        const handleRelease = () => {
          console.log('Wake Lock released');
          wakeLockRef.current = null;
        };

        wakeLockRef.current.addEventListener('release', handleRelease);
      } catch (err) {
        console.error('Failed to acquire Wake Lock:', err);
      }
    };

    // Request wake lock when component mounts
    requestWakeLock();

    // Handle page visibility changes
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Page is hidden, wake lock will be automatically released by browser
        return;
      } else {
        // Page is visible again, request wake lock if we don't have one
        if (!wakeLockRef.current || wakeLockRef.current.released) {
          await requestWakeLock();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current && !wakeLockRef.current.released) {
        wakeLockRef.current.release().catch(() => {
          // Ignore errors on cleanup
        });
      }
    };
  }, []);
}
