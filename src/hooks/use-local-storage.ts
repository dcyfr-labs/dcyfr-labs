"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook for persisting state to localStorage with SSR safety
 * 
 * Provides automatic synchronization between React state and localStorage,
 * with safe handling of server-side rendering and hydration.
 * 
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns [value, setValue, removeValue] - Tuple with current value, setter, and remover
 * 
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 * 
 * // Update value (syncs to localStorage)
 * setTheme('dark');
 * 
 * // Remove from localStorage
 * removeTheme();
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR safety: return initial value during server render
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from localStorage by key
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or return initialValue
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function for same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to localStorage (client-side only)
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Dispatch storage event for cross-tab synchronization
          window.dispatchEvent(
            new StorageEvent("storage", {
              key,
              newValue: JSON.stringify(valueToStore),
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        
        // Dispatch storage event
        window.dispatchEvent(
          new StorageEvent("storage", {
            key,
            newValue: null,
          })
        );
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for reading localStorage value without state management
 * 
 * Useful for one-time reads or non-reactive access to localStorage.
 * 
 * @param key - localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Current value from localStorage
 * 
 * @example
 * ```tsx
 * const savedTheme = useLocalStorageValue('theme', 'light');
 * ```
 */
export function useLocalStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}
