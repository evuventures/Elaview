import './App.css';
import Header from './Header';
import { Routes, Route, Link } from 'react-router-dom';
import BrowseSpace from './BrowseSpace';
import ListSpace from './ListSpace';
import SignIn from './SignIn';
import Home from './Home';
import Footer from './Footer';
import billboardImage from '../public/images/billboard1.png';
import profile1 from '../public/images/profile1.png';
import profile2 from '../public/images/profile2.png';
import profile3 from '../public/images/profile3.png';
import profile4 from '../public/images/profile4.png';


function App() {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/browse" element={<BrowseSpace />} />
        <Route path="/list" element={<ListSpace />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
      {/* <Home /> */}

      <div className = "Home">
        <div className = "HomeLeftSection">
          <h1>Unlock Hidden Advertising Spaces</h1>
          <p>
          Connect landlords with prime advertising real estate to brands
          seeking impactful visibility in cities.
          </p>
          <div className="HomeButton">
            <Link to="/browse" className="NavButton">Find Your Ad Space</Link>
            <Link to="/list" className="NavButton">List Your Property</Link>
          </div>
          <div className = "Reviews">
            <div className = "Avatars">
              <img src={profile1} alt="Profile 1" />
              <img src={profile2} alt="Profile 2" />
              <img src={profile3} alt="Profile 3" />
              <img src={profile4} alt="Profile 4" />
            </div>
            <span>Trusted by <strong>500+</strong> property owners in NYC</span>
          </div>
        </div>
        
        
        <div className="HomeRightSection">
          <img src={billboardImage} alt="Billboard" className="Billboard1" />
          <div className="Card">
            <div className="CardInfo">
              <p className="CardTitle">SoHo Wall Space</p>
              <p className="CardSubtext">30 × 40 ft • High Traffic • $5,000/week</p>
            </div>
            <button className="DetailsButton">View Details</button>
          </div>
        </div>
      </div>

      <Footer />

    </>
  )
}

export default App
