import './App.css';
import Header from './partials/Header';
import { Routes, Route, useLocation } from 'react-router-dom';
import ListSpace from './pages/ListSpacePage.js';
import SignIn from './pages/SignInPage';
import SignUp from './pages/SignUpPage';
import Home from './pages/HomePage';
import Footer from './partials/Footer';
import ItemDetailPage from './pages/ItemDetailPage';
import TestPage from './tests/TestPage';
import AuthTestPage from './tests/AuthTestPage';
import AccountQuestionsForm from './partials/AccountQuestionsForm.js';
import ProtectedRoute from './partials/ProtectedRoute.js';
import BrowseSpace from './pages/BrowsePage.js';
import ProfilePage from './pages/ProfilePage.js';
import MessagingPage from './pages/MessagingPage.js';


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
          // <ProtectedRoute>
          // <OnboardingGuard>
              <BrowseSpace />
          // </OnboardingGuard>
          // </ProtectedRoute> 
        } />
        
        <Route path="/list" element={
          // <ProtectedRoute>
          // <OnboardingGuard>
              <ListSpace />
          // </OnboardingGuard>
          // </ProtectedRoute> 
        } />
        
        <Route path="/detailsPage/:id" element={
          // <ProtectedRoute>
          // <OnboardingGuard>
              <ItemDetailPage />
           // </OnboardingGuard>
          // </ProtectedRoute> 
        } />

        <Route path="/messaging" element={
          // <ProtectedRoute> // (optional, if you want to restrict it)
            <MessagingPageWrapper />
          // </ProtectedRoute>
        } />

      </Routes>

      {!hideHeaderFooter && <Footer />}
    </>
  )
}

import { useEffect, useState } from 'react';
import { supabase } from './utils/SupabaseClient';
import { User } from '@supabase/supabase-js';


function MessagingPageWrapper() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  if (!user) return <p>Loading messaging...</p>;

  return <MessagingPage user={user} />;
}


export default App