import './App.css';
import Header from './partials/Header';
import { Routes, Route} from 'react-router-dom';
import BrowseSpace from './pages/BrowsePage';
import ListSpace from './pages/ListPage';
import SignIn from './pages/SignInPage';
import Home from './pages/HomePage';
import Footer from './partials/Footer';
import ItemDetailPage from './ItemDetailPage';


function App() {



  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseSpace />} />
        <Route path="/list" element={<ListSpace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/detailsPage/:id" element={<ItemDetailPage />} />
      </Routes>

      {/* <Home /> */}



      <Footer />

    </>
  )
}

export default App
