import './App.css';
import Header from './Header';
import { Routes, Route } from 'react-router-dom';
import BrowseSpace from './BrowseSpace';
import ListSpace from './ListSpace';
import SignIn from './SignIn';

function App() {
  
  return (
    <>
      <Header />
      <Routes>
        <Route path="/browse" element={<BrowseSpace />} />
        <Route path="/list" element={<ListSpace />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
      
      
    </>
  )
}

export default App
