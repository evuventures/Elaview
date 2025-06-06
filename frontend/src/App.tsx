import './App.css';
import Header from './partials/Header';
import { Routes, Route, useLocation } from 'react-router-dom';
import ListSpace from './pages/ListPage';
import SignIn from './pages/SignInPage';
import SignUp from './pages/SignUpPage';
import Home from './pages/HomePage';
import Footer from './partials/Footer';
import ItemDetailPage from './pages/ItemDetailPage';
import TestPage from './pages/TestPage';
import BrowseSpace from './pages/BrowsePage';
import AuthTestPage from './pages/AuthTestPage';

function App() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === '/test' || location.pathname === '/auth-test';

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
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth-test" element={<AuthTestPage />} />
      </Routes>

      {!hideHeaderFooter && <Footer />}
    </>
  )
}

export default App