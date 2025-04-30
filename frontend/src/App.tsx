import { useState } from 'react';
import logo from './assets/logo.png'; // replace logo with actual logo later
import './App.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="elaview.com" target="_blank">
          <img src={logo} className="logo" alt="Elaview Logo" />
        </a>
      </div>
      <h1>Elaview</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
    </>
  )
}

export default App
