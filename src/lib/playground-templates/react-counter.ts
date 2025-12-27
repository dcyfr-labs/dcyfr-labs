/**
 * React Counter Template
 * Simple interactive counter component demonstrating state management
 */

export const reactCounterTemplate = {
  id: "react-counter",
  name: "React Counter",
  description: "Interactive counter with increment/decrement buttons",
  language: "jsx",
  files: {
    "src/App.jsx": `import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Counter App</h1>
      <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>Count: {count}</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(count - 1)}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          Decrement
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
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
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Counter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  },
};
