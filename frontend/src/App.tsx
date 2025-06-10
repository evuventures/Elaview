import './App.css';
import Header from './partials/Header';
import { Routes, Route, useLocation } from 'react-router-dom';
import ListSpace from './pages/ListPage';
import SignIn from './pages/SignInPage';
import SignUp from './pages/SignUpPage';
import Home from './pages/HomePage';
import Footer from './partials/Footer';
import ItemDetailPage from './pages/ItemDetailPage';
import TestPage from './tests/TestPage';
import AuthTestPage from './tests/AuthTestPage';
import AccountQuestionsForm from './partials/AccountQuestionsForm.js';
import ProtectedRoute from './partials/ProtectedRoute.js';


function App() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === '/test' || location.pathname === '/auth-test';

  return (
    <>
      {!hideHeaderFooter && <Header />}
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/auth-test" element={<AuthTestPage />} />
        <Route path='/profile' element={<ProfilePage />} />

        
        {/* Account questions route - protected but doesn't require completed onboarding */}
        <Route path="/account-questions" element={
          <ProtectedRoute>
            <AccountQuestionsForm />
          </ProtectedRoute>
          
        } />
        
        {/* Protected routes that require completed onboarding */}
        <Route path="/browse" element={
              <BrowseSpace />
           
        } />
        
        <Route path="/list" element={
          
              <ListSpace />
           
        } />
        
        <Route path="/detailsPage/:id" element={
       
              <ItemDetailPage />
           
        } />

      </Routes>

      {!hideHeaderFooter && <Footer />}
    </>
  )
}

export default App