import './Header.css';
import logo from './assets/logo.png'; // replace logo with actual logo later

function Header() {
    return (
      <header className="navbar">
        
          <a href="elaview.com" target="_blank">
            <img src={logo} className="logo" alt="Elaview Logo" />
          </a>
        
        <nav className="nav-links">
          {/* <a href="/" className="nav-button">Home</a> */}
          <a href="/browseSpace" className="nav-button">Browse Spaces</a>
          <a href="/listSpace" className="nav-button">List Your Space</a>
          <a href="/signIn" className="nav-button">Sign In</a>
        </nav>
      </header>
    );
}

export default Header;