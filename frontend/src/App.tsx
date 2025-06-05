import './App.css';
import Header from './partials/Header';
import { Routes, Route, useLocation } from 'react-router-dom';
import BrowseSpace from './pages/BrowsePage';
import ListSpace from './pages/ListPage';
import SignIn from './pages/SignInPage';
import Home from './pages/HomePage';
import Footer from './partials/Footer';
import ItemDetailPage from './pages/ItemDetailPage';
import TestPage from './pages/TestPage';

function App() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === '/test';

  return (
    <>
      {!hideHeaderFooter && <Header />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseSpace />} />
        <Route path="/list" element={<ListSpace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/detailsPage/:id" element={<ItemDetailPage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>

      {!hideHeaderFooter && <Footer />}
    </>
  )
}

export default App