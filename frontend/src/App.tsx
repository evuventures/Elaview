import './App.css';
import Header from './Header';
import { Routes, Route } from 'react-router-dom';
import BrowseSpace from './BrowseSpace';
import ListSpace from './ListSpace';
import SignIn from './SignIn';
import Home from './Home';
import Footer from './Footer';
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
