import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', color: '#111827' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
              <img src={viteLogo} className="demo-logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
              <img src={reactLogo} className="demo-logo react" alt="React logo" />
            </a>
          </div>
          
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '2rem' }}>
            Mermaid Editor
          </h1>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
            maxWidth: '28rem', 
            margin: '0 auto' 
          }}>
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="btn-primary"
              style={{ marginBottom: '1rem' }}
            >
              count is {count}
            </button>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Edit <code style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>src/App.tsx</code> and save to test HMR
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              Tailwind CSS is configured and ready! 🎨
            </p>
          </div>
          
          <p style={{ color: '#9ca3af', marginTop: '2rem' }}>
            Click on the Vite and React logos to learn more
          </p>
        </div>
      </div>
    </div>
  )
}

export default App