import './Header.css';
import logo from './assets/logo.png'; // replace logo with actual logo later
import { Link } from 'react-router-dom';

function Header() {
    return (
      <header className="navbar">
        
          <a href="elaview.com">
            <img src={logo} className="logo" alt="Elaview Logo" />
          </a>
        
        <nav className="nav-links">
          {/* <a href="/" className="nav-button">Home</a> */}
          <Link to="/browse" className="nav-button">Browse Spaces</Link>
          <Link to="/list" className="nav-button">List Your Space</Link>
          <Link to="/signin" className="nav-button">Sign In</Link>
        </nav>
      </header>
    );
}

export default Header;