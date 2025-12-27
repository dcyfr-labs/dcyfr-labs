/**
 * React Hook - useLocalStorage
 * Demonstrates creating a custom hook for localStorage persistence
 */

export const reactHookTemplate = {
  id: "react-hook-localstorage",
  name: "React useLocalStorage Hook",
  description: "Custom hook for persistent state with localStorage",
  language: "jsx",
  files: {
    "src/hooks/useLocalStorage.js": `import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use provided initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}`,
    "src/App.jsx": `import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [name, setName] = useLocalStorage('userName', '');
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'sans-serif',
      backgroundColor: theme === 'light' ? '#fff' : '#333',
      color: theme === 'light' ? '#000' : '#fff',
      minHeight: '100vh',
    }}>
      <h1>useLocalStorage Hook Demo</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <label>
          Name (persisted): 
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          />
        </label>
        {name && <p>Welcome, {name}! 👋</p>}
      </div>

      <div>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            backgroundColor: theme === 'light' ? '#333' : '#fff',
            color: theme === 'light' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Toggle Theme ({theme})
        </button>
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
        Try refreshing the page! Your values will persist.
      </p>
    </div>
  );
}`,
    "src/main.jsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
    "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>useLocalStorage Hook</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  },
};
